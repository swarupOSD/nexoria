import express from 'express';
import {
  getGames,
  getGameById,
  createGame,
  updateGame,
  deleteGame,
} from '../controllers/gameController.js';
import { protect, authorize } from '../middlewares/auth.js';

const router = express.Router();

router
  .route('/')
  .get(getGames)
  .post(protect, authorize('superadmin'), createGame);

router
  .route('/:id')
  .get(getGameById)
  .put(protect, authorize('superadmin'), updateGame)
  .delete(protect, authorize('superadmin'), deleteGame);

export default router;
