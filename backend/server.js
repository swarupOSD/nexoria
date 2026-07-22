import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import slowDown from 'express-slow-down';
import hpp from 'hpp';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';

import connectDB from './config/db.js';
import logger from './middlewares/logger.js';
import { validateEnv } from './config/envValidator.js';
import { logSecurityEvent } from './utils/securityLogger.js';
import { csrfTokenRoute } from './middlewares/csrf.js';
import { startPremiumExpiryJob } from './utils/premiumExpiryJob.js';
import { startUserExpiryJob } from './utils/userExpiryJob.js';
import { securityGuard } from './middlewares/securityGuard.js';
import { checkMaintenance } from './middlewares/maintenance.js';
import { initFirebase } from './utils/firebase.js';

dotenv.config();

// Validate Environment
validateEnv();

// Connect to database
connectDB().then(() => {
  if (process.env.NODE_ENV !== 'test') {
    // Start automated jobs
    startPremiumExpiryJob();
    startUserExpiryJob();
    
    // Initialize Firebase
    initFirebase();
  }
});

const app = express();
app.set('trust proxy', 1);

// Body parser
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cookieParser());

// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Security Middlewares
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https://res.cloudinary.com"],
      connectSrc: ["'self'", process.env.FRONTEND_URL || 'http://localhost:5173'],
    },
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));
app.use(mongoSanitize());
app.use(xss());
app.use(hpp());
// CORS Config
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost',
  'capacitor://localhost',
  'http://10.0.2.2:5173'
];
if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}

app.use(cors({
  origin: true,
  credentials: true
}));

// Apply global security guard for IP banning
app.use(securityGuard);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // STRICT LIMIT: Maximum 20 login/register attempts to prevent Brute Force & Credential Stuffing
  message: { success: false, message: 'Too many authentication attempts. Your IP has been temporarily blocked for 15 minutes to prevent hacking.' },
  handler: (req, res, next, options) => {
    logSecurityEvent({ eventType: 'RATE_LIMIT_VIOLATION', req, details: { route: req.originalUrl, type: 'Auth Brute Force Attempt' } });
    res.status(options.statusCode).json(options.message);
  }
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000, // Increased to support multiple parallel Homepage queries
  message: { success: false, message: 'Too many requests from this IP, please try again after 15 minutes.' },
  handler: (req, res, next, options) => {
    logSecurityEvent({ eventType: 'RATE_LIMIT_VIOLATION', req, details: { route: req.originalUrl } });
    res.status(options.statusCode).json(options.message);
  }
});

const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  message: { success: false, message: 'Too many admin requests from this IP, please try again after 15 minutes.' },
  handler: (req, res, next, options) => {
    logSecurityEvent({ eventType: 'RATE_LIMIT_VIOLATION', req, details: { route: req.originalUrl } });
    res.status(options.statusCode).json(options.message);
  }
});

const spamLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10, // Max 10 requests per minute for comments/ratings/messages
  message: { success: false, message: 'Stop spamming! You are doing this too fast. Wait a minute.' },
  handler: (req, res, next, options) => {
    logSecurityEvent({ eventType: 'SPAM_VIOLATION', req, details: { route: req.originalUrl } });
    res.status(429).json(options.message);
  }
});

app.use('/api', apiLimiter);

const speedLimiter = slowDown({
  windowMs: 15 * 60 * 1000, // 15 mins
  delayAfter: 50,
  delayMs: () => 500
});
app.use('/api', speedLimiter);

