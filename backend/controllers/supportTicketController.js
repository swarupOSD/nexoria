import SupportTicket from '../models/SupportTicket.js';
import { sendNotification } from '../utils/tracker.js';
import { getIO } from '../config/socket.js';

// @desc    Create a support ticket (user)
// @route   POST /api/support-tickets
// @access  Private
export const createTicket = async (req, res) => {
  try {
    const { type, subject, description, userEmail } = req.body;

    const ticket = await SupportTicket.create({
      user: req.user.id,
      type,
      subject,
      description,
      userEmail: userEmail || req.user.email,
      priority: type === 'forgot_password' || type === 'account_locked' ? 'urgent' : 'medium',
    });

    const populatedTicket = await SupportTicket.findById(ticket._id).populate('user', 'name email profileImage role');
    try {
      getIO().to('admin').emit('newSupportTicket', populatedTicket);
    } catch (e) {
      console.log('Socket emit failed for new ticket');
    }

    res.status(201).json({ success: true, data: ticket });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message || 'Failed to create ticket' });
  }
};

// @desc    Get all tickets (admin)
// @route   GET /api/support-tickets/admin
// @access  Private/Admin
export const getAllTickets = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.type) filter.type = req.query.type;
    if (req.query.priority) filter.priority = req.query.priority;

    const total = await SupportTicket.countDocuments(filter);
    const tickets = await SupportTicket.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('user', 'name email profileImage role')
      .populate('resolvedBy', 'name');

    // Stats summary
    const stats = {
      open: await SupportTicket.countDocuments({ status: 'open' }),
      in_progress: await SupportTicket.countDocuments({ status: 'in_progress' }),
      resolved: await SupportTicket.countDocuments({ status: 'resolved' }),
      urgent: await SupportTicket.countDocuments({ priority: 'urgent', status: { $ne: 'resolved' } }),
    };

    res.status(200).json({
      success: true,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      stats,
      data: tickets,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Get user's own tickets
// @route   GET /api/support-tickets/my
// @access  Private
export const getMyTickets = async (req, res) => {
  try {
    const tickets = await SupportTicket.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .populate('resolvedBy', 'name');
    res.status(200).json({ success: true, data: tickets });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Update ticket (admin resolve/note)
// @route   PUT /api/support-tickets/admin/:id
// @access  Private/Admin
export const resolveTicket = async (req, res) => {
  try {
    const { status, adminNote, priority } = req.body;

    const update = { status, adminNote, priority };
    if (status === 'resolved') {
      update.resolvedBy = req.user.id;
      update.resolvedAt = new Date();
    }

    const ticket = await SupportTicket.findByIdAndUpdate(
      req.params.id,
      update,
      { new: true, runValidators: true }
    ).populate('user', 'name email');

    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    // Notify user
    let message = `Your support ticket "${ticket.subject}" has been updated to: ${status}.`;
    if (adminNote) message += ` Admin note: "${adminNote}"`;

    await sendNotification(
      ticket.user._id,
      'Support Ticket Update',
      message,
      'SYSTEM',
      status === 'resolved' ? 'Success' : 'Info'
    );

    res.status(200).json({ success: true, data: ticket });
  } catch (err) {
    res.status(400).json({ success: false, message: 'Failed to update ticket' });
  }
};

// @desc    Delete ticket
// @route   DELETE /api/support-tickets/admin/:id
// @access  Private/Admin
export const deleteTicket = async (req, res) => {
  try {
    const ticket = await SupportTicket.findByIdAndDelete(req.params.id);
    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }
    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
