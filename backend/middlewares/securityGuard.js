import SiteSettings from '../models/SiteSettings.js';
import { logSecurityEvent } from '../utils/securityLogger.js';

export const securityGuard = async (req, res, next) => {
  try {
    const settings = await SiteSettings.findOne();
    if (!settings || !settings.security) {
      return next();
    }

    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    
    // Check if IP is banned
    if (settings.security.bannedIps && settings.security.bannedIps.includes(clientIp)) {
      logSecurityEvent({
        eventType: 'BANNED_IP_BLOCKED',
        req,
        details: { ip: clientIp, path: req.originalUrl }
      });
      return res.status(403).json({
        success: false,
        message: 'Your IP has been banned from accessing this site.'
      });
    }

    // Optional: Under Attack Mode logic
    // We can add a more aggressive rate limiter or captcha challenge here later
    if (settings.security.underAttackMode) {
      res.setHeader('X-Under-Attack', 'true');
    }

    next();
  } catch (error) {
    // If DB fails, we don't want to bring down the whole site, so we just proceed
    console.error('Security Guard Error:', error);
    next();
  }
};
