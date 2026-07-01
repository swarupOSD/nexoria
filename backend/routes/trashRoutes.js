import express from 'express';
import { getTrashItems, restoreItem, permanentlyDeleteItem, emptyTrash } from '../controllers/trashController.js';
import { protect, authorize } from '../middlewares/auth.js';

const router = express.Router();

router.use(protect);
router.use(authorize('superadmin', 'admin'));

router.get('/', getTrashItems);
router.put('/:type/:id/restore', restoreItem);
router.delete('/:type/:id', authorize('superadmin'), permanentlyDeleteItem);
router.delete('/empty/all', authorize('superadmin'), emptyTrash);

export default router;
