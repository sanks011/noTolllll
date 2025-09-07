const express = require('express');
const Joi = require('joi');
const { ObjectId } = require('mongodb');
const { getDB } = require('../config/database');
const logger = require('../config/logger');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authMiddleware);

// Validation schemas
const postSchema = Joi.object({
  title: Joi.string().min(5).max(200).required(),
  content: Joi.string().min(10).max(5000).required(),
  category: Joi.string().valid('Market Updates', 'Success Stories', 'Q&A', 'General Discussion').required(),
  tags: Joi.array().items(Joi.string().max(50)).max(10).optional()
});

const commentSchema = Joi.object({
  content: Joi.string().min(5).max(2000).required(),
  parentCommentId: Joi.string().optional()
});

// @route   GET /api/forum/posts
// @desc    Get forum posts with pagination and filters
// @access  Private
router.get('/posts', async (req, res) => {
  try {
    const options = {
      category: req.query.category || 'All',
      search: req.query.search || '',
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 20,
      sortBy: req.query.sortBy || 'createdAt',
      sortOrder: req.query.sortOrder || 'desc',
      featured: req.query.featured === 'true'
    };

    const db = getDB();
    const result = await Post.getAll(db, options);

    const formattedPosts = result.posts.map(post => ({
      id: post._id,
      title: post.title,
      content: post.content.substring(0, 200) + (post.content.length > 200 ? '...' : ''),
      category: post.category,
      tags: post.tags || [],
      likes: post.likes || 0,
      commentsCount: post.commentsCount || 0,
      isAnswered: post.isAnswered || false,
      isPinned: post.isPinned || false,
      isFeatured: post.isFeatured || false,
      createdAt: post.createdAt,
      timeAgo: getTimeAgo(post.createdAt),
      isLiked: post.likedBy ? post.likedBy.some(id => id.equals(new ObjectId(req.user._id))) : false,
      author: {
        name: post.user.contactPerson,
        company: post.user.companyName,
        role: post.user.role,
        sector: post.user.sector,
        avatar: `/api/users/${post.userId}/avatar`
      }
    }));

    const pagination = {
      currentPage: result.currentPage,
      totalPages: result.totalPages,
      totalRecords: result.totalCount,
      hasNext: result.currentPage < result.totalPages,
      hasPrev: result.currentPage > 1
    };

    res.json({
      success: true,
      data: {
        posts: formattedPosts,
        pagination
      }
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

    const db = getDB();
    const post = await Post.create(db, value, req.user._id);

    logger.info(`User ${req.user._id} created forum post: ${value.title}`);

    res.status(201).json({
      success: true,
      message: 'Post created successfully',
      data: {
        id: post._id,
        title: post.title,
        category: post.category
      }
    });

  } catch (error) {
    logger.error('Create forum post error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error'
    });
  }
});

// @route   GET /api/forum/posts/:id
// @desc    Get single forum post with comments
// @access  Private
router.get('/posts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const db = getDB();

    const post = await Post.getById(db, id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Get comments for this post
    const commentsResult = await Comment.getByPostId(db, id);

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
      isFeatured: post.isFeatured || false,
      createdAt: post.createdAt,
      timeAgo: getTimeAgo(post.createdAt),
      isLiked: post.likedBy ? post.likedBy.some(id => id.equals(new ObjectId(req.user._id))) : false,
      isOwner: post.userId.equals(new ObjectId(req.user._id)),
      author: {
        name: post.user.contactPerson,
        company: post.user.companyName,
        role: post.user.role,
        sector: post.user.sector,
        avatar: `/api/users/${post.userId}/avatar`
      },
      comments: commentsResult.comments.map(comment => ({
        id: comment._id,
        content: comment.content,
        likes: comment.likes || 0,
        isMentorReply: comment.isMentorReply || false,
        isAcceptedAnswer: comment.isAcceptedAnswer || false,
        createdAt: comment.createdAt,
        timeAgo: getTimeAgo(comment.createdAt),
        isLiked: comment.likedBy ? comment.likedBy.some(id => id.equals(new ObjectId(req.user._id))) : false,
        isOwner: comment.userId.equals(new ObjectId(req.user._id)),
        author: {
          name: comment.user.contactPerson,
          company: comment.user.companyName,
          role: comment.user.role,
          sector: comment.user.sector,
          avatar: `/api/users/${comment.userId}/avatar`
        },
        replies: comment.replies ? comment.replies.map(reply => ({
          id: reply._id,
          content: reply.content,
          likes: reply.likes || 0,
          createdAt: reply.createdAt,
          timeAgo: getTimeAgo(reply.createdAt),
          isLiked: reply.likedBy ? reply.likedBy.some(id => id.equals(new ObjectId(req.user._id))) : false,
          isOwner: reply.userId.equals(new ObjectId(req.user._id)),
          author: {
            name: reply.user.contactPerson,
            company: reply.user.companyName,
            role: reply.user.role,
            sector: reply.user.sector,
            avatar: `/api/users/${reply.userId}/avatar`
          }
        })) : []
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
      message: error.message || 'Internal server error'
    });
  }
});

// @route   POST /api/forum/posts/:id/comments
// @desc    Add comment to forum post
// @access  Private
router.post('/posts/:id/comments', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate input
    const { error, value } = commentSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    const db = getDB();
    const commentData = {
      ...value,
      postId: id
    };

    const comment = await Comment.create(db, commentData, req.user._id);

    logger.info(`User ${req.user._id} commented on forum post ${id}`);

    res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      data: {
        id: comment._id,
        content: comment.content,
        createdAt: comment.createdAt
      }
    });

  } catch (error) {
    logger.error('Add forum comment error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error'
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

    const isLiked = await Post.toggleLike(db, id, req.user._id);

    res.json({
      success: true,
      message: isLiked ? 'Post liked successfully' : 'Post unliked successfully',
      data: {
        isLiked
      }
    });

  } catch (error) {
    logger.error('Like post error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error'
    });
  }
});

