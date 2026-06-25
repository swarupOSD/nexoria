import express from 'express';
import {
  getMessages,
  createMessage,
  resolveMessage,
  deleteMessage,
  replyMessage,
  updateMessageStatus,
  updateMessagePriority,
  getUserMessages,
  getContactAnalytics
} from '../controllers/contactController.js';
import { protect, protectOptional, authorize } from '../middlewares/auth.js';
import { contactValidation } from '../middlewares/validation.js';

const router = express.Router();

router.route('/')
  .get(protect, authorize('admin', 'superadmin'), getMessages)
  .post(protectOptional, createMessage);

router.route('/my-tickets')
  .get(protect, getUserMessages);

router.route('/analytics')
  .get(protect, authorize('admin', 'superadmin'), getContactAnalytics);

router.route('/:id/reply')
  .post(protect, replyMessage);

router.route('/:id/status')
  .put(protect, authorize('admin', 'superadmin'), updateMessageStatus);

router.route('/:id/priority')
  .put(protect, authorize('admin', 'superadmin'), updateMessagePriority);

router.route('/:id/resolve')
  .put(protect, authorize('admin', 'superadmin'), resolveMessage);

router.route('/:id')
  .delete(protect, authorize('admin', 'superadmin'), deleteMessage);

export default router;
