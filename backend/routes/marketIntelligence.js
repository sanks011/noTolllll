const express = require('express');
const Joi = require('joi');
const { getDB } = require('../config/database');
const logger = require('../config/logger');

const router = express.Router();

// Validation schema
const marketIntelligenceQuerySchema = Joi.object({
  hsCode: Joi.string().optional(),
  countries: Joi.string().optional(), // Comma-separated country names
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20)
});

// @route   GET /api/market-intelligence
// @desc    Get market intelligence data with filters
// @access  Private
router.get('/', async (req, res) => {
  try {
    // Validate query parameters
    const { error, value } = marketIntelligenceQuerySchema.validate(req.query);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    const { hsCode, countries, page, limit } = value;
    const db = getDB();

    // Build filter object
    let filter = {};
    if (hsCode) filter.hsCode = hsCode;
    if (countries) filter.country = { $in: countries.split(',') };

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get total count
    const totalCount = await db.collection('marketIntelligence').countDocuments(filter);

    // Get market data
    const marketData = await db.collection('marketIntelligence')
      .find(filter)
      .sort({ competitivenessScore: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    // Format data for frontend
    const tariffs = marketData.map(item => ({
      country: item.country,
      tariffRate: `${item.tariffRate}%`,
      importVolume: `${item.importVolume} MT`,
      avgPrice: `$${item.avgPricePerKg}/kg`,
      competitiveness: item.competitivenessScore,
      demandGrowth: `${item.demandGrowth}%`,
      lastUpdated: item.lastUpdated
    }));

    // Generate pricing trends (mock historical data for demo)
    const pricing = marketData.map(item => ({
      country: item.country,
      data: Array.from({ length: 12 }, (_, i) => ({
        month: new Date(2024, i, 1).toLocaleDateString('en', { month: 'short' }),
        price: (item.avgPricePerKg * (0.85 + Math.random() * 0.3)).toFixed(2)
      }))
    }));

    // Calculate summary statistics
    const avgTariff = marketData.length > 0 
      ? marketData.reduce((sum, item) => sum + item.tariffRate, 0) / marketData.length 
      : 0;

    const bestMarket = marketData.length > 0 
      ? marketData.reduce((best, current) => 
          current.competitivenessScore > best.competitivenessScore ? current : best
        )
      : null;

    const summary = {
      totalMarkets: totalCount,
      avgTariff: avgTariff.toFixed(1),
      bestMarket: bestMarket?.country || 'N/A',
      totalImportVolume: marketData.reduce((sum, item) => sum + item.importVolume, 0),
      highGrowthMarkets: marketData.filter(item => item.demandGrowth > 5).length
    };

    // Pagination info
    const pagination = {
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit),
      totalRecords: totalCount,
      hasNext: page < Math.ceil(totalCount / limit),
      hasPrev: page > 1
    };

    res.json({
      success: true,
      data: {
        tariffs,
        pricing,
        summary
      },
      pagination
    });

  } catch (error) {
    logger.error('Market intelligence error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   GET /api/market-intelligence/countries
// @desc    Get list of available countries
// @access  Private
router.get('/countries', async (req, res) => {
  try {
    const db = getDB();
    
    const countries = await db.collection('marketIntelligence')
      .distinct('country');

    res.json({
      success: true,
      data: countries.sort()
    });

  } catch (error) {
    logger.error('Countries list error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   GET /api/market-intelligence/hs-codes
// @desc    Get list of available HS codes
// @access  Private
router.get('/hs-codes', async (req, res) => {
  try {
    const db = getDB();
    
    const hsCodes = await db.collection('marketIntelligence')
      .distinct('hsCode');

    res.json({
      success: true,
      data: hsCodes.sort()
    });

  } catch (error) {
    logger.error('HS codes list error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   GET /api/market-intelligence/trends/:country
// @desc    Get detailed trends for a specific country
// @access  Private
router.get('/trends/:country', async (req, res) => {
  try {
    const { country } = req.params;
    const db = getDB();

    const marketData = await db.collection('marketIntelligence')
      .find({ country })
      .toArray();

    if (marketData.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No data found for this country'
      });
    }

    // Generate trend data (mock historical data)
    const trends = {
      tariffHistory: Array.from({ length: 24 }, (_, i) => ({
        month: new Date(2023, i, 1).toLocaleDateString('en', { month: 'short', year: 'numeric' }),
        rate: marketData[0].tariffRate * (0.8 + Math.random() * 0.4)
      })),
      volumeHistory: Array.from({ length: 24 }, (_, i) => ({
        month: new Date(2023, i, 1).toLocaleDateString('en', { month: 'short', year: 'numeric' }),
        volume: marketData[0].importVolume * (0.7 + Math.random() * 0.6)
      })),
      priceHistory: Array.from({ length: 24 }, (_, i) => ({
        month: new Date(2023, i, 1).toLocaleDateString('en', { month: 'short', year: 'numeric' }),
        price: marketData[0].avgPricePerKg * (0.85 + Math.random() * 0.3)
      }))
    };

    res.json({
      success: true,
      data: {
        country,
        currentData: marketData[0],
        trends
      }
    });

  } catch (error) {
    logger.error('Market trends error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;
