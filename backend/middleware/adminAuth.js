const jwt = require('jsonwebtoken');
const logger = require('../config/logger');

/**
 * Middleware to verify admin authentication token
 * Specifically for admin-only operations like trade data upload
 */
const adminAuthMiddleware = async (req, res, next) => {
  try {
    // Skip authentication for OPTIONS requests (CORS preflight)
    if (req.method === 'OPTIONS') {
      return next();
    }

    // Check for admin token in Authorization header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Admin token required.'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if token is specifically for admin access
    if (!decoded.isAdmin || decoded.type !== 'admin') {
      logger.warn(`Unauthorized admin access attempt with token type: ${decoded.type}`);
      return res.status(403).json({
        success: false,
        message: 'Access denied. Valid admin credentials required.'
      });
    }

    // Verify admin credentials are still valid in environment
    const validAdminId = process.env.ADMIN_ID;
    if (!validAdminId || decoded.adminId !== validAdminId) {
      logger.warn(`Admin access attempt with invalid/expired admin ID: ${decoded.adminId}`);
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin credentials invalid or expired.'
      });
    }

    // Add admin info to request
    req.admin = {
      id: 'admin',
      adminId: decoded.adminId,
      isAdmin: true,
      type: 'admin'
    };

    logger.info(`Admin access granted to ${decoded.adminId} for ${req.method} ${req.originalUrl}`);
    next();

  } catch (error) {
    logger.error('Admin authentication error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid admin token.'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Admin token expired. Please login again.'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error during admin authentication'
    });
  }
};

module.exports = { adminAuthMiddleware };
