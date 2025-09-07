const express = require('express');
const multer = require('multer');
const csv = require('csv-parse');
const fs = require('fs');
const path = require('path');
const TradeData = require('../models/TradeData');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const { adminAuthMiddleware } = require('../middleware/adminAuth');
const logger = require('../config/logger');

const router = express.Router();

// Configure multer for CSV file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = './uploads/trade-data';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    cb(null, `trade-data-${timestamp}-${file.originalname}`);
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'));
    }
  },
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  }
});

// @route   GET /api/trade-data/analytics
// @desc    Get trade analytics for dashboard
// @access  Public
router.get('/analytics', async (req, res) => {
  try {
    const { sector } = req.query;
    const analytics = await TradeData.getTradeAnalytics(sector);
    
    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    logger.error('Trade analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching trade analytics'
    });
  }
});

// @route   GET /api/trade-data/filtered
// @desc    Get filtered trade data
// @access  Public
router.get('/filtered', async (req, res) => {
  try {
    const filters = {
      sector: req.query.sector,
      partnerCountry: req.query.partner,
      year: req.query.year ? parseInt(req.query.year) : null,
      startYear: req.query.startYear ? parseInt(req.query.startYear) : null,
      endYear: req.query.endYear ? parseInt(req.query.endYear) : null
    };

    const data = await TradeData.getTradeDataByFilters(filters);
    
    res.json({
      success: true,
      data: data,
      count: data.length
    });
  } catch (error) {
    logger.error('Filtered trade data error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching trade data'
    });
  }
});

// @route   GET /api/trade-data/summary
// @desc    Get data summary for admin
// @access  Private (Admin)
router.get('/summary', adminAuthMiddleware, async (req, res) => {
  try {
    const summary = await TradeData.getDataSummary();
    
    res.json({
      success: true,
      data: summary
    });
  } catch (error) {
    logger.error('Trade data summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching data summary'
    });
  }
});

// @route   POST /api/trade-data/upload
// @desc    Upload CSV trade data (Admin only)
// @access  Private (Admin)
router.post('/upload', adminAuthMiddleware, upload.single('csvFile'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No CSV file uploaded'
      });
    }

    const csvPath = req.file.path;
    const tradeDataArray = [];

    // Read and parse CSV
    console.log('Starting CSV parsing...');
    console.log('CSV file path:', csvPath);
    
    const csvData = fs.readFileSync(csvPath, 'utf8');
    console.log('CSV file read, first 500 chars:', csvData.substring(0, 500));

    const records = [];
    const parser = csv.parse({
      columns: true,
      skip_empty_lines: true,
      trim: true
    });

    parser.on('data', (record) => {
      records.push(record);
    });

    parser.on('error', (err) => {
      console.error('CSV parsing error:', err);
    });

    parser.write(csvData);
    parser.end();

    console.log(`Total records parsed: ${records.length}`);
    console.log('First record:', records[0]);

    let recordCount = 0;
    for (const record of records) {
      recordCount++;
      console.log(`Record ${recordCount}:`, record);
      console.log('Required fields check:', {
        reporter_name: !!record.reporter_name,
        year: !!record.year,
        partner_name: !!record.partner_name,
        value: !!record.value
      });

      // Validate required fields
      if (record.reporter_name && record.year && record.partner_name && record.value) {
        console.log('✓ Record passed validation');
        tradeDataArray.push({
          reporter_name: record.reporter_name.trim(),
          reporter_code: record.reporter_code?.trim() || '',
          year: parseInt(record.year),
          classification: record.classification?.trim() || '',
          classification_version: record.classification_version?.trim() || '',
          product_code: record.product_code?.trim() || '',
          mtn_categories: record.mtn_categories?.trim() || '',
          partner_code: record.partner_code?.trim() || '',
          partner_name: record.partner_name.trim(),
          value: parseFloat(record.value) || 0
        });
      } else {
        console.log('❌ Record failed validation');
      }
    }

    console.log(`Total records processed: ${recordCount}`);
    console.log(`Valid records: ${tradeDataArray.length}`);

    if (tradeDataArray.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid trade data found in CSV'
      });
    }

    // Insert data into database
    const result = await TradeData.insertBulkData(tradeDataArray);

    // Clean up uploaded file
    fs.unlinkSync(csvPath);

    logger.info(`Trade data uploaded: ${result.insertedCount} records by admin ${req.admin.adminId}`);

    res.json({
      success: true,
      message: `Successfully uploaded ${result.insertedCount} trade records`,
      data: {
        recordsInserted: result.insertedCount,
        totalProcessed: tradeDataArray.length
      }
    });

  } catch (error) {
    logger.error('Trade data upload error:', error);
    
    // Clean up file on error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      success: false,
      message: 'Error uploading trade data',
      error: error.message
    });
  }
});

// @route   DELETE /api/trade-data/clear
// @desc    Clear all trade data (Admin only)
// @access  Private (Admin)
router.delete('/clear', adminAuthMiddleware, async (req, res) => {
  try {
    const result = await TradeData.clearAllData();
    
    logger.info(`All trade data cleared by admin ${req.admin.adminId}`);
    
    res.json({
      success: true,
      message: `Cleared ${result.deletedCount} trade data records`
    });
  } catch (error) {
    logger.error('Clear trade data error:', error);
    res.status(500).json({
      success: false,
      message: 'Error clearing trade data'
    });
  }
});

module.exports = router;
