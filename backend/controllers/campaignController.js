import User from '../models/User.js';
import { sendPushNotification } from '../utils/firebase.js';

// @desc    Launch Push Campaign
// @route   POST /api/campaigns/send
// @access  Private/SuperAdmin
export const launchCampaign = async (req, res) => {
  try {
    const { title, message, targetAudience, scheduleType, scheduledTime, actionLink } = req.body;

    if (!title || !message) {
      return res.status(400).json({ success: false, message: 'Title and message are required' });
    }

    // Determine target users
    let query = { fcmTokens: { $exists: true, $not: { $size: 0 } } };

    if (targetAudience === 'Premium Members Only') {
      query.isPremium = true;
    } else if (targetAudience === 'Inactive Users (30+ days)') {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      query.lastLogin = { $lte: thirtyDaysAgo }; // Assuming lastLogin exists
    } // 'Android Devices Only' and 'All Users' use default query for now

    const users = await User.find(query).select('fcmTokens');
    
    // Collect all tokens
    const tokens = [];
    users.forEach(user => {
      if (user.fcmTokens && Array.isArray(user.fcmTokens)) {
        tokens.push(...user.fcmTokens);
      }
    });

    if (tokens.length === 0) {
      return res.status(400).json({ success: false, message: 'No registered devices found for target audience' });
    }

    // Split tokens into chunks of 500 (FCM limit)
    let successCount = 0;
    let failureCount = 0;
    
    // Send notifications
    for (let i = 0; i < tokens.length; i += 500) {
      const chunk = tokens.slice(i, i + 500);
      const result = await sendPushNotification(chunk, title, message, '', actionLink);
      if (result.success) {
        successCount += result.successCount;
        failureCount += result.failureCount;
      }
    }

    res.status(200).json({ 
      success: true, 
      message: `Campaign sent successfully to ${successCount} devices (Failed: ${failureCount})` 
    });
  } catch (error) {
    console.error('Launch Campaign Error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
