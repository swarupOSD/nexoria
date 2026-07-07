import express from 'express';
import { 
  getNotifications, 
  getUnreadNotificationsCount, 
  markAsRead, 
  markAllAsRead, 
  deleteNotification,
  broadcastNotification,
  sendDirectNotification
} from '../controllers/notificationController.js';
import { protect, authorize } from '../middlewares/auth.js';

const router = express.Router();

router.use(protect); // All routes require auth

router.route('/')
  .get(getNotifications);

router.post('/broadcast', authorize('admin', 'superadmin'), broadcastNotification);
router.post('/send', authorize('admin', 'superadmin'), sendDirectNotification);

router.get('/unread', getUnreadNotificationsCount);
router.put('/read-all', markAllAsRead);
router.put('/:id/read', markAsRead);
router.delete('/:id', deleteNotification);

export default router;
