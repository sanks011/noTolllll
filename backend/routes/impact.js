const express = require('express');
const Joi = require('joi');
const { ObjectId } = require('mongodb');
const { getDB } = require('../config/database');
const logger = require('../config/logger');

const router = express.Router();

// Validation schema
const impactEventSchema = Joi.object({
  eventType: Joi.string().valid('pitch_sent', 'po_received', 'shipment_completed', 'market_entered').required(),
  buyerId: Joi.string().optional(),
  revenueAmount: Joi.number().min(0).optional(),
  quantityKg: Joi.number().min(0).optional(),
  pricePerKg: Joi.number().min(0).optional(),
  targetCountry: Joi.string().required(),
  productCategory: Joi.string().required(),
  eventDate: Joi.date().optional()
});

// @route   GET /api/impact/dashboard
// @desc    Get user's impact dashboard data
// @access  Private
router.get('/dashboard', async (req, res) => {
  try {
    const db = getDB();
    const userId = req.user._id;

    // Get user's impact events
    const impactEvents = await db.collection('impactLogs')
      .find({ userId: new ObjectId(userId) })
      .sort({ eventDate: -1 })
      .toArray();

    // Calculate metrics
    const totalRevenue = impactEvents
      .filter(event => event.revenueAmount)
      .reduce((sum, event) => sum + event.revenueAmount, 0);

    const ordersSecured = impactEvents
      .filter(event => event.eventType === 'po_received').length;

    const shipmentsCompleted = impactEvents
      .filter(event => event.eventType === 'shipment_completed').length;

    const uniqueMarkets = [...new Set(impactEvents.map(event => event.targetCountry))].length;

    // Revenue by month (last 12 months)
    const monthlyRevenue = [];
    for (let i = 11; i >= 0; i--) {
      const month = new Date();
      month.setMonth(month.getMonth() - i);
      const monthStart = new Date(month.getFullYear(), month.getMonth(), 1);
      const monthEnd = new Date(month.getFullYear(), month.getMonth() + 1, 0);

      const monthRevenue = impactEvents
        .filter(event => 
          event.revenueAmount &&
          event.eventDate >= monthStart && 
          event.eventDate <= monthEnd
        )
        .reduce((sum, event) => sum + event.revenueAmount, 0);

      monthlyRevenue.push({
        month: month.toLocaleDateString('en', { month: 'short' }),
        revenue: monthRevenue
      });
    }

    // Markets breakdown
    const marketBreakdown = {};
    impactEvents.forEach(event => {
      if (event.revenueAmount) {
        marketBreakdown[event.targetCountry] = (marketBreakdown[event.targetCountry] || 0) + event.revenueAmount;
      }
    });

    const topMarkets = Object.entries(marketBreakdown)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([country, revenue]) => ({ country, revenue }));

    // Recent achievements
    const recentAchievements = impactEvents
      .slice(0, 10)
      .map(event => ({
        id: event._id,
        type: event.eventType,
        description: getAchievementDescription(event),
        date: event.eventDate,
        impact: event.revenueAmount ? `₹${formatCurrency(event.revenueAmount)}` : null
      }));

    // Success stories data
    const successStories = [
      {
        id: '1',
        title: 'First Export to Japan',
        description: 'Successfully exported 500kg of frozen shrimp to Tokyo Fish Market Co.',
        revenue: 120000,
        date: new Date('2024-01-15'),
        country: 'Japan',
        image: '/seafood-export-success.jpg'
      },
      {
        id: '2',
        title: 'EU Market Entry',
        description: 'Secured HACCP certification and entered European market.',
        revenue: 250000,
        date: new Date('2024-02-20'),
        country: 'Netherlands',
        image: '/textile-export-japan.jpg'
      }
    ];

    const response = {
      metrics: {
        totalRevenue,
        ordersSecured,
        shipmentsCompleted,
        marketsEntered: uniqueMarkets,
        jobsRetained: req.user.jobsRetained || 0
      },
      charts: {
        monthlyRevenue,
        topMarkets
      },
      recentAchievements,
      successStories
    };

    res.json({
      success: true,
      data: response
    });

  } catch (error) {
    logger.error('Get impact dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   POST /api/impact/events
// @desc    Log a new impact event
// @access  Private
router.post('/events', async (req, res) => {
  try {
    // Validate input
    const { error, value } = impactEventSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    const db = getDB();
    const userId = req.user._id;

    const impactEvent = {
      userId: new ObjectId(userId),
      ...value,
      buyerId: value.buyerId ? new ObjectId(value.buyerId) : null,
      eventDate: value.eventDate ? new Date(value.eventDate) : new Date(),
      createdAt: new Date()
    };

    const result = await db.collection('impactLogs').insertOne(impactEvent);

    // Update user metrics if revenue event
    if (value.revenueAmount && value.eventType === 'po_received') {
      await db.collection('users').updateOne(
        { _id: new ObjectId(userId) },
        { 
          $inc: { 
            totalRevenue: value.revenueAmount,
            ordersSecured: 1
          },
          $set: { updatedAt: new Date() }
        }
      );
    }

    logger.info(`User ${userId} logged impact event: ${value.eventType}`);

    res.status(201).json({
      success: true,
      message: 'Impact event logged successfully',
      data: {
        id: result.insertedId,
        ...impactEvent
      }
    });

  } catch (error) {
    logger.error('Log impact event error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   GET /api/impact/events
// @desc    Get user's impact events with pagination
// @access  Private
router.get('/events', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      eventType = 'all',
      startDate,
      endDate 
    } = req.query;

    const db = getDB();
    const userId = req.user._id;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build filter
    let filter = { userId: new ObjectId(userId) };
    
    if (eventType !== 'all') {
      filter.eventType = eventType;
    }

    if (startDate || endDate) {
      filter.eventDate = {};
      if (startDate) filter.eventDate.$gte = new Date(startDate);
      if (endDate) filter.eventDate.$lte = new Date(endDate);
    }

    // Get events
    const events = await db.collection('impactLogs')
      .find(filter)
      .sort({ eventDate: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .toArray();

    // Get total count
    const totalCount = await db.collection('impactLogs').countDocuments(filter);

    const formattedEvents = events.map(event => ({
      id: event._id,
      eventType: event.eventType,
      description: getAchievementDescription(event),
      revenueAmount: event.revenueAmount,
      quantityKg: event.quantityKg,
      pricePerKg: event.pricePerKg,
      targetCountry: event.targetCountry,
      productCategory: event.productCategory,
      eventDate: event.eventDate,
      createdAt: event.createdAt
    }));

    const pagination = {
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalCount / parseInt(limit)),
      totalRecords: totalCount,
      hasNext: parseInt(page) < Math.ceil(totalCount / parseInt(limit)),
      hasPrev: parseInt(page) > 1
    };

    res.json({
      success: true,
      data: {
        events: formattedEvents
      },
      pagination
    });

  } catch (error) {
    logger.error('Get impact events error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Helper function to format currency
function formatCurrency(amount) {
  if (amount >= 10000000) {
    return `${(amount / 10000000).toFixed(1)}Cr`;
  } else if (amount >= 100000) {
    return `${(amount / 100000).toFixed(1)}L`;
  } else if (amount >= 1000) {
    return `${(amount / 1000).toFixed(1)}K`;
  }
  return amount.toString();
}

// Helper function to generate achievement descriptions
function getAchievementDescription(event) {
  switch (event.eventType) {
    case 'pitch_sent':
      return `Sent pitch to buyer in ${event.targetCountry}`;
    case 'po_received':
      return `Received purchase order for ${event.productCategory} from ${event.targetCountry}`;
    case 'shipment_completed':
      return `Completed shipment of ${event.quantityKg}kg ${event.productCategory} to ${event.targetCountry}`;
    case 'market_entered':
      return `Successfully entered ${event.targetCountry} market`;
    default:
      return `${event.eventType} event in ${event.targetCountry}`;
  }
}

module.exports = router;
