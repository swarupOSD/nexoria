import ContactMessage from '../models/ContactMessage.js';
import Notification from '../models/Notification.js';
import logger from '../middlewares/logger.js';
import { getIO } from '../config/socket.js';
import sendEmail from '../utils/sendEmail.js';
import { getTicketReplyTemplate } from '../utils/emailTemplates.js';

// @desc    Get all contact messages (Admin)
// @route   GET /api/contact
// @access  Private/Admin
export const getMessages = async (req, res) => {
  try {
    const { search, status, priority, category } = req.query;
    let query = {};
    if (search) {
      query.$or = [
        { email: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } }
      ];
    }
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (category) query.category = category;

    const messages = await ContactMessage.find(query).populate('user', 'name email profileImage').sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: messages });
  } catch (error) {
    logger.error(`Get Contact Messages Error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Get user's contact messages
// @route   GET /api/contact/my-tickets
// @access  Private
export const getUserMessages = async (req, res) => {
  try {
    const messages = await ContactMessage.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: messages });
  } catch (error) {
    logger.error(`Get User Messages Error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Create contact message
// @route   POST /api/contact
// @access  Public
export const createMessage = async (req, res) => {
  try {
    const { name, email, subject, message, category, priority, attachments, deviceInfo } = req.body;
    
    const newMessage = await ContactMessage.create({
      name,
      email,
      subject,
      message,
      category: category || 'Support',
      priority: priority || 'Medium',
      attachments: attachments || [],
      deviceInfo,
      ipAddress: req.ip,
      user: req.user ? req.user.id : null
    });
    
    try {
      getIO().to('admin').emit('newTicket', newMessage);
    } catch(e) {}

    res.status(201).json({ success: true, data: newMessage });
  } catch (error) {
    logger.error(`Create Contact Message Error: ${error.message}`);
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Add reply to message
// @route   POST /api/contact/:id/reply
// @access  Private
export const replyMessage = async (req, res) => {
  try {
    const { content, attachments } = req.body;
    const message = await ContactMessage.findById(req.params.id);

    if (!message) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }

    // Determine sender based on user role
    const isAdmin = req.user.role === 'admin' || req.user.role === 'superadmin';
    const sender = isAdmin ? 'Admin' : 'User';

    // If user is replying, make sure they own the ticket
    if (!isAdmin && message.user?.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const newReply = {
      sender,
      user: req.user.id,
      content,
      attachments: attachments || [],
      createdAt: new Date(),
      read: false
    };

    message.replies.push(newReply);

    if (isAdmin && message.status === 'Open') {
      message.status = 'In Progress';
    } else if (!isAdmin) {
      if (message.status === 'Resolved' || message.status === 'Closed') {
        message.status = 'Pending';
        message.isResolved = false;
      }
    }

    await message.save();

    const savedReply = message.replies[message.replies.length - 1];

    try {
      getIO().emit('ticket_reply', { ticketId: message._id.toString(), reply: savedReply });
    } catch(e) {}

    // Send Notification if Admin replied
    if (isAdmin && message.user) {
      const notification = await Notification.create({
        user: message.user,
        title: 'Support Ticket Update',
        message: `Admin replied to your ticket: "${message.subject}"`,
        type: 'ADMIN',
        icon: 'MessageSquare',
        actionUrl: '/support'
      });

      try {
        getIO().to(message.user.toString()).emit('newNotification', notification);
      } catch(e) {}

      try {
        await sendEmail({
          email: message.email,
          subject: `Re: ${message.subject}`,
          html: getTicketReplyTemplate(message.name || 'User', message.subject, content, `${process.env.FRONTEND_URL || 'http://localhost:5173'}/support`)
        });
      } catch(e) {}
    }

    res.status(200).json({ success: true, data: message });
  } catch (error) {
    logger.error(`Reply Message Error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Update message status
// @route   PUT /api/contact/:id/status
// @access  Private/Admin
export const updateMessageStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const message = await ContactMessage.findById(req.params.id);
    if (!message) return res.status(404).json({ success: false, message: 'Message not found' });

    message.status = status;
    if (status === 'Resolved' || status === 'Closed') {
      message.isResolved = true;
    } else {
      message.isResolved = false;
    }

    await message.save();
    res.status(200).json({ success: true, data: message });
  } catch (error) {
    logger.error(`Update Message Status Error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Update message priority
// @route   PUT /api/contact/:id/priority
// @access  Private/Admin
export const updateMessagePriority = async (req, res) => {
  try {
    const { priority } = req.body;
    const message = await ContactMessage.findById(req.params.id);
    if (!message) return res.status(404).json({ success: false, message: 'Message not found' });

    message.priority = priority;
    await message.save();
    res.status(200).json({ success: true, data: message });
  } catch (error) {
    logger.error(`Update Message Priority Error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Resolve contact message (legacy)
// @route   PUT /api/contact/:id/resolve
// @access  Private/Admin
export const resolveMessage = async (req, res) => {
  try {
    const message = await ContactMessage.findById(req.params.id);
    if (!message) return res.status(404).json({ success: false, message: 'Message not found' });
    message.isResolved = true;
    message.status = 'Resolved';
    await message.save();
    res.status(200).json({ success: true, data: message });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Delete contact message
// @route   DELETE /api/contact/:id
// @access  Private/Admin
export const deleteMessage = async (req, res) => {
  try {
    const message = await ContactMessage.findById(req.params.id);
    if (!message) return res.status(404).json({ success: false, message: 'Message not found' });
    
    await ContactMessage.deleteOne({ _id: message._id });
    res.status(200).json({ success: true, message: 'Message deleted successfully' });
  } catch (error) {
    logger.error(`Delete Message Error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Get contact analytics
// @route   GET /api/contact/analytics
// @access  Private/Admin
export const getContactAnalytics = async (req, res) => {
  try {
    const total = await ContactMessage.countDocuments();
    const open = await ContactMessage.countDocuments({ status: { $in: ['Open', 'Pending', 'In Progress'] } });
    const resolved = await ContactMessage.countDocuments({ status: { $in: ['Resolved', 'Closed'] } });
    
    const byCategory = await ContactMessage.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } }
    ]);
    
    const byPriority = await ContactMessage.aggregate([
      { $group: { _id: "$priority", count: { $sum: 1 } } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        total,
        open,
        resolved,
        byCategory,
        byPriority
      }
    });
  } catch (error) {
    logger.error(`Get Contact Analytics Error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
