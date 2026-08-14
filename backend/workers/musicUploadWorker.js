import { Worker } from 'bullmq';
import { bullMQConnection } from '../config/redis.js';
import NexoriaTrack from '../models/NexoriaTrack.js';
import cloudinary from '../config/cloudinary.js';
import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import logger from '../middlewares/logger.js';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

// Mongoose connection if worker is run independently
if (mongoose.connection.readyState === 0 && process.env.MONGO_URI) {
  mongoose.connect(process.env.MONGO_URI)
    .then(() => logger.info('Worker connected to MongoDB'))
    .catch(err => logger.error(`Worker MongoDB error: ${err.message}`));
}

export const processJob = async (job) => {
  const { trackId, filePath, title, artistName, mimetype, originalname, duration, isPremium } = job.data;
  
  logger.info(`Starting upload job for track ${trackId}`);
  
  const track = await NexoriaTrack.findById(trackId);
  if (!track) {
    throw new Error(`Track ${trackId} not found in DB`);
  }
  
  // Idempotency: skip if already completed
  if (track.telegramFileId && track.audioUrl) {
    logger.info(`Track ${trackId} already processed, skipping.`);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    return { status: 'already_completed' };
  }

  track.processingStatus = 'processing';
  await track.save();

  try {
    if (!fs.existsSync(filePath)) {
      throw new Error(`Temporary audio file not found at ${filePath}`);
    }

    // Security: Validate the filePath is strictly inside os.tmpdir() to prevent directory traversal
    const path = await import('path');
    const os = await import('os');
    const resolvedPath = path.resolve(filePath);
    const tmpDir = path.resolve(os.tmpdir());
    if (!resolvedPath.startsWith(tmpDir)) {
      throw new Error(`Security Violation: Temporary file path ${filePath} is outside the allowed directory.`);
    }

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const channelId = process.env.TELEGRAM_CHANNEL_ID;
    
    let fileSizeBytes = 0;
    let computedDuration = duration || 0;

    // 1. Upload to Telegram (if not already done)
    if (!track.telegramFileId && botToken && channelId) {
      logger.info(`Uploading track ${trackId} to Telegram...`);
      const formData = new FormData();
      formData.append('chat_id', channelId);
      
      const isStandardAudio = mimetype.includes('mpeg') || mimetype.includes('mp3') || mimetype.includes('m4a');
      const endpoint = isStandardAudio ? 'sendAudio' : 'sendDocument';
      const fileField = isStandardAudio ? 'audio' : 'document';
      
      formData.append(fileField, fs.createReadStream(filePath), {
        filename: originalname,
        contentType: mimetype,
      });

      if (endpoint === 'sendAudio') {
        if (title) formData.append('title', title);
        if (artistName) formData.append('performer', artistName);
      }
      
      const response = await axios.post(`https://api.telegram.org/bot${botToken}/${endpoint}`, formData, {
        headers: {
          ...formData.getHeaders(),
          'Content-Length': formData.getLengthSync()
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity
      });

      const resultObj = response.data.result.audio || response.data.result.document || response.data.result.voice;
      
      if (!resultObj) {
        throw new Error('Telegram API did not return a valid file identifier.');
      }

      track.telegramFileId = resultObj.file_id;
      if (resultObj.duration) computedDuration = resultObj.duration;
      if (resultObj.file_size) fileSizeBytes = resultObj.file_size;
      
      logger.info(`Telegram upload success for track ${trackId}: ${track.telegramFileId}`);
    }

    // 2. Upload to Cloudinary (if not already done)
    if (!track.audioUrl) {
      logger.info(`Uploading track ${trackId} to Cloudinary...`);
      
      const uploadToCloudinary = () => {
        return new Promise((resolve, reject) => {
          const options = {
            resource_type: 'video',
            folder: 'nexoria_music/tracks',
            public_id: `track_${trackId}`,
          };
          
          const uploadStream = cloudinary.uploader.upload_stream(
            options,
            (error, result) => {
              if (error) {
                // We won't fallback to CLOUDINARY_CLOUD_NAME_2 here for simplicity,
                // but you can add it if strictly required. The existing one was asynchronous.
                return reject(error);
              }
              resolve(result);
            }
          );
          
          fs.createReadStream(filePath).pipe(uploadStream);
        });
      };

      const cloudinaryResult = await uploadToCloudinary();
      track.audioUrl = cloudinaryResult.secure_url;
      if (cloudinaryResult.duration) computedDuration = Math.round(cloudinaryResult.duration);
      if (cloudinaryResult.bytes) fileSizeBytes = cloudinaryResult.bytes;
      
      logger.info(`Cloudinary upload success for track ${trackId}: ${track.audioUrl}`);
    }

    track.duration = computedDuration;
    if (fileSizeBytes > 0) track.fileSizeBytes = fileSizeBytes;
    
    track.processingStatus = 'completed';
    track.processingError = null;
    await track.save();

    // Clean up temporary file upon success
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (e) {
        logger.error(`Failed to cleanup temp file ${filePath}: ${e.message}`);
      }
    }

    return { status: 'completed', telegramFileId: track.telegramFileId, audioUrl: track.audioUrl };
    
  } catch (err) {
    logger.error(`Music Upload Worker error for track ${trackId}: ${err.message}`);
    
    track.processingStatus = 'failed';
    // Do not leak secrets in error message
    const sanitizedError = err.message.replace(process.env.TELEGRAM_BOT_TOKEN || 'BOT_TOKEN_SECRET', '***');
    track.processingError = sanitizedError;
    await track.save();
    
    throw err; // Trigger retry in BullMQ
  } finally {
    // Guaranteed cleanup on success or permanent failure
    // We do not delete on transient failure because BullMQ retries need the file
    // Note: To be perfectly safe, we'll let it be deleted only on success, and on the 'failed' event listener below for permanent failures.
  }
};

let worker = null;

if (bullMQConnection) {
  worker = new Worker('music-upload', processJob, {
    connection: bullMQConnection,
    concurrency: 5,
  });

  worker.on('completed', (job) => {
    logger.info(`Job ${job.id} has completed!`);
    // Cleanup temp file on success
    if (job.data.filePath && fs.existsSync(job.data.filePath)) {
      try {
        fs.unlinkSync(job.data.filePath);
      } catch (e) {
        logger.error(`Failed to cleanup temp file ${job.data.filePath}: ${e.message}`);
      }
    }
  });

  worker.on('failed', (job, err) => {
    logger.error(`Job ${job.id} has failed with ${err.message}`);
    // Check if job has exhausted all attempts
    if (job.attemptsMade >= job.opts.attempts) {
      logger.info(`Job ${job.id} permanently failed. Cleaning up temp file.`);
      if (job.data.filePath && fs.existsSync(job.data.filePath)) {
        try {
          fs.unlinkSync(job.data.filePath);
        } catch (e) {
          logger.error(`Failed to cleanup temp file ${job.data.filePath}: ${e.message}`);
        }
      }
    }
  });

  // Graceful shutdown
  const shutdown = async () => {
    logger.info('Shutting down music-upload worker...');
    if (worker) {
      await worker.close();
    }
    process.exit(0);
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
} else {
  logger.warn('Redis is unavailable, BullMQ music-upload worker will NOT start.');
}

export default worker;
