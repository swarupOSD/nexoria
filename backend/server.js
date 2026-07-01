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

dotenv.config();

// Validate Environment
validateEnv();

// Connect to database
connectDB().then(() => {
  if (process.env.NODE_ENV !== 'test') {
    // Start automated jobs
    startPremiumExpiryJob();
    startUserExpiryJob();
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
}));
app.use(mongoSanitize());
app.use(xss());
app.use(hpp());
app.use(cors({
  origin: process.env.FRONTEND_URL ? [process.env.FRONTEND_URL, 'http://localhost:5173'] : 'http://localhost:5173',
  credentials: true
}));

// Apply global security guard for IP banning
app.use(securityGuard);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000, // Increased max limit
  message: { success: false, message: 'Too many authentication attempts. Please try again after 15 minutes.' },
  handler: (req, res, next, options) => {
    logSecurityEvent({ eventType: 'RATE_LIMIT_VIOLATION', req, details: { route: req.originalUrl } });
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

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/admin/trash', trashRoutes);
app.use('/api/advertisements', advertisementRoutes);
app.use('/api/sponsored-content', advertisementRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/system', systemRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/ratings', ratingRoutes);
app.use('/api/downloads', downloadRoutes);
app.use('/api/reports', reportRoutes);
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
app.use('/api/watch-history', watchHistoryRoutes);
app.use('/api/music', musicRoutes);
app.use('/api/admin/scraper', scraperRoutes);

import path from 'path';

// SEO Routes (Mounted at root)
app.use('/', seoRoutes);

const __dirname = path.resolve();

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/dist')));

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../frontend/dist', 'index.html'));
  });
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
