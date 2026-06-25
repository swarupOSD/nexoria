import express from 'express';
import { 
  getCategories, 
  getAllCategories,
  getCategoryBySlug, 
  createCategory, 
  updateCategory, 
  deleteCategory 
} from '../controllers/categoryController.js';
import { protect, authorize } from '../middlewares/auth.js';
import { categoryValidation } from '../middlewares/validation.js';

const router = express.Router();

router.route('/')
  .get(getCategories)
  .post(protect, authorize('admin', 'superadmin'), categoryValidation, createCategory);

router.get('/all', protect, authorize('admin', 'superadmin'), getAllCategories);

router.get('/:slug', getCategoryBySlug);

router.route('/:id')
  .put(protect, authorize('admin', 'superadmin'), categoryValidation, updateCategory)
  .delete(protect, authorize('admin', 'superadmin'), deleteCategory);

export default router;
