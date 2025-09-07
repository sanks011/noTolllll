const express = require('express');
const Joi = require('joi');
const { ObjectId } = require('mongodb');
const { getDB } = require('../config/database');
const logger = require('../config/logger');

const router = express.Router();

// @route   GET /api/compliance
// @desc    Get user's compliance checklist
// @access  Private
router.get('/', async (req, res) => {
  try {
    const db = getDB();
    const userId = req.user._id;

    // Get user's compliance checklist
    const complianceChecklist = await db.collection('complianceChecklists')
      .findOne({ userId: new ObjectId(userId) });

    if (!complianceChecklist) {
      // Create default compliance checklist for user
      const defaultChecklist = {
        userId: new ObjectId(userId),
        targetCountry: req.user.targetCountries[0] || 'EU',
        requirements: {
          labeling: { completed: false, uploadedAt: null, fileUrl: null },
          traceability: { completed: false, uploadedAt: null, fileUrl: null },
          coldChain: { completed: false, uploadedAt: null, fileUrl: null },
          labReports: { completed: false, uploadedAt: null, fileUrl: null },
          certifications: { completed: false, uploadedAt: null, fileUrl: null }
        },
        completionPercentage: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await db.collection('complianceChecklists').insertOne(defaultChecklist);
      
      return res.json({
        success: true,
        data: defaultChecklist
      });
    }

    res.json({
      success: true,
      data: complianceChecklist
    });

  } catch (error) {
    logger.error('Get compliance error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   PUT /api/compliance/requirement
// @desc    Update compliance requirement status
// @access  Private
router.put('/requirement', async (req, res) => {
  try {
    const { requirement, completed, fileUrl } = req.body;
    const db = getDB();
    const userId = req.user._id;

    const validRequirements = ['labeling', 'traceability', 'coldChain', 'labReports', 'certifications'];
    
    if (!validRequirements.includes(requirement)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid requirement type'
      });
    }

    const updateData = {
      [`requirements.${requirement}.completed`]: completed,
      [`requirements.${requirement}.uploadedAt`]: completed ? new Date() : null,
      updatedAt: new Date()
    };

    if (fileUrl) {
      updateData[`requirements.${requirement}.fileUrl`] = fileUrl;
    }

    // Update the requirement
    const result = await db.collection('complianceChecklists').updateOne(
      { userId: new ObjectId(userId) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Compliance checklist not found'
      });
    }

    // Recalculate completion percentage
    const updatedChecklist = await db.collection('complianceChecklists')
      .findOne({ userId: new ObjectId(userId) });

    const completedCount = Object.values(updatedChecklist.requirements)
      .filter(req => req.completed).length;
    const totalRequirements = Object.keys(updatedChecklist.requirements).length;
    const completionPercentage = Math.round((completedCount / totalRequirements) * 100);

    await db.collection('complianceChecklists').updateOne(
      { userId: new ObjectId(userId) },
      { $set: { completionPercentage, updatedAt: new Date() } }
    );

    logger.info(`User ${userId} updated compliance requirement: ${requirement}`);

    res.json({
      success: true,
      message: 'Requirement updated successfully',
      data: { completionPercentage }
    });

  } catch (error) {
    logger.error('Update compliance error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   GET /api/compliance/vendors
// @desc    Get compliance vendors/service providers
// @access  Private
router.get('/vendors', async (req, res) => {
  try {
    // Mock vendor data - in real app this would come from database
    const vendors = [
      {
        id: '1',
        name: 'CertifyGlobal',
        services: ['HACCP Certification', 'ISO 22000', 'Organic Certification'],
        location: 'Bhubaneswar, Odisha',
        rating: 4.8,
        price: '₹25,000 - ₹50,000',
        turnaround: '15-20 days',
        contact: '+91-674-123-4567'
      },
      {
        id: '2',
        name: 'QualityCheck Labs',
        services: ['Lab Testing', 'Microbiological Analysis', 'Heavy Metal Testing'],
        location: 'Chennai, Tamil Nadu',
        rating: 4.6,
        price: '₹5,000 - ₹15,000',
        turnaround: '7-10 days',
        contact: '+91-44-987-6543'
      },
      {
        id: '3',
        name: 'TraceTrack Solutions',
        services: ['Traceability Systems', 'Cold Chain Monitoring', 'Documentation'],
        location: 'Mumbai, Maharashtra',
        rating: 4.7,
        price: '₹15,000 - ₹30,000',
        turnaround: '10-15 days',
        contact: '+91-22-555-0123'
      }
    ];

    res.json({
      success: true,
      data: vendors
    });

  } catch (error) {
    logger.error('Get vendors error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;
