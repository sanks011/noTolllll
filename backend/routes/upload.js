const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { ObjectId } = require('mongodb');
const { getDB } = require('../config/database');
const logger = require('../config/logger');

const router = express.Router();

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = process.env.ALLOWED_FILE_TYPES?.split(',') || [
    'image/jpeg',
    'image/png',
    'image/jpg',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only images, PDFs, and Word documents are allowed.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024 // 10MB default
  }
});

// @route   POST /api/upload/single
// @desc    Upload a single file
// @access  Private
router.post('/single', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const { purpose, relatedId } = req.body;
    const db = getDB();

    // Save file metadata to database
    const fileData = {
      userId: new ObjectId(req.user._id),
      fileName: req.file.filename,
      originalName: req.file.originalname,
      fileType: req.file.mimetype,
      fileSize: req.file.size,
      fileUrl: `/uploads/${req.file.filename}`,
      uploadPurpose: purpose || 'general',
      relatedId: relatedId ? new ObjectId(relatedId) : null,
      createdAt: new Date()
    };

    const result = await db.collection('fileUploads').insertOne(fileData);

    logger.info(`User ${req.user._id} uploaded file: ${req.file.originalname}`);

    res.json({
      success: true,
      message: 'File uploaded successfully',
      data: {
        id: result.insertedId,
        fileName: req.file.filename,
        originalName: req.file.originalname,
        fileUrl: fileData.fileUrl,
        fileSize: req.file.size,
        fileType: req.file.mimetype
      }
    });

  } catch (error) {
    logger.error('File upload error:', error);
    
    // Clean up uploaded file if database save failed
    if (req.file) {
      fs.unlink(req.file.path, (err) => {
        if (err) logger.error('Error deleting file:', err);
      });
    }

    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size is 10MB.'
      });
    }

    res.status(500).json({
      success: false,
      message: error.message || 'File upload failed'
    });
  }
});

// @route   POST /api/upload/multiple
// @desc    Upload multiple files
// @access  Private
router.post('/multiple', upload.array('files', 5), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded'
      });
    }

    const { purpose, relatedId } = req.body;
    const db = getDB();

    // Save all file metadata to database
    const fileDataArray = req.files.map(file => ({
      userId: new ObjectId(req.user._id),
      fileName: file.filename,
      originalName: file.originalname,
      fileType: file.mimetype,
      fileSize: file.size,
      fileUrl: `/uploads/${file.filename}`,
      uploadPurpose: purpose || 'general',
      relatedId: relatedId ? new ObjectId(relatedId) : null,
      createdAt: new Date()
    }));

    const result = await db.collection('fileUploads').insertMany(fileDataArray);

    logger.info(`User ${req.user._id} uploaded ${req.files.length} files`);

    const responseData = req.files.map((file, index) => ({
      id: result.insertedIds[index],
      fileName: file.filename,
      originalName: file.originalname,
      fileUrl: `/uploads/${file.filename}`,
      fileSize: file.size,
      fileType: file.mimetype
    }));

    res.json({
      success: true,
      message: `${req.files.length} files uploaded successfully`,
      data: responseData
    });

  } catch (error) {
    logger.error('Multiple file upload error:', error);
    
    // Clean up uploaded files if database save failed
    if (req.files) {
      req.files.forEach(file => {
        fs.unlink(file.path, (err) => {
          if (err) logger.error('Error deleting file:', err);
        });
      });
    }

    res.status(500).json({
      success: false,
      message: error.message || 'File upload failed'
    });
  }
});

// @route   GET /api/upload/files
// @desc    Get user's uploaded files
// @access  Private
router.get('/files', async (req, res) => {
  try {
    const { 
      purpose = 'all',
      page = 1,
      limit = 20 
    } = req.query;

    const db = getDB();
    const userId = req.user._id;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build filter
    let filter = { userId: new ObjectId(userId) };
    if (purpose !== 'all') {
      filter.uploadPurpose = purpose;
    }

    // Get files
    const files = await db.collection('fileUploads')
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .toArray();

    // Get total count
    const totalCount = await db.collection('fileUploads').countDocuments(filter);

    const formattedFiles = files.map(file => ({
      id: file._id,
      fileName: file.fileName,
      originalName: file.originalName,
      fileType: file.fileType,
      fileSize: file.fileSize,
      fileUrl: file.fileUrl,
      uploadPurpose: file.uploadPurpose,
      createdAt: file.createdAt
    }));

    const pagination = {
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalCount / parseInt(limit)),
      totalRecords: totalCount,
      hasNext: parseInt(page) < Math.ceil(totalCount / parseInt(limit)),
      hasPrev: parseInt(page) > 1
    };

    res.json({
      success: true,
      data: {
        files: formattedFiles
      },
      pagination
    });

  } catch (error) {
    logger.error('Get files error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   DELETE /api/upload/files/:id
// @desc    Delete a file
// @access  Private
router.delete('/files/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const db = getDB();

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid file ID'
      });
    }

    // Get file info
    const file = await db.collection('fileUploads').findOne({
      _id: new ObjectId(id),
      userId: new ObjectId(req.user._id)
    });

    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    // Delete from database
    await db.collection('fileUploads').deleteOne({ _id: new ObjectId(id) });

    // Delete physical file
    const filePath = path.join(uploadsDir, file.fileName);
    fs.unlink(filePath, (err) => {
      if (err) {
        logger.error('Error deleting physical file:', err);
      }
    });

    logger.info(`User ${req.user._id} deleted file: ${file.originalName}`);

    res.json({
      success: true,
      message: 'File deleted successfully'
    });

  } catch (error) {
    logger.error('Delete file error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Error handling middleware for multer
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size is 10MB.'
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Too many files. Maximum 5 files allowed.'
      });
    }
  }
  
  res.status(400).json({
    success: false,
    message: error.message || 'File upload error'
  });
});

module.exports = router;
