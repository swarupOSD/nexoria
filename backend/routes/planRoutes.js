import express from 'express';
import { protect, authorize } from '../middlewares/auth.js';
import {
  getPlans,
  getAllPlans,
  createPlan,
  updatePlan,
  deletePlan
} from '../controllers/planController.js';

const router = express.Router();

router.get('/', getPlans);
router.get('/admin', protect, authorize('admin', 'superadmin'), getAllPlans);
router.post('/', protect, authorize('superadmin'), createPlan);
router.put('/:id', protect, authorize('superadmin'), updatePlan);
router.delete('/:id', protect, authorize('superadmin'), deletePlan);

export default router;
