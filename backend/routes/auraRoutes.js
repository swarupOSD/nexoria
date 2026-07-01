import express from 'express';
import {
  getAuraLeaderboard,
  getItemAura,
  vibeVote,
  getAuraBattle,
  voteAuraBattle,
  getPersonalAura,
  recalculateAllAura,
} from '../controllers/auraController.js';
import { protect, authorize } from '../middlewares/auth.js';

const router = express.Router();

// Public
router.get('/leaderboard', getAuraLeaderboard);
router.get('/battle', getAuraBattle);
router.get('/:type/:id', getItemAura);

// Protected
router.post('/:type/:id/vote', protect, vibeVote);
router.post('/battle/vote', protect, voteAuraBattle);
router.get('/me', protect, getPersonalAura);

// Admin
router.post('/recalculate', protect, authorize('admin', 'superadmin'), recalculateAllAura);

export default router;
