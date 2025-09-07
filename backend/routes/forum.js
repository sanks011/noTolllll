const express = require('express');
const Joi = require('joi');
const { ObjectId } = require('mongodb');
const { getDB } = require('../config/database');
const logger = require('../config/logger');

const router = express.Router();

// Validation schemas
const postSchema = Joi.object({
  title: Joi.string().min(5).max(200).required(),
  content: Joi.string().min(10).max(5000).required(),
  category: Joi.string().valid('Market Updates', 'Success Stories', 'Q&A', 'General Discussion').required(),
  tags: Joi.array().items(Joi.string().max(50)).max(10).optional()
});

const replySchema = Joi.object({
  content: Joi.string().min(5).max(2000).required()
});

// @route   GET /api/forum/posts
// @desc    Get forum posts with pagination and filters
// @access  Private
router.get('/posts', async (req, res) => {
  try {
    const { 
      category = 'All',
      search = '',
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const db = getDB();
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build filter
    let filter = {};
    if (category && category !== 'All') {
      filter.category = category;
    }
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { tags: { $elemMatch: { $regex: search, $options: 'i' } } }
      ];
    }

    // Build sort
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Get posts with user details
    const posts = await db.collection('forumPosts')
      .aggregate([
        { $match: filter },
        {
          $lookup: {
            from: 'users',
            localField: 'userId',
            foreignField: '_id',
            as: 'user'
          }
        },
        { $unwind: '$user' },
        { $sort: sort },
        { $skip: skip },
        { $limit: parseInt(limit) },
        {
          $project: {
            title: 1,
            content: 1,
            category: 1,
            tags: 1,
            likes: 1,
            commentsCount: 1,
            isAnswered: 1,
            isPinned: 1,
            createdAt: 1,
            updatedAt: 1,
            'user.contactPerson': 1,
            'user.companyName': 1,
            'user.role': 1
          }
        }
      ])
      .toArray();

    // Get total count
    const totalCount = await db.collection('forumPosts').countDocuments(filter);

    const formattedPosts = posts.map(post => ({
      id: post._id,
      title: post.title,
      content: post.content.substring(0, 200) + (post.content.length > 200 ? '...' : ''),
      category: post.category,
      tags: post.tags || [],
      likes: post.likes || 0,
      commentsCount: post.commentsCount || 0,
      isAnswered: post.isAnswered || false,
      isPinned: post.isPinned || false,
      createdAt: post.createdAt,
      author: {
        name: post.user.contactPerson,
        company: post.user.companyName,
        role: post.user.role
      }
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
        posts: formattedPosts
      },
      pagination
    });

  } catch (error) {
    logger.error('Get forum posts error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   POST /api/forum/posts
// @desc    Create a new forum post
// @access  Private
router.post('/posts', async (req, res) => {
  try {
    // Validate input
    const { error, value } = postSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    const { title, content, category, tags = [] } = value;
    const db = getDB();

    const post = {
      userId: new ObjectId(req.user._id),
      title,
      content,
      category,
      tags,
      likes: 0,
      commentsCount: 0,
      isAnswered: false,
      isPinned: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await db.collection('forumPosts').insertOne(post);

    logger.info(`User ${req.user._id} created forum post: ${title}`);

    res.status(201).json({
      success: true,
      message: 'Post created successfully',
      data: {
        id: result.insertedId,
        ...post
      }
    });

  } catch (error) {
    logger.error('Create forum post error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   GET /api/forum/posts/:id
// @desc    Get single forum post with replies
// @access  Private
router.get('/posts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const db = getDB();

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid post ID'
      });
    }

    // Get post with user details
    const post = await db.collection('forumPosts')
      .aggregate([
        { $match: { _id: new ObjectId(id) } },
        {
          $lookup: {
            from: 'users',
            localField: 'userId',
            foreignField: '_id',
            as: 'user'
          }
        },
        { $unwind: '$user' }
      ])
      .next();

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Get replies with user details
    const replies = await db.collection('forumReplies')
      .aggregate([
        { $match: { postId: new ObjectId(id) } },
        {
          $lookup: {
            from: 'users',
            localField: 'userId',
            foreignField: '_id',
            as: 'user'
          }
        },
        { $unwind: '$user' },
        { $sort: { createdAt: 1 } }
      ])
      .toArray();

    const formattedPost = {
      id: post._id,
      title: post.title,
      content: post.content,
      category: post.category,
      tags: post.tags || [],
      likes: post.likes || 0,
      commentsCount: post.commentsCount || 0,
      isAnswered: post.isAnswered || false,
      isPinned: post.isPinned || false,
      createdAt: post.createdAt,
      author: {
        name: post.user.contactPerson,
        company: post.user.companyName,
        role: post.user.role
      },
      replies: replies.map(reply => ({
        id: reply._id,
        content: reply.content,
        likes: reply.likes || 0,
        isMentorReply: reply.isMentorReply || false,
        isAcceptedAnswer: reply.isAcceptedAnswer || false,
        createdAt: reply.createdAt,
        author: {
          name: reply.user.contactPerson,
          company: reply.user.companyName,
          role: reply.user.role
        }
      }))
    };

    res.json({
      success: true,
      data: formattedPost
    });

  } catch (error) {
    logger.error('Get forum post error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   POST /api/forum/posts/:id/replies
// @desc    Add reply to forum post
// @access  Private
router.post('/posts/:id/replies', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid post ID'
      });
    }

    // Validate input
    const { error, value } = replySchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    const { content } = value;
    const db = getDB();

    // Check if post exists
    const post = await db.collection('forumPosts').findOne({ _id: new ObjectId(id) });
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    const reply = {
      postId: new ObjectId(id),
      userId: new ObjectId(req.user._id),
      content,
      likes: 0,
      isMentorReply: false, // Could be determined based on user role
      isAcceptedAnswer: false,
      createdAt: new Date()
    };

    const result = await db.collection('forumReplies').insertOne(reply);

    // Update comments count on post
    await db.collection('forumPosts').updateOne(
      { _id: new ObjectId(id) },
      { $inc: { commentsCount: 1 } }
    );

    logger.info(`User ${req.user._id} replied to forum post ${id}`);

    res.status(201).json({
      success: true,
      message: 'Reply added successfully',
      data: {
        id: result.insertedId,
        ...reply
      }
    });

  } catch (error) {
    logger.error('Add forum reply error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   POST /api/forum/posts/:id/like
// @desc    Like/unlike a forum post
// @access  Private
router.post('/posts/:id/like', async (req, res) => {
  try {
    const { id } = req.params;
    const db = getDB();

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid post ID'
      });
    }

    // For simplicity, just increment likes count
    // In a real app, you'd track individual user likes to prevent multiple likes
    const result = await db.collection('forumPosts').updateOne(
      { _id: new ObjectId(id) },
      { $inc: { likes: 1 } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    res.json({
      success: true,
      message: 'Post liked successfully'
    });

  } catch (error) {
    logger.error('Like post error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;
