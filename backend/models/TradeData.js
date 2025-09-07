const { getDB } = require('../config/database');
const { ObjectId } = require('mongodb');

class TradeData {
  static async insertBulkData(tradeDataArray) {
    const db = getDB();
    const collection = db.collection('trade_data');
    
    // Add metadata to each record
    const dataWithMetadata = tradeDataArray.map(record => ({
      ...record,
      value: parseFloat(record.value) || 0, // Ensure value is numeric
      year: parseInt(record.year) || new Date().getFullYear(),
      uploadedAt: new Date(),
      isActive: true
    }));
    
    const result = await collection.insertMany(dataWithMetadata);
    return result;
  }

  static async getTradeDataByFilters(filters = {}) {
    const db = getDB();
    const collection = db.collection('trade_data');
    
    const query = { isActive: true };
    
    if (filters.sector) {
      // Map sectors to MTN categories
      const sectorMapping = {
        'Seafood': 'AG', // Agricultural products include seafood
        'Textile': 'NON_AG', // Textiles are non-agricultural
        'Both': null // Show both categories
      };
      
      if (sectorMapping[filters.sector] !== null) {
        query.product_code = sectorMapping[filters.sector];
      }
    }
    
    if (filters.partnerCountry) {
      query.partner_name = new RegExp(filters.partnerCountry, 'i');
    }
    
    if (filters.year) {
      query.year = filters.year;
    }
    
    if (filters.startYear && filters.endYear) {
      query.year = { $gte: filters.startYear, $lte: filters.endYear };
    }
    
    const results = await collection.find(query)
      .sort({ year: -1, value: -1 })
      .toArray();
      
    return results;
  }

  static async getTradeAnalytics(sector = null) {
    const db = getDB();
    const collection = db.collection('trade_data');
    
    const matchStage = { isActive: true };
    if (sector && sector !== 'Both') {
      const sectorMapping = {
        'Seafood': 'AG',
        'Textile': 'NON_AG'
      };
      matchStage.product_code = sectorMapping[sector];
    }
    
    const pipeline = [
      { $match: matchStage },
      {
        $group: {
          _id: {
            year: '$year',
            partner: '$partner_name',
            category: '$mtn_categories'
          },
          totalValue: { $sum: '$value' },
          recordCount: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: '$_id.year',
          partners: {
            $push: {
              partner: '$_id.partner',
              category: '$_id.category',
              value: '$totalValue'
            }
          },
          totalYearValue: { $sum: '$totalValue' }
        }
      },
      { $sort: { '_id': -1 } },
      { $limit: 10 } // Last 10 years
    ];
    
    const analytics = await collection.aggregate(pipeline).toArray();
    
    // Get top partners overall
    const topPartnersPipeline = [
      { $match: matchStage },
      {
        $group: {
          _id: '$partner_name',
          totalValue: { $sum: '$value' },
          avgValue: { $avg: '$value' },
          years: { $addToSet: '$year' }
        }
      },
      { $sort: { totalValue: -1 } },
      { $limit: 10 }
    ];
    
    const topPartners = await collection.aggregate(topPartnersPipeline).toArray();
    
    return {
      yearlyAnalytics: analytics,
      topPartners: topPartners
    };
  }

  static async clearAllData() {
    const db = getDB();
    const collection = db.collection('trade_data');
    return await collection.deleteMany({});
  }

  static async getDataSummary() {
    const db = getDB();
    const collection = db.collection('trade_data');
    
    const summary = await collection.aggregate([
      {
        $group: {
          _id: null,
          totalRecords: { $sum: 1 },
          latestYear: { $max: '$year' },
          oldestYear: { $min: '$year' },
          totalValue: { $sum: '$value' },
          uniquePartners: { $addToSet: '$partner_name' },
          categories: { $addToSet: '$mtn_categories' }
        }
      }
    ]).toArray();
    
    return summary[0] || {};
  }
}

module.exports = TradeData;
