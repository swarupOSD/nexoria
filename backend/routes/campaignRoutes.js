import express from 'express';
import { protect, authorize } from '../middlewares/auth.js';
import { launchCampaign } from '../controllers/campaignController.js';

const router = express.Router();

router.post('/send', protect, authorize('superadmin'), launchCampaign);

export default router;
