import Post from '../models/Post.js';
import mongoose from 'mongoose';
import Category from '../models/Category.js';
import Notification from '../models/Notification.js';
import Download from '../models/Download.js';
import Aura from '../models/Aura.js';
import logger from '../middlewares/logger.js';
import redis from '../config/redis.js';
import { logActivity, sendNotification, emitGlobalEvent } from '../utils/tracker.js';

// @desc    Get all posts (with pagination, filtering, and Atlas Search)
// @route   GET /api/posts
// @access  Public
export const getPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 12;
    const skip = (page - 1) * limit;

    // Cache key based on query
    const cacheKey = `posts:${JSON.stringify(req.query)}`;
    
    // Check cache — skip for category queries to prevent stale results
    if (!req.query.category) {
      const cachedData = await redis.get(cacheKey);
      if (cachedData) {
        return res.status(200).json(JSON.parse(cachedData));
      }
    }

    let matchStage = { status: { $in: ['Published', 'Active'] }, isDeleted: { $ne: true } };

    // Filtering by category
    if (req.query.category) {
      if (mongoose.isValidObjectId(req.query.category)) {
        matchStage.category = new mongoose.Types.ObjectId(req.query.category);
      } else {
        const cat = await Category.findOne({ slug: req.query.category });
        if (cat) {
          matchStage.category = cat._id;
        } else {
          matchStage.category = null; // No matching category slug
        }
      }
    }

    // Advanced search filters
    if (req.query.subCategory) {
      if (mongoose.isValidObjectId(req.query.subCategory)) {
        matchStage.subCategory = new mongoose.Types.ObjectId(req.query.subCategory);
      } else {
        const subCat = await Category.findOne({ slug: req.query.subCategory });
        if (subCat) {
          matchStage.subCategory = subCat._id;
        } else {
          matchStage.subCategory = null;
        }
      }
    }
    if (req.query.rating) matchStage.averageRating = { $gte: Number(req.query.rating) };
    if (req.query.freeOnly === 'true') matchStage.price = 'Free';
    if (req.query.premiumOnly === 'true') matchStage.visibilityStatus = 'Premium Only';

    // Status filtering
    if (req.query.isTrending === 'true') matchStage.isTrending = true;
    if (req.query.isFeatured === 'true') matchStage.isFeatured = true;
    if (req.query.isPopular === 'true') matchStage.isPopular = true;
    if (req.query.editorChoice === 'true') matchStage.editorChoice = true;

    // Visibility Control
    matchStage.visibilityStatus = { $ne: 'Hidden' };

    let pipeline = [];

    // Standard Regex Search (Fallback for Atlas Search)
    if (req.query.search) {
      matchStage.$or = [
        { title: { $regex: req.query.search, $options: 'i' } },
        { tags: { $regex: req.query.search, $options: 'i' } },
        { publisher: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    // Match Stage
    pipeline.push({ $match: matchStage });

    // Lookup Category to populate
    pipeline.push({
      $lookup: {
        from: 'categories',
        localField: 'category',
        foreignField: '_id',
        as: 'categoryObj'
      }
    });

    // Unwind category
    pipeline.push({ $unwind: { path: '$categoryObj', preserveNullAndEmptyArrays: true } });

    // Sort Stage
    if (!req.query.search) {
      if (req.query.sort === '-updateDate') {
        pipeline.push({ $sort: { updateDate: -1, createdAt: -1 } });
      } else if (req.query.sort === '-downloads') {
        pipeline.push({ $sort: { downloads: -1, createdAt: -1 } });
      } else {
        pipeline.push({ $sort: { createdAt: -1 } });
      }
    }

    // Pagination Pipeline
    const facetPipeline = [
      {
        $facet: {
          metadata: [{ $count: "total" }, { $addFields: { page } }],
          data: [{ $skip: skip }, { $limit: limit }]
        }
      }
    ];

    pipeline = pipeline.concat(facetPipeline);
    
    if (req.query.category) {
      logger.info('Pipeline with category: ' + JSON.stringify(pipeline, null, 2));
    }

    const result = await Post.aggregate(pipeline);
    
    const data = result[0].data;
    const metadata = result[0].metadata[0] || { total: 0, page };
    const totalPages = Math.ceil(metadata.total / limit);

    const responsePayload = {
      success: true,
      count: data.length,
      pagination: {
        page,
        limit,
        totalPages,
        totalItems: metadata.total
      },
      data
    };

    // Save to cache for 1 hour
    await redis.setex(cacheKey, 3600, JSON.stringify(responsePayload));

    res.status(200).json(responsePayload);
  } catch (error) {
    logger.error(`Get Posts Error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Get single post by slug
// @route   GET /api/posts/:slug
// @access  Public
export const getPostBySlug = async (req, res) => {
  try {
    const cacheKey = `post:${req.params.slug}`;
    const cachedData = await redis.get(cacheKey);
    if (cachedData) {
      // Background async update to views
      Post.findByIdAndUpdate(JSON.parse(cachedData).data._id, { $inc: { views: 1 } }).exec();
      return res.status(200).json(JSON.parse(cachedData));
    }

    const post = await Post.findOne({ 
      slug: req.params.slug, 
      status: { $in: ['Published', 'Active', 'Under Development'] },
      visibilityStatus: { $ne: 'Hidden' },
      isDeleted: { $ne: true }
    }).populate('category', 'name slug').populate('subCategory', 'name slug');

    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    if (post.visibilityStatus === 'Admin Only') {
      const isAdmin = req.user && ['admin', 'superadmin'].includes(req.user.role);
      if (!isAdmin) return res.status(403).json({ success: false, message: 'Admin access required' });
    }

    // Increment views
    post.views += 1;
    await post.save({ validateBeforeSave: false });

    const responsePayload = { success: true, data: post };
    await redis.setex(cacheKey, 3600, JSON.stringify(responsePayload));

    res.status(200).json(responsePayload);
  } catch (error) {
    logger.error(`Get Post Error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
// @desc    Get single post by ID
// @route   GET /api/posts/id/:id
// @access  Public
export const getPostById = async (req, res) => {
  try {
    const post = await Post.findOne({ _id: req.params.id, isDeleted: { $ne: true } }).populate('category', 'name slug');
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }
    res.status(200).json({ success: true, data: post });
  } catch (error) {
    logger.error(`Get Post By ID Error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
// @desc    Create new post
// @route   POST /api/posts
// @access  Private/Admin
export const createPost = async (req, res) => {
  try {
    req.body.author = req.user._id;

    const post = await Post.create(req.body);
    
    // Invalidate cache
    await invalidatePostCache();
    
    res.status(201).json({ success: true, data: post });
  } catch (error) {
    logger.error(`Create Post Error: ${error.message}`);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Post slug already exists' });
    }
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Update post
// @route   PUT /api/posts/:id
// @access  Private/Admin
export const updatePost = async (req, res) => {
  try {
    let post = await Post.findOne({ _id: req.params.id, isDeleted: { $ne: true } });

    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    post = await Post.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    // Invalidate cache
    await invalidatePostCache(post.slug);

    if (post.status === 'Published') {
      emitGlobalEvent('newAppRelease', {
        title: post.title,
        message: `Version ${post.version || '1.0'} is now available!`,
        slug: post.slug,
        appLogo: post.appLogo
      });
    }

    res.status(200).json({ success: true, data: post });
  } catch (error) {
    logger.error(`Update Post Error: ${error.message}`);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Post slug already exists' });
    }
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Delete post
// @route   DELETE /api/posts/:id
// @access  Private/Admin
export const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    const slug = post.slug;
    
    // SOFT DELETE
    post.isDeleted = true;
    post.deletedAt = new Date();
    await post.save();
    
    // Invalidate cache
    await invalidatePostCache(slug);
    
    res.status(200).json({ success: true, message: 'Post moved to trash' });
  } catch (error) {
    logger.error(`Delete Post Error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Rate a post
// @route   POST /api/posts/:id/rate
// @access  Private
export const ratePost = async (req, res) => {
  try {
    const { rating } = req.body;
    if (rating < 1 || rating > 5) return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5' });
    
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    // Simple averaging (for production, track user ratings separately)
    post.averageRating = ((post.averageRating * post.totalVotes) + rating) / (post.totalVotes + 1);
    post.totalVotes += 1;
    
    await post.save({ validateBeforeSave: false });
    res.status(200).json({ success: true, data: post });
  } catch (error) {
    logger.error(`Rate Post Error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Track a download link click
// @route   POST /api/posts/:id/download/:linkId
// @access  Public
export const incrementDownload = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    const link = post.downloadLinks.id(req.params.linkId);
    if (!link) return res.status(404).json({ success: false, message: 'Link not found' });

    // Enforce Premium Behaviour
    if (link.type === 'premium') {
      const isPremiumUser = req.user && (req.user.role === 'premium_user' || req.user.role === 'admin' || req.user.role === 'superadmin');
      if (!isPremiumUser) {
         return res.status(403).json({ success: false, message: 'Upgrade to Premium Membership to access this link.' });
      }
    }

    if (!link.isActive) {
      return res.status(400).json({ success: false, message: 'This link is currently disabled.' });
    }

    const isAdmin = req.user && ['admin', 'superadmin'].includes(req.user.role);

    if (!isAdmin) {
      // Increment counters
      link.clickCount += 1;
      post.downloads += 1;
      await post.save({ validateBeforeSave: false });

      // Log detailed tracking
      const downloadRecord = await Download.create({
        user: req.user ? req.user._id : null,
        post: post._id,
        downloadLink: link._id,
        ipAddress: req.ip || req.headers['x-forwarded-for'],
        userAgent: req.headers['user-agent']
      });

      if (req.user) {
        await logActivity(req.user._id, 'Download', `Downloaded ${post.title} via ${link.label || 'Direct Link'}`, req, { postId: post._id });
      }
      
      // Emit live download event
      try {
        const { emitAdminEvent } = await import('../utils/tracker.js');
        emitAdminEvent('liveDownload', {
          appId: post._id,
          appName: post.title,
          mirror: link.label || 'Direct Link',
          type: link.type,
          user: req.user ? req.user.name : 'Guest',
          timestamp: downloadRecord.createdAt
        });
      } catch (e) {}
    }
    
    res.status(200).json({ success: true, message: 'Download tracked', data: { url: link.url } });
  } catch (error) {
    logger.error(`Download Increment Error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Search posts (Instant search)
// @route   GET /api/posts/search
// @access  Public
export const searchPosts = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.status(200).json({ success: true, data: [] });

    const posts = await Post.find({
      status: 'Published',
      isDeleted: { $ne: true },
      $or: [
        { title: { $regex: q, $options: 'i' } },
        { tags: { $regex: q, $options: 'i' } },
        { publisher: { $regex: q, $options: 'i' } }
      ]
    })
    .select('title slug appLogo category downloads rating isPremium')
    .populate('category', 'name slug')
    .limit(8);

    res.status(200).json({ success: true, data: posts });
  } catch (error) {
    logger.error(`Search Posts Error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Get related posts
// @route   GET /api/posts/related/:id
// @access  Public
export const getRelatedPosts = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    const related = await Post.find({
      _id: { $ne: post._id },
      status: 'Published',
      isDeleted: { $ne: true },
      $or: [
        { category: post.category },
        { tags: { $in: post.tags } },
        { publisher: post.publisher }
      ]
    })
    .select('title slug appLogo category downloads rating isPremium')
    .populate('category', 'name slug')
    .limit(4);

    res.status(200).json({ success: true, data: related });
  } catch (error) {
    logger.error(`Related Posts Error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Get AI "For You" Recommendations
// @route   GET /api/posts/recommendations
// @access  Private
export const getForYouRecommendations = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // 1. Fetch user's vibe history from Aura collection
    const mongoose = (await import('mongoose')).default;
    const Aura = (await import('../models/Aura.js')).default;
    
    const vibeHistory = await Aura.find({ 'voters.userId': userId, itemType: 'post' }).lean();
    
    let recommendedPosts = [];
    
    if (vibeHistory.length > 0) {
      // 2. Extract item IDs the user vibed to
      const vibedItemIds = vibeHistory.map(a => a.itemId);
      
      // 3. Find categories of these items
      const vibedPosts = await Post.find({ _id: { $in: vibedItemIds } }).select('category').lean();
      const categoryIds = [...new Set(vibedPosts.map(p => p.category?.toString()).filter(Boolean))];
      
      // 4. Sample posts from these categories that the user HAS NOT vibed to
      recommendedPosts = await Post.aggregate([
        { 
          $match: { 
            status: 'Published', 
            isDeleted: { $ne: true },
            category: { $in: categoryIds.map(id => new mongoose.Types.ObjectId(id)) },
            _id: { $nin: vibedItemIds.map(id => new mongoose.Types.ObjectId(id)) }
          }
        },
        { $sample: { size: 8 } },
        {
          $lookup: {
            from: 'categories',
            localField: 'category',
            foreignField: '_id',
            as: 'categoryObj'
          }
        },
        { $unwind: { path: '$categoryObj', preserveNullAndEmptyArrays: true } },
        {
          $project: {
            title: 1, slug: 1, appLogo: 1, downloads: 1, averageRating: 1, isPremium: 1, 'categoryObj.name': 1, 'categoryObj.slug': 1
          }
        }
      ]);
    }
    
    // 5. Fallback: If not enough recommendations, pad with trending posts
    if (recommendedPosts.length < 8) {
      const remaining = 8 - recommendedPosts.length;
      const excludeIds = recommendedPosts.map(p => p._id);
      if (vibeHistory.length > 0) excludeIds.push(...vibeHistory.map(a => new mongoose.Types.ObjectId(a.itemId)));
      
      const trending = await Post.aggregate([
        {
          $match: {
            status: 'Published',
            isDeleted: { $ne: true },
            isTrending: true,
            _id: { $nin: excludeIds }
          }
        },
        { $sample: { size: remaining } },
        {
          $lookup: {
            from: 'categories',
            localField: 'category',
            foreignField: '_id',
            as: 'categoryObj'
          }
        },
        { $unwind: { path: '$categoryObj', preserveNullAndEmptyArrays: true } },
        {
          $project: {
            title: 1, slug: 1, appLogo: 1, downloads: 1, averageRating: 1, isPremium: 1, 'categoryObj.name': 1, 'categoryObj.slug': 1
          }
        }
      ]);
      
      recommendedPosts = [...recommendedPosts, ...trending];
    }

    // Standardize object structure
    const formatted = recommendedPosts.map(p => ({
      ...p,
      category: p.categoryObj
    }));

    res.status(200).json({ success: true, data: formatted });
  } catch (error) {
    logger.error(`For You Recommendations Error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// Helper to invalidate cache
const invalidatePostCache = async (slug = null) => {
  try {
    const keys = await redis.keys('posts:*');
    if (keys.length > 0) {
      await redis.del(keys);
    }
    if (slug) {
      await redis.del(`post:${slug}`);
    }
  } catch (err) {
    logger.error(`Redis Invalidate Error: ${err.message}`);
  }
};

// @desc    Get all posts for Admin (no status filter)
// @route   GET /api/posts/admin/all
// @access  Private/Admin
export const getAdminPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 50;
    const skip = (page - 1) * limit;

    let matchStage = { isDeleted: { $ne: true } };
    if (req.query.status) {
      matchStage.status = req.query.status;
    }
    if (req.query.search) {
      matchStage.title = { $regex: req.query.search, $options: 'i' };
    }

    const total = await Post.countDocuments(matchStage);
    const posts = await Post.find(matchStage)
      .populate('category', 'name')
      .populate('moderatedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      data: posts,
      pagination: {
        page, limit, totalItems: total, totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    logger.error(`Get Admin Posts Error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Moderate a post (Approve/Reject/etc)
// @route   PUT /api/posts/:id/moderate
// @access  Private/Admin
export const moderatePost = async (req, res) => {
  try {
    const { status, rejectionReason } = req.body;
    
    const validStatuses = ['Draft', 'Pending Approval', 'Published', 'Under Development', 'Rejected', 'Scheduled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    post.status = status;
    post.moderatedBy = req.user._id;
    post.moderationTimestamp = Date.now();
    
    if (status === 'Rejected') {
      post.rejectionReason = rejectionReason;
    } else {
      post.rejectionReason = undefined;
    }

    await post.save();
    await invalidatePostCache(post.slug);

    res.status(200).json({ success: true, data: post });
  } catch (error) {
    logger.error(`Moderate Post Error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};


// Helper removed in favor of global sendNotification

// @desc    Approve post
// @route   PUT /api/posts/:id/approve
// @access  Private/Admin
export const approvePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    post.status = 'Published';
    post.moderatedBy = req.user._id;
    post.moderationTimestamp = Date.now();
    post.rejectionReason = undefined;
    
    await post.save();
    await invalidatePostCache(post.slug);

    await sendNotification(post.author, 'Post Approved', `Your post "${post.title}" has been approved and published.`, 'MODERATION', 'CheckCircle', `/post/${post.slug}`);

    emitGlobalEvent('newAppRelease', {
      title: post.title,
      message: `A new app "${post.title}" has been released!`,
      slug: post.slug,
      appLogo: post.appLogo
    });

    res.status(200).json({ success: true, data: post });
  } catch (error) {
    logger.error(`Approve Post Error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Reject post
// @route   PUT /api/posts/:id/reject
// @access  Private/Admin
export const rejectPost = async (req, res) => {
  try {
    const { rejectionReason } = req.body;
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    post.status = 'Rejected';
    post.moderatedBy = req.user._id;
    post.moderationTimestamp = Date.now();
    post.rejectionReason = rejectionReason;
    
    await post.save();
    await invalidatePostCache(post.slug);

    await sendNotification(post.author, 'Post Rejected', `Your post "${post.title}" was rejected. Reason: ${rejectionReason}`, 'MODERATION', 'XCircle');

    res.status(200).json({ success: true, data: post });
  } catch (error) {
    logger.error(`Reject Post Error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Mark post under development
// @route   PUT /api/posts/:id/under-development
// @access  Private/Admin
export const markUnderDevelopment = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    post.status = 'Under Development';
    post.moderatedBy = req.user._id;
    post.moderationTimestamp = Date.now();
    
    await post.save();
    await invalidatePostCache(post.slug);

    await sendNotification(post.author, 'Post Under Development', `Your post "${post.title}" has been marked as Under Development.`, 'MODERATION', 'Clock');

    res.status(200).json({ success: true, data: post });
  } catch (error) {
    logger.error(`Under Development Post Error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Schedule post
// @route   PUT /api/posts/:id/schedule
// @access  Private/Admin
export const schedulePost = async (req, res) => {
  try {
    const { scheduledPublishDate } = req.body;
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    post.status = 'Scheduled';
    post.moderatedBy = req.user._id;
    post.moderationTimestamp = Date.now();
    post.scheduledPublishDate = scheduledPublishDate;
    
    await post.save();
    await invalidatePostCache(post.slug);

    await sendNotification(post.author, 'Post Scheduled', `Your post "${post.title}" has been scheduled for publishing.`, 'MODERATION', 'Calendar');

    res.status(200).json({ success: true, data: post });
  } catch (error) {
    logger.error(`Schedule Post Error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// ================= DOWNLOAD LINK MANAGEMENT =================

// @desc    Add Download Link
export const addDownloadLink = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    post.downloadLinks.push(req.body);
    await post.save();
    await invalidatePostCache(post.slug);

    res.status(201).json({ success: true, data: post.downloadLinks });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Update Download Link
export const updateDownloadLink = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    const link = post.downloadLinks.id(req.params.linkId);
    if (!link) return res.status(404).json({ success: false, message: 'Link not found' });

    Object.assign(link, req.body);
    await post.save();
    await invalidatePostCache(post.slug);

    res.status(200).json({ success: true, data: post.downloadLinks });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Delete Download Link
export const deleteDownloadLink = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    post.downloadLinks.pull({ _id: req.params.linkId });
    await post.save();
    await invalidatePostCache(post.slug);

    res.status(200).json({ success: true, data: post.downloadLinks });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Toggle Link Status
export const toggleDownloadLink = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    const link = post.downloadLinks.id(req.params.linkId);
    if (!link) return res.status(404).json({ success: false, message: 'Link not found' });

    link.isActive = !link.isActive;
    await post.save();
    await invalidatePostCache(post.slug);

    res.status(200).json({ success: true, data: post.downloadLinks });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Change Link Priority
export const updateLinkPriority = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    const link = post.downloadLinks.id(req.params.linkId);
    if (!link) return res.status(404).json({ success: false, message: 'Link not found' });

    link.priority = req.body.priority;
    await post.save();
    await invalidatePostCache(post.slug);

    res.status(200).json({ success: true, data: post.downloadLinks });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

