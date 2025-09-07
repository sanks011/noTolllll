const axios = require('axios');
const logger = require('../config/logger');

class ComtradeService {
  constructor() {
    this.baseURL = 'https://comtradeapi.un.org/data/v1/get';
    this.cache = new Map();
    this.cacheTimeout = 3600000; // 1 hour cache
  }

  // Get cache key for the request
  getCacheKey(params) {
    return JSON.stringify(params);
  }

  // Check if cached data is still valid
  isCacheValid(cacheEntry) {
    return Date.now() - cacheEntry.timestamp < this.cacheTimeout;
  }

  // Generic method to fetch data from Comtrade API
  async fetchData(typeCode, freqCode, clCode, queryParams = {}) {
    const cacheKey = this.getCacheKey({ typeCode, freqCode, clCode, ...queryParams });
    
    // Check cache first
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (this.isCacheValid(cached)) {
        logger.info('Returning cached Comtrade data');
        return cached.data;
      }
    }

    try {
      const url = `${this.baseURL}/${typeCode}/${freqCode}/${clCode}`;
      const params = new URLSearchParams();
      
      // Add query parameters
      Object.entries(queryParams).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value);
        }
      });

      logger.info(`Fetching Comtrade data: ${url}?${params}`);
      
      const response = await axios.get(url, {
        params: queryParams,
        timeout: 30000,
        headers: {
          'User-Agent': 'TradeNavigator/1.0',
          'Accept': 'application/json'
        }
      });

      if (response.data && response.data.data) {
        // Cache the response
        this.cache.set(cacheKey, {
          data: response.data.data,
          timestamp: Date.now()
        });
        
        return response.data.data;
      } else {
        logger.warn('No data returned from Comtrade API');
        return [];
      }
    } catch (error) {
      logger.error('Comtrade API error:', error.message);
      throw new Error(`Failed to fetch trade data: ${error.message}`);
    }
  }

  // Get export data for a specific country and commodity
  async getExportData(reporterCode, cmdCode, partnerCode = null, period = null) {
    const queryParams = {
      reporterCode,
      cmdCode,
      flowCode: 'X', // X for exports
      includeDesc: true
    };

    if (partnerCode) queryParams.partnerCode = partnerCode;
    if (period) queryParams.period = period;

    return this.fetchData('C', 'A', 'HS', queryParams);
  }

  // Get import data to find potential buyers
  async getImportData(cmdCode, partnerCode = null, period = null) {
    const queryParams = {
      cmdCode,
      flowCode: 'M', // M for imports
      includeDesc: true
    };

    if (partnerCode) queryParams.partnerCode = partnerCode;
    if (period) queryParams.period = period;

    return this.fetchData('C', 'A', 'HS', queryParams);
  }

  // Get potential buyers for Indian exports
  async getPotentialBuyers(cmdCode, topN = 10) {
    try {
      // Get import data for the commodity (excluding India as reporter)
      const importData = await this.getImportData(cmdCode, null, '2023,2022,2021');
      
      if (!importData || importData.length === 0) {
        return [];
      }

      // Aggregate import values by country
      const buyerStats = {};
      
      importData.forEach(record => {
        if (record.reporterCode !== '356' && record.reporterISO !== 'IND') { // Exclude India
          const country = record.reporterDesc || record.reporterISO;
          const value = parseFloat(record.primaryValue) || 0;
          const qty = parseFloat(record.qty) || 0;
          const year = record.period;
          
          if (!buyerStats[country]) {
            buyerStats[country] = {
              country,
              countryCode: record.reporterCode,
              countryISO: record.reporterISO,
              totalImportValue: 0,
              records: 0,
              avgValue: 0,
              yearlyData: {},
              totalQuantity: 0,
              avgUnitPrice: 0,
              growthRate: 0,
              consistency: 0,
              marketRank: 0
            };
          }
          
          buyerStats[country].totalImportValue += value;
          buyerStats[country].totalQuantity += qty;
          buyerStats[country].records += 1;
          buyerStats[country].yearlyData[year] = (buyerStats[country].yearlyData[year] || 0) + value;
        }
      });

      // Calculate additional metrics and growth rates
      const buyers = Object.values(buyerStats)
        .map(buyer => {
          buyer.avgValue = buyer.totalImportValue / buyer.records;
          buyer.avgUnitPrice = buyer.totalQuantity > 0 ? buyer.totalImportValue / buyer.totalQuantity : 0;
          
          // Calculate growth rate
          const years = Object.keys(buyer.yearlyData).sort();
          if (years.length >= 2) {
            const latestYear = years[years.length - 1];
            const previousYear = years[years.length - 2];
            if (buyer.yearlyData[previousYear] > 0) {
              buyer.growthRate = ((buyer.yearlyData[latestYear] - buyer.yearlyData[previousYear]) / buyer.yearlyData[previousYear]) * 100;
            }
          }
          
          // Calculate consistency (number of years with imports)
          buyer.consistency = years.length;
          
          return buyer;
        })
        .sort((a, b) => b.totalImportValue - a.totalImportValue);

      // Assign market ranks
      buyers.forEach((buyer, index) => {
        buyer.marketRank = index + 1;
      });

      return buyers.slice(0, topN);
    } catch (error) {
      logger.error('Error getting potential buyers:', error);
      return [];
    }
  }

  // Get frequent buyers from India (countries that import most from India)
  async getFrequentBuyersFromIndia(cmdCode = null, topN = 15) {
    try {
      const queryParams = {
        reporterCode: '356', // India as exporter
        flowCode: 'X', // Exports
        includeDesc: true,
        period: '2023,2022,2021,2020'
      };

      if (cmdCode) queryParams.cmdCode = cmdCode;

      const exportData = await this.fetchData('C', 'A', 'HS', queryParams);
      
      if (!exportData || exportData.length === 0) {
        return [];
      }

      // Aggregate by partner country (buyers)
      const buyerStats = {};
      
      exportData.forEach(record => {
        const partner = record.partnerDesc || record.partnerISO;
        const value = parseFloat(record.primaryValue) || 0;
        const qty = parseFloat(record.qty) || 0;
        const year = record.period;
        
        if (partner && partner !== 'World' && partner !== 'Areas, nes') {
          if (!buyerStats[partner]) {
            buyerStats[partner] = {
              country: partner,
              countryCode: record.partnerCode,
              countryISO: record.partnerISO,
              totalPurchaseValue: 0,
              records: 0,
              yearlyData: {},
              totalQuantity: 0,
              avgUnitPrice: 0,
              growthRate: 0,
              consistency: 0,
              marketShare: 0,
              frequency: 0,
              trend: 'stable'
            };
          }
          
          buyerStats[partner].totalPurchaseValue += value;
          buyerStats[partner].totalQuantity += qty;
          buyerStats[partner].records += 1;
          buyerStats[partner].yearlyData[year] = (buyerStats[partner].yearlyData[year] || 0) + value;
        }
      });

      const totalExportValue = Object.values(buyerStats).reduce((sum, buyer) => sum + buyer.totalPurchaseValue, 0);

      // Calculate additional metrics
      const buyers = Object.values(buyerStats)
        .map(buyer => {
          buyer.avgUnitPrice = buyer.totalQuantity > 0 ? buyer.totalPurchaseValue / buyer.totalQuantity : 0;
          buyer.marketShare = totalExportValue > 0 ? (buyer.totalPurchaseValue / totalExportValue) * 100 : 0;
          
          // Calculate growth rate and trend
          const years = Object.keys(buyer.yearlyData).sort();
          buyer.consistency = years.length;
          buyer.frequency = buyer.records / years.length; // Average transactions per year
          
          if (years.length >= 2) {
            const latestYear = years[years.length - 1];
            const previousYear = years[years.length - 2];
            if (buyer.yearlyData[previousYear] > 0) {
              buyer.growthRate = ((buyer.yearlyData[latestYear] - buyer.yearlyData[previousYear]) / buyer.yearlyData[previousYear]) * 100;
              
              if (buyer.growthRate > 10) buyer.trend = 'growing';
              else if (buyer.growthRate < -10) buyer.trend = 'declining';
              else buyer.trend = 'stable';
            }
          }
          
          return buyer;
        })
        .sort((a, b) => b.totalPurchaseValue - a.totalPurchaseValue);

      return buyers.slice(0, topN);
    } catch (error) {
      logger.error('Error getting frequent buyers from India:', error);
      return [];
    }
  }

  // Get bilateral trade analysis between India and specific country
  async getBilateralTradeAnalysis(partnerCountryCode, cmdCode = null) {
    try {
      const [exports, imports] = await Promise.all([
        // India's exports to partner
        this.fetchData('C', 'A', 'HS', {
          reporterCode: '356',
          partnerCode: partnerCountryCode,
          flowCode: 'X',
          cmdCode,
          period: '2023,2022,2021,2020',
          includeDesc: true
        }),
        // India's imports from partner
        this.fetchData('C', 'A', 'HS', {
          reporterCode: '356',
          partnerCode: partnerCountryCode,
          flowCode: 'M',
          cmdCode,
          period: '2023,2022,2021,2020',
          includeDesc: true
        })
      ]);

      const analysis = {
        partnerCountry: '',
        totalExports: 0,
        totalImports: 0,
        tradeBalance: 0,
        exportGrowth: 0,
        importGrowth: 0,
        topExportCommodities: [],
        topImportCommodities: [],
        yearlyTrend: {}
      };

      // Process exports data
      if (exports && exports.length > 0) {
        analysis.partnerCountry = exports[0].partnerDesc;
        
        const exportsByYear = {};
        const exportsByCommodity = {};
        
        exports.forEach(record => {
          const value = parseFloat(record.primaryValue) || 0;
          const year = record.period;
          const commodity = record.cmdDesc || record.cmdCode;
          
          analysis.totalExports += value;
          exportsByYear[year] = (exportsByYear[year] || 0) + value;
          exportsByCommodity[commodity] = (exportsByCommodity[commodity] || 0) + value;
        });

        analysis.topExportCommodities = Object.entries(exportsByCommodity)
          .map(([commodity, value]) => ({ commodity, value }))
          .sort((a, b) => b.value - a.value)
          .slice(0, 5);

        // Calculate export growth
        const exportYears = Object.keys(exportsByYear).sort();
        if (exportYears.length >= 2) {
          const latest = exportsByYear[exportYears[exportYears.length - 1]];
          const previous = exportsByYear[exportYears[exportYears.length - 2]];
          analysis.exportGrowth = previous > 0 ? ((latest - previous) / previous) * 100 : 0;
        }
      }

      // Process imports data
      if (imports && imports.length > 0) {
        const importsByYear = {};
        const importsByCommodity = {};
        
        imports.forEach(record => {
          const value = parseFloat(record.primaryValue) || 0;
          const year = record.period;
          const commodity = record.cmdDesc || record.cmdCode;
          
          analysis.totalImports += value;
          importsByYear[year] = (importsByYear[year] || 0) + value;
          importsByCommodity[commodity] = (importsByCommodity[commodity] || 0) + value;
        });

        analysis.topImportCommodities = Object.entries(importsByCommodity)
          .map(([commodity, value]) => ({ commodity, value }))
          .sort((a, b) => b.value - a.value)
          .slice(0, 5);

        // Calculate import growth
        const importYears = Object.keys(importsByYear).sort();
        if (importYears.length >= 2) {
          const latest = importsByYear[importYears[importYears.length - 1]];
          const previous = importsByYear[importYears[importYears.length - 2]];
          analysis.importGrowth = previous > 0 ? ((latest - previous) / previous) * 100 : 0;
        }
      }

      analysis.tradeBalance = analysis.totalExports - analysis.totalImports;

      return analysis;
    } catch (error) {
      logger.error('Error getting bilateral trade analysis:', error);
      return null;
    }
  }

  // Get India's export performance for specific commodities
  async getIndiaExportPerformance(cmdCodes) {
    try {
      const exportData = await this.getExportData('356', cmdCodes.join(','), null, '2023,2022,2021');
      
      if (!exportData || exportData.length === 0) {
        return [];
      }

      // Group by commodity and calculate trends
      const commodityStats = {};
      
      exportData.forEach(record => {
        const cmdCode = record.cmdCode;
        const year = record.period;
        const value = parseFloat(record.primaryValue) || 0;
        
        if (!commodityStats[cmdCode]) {
          commodityStats[cmdCode] = {
            cmdCode,
            cmdDesc: record.cmdDesc,
            yearlyData: {},
            totalValue: 0,
            trend: 'stable'
          };
        }
        
        commodityStats[cmdCode].yearlyData[year] = value;
        commodityStats[cmdCode].totalValue += value;
      });

      // Calculate trends
      Object.values(commodityStats).forEach(commodity => {
        const years = Object.keys(commodity.yearlyData).sort();
        if (years.length >= 2) {
          const latestYear = years[years.length - 1];
          const previousYear = years[years.length - 2];
          const growth = ((commodity.yearlyData[latestYear] - commodity.yearlyData[previousYear]) / commodity.yearlyData[previousYear]) * 100;
          
          if (growth > 10) commodity.trend = 'growing';
          else if (growth < -10) commodity.trend = 'declining';
          else commodity.trend = 'stable';
          
          commodity.growthRate = growth;
        }
      });

      return Object.values(commodityStats);
    } catch (error) {
      logger.error('Error getting India export performance:', error);
      return [];
    }
  }

  // Get top trading partners for India
  async getTopTradingPartners(cmdCode = null) {
    try {
      const queryParams = {
        reporterCode: '356', // India
        flowCode: 'X',
        includeDesc: true,
        period: '2023,2022'
      };

      if (cmdCode) queryParams.cmdCode = cmdCode;

      const exportData = await this.fetchData('C', 'A', 'HS', queryParams);
      
      if (!exportData || exportData.length === 0) {
        return [];
      }

      // Aggregate by partner country
      const partnerStats = {};
      
      exportData.forEach(record => {
        const partner = record.partnerDesc || record.partnerISO;
        const value = parseFloat(record.primaryValue) || 0;
        
        if (partner && partner !== 'World') {
          if (!partnerStats[partner]) {
            partnerStats[partner] = {
              country: partner,
              countryCode: record.partnerCode,
              countryISO: record.partnerISO,
              totalExportValue: 0,
              records: 0
            };
          }
          
          partnerStats[partner].totalExportValue += value;
          partnerStats[partner].records += 1;
        }
      });

      return Object.values(partnerStats)
        .sort((a, b) => b.totalExportValue - a.totalExportValue)
        .slice(0, 15);
    } catch (error) {
      logger.error('Error getting trading partners:', error);
      return [];
    }
  }

  // Get market opportunities by analyzing import trends
  async getMarketOpportunities(sector) {
    try {
      // Define commodity codes by sector
      const sectorCommodities = {
        textiles: ['52', '53', '54', '55', '56', '57', '58', '59', '60', '61', '62', '63'],
        agriculture: ['07', '08', '09', '10', '11', '12', '13', '14', '15'],
        seafood: ['03', '16'],
        chemicals: ['28', '29', '30', '31', '32', '33', '34', '35', '36', '37', '38'],
        machinery: ['84', '85'],
        automotive: ['87'],
        leather: ['41', '42', '43', '64'],
        gems: ['71'],
        pharmaceuticals: ['30']
      };

      const commodities = sectorCommodities[sector] || [];
      if (commodities.length === 0) {
        return [];
      }

      const opportunities = [];
      
      // Get data for each commodity
      for (const cmdCode of commodities.slice(0, 5)) { // Limit to 5 to avoid rate limits
        try {
          const buyers = await this.getPotentialBuyers(cmdCode, 5);
          const exportPerf = await this.getIndiaExportPerformance([cmdCode]);
          
          if (buyers.length > 0 && exportPerf.length > 0) {
            opportunities.push({
              commodity: exportPerf[0],
              topBuyers: buyers,
              marketSize: buyers.reduce((sum, buyer) => sum + buyer.totalImportValue, 0)
            });
          }
        } catch (error) {
          logger.warn(`Error fetching data for commodity ${cmdCode}:`, error.message);
        }
      }

      return opportunities.sort((a, b) => b.marketSize - a.marketSize);
    } catch (error) {
      logger.error('Error getting market opportunities:', error);
      return [];
    }
  }

  // Clear cache
  clearCache() {
    this.cache.clear();
    logger.info('Comtrade cache cleared');
  }
}

module.exports = new ComtradeService();
