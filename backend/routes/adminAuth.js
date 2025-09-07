const express = require('express');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const logger = require('../config/logger');

const router = express.Router();

// Validation schema for admin login
const adminLoginSchema = Joi.object({
  adminId: Joi.string().required(),
  password: Joi.string().required()
});

// @route   POST /api/admin-auth/login
// @desc    Admin login with ID and password
// @access  Public
router.post('/login', async (req, res) => {
  try {
    // Validate input
    const { error, value } = adminLoginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    const { adminId, password } = value;

    // Check against environment variables
    const validAdminId = process.env.ADMIN_ID;
    const validAdminPassword = process.env.ADMIN_PASSWORD;

    if (!validAdminId || !validAdminPassword) {
      logger.error('Admin credentials not configured in environment');
      return res.status(500).json({
        success: false,
        message: 'Admin authentication not configured'
      });
    }

    // Verify credentials
    if (adminId !== validAdminId || password !== validAdminPassword) {
      logger.warn(`Failed admin login attempt with ID: ${adminId}`);
      return res.status(401).json({
        success: false,
        message: 'Invalid admin credentials'
      });
    }

    // Generate JWT token for admin
    const token = jwt.sign(
      { 
        userId: 'admin', 
        isAdmin: true,
        adminId: adminId,
        type: 'admin'
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '24h' }
    );

    logger.info(`Successful admin login: ${adminId}`);

    res.json({
      success: true,
      message: 'Admin login successful',
      token,
      admin: {
        id: 'admin',
        adminId: adminId,
        isAdmin: true,
        type: 'admin'
      }
    });

  } catch (error) {
    logger.error('Admin login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during admin login'
    });
  }
});

// @route   POST /api/admin-auth/verify
// @desc    Verify admin token
// @access  Private (Admin)
router.post('/verify', async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if token is for admin
    if (!decoded.isAdmin || decoded.type !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    res.json({
      success: true,
      message: 'Admin token is valid',
      admin: {
        id: 'admin',
        adminId: decoded.adminId,
        isAdmin: true,
        type: 'admin'
      }
    });

  } catch (error) {
    logger.error('Admin token verification error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token.'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired.'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error during token verification'
    });
  }
});

module.exports = router;
