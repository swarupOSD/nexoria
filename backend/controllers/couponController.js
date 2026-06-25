import Coupon from '../models/Coupon.js';
import User from '../models/User.js';
import logger from '../middlewares/logger.js';
import { logActivity, sendNotification } from '../utils/tracker.js';

// @desc    Redeem a coupon
// @route   POST /api/coupons/redeem
// @access  Private
export const redeemCoupon = async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) return res.status(400).json({ success: false, message: 'Coupon code required' });

    const coupon = await Coupon.findOne({ code: code.toUpperCase() });
    if (!coupon) return res.status(404).json({ success: false, message: 'Invalid coupon code' });

    if (!coupon.isActive) return res.status(400).json({ success: false, message: 'Coupon is inactive' });
    if (coupon.expiresAt && new Date() > coupon.expiresAt) return res.status(400).json({ success: false, message: 'Coupon expired' });
    if (coupon.usedCount >= coupon.usageLimit) return res.status(400).json({ success: false, message: 'Coupon usage limit reached' });

    const hasUsed = coupon.usedBy.some(u => u.user.toString() === req.user._id.toString());
    if (hasUsed) return res.status(400).json({ success: false, message: 'You have already used this coupon' });

    // Apply Reward
    const user = await User.findById(req.user._id);
    let rewardMsg = '';

    if (coupon.rewardType === 'Points') {
      user.rewardPoints += coupon.rewardValue;
      rewardMsg = `Earned ${coupon.rewardValue} Points`;
    } else if (coupon.rewardType === 'PremiumDays') {
      user.isPremium = true;
      user.premiumStatus = 'Active';
      user.premiumType = 'Coupon Reward';
      user.role = user.role === 'superadmin' || user.role === 'admin' ? user.role : 'premium_user';
      
      const newEndDate = user.premiumEndDate && user.premiumEndDate > new Date() 
        ? new Date(user.premiumEndDate.getTime() + (coupon.rewardValue * 24 * 60 * 60 * 1000))
        : new Date(Date.now() + (coupon.rewardValue * 24 * 60 * 60 * 1000));
        
      user.premiumEndDate = newEndDate;
      user.premiumStartDate = user.premiumStartDate || new Date();
      rewardMsg = `Earned ${coupon.rewardValue} Days of Premium`;
    }

    await user.save();

    // Update Coupon
    coupon.usedCount += 1;
    coupon.usedBy.push({ user: user._id });
    await coupon.save();

    await logActivity(user._id, 'Coupon Redeemed', `Redeemed coupon ${coupon.code}: ${rewardMsg}`);
    await sendNotification(user._id, 'Coupon Redeemed', `You successfully redeemed a coupon. ${rewardMsg}`, 'REWARD', 'Gift');

    res.json({ success: true, message: `Coupon redeemed! ${rewardMsg}` });

  } catch (error) {
    logger.error(`Redeem Coupon Error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Get all coupons
// @route   GET /api/coupons
// @access  Private/Admin
export const getCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find({}).sort('-createdAt').populate('createdBy', 'name');
    res.json({ success: true, data: coupons });
  } catch (error) {
    logger.error(`Get Coupons Error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Create a coupon
// @route   POST /api/coupons
// @access  Private/Admin
export const createCoupon = async (req, res) => {
  try {
    const { code, rewardType, rewardValue, usageLimit, expiresAt } = req.body;
    
    const existing = await Coupon.findOne({ code: code.toUpperCase() });
    if (existing) return res.status(400).json({ success: false, message: 'Coupon code already exists' });

    const coupon = await Coupon.create({
      code: code.toUpperCase(),
      rewardType,
      rewardValue,
      usageLimit,
      expiresAt: expiresAt || null,
      createdBy: req.user._id
    });

    res.status(201).json({ success: true, data: coupon });
  } catch (error) {
    logger.error(`Create Coupon Error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Delete a coupon
// @route   DELETE /api/coupons/:id
// @access  Private/Admin
export const deleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) return res.status(404).json({ success: false, message: 'Coupon not found' });
    
    await coupon.deleteOne();
    res.json({ success: true, message: 'Coupon deleted' });
  } catch (error) {
    logger.error(`Delete Coupon Error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
