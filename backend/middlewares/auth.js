import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { logSecurityEvent } from '../utils/securityLogger.js';
import logger from './logger.js';

// Protect routes
export const protect = async (req, res, next) => {
  let token;

  // Check for token in Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded._id).select('-password');
      
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Not authorized, user no longer exists' });
      }

      // Automatically grant Lifetime Premium status to EVERYONE to bypass premium restrictions
      // Admin Panel access is unaffected because it strictly checks req.user.role
      req.user.isPremium = true;
      req.user.premiumType = 'Lifetime';
      req.user.premiumStatus = 'Active';

      next();
    } catch (error) {
      logger.error(`Auth Middleware Error: ${error.message}`);
      return res.status(401).json({ success: false, message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token' });
  }
};

// Protect optional routes
export const protectOptional = async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded._id).select('-password');
      
      if (req.user) {
        req.user.isPremium = true;
        req.user.premiumType = 'Lifetime';
        req.user.premiumStatus = 'Active';
      }
    } catch (error) {
      // Don't fail if token is invalid, just proceed without user
    }
  }
  next();
};

// Grant access to specific roles
export const authorize = (...roles) => {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authorized, no user found' });
    }
    
    // Superadmin and Owner bypasses all role checks
    if (req.user.role !== 'superadmin' && req.user.role !== 'owner' && !roles.includes(req.user.role)) {
      await logSecurityEvent({ 
        eventType: 'UNAUTHORIZED_ADMIN_ACCESS', 
        req, 
        details: { attemptedRole: roles, userRole: req.user.role },
        userId: req.user._id
      });
      return res.status(403).json({ success: false, message: `User role is not authorized to access this route` });
    }
    next();
  };
};
