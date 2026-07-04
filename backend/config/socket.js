import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import logger from '../middlewares/logger.js';
import crypto from 'crypto';
import { registerWatchPartyHandlers } from '../sockets/watchParty.js';
import { registerGlobalChatHandlers } from '../sockets/globalChat.js';
import { registerPrivateChatHandlers } from '../sockets/privateChat.js';

let io;

// Track active sessions in memory for fast retrieval
const activeVisitors = new Map();

const parseUserAgent = (uaString) => {
  if (!uaString) return { browser: 'Unknown', os: 'Unknown', device: 'Desktop' };
  
  let browser = 'Unknown';
  if (uaString.includes('Chrome')) browser = 'Chrome';
  else if (uaString.includes('Firefox')) browser = 'Firefox';
  else if (uaString.includes('Safari')) browser = 'Safari';
  else if (uaString.includes('Edge')) browser = 'Edge';

  let os = 'Unknown';
  if (uaString.includes('Win')) os = 'Windows';
  else if (uaString.includes('Mac')) os = 'MacOS';
  else if (uaString.includes('Linux')) os = 'Linux';
  else if (uaString.includes('Android')) os = 'Android';
  else if (uaString.includes('iOS')) os = 'iOS';

  let device = 'Desktop';
  if (/Mobi|Android/i.test(uaString)) device = 'Mobile';
  else if (/Tablet|iPad/i.test(uaString)) device = 'Tablet';

  return { browser, os, device };
};

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL ? [process.env.FRONTEND_URL, 'http://localhost:5173'] : 'http://localhost:5173',
      credentials: true
    }
  });

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || (socket.handshake.headers.cookie && socket.handshake.headers.cookie.split('jwt=')[1]?.split(';')[0]);
      
      if (token) {
        let decoded;
        try {
          // Try verifying as access token first
          decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (err) {
          // Fallback to refresh token verify (since jwt cookie is a refresh token)
          decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
        }
        
        socket.user = await User.findById(decoded._id).select('-password');
      }
      next();
    } catch (err) {
      console.error('Socket Auth Error:', err.message);
      next();
    }
  });

  io.on('connection', (socket) => {
    logger.info(`Socket connected: ${socket.id}`);

    const ua = parseUserAgent(socket.handshake.headers['user-agent']);
    const ip = socket.handshake.headers['x-forwarded-for'] || socket.handshake.address;
    // Generate a quick hash for unique visitor session based on IP and UserAgent
    const visitorId = crypto.createHash('md5').update(`${ip}-${socket.handshake.headers['user-agent']}`).digest('hex');
    
    if (!activeVisitors.has(visitorId)) {
      activeVisitors.set(visitorId, {
        id: visitorId,
        ip,
        country: 'Unknown', // Typically requires GeoIP DB, keep as Unknown for now
        browser: ua.browser,
        os: ua.os,
        device: ua.device,
        referrer: socket.handshake.headers.referer || 'Direct',
        sockets: new Set([socket.id])
      });
    } else {
      activeVisitors.get(visitorId).sockets.add(socket.id);
    }

    if (socket.user) {
      socket.join(socket.user._id.toString());
      socket.join('authenticated');
      if (socket.user.role === 'admin' || socket.user.role === 'superadmin') {
        socket.join('admin');
      }
      if (socket.user.role === 'superadmin') {
        socket.join('superadmin');
      }
      if (socket.user.isPremium) {
        socket.join('premium');
      }
    } else {
      socket.join('guest');
    }

    // Register Socket Handlers
    registerWatchPartyHandlers(io, socket);
    registerGlobalChatHandlers(io, socket);
    registerPrivateChatHandlers(io, socket);

    broadcastOnlineStats();

    socket.on('disconnect', () => {
      logger.info(`Socket disconnected: ${socket.id}`);
      if (activeVisitors.has(visitorId)) {
        const visitor = activeVisitors.get(visitorId);
        visitor.sockets.delete(socket.id);
        if (visitor.sockets.size === 0) {
          activeVisitors.delete(visitorId);
        }
      }
      broadcastOnlineStats();
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
};

const broadcastOnlineStats = async () => {
  if (!io) return;
  const sockets = await io.fetchSockets();
  
  let total = sockets.length;
  let guests = 0;
  let premium = 0;
  let admins = 0;
  let superAdmins = 0;

  sockets.forEach(s => {
    if (!s.user) guests++;
    else {
      if (s.user.isPremium) premium++;
      if (s.user.role === 'admin') admins++;
      if (s.user.role === 'superadmin') superAdmins++;
    }
  });

  const visitorsArray = Array.from(activeVisitors.values()).map(v => ({
    id: v.id,
    country: v.country,
    browser: v.browser,
    os: v.os,
    device: v.device,
    referrer: v.referrer
  }));

  io.to('admin').emit('onlineStats', {
    total,
    guests,
    premium,
    admins,
    superAdmins,
    visitors: visitorsArray
  });
};
