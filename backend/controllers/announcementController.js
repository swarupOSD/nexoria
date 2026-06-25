import Announcement from '../models/Announcement.js';
import logger from '../middlewares/logger.js';
import { sendNotification } from '../utils/tracker.js';
import User from '../models/User.js';

// @desc    Get active announcements
// @route   GET /api/announcements
// @access  Public
export const getActiveAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.find({
      isActive: true,
      $or: [
        { expiresAt: { $exists: false } },
        { expiresAt: null },
        { expiresAt: { $gt: Date.now() } }
      ]
    }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: announcements });
  } catch (error) {
    logger.error(`Get Announcements Error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Get all announcements (Admin)
// @route   GET /api/announcements/admin
// @access  Private/Admin
export const getAllAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: announcements });
  } catch (error) {
    logger.error(`Get All Announcements Error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Create announcement
// @route   POST /api/announcements
// @access  Private/Admin
export const createAnnouncement = async (req, res) => {
  try {
    const { title, content, type, isActive, link, linkText, expiresAt, notifyUsers } = req.body;

    const announcement = await Announcement.create({
      title,
      content,
      type,
      isActive,
      link,
      linkText,
      expiresAt,
      createdBy: req.user._id
    });

    if (notifyUsers) {
      // Broadcast notification to all active users (this is a heavy operation, so we do it asynchronously or use a broadcast method if implemented)
      // For now, we'll implement a basic bulk notification
      const users = await User.find({ status: 'active' }).select('_id');
      const notifications = users.map(u => ({
        user: u._id,
        title: `Announcement: ${title}`,
        message: content.substring(0, 100) + '...',
        type: 'SYSTEM',
        icon: 'Info',
        actionUrl: link || '/'
      }));
      
      const { default: Notification } = await import('../models/Notification.js');
      await Notification.insertMany(notifications);
    }

    res.status(201).json({ success: true, data: announcement });
  } catch (error) {
    logger.error(`Create Announcement Error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Update announcement
// @route   PUT /api/announcements/:id
// @access  Private/Admin
export const updateAnnouncement = async (req, res) => {
  try {
    let announcement = await Announcement.findById(req.params.id);

    if (!announcement) {
      return res.status(404).json({ success: false, message: 'Announcement not found' });
    }

    announcement = await Announcement.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({ success: true, data: announcement });
  } catch (error) {
    logger.error(`Update Announcement Error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Delete announcement
// @route   DELETE /api/announcements/:id
// @access  Private/Admin
export const deleteAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);

    if (!announcement) {
      return res.status(404).json({ success: false, message: 'Announcement not found' });
    }

    await announcement.deleteOne();

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    logger.error(`Delete Announcement Error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