// @route   POST /api/forum/comments/:id/like
// @desc    Like/unlike a comment
// @access  Private
router.post('/comments/:id/like', async (req, res) => {
  try {
    const { id } = req.params;
    const db = getDB();

    const isLiked = await Comment.toggleLike(db, id, req.user._id);

    res.json({
      success: true,
      message: isLiked ? 'Comment liked successfully' : 'Comment unliked successfully',
      data: {
        isLiked
      }
    });

  } catch (error) {
    logger.error('Like comment error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error'
    });
  }
});

// @route   PUT /api/forum/posts/:id
// @desc    Update a forum post
// @access  Private
router.put('/posts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate input
    const { error, value } = postSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    const db = getDB();
    await Post.update(db, id, value, req.user._id);

    logger.info(`User ${req.user._id} updated forum post ${id}`);

    res.json({
      success: true,
      message: 'Post updated successfully'
    });

  } catch (error) {
    logger.error('Update forum post error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error'
    });
  }
});

// @route   DELETE /api/forum/posts/:id
// @desc    Delete a forum post
// @access  Private
router.delete('/posts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const db = getDB();

    await Post.delete(db, id, req.user._id);

    logger.info(`User ${req.user._id} deleted forum post ${id}`);

    res.json({
      success: true,
      message: 'Post deleted successfully'
    });

  } catch (error) {
    logger.error('Delete forum post error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error'
    });
  }
});

// @route   PUT /api/forum/comments/:id
// @desc    Update a comment
// @access  Private
router.put('/comments/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    if (!content || content.length < 5 || content.length > 2000) {
      return res.status(400).json({
        success: false,
        message: 'Comment content must be between 5 and 2000 characters'
      });
    }

    const db = getDB();
    await Comment.update(db, id, { content }, req.user._id);

    logger.info(`User ${req.user._id} updated comment ${id}`);

    res.json({
      success: true,
      message: 'Comment updated successfully'
    });

  } catch (error) {
    logger.error('Update comment error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error'
    });
  }
});

