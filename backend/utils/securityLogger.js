import SecurityLog from '../models/SecurityLog.js';
import User from '../models/User.js';
import logger from '../middlewares/logger.js';
import { sendNotification } from './tracker.js';

export const logSecurityEvent = async ({ eventType, req, details = {}, userId = null }) => {
  try {
    const ipAddress = req.ip || req.connection?.remoteAddress || 'Unknown';
    const userAgent = req.get ? req.get('user-agent') || 'Unknown' : 'Unknown';

    await SecurityLog.create({
      eventType,
      ipAddress,
      userAgent,
      details,
      user: userId,
    });
    
    logger.warn(`Security Event [${eventType}] from IP: ${ipAddress}`);

    // Automatically alert Super Admins
    const superAdmins = await User.find({ role: 'superadmin' });
    for (const admin of superAdmins) {
      await sendNotification(
        admin._id, 
        'Security Alert', 
        `Security Event: ${eventType} detected from IP ${ipAddress}`, 
        'SECURITY', 
        'ShieldAlert',
        '/superadmin/security-logs'
      );
    }
  } catch (error) {
    logger.error(`Failed to write security log: ${error.message}`);
  }
};
