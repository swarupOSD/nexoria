import express from 'express';
import {
  getActiveAnnouncements,
  getAllAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement
} from '../controllers/announcementController.js';
import { protect, authorize } from '../middlewares/auth.js';

const router = express.Router();

router.route('/')
  .get(getActiveAnnouncements)
  .post(protect, authorize('admin', 'superadmin'), createAnnouncement);

router.route('/admin')
  .get(protect, authorize('admin', 'superadmin'), getAllAnnouncements);

router.route('/:id')
  .put(protect, authorize('admin', 'superadmin'), updateAnnouncement)
  .delete(protect, authorize('admin', 'superadmin'), deleteAnnouncement);

export default router;