import authRoutes from './routes/authRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import commentRoutes from './routes/commentRoutes.js';
import ratingRoutes from './routes/ratingRoutes.js';
import postRoutes from './routes/postRoutes.js';
import advertisementRoutes from './routes/advertisementRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import seoRoutes from './routes/seoRoutes.js';
import systemRoutes from './routes/systemRoutes.js';
import downloadRoutes from './routes/downloadRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import appRequestRoutes from './routes/appRequestRoutes.js';
import announcementRoutes from './routes/announcementRoutes.js';
import settingsRoutes from './routes/settingsRoutes.js';
import userRoutes from './routes/userRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import activityRoutes from './routes/activityRoutes.js';
import planRoutes from './routes/planRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import couponRoutes from './routes/couponRoutes.js';
import bannerRoutes from './routes/bannerRoutes.js';
import movieRoutes from './routes/movieRoutes.js';
import movieCategoryRoutes from './routes/movieCategoryRoutes.js';
import moviePurchaseRequestRoutes from './routes/moviePurchaseRequestRoutes.js';
import movieSettingsRoutes from './routes/movieSettingsRoutes.js';
import movieAdminRoutes from './routes/movieAdminRoutes.js';
import gameRoutes from './routes/gameRoutes.js';
import requestRoutes from './routes/requestRoutes.js';
import watchHistoryRoutes from './routes/watchHistoryRoutes.js';
import musicRoutes from './routes/musicRoutes.js';
import scraperRoutes from './routes/scraperRoutes.js';
import trashRoutes from './routes/trashRoutes.js';
import auraRoutes from './routes/auraRoutes.js';
import campaignRoutes from './routes/campaignRoutes.js';
import arenaGameRoutes from './routes/arenaGameRoutes.js';
import offerwallRoutes from './routes/offerwallRoutes.js';
import nexoriaMusicRoutes from './routes/nexoriaMusicRoutes.js';
import creatorRoutes from './routes/creatorRoutes.js';
import friendRoutes from './routes/friendRoutes.js';

// CSRF Route
app.get('/api/csrf-token', csrfTokenRoute);

// Prevent browser caching for all API routes
app.use('/api', (req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('Surrogate-Control', 'no-store');
  next();
});

// Apply Maintenance Mode block (bypassed for owner inside middleware)
app.use(checkMaintenance);

// Routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/admin/trash', trashRoutes);
app.use('/api/advertisements', advertisementRoutes);
app.use('/api/sponsored-content', advertisementRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/contact', spamLimiter, contactRoutes);
app.use('/api/system', systemRoutes);
app.use('/api/comments', spamLimiter, commentRoutes);
app.use('/api/ratings', spamLimiter, ratingRoutes);
app.use('/api/downloads', downloadRoutes);
app.use('/api/reports', spamLimiter, reportRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/app-requests', appRequestRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/system-notices', announcementRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/banners', bannerRoutes);
app.use('/api/hero-displays', bannerRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/users', adminLimiter, userRoutes);
app.use('/api/activity', activityRoutes);
app.use('/api/plans', planRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/movies', movieRoutes);
app.use('/api/movie-categories', movieCategoryRoutes);
app.use('/api/movie-purchases', moviePurchaseRequestRoutes);
app.use('/api/movie-settings', movieSettingsRoutes);
app.use('/api/movie-admin', movieAdminRoutes);
app.use('/api/games', gameRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/arena-games', arenaGameRoutes);
app.use('/api/watch-history', watchHistoryRoutes);
app.use('/api/music', musicRoutes);
app.use('/api/admin/scraper', scraperRoutes);
app.use('/api/aura', auraRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/webhooks/offerwall', offerwallRoutes);
app.use('/api/nexoria-music', nexoriaMusicRoutes);
app.use('/api/creator', adminLimiter, creatorRoutes);
app.use('/api/friends', apiLimiter, friendRoutes);

import path from 'path';

// SEO Routes (Mounted at root)
app.use('/', seoRoutes);

const __dirname = path.resolve();

// Serve uploads statically
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

import fs from 'fs';

if (process.env.NODE_ENV === 'production') {
  const frontendPath = path.join(__dirname, '../frontend/dist');
  
  if (fs.existsSync(frontendPath)) {
    app.use(express.static(frontendPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(frontendPath, 'index.html'));
    });
  } else {
    app.get('/', (req, res) => {
      res.send('API is running in production (Frontend not found locally)...');
    });
  }
} else {
  app.get('/', (req, res) => {
    res.send('API is running...');
  });
}

import http from 'http';
import { initSocket } from './config/socket.js';

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

// Initialize Socket.io
initSocket(server);

if (process.env.NODE_ENV !== 'test') {
  server.listen(PORT, () => {
    logger.info(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  });
}

export default server;
