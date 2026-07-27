import express from 'express';
import { getDashboardAnalytics, getAdminAnalytics, getSuperAdminAnalytics, trackAdblockDetection, getAdblockAnalytics, getModuleAnalytics } from '../controllers/analyticsController.js';
import { getMusicAnalytics, getPrivateChatAnalytics } from '../controllers/advancedAnalyticsController.js';
import { protect, authorize } from '../middlewares/auth.js';

const router = express.Router();

router.get('/dashboard', getDashboardAnalytics);
router.get('/admin', protect, authorize('admin', 'superadmin', 'owner'), getAdminAnalytics);
router.get('/superadmin', protect, authorize('superadmin', 'owner'), getSuperAdminAnalytics);
router.get('/superadmin/module/:module', protect, authorize('superadmin', 'owner'), getModuleAnalytics);
// Music Analytics
router.get('/music', protect, authorize('admin', 'superadmin', 'owner'), getMusicAnalytics);
// Private Chat Analytics
router.get('/private-chat', protect, authorize('admin', 'superadmin', 'owner'), getPrivateChatAnalytics);
// Adblock Routes
router.post('/adblock', trackAdblockDetection);
router.get('/adblock', protect, authorize('admin', 'superadmin', 'owner'), getAdblockAnalytics);

export default router;
