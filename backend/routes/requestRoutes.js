import express from 'express';
import {
  getRequests,
  createRequest,
  toggleUpvote,
  updateRequest,
  deleteRequest,
} from '../controllers/requestController.js';
import { protect, authorize } from '../middlewares/auth.js';

const router = express.Router();

router.route('/').get(getRequests).post(protect, createRequest);

router.route('/:id').put(protect, authorize('superadmin'), updateRequest).delete(protect, deleteRequest);

router.route('/:id/upvote').put(protect, toggleUpvote);

export default router;
