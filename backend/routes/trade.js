const express = require('express');
const comtradeService = require('../services/comtradeService');
const logger = require('../config/logger');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Apply authentication middleware
router.use(authMiddleware);

// @route   GET /api/trade/potential-buyers/:cmdCode
// @desc    Get potential buyers for a specific commodity
// @access  Private
router.get('/potential-buyers/:cmdCode', async (req, res) => {
  try {
    const { cmdCode } = req.params;
    const { limit = 10 } = req.query;

    const buyers = await comtradeService.getPotentialBuyers(cmdCode, parseInt(limit));

    res.json({
      success: true,
      data: {
        commodity: cmdCode,
        buyers: buyers.map(buyer => ({
          country: buyer.country,
          countryCode: buyer.countryCode,
          countryISO: buyer.countryISO,
          importValue: buyer.totalImportValue,
          marketPotential: buyer.totalImportValue > 1000000 ? 'High' : 
                          buyer.totalImportValue > 100000 ? 'Medium' : 'Low',
          records: buyer.records,
          growthRate: buyer.growthRate || 0,
          consistency: buyer.consistency || 0,
          marketRank: buyer.marketRank || 0,
          avgUnitPrice: buyer.avgUnitPrice || 0,
          yearlyData: buyer.yearlyData || {}
        }))
      }
    });
  } catch (error) {
    logger.error('Get potential buyers error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch potential buyers'
    });
  }
});

// @route   GET /api/trade/frequent-buyers-from-india
// @desc    Get frequent buyers from India
// @access  Private
router.get('/frequent-buyers-from-india', async (req, res) => {
  try {
    const { cmdCode, limit = 15 } = req.query;

    const buyers = await comtradeService.getFrequentBuyersFromIndia(cmdCode, parseInt(limit));

    res.json({
      success: true,
      data: {
        commodity: cmdCode || 'all',
        buyers: buyers.map(buyer => ({
          country: buyer.country,
          countryCode: buyer.countryCode,
          countryISO: buyer.countryISO,
          purchaseValue: buyer.totalPurchaseValue,
          marketShare: buyer.marketShare,
          frequency: buyer.frequency,
          records: buyer.records,
          growthRate: buyer.growthRate,
          trend: buyer.trend,
          consistency: buyer.consistency,
          avgUnitPrice: buyer.avgUnitPrice,
          yearlyData: buyer.yearlyData,
          reliability: buyer.consistency >= 3 ? 'High' : buyer.consistency >= 2 ? 'Medium' : 'Low'
        }))
      }
    });
  } catch (error) {
    logger.error('Get frequent buyers from India error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch frequent buyers from India'
    });
  }
});

// @route   GET /api/trade/bilateral-analysis/:countryCode
// @desc    Get bilateral trade analysis between India and specific country
// @access  Private
router.get('/bilateral-analysis/:countryCode', async (req, res) => {
  try {
    const { countryCode } = req.params;
    const { cmdCode } = req.query;

    const analysis = await comtradeService.getBilateralTradeAnalysis(countryCode, cmdCode);

    if (!analysis) {
      return res.status(404).json({
        success: false,
        message: 'No trade data found for this country'
      });
    }

    res.json({
      success: true,
      data: analysis
    });
  } catch (error) {
    logger.error('Get bilateral analysis error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch bilateral trade analysis'
    });
  }
});

// @route   GET /api/trade/export-performance
// @desc    Get India's export performance for user's sector
// @access  Private
router.get('/export-performance', async (req, res) => {
  try {
    const userSector = req.user.sector?.toLowerCase() || 'textiles';
    const { cmdCodes } = req.query;

    let commodities = [];
    if (cmdCodes) {
      commodities = cmdCodes.split(',');
    } else {
      // Default commodities based on sector
      const sectorDefaults = {
        textiles: ['52', '61', '62'],
        agriculture: ['07', '08', '09'],
        seafood: ['03'],
        chemicals: ['29'],
        machinery: ['84'],
        automotive: ['87']
      };
      commodities = sectorDefaults[userSector] || ['52', '61', '62'];
    }

    const performance = await comtradeService.getIndiaExportPerformance(commodities);

    res.json({
      success: true,
      data: {
        sector: userSector,
        commodities: performance.map(commodity => ({
          code: commodity.cmdCode,
          description: commodity.cmdDesc,
          totalValue: commodity.totalValue,
          trend: commodity.trend,
          growthRate: commodity.growthRate || 0,
          yearlyData: commodity.yearlyData
        }))
      }
    });
  } catch (error) {
    logger.error('Get export performance error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch export performance'
    });
  }
});

