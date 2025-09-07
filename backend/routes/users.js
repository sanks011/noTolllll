const express = require('express');
const User = require('../models/User');
const logger = require('../config/logger');

const router = express.Router();

// @route   GET /api/users/profile
// @desc    Get current user profile
// @access  Private
router.get('/profile', async (req, res) => {
  try {
    const user = req.user;
    
    res.json({
      success: true,
      data: {
        id: user._id,
        email: user.email,
        companyName: user.companyName,
        contactPerson: user.contactPerson,
        role: user.role,
        sector: user.sector,
        hsCode: user.hsCode,
        targetCountries: user.targetCountries,
        isVerified: user.isVerified,
        createdAt: user.createdAt,
        metrics: {
          totalRevenue: user.totalRevenue,
          ordersSecured: user.ordersSecured,
          marketsEntered: user.marketsEntered,
          jobsRetained: user.jobsRetained
        }
      }
    });

  } catch (error) {
    logger.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', async (req, res) => {
  try {
    const userId = req.user._id;
    const allowedUpdates = [
      'companyName', 
      'contactPerson', 
      'role', 
      'sector', 
      'hsCode', 
      'targetCountries'
    ];
    
    const updates = {};
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid fields to update'
      });
    }

    const result = await User.updateById(userId, updates);

    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    logger.info(`User ${userId} updated profile`);

    res.json({
      success: true,
      message: 'Profile updated successfully'
    });

  } catch (error) {
    logger.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;
