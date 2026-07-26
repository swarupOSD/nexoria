import express from 'express';
import { protect } from '../middlewares/auth.js';
import { getMovieRecommendations, getMusicRecommendations } from '../controllers/recommendationController.js';

const router = express.Router();

router.get('/movies', protect, getMovieRecommendations);
router.get('/music', protect, getMusicRecommendations);

export default router;
