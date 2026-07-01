import Movie from '../models/Movie.js';
import MovieCategory from '../models/MovieCategory.js';
import MovieDownload from '../models/MovieDownload.js';
import MovieReview from '../models/MovieReview.js';
import User from '../models/User.js';
import logger from '../middlewares/logger.js';
import redisClient from '../config/redis.js';

export const getMovieHomeSections = async (req, res) => {
  try {
    const cached = await redisClient.get('movie_home_sections');
    if (cached) {
      return res.status(200).json({ success: true, data: JSON.parse(cached) });
    }

    const currentDate = new Date();
    
    const releasedCondition = {
      $or: [
        { releaseDate: { $lte: currentDate } },
        { releaseDate: null },
        { releaseDate: { $exists: false } }
      ]
    };

    // Create promises for parallel execution
    const [
      featured,
      trending,
      latestMovies,
      latestSeries,
      latestAnimation,
      mostWatched,
      comingSoon
    ] = await Promise.all([
      Movie.find({ status: 'Active', isFeatured: true, ...releasedCondition }).select('title slug originalTitle posterImage releaseYear imdbRating tmdbRating duration runtime genre quality appType isFeatured isTrending').sort({ createdAt: -1 }).limit(10).lean(),
      Movie.find({ status: 'Active', isTrending: true, ...releasedCondition }).select('title slug originalTitle posterImage releaseYear imdbRating tmdbRating duration runtime genre quality appType isFeatured isTrending').sort({ createdAt: -1 }).limit(15).lean(),
      Movie.find({ status: 'Active', movieType: { $nin: ['Web Series', 'Animation'] }, ...releasedCondition }).select('title slug originalTitle posterImage releaseYear imdbRating tmdbRating duration runtime genre quality appType isFeatured isTrending').sort({ createdAt: -1 }).limit(15).lean(),
      Movie.find({ status: 'Active', movieType: 'Web Series', ...releasedCondition }).select('title slug originalTitle posterImage releaseYear imdbRating tmdbRating duration runtime genre quality appType isFeatured isTrending').sort({ createdAt: -1 }).limit(15).lean(),
      Movie.find({ status: 'Active', movieType: 'Animation', ...releasedCondition }).select('title slug originalTitle posterImage releaseYear imdbRating tmdbRating duration runtime genre quality appType isFeatured isTrending').sort({ createdAt: -1 }).limit(15).lean(),
      Movie.find({ status: 'Active', ...releasedCondition }).select('title slug originalTitle posterImage releaseYear imdbRating tmdbRating duration runtime genre quality appType isFeatured isTrending').sort({ views: -1, downloads: -1 }).limit(15).lean(),
      Movie.find({ status: 'Active', releaseDate: { $gt: currentDate } }).select('title slug originalTitle posterImage releaseYear imdbRating tmdbRating duration runtime genre quality appType isFeatured isTrending').sort({ releaseDate: 1 }).limit(15).lean(),
    ]);

    const data = {
      featured,
      trending,
      latestMovies,
      latestSeries,
      latestAnimation,
      mostWatched,
      comingSoon
    };

    await redisClient.setex('movie_home_sections', 1800, JSON.stringify(data)); // cache for 30 minutes

    res.status(200).json({ success: true, data });
  } catch (error) {
    logger.error(`Get Movie Home Sections Error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Get all movies (Public, Paginated)
// @route   GET /api/movies
// @access  Public
export const getMovies = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      category, 
      search, 
      sort = 'newest',
      language,
      genre,
      quality,
      isPremium,
      movieType,
      isFeatured,
      isTrending,
      comingSoon
    } = req.query;

    let query = { status: 'Active', isDeleted: { $ne: true } };

    if (comingSoon === 'true') {
      query.releaseDate = { $gt: new Date() };
    } else if (comingSoon === 'false') {
      query.releaseDate = { $lte: new Date() };
    }

    // Resolve Category Slug to ID
    if (category) {
      const catDoc = await MovieCategory.findOne({ slug: category });
      if (catDoc) query.category = catDoc._id;
      else return res.status(200).json({ success: true, data: [], pagination: {} }); // Invalid category slug
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (language) query.language = { $regex: new RegExp(`^${language}$`, 'i') };
    if (genre) query.genre = { $in: [new RegExp(`^${genre}$`, 'i')] };
    if (quality) query.quality = { $in: [quality] };
    if (isPremium === 'true') query.appType = 'Premium';
    if (isPremium === 'false') query.appType = 'Free';
    if (movieType) query.movieType = movieType;
    if (isFeatured === 'true') query.isFeatured = true;
    if (isTrending === 'true') query.isTrending = true;

    // Sorting
    let sortObj = { createdAt: -1 };
    if (sort === 'oldest') sortObj = { createdAt: 1 };
    if (sort === 'popular') sortObj = { views: -1, downloads: -1 };
    if (sort === 'rating') sortObj = { averageRating: -1 };
    if (sort === 'trending') sortObj = { isTrending: -1, createdAt: -1 };

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const startIndex = (pageNum - 1) * limitNum;

    const total = await Movie.countDocuments(query);
    const movies = await Movie.find(query)
      .populate('category', 'name slug')
      .sort(sortObj)
      .skip(startIndex)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      data: movies,
      pagination: {
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    logger.error(`Get Movies Error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Get admin movies
// @route   GET /api/movies/admin
// @access  Private/Admin
export const getAdminMovies = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, status, movieType } = req.query;
    let query = { isDeleted: { $ne: true } };

    if (search) query.title = { $regex: search, $options: 'i' };
    if (status) query.status = status;
    if (movieType) {
      if (movieType === 'Web Series') query.movieType = 'Web Series';
      else if (movieType === 'Animation') query.movieType = 'Animation';
      else query.movieType = { $ne: 'Web Series' }; // Default or Movie
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const startIndex = (pageNum - 1) * limitNum;

    const total = await Movie.countDocuments(query);
    const movies = await Movie.find(query)
      .populate('category', 'name')
      .populate('author', 'name email')
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      data: movies,
      pagination: {
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    logger.error(`Get Admin Movies Error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Get single movie by slug
// @route   GET /api/movies/:slug
// @access  Public
export const getMovieBySlug = async (req, res) => {
  try {
    const movie = await Movie.findOne({ slug: req.params.slug, isDeleted: { $ne: true } })
      .populate('category', 'name slug')
      .populate('author', 'name profileImage');

    if (!movie) {
      return res.status(404).json({ success: false, message: 'Movie not found' });
    }

    // Increment views
    movie.views += 1;
    await movie.save();

    // Fetch related movies safely
    const relatedMovies = movie.category ? await Movie.find({ 
      category: movie.category._id, 
      _id: { $ne: movie._id },
      status: 'Active'
    }).limit(6) : [];

    res.status(200).json({ 
      success: true, 
      data: movie,
      related: relatedMovies
    });
  } catch (error) {
    logger.error(`Get Movie Error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Create movie
// @route   POST /api/movies
// @access  Private/Admin
export const createMovie = async (req, res) => {
  try {
    req.body.author = req.user.id;
    
    const existing = await Movie.findOne({ slug: req.body.slug });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Movie slug already exists' });
    }

    const movie = await Movie.create(req.body);
    await redisClient.del('movie_home_sections');
    res.status(201).json({ success: true, data: movie });
  } catch (error) {
    logger.error(`Create Movie Error: ${error.message}`);
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Update movie
// @route   PUT /api/movies/:id
// @access  Private/Admin
export const updateMovie = async (req, res) => {
  try {
    let movie = await Movie.findOne({ _id: req.params.id, isDeleted: { $ne: true } });
    if (!movie) {
      return res.status(404).json({ success: false, message: 'Movie not found' });
    }

    if (req.body.slug && req.body.slug !== movie.slug) {
      const existing = await Movie.findOne({ slug: req.body.slug });
      if (existing) {
        return res.status(400).json({ success: false, message: 'Slug already in use' });
      }
    }

    movie = await Movie.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    
    await redisClient.del('movie_home_sections');

    res.status(200).json({ success: true, data: movie });
  } catch (error) {
    logger.error(`Update Movie Error: ${error.message}`);
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Delete movie
// @route   DELETE /api/movies/:id
// @access  Private/Admin
export const deleteMovie = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) {
      return res.status(404).json({ success: false, message: 'Movie not found' });
    }

    movie.isDeleted = true;
    movie.deletedAt = new Date();
    await movie.save();
    
    await redisClient.del('movie_home_sections');
    res.status(200).json({ success: true, message: 'Movie moved to trash successfully' });
  } catch (error) {
    logger.error(`Delete Movie Error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Increment download count
// @route   POST /api/movies/:id/download
// @access  Public
export const incrementMovieDownload = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) return res.status(404).json({ success: false, message: 'Movie not found' });

    movie.downloads += 1;
    await movie.save();

    // Track download details
    await MovieDownload.create({
      movie: movie._id,
      user: req.user ? req.user.id : null,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    res.status(200).json({ success: true, data: movie.downloads });
  } catch (error) {
    logger.error(`Increment Movie Download Error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Increment watch count
// @route   POST /api/movies/:id/watch
// @access  Public
export const incrementMovieWatch = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) return res.status(404).json({ success: false, message: 'Movie not found' });

    movie.watchCount += 1;
    await movie.save();

    res.status(200).json({ success: true, data: movie.watchCount });
  } catch (error) {
    logger.error(`Increment Movie Watch Error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Get movie analytics
// @route   GET /api/movies/analytics/dashboard
// @access  Private/SuperAdmin
export const getMovieAnalytics = async (req, res) => {
  try {
    const totalMovies = await Movie.countDocuments();
    const activeMovies = await Movie.countDocuments({ status: 'Active' });
    
    // Aggregate total views and downloads
    const stats = await Movie.aggregate([
      {
        $group: {
          _id: null,
          totalViews: { $sum: "$views" },
          totalWatchCount: { $sum: "$watchCount" },
          totalDownloads: { $sum: "$downloads" }
        }
      }
    ]);

    const totalViews = stats.length > 0 ? stats[0].totalViews : 0;
    const totalWatchCount = stats.length > 0 ? stats[0].totalWatchCount : 0;
    const totalDownloads = stats.length > 0 ? stats[0].totalDownloads : 0;

    const mostWatched = await Movie.find({ status: 'Active' }).sort({ watchCount: -1 }).limit(5).select('title posterImage views downloads watchCount');
    const topRated = await Movie.find({ status: 'Active' }).sort({ averageRating: -1 }).limit(5).select('title averageRating totalVotes');

    res.status(200).json({
      success: true,
      data: {
        totalMovies,
        activeMovies,
        totalViews,
        totalWatchCount,
        totalDownloads,
        mostWatched,
        topRated
      }
    });
  } catch (error) {
    logger.error(`Get Movie Analytics Error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Get reviews for a movie
// @route   GET /api/movies/:id/reviews
// @access  Public
export const getMovieReviews = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const reviews = await MovieReview.find({ movie: id, isApproved: true })
      .populate('user', 'name profileImage')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await MovieReview.countDocuments({ movie: id, isApproved: true });

    res.status(200).json({
      success: true,
      data: reviews,
      total,
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    logger.error(`Get Movie Reviews Error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Add a movie review
// @route   POST /api/movies/:id/reviews
// @access  Private
export const addMovieReview = async (req, res) => {
  try {
    const { id: movieId } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user.id;

    if (!rating || !comment) {
      return res.status(400).json({ success: false, message: 'Rating and comment are required' });
    }

    // Check if user already reviewed
    const existingReview = await MovieReview.findOne({ movie: movieId, user: userId });
    if (existingReview) {
      return res.status(400).json({ success: false, message: 'You have already reviewed this movie' });
    }

    const review = await MovieReview.create({
      movie: movieId,
      user: userId,
      rating: Number(rating),
      comment
    });

    // Update movie average rating
    const allReviews = await MovieReview.find({ movie: movieId });
    const totalVotes = allReviews.length;
    const averageRating = allReviews.reduce((acc, item) => item.rating + acc, 0) / totalVotes;

    await Movie.findByIdAndUpdate(movieId, {
      totalVotes,
      averageRating
    });

    res.status(201).json({ success: true, data: review });
  } catch (error) {
    logger.error(`Add Movie Review Error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
