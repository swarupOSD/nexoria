import express from 'express';
import { scrapePlayStore } from '../controllers/scraperController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/playstore', protect, admin, scrapePlayStore);

export default router;
