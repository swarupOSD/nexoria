import express from 'express';
import { protect, admin as adminMiddleware } from '../middlewares/auth.js';
import { launchCampaign } from '../controllers/campaignController.js';

const router = express.Router();

router.post('/send', protect, adminMiddleware, launchCampaign);

export default router;
