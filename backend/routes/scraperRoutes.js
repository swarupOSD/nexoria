import express from 'express';
import { scrapePlayStore, scrapeMusic } from '../controllers/scraperController.js';
import { protect, authorize } from '../middlewares/auth.js';

const router = express.Router();

router.post('/playstore', protect, authorize('admin', 'superadmin'), scrapePlayStore);
router.post('/music', protect, authorize('admin', 'superadmin'), scrapeMusic);

export default router;
