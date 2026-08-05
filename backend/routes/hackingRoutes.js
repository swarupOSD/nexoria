import express from 'express';
import {
  getHackingTools,
  getAdminHackingTools,
  createHackingTool,
  updateHackingTool,
  deleteHackingTool
} from '../controllers/hackingController.js';

import { protect, authorize } from '../middlewares/auth.js';

const router = express.Router();

router
  .route('/')
  .get(getHackingTools)
  .post(protect, authorize('admin', 'superadmin', 'owner'), createHackingTool);

router
  .route('/admin')
  .get(protect, authorize('admin', 'superadmin', 'owner'), getAdminHackingTools);

router
  .route('/:id')
  .put(protect, authorize('admin', 'superadmin', 'owner'), updateHackingTool)
  .delete(protect, authorize('admin', 'superadmin', 'owner'), deleteHackingTool);

export default router;
