import webpush from 'web-push';
import User from '../models/User.js';
import logger from '../middlewares/logger.js';

// Setup VAPID details
const publicVapidKey = process.env.VAPID_PUBLIC_KEY || 'BM_qXoG-H3pLd7l561n9yXw0X_6W2R2G-y9-XyYvL8X5LhA8nN9eLq8Z2r5f_7T1D9n6s5F-X5XvHqX2v-L5Q3c';
const privateVapidKey = process.env.VAPID_PRIVATE_KEY || 'lR_X_L_H_r_w_R_Q_8_y_r_f_L_T_D_q_s_F_X_5_X';

try {
  webpush.setVapidDetails('mailto:support@premiumapps.com', publicVapidKey, privateVapidKey);
} catch (e) {
  logger.warn('Web Push VAPID keys not properly configured. Push will fail.');
}

export const sendPushNotification = async (userId, payload) => {
  try {
    const user = await User.findById(userId);
    if (!user || !user.pushSubscriptions || user.pushSubscriptions.length === 0) return;

    const data = JSON.stringify(payload);

    const promises = user.pushSubscriptions.map(async (subscription) => {
      try {
        await webpush.sendNotification(subscription, data);
      } catch (error) {
        if (error.statusCode === 410 || error.statusCode === 404) {
          // Subscription has expired or is no longer valid
          user.pushSubscriptions = user.pushSubscriptions.filter(sub => sub.endpoint !== subscription.endpoint);
          await user.save();
        } else {
          logger.error(`Push Error: ${error.message}`);
        }
      }
    });

    await Promise.all(promises);
  } catch (error) {
    logger.error(`Send Push Error: ${error.message}`);
  }
};
