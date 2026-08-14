import { jest } from '@jest/globals';
import fs from 'fs';
import { processJob } from '../workers/musicUploadWorker.js';
import NexoriaTrack from '../models/NexoriaTrack.js';
import cloudinary from '../config/cloudinary.js';
import axios from 'axios';
import os from 'os';
import path from 'path';
import FormData from 'form-data';
import { PassThrough } from 'stream';

// Monkey patch for ESM since jest.mock() factory doesn't work perfectly in node --experimental-vm-modules without Babel
jest.spyOn(FormData.prototype, 'getLengthSync').mockReturnValue(1024);

jest.spyOn(fs, 'existsSync');
jest.spyOn(fs, 'unlinkSync');
jest.spyOn(axios, 'post');
jest.spyOn(NexoriaTrack, 'findById');

if (!cloudinary.uploader) cloudinary.uploader = {};
cloudinary.uploader.upload_stream = jest.fn();

describe('Nexoria Music Upload Worker - processJob', () => {
  let mockJob;
  let mockTrack;
  let tmpFile;
  let dummyOut;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.TELEGRAM_BOT_TOKEN = 'test-token';
    process.env.TELEGRAM_CHANNEL_ID = 'test-channel';

    tmpFile = path.join(os.tmpdir(), 'test.mp3');
    dummyOut = path.join(os.tmpdir(), 'dummy.out');

    mockJob = {
      data: {
        trackId: '60d5ecb74d6bb830b8e71111',
        filePath: tmpFile,
        title: 'Test Song',
        artistName: 'Test Artist',
        mimetype: 'audio/mpeg',
        originalname: 'test.mp3',
        duration: 120,
        isPremium: false
      }
    };

    mockTrack = {
      _id: '60d5ecb74d6bb830b8e71111',
      processingStatus: 'pending',
      processingError: null,
      telegramFileId: null,
      audioUrl: null,
      save: jest.fn().mockResolvedValue(true)
    };

    NexoriaTrack.findById.mockResolvedValue(mockTrack);
    
    // Create actual dummy file for FormData stream
    fs.writeFileSync(tmpFile, 'dummy audio data');
    
    // Default Axios Mock (Telegram Success)
    axios.post.mockResolvedValue({
      data: {
        ok: true,
        result: {
          audio: { file_id: 'tg-file-123', duration: 120, file_size: 1024 }
        }
      }
    });

    // Default Cloudinary Mock (Success)
    cloudinary.uploader.upload_stream.mockImplementation((options, callback) => {
      setTimeout(() => {
        callback(null, { secure_url: 'https://cloudinary.com/test.mp3', duration: 120, bytes: 1024 });
      }, 0);
      return fs.createWriteStream(dummyOut);
    });
  });

  afterAll(() => {
    // Prevent jest open handle warnings due to worker importing redis which fails to connect
    const tmpF = path.join(os.tmpdir(), 'test.mp3');
    const dummyO = path.join(os.tmpdir(), 'dummy.out');
    try {
      if (fs.existsSync(tmpF)) fs.unlinkSync(tmpF);
      if (fs.existsSync(dummyO)) fs.unlinkSync(dummyO);
    } catch(e) {}
  });

  it('should successfully process pending → processing → completed', async () => {
    const result = await processJob(mockJob);
    
    expect(mockTrack.processingStatus).toBe('completed');
    expect(mockTrack.telegramFileId).toBe('tg-file-123');
    expect(mockTrack.audioUrl).toBe('https://cloudinary.com/test.mp3');
    expect(mockTrack.save).toHaveBeenCalledTimes(2); 
    expect(fs.unlinkSync).toHaveBeenCalledWith(tmpFile);
    expect(result.status).toBe('completed');
  });

  it('should throw and set status to failed on Cloudinary error', async () => {
    cloudinary.uploader.upload_stream.mockImplementation((options, callback) => {
      setTimeout(() => callback(new Error('Cloudinary error')), 0);
      return fs.createWriteStream(dummyOut);
    });

    await expect(processJob(mockJob)).rejects.toThrow('Cloudinary error');
    
    expect(mockTrack.processingStatus).toBe('failed');
    expect(mockTrack.processingError).toContain('Cloudinary error');
    expect(mockTrack.save).toHaveBeenCalled();
  });

  it('should be idempotent if both telegramFileId and audioUrl exist', async () => {
    mockTrack.telegramFileId = 'existing-tg-id';
    mockTrack.audioUrl = 'existing-url';
    
    const result = await processJob(mockJob);
    
    expect(result.status).toBe('already_completed');
    expect(axios.post).not.toHaveBeenCalled();
    expect(cloudinary.uploader.upload_stream).not.toHaveBeenCalled();
    expect(fs.unlinkSync).toHaveBeenCalledWith(tmpFile); 
  });

  it('should only upload to Cloudinary if Telegram upload already succeeded previously', async () => {
    mockTrack.telegramFileId = 'existing-tg-id'; 
    
    const result = await processJob(mockJob);
    
    expect(axios.post).not.toHaveBeenCalled(); 
    expect(cloudinary.uploader.upload_stream).toHaveBeenCalled(); 
    expect(mockTrack.processingStatus).toBe('completed');
    expect(mockTrack.audioUrl).toBe('https://cloudinary.com/test.mp3');
    expect(mockTrack.telegramFileId).toBe('existing-tg-id'); 
  });

  it('should clean up temporary file upon success', async () => {
    await processJob(mockJob);
    expect(fs.unlinkSync).toHaveBeenCalledWith(tmpFile);
  });
});
