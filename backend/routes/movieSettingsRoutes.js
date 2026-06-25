import express from 'express';
import { getMovieSettings, updateMovieSettings } from '../controllers/movieSettingsController.js';
import { protect, authorize } from '../middlewares/auth.js';

const router = express.Router();

router.route('/')
  .get(getMovieSettings)
  .put(protect, authorize('superadmin'), updateMovieSettings);

export default router;
