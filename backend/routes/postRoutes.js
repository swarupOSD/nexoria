import express from 'express';
import {
  getPosts,
  getPostBySlug,
  createPost,
  updatePost,
  deletePost,
  ratePost,
  incrementDownload,
  searchPosts,
  getRelatedPosts,
  getForYouRecommendations,
  getPostById,
  getAdminPosts,
  moderatePost,
  approvePost,
  rejectPost,
  markUnderDevelopment,
  schedulePost,
  addDownloadLink,
  updateDownloadLink,
  deleteDownloadLink,
  toggleDownloadLink,
  updateLinkPriority
} from '../controllers/postController.js';
import { protect, protectOptional, authorize } from '../middlewares/auth.js';
import { postValidation, postUpdateValidation } from '../middlewares/validation.js';
import { cacheResponse } from '../middlewares/cacheMiddleware.js';
import commentRouter from './commentRoutes.js';

const router = express.Router();

// Re-route into other resource routers
router.use('/:postId/comments', commentRouter);

router.route('/')
  .get(cacheResponse(300), protectOptional, getPosts)
  .post(protect, authorize('admin', 'superadmin'), postValidation, createPost);

router.get('/search', cacheResponse(300), searchPosts);
router.get('/recommendations', protect, getForYouRecommendations);
router.get('/related/:id', cacheResponse(300), getRelatedPosts);
router.get('/admin/all', protect, authorize('admin', 'superadmin'), getAdminPosts);
router.get('/id/:id', getPostById);
router.get('/:slug', cacheResponse(300), protectOptional, getPostBySlug);

router.route('/:id')
  .put(protect, authorize('admin', 'superadmin'), postUpdateValidation, updatePost)
  .delete(protect, authorize('admin', 'superadmin'), deletePost);

router.put('/:id/moderate', protect, authorize('admin', 'superadmin'), moderatePost);
router.put('/:id/approve', protect, authorize('admin', 'superadmin'), approvePost);
router.put('/:id/reject', protect, authorize('admin', 'superadmin'), rejectPost);
router.put('/:id/under-development', protect, authorize('admin', 'superadmin'), markUnderDevelopment);
router.put('/:id/schedule', protect, authorize('admin', 'superadmin'), schedulePost);

// Download Links Management
router.post('/:id/download-links', protect, authorize('admin', 'superadmin'), addDownloadLink);
router.put('/:id/download-links/:linkId', protect, authorize('admin', 'superadmin'), updateDownloadLink);
router.delete('/:id/download-links/:linkId', protect, authorize('admin', 'superadmin'), deleteDownloadLink);
router.patch('/:id/download-links/:linkId/toggle', protect, authorize('admin', 'superadmin'), toggleDownloadLink);
router.patch('/:id/download-links/:linkId/priority', protect, authorize('admin', 'superadmin'), updateLinkPriority);

router.post('/:id/rate', protect, ratePost);
router.post('/:id/download/:linkId', incrementDownload);

export default router;
