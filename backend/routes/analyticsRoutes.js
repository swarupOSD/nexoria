import express from 'express';
import { getDashboardAnalytics, getAdminAnalytics, getSuperAdminAnalytics, trackAdblockDetection, getAdblockAnalytics, getModuleAnalytics, getOnlineUsersBoard } from '../controllers/analyticsController.js';
import { getMusicAnalytics, getPrivateChatAnalytics, getAdminConversations, getAdminConversationMessages } from '../controllers/advancedAnalyticsController.js';
import { protect, authorize } from '../middlewares/auth.js';

const router = express.Router();

router.get('/dashboard', getDashboardAnalytics);
router.get('/admin', protect, authorize('admin', 'superadmin', 'owner'), getAdminAnalytics);
router.get('/superadmin', protect, authorize('superadmin', 'owner'), getSuperAdminAnalytics);
router.get('/superadmin/module/:module', protect, authorize('superadmin', 'owner'), getModuleAnalytics);
router.get('/online-users', protect, authorize('owner'), getOnlineUsersBoard);
// Music Analytics
router.get('/music', protect, authorize('owner'), getMusicAnalytics);
// Private Chat Analytics (stats)
router.get('/private-chat', protect, authorize('owner'), getPrivateChatAnalytics);
// Private Chat — Admin Full Access (Conversations + Messages)
router.get('/private-chat/conversations', protect, authorize('owner'), getAdminConversations);
router.get('/private-chat/conversations/:id/messages', protect, authorize('owner'), getAdminConversationMessages);
// Adblock Routes
router.post('/adblock', trackAdblockDetection);
router.get('/adblock', protect, authorize('admin', 'superadmin', 'owner'), getAdblockAnalytics);

export default router;
