import User from '../models/User.js';
import logger from '../middlewares/logger.js';
import { logActivity, sendNotification } from './tracker.js';

const checkExpiries = async () => {
  try {
    const now = new Date();

    // Find users whose temporary ban has expired
    const expiredBans = await User.find({
      status: 'banned',
      banEndDate: { $lt: now, $ne: null }
    });

    if (expiredBans.length > 0) {
      for (const user of expiredBans) {
        user.status = 'active';
        user.banReason = undefined;
        user.banEndDate = undefined;
        user.bannedBy = undefined;
        user.actionDate = undefined;
        await user.save();
        
        await logActivity(user._id, 'Ban Expired', 'Temporary ban automatically expired and account restored');
        await sendNotification(user._id, 'Account Restored', 'Your temporary ban has expired. Welcome back!', 'SYSTEM', 'CheckCircle');
      }
      logger.info(`Restored ${expiredBans.length} users from temporary bans.`);
    }

    // Find users whose suspension has expired
    const expiredSuspensions = await User.find({
      status: 'suspended',
      suspensionEndDate: { $lt: now, $ne: null }
    });

    if (expiredSuspensions.length > 0) {
      for (const user of expiredSuspensions) {
        user.status = 'active';
        user.suspendedReason = undefined;
        user.suspensionEndDate = undefined;
        user.suspendedBy = undefined;
        user.actionDate = undefined;
        await user.save();
        
        await logActivity(user._id, 'Suspension Expired', 'Suspension automatically expired and account restored');
        await sendNotification(user._id, 'Account Restored', 'Your suspension has expired. Welcome back!', 'SYSTEM', 'CheckCircle');
      }
      logger.info(`Restored ${expiredSuspensions.length} users from suspensions.`);
    }

  } catch (error) {
    logger.error(`User Expiry Job Error: ${error.message}`);
  }
};

export const startUserExpiryJob = () => {
  // Run once immediately
  checkExpiries();
  
  // Run every 1 hour (3600000 ms)
  setInterval(checkExpiries, 3600000);
};
