import express from 'express';
import { protect, authorize } from '../middlewares/auth.js';
import { upload, uploadVideo } from '../middlewares/uploadMiddleware.js';
import { uploadImage, uploadLogo, uploadProfile, uploadPaymentProof, deleteImage, uploadVideoFile } from '../controllers/uploadController.js';

const router = express.Router();

router.post('/image', protect, authorize('admin', 'superadmin'), upload.single('image'), uploadImage);
router.post('/logo', protect, authorize('admin', 'superadmin'), upload.single('image'), uploadLogo);
router.post('/profile', protect, upload.single('image'), uploadProfile);
router.post('/proof', protect, upload.single('image'), uploadPaymentProof);
router.post('/video', protect, authorize('admin', 'superadmin'), uploadVideo.single('video'), uploadVideoFile);
router.post('/delete', protect, authorize('admin', 'superadmin'), deleteImage);

export default router;