// @route   GET /api/trade/trading-partners
// @desc    Get top trading partners for India
// @access  Private
router.get('/trading-partners', async (req, res) => {
  try {
    const { cmdCode, limit = 10 } = req.query;

    const partners = await comtradeService.getTopTradingPartners(cmdCode);

    res.json({
      success: true,
      data: {
        partners: partners.slice(0, parseInt(limit)).map(partner => ({
          country: partner.country,
          countryCode: partner.countryCode,
          exportValue: partner.totalExportValue,
          marketShare: partner.totalExportValue, // You could calculate percentage if needed
          records: partner.records
        }))
      }
    });
  } catch (error) {
    logger.error('Get trading partners error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch trading partners'
    });
  }
});

// @route   GET /api/trade/market-opportunities
// @desc    Get market opportunities for user's sector
// @access  Private
router.get('/market-opportunities', async (req, res) => {
  try {
    const userSector = req.user.sector?.toLowerCase() || 'textiles';
    const { sector } = req.query;

    const targetSector = sector || userSector;
    const opportunities = await comtradeService.getMarketOpportunities(targetSector);

    res.json({
      success: true,
      data: {
        sector: targetSector,
        opportunities: opportunities.map(opp => ({
          commodity: {
            code: opp.commodity.cmdCode,
            description: opp.commodity.cmdDesc,
            trend: opp.commodity.trend,
            growthRate: opp.commodity.growthRate || 0
          },
          marketSize: opp.marketSize,
          topBuyers: opp.topBuyers.slice(0, 5).map(buyer => ({
            country: buyer.country,
            importValue: buyer.totalImportValue,
            potential: buyer.totalImportValue > 1000000 ? 'High' : 
                      buyer.totalImportValue > 100000 ? 'Medium' : 'Low'
          }))
        }))
      }
    });
  } catch (error) {
    logger.error('Get market opportunities error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch market opportunities'
    });
  }
});

// @route   GET /api/trade/commodity-trends/:cmdCode
// @desc    Get detailed commodity trends and analysis
// @access  Private
router.get('/commodity-trends/:cmdCode', async (req, res) => {
  try {
    const { cmdCode } = req.params;
    const { years = '2023,2022,2021' } = req.query;

    // Get both export and import data
    const [exportData, buyers] = await Promise.all([
      comtradeService.getIndiaExportPerformance([cmdCode]),
      comtradeService.getPotentialBuyers(cmdCode, 15)
    ]);

    if (exportData.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No data found for this commodity'
      });
    }

    const commodity = exportData[0];
    
    res.json({
      success: true,
      data: {
        commodity: {
          code: commodity.cmdCode,
          description: commodity.cmdDesc,
          totalValue: commodity.totalValue,
          trend: commodity.trend,
          growthRate: commodity.growthRate || 0,
          yearlyData: commodity.yearlyData
        },
        marketAnalysis: {
          totalPotentialMarket: buyers.reduce((sum, buyer) => sum + buyer.totalImportValue, 0),
          numberOfMarkets: buyers.length,
          averageMarketSize: buyers.length > 0 ? 
            buyers.reduce((sum, buyer) => sum + buyer.totalImportValue, 0) / buyers.length : 0
        },
        topMarkets: buyers.slice(0, 10).map(buyer => ({
          country: buyer.country,
          countryCode: buyer.countryCode,
          importValue: buyer.totalImportValue,
          marketPotential: buyer.totalImportValue > 1000000 ? 'High' : 
                          buyer.totalImportValue > 100000 ? 'Medium' : 'Low',
          competitiveness: commodity.totalValue > 0 ? 
            Math.min((commodity.totalValue / buyer.totalImportValue) * 100, 100) : 0
        }))
      }
    });
  } catch (error) {
    logger.error('Get commodity trends error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch commodity trends'
    });
  }
});

// @route   POST /api/trade/clear-cache
// @desc    Clear the Comtrade cache (admin only)
// @access  Private
router.post('/clear-cache', async (req, res) => {
  try {
    comtradeService.clearCache();
    
    res.json({
      success: true,
      message: 'Cache cleared successfully'
    });
  } catch (error) {
    logger.error('Clear cache error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear cache'
    });
  }
});

module.exports = router;
