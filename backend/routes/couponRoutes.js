import express from 'express';
import { redeemCoupon, getCoupons, createCoupon, deleteCoupon } from '../controllers/couponController.js';
import { protect, authorize } from '../middlewares/auth.js';

const router = express.Router();

router.post('/redeem', protect, redeemCoupon);

router.route('/')
  .get(protect, authorize('superadmin'), getCoupons)
  .post(protect, authorize('superadmin'), createCoupon);

router.route('/:id')
  .delete(protect, authorize('superadmin'), deleteCoupon);

export default router;
