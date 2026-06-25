import express from 'express';
import { getMyActivity, getAllActivities } from '../controllers/activityController.js';
import { protect, authorize } from '../middlewares/auth.js';

const router = express.Router();

router.use(protect);

router.get('/me', getMyActivity);
router.get('/', authorize('admin', 'superadmin'), getAllActivities);

export default router;
