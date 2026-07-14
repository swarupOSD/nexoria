import SiteSettings from '../models/SiteSettings.js';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

let maintenanceCache = {
  isMaintenance: false,
  lastFetched: 0
};

export const checkMaintenance = async (req, res, next) => {
  const allowedPaths = ['/api/auth/login', '/api/auth/me', '/api/settings', '/api/csrf-token'];
  if (allowedPaths.includes(req.path) || req.path.startsWith('/api/creator')) {
    return next();
  }

  const now = Date.now();
  if (now - maintenanceCache.lastFetched > 60000) {
    try {
      const settings = await SiteSettings.findOne();
      maintenanceCache.isMaintenance = settings?.maintenanceMode || false;
      maintenanceCache.lastFetched = now;
    } catch (e) {
      // Error fetching settings, ignore
    }
  }

  if (maintenanceCache.isMaintenance) {
    let isOwner = false;
    let token = req.cookies.jwt;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET) || jwt.verify(token, process.env.JWT_REFRESH_SECRET);
        const user = await User.findById(decoded._id);
        if (user && user.role === 'owner') {
          isOwner = true;
        }
      } catch (e) {
      }
    }

    if (!isOwner) {
      return res.status(503).json({ success: false, message: 'Platform is offline for maintenance.' });
    }
  }
  
  next();
};
