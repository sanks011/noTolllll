const express = require('express');
const { ObjectId } = require('mongodb');
const { getDB } = require('../config/database');
const logger = require('../config/logger');

const router = express.Router();

// @route   GET /api/dashboard/seller
// @desc    Get Seller dashboard data (Previously Indian trader)
// @access  Private
router.get('/seller', async (req, res) => {
  try {
    const db = getDB();
    const user = req.user;

    // Get tariff watch data for user's products
    const tariffWatch = await db.collection('marketIntelligence')
      .find({ hsCode: user.hsCode })
      .sort({ tariffRate: 1 })
      .limit(3)
      .toArray();

    // Get buyer matches for user's sector and target countries
    const buyerMatches = await db.collection('buyers')
      .find({ 
        productCategories: { $in: [user.sector] },
        country: { $in: user.targetCountries },
        isVerified: true
      })
      .limit(5)
      .toArray();

    // Get total buyer matches count
    const totalBuyerMatches = await db.collection('buyers')
      .countDocuments({
        productCategories: { $in: [user.sector] },
        isVerified: true
      });

    // Get user's compliance status
    const complianceStatus = await db.collection('complianceChecklists')
      .findOne({ userId: new ObjectId(user._id) });

    // Get eligible relief schemes
    const reliefSchemes = await db.collection('reliefSchemes')
      .find({ 
        isActive: true,
        'eligibilityCriteria.sectors': { $in: [user.sector] },
        deadline: { $gte: new Date() }
      })
      .limit(3)
      .toArray();

    // Get user's recent impact events
    const recentImpact = await db.collection('impactLogs')
      .find({ userId: new ObjectId(user._id) })
      .sort({ eventDate: -1 })
      .limit(5)
      .toArray();

    // Format response data
    const response = {
      user: {
        name: user.contactPerson,
        company: user.companyName,
        role: user.role,
        sector: user.sector
      },
      tariffWatch: tariffWatch.map(item => ({
        country: item.country,
        rate: `${item.tariffRate}%`,
        trend: item.tariffRate < 5 ? 'down' : 'stable',
        savings: `₹${Math.floor(item.importVolume * 0.1 / 10)}L`
      })),
      buyerMatches: {
        newMatches: buyerMatches.length,
        totalMatches: totalBuyerMatches,
        recentBuyers: buyerMatches.slice(0, 2).map(buyer => ({
          name: buyer.name,
          country: buyer.country,
          product: buyer.productCategories[0]
        }))
      },
      compliance: {
        overall: complianceStatus?.completionPercentage || 0,
        byCountry: user.targetCountries.map(country => ({
          country,
          percentage: Math.floor(Math.random() * 30) + 70 // Mock data for now
        }))
      },
      reliefSchemes: {
        eligible: reliefSchemes.length,
        applied: 1, // Mock data
        totalBenefit: `₹${reliefSchemes.reduce((sum, scheme) => sum + (scheme.benefitAmount / 100000), 0)}L`,
        schemes: reliefSchemes.map(scheme => ({
          name: scheme.name,
          benefit: `₹${scheme.benefitAmount / 100000}L`,
          deadline: scheme.deadline.toISOString().split('T')[0]
        }))
      },
      impact: {
        revenueRecovered: `₹${(user.totalRevenue / 10000000).toFixed(1)}Cr`,
        ordersSecured: user.ordersSecured,
        newMarkets: user.marketsEntered,
        jobsRetained: user.jobsRetained
      },
      marketOpportunities: tariffWatch.map(market => ({
        market: market.country,
        product: user.sector === 'Seafood' ? 'Frozen Shrimp' : 'Textile Products',
        demand: market.demandGrowth > 5 ? 'High' : market.demandGrowth > 2 ? 'Medium' : 'Low',
        tariff: `${market.tariffRate}%`,
        potential: market.competitivenessScore > 80 ? 'High' : market.competitivenessScore > 60 ? 'Medium' : 'Low',
        value: `₹${Math.floor(market.importVolume * market.avgPricePerKg / 100000)}L`
      })),
      recentMatches: buyerMatches.slice(0, 2).map((buyer, index) => ({
        buyer: buyer.name,
        country: buyer.country,
        product: buyer.productCategories[0],
        match: Math.floor(Math.random() * 20) + 70, // Mock match percentage
        avatar: `/avatar${index + 1}.svg`
      }))
    };

    res.json({
      success: true,
      data: response
    });

  } catch (error) {
    logger.error('Dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   GET /api/dashboard/buyer
// @desc    Get Buyer dashboard data (Previously International trader)
// @access  Private
router.get('/buyer', async (req, res) => {
  try {
    const db = getDB();
    const user = req.user;

    // Get supplier matches for buyer users
    const supplierMatches = await db.collection('users')
      .find({ 
        role: 'Seller',
        sector: user.sector,
        isActive: true,
        _id: { $ne: new ObjectId(user._id) }
      })
      .limit(10)
      .toArray();

    // Get market data for user's target countries
    const marketData = await db.collection('marketIntelligence')
      .find({ 
        country: { $in: user.targetCountries }
      })
      .toArray();

    const response = {
      user: {
        name: user.contactPerson,
        company: user.companyName,
        role: user.role,
        sector: user.sector
      },
      supplierMatches: supplierMatches.map(supplier => ({
        name: supplier.companyName,
        location: 'India', // Since all our suppliers are Indian
        rating: (Math.random() * 1.5 + 3.5).toFixed(1), // Mock rating between 3.5-5.0
        products: [supplier.sector],
        contactPerson: supplier.contactPerson
      })),
      marketInsights: marketData.map(market => ({
        country: market.country,
        importVolume: `${market.importVolume} MT`,
        avgPrice: `$${market.avgPricePerKg}/kg`,
        tariff: `${market.tariffRate}%`,
        competitiveness: market.competitivenessScore,
        trend: market.demandGrowth > 0 ? 'up' : 'down'
      }))
    };

    res.json({
      success: true,
      data: response
    });

  } catch (error) {
    logger.error('Buyer dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   GET /api/dashboard/admin
// @desc    Get Admin dashboard data for platform management
// @access  Private (Admin only)
router.get('/admin', async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    const db = getDB();
    
    // Get platform statistics
    const totalUsers = await db.collection('users').countDocuments({ isActive: true });
    const totalBuyers = await db.collection('users').countDocuments({ role: 'Buyer', isActive: true });
    const totalSellers = await db.collection('users').countDocuments({ role: 'Seller', isActive: true });
    const totalIndianUsers = await db.collection('users').countDocuments({ userType: 'Indian', isActive: true });
    const totalForeigners = await db.collection('users').countDocuments({ userType: 'Foreigner', isActive: true });
    
    // Get recent registrations (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentRegistrations = await db.collection('users')
      .countDocuments({ 
        createdAt: { $gte: sevenDaysAgo },
        isActive: true 
      });

    // Get user activity by sector
    const sectorStats = await db.collection('users').aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$sector', count: { $sum: 1 } } }
    ]).toArray();

    // Get recent forum posts
    const recentPosts = await db.collection('forumPosts')
      .find({})
      .sort({ createdAt: -1 })
      .limit(10)
      .toArray();

    // Get buyers/sellers interactions summary
    const totalInteractions = await db.collection('userBuyerInteractions').countDocuments();
    const activeDeals = await db.collection('userBuyerInteractions')
      .countDocuments({ status: { $in: ['In Negotiation', 'Deal Closed'] } });

    const response = {
      platformStats: {
        totalUsers,
        totalBuyers,
        totalSellers,
        totalIndianUsers,
        totalForeigners,
        recentRegistrations
      },
      sectorDistribution: sectorStats.map(stat => ({
        sector: stat._id,
        count: stat.count
      })),
      activityStats: {
        totalForumPosts: recentPosts.length,
        totalInteractions,
        activeDeals
      },
      recentActivity: {
        recentRegistrations,
        recentForumPosts: recentPosts.length
      }
    };

    res.json({
      success: true,
      data: response
    });

  } catch (error) {
    logger.error('Admin dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;
