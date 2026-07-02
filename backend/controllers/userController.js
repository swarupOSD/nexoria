import logger from '../middlewares/logger.js';
import UserActivity from '../models/UserActivity.js';
import User from '../models/User.js';
import { logActivity, sendNotification } from '../utils/tracker.js';

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
export const getUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password -refreshTokens').sort({ createdAt: -1 });
    res.json({ success: true, count: users.length, data: users });
  } catch (error) {
    logger.error(`Get Users Error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private/Admin
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password -refreshTokens');
    if (user) {
      res.json({ success: true, data: user });
    } else {
      res.status(404).json({ success: false, message: 'User not found' });
    }
  } catch (error) {
    logger.error(`Get User Error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Get current user's activity
// @route   GET /api/users/me/activity
// @access  Private
export const getMyActivity = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const startIndex = (page - 1) * limit;

    const activities = await UserActivity.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limit);

    res.json({ success: true, data: activities });
  } catch (error) {
    logger.error(`Get My Activity Error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Update user status & role
// @route   PUT /api/users/:id
// @access  Private/Admin (Admin can't change superadmin)
export const updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (req.user.role === 'admin' && user.role === 'superadmin') {
      return res.status(403).json({ success: false, message: 'Admin cannot modify superadmin' });
    }
    
    // Only superadmin can assign admin/superadmin
    if (req.body.role && req.body.role !== user.role) {
       if (req.user.role !== 'superadmin' && (req.body.role === 'admin' || req.body.role === 'superadmin')) {
          return res.status(403).json({ success: false, message: 'Only superadmin can grant admin roles' });
       }
       user.role = req.body.role;
    }

    if (req.body.accountStatus) user.accountStatus = req.body.accountStatus;

    await user.save();
    
    if (req.body.role) {
      await logActivity(user._id, 'Role Updated', `Role changed to ${req.body.role}`, req);
      await sendNotification(user._id, 'Role Updated', `Your account role has been updated to ${req.body.role}.`, 'ADMIN', 'Shield');
    }

    res.json({ success: true, data: user });
  } catch (error) {
    logger.error(`Update User Error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Manage Premium Status
// @route   PUT /api/users/:id/premium
// @access  Private/Admin
export const managePremium = async (req, res) => {
  try {
    const { action, premiumType, customDays } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (action === 'grant') {
      user.isPremium = true;
      user.premiumType = premiumType;
      user.premiumStartDate = new Date();
      user.premiumGrantedBy = req.user._id;
      user.premiumStatus = 'Active';

      if (user.role === 'user') {
        user.role = 'premium_user';
      }

      const endDate = new Date();
      if (premiumType === '7 Days') endDate.setDate(endDate.getDate() + 7);
      else if (premiumType === '30 Days') endDate.setDate(endDate.getDate() + 30);
      else if (premiumType === 'Custom Duration' && customDays) endDate.setDate(endDate.getDate() + customDays);
      else if (premiumType === 'Lifetime') endDate.setFullYear(endDate.getFullYear() + 100);

      user.premiumEndDate = endDate;
    } else if (action === 'revoke') {
      user.isPremium = false;
      user.premiumType = 'None';
      user.premiumStartDate = null;
      user.premiumEndDate = null;
      user.premiumGrantedBy = null;
      user.premiumStatus = 'Revoked';
      
      if (user.role === 'premium_user') {
        user.role = 'user';
      }
    }

    await user.save();

    if (action === 'grant') {
      await logActivity(user._id, 'Premium Activated', `Granted ${premiumType}`, req);
      await sendNotification(user._id, 'Premium Activated', `You have been granted ${premiumType} Premium.`, 'PREMIUM', 'Star');
    } else if (action === 'revoke') {
      await logActivity(user._id, 'Premium Revoked', `Premium membership revoked`, req);
      await sendNotification(user._id, 'Premium Revoked', `Your Premium membership has been revoked.`, 'PREMIUM', 'XCircle');
    }

    res.json({ success: true, data: user });
  } catch (error) {
    logger.error(`Manage Premium Error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/SuperAdmin
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    await user.deleteOne();
    res.json({ success: true, message: 'User removed' });
  } catch (error) {
    logger.error(`Delete User Error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
// @desc    Get user wishlist
// @route   GET /api/users/me/wishlist
// @access  Private
export const getWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: 'wishlist',
      select: 'title slug appLogo category isPremium averageRating downloads',
      populate: { path: 'category', select: 'name slug' }
    });
    
    res.status(200).json({ success: true, count: user.wishlist.length, data: user.wishlist });
  } catch (error) {
    logger.error(`Get Wishlist Error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Add post to wishlist
// @route   POST /api/users/me/wishlist
// @access  Private
export const addToWishlist = async (req, res) => {
  try {
    const { postId } = req.body;
    const user = await User.findById(req.user._id);

    if (user.wishlist.includes(postId)) {
      return res.status(400).json({ success: false, message: 'App is already in your wishlist' });
    }

    user.wishlist.push(postId);
    await user.save();

    await logActivity(req.user._id, 'Wishlist Add', `Added an app to wishlist`, req);

    res.status(200).json({ success: true, message: 'Added to wishlist', data: user.wishlist });
  } catch (error) {
    logger.error(`Add to Wishlist Error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Subscribe to push notifications
// @route   POST /api/users/push-subscribe
// @access  Private
export const subscribeToPush = async (req, res) => {
  try {
    const { subscription } = req.body;
    if (!subscription || !subscription.endpoint) {
      return res.status(400).json({ success: false, message: 'Invalid subscription' });
    }

    const user = await User.findById(req.user.id);
    
    // Check if already subscribed
    const isSubscribed = user.pushSubscriptions.some(sub => sub.endpoint === subscription.endpoint);
    if (!isSubscribed) {
      user.pushSubscriptions.push(subscription);
      await user.save();
    }

    res.status(200).json({ success: true, message: 'Subscribed to push notifications' });
  } catch (error) {
    logger.error(`Push Subscribe Error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Unsubscribe from push notifications
// @route   POST /api/users/push-unsubscribe
// @access  Private
export const unsubscribeFromPush = async (req, res) => {
  try {
    const { endpoint } = req.body;
    if (!endpoint) return res.status(400).json({ success: false, message: 'Endpoint required' });

    const user = await User.findById(req.user.id);
    user.pushSubscriptions = user.pushSubscriptions.filter(sub => sub.endpoint !== endpoint);
    await user.save();

    res.status(200).json({ success: true, message: 'Unsubscribed from push notifications' });
  } catch (error) {
    logger.error(`Push Unsubscribe Error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Update FCM Token for Push Notifications
// @route   POST /api/users/fcm-token
// @access  Private
export const updateFCMToken = async (req, res) => {
  try {
    const { fcmToken } = req.body;
    if (!fcmToken) return res.status(400).json({ success: false, message: 'FCM Token required' });

    const user = await User.findById(req.user.id);
    
    // Add token if it doesn't exist
    if (!user.fcmTokens.includes(fcmToken)) {
      user.fcmTokens.push(fcmToken);
      await user.save();
    }

    res.status(200).json({ success: true, message: 'FCM Token updated' });
  } catch (error) {
    logger.error(`Update FCM Token Error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Remove post from wishlist
// @route   DELETE /api/users/me/wishlist/:postId
// @access  Private
export const removeFromWishlist = async (req, res) => {
  try {
    const { postId } = req.params;
    const user = await User.findById(req.user._id);

    user.wishlist = user.wishlist.filter(id => id.toString() !== postId);
    await user.save();

    res.status(200).json({ success: true, message: 'Removed from wishlist', data: user.wishlist });
  } catch (error) {
    logger.error(`Remove from Wishlist Error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Update Profile Theme
// @route   PUT /api/users/theme
// @access  Private (Premium/Admin only)
export const updateTheme = async (req, res) => {
  try {
    const { theme } = req.body;
    
    if (!theme) return res.status(400).json({ success: false, message: 'Theme is required' });

    const user = await User.findById(req.user.id);
    
    if (user.role === 'user' && !user.isPremium) {
      return res.status(403).json({ success: false, message: 'Premium is required to change themes' });
    }

    const allowedThemes = ['default', 'cyberpunk', 'synthwave', 'neon'];
    if (!allowedThemes.includes(theme)) {
      return res.status(400).json({ success: false, message: 'Invalid theme' });
    }

    user.profileTheme = theme;
    await user.save();

    res.status(200).json({ success: true, message: 'Theme updated successfully', data: user.profileTheme });
  } catch (error) {
    logger.error(`Update Theme Error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
