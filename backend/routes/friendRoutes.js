import express from 'express';
import { sendFriendRequest, getFriendRequests, respondToFriendRequest, getFriendsList } from '../controllers/friendController.js';
import { protect } from '../middlewares/auth.js';

const router = express.Router();

router.post('/request', protect, sendFriendRequest);
router.get('/requests', protect, getFriendRequests);
router.post('/respond', protect, respondToFriendRequest);
router.get('/list', protect, getFriendsList);

export default router;
