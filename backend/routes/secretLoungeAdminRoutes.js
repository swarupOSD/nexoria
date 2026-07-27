import express from 'express';
import { getAdminSecretRooms, deleteAdminSecretRoom } from '../controllers/secretLoungeAdminController.js';
import { protect, authorize } from '../middlewares/auth.js';

const router = express.Router();

router.get('/', protect, authorize('owner'), getAdminSecretRooms);
router.delete('/:teamCode', protect, authorize('owner'), deleteAdminSecretRoom);

export default router;
