import MovieCategory from '../models/MovieCategory.js';
import Movie from '../models/Movie.js';
import logger from '../middlewares/logger.js';
import redisClient from '../config/redis.js';

const CACHE_KEY = 'movie_categories';

// @desc    Get all active movie categories (Public)
// @route   GET /api/movie-categories
// @access  Public
export const getMovieCategories = async (req, res) => {
  try {
    const cachedCategories = await redisClient.get(CACHE_KEY);
    if (cachedCategories) {
      return res.status(200).json({ success: true, data: JSON.parse(cachedCategories) });
    }

    const categories = await MovieCategory.find({ isActive: true }).sort({ order: 1, name: 1 });
    
    // Get movie count for each category
    const categoriesWithCount = await Promise.all(
      categories.map(async (cat) => {
        const movieCount = await Movie.countDocuments({ category: cat._id, status: 'Active' });
        return { ...cat._doc, movieCount };
      })
    );

    await redisClient.setex(CACHE_KEY, 3600, JSON.stringify(categoriesWithCount));

    res.status(200).json({ success: true, data: categoriesWithCount });
  } catch (error) {
    logger.error(`Get Movie Categories Error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Get all movie categories (Admin)
// @route   GET /api/movie-categories/admin
// @access  Private/Admin
export const getAdminMovieCategories = async (req, res) => {
  try {
    const categories = await MovieCategory.find().sort({ order: 1, name: 1 });
    
    const categoriesWithCount = await Promise.all(
      categories.map(async (cat) => {
        const movieCount = await Movie.countDocuments({ category: cat._id });
        return { ...cat._doc, movieCount };
      })
    );

    res.status(200).json({ success: true, data: categoriesWithCount });
  } catch (error) {
    logger.error(`Get Admin Movie Categories Error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Create movie category
// @route   POST /api/movie-categories
// @access  Private/Admin
export const createMovieCategory = async (req, res) => {
  try {
    const { name, slug, icon, description, isActive, order } = req.body;

    const existingCategory = await MovieCategory.findOne({ $or: [{ name }, { slug }] });
    if (existingCategory) {
      return res.status(400).json({ success: false, message: 'Category name or slug already exists' });
    }

    const category = await MovieCategory.create({
      name,
      slug,
      icon: icon || 'Film',
      description,
      isActive: isActive !== undefined ? isActive : true,
      order: order || 0
    });

    await redisClient.del(CACHE_KEY);
    res.status(201).json({ success: true, data: category });
  } catch (error) {
    logger.error(`Create Movie Category Error: ${error.message}`);
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Update movie category
// @route   PUT /api/movie-categories/:id
// @access  Private/Admin
export const updateMovieCategory = async (req, res) => {
  try {
    const category = await MovieCategory.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    await redisClient.del(CACHE_KEY);
    res.status(200).json({ success: true, data: category });
  } catch (error) {
    logger.error(`Update Movie Category Error: ${error.message}`);
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Delete movie category
// @route   DELETE /api/movie-categories/:id
// @access  Private/Admin
export const deleteMovieCategory = async (req, res) => {
  try {
    const categoryId = req.params.id;
    
    // Check if category has movies
    const moviesCount = await Movie.countDocuments({ category: categoryId });
    if (moviesCount > 0) {
      return res.status(400).json({ 
        success: false, 
        message: `Cannot delete category. It is assigned to ${moviesCount} movies. Please reassign them first.` 
      });
    }

    const category = await MovieCategory.findById(categoryId);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    await MovieCategory.deleteOne({ _id: categoryId });
    await redisClient.del(CACHE_KEY);
    res.status(200).json({ success: true, message: 'Category deleted successfully' });
  } catch (error) {
    logger.error(`Delete Movie Category Error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
