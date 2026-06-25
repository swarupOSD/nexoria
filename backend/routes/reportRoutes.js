import express from 'express';
import {
  createReport,
  getReports,
  resolveReport,
  rejectReport,
  deleteReport
} from '../controllers/reportController.js';
import { protect, authorize } from '../middlewares/auth.js';

const router = express.Router();

router.route('/')
  .post(protect, createReport)
  .get(protect, authorize('admin', 'superadmin'), getReports);

router.route('/:id/resolve')
  .put(protect, authorize('admin', 'superadmin'), resolveReport);

router.route('/:id/reject')
  .put(protect, authorize('admin', 'superadmin'), rejectReport);

router.route('/:id')
  .delete(protect, authorize('admin', 'superadmin'), deleteReport);

export default router;
