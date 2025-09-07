const { ObjectId } = require('mongodb');

class Comment {
  constructor(data) {
    this.postId = data.postId;
    this.userId = data.userId;
    this.content = data.content;
    this.likes = data.likes || 0;
    this.likedBy = data.likedBy || []; // Array of user IDs who liked this comment
    this.isMentorReply = data.isMentorReply || false;
    this.isAcceptedAnswer = data.isAcceptedAnswer || false;
    this.isHidden = data.isHidden || false;
    this.parentCommentId = data.parentCommentId || null; // For nested replies
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  // Validation rules
  static validate(data) {
    const errors = [];
    
    if (!data.content || data.content.length < 5 || data.content.length > 2000) {
      errors.push('Comment content must be between 5 and 2000 characters');
    }
    
    if (!data.postId || !ObjectId.isValid(data.postId)) {
      errors.push('Valid post ID is required');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Create a new comment
  static async create(db, commentData, userId) {
    const validation = this.validate(commentData);
    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '));
    }

    // Check if post exists
    const post = await db.collection('forumPosts').findOne({ 
      _id: new ObjectId(commentData.postId),
      isHidden: { $ne: true }
    });
    
    if (!post) {
      throw new Error('Post not found');
    }

    // Check if parent comment exists (for nested replies)
    if (commentData.parentCommentId) {
      const parentComment = await db.collection('forumReplies').findOne({
        _id: new ObjectId(commentData.parentCommentId),
        isHidden: { $ne: true }
      });
      
      if (!parentComment) {
        throw new Error('Parent comment not found');
      }
    }

    const comment = new Comment({
      ...commentData,
      postId: new ObjectId(commentData.postId),
      userId: new ObjectId(userId),
      parentCommentId: commentData.parentCommentId ? new ObjectId(commentData.parentCommentId) : null
    });

    const result = await db.collection('forumReplies').insertOne(comment);

    // Update comments count on post
    await db.collection('forumPosts').updateOne(
      { _id: new ObjectId(commentData.postId) },
      { $inc: { commentsCount: 1 } }
    );

    return { ...comment, _id: result.insertedId };
  }

  // Get comments for a post
  static async getByPostId(db, postId, options = {}) {
    if (!ObjectId.isValid(postId)) {
      throw new Error('Invalid post ID');
    }

    const {
      page = 1,
      limit = 50,
      sortBy = 'createdAt',
      sortOrder = 'asc'
    } = options;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Build sort
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const comments = await db.collection('forumReplies')
      .aggregate([
        { 
          $match: { 
            postId: new ObjectId(postId),
            isHidden: { $ne: true }
          } 
        },
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
            content: 1,
            likes: 1,
            likedBy: 1,
            isMentorReply: 1,
            isAcceptedAnswer: 1,
            parentCommentId: 1,
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

    // Organize comments into threads (parent comments with nested replies)
    const parentComments = comments.filter(c => !c.parentCommentId);
    const nestedReplies = comments.filter(c => c.parentCommentId);

    // Add nested replies to their parent comments
    const threaded = parentComments.map(parent => ({
      ...parent,
      replies: nestedReplies
        .filter(reply => reply.parentCommentId.equals(parent._id))
        .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    }));

    const totalCount = await db.collection('forumReplies').countDocuments({
      postId: new ObjectId(postId),
      isHidden: { $ne: true }
    });

    return {
      comments: threaded,
      totalCount,
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalCount / parseInt(limit))
    };
  }

  // Like/unlike a comment
  static async toggleLike(db, commentId, userId) {
    if (!ObjectId.isValid(commentId)) {
      throw new Error('Invalid comment ID');
    }

    const userObjectId = new ObjectId(userId);
    const comment = await db.collection('forumReplies').findOne({ _id: new ObjectId(commentId) });
    
    if (!comment) {
      throw new Error('Comment not found');
    }

    const hasLiked = comment.likedBy && comment.likedBy.some(id => id.equals(userObjectId));
    
    let update;
    if (hasLiked) {
      // Unlike the comment
      update = {
        $pull: { likedBy: userObjectId },
        $inc: { likes: -1 }
      };
    } else {
      // Like the comment
      update = {
        $addToSet: { likedBy: userObjectId },
        $inc: { likes: 1 }
      };
    }

    await db.collection('forumReplies').updateOne(
      { _id: new ObjectId(commentId) },
      update
    );

    return !hasLiked; // Return new like status
  }

  // Update comment
  static async update(db, commentId, updateData, userId) {
    if (!ObjectId.isValid(commentId)) {
      throw new Error('Invalid comment ID');
    }

    // Ensure user owns the comment
    const comment = await db.collection('forumReplies').findOne({ 
      _id: new ObjectId(commentId),
      userId: new ObjectId(userId)
    });

    if (!comment) {
      throw new Error('Comment not found or unauthorized');
    }

    const allowedUpdates = ['content'];
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

    await db.collection('forumReplies').updateOne(
      { _id: new ObjectId(commentId) },
      { $set: update }
    );

    return update;
  }

  // Delete comment
  static async delete(db, commentId, userId) {
    if (!ObjectId.isValid(commentId)) {
      throw new Error('Invalid comment ID');
    }

    const comment = await db.collection('forumReplies').findOne({ 
      _id: new ObjectId(commentId),
      userId: new ObjectId(userId)
    });

    if (!comment) {
      throw new Error('Comment not found or unauthorized');
    }

    // Soft delete by hiding the comment
    await db.collection('forumReplies').updateOne(
      { _id: new ObjectId(commentId) },
      { $set: { isHidden: true, updatedAt: new Date() } }
    );

    // Update comments count on post
    await db.collection('forumPosts').updateOne(
      { _id: comment.postId },
      { $inc: { commentsCount: -1 } }
    );

    return true;
  }

  // Mark comment as accepted answer (for Q&A posts)
  static async markAsAccepted(db, commentId, postOwnerId) {
    if (!ObjectId.isValid(commentId)) {
      throw new Error('Invalid comment ID');
    }

    const comment = await db.collection('forumReplies').findOne({ 
      _id: new ObjectId(commentId),
      isHidden: { $ne: true }
    });

    if (!comment) {
      throw new Error('Comment not found');
    }

    // Check if the user owns the post
    const post = await db.collection('forumPosts').findOne({ 
      _id: comment.postId,
      userId: new ObjectId(postOwnerId)
    });

    if (!post) {
      throw new Error('Only post owner can mark answers as accepted');
    }

    // Remove accepted status from all other comments on this post
    await db.collection('forumReplies').updateMany(
      { postId: comment.postId },
      { $set: { isAcceptedAnswer: false } }
    );

    // Mark this comment as accepted
    await db.collection('forumReplies').updateOne(
      { _id: new ObjectId(commentId) },
      { $set: { isAcceptedAnswer: true } }
    );

    // Mark the post as answered
    await db.collection('forumPosts').updateOne(
      { _id: comment.postId },
      { $set: { isAnswered: true } }
    );

    return true;
  }

  // Get user's recent comments
  static async getUserComments(db, userId, options = {}) {
    const {
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = options;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const comments = await db.collection('forumReplies')
      .aggregate([
        { 
          $match: { 
            userId: new ObjectId(userId),
            isHidden: { $ne: true }
          } 
        },
        {
          $lookup: {
            from: 'forumPosts',
            localField: 'postId',
            foreignField: '_id',
            as: 'post'
          }
        },
        { $unwind: '$post' },
        { $sort: sort },
        { $skip: skip },
        { $limit: parseInt(limit) },
        {
          $project: {
            content: 1,
            likes: 1,
            isAcceptedAnswer: 1,
            createdAt: 1,
            'post.title': 1,
            'post.category': 1
          }
        }
      ])
      .toArray();

    const totalCount = await db.collection('forumReplies').countDocuments({
      userId: new ObjectId(userId),
      isHidden: { $ne: true }
    });

    return {
      comments,
      totalCount,
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalCount / parseInt(limit))
    };
  }
}

module.exports = Comment;
