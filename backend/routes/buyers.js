const express = require('express');
const Joi = require('joi');
const { ObjectId } = require('mongodb');
const { getDB } = require('../config/database');
const logger = require('../config/logger');

const router = express.Router();

// Validation schemas
const buyersQuerySchema = Joi.object({
  country: Joi.string().optional(),
  productCategory: Joi.string().optional(),
  certification: Joi.string().optional(),
  search: Joi.string().optional(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  sortBy: Joi.string().valid('name', 'country', 'importVolume', 'rating').default('name'),
  sortOrder: Joi.string().valid('asc', 'desc').default('asc')
});

const buyerInteractionSchema = Joi.object({
  buyerId: Joi.string().required(),
  status: Joi.string().valid('Not Contacted', 'Contacted', 'Replied', 'Negotiating', 'Deal Closed').required(),
  notes: Joi.string().optional(),
  dealValue: Joi.number().optional()
});

// @route   GET /api/buyers
// @desc    Get buyers list with filters and pagination
// @access  Private
router.get('/', async (req, res) => {
  try {
    // Validate query parameters
    const { error, value } = buyersQuerySchema.validate(req.query);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    const { country, productCategory, certification, search, page, limit, sortBy, sortOrder } = value;
    const db = getDB();

    // Build filter object
    let filter = { isVerified: true };
    
    if (country && country !== 'All Countries') {
      filter.country = country;
    }
    
    if (productCategory && productCategory !== 'All Products') {
      filter.productCategories = { $in: [productCategory] };
    }
    
    if (certification && certification !== 'All Certifications') {
      filter.certificationsRequired = { $in: [certification] };
    }
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { country: { $regex: search, $options: 'i' } },
        { productCategories: { $elemMatch: { $regex: search, $options: 'i' } } }
      ];
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Get total count
    const totalCount = await db.collection('buyers').countDocuments(filter);

    // Get buyers
    const buyers = await db.collection('buyers')
      .find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .toArray();

    // Get user's interactions with these buyers
    const buyerIds = buyers.map(buyer => buyer._id);
    const interactions = await db.collection('userBuyerInteractions')
      .find({ 
        userId: new ObjectId(req.user._id),
        buyerId: { $in: buyerIds }
      })
      .toArray();

    // Create interaction map for quick lookup
    const interactionMap = {};
    interactions.forEach(interaction => {
      interactionMap[interaction.buyerId.toString()] = interaction;
    });

    // Format buyers data with interaction status
    const formattedBuyers = buyers.map(buyer => {
      const interaction = interactionMap[buyer._id.toString()];
      return {
        id: buyer._id,
        name: buyer.name,
        country: buyer.country,
        city: buyer.city || buyer.country, // Default to country if city not available
        productCategories: buyer.productCategories,
        importVolume: buyer.importVolume ? `${buyer.importVolume} MT/year` : 'Not specified',
        contactEmail: buyer.contactEmail,
        contactPhone: buyer.contactPhone,
        certifications: buyer.certificationsRequired || [],
        rating: buyer.rating || (Math.random() * 1.5 + 3.5).toFixed(1), // Mock rating if not available
        contactStatus: interaction?.status || 'Not Contacted',
        description: buyer.description || `Leading importer in ${buyer.country} specializing in ${buyer.productCategories.join(', ')}.`,
        requirements: buyer.requirements || 'Standard quality certifications required.',
        saved: false, // This would be tracked in a separate user preferences collection
        lastContactAt: interaction?.lastContactAt,
        dealValue: interaction?.dealValue,
        notes: interaction?.notes
      };
    });

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
        buyers: formattedBuyers
      },
      pagination
    });

  } catch (error) {
    logger.error('Buyers list error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   GET /api/buyers/:id
// @desc    Get buyer details by ID
// @access  Private
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const db = getDB();

    // Validate ObjectId
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid buyer ID'
      });
    }

    const buyer = await db.collection('buyers').findOne({ _id: new ObjectId(id) });

    if (!buyer) {
      return res.status(404).json({
        success: false,
        message: 'Buyer not found'
      });
    }

    // Get user's interaction with this buyer
    const interaction = await db.collection('userBuyerInteractions')
      .findOne({ 
        userId: new ObjectId(req.user._id),
        buyerId: new ObjectId(id)
      });

    const formattedBuyer = {
      id: buyer._id,
      name: buyer.name,
      country: buyer.country,
      city: buyer.city || buyer.country,
      productCategories: buyer.productCategories,
      importVolume: buyer.importVolume,
      contactEmail: buyer.contactEmail,
      contactPhone: buyer.contactPhone,
      certifications: buyer.certificationsRequired || [],
      rating: buyer.rating || (Math.random() * 1.5 + 3.5).toFixed(1),
      contactStatus: interaction?.status || 'Not Contacted',
      description: buyer.description,
      requirements: buyer.requirements,
      preferredIncoterms: buyer.preferredIncoterms || [],
      paymentTerms: buyer.paymentTerms,
      lastContactAt: interaction?.lastContactAt,
      dealValue: interaction?.dealValue,
      notes: interaction?.notes
    };

    res.json({
      success: true,
      data: formattedBuyer
    });

  } catch (error) {
    logger.error('Buyer details error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   POST /api/buyers/:id/contact
// @desc    Update contact status with a buyer
// @access  Private
router.post('/:id/contact', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate ObjectId
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid buyer ID'
      });
    }

    // Validate input
    const { error, value } = buyerInteractionSchema.validate({ ...req.body, buyerId: id });
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    const { status, notes, dealValue } = value;
    const db = getDB();

    // Check if buyer exists
    const buyer = await db.collection('buyers').findOne({ _id: new ObjectId(id) });
    if (!buyer) {
      return res.status(404).json({
        success: false,
        message: 'Buyer not found'
      });
    }

    // Upsert interaction record
    const interactionData = {
      userId: new ObjectId(req.user._id),
      buyerId: new ObjectId(id),
      status,
      lastContactAt: new Date(),
      notes: notes || '',
      updatedAt: new Date()
    };

    if (dealValue && status === 'Deal Closed') {
      interactionData.dealValue = dealValue;
    }

    const result = await db.collection('userBuyerInteractions').updateOne(
      {
        userId: new ObjectId(req.user._id),
        buyerId: new ObjectId(id)
      },
      {
        $set: interactionData,
        $setOnInsert: { createdAt: new Date() }
      },
      { upsert: true }
    );

    // If deal is closed, log impact event
    if (status === 'Deal Closed' && dealValue) {
      await db.collection('impactLogs').insertOne({
        userId: new ObjectId(req.user._id),
        buyerId: new ObjectId(id),
        eventType: 'deal_closed',
        revenueAmount: dealValue,
        targetCountry: buyer.country,
        productCategory: req.user.sector,
        eventDate: new Date(),
        createdAt: new Date()
      });

      // Update user metrics
      await db.collection('users').updateOne(
        { _id: new ObjectId(req.user._id) },
        { 
          $inc: { 
            totalRevenue: dealValue,
            ordersSecured: 1,
            marketsEntered: 0 // Will be calculated separately
          },
          $set: { updatedAt: new Date() }
        }
      );
    }

    logger.info(`User ${req.user._id} updated contact status with buyer ${id} to ${status}`);

    res.json({
      success: true,
      message: 'Contact status updated successfully',
      data: {
        status,
        lastContactAt: interactionData.lastContactAt
      }
    });

  } catch (error) {
    logger.error('Contact update error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   GET /api/buyers/filters/options
// @desc    Get filter options for buyers
// @access  Private
router.get('/filters/options', async (req, res) => {
  try {
    const db = getDB();

    // Get distinct values for filters
    const [countries, productCategories, certifications] = await Promise.all([
      db.collection('buyers').distinct('country', { isVerified: true }),
      db.collection('buyers').distinct('productCategories', { isVerified: true }),
      db.collection('buyers').distinct('certificationsRequired', { isVerified: true })
    ]);

    res.json({
      success: true,
      data: {
        countries: countries.sort(),
        productCategories: [...new Set(productCategories.flat())].sort(),
        certifications: [...new Set(certifications.flat())].sort()
      }
    });

  } catch (error) {
    logger.error('Filter options error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;
