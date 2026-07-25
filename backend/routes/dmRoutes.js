import express from 'express';
import { 
  getDMAnalytics, 
  getAdminConversations, 
  deleteAdminConversation, 
  restrictUserDMs 
} from '../controllers/dmController.js';
import { protect, authorize } from '../middlewares/auth.js';

const router = express.Router();

router.get('/admin/analytics', protect, authorize('admin', 'superadmin'), getDMAnalytics);
router.get('/admin/conversations', protect, authorize('admin', 'superadmin'), getAdminConversations);
router.delete('/admin/conversations/:id', protect, authorize('admin', 'superadmin'), deleteAdminConversation);
router.put('/admin/users/:id/dm-restrict', protect, authorize('admin', 'superadmin'), restrictUserDMs);

export default router;
