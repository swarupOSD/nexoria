import Redis from 'ioredis';
import dotenv from 'dotenv';
import logger from '../middlewares/logger.js';

dotenv.config();

// Auto-bypass Redis if running on Render free tier without a Redis server
const shouldBypassRedis = process.env.RENDER === 'true' && (process.env.REDIS_URL.includes('127.0.0.1') || process.env.REDIS_URL.includes('localhost'));

let redisClient = null;

if (!shouldBypassRedis) {
  redisClient = new Redis(process.env.REDIS_URL, {
    maxRetriesPerRequest: 1,
    enableOfflineQueue: false,
    retryStrategy(times) {
      if (times > 3) {
        return null; // Stop retrying after 3 times
      }
      return Math.min(times * 50, 2000);
    }
  });

  redisClient.on('connect', () => {
    logger.info('Redis connected successfully');
  });

  redisClient.on('error', (err) => {
    logger.error(`Redis connection error: ${err}`);
  });
} else {
  logger.info('Bypassing Redis connection (Render environment with localhost REDIS_URL detected)');
}

export const bullMQConnection = shouldBypassRedis ? null : new Redis(process.env.REDIS_URL, {
  maxRetriesPerRequest: null, // Required by BullMQ
  enableOfflineQueue: false,
  retryStrategy(times) {
    if (times > 3) return null;
    return Math.min(times * 50, 2000);
  }
});


const redis = {
  async get(key) {
    if (!redisClient) return null;
    try { return await redisClient.get(key); } catch (e) { return null; }
  },
  async setex(key, time, val) {
    if (!redisClient) return null;
    try { return await redisClient.setex(key, time, val); } catch (e) { return null; }
  },
  async del(key) {
    if (!redisClient) return null;
    try { return await redisClient.del(key); } catch (e) { return null; }
  },
  async keys(pattern) {
    if (!redisClient) return [];
    try { return await redisClient.keys(pattern); } catch (e) { return []; }
  },
  async quit() {
    if (!redisClient) return null;
    try { return await redisClient.quit(); } catch (e) { return null; }
  }
};

export default redis;
