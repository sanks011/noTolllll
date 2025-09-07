const express = require('express');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const User = require('../models/User');
const { authMiddleware } = require('../middleware/auth');
const logger = require('../config/logger');

const router = express.Router();

// Validation schemas
const signupSchema = Joi.object({
  email: Joi.string().email().required(),
  companyName: Joi.string().min(2).max(100).required(),
  contactPerson: Joi.string().min(2).max(50).required(),
  userType: Joi.string().valid('Indian', 'Foreigner').required(),
  role: Joi.string().valid('Buyer', 'Seller').required(),
  isAdmin: Joi.boolean().default(false),
  sector: Joi.string().valid('Seafood', 'Textile', 'Both', 'Not specified').default('Not specified'),
  hsCode: Joi.string().default(''),
  targetCountries: Joi.array().items(Joi.string()).default([]),
  password: Joi.string().min(6).required()
});

const signinSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

// @route   POST /api/auth/signup
// @desc    Register new user
// @access  Public
router.post('/signup', async (req, res) => {
  try {
    // Validate input
    const { error, value } = signupSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    const { email, companyName, contactPerson, userType, role, isAdmin, sector, hsCode, targetCountries, password } = value;

    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Create new user
    const user = new User({
      email,
      companyName,
      contactPerson,
      userType,
      role,
      isAdmin: isAdmin || false,
      sector,
      hsCode,
      targetCountries,
      password
    });

    const result = await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: result.insertedId },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );

    logger.info(`New user registered: ${email}`);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: result.insertedId,
        email,
        companyName,
        contactPerson,
        userType,
        role,
        isAdmin: isAdmin || false,
        sector
      }
    });

  } catch (error) {
    logger.error('Signup error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   POST /api/auth/signin
// @desc    Authenticate user and get token
// @access  Public
router.post('/signin', async (req, res) => {
  try {
    // Validate input
    const { error, value } = signinSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    const { email, password } = value;

    // Check if user exists
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

    // Check password
    const isPasswordValid = await User.comparePassword(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );

    logger.info(`User signed in: ${email}`);

    res.json({
      success: true,
      message: 'Sign in successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        companyName: user.companyName,
        contactPerson: user.contactPerson,
        userType: user.userType,
        role: user.role,
        isAdmin: user.isAdmin || false,
        sector: user.sector
      }
    });

  } catch (error) {
    logger.error('Signin error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   GET /api/auth/profile
// @desc    Get current user profile
// @access  Private
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const user = req.user;

    res.json({
      success: true,
      message: 'Profile retrieved successfully',
      user: {
        id: user._id,
        email: user.email,
        companyName: user.companyName,
        contactPerson: user.contactPerson,
        userType: user.userType,
        role: user.role,
        isAdmin: user.isAdmin || false,
        sector: user.sector || 'Not specified',
        hsCode: user.hsCode || '',
        targetCountries: user.targetCountries || []
      }
    });

  } catch (error) {
    logger.error('Profile retrieval error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while retrieving profile'
    });
  }
});

// @route   POST /api/auth/verify-token
// @desc    Verify JWT token
// @access  Public
router.post('/verify-token', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Token is required'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }

    res.json({
      success: true,
      message: 'Token is valid',
      user: {
        id: user._id,
        email: user.email,
        companyName: user.companyName,
        contactPerson: user.contactPerson,
        userType: user.userType,
        role: user.role,
        isAdmin: user.isAdmin || false,
        sector: user.sector
      }
    });

  } catch (error) {
    logger.error('Token verification error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
});

module.exports = router;
