import express from 'express';
import {
  getActiveArenaGames,
  getAdminArenaGames,
  addArenaGame,
  updateArenaGame,
  deleteArenaGame
} from '../controllers/arenaGameController.js';
import { protect, authorize } from '../middlewares/auth.js';

const router = express.Router();

router.route('/')
  .get(getActiveArenaGames)
  .post(protect, authorize('admin', 'superadmin'), addArenaGame);

router.route('/admin')
  .get(protect, authorize('admin', 'superadmin'), getAdminArenaGames);

router.route('/:id')
  .put(protect, authorize('admin', 'superadmin'), updateArenaGame)
  .delete(protect, authorize('admin', 'superadmin'), deleteArenaGame);

export default router;
