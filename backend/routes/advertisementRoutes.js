import express from 'express';
import {
  getAdvertisements,
  createAdvertisement,
  updateAdvertisement,
  deleteAdvertisement,
  toggleAdvertisement
} from '../controllers/advertisementController.js';
import { protect, authorize } from '../middlewares/auth.js';

const router = express.Router();

router.route('/')
  .get(getAdvertisements)
  .post(protect, authorize('admin', 'superadmin'), createAdvertisement);

router.route('/:id')
  .put(protect, authorize('admin', 'superadmin'), updateAdvertisement)
  .delete(protect, authorize('admin', 'superadmin'), deleteAdvertisement);

router.route('/:id/toggle')
  .patch(protect, authorize('admin', 'superadmin'), toggleAdvertisement);

export default router;
