import express from 'express';
import { getComments, addComment, updateCommentStatus, deleteComment, addReply, getAllComments } from '../controllers/commentController.js';
import { protect, authorize } from '../middlewares/auth.js';
import { commentValidation } from '../middlewares/validation.js';

const router = express.Router({ mergeParams: true });

router.route('/')
  .get(protect, authorize('admin', 'superadmin'), getAllComments)
  .post(protect, commentValidation, addComment);

router.route('/post/:postId')
  .get(getComments);

router.route('/:commentId/reply')
  .post(protect, addReply);

router.route('/:id/moderate')
  .put(protect, authorize('admin', 'superadmin'), updateCommentStatus);

router.route('/:id')
  .delete(protect, authorize('admin', 'superadmin'), deleteComment);

export default router;
