import User from '../models/User.js';
import MembershipHistory from '../models/MembershipHistory.js';
import { sendNotification } from '../utils/tracker.js';
import { logSecurityEvent } from '../utils/securityLogger.js';
import logger from '../middlewares/logger.js';

// @desc    Grant or extend premium for a user manually
// @route   POST /api/admin/premium/assign
// @access  Private/SuperAdmin
export const assignPremium = async (req, res) => {
  try {
    const { userId, durationMonths, reason } = req.body;
    
    if (!userId || !durationMonths) {
      return res.status(400).json({ success: false, message: 'Please provide user ID and duration.' });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    let newExpiryDate;
    let premiumType;
    let actionDesc;

    if (durationMonths === 'lifetime') {
      newExpiryDate = new Date('2099-12-31T23:59:59.999Z');
      premiumType = 'Lifetime';
      actionDesc = 'Granted Lifetime Premium';
    } else {
      const months = parseInt(durationMonths, 10);
      newExpiryDate = new Date();
      newExpiryDate.setMonth(newExpiryDate.getMonth() + months);
      premiumType = `${months} Month${months > 1 ? 's' : ''}`;
      actionDesc = `Granted ${months}-Month Premium`;
    }

    const previousExpiry = user.premiumEndDate;
    
    // Extend if already premium and not lifetime
    if (user.isPremium && user.premiumType !== 'Lifetime' && durationMonths !== 'lifetime') {
       if (user.premiumEndDate && new Date(user.premiumEndDate) > new Date()) {
         newExpiryDate = new Date(user.premiumEndDate);
         newExpiryDate.setMonth(newExpiryDate.getMonth() + parseInt(durationMonths, 10));
         actionDesc = `Extended Premium by ${durationMonths} Months`;
       }
    }

    user.isPremium = true;
    user.premiumType = premiumType;
    user.premiumStartDate = new Date();
    user.premiumEndDate = newExpiryDate;
    user.premiumStatus = 'Active';
    user.premiumGrantedBy = req.user._id;

    await user.save();

    await MembershipHistory.create({
      user: user._id,
      action: actionDesc,
      details: `Admin: ${req.user.name}. Reason: ${reason || 'Manual Assignment'}. Old Expiry: ${previousExpiry ? new Date(previousExpiry).toISOString() : 'None'}`
    });

    await logSecurityEvent({
      eventType: 'MANUAL_PREMIUM_ASSIGNED',
      userId: req.user._id,
      details: { targetUser: user._id, type: premiumType },
      req
    });

    await sendNotification(user._id, 'Premium Membership Granted!', `You have been granted ${premiumType} premium access by an administrator.`, 'PREMIUM', 'User');

    res.status(200).json({ success: true, message: 'Premium granted successfully', user });
  } catch (error) {
    logger.error(`Assign Premium Error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Revoke premium status manually
// @route   POST /api/admin/premium/revoke
// @access  Private/SuperAdmin
export const revokePremium = async (req, res) => {
  try {
    const { userId, reason } = req.body;
    
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const previousExpiry = user.premiumEndDate;

    user.isPremium = false;
    user.premiumType = 'None';
    user.premiumStatus = 'Revoked';
    // keep dates for history but mark revoked

    await user.save();

    await MembershipHistory.create({
      user: user._id,
      action: 'Premium Revoked',
      details: `Admin: ${req.user.name}. Reason: ${reason || 'Manual Revocation'}. Old Expiry: ${previousExpiry ? new Date(previousExpiry).toISOString() : 'None'}`
    });

    await sendNotification(user._id, 'Premium Revoked', `Your premium membership has been revoked by an administrator.`, 'SYSTEM', 'User');

    res.status(200).json({ success: true, message: 'Premium revoked successfully', user });
  } catch (error) {
    logger.error(`Revoke Premium Error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get Premium history for a user
// @route   GET /api/admin/premium/history/:id
// @access  Private/SuperAdmin
export const getPremiumHistory = async (req, res) => {
  try {
    const history = await MembershipHistory.find({ user: req.params.id }).sort({ date: -1 });
    res.status(200).json({ success: true, data: history });
  } catch (error) {
    logger.error(`Get Premium History Error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
