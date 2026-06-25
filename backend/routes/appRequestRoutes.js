import express from 'express';
import {
  createAppRequest,
  getMyAppRequests,
  getAllAppRequests,
  updateAppRequest
} from '../controllers/appRequestController.js';
import { protect, authorize } from '../middlewares/auth.js';

const router = express.Router();

router.route('/')
  .post(protect, createAppRequest)
  .get(protect, authorize('admin', 'superadmin'), getAllAppRequests);

router.route('/me')
  .get(protect, getMyAppRequests);

router.route('/:id')
  .put(protect, authorize('admin', 'superadmin'), updateAppRequest);

export default router;
