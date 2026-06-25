import express from 'express';
import {
  getMovieCategories,
  getAdminMovieCategories,
  createMovieCategory,
  updateMovieCategory,
  deleteMovieCategory
} from '../controllers/movieCategoryController.js';
import { protect, authorize } from '../middlewares/auth.js';

const router = express.Router();

router.get('/', getMovieCategories);
router.get('/admin', protect, authorize('admin', 'superadmin'), getAdminMovieCategories);

router.post('/', protect, authorize('admin', 'superadmin'), createMovieCategory);
router.put('/:id', protect, authorize('admin', 'superadmin'), updateMovieCategory);
router.delete('/:id', protect, authorize('admin', 'superadmin'), deleteMovieCategory);

export default router;
