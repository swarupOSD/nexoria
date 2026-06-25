import express from 'express';
import { getActiveBanners, getAllBanners, createBanner, updateBanner, deleteBanner } from '../controllers/bannerController.js';
import { protect, authorize } from '../middlewares/auth.js';

const router = express.Router();

router.route('/')
  .get(getActiveBanners)
  .post(protect, authorize('superadmin'), createBanner);

router.get('/admin', protect, authorize('superadmin'), getAllBanners);

router.route('/:id')
  .put(protect, authorize('superadmin'), updateBanner)
  .delete(protect, authorize('superadmin'), deleteBanner);

export default router;
