import express from 'express';
import {
  updateWatchHistory,
  getWatchHistory,
  removeFromWatchHistory,
} from '../controllers/watchHistoryController.js';
import { protect } from '../middlewares/auth.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getWatchHistory);

router.route('/update')
  .post(updateWatchHistory);

router.route('/:movieId')
  .delete(removeFromWatchHistory);

export default router;
