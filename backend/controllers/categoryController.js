import Category from '../models/Category.js';
import Post from '../models/Post.js';
import redis from '../config/redis.js';
import logger from '../middlewares/logger.js';

// @desc    Get all active categories
// @route   GET /api/categories
// @access  Public
export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true, visibility: { $ne: 'Hidden' } })
      .populate('parentCategory', 'name slug')
      .sort('order name')
      .lean();

    // Aggregate post counts grouped by category
    const postCounts = await Post.aggregate([
      { $match: { status: 'Published' } },
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    // Map counts to a dictionary for O(1) lookup
    const countMap = {};
    postCounts.forEach(pc => {
      if (pc._id) countMap[pc._id.toString()] = pc.count;
    });

    // Attach appCount to each category
    const enrichedCategories = categories.map(cat => ({
      ...cat,
      appCount: countMap[cat._id.toString()] || 0
    }));

    res.status(200).json({ success: true, data: enrichedCategories });
  } catch (error) {
    logger.error(`Get Categories Error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Get all categories (Admin)
// @route   GET /api/categories/all
// @access  Private/Admin
export const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find({}).populate('parentCategory', 'name slug').sort('order name');
    res.status(200).json({ success: true, data: categories });
  } catch (error) {
    logger.error(`Get All Categories Error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Get single category by slug
// @route   GET /api/categories/:slug
// @access  Public
export const getCategoryBySlug = async (req, res) => {
  try {
    const category = await Category.findOne({ slug: req.params.slug, isActive: true });
    
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }
    
    res.status(200).json({ success: true, data: category });
  } catch (error) {
    logger.error(`Get Category Error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Create new category
// @route   POST /api/categories
// @access  Private/Admin
export const createCategory = async (req, res) => {
  try {
    const category = await Category.create(req.body);

    const keys = await redis.keys('posts:*');
    const catKeys = await redis.keys('categories:*');
    if (keys.length > 0) await redis.del(keys);
    if (catKeys.length > 0) await redis.del(catKeys);

    res.status(201).json({ success: true, data: category });
  } catch (error) {
    logger.error(`Create Category Error: ${error.message}`);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    if (error.code === 11000) {
       return res.status(400).json({ success: false, message: 'Category name or slug already exists' });
    }
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private/Admin
export const updateCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    const keys = await redis.keys('posts:*');
    const catKeys = await redis.keys('categories:*');
    if (keys.length > 0) await redis.del(keys);
    if (catKeys.length > 0) await redis.del(catKeys);
    
    res.status(200).json({ success: true, data: category });
  } catch (error) {
    logger.error(`Update Category Error: ${error.message}`);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    if (error.code === 11000) {
       return res.status(400).json({ success: false, message: 'Category name or slug already exists' });
    }
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private/Admin
export const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }
    
    await category.deleteOne();

    const keys = await redis.keys('posts:*');
    const catKeys = await redis.keys('categories:*');
    if (keys.length > 0) await redis.del(keys);
    if (catKeys.length > 0) await redis.del(catKeys);

    res.status(200).json({ success: true, message: 'Category deleted' });
  } catch (error) {
    logger.error(`Delete Category Error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
