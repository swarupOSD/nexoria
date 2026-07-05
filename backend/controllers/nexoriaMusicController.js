import NexoriaArtist from '../models/NexoriaArtist.js';
import NexoriaGenre from '../models/NexoriaGenre.js';
import NexoriaAlbum from '../models/NexoriaAlbum.js';
import NexoriaTrack from '../models/NexoriaTrack.js';
import NexoriaPlaylist from '../models/NexoriaPlaylist.js';
import logger from '../middlewares/logger.js';
import axios from 'axios';
import FormData from 'form-data';
import path from 'path';

// ==========================================
// ADMIN: ARTIST MANAGEMENT
// ==========================================

export const createArtist = async (req, res) => {
  try {
    const { name, bio, image, coverImage, socialLinks, isVerified } = req.body;
    const artist = await NexoriaArtist.create({
      name,
      bio,
      image,
      coverImage,
      socialLinks,
      isVerified,
      addedBy: req.user._id
    });
    res.status(201).json({ success: true, data: artist });
  } catch (error) {
    logger.error(`Create Artist Error: ${error.message}`);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getArtistsAdmin = async (req, res) => {
  try {
    const artists = await NexoriaArtist.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: artists });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateArtist = async (req, res) => {
  try {
    const artist = await NexoriaArtist.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!artist) return res.status(404).json({ success: false, message: 'Artist not found' });
    res.status(200).json({ success: true, data: artist });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteArtist = async (req, res) => {
  try {
    const artist = await NexoriaArtist.findByIdAndDelete(req.params.id);
    if (!artist) return res.status(404).json({ success: false, message: 'Artist not found' });
    // Also delete associated albums and tracks (logic can be expanded later)
    res.status(200).json({ success: true, message: 'Artist deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// ADMIN: GENRE MANAGEMENT
// ==========================================

export const createGenre = async (req, res) => {
  try {
    const genre = await NexoriaGenre.create({ ...req.body, addedBy: req.user._id });
    res.status(201).json({ success: true, data: genre });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getGenresAdmin = async (req, res) => {
  try {
    const genres = await NexoriaGenre.find().sort({ name: 1 });
    res.status(200).json({ success: true, data: genres });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateGenre = async (req, res) => {
  try {
    const genre = await NexoriaGenre.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!genre) return res.status(404).json({ success: false, message: 'Genre not found' });
    res.status(200).json({ success: true, data: genre });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteGenre = async (req, res) => {
  try {
    const genre = await NexoriaGenre.findByIdAndDelete(req.params.id);
    if (!genre) return res.status(404).json({ success: false, message: 'Genre not found' });
    res.status(200).json({ success: true, message: 'Genre deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// ADMIN: ALBUM MANAGEMENT
// ==========================================

export const createAlbum = async (req, res) => {
  try {
    const album = await NexoriaAlbum.create({ ...req.body, addedBy: req.user._id });
    res.status(201).json({ success: true, data: album });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAlbumsAdmin = async (req, res) => {
  try {
    const albums = await NexoriaAlbum.find().populate('artist', 'name').sort({ releaseDate: -1 });
    res.status(200).json({ success: true, data: albums });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateAlbum = async (req, res) => {
  try {
    const album = await NexoriaAlbum.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!album) return res.status(404).json({ success: false, message: 'Album not found' });
    res.status(200).json({ success: true, data: album });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteAlbum = async (req, res) => {
  try {
    const album = await NexoriaAlbum.findByIdAndDelete(req.params.id);
    if (!album) return res.status(404).json({ success: false, message: 'Album not found' });
    res.status(200).json({ success: true, message: 'Album deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// ADMIN: TRACK MANAGEMENT
// ==========================================

export const createTrack = async (req, res) => {
  try {
    // Audio file storage logic is deferred, so audioUrl is passed directly from body for now
    const track = await NexoriaTrack.create({ ...req.body, addedBy: req.user._id });
    res.status(201).json({ success: true, data: track });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getTracksAdmin = async (req, res) => {
  try {
    const tracks = await NexoriaTrack.find()
      .populate('artist', 'name')
      .populate('album', 'title')
      .populate('genre', 'name')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: tracks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateTrack = async (req, res) => {
  try {
    const track = await NexoriaTrack.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!track) return res.status(404).json({ success: false, message: 'Track not found' });
    res.status(200).json({ success: true, data: track });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteTrack = async (req, res) => {
  try {
    const track = await NexoriaTrack.findByIdAndDelete(req.params.id);
    if (!track) return res.status(404).json({ success: false, message: 'Track not found' });
    res.status(200).json({ success: true, message: 'Track deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// CONSUMER: SEARCH
// ==========================================

export const searchMusic = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(200).json({ success: true, data: { tracks: [], albums: [], artists: [] } });
    }

    const regex = new RegExp(q, 'i');

    const tracks = await NexoriaTrack.find({ title: regex })
      .populate('artist', 'name image')
      .populate('album', 'title coverImage')
      .limit(10);

    const albums = await NexoriaAlbum.find({ title: regex })
      .populate('artist', 'name image')
      .limit(10);

    const artists = await NexoriaArtist.find({ name: regex }).limit(10);

    res.status(200).json({
      success: true,
      data: {
        tracks,
        albums,
        artists
      }
    });
  } catch (error) {
    logger.error(`Search Music Error: ${error.message}`);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// TELEGRAM CDN: UPLOAD & STREAM
// ==========================================

export const uploadTrackAudio = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No audio file uploaded' });
    }

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const channelId = process.env.TELEGRAM_CHANNEL_ID;

    if (!botToken || !channelId) {
      return res.status(500).json({ success: false, message: 'Telegram Bot Token or Channel ID not configured on the server.' });
    }

    const formData = new FormData();
    formData.append('chat_id', channelId);
    
    // multer.memoryStorage() gives us a buffer
    formData.append('audio', req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype,
    });

    const { title, artistName } = req.body;
    if (title) formData.append('title', title);
    if (artistName) formData.append('performer', artistName);

    const response = await axios.post(`https://api.telegram.org/bot${botToken}/sendAudio`, formData, {
      headers: {
        ...formData.getHeaders(),
        'Content-Length': formData.getLengthSync()
      },
      maxContentLength: Infinity,
      maxBodyLength: Infinity
    });

    const fileId = response.data.result.audio.file_id;
    const duration = response.data.result.audio.duration; 
    const fileSizeBytes = response.data.result.audio.file_size;

    res.status(200).json({
      success: true,
      data: {
        telegramFileId: fileId,
        duration: duration,
        fileSizeBytes: fileSizeBytes
      }
    });

  } catch (error) {
    logger.error(`Upload Track Audio Error: ${error.response?.data?.description || error.message}`);
    res.status(500).json({ success: false, message: error.response?.data?.description || error.message });
  }
};

export const streamTrack = async (req, res) => {
  try {
    const { fileId } = req.params;
    const botToken = process.env.TELEGRAM_BOT_TOKEN;

    if (!botToken) {
      return res.status(500).json({ success: false, message: 'Server configuration error' });
    }

    // Step 1: Get File Path from Telegram
    const fileRes = await axios.get(`https://api.telegram.org/bot${botToken}/getFile?file_id=${fileId}`);
    
    if (!fileRes.data.ok) {
      return res.status(404).json({ success: false, message: 'File not found on Telegram CDN' });
    }

    const filePath = fileRes.data.result.file_path;
    const fileUrl = `https://api.telegram.org/file/bot${botToken}/${filePath}`;

    // Step 2: Stream the file
    const config = {
      responseType: 'stream',
      headers: {}
    };

    if (req.headers.range) {
      config.headers['Range'] = req.headers.range;
    }

    const response = await axios.get(fileUrl, config);

    // Determine correct Content-Type based on extension
    const ext = path.extname(fileUrl).toLowerCase();
    let contentType = 'audio/mpeg'; // Default to mp3
    if (ext === '.m4a' || ext === '.mp4') contentType = 'audio/mp4';
    else if (ext === '.ogg') contentType = 'audio/ogg';
    else if (ext === '.wav') contentType = 'audio/wav';
    else if (ext === '.webm') contentType = 'audio/webm';
    
    // If Telegram provides a valid audio MIME type, use it
    if (response.headers['content-type'] && response.headers['content-type'].startsWith('audio/')) {
      contentType = response.headers['content-type'];
    }

    // Forward necessary headers
    res.set({
      'Content-Type': contentType,
      'Content-Length': response.headers['content-length'],
      'Accept-Ranges': 'bytes'
    });

    if (response.headers['content-range']) {
      res.set('Content-Range', response.headers['content-range']);
      res.status(206);
    } else {
      res.status(200);
    }

    response.data.pipe(res);

  } catch (error) {
    if (error.code !== 'ECONNRESET') {
      logger.error(`Stream Track Error: ${error.message}`);
      if (!res.headersSent) {
        res.status(500).json({ success: false, message: 'Failed to stream audio' });
      }
    }
  }
};
