import { Queue } from 'bullmq';
import { bullMQConnection } from '../config/redis.js';
import logger from '../middlewares/logger.js';

let musicUploadQueue = null;

if (bullMQConnection) {
  musicUploadQueue = new Queue('music-upload', {
    connection: bullMQConnection,
    defaultJobOptions: {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
      removeOnComplete: true,
      removeOnFail: 100,
    },
  });

  musicUploadQueue.on('error', (err) => {
    logger.error(`BullMQ music-upload Queue Error: ${err.message}`);
  });
} else {
  logger.warn('Redis is unavailable, BullMQ music-upload queue will NOT be initialized.');
}

export default musicUploadQueue;
