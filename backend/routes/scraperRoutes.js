import express from 'express';
import { scrapePlayStore, scrapeMusic } from '../controllers/scraperController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/playstore', protect, admin, scrapePlayStore);
router.post('/music', protect, admin, scrapeMusic);

export default router;
