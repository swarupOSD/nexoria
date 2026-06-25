import express from 'express';
import { protect, authorize } from '../middlewares/auth.js';
import {
  submitPremiumRequest,
  getPremiumRequests,
  approvePremiumRequest,
  rejectPremiumRequest,
  submitPurchaseRequest,
  getPurchaseRequests,
  approvePurchaseRequest,
  rejectPurchaseRequest,
  getMyRequests,
  getPremiumPlans,
  buyItemWithCoins
} from '../controllers/paymentController.js';

const router = express.Router();

router.get('/my', protect, getMyRequests);
router.get('/plans', getPremiumPlans);

// Premium Requests
router.post('/premium', protect, submitPremiumRequest);
router.get('/premium', protect, authorize('admin', 'superadmin'), getPremiumRequests);
router.put('/premium/:id/approve', protect, authorize('admin', 'superadmin'), approvePremiumRequest);
router.put('/premium/:id/reject', protect, authorize('admin', 'superadmin'), rejectPremiumRequest);

// Purchase Requests
router.post('/purchase', protect, submitPurchaseRequest);
router.post('/buy-with-coins', protect, buyItemWithCoins);
router.get('/purchase', protect, authorize('admin', 'superadmin'), getPurchaseRequests);
router.put('/purchase/:id/approve', protect, authorize('admin', 'superadmin'), approvePurchaseRequest);
router.put('/purchase/:id/reject', protect, authorize('admin', 'superadmin'), rejectPurchaseRequest);

export default router;
