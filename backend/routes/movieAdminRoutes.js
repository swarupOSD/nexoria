import express from 'express';
import { protect, authorize } from '../middlewares/auth.js';
import {
  getWatchHistory,
  getApprovalQueue,
  moderateApprovalQueue,
  getAdminMovieReviews,
  moderateMovieReview,
  deleteMovieReview,
  getAdminMovieRatings,
  getAdminMovieReports,
  moderateMovieReport,
  deleteMovieReport
} from '../controllers/movieAdminController.js';

const router = express.Router();

// Apply auth to all routes in this file
router.use(protect);
router.use(authorize('admin', 'superadmin'));

// Watch History
router.get('/watch-history', getWatchHistory);

// Approval Queue
router.get('/approval-queue', getApprovalQueue);
router.put('/approval-queue/:id', moderateApprovalQueue);

// Reviews
router.get('/reviews', getAdminMovieReviews);
router.put('/reviews/:id', moderateMovieReview);
router.delete('/reviews/:id', deleteMovieReview);

// Ratings
router.get('/ratings', getAdminMovieRatings);

// Reports
router.get('/reports', getAdminMovieReports);
router.put('/reports/:id', moderateMovieReport);
router.delete('/reports/:id', deleteMovieReport);

export default router;
