import express from 'express';
import { getDashboardAnalytics, getAdminAnalytics, getSuperAdminAnalytics, trackAdblockDetection, getAdblockAnalytics } from '../controllers/analyticsController.js';
import { protect, authorize } from '../middlewares/auth.js';

const router = express.Router();

router.get('/dashboard', getDashboardAnalytics);
router.get('/admin', protect, authorize('admin', 'superadmin'), getAdminAnalytics);
router.get('/superadmin', protect, authorize('superadmin'), getSuperAdminAnalytics);

// Adblock Routes
router.post('/adblock', trackAdblockDetection);
router.get('/adblock', protect, authorize('admin', 'superadmin'), getAdblockAnalytics);

export default router;
