import express from 'express';
import { getActiveAds, createAd, getSettings, updateSettings, getSecurityLogs, clearSecurityLogs } from '../controllers/systemController.js';
import { protect, authorize } from '../middlewares/auth.js';

const router = express.Router();

// Ads
router.route('/ads')
  .get(getActiveAds)
  .post(protect, authorize('admin', 'superadmin'), createAd);

// Settings
router.route('/settings')
  .get(getSettings)
  .put(protect, authorize('superadmin'), updateSettings);

// Security Logs
router.route('/security-logs')
  .get(protect, authorize('superadmin'), getSecurityLogs)
  .delete(protect, authorize('superadmin'), clearSecurityLogs);

export default router;
