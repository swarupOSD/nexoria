import Notification from '../models/Notification.js';
import UserActivity from '../models/UserActivity.js';
import logger from '../middlewares/logger.js';
import { getIO } from '../config/socket.js';
import { sendPushNotification } from './webPush.js';

/**
 * Log a user activity
 */
export const logActivity = async (userId, actionType, description, req = null, metadata = {}) => {
  try {
    if (!userId) return;
    
    let ipAddress = '';
    let userAgent = '';
    
    if (req) {
      ipAddress = req.ip || req.connection?.remoteAddress || '';
      userAgent = req.get('User-Agent') || '';
    }

    const activity = await UserActivity.create({
      user: userId,
      actionType,
      description,
      ipAddress,
      userAgent,
      metadata
    });

    // Populate user for admin feed
    const populatedActivity = await UserActivity.findById(activity._id).populate('user', 'name email avatar');

    try {
      getIO().to('admin').emit('newActivity', populatedActivity);
    } catch(e) {}
  } catch (error) {
    logger.error(`Failed to log activity: ${error.message}`);
  }
};

/**
 * Send a notification
 */
export const sendNotification = async (userId, title, message, type, icon = 'Bell', actionUrl = null) => {
  try {
    if (!userId) return;

    const notification = await Notification.create({
      user: userId,
      title,
      message,
      type,
      icon,
      actionUrl
    });

    try {
      getIO().to('admin').emit('newNotification', notification);
      getIO().to(userId.toString()).emit('newNotification', notification);
    } catch(e) {}

    try {
      await sendPushNotification(userId, {
        title,
        body: message,
        icon: icon === 'MessageSquare' ? '/icon-192x192.png' : '/icon-192x192.png',
        url: actionUrl || '/'
      });
    } catch(e) {}

  } catch (error) {
    logger.error(`Failed to send notification: ${error.message}`);
  }
};

/**
 * Emit Admin Event manually
 */
export const emitAdminEvent = (eventName, data) => {
  try {
    getIO().to('admin').emit(eventName, data);
  } catch(e) {}
};

/**
 * Emit Global Event manually
 */
export const emitGlobalEvent = (eventName, data) => {
  try {
    getIO().emit(eventName, data);
  } catch(e) {}
};
