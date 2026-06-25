import User from '../models/User.js';
import Warning from '../models/Warning.js';
import AdminNote from '../models/AdminNote.js';
import { logActivity, sendNotification } from '../utils/tracker.js';
import { logSecurityEvent } from '../utils/securityLogger.js';
import logger from '../middlewares/logger.js';

// Helper to revoke premium if active
const revokePremiumIfNeeded = async (user) => {
  if (user.isPremium) {
    user.isPremium = false;
    user.premiumStatus = 'Revoked';
    if (user.role === 'premium_user') {
      user.role = 'user';
    }
    await logActivity(user._id, 'Premium Revoked', 'Premium revoked due to account ban/suspension');
    await sendNotification(user._id, 'Premium Revoked', 'Your premium status has been revoked due to account restrictions.', 'PREMIUM', 'Star');
  }
};

// @desc    Ban User
// @route   PUT /api/users/:id/ban
// @access  Private/Admin
export const banUser = async (req, res) => {
  try {
    const { reason, days } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    if (user.role === 'superadmin' || (user.role === 'admin' && req.user.role === 'admin')) {
      return res.status(403).json({ success: false, message: 'Cannot ban this user' });
    }

    user.status = 'banned';
    user.banReason = reason || 'Violation of terms';
    user.bannedBy = req.user._id;
    user.actionDate = Date.now();

    if (days && days > 0) {
      const banEndDate = new Date();
      banEndDate.setDate(banEndDate.getDate() + parseInt(days));
      user.banEndDate = banEndDate;
    } else {
      user.banEndDate = null; // Permanent
    }

    await revokePremiumIfNeeded(user);
    await user.save();

    await logActivity(req.user._id, 'User Banned', `Banned user ${user.email}. Reason: ${reason}`);
    await logSecurityEvent({ eventType: 'USER_BANNED', req, details: { bannedUserId: user._id, reason, days } });

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    logger.error(`Ban User Error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Unban User
// @route   PUT /api/users/:id/unban
// @access  Private/Admin
export const unbanUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.status = 'active';
    user.banReason = undefined;
    user.banEndDate = undefined;
    user.bannedBy = undefined;
    user.actionDate = undefined;

    await user.save();

    await logActivity(req.user._id, 'User Unbanned', `Unbanned user ${user.email}`);
    await logSecurityEvent({ eventType: 'USER_UNBANNED', req, details: { unbannedUserId: user._id } });
    await sendNotification(user._id, 'Account Restored', 'Your account ban has been lifted.', 'SYSTEM', 'CheckCircle');

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    logger.error(`Unban User Error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Suspend User
// @route   PUT /api/users/:id/suspend
// @access  Private/Admin
export const suspendUser = async (req, res) => {
  try {
    const { reason, days } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    if (user.role === 'superadmin' || (user.role === 'admin' && req.user.role === 'admin')) {
      return res.status(403).json({ success: false, message: 'Cannot suspend this user' });
    }

    user.status = 'suspended';
    user.suspendedReason = reason || 'Violation of terms';
    user.suspendedBy = req.user._id;
    user.actionDate = Date.now();

    const suspendDays = days || 7;
    const suspensionEndDate = new Date();
    suspensionEndDate.setDate(suspensionEndDate.getDate() + parseInt(suspendDays));
    user.suspensionEndDate = suspensionEndDate;

    await user.save();

    await logActivity(req.user._id, 'User Suspended', `Suspended user ${user.email} for ${suspendDays} days.`);
    await logSecurityEvent({ eventType: 'USER_SUSPENDED', req, details: { suspendedUserId: user._id, reason, days: suspendDays } });
    await sendNotification(user._id, 'Account Suspended', `Your account has been suspended for ${suspendDays} days. Reason: ${reason}`, 'MODERATION', 'ShieldAlert');

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    logger.error(`Suspend User Error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Restore User (from suspension)
// @route   PUT /api/users/:id/restore
// @access  Private/Admin
export const restoreUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.status = 'active';
    user.suspendedReason = undefined;
    user.suspensionEndDate = undefined;
    user.suspendedBy = undefined;
    user.actionDate = undefined;

    await user.save();

    await logActivity(req.user._id, 'User Restored', `Restored suspended user ${user.email}`);
    await logSecurityEvent({ eventType: 'USER_RESTORED', req, details: { restoredUserId: user._id } });
    await sendNotification(user._id, 'Account Restored', 'Your account suspension has been lifted.', 'SYSTEM', 'CheckCircle');

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    logger.error(`Restore User Error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Warn User
// @route   PUT /api/users/:id/warn
// @access  Private/Admin
export const warnUser = async (req, res) => {
  try {
    const { reason } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    await Warning.create({
      user: user._id,
      issuedBy: req.user._id,
      reason
    });

    user.warnings += 1;
    await user.save();

    await logActivity(req.user._id, 'User Warned', `Issued warning to user ${user.email}. Reason: ${reason}`);
    await sendNotification(user._id, 'Account Warning', `You have received a warning: ${reason}`, 'MODERATION', 'ShieldAlert');

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    logger.error(`Warn User Error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Add Admin Note
// @route   POST /api/users/:id/note
// @access  Private/Admin
export const addAdminNote = async (req, res) => {
  try {
    const { note } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const newNote = await AdminNote.create({
      user: user._id,
      admin: req.user._id,
      note
    });

    await newNote.populate('admin', 'name email');
    res.status(201).json({ success: true, data: newNote });
  } catch (error) {
    logger.error(`Add Note Error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Get Admin Notes
// @route   GET /api/users/:id/notes
// @access  Private/Admin
export const getAdminNotes = async (req, res) => {
  try {
    const notes = await AdminNote.find({ user: req.params.id })
      .populate('admin', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: notes });
  } catch (error) {
    logger.error(`Get Notes Error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Update User Restrictions
// @route   PUT /api/users/:id/restrictions
// @access  Private/Admin
export const updateRestrictions = async (req, res) => {
  try {
    const { restrictions } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.restrictions = { ...user.restrictions, ...restrictions };
    
    if (restrictions.avatarReset) {
      user.profileImage = 'default.jpg';
      user.restrictions.avatarReset = false; // reset flag
    }

    await user.save();

    await logActivity(req.user._id, 'User Restrictions Updated', `Updated restrictions for user ${user.email}`);
    await sendNotification(user._id, 'Account Restrictions Update', 'Your account restrictions have been updated by an administrator.', 'MODERATION', 'ShieldAlert');

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    logger.error(`Update Restrictions Error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
