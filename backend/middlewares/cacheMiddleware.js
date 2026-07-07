import redis from '../config/redis.js';
import logger from './logger.js';

/**
 * Middleware to cache API responses in Redis.
 * @param {number} duration - Expiration time in seconds
 */
export const cacheResponse = (duration = 3600) => {
  return async (req, res, next) => {
    // Only cache GET requests, and ONLY for guests (no auth token) to avoid caching personalized data
    if (req.method !== 'GET' || req.headers.authorization || req.cookies?.jwt) {
      return next();
    }

    const key = `cache:${req.originalUrl || req.url}`;
    try {
      const cachedData = await redis.get(key);
      if (cachedData) {
        return res.status(200).json(JSON.parse(cachedData));
      }

      // Intercept res.json to store the response in Redis before sending it
      const originalJson = res.json;
      res.json = function (body) {
        // Only cache successful responses
        if (res.statusCode >= 200 && res.statusCode < 300) {
          redis.setex(key, duration, JSON.stringify(body)).catch(err => {
            logger.error(`Redis Cache Set Error: ${err.message}`);
          });
        }
        return originalJson.call(this, body);
      };

      next();
    } catch (err) {
      logger.error(`Redis Cache Middleware Error: ${err.message}`);
      // Fallback to normal execution if Redis fails
      next();
    }
  };
};

/**
 * Utility to clear cache for specific patterns
 * @param {string} pattern - Cache key pattern (e.g., 'cache:/api/posts*')
 */
export const clearCache = async (pattern) => {
  try {
    const keys = await redis.keys(pattern);
    if (keys && keys.length > 0) {
      for (const key of keys) {
        await redis.del(key);
      }
    }
  } catch (err) {
    logger.error(`Redis Cache Clear Error: ${err.message}`);
  }
};
