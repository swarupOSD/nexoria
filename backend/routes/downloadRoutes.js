import express from 'express';
import { trackDownload, getMyDownloads } from '../controllers/downloadController.js';
import { protect, protectOptional } from '../middlewares/auth.js';

const router = express.Router();

router.get('/history', protect, getMyDownloads);

// Allow optional auth to link downloads to users if logged in
router.post('/:postId/:linkId', protectOptional, trackDownload);

export default router;
