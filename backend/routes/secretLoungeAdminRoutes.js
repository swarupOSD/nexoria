import express from 'express';
import { getAdminSecretRooms, deleteAdminSecretRoom } from '../controllers/secretLoungeAdminController.js';
import { protect, authorize } from '../middlewares/auth.js';

const router = express.Router();

router.get('/', protect, authorize('admin', 'superadmin'), getAdminSecretRooms);
router.delete('/:teamCode', protect, authorize('admin', 'superadmin'), deleteAdminSecretRoom);

export default router;
