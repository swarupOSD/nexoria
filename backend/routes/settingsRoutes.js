import express from 'express';
import { getSettings, updateSettings } from '../controllers/settingsController.js';
import { protect, authorize } from '../middlewares/auth.js';

const router = express.Router();

router.route('/')
  .get(getSettings)
  .put(protect, authorize('superadmin'), updateSettings);

export default router;
