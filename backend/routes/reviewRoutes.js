import express from 'express';
import {
  getPostReviews,
  createReview,
  updateReview,
  deleteReview,
  getAdminReviews,
  moderateReview
} from '../controllers/reviewController.js';
import { protect, authorize } from '../middlewares/auth.js';

const router = express.Router();

router.route('/post/:postId')
  .get(getPostReviews);

router.route('/')
  .post(protect, createReview);

router.route('/:id')
  .put(protect, updateReview)
  .delete(protect, deleteReview);

router.route('/admin/all')
  .get(protect, authorize('admin', 'superadmin'), getAdminReviews);

router.route('/:id/moderate')
  .put(protect, authorize('admin', 'superadmin'), moderateReview);

export default router;
