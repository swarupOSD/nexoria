import express from 'express';
import {
  createTicket,
  getAllTickets,
  getMyTickets,
  resolveTicket,
  deleteTicket,
} from '../controllers/supportTicketController.js';
import { protect, authorize } from '../middlewares/auth.js';

const router = express.Router();

// User routes
router.post('/', protect, createTicket);
router.get('/my', protect, getMyTickets);

// Admin routes
router.get('/admin', protect, authorize('owner'), getAllTickets);
router.put('/admin/:id', protect, authorize('owner'), resolveTicket);
router.delete('/admin/:id', protect, authorize('owner'), deleteTicket);

export default router;
