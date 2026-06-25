import Redis from 'ioredis';
import dotenv from 'dotenv';
import logger from '../middlewares/logger.js';

dotenv.config();

const redisClient = new Redis(process.env.REDIS_URL, {
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

const redis = {
  async get(key) {
    try { return await redisClient.get(key); } catch (e) { return null; }
  },
  async setex(key, time, val) {
    try { return await redisClient.setex(key, time, val); } catch (e) { return null; }
  },
  async del(key) {
    try { return await redisClient.del(key); } catch (e) { return null; }
  },
  async keys(pattern) {
    try { return await redisClient.keys(pattern); } catch (e) { return []; }
  },
  async quit() {
    try { return await redisClient.quit(); } catch (e) { return null; }
  }
};

export default redis;
