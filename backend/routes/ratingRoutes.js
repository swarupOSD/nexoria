import express from 'express';
import { getRatings, submitRating, updateRating, deleteRating, getAllRatings, moderateRating } from '../controllers/ratingController.js';
import { protect, authorize } from '../middlewares/auth.js';
import { ratingValidation } from '../middlewares/validation.js';

const router = express.Router({ mergeParams: true });

router.route('/')
  .get(protect, authorize('admin', 'superadmin'), getAllRatings)
  .post(protect, ratingValidation, submitRating);

router.route('/post/:postId')
  .get(getRatings);

router.route('/:id')
  .put(protect, updateRating)
  .delete(protect, authorize('admin', 'superadmin'), deleteRating);

router.route('/:id/moderate')
  .put(protect, authorize('admin', 'superadmin'), moderateRating);

export default router;
