import express from 'express';
import {
  getMovies,
  getAdminMovies,
  getMovieBySlug,
  createMovie,
  updateMovie,
  deleteMovie,
  incrementMovieDownload,
  incrementMovieWatch,
  getMovieAnalytics,
  getMovieHomeSections,
  getMovieReviews,
  addMovieReview
} from '../controllers/movieController.js';
import { protect, authorize } from '../middlewares/auth.js';

const router = express.Router();

router.get('/analytics/dashboard', protect, authorize('superadmin'), getMovieAnalytics);
router.get('/home-sections', getMovieHomeSections);
router.get('/', getMovies);
router.get('/admin', protect, authorize('admin', 'superadmin'), getAdminMovies);
router.get('/:slug', getMovieBySlug);
router.post('/:id/download', incrementMovieDownload);
router.post('/:id/watch', incrementMovieWatch);
router.get('/:id/reviews', getMovieReviews);
router.post('/:id/reviews', protect, addMovieReview);

// Admin Routes
router.post('/', protect, authorize('admin', 'superadmin'), createMovie);
router.put('/:id', protect, authorize('admin', 'superadmin'), updateMovie);
router.delete('/:id', protect, authorize('superadmin'), deleteMovie);

export default router;
