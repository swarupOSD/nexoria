import Movie from '../models/Movie.js';
import MovieReview from '../models/MovieReview.js';
import MovieReport from '../models/MovieReport.js';
import MovieWatchHistory from '../models/MovieWatchHistory.js';
import logger from '../middlewares/logger.js';

// --- WATCH HISTORY ---

export const getWatchHistory = async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    let query = {};

    // For simplicity, search could populate user or movie and filter
    const history = await MovieWatchHistory.find(query)
      .populate('user', 'name email profileImage')
      .populate('movie', 'title posterImage')
      .sort({ lastViewed: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await MovieWatchHistory.countDocuments(query);

    res.status(200).json({ success: true, data: history, total, pages: Math.ceil(total / limit) });
  } catch (error) {
    logger.error(`Get Watch History Error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// --- APPROVAL QUEUE ---

export const getApprovalQueue = async (req, res) => {
  try {
    const movies = await Movie.find({ status: 'Pending Approval' })
      .populate('author', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: movies });
  } catch (error) {
    logger.error(`Get Approval Queue Error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const moderateApprovalQueue = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'Active' or 'Rejected' or 'Hidden'

    const movie = await Movie.findByIdAndUpdate(id, { status }, { new: true });
    if (!movie) return res.status(404).json({ success: false, message: 'Movie not found' });

    res.status(200).json({ success: true, data: movie });
  } catch (error) {
    logger.error(`Moderate Approval Queue Error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// --- REVIEWS ---

export const getAdminMovieReviews = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const reviews = await MovieReview.find()
      .populate('user', 'name email')
      .populate('movie', 'title')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
      
    const total = await MovieReview.countDocuments();

    res.status(200).json({ success: true, data: reviews, total, pages: Math.ceil(total / limit) });
  } catch (error) {
    logger.error(`Get Movie Reviews Error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const moderateMovieReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { isApproved } = req.body;
    
    const review = await MovieReview.findByIdAndUpdate(id, { isApproved }, { new: true });
    res.status(200).json({ success: true, data: review });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const deleteMovieReview = async (req, res) => {
  try {
    await MovieReview.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Review deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// --- RATINGS (Aggregated) ---

export const getAdminMovieRatings = async (req, res) => {
  try {
    const { page = 1, limit = 20, sort = 'top' } = req.query;
    
    // sorting logic
    let sortObj = { averageRating: -1 };
    if (sort === 'lowest') sortObj = { averageRating: 1 };
    if (sort === 'most') sortObj = { totalVotes: -1 };
    
    // We fetch movies that have averageRating
    const movies = await Movie.find({ totalVotes: { $gt: 0 } })
      .select('title posterImage averageRating totalVotes imdbRating tmdbRating')
      .sort(sortObj)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
      
    const total = await Movie.countDocuments({ totalVotes: { $gt: 0 } });

    res.status(200).json({ success: true, data: movies, total, pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// --- REPORTS ---

export const getAdminMovieReports = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const reports = await MovieReport.find()
      .populate('user', 'name email')
      .populate('movie', 'title')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
      
    const total = await MovieReport.countDocuments();

    res.status(200).json({ success: true, data: reports, total, pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const moderateMovieReport = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const report = await MovieReport.findByIdAndUpdate(id, { 
      status, 
      resolvedBy: req.user.id,
      resolvedAt: Date.now()
    }, { new: true });
    
    res.status(200).json({ success: true, data: report });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const deleteMovieReport = async (req, res) => {
  try {
    await MovieReport.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Report deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
