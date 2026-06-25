import express from 'express';
import { getUsers, getUserById, updateUser, deleteUser, managePremium, getWishlist, addToWishlist, removeFromWishlist, getMyActivity, subscribeToPush, unsubscribeFromPush } from '../controllers/userController.js';
import { protect, authorize } from '../middlewares/auth.js';

import { banUser, unbanUser, suspendUser, restoreUser, warnUser, addAdminNote, getAdminNotes, updateRestrictions } from '../controllers/userModerationController.js';
import { assignPremium, revokePremium, getPremiumHistory } from '../controllers/premiumManagementController.js';

const router = express.Router();

// Wishlist Routes (Must be before /:id to avoid ID conflict)
router.route('/me/wishlist')
  .get(protect, getWishlist)
  .post(protect, addToWishlist);
  
router.route('/me/activity')
  .get(protect, getMyActivity);

router.route('/me/wishlist/:postId')
  .delete(protect, removeFromWishlist);

router.route('/')
  .get(protect, authorize('admin', 'superadmin'), getUsers);

router.route('/:id')
  .get(protect, authorize('admin', 'superadmin'), getUserById)
  .put(protect, authorize('superadmin'), updateUser)
  .delete(protect, authorize('superadmin'), deleteUser);

router.route('/:id/premium')
  .put(protect, authorize('superadmin'), managePremium);

// New robust premium management endpoints
router.post('/push-subscribe', protect, subscribeToPush);
router.post('/push-unsubscribe', protect, unsubscribeFromPush);

router.post('/premium/assign', protect, authorize('superadmin'), assignPremium);
router.post('/premium/revoke', protect, authorize('superadmin'), revokePremium);
router.get('/premium/history/:id', protect, authorize('superadmin'), getPremiumHistory);

router.route('/:id/ban')
  .put(protect, authorize('admin', 'superadmin'), banUser);

router.route('/:id/unban')
  .put(protect, authorize('admin', 'superadmin'), unbanUser);

router.route('/:id/suspend')
  .put(protect, authorize('admin', 'superadmin'), suspendUser);

router.route('/:id/restore')
  .put(protect, authorize('admin', 'superadmin'), restoreUser);

router.route('/:id/warn')
  .put(protect, authorize('admin', 'superadmin'), warnUser);

router.route('/:id/note')
  .post(protect, authorize('admin', 'superadmin'), addAdminNote);

router.route('/:id/notes')
  .get(protect, authorize('admin', 'superadmin'), getAdminNotes);

router.route('/:id/restrictions')
  .put(protect, authorize('admin', 'superadmin'), updateRestrictions);

export default router;
