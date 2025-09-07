const { ObjectId } = require('mongodb');

class Post {
  constructor(data) {
    this.userId = data.userId;
    this.title = data.title;
    this.content = data.content;
    this.category = data.category;
    this.tags = data.tags || [];
    this.likes = data.likes || 0;
    this.likedBy = data.likedBy || []; // Array of user IDs who liked this post
    this.commentsCount = data.commentsCount || 0;
    this.isAnswered = data.isAnswered || false;
    this.isPinned = data.isPinned || false;
    this.isFeatured = data.isFeatured || false;
    this.isHidden = data.isHidden || false;
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  // Validation rules
  static validate(data) {
    const errors = [];
    
    if (!data.title || data.title.length < 5 || data.title.length > 200) {
      errors.push('Title must be between 5 and 200 characters');
    }
    
    if (!data.content || data.content.length < 10 || data.content.length > 5000) {
      errors.push('Content must be between 10 and 5000 characters');
    }
    
    const validCategories = ['Market Updates', 'Success Stories', 'Q&A', 'General Discussion'];
    if (!data.category || !validCategories.includes(data.category)) {
      errors.push('Invalid category');
    }
    
    if (data.tags && (!Array.isArray(data.tags) || data.tags.length > 10)) {
      errors.push('Tags must be an array with maximum 10 items');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Create a new post
  static async create(db, postData, userId) {
    const validation = this.validate(postData);
    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '));
    }

    const post = new Post({
      ...postData,
      userId: new ObjectId(userId)
    });

    const result = await db.collection('forumPosts').insertOne(post);
    return { ...post, _id: result.insertedId };
  }

  // Get posts with filters and pagination
  static async getAll(db, options = {}) {
    const {
      category = 'All',
      search = '',
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      featured = false
    } = options;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Build filter
    let filter = { isHidden: { $ne: true } };
    
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
    
    if (featured) {
      filter.isFeatured = true;
    }

    // Build sort
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    
    // Add secondary sort by creation date for consistency
    if (sortBy !== 'createdAt') {
      sort.createdAt = -1;
    }

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
            likedBy: 1,
            commentsCount: 1,
            isAnswered: 1,
            isPinned: 1,
            isFeatured: 1,
            createdAt: 1,
            updatedAt: 1,
            'user.contactPerson': 1,
            'user.companyName': 1,
            'user.role': 1,
            'user.sector': 1
          }
        }
      ])
      .toArray();

    const totalCount = await db.collection('forumPosts').countDocuments(filter);

    return {
      posts,
      totalCount,
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalCount / parseInt(limit))
    };
  }

  // Get single post by ID
  static async getById(db, postId) {
    if (!ObjectId.isValid(postId)) {
      throw new Error('Invalid post ID');
    }

    const post = await db.collection('forumPosts')
      .aggregate([
        { $match: { _id: new ObjectId(postId), isHidden: { $ne: true } } },
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

    return post;
  }

  // Like/unlike a post
  static async toggleLike(db, postId, userId) {
    if (!ObjectId.isValid(postId)) {
      throw new Error('Invalid post ID');
    }

    const userObjectId = new ObjectId(userId);
    const post = await db.collection('forumPosts').findOne({ _id: new ObjectId(postId) });
    
    if (!post) {
      throw new Error('Post not found');
    }

    const hasLiked = post.likedBy && post.likedBy.some(id => id.equals(userObjectId));
    
    let update;
    if (hasLiked) {
      // Unlike the post
      update = {
        $pull: { likedBy: userObjectId },
        $inc: { likes: -1 }
      };
    } else {
      // Like the post
      update = {
        $addToSet: { likedBy: userObjectId },
        $inc: { likes: 1 }
      };
    }

    await db.collection('forumPosts').updateOne(
      { _id: new ObjectId(postId) },
      update
    );

    return !hasLiked; // Return new like status
  }

  // Update post
  static async update(db, postId, updateData, userId) {
    if (!ObjectId.isValid(postId)) {
      throw new Error('Invalid post ID');
    }

    // Ensure user owns the post
    const post = await db.collection('forumPosts').findOne({ 
      _id: new ObjectId(postId),
      userId: new ObjectId(userId)
    });

    if (!post) {
      throw new Error('Post not found or unauthorized');
    }

    const allowedUpdates = ['title', 'content', 'category', 'tags'];
    const update = {};
    
    for (const field of allowedUpdates) {
      if (updateData[field] !== undefined) {
        update[field] = updateData[field];
      }
    }
    
    if (Object.keys(update).length === 0) {
      throw new Error('No valid fields to update');
    }

    update.updatedAt = new Date();

    await db.collection('forumPosts').updateOne(
      { _id: new ObjectId(postId) },
      { $set: update }
    );

    return update;
  }

  // Delete post
  static async delete(db, postId, userId) {
    if (!ObjectId.isValid(postId)) {
      throw new Error('Invalid post ID');
    }

    const post = await db.collection('forumPosts').findOne({ 
      _id: new ObjectId(postId),
      userId: new ObjectId(userId)
    });

    if (!post) {
      throw new Error('Post not found or unauthorized');
    }

    // Soft delete by hiding the post
    await db.collection('forumPosts').updateOne(
      { _id: new ObjectId(postId) },
      { $set: { isHidden: true, updatedAt: new Date() } }
    );

    // Also hide all replies to this post
    await db.collection('forumReplies').updateMany(
      { postId: new ObjectId(postId) },
      { $set: { isHidden: true } }
    );

    return true;
  }

  // Get community statistics
  static async getStats(db) {
    const pipeline = [
      {
        $group: {
          _id: null,
          totalPosts: { $sum: 1 },
          totalLikes: { $sum: '$likes' },
          totalComments: { $sum: '$commentsCount' },
          categoryCounts: {
            $push: '$category'
          }
        }
      }
    ];

    const stats = await db.collection('forumPosts').aggregate(pipeline).next();
    
    // Count unique active users (posted in last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const activeUsers = await db.collection('forumPosts').distinct('userId', {
      createdAt: { $gte: thirtyDaysAgo },
      isHidden: { $ne: true }
    });

    return {
      totalPosts: stats?.totalPosts || 0,
      totalLikes: stats?.totalLikes || 0,
      totalComments: stats?.totalComments || 0,
      activeUsers: activeUsers.length,
      categoryCounts: stats?.categoryCounts || []
    };
  }
}

module.exports = Post;
