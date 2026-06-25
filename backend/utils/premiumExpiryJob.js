import User from '../models/User.js';
import logger from '../middlewares/logger.js';

import { logActivity, sendNotification } from './tracker.js';

const checkPremiumExpiry = async () => {
  try {
    const expiredUsers = await User.find({
      isPremium: true,
      premiumEndDate: { $lt: new Date() },
      premiumType: { $ne: 'Lifetime' }
    });

    if (expiredUsers.length > 0) {
      for (const user of expiredUsers) {
        user.isPremium = false;
        user.premiumStatus = 'Expired';
        user.premiumType = 'None';
        if (user.role === 'premium_user') {
          user.role = 'user';
        }
        await user.save();
        
        await logActivity(user._id, 'Premium Expired', 'Premium membership automatically expired');
        await sendNotification(user._id, 'Premium Expired', 'Your Premium membership has expired. Please renew to continue enjoying premium features.', 'PREMIUM', 'Clock');
      }
      logger.info(`Expired ${expiredUsers.length} premium memberships automatically.`);
    }
  } catch (error) {
    logger.error(`Premium Expiry Job Error: ${error.message}`);
  }
};

export const startPremiumExpiryJob = () => {
  // Run once immediately
  checkPremiumExpiry();
  
  // Run every 1 hour (3600000 ms)
  setInterval(checkPremiumExpiry, 3600000);
};
