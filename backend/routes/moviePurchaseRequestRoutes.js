import express from 'express';
import { protect, authorize } from '../middlewares/auth.js';
import {
  submitMoviePurchaseRequest,
  getMyMoviePurchaseRequests,
  getAllMoviePurchaseRequests,
  updateMoviePurchaseRequestStatus
} from '../controllers/moviePurchaseController.js';

const router = express.Router();

router.post('/', protect, submitMoviePurchaseRequest);
router.get('/my-requests', protect, getMyMoviePurchaseRequests);

// Super Admin routes
router.route('/')
  .get(protect, authorize('superadmin'), getAllMoviePurchaseRequests);
  
router.route('/:id')
  .put(protect, authorize('superadmin'), updateMoviePurchaseRequestStatus);

export default router;
