const express = require('express');
const router = express.Router();
const newsService = require('../services/newsService');
const { authMiddleware } = require('../middleware/auth');
const logger = require('../config/logger');

/**
 * @route   GET /api/news
 * @desc    Get news articles
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    const category = req.query.category || 'tariff';
    const result = await newsService.getNews(category);
    
    res.json({
      success: true,
      data: result.articles,
      meta: {
        cached: result.cached,
        lastUpdated: result.lastUpdated,
        category: category,
        count: result.articles.length
      }
    });
  } catch (error) {
    logger.error('Error fetching news:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch news',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * @route   GET /api/news/categories/:category
 * @desc    Get news by specific category
 * @access  Public
 */
router.get('/categories/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const validCategories = ['tariff', 'trade', 'economy'];
    
    if (!validCategories.includes(category)) {
      return res.status(400).json({
        success: false,
        message: `Invalid category. Valid categories are: ${validCategories.join(', ')}`
      });
    }

    const result = await newsService.getNews(category);
    
    res.json({
      success: true,
      data: result.articles,
      meta: {
        cached: result.cached,
        lastUpdated: result.lastUpdated,
        category: category,
        count: result.articles.length
      }
    });
  } catch (error) {
    logger.error(`Error fetching news for category ${req.params.category}:`, error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch news',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * @route   POST /api/news/refresh
 * @desc    Manually refresh news cache
 * @access  Protected
 */
router.post('/refresh', authMiddleware, async (req, res) => {
  try {
    const category = req.body.category || 'tariff';
    const result = await newsService.refreshNews(category);
    
    logger.info(`News cache refreshed by user ${req.user.userId} for category: ${category}`);
    
    res.json({
      success: true,
      message: 'News cache refreshed successfully',
      data: result.articles,
      meta: {
        cached: result.cached,
        lastUpdated: result.lastUpdated,
        category: category,
        count: result.articles.length
      }
    });
  } catch (error) {
    logger.error('Error refreshing news cache:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to refresh news cache',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * @route   GET /api/news/cache/status
 * @desc    Get cache status (for admin/debugging)
 * @access  Protected
 */
router.get('/cache/status', authMiddleware, async (req, res) => {
  try {
    const cacheStatus = newsService.getCacheStatus();
    
    res.json({
      success: true,
      data: cacheStatus,
      meta: {
        cacheCount: Object.keys(cacheStatus).length,
        timestamp: new Date()
      }
    });
  } catch (error) {
    logger.error('Error getting cache status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get cache status',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * @route   DELETE /api/news/cache
 * @desc    Clear all news cache (admin only)
 * @access  Protected
 */
router.delete('/cache', authMiddleware, async (req, res) => {
  try {
    // Optional: Add admin check here if needed
    // if (!req.user.isAdmin) {
    //   return res.status(403).json({
    //     success: false,
    //     message: 'Admin access required'
    //   });
    // }

    newsService.clearCache();
    
    logger.info(`All news cache cleared by user ${req.user.userId}`);
    
    res.json({
      success: true,
      message: 'All news cache cleared successfully'
    });
  } catch (error) {
    logger.error('Error clearing cache:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear cache',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

module.exports = router;
