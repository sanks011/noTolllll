const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const { RateLimiterMemory } = require('rate-limiter-flexible');
const path = require('path');
require('dotenv').config();

const connectDB = require('./config/database').connectDB;
const logger = require('./config/logger');
const errorHandler = require('./middleware/errorHandler');
const { authMiddleware, adminMiddleware } = require('./middleware/auth');

// Import routes
const authRoutes = require('./routes/auth');
console.log('authRoutes type:', typeof authRoutes);
console.log('authRoutes value:', authRoutes);

const userRoutes = require('./routes/users');
const marketIntelligenceRoutes = require('./routes/marketIntelligence');
const buyersRoutes = require('./routes/buyers');
const complianceRoutes = require('./routes/compliance');
const reliefSchemesRoutes = require('./routes/reliefSchemes');
const forumRoutes = require('./routes/forum');
const impactRoutes = require('./routes/impact');
const uploadRoutes = require('./routes/upload');
const dashboardRoutes = require('./routes/dashboard');
const tradeRoutes = require('./routes/trade');
const newsRoutes = require('./routes/news');
const tradeDataRoutes = require('./routes/tradeData');
const adminAuthRoutes = require('./routes/adminAuth');

const app = express();
const PORT = process.env.PORT || 3001;

// Connect to MongoDB
connectDB();

// CORS configuration - Must be first!
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Range', 'X-Content-Range']
}));

// Security middleware
app.use(helmet());
app.use(compression());

// Rate limiting
const rateLimiter = new RateLimiterMemory({
  keyGenerator: (req) => req.ip,
  points: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // Number of requests
  duration: parseInt(process.env.RATE_LIMIT_WINDOW_MS) / 1000 || 900, // Per 15 minutes
});

const rateLimiterMiddleware = async (req, res, next) => {
  try {
    // Skip rate limiting for OPTIONS requests (CORS preflight)
    if (req.method === 'OPTIONS') {
      return next();
    }
    
    // Skip rate limiting for admin upload endpoints
    if (req.originalUrl.includes('/api/trade-data/upload') || 
        req.originalUrl.includes('/api/admin-auth/')) {
      return next();
    }
    
    await rateLimiter.consume(req.ip);
    next();
  } catch (rejRes) {
    res.status(429).json({
      success: false,
      message: 'Too many requests from this IP, please try again later.'
    });
  }
};

app.use(rateLimiterMiddleware);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.originalUrl} - ${req.ip}`);
  console.log(`MIDDLEWARE DEBUG: ${req.method} ${req.originalUrl}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    version: require('./package.json').version
  });
});

// API routes
try {
  console.log('Attempting to mount /api/auth routes...');
  app.use('/api/auth', authRoutes);
  console.log('✓ Auth routes mounted successfully');
  
  app.use('/api/admin-auth', adminAuthRoutes); // Admin authentication routes
  app.use('/api/users', authMiddleware, userRoutes);
  app.use('/api/admin', authMiddleware, adminMiddleware, dashboardRoutes); // Admin routes
  app.use('/api/market-intelligence', authMiddleware, marketIntelligenceRoutes);
  app.use('/api/buyers', authMiddleware, buyersRoutes);
  app.use('/api/compliance', authMiddleware, complianceRoutes);
  app.use('/api/relief-schemes', authMiddleware, reliefSchemesRoutes);
  app.use('/api/forum', authMiddleware, forumRoutes);
  app.use('/api/impact', authMiddleware, impactRoutes);
  app.use('/api/upload', authMiddleware, uploadRoutes);
  app.use('/api/dashboard', authMiddleware, dashboardRoutes);
  app.use('/api/trade', authMiddleware, tradeRoutes);
  app.use('/api/news', newsRoutes);
  app.use('/api/trade-data', tradeDataRoutes);
  console.log('✓ All routes mounted successfully');
} catch (error) {
  console.error('❌ Error mounting routes:', error);
}

// 404 handler for unmatched routes
app.use('*', (req, res) => {
  console.log(`404 HANDLER HIT: ${req.method} ${req.originalUrl}`);
  
  // Check if response has already been sent
  if (res.headersSent) {
    console.log('Headers already sent, skipping 404 response');
    return;
  }
  
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
});

module.exports = app;
