import express from 'express';
import {
  getAuditLogs,
  updateAuraGodMode,
  databaseBackup,
  databaseWipe,
  overrideBranding,
  systemBroadcast
} from '../controllers/creatorController.js';
import { protect, authorize } from '../middlewares/auth.js';

const router = express.Router();

// All routes require 'owner' role
router.use(protect);
router.use(authorize('owner'));

router.get('/audit', getAuditLogs);
router.put('/god-mode/:userId', updateAuraGodMode);
router.get('/backup', databaseBackup);
router.delete('/wipe', databaseWipe);
router.put('/branding', overrideBranding);
router.post('/broadcast', systemBroadcast);

export default router;
