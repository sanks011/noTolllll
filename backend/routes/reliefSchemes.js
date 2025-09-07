const express = require('express');
const Joi = require('joi');
const { ObjectId } = require('mongodb');
const { getDB } = require('../config/database');
const logger = require('../config/logger');

const router = express.Router();

// @route   GET /api/relief-schemes
// @desc    Get relief schemes for user
// @access  Private
router.get('/', async (req, res) => {
  try {
    const db = getDB();
    const user = req.user;

    // Get relief schemes matching user's sector and eligibility
    const reliefSchemes = await db.collection('reliefSchemes')
      .find({ 
        isActive: true,
        'eligibilityCriteria.sectors': { $in: [user.sector, 'All'] },
        deadline: { $gte: new Date() }
      })
      .sort({ deadline: 1 })
      .toArray();

    // Get user's applications for these schemes
    const schemeIds = reliefSchemes.map(scheme => scheme._id);
    const userApplications = await db.collection('userReliefApplications')
      .find({ 
        userId: new ObjectId(user._id),
        schemeId: { $in: schemeIds }
      })
      .toArray();

    // Create application map for quick lookup
    const applicationMap = {};
    userApplications.forEach(app => {
      applicationMap[app.schemeId.toString()] = app;
    });

    // Format schemes with application status
    const formattedSchemes = reliefSchemes.map(scheme => {
      const application = applicationMap[scheme._id.toString()];
      return {
        id: scheme._id,
        name: scheme.name,
        authority: scheme.authority,
        benefitAmount: scheme.benefitAmount,
        benefitType: scheme.benefitType,
        deadline: scheme.deadline,
        eligibilityCriteria: scheme.eligibilityCriteria,
        applicationProcess: scheme.applicationProcess,
        documentsRequired: scheme.documentsRequired,
        applicationStatus: application?.status || 'Eligible',
        appliedAt: application?.appliedAt,
        benefitCalculated: application?.benefitCalculated,
        description: scheme.description || `${scheme.benefitType} scheme by ${scheme.authority}`
      };
    });

    // Calculate summary statistics
    const summary = {
      totalSchemes: reliefSchemes.length,
      eligibleSchemes: formattedSchemes.filter(s => s.applicationStatus === 'Eligible').length,
      appliedSchemes: formattedSchemes.filter(s => s.applicationStatus !== 'Eligible').length,
      totalPotentialBenefit: reliefSchemes.reduce((sum, scheme) => sum + scheme.benefitAmount, 0)
    };

    res.json({
      success: true,
      data: {
        schemes: formattedSchemes,
        summary
      }
    });

  } catch (error) {
    logger.error('Get relief schemes error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   POST /api/relief-schemes/:id/apply
// @desc    Apply for a relief scheme
// @access  Private
router.post('/:id/apply', async (req, res) => {
  try {
    const { id } = req.params;
    const { documentsUploaded } = req.body;
    const db = getDB();
    const userId = req.user._id;

    // Validate scheme ID
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid scheme ID'
      });
    }

    // Check if scheme exists
    const scheme = await db.collection('reliefSchemes')
      .findOne({ _id: new ObjectId(id), isActive: true });

    if (!scheme) {
      return res.status(404).json({
        success: false,
        message: 'Relief scheme not found'
      });
    }

    // Check if user has already applied
    const existingApplication = await db.collection('userReliefApplications')
      .findOne({ 
        userId: new ObjectId(userId),
        schemeId: new ObjectId(id)
      });

    if (existingApplication) {
      return res.status(400).json({
        success: false,
        message: 'You have already applied for this scheme'
      });
    }

    // Calculate benefit amount based on user profile
    const benefitCalculated = Math.min(
      scheme.benefitAmount,
      req.user.totalRevenue * 0.1 // 10% of revenue as example calculation
    );

    // Create application
    const application = {
      userId: new ObjectId(userId),
      schemeId: new ObjectId(id),
      status: 'Applied',
      appliedAt: new Date(),
      benefitCalculated,
      documentsUploaded: documentsUploaded || [],
      reviewNotes: '',
      createdAt: new Date()
    };

    const result = await db.collection('userReliefApplications').insertOne(application);

    logger.info(`User ${userId} applied for relief scheme ${id}`);

    res.json({
      success: true,
      message: 'Application submitted successfully',
      data: {
        applicationId: result.insertedId,
        status: 'Applied',
        benefitCalculated
      }
    });

  } catch (error) {
    logger.error('Apply relief scheme error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   GET /api/relief-schemes/applications
// @desc    Get user's relief scheme applications
// @access  Private
router.get('/applications', async (req, res) => {
  try {
    const db = getDB();
    const userId = req.user._id;

    // Get user's applications with scheme details
    const applications = await db.collection('userReliefApplications')
      .aggregate([
        { $match: { userId: new ObjectId(userId) } },
        {
          $lookup: {
            from: 'reliefSchemes',
            localField: 'schemeId',
            foreignField: '_id',
            as: 'scheme'
          }
        },
        { $unwind: '$scheme' },
        { $sort: { appliedAt: -1 } }
      ])
      .toArray();

    const formattedApplications = applications.map(app => ({
      id: app._id,
      schemeName: app.scheme.name,
      authority: app.scheme.authority,
      status: app.status,
      appliedAt: app.appliedAt,
      benefitCalculated: app.benefitCalculated,
      documentsUploaded: app.documentsUploaded,
      reviewNotes: app.reviewNotes
    }));

    res.json({
      success: true,
      data: formattedApplications
    });

  } catch (error) {
    logger.error('Get applications error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;