// @route   DELETE /api/forum/comments/:id
// @desc    Delete a comment
// @access  Private
router.delete('/comments/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const db = getDB();

    await Comment.delete(db, id, req.user._id);

    logger.info(`User ${req.user._id} deleted comment ${id}`);

    res.json({
      success: true,
      message: 'Comment deleted successfully'
    });

  } catch (error) {
    logger.error('Delete comment error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error'
    });
  }
});

// @route   POST /api/forum/comments/:id/accept
// @desc    Mark comment as accepted answer
// @access  Private
router.post('/comments/:id/accept', async (req, res) => {
  try {
    const { id } = req.params;
    const db = getDB();

    await Comment.markAsAccepted(db, id, req.user._id);

    logger.info(`User ${req.user._id} marked comment ${id} as accepted answer`);

    res.json({
      success: true,
      message: 'Answer marked as accepted successfully'
    });

  } catch (error) {
    logger.error('Accept answer error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error'
    });
  }
});

// @route   GET /api/forum/stats
// @desc    Get community statistics
// @access  Private
router.get('/stats', async (req, res) => {
  try {
    const db = getDB();
    const stats = await Post.getStats(db);

    // Count category distribution
    const categoryStats = {};
    stats.categoryCounts.forEach(category => {
      categoryStats[category] = (categoryStats[category] || 0) + 1;
    });

    res.json({
      success: true,
      data: {
        totalPosts: stats.totalPosts,
        totalLikes: stats.totalLikes,
        totalComments: stats.totalComments,
        activeMembers: stats.activeUsers,
        categoryDistribution: categoryStats
      }
    });

  } catch (error) {
    logger.error('Get forum stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   GET /api/forum/categories
// @desc    Get available categories with counts
// @access  Private
router.get('/categories', async (req, res) => {
  try {
    const db = getDB();
    
    const categories = await db.collection('forumPosts').aggregate([
      { $match: { isHidden: { $ne: true } } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]).toArray();

    const formattedCategories = categories.map(cat => ({
      name: cat._id,
      count: cat.count
    }));

    res.json({
      success: true,
      data: formattedCategories
    });

  } catch (error) {
    logger.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   GET /api/forum/my-posts
// @desc    Get current user's posts
// @access  Private
router.get('/my-posts', async (req, res) => {
  try {
    const options = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 10,
      sortBy: req.query.sortBy || 'createdAt',
      sortOrder: req.query.sortOrder || 'desc'
    };

    const db = getDB();
    const filter = { userId: new ObjectId(req.user._id), isHidden: { $ne: true } };

    const posts = await db.collection('forumPosts')
      .find(filter)
      .sort({ [options.sortBy]: options.sortOrder === 'desc' ? -1 : 1 })
      .skip((options.page - 1) * options.limit)
      .limit(options.limit)
      .toArray();

    const totalCount = await db.collection('forumPosts').countDocuments(filter);

    const formattedPosts = posts.map(post => ({
      id: post._id,
      title: post.title,
      category: post.category,
      likes: post.likes || 0,
      commentsCount: post.commentsCount || 0,
      isAnswered: post.isAnswered || false,
      createdAt: post.createdAt,
      timeAgo: getTimeAgo(post.createdAt)
    }));

    res.json({
      success: true,
      data: {
        posts: formattedPosts,
        pagination: {
          currentPage: options.page,
          totalPages: Math.ceil(totalCount / options.limit),
          totalRecords: totalCount
        }
      }
    });

  } catch (error) {
    logger.error('Get user posts error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Helper function to format time ago
function getTimeAgo(date) {
  const now = new Date();
  const diffInSeconds = Math.floor((now - new Date(date)) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)} months ago`;
  return `${Math.floor(diffInSeconds / 31536000)} years ago`;
}

module.exports = router;
