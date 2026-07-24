import NexoriaArtist from '../models/NexoriaArtist.js';
import NexoriaGenre from '../models/NexoriaGenre.js';
import NexoriaAlbum from '../models/NexoriaAlbum.js';
import NexoriaTrack from '../models/NexoriaTrack.js';
import NexoriaPlaylist from '../models/NexoriaPlaylist.js';
import NexoriaUserHistory from '../models/NexoriaUserHistory.js';
import NexoriaMusicFavorite from '../models/NexoriaMusicFavorite.js';
import logger from '../middlewares/logger.js';
import axios from 'axios';
import FormData from 'form-data';
import path from 'path';
import https from 'https';

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
    const albumQuery = q ? { title: new RegExp(q, 'i') } : {};
    const artistQuery = q ? { name: new RegExp(q, 'i') } : {};

    const albums = await NexoriaAlbum.find(albumQuery)
      .populate('artist', 'name image')
      .limit(20);

    const artists = await NexoriaArtist.find(artistQuery).limit(50);

    const albumIds = albums.map(a => a._id);
    const artistIds = artists.map(a => a._id);

    const trackQuery = q ? {
      $or: [
        { title: new RegExp(q, 'i') },
        { album: { $in: albumIds } },
        { artist: { $in: artistIds } }
      ]
    } : {};

    const tracks = await NexoriaTrack.find(trackQuery)
      .populate('artist', 'name image')
      .populate('album', 'title coverImage')
      .limit(100);

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
    
    const isStandardAudio = req.file.mimetype.includes('mpeg') || req.file.mimetype.includes('mp3') || req.file.mimetype.includes('m4a');
    const endpoint = isStandardAudio ? 'sendAudio' : 'sendDocument';
    const fileField = isStandardAudio ? 'audio' : 'document';
    
    // multer.memoryStorage() gives us a buffer
    formData.append(fileField, req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype,
    });

    const { title, artistName } = req.body;
    // Telegram's sendDocument endpoint rejects 'title' and 'performer' parameters
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

    const fileId = resultObj.file_id;
    const duration = resultObj.duration || 0; 
    const fileSizeBytes = resultObj.file_size || 0;

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

    // Step 2: Stream the file using native https to prevent axios tampering
    const options = {
      method: 'GET',
      headers: {}
    };

    if (req.headers.range) {
      options.headers['Range'] = req.headers.range;
    }

    const proxyReq = https.request(fileUrl, options, (proxyRes) => {
      // Forward status code
      res.status(proxyRes.statusCode);

      // Forward necessary headers
      const headersToForward = ['content-length', 'content-range', 'accept-ranges'];
      headersToForward.forEach(header => {
        if (proxyRes.headers[header]) {
          res.setHeader(header, proxyRes.headers[header]);
        }
      });

      // Determine correct Content-Type
      let contentType = proxyRes.headers['content-type'];
      if (!contentType || contentType === 'application/octet-stream') {
        const ext = path.extname(fileUrl).toLowerCase();
        contentType = 'audio/mpeg'; // Default
        if (ext === '.m4a' || ext === '.mp4') contentType = 'audio/mp4';
        else if (ext === '.ogg') contentType = 'audio/ogg';
        else if (ext === '.wav') contentType = 'audio/wav';
        else if (ext === '.webm') contentType = 'audio/webm';
      }
      res.setHeader('Content-Type', contentType);

      // Pipe the raw stream directly to the client
      proxyRes.pipe(res);
      
      proxyRes.on('error', (err) => {
        logger.error(`Proxy stream response error: ${err.message}`);
        if (!res.headersSent) res.status(500).end();
      });
    });

    proxyReq.on('error', (err) => {
      logger.error(`Proxy request error: ${err.message}`);
      if (!res.headersSent) {
        res.status(500).json({ success: false, message: 'Failed to proxy audio stream' });
      }
    });

    proxyReq.end();

  } catch (error) {
    if (error.code !== 'ECONNRESET') {
      logger.error(`Stream Track Error: ${error.message}`);
      if (!res.headersSent) {
        res.status(500).json({ success: false, message: 'Failed to stream audio' });
      }
    }
  }
};

// ==========================================
// CONSUMER: ALGORITHM & HISTORY
// ==========================================

export const logPlay = async (req, res) => {
  try {
    const { trackId } = req.body;
    if (!trackId) return res.status(400).json({ success: false, message: 'Track ID is required' });

    // Increment global play count
    await NexoriaTrack.findByIdAndUpdate(trackId, { $inc: { playCount: 1 } });

    // If user is logged in, log history
    if (req.user) {
      await NexoriaUserHistory.create({
        user: req.user._id,
        track: trackId
      });
    }

    res.status(200).json({ success: true, message: 'Play logged successfully' });
  } catch (error) {
    logger.error(`Log Play Error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Failed to log play' });
  }
};

export const getRecentlyPlayed = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(200).json({ success: true, data: [] });
    }

    // Get unique recently played tracks
    const history = await NexoriaUserHistory.find({ user: req.user._id })
      .sort({ playedAt: -1 })
      .limit(50)
      .populate({
        path: 'track',
        populate: [
          { path: 'artist', select: 'name image' },
          { path: 'album', select: 'title coverImage' }
        ]
      });

    // Deduplicate tracks, keeping the most recent play
    const uniqueTracksMap = new Map();
    history.forEach(item => {
      if (item.track && !uniqueTracksMap.has(item.track._id.toString())) {
        uniqueTracksMap.set(item.track._id.toString(), item.track);
      }
    });

    const recentTracks = Array.from(uniqueTracksMap.values()).slice(0, 10); // Return top 10 unique recent tracks

    res.status(200).json({ success: true, data: recentTracks });
  } catch (error) {
    logger.error(`Get Recently Played Error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Failed to fetch recently played' });
  }
};

export const getRecommendations = async (req, res) => {
  try {
    let targetGenres = [];
    let targetArtists = [];
    let excludeTrackIds = [];

    if (req.user) {
      // Get recent history to find preferences
      const history = await NexoriaUserHistory.find({ user: req.user._id })
        .sort({ playedAt: -1 })
        .limit(20)
        .populate('track');

      history.forEach(item => {
        if (item.track) {
          excludeTrackIds.push(item.track._id);
          if (item.track.genre) targetGenres.push(item.track.genre.toString());
          if (item.track.artist) targetArtists.push(item.track.artist.toString());
        }
      });
    }

    // Default fallback if no history
    let query = {};
    if (targetGenres.length > 0 || targetArtists.length > 0) {
      query = {
        _id: { $nin: excludeTrackIds },
        $or: []
      };
      if (targetGenres.length > 0) query.$or.push({ genre: { $in: targetGenres } });
      if (targetArtists.length > 0) query.$or.push({ artist: { $in: targetArtists } });
    }

    // If query.$or is empty (no history), just return popular tracks
    if (!query.$or || query.$or.length === 0) {
      query = { _id: { $nin: excludeTrackIds } }; // Just exclude recently played if any
    }

    // Fetch recommendations based on query, sort by playCount (popularity)
    const recommendations = await NexoriaTrack.find(query)
      .sort({ playCount: -1 })
      .limit(10)
      .populate('artist', 'name image')
      .populate('album', 'title coverImage');

    // If we didn't get enough recommendations, backfill with random popular tracks
    if (recommendations.length < 10) {
      const existingIds = [...excludeTrackIds, ...recommendations.map(t => t._id)];
      const backfill = await NexoriaTrack.find({ _id: { $nin: existingIds } })
        .sort({ playCount: -1 })
        .limit(10 - recommendations.length)
        .populate('artist', 'name image')
        .populate('album', 'title coverImage');
      recommendations.push(...backfill);
    }

    res.status(200).json({ success: true, data: recommendations });
  } catch (error) {
    logger.error(`Get Recommendations Error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Failed to generate recommendations' });
  }
};


// ==========================================
// USER: FAVORITES & LIKES
// ==========================================

export const toggleFavorite = async (req, res) => {
  try {
    const { itemId, itemType } = req.body; // itemType: 'Track', 'Album', 'Artist'
    if (!['Track', 'Album', 'Artist'].includes(itemType)) {
      return res.status(400).json({ success: false, message: 'Invalid itemType' });
    }

    const itemModelMap = {
      'Track': 'NexoriaTrack',
      'Album': 'NexoriaAlbum',
      'Artist': 'NexoriaArtist'
    };

    const existing = await NexoriaMusicFavorite.findOne({
      user: req.user._id,
      itemId,
      itemType
    });

    if (existing) {
      await existing.deleteOne();
      return res.status(200).json({ success: true, message: `${itemType} removed from favorites`, isFavorite: false });
    } else {
      await NexoriaMusicFavorite.create({
        user: req.user._id,
        itemId,
        itemType,
        itemModel: itemModelMap[itemType]
      });
      return res.status(200).json({ success: true, message: `${itemType} added to favorites`, isFavorite: true });
    }
  } catch (error) {
    logger.error(`Toggle Favorite Error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Failed to toggle favorite' });
  }
};

export const getFavorites = async (req, res) => {
  try {
    const { type } = req.query; // optional: filter by type
    let query = { user: req.user._id };
    if (type) query.itemType = type;

    const favorites = await NexoriaMusicFavorite.find(query)
      .populate({
        path: 'itemId',
        populate: [
          { path: 'artist', select: 'name image' },
          { path: 'album', select: 'title coverImage' }
        ]
      })
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: favorites });
  } catch (error) {
    logger.error(`Get Favorites Error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Failed to get favorites' });
  }
};

// ==========================================
// USER: ADVANCED ALGORITHMIC SHELVES
// ==========================================

export const getDiscoverWeekly = async (req, res) => {
  try {
    // A more advanced discovery: find tracks in genres user likes, but excluding artists they already listen to.
    const favorites = await NexoriaMusicFavorite.find({ user: req.user._id, itemType: 'Track' }).populate('itemId');
    const history = await NexoriaUserHistory.find({ user: req.user._id }).sort({ playedAt: -1 }).limit(50).populate('track');
    
    let knownArtists = new Set();
    let knownTracks = new Set();
    let genrePreferences = {};

    favorites.forEach(fav => {
      if (fav.itemId) {
        knownTracks.add(fav.itemId._id.toString());
        if (fav.itemId.artist) knownArtists.add(fav.itemId.artist.toString());
        if (fav.itemId.genre) {
          const gId = fav.itemId.genre.toString();
          genrePreferences[gId] = (genrePreferences[gId] || 0) + 2; // Favorites weigh more
        }
      }
    });

    history.forEach(item => {
      if (item.track) {
        knownTracks.add(item.track._id.toString());
        if (item.track.artist) knownArtists.add(item.track.artist.toString());
        if (item.track.genre) {
          const gId = item.track.genre.toString();
          genrePreferences[gId] = (genrePreferences[gId] || 0) + 1;
        }
      }
    });

    // Sort genres by preference
    const topGenres = Object.entries(genrePreferences)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(g => g[0]);

    let discoverQuery = { _id: { $nin: Array.from(knownTracks) } };
    
    if (topGenres.length > 0) {
      // Find tracks in their top genres, preferably from artists they HAVEN'T heavily listened to
      discoverQuery.genre = { $in: topGenres };
      discoverQuery.artist = { $nin: Array.from(knownArtists) };
    }

    let discoverTracks = await NexoriaTrack.find(discoverQuery)
      .sort({ playCount: -1 })
      .limit(20)
      .populate('artist', 'name image')
      .populate('album', 'title coverImage');
      
    // Fallback if not enough discovered tracks
    if (discoverTracks.length < 15) {
        const backfillQuery = { _id: { $nin: Array.from(knownTracks).concat(discoverTracks.map(t=>t._id.toString())) } };
        const backfill = await NexoriaTrack.find(backfillQuery).sort({ playCount: -1 }).limit(20 - discoverTracks.length).populate('artist', 'name image').populate('album', 'title coverImage');
        discoverTracks.push(...backfill);
    }

    res.status(200).json({ success: true, data: discoverTracks, name: "Discover Weekly", description: "New music based on your taste." });
  } catch (error) {
    logger.error(`Get Discover Weekly Error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Failed to generate Discover Weekly' });
  }
};

export const getReleaseRadar = async (req, res) => {
  try {
    // Release radar: Latest tracks from followed artists or heavily played artists
    const followedArtists = await NexoriaMusicFavorite.find({ user: req.user._id, itemType: 'Artist' });
    const history = await NexoriaUserHistory.find({ user: req.user._id }).sort({ playedAt: -1 }).limit(100).populate('track');
    
    let targetArtists = new Set(followedArtists.map(f => f.itemId.toString()));
    
    history.forEach(item => {
        if (item.track && item.track.artist) targetArtists.add(item.track.artist.toString());
    });

    const recentTracks = await NexoriaTrack.find({
        artist: { $in: Array.from(targetArtists) }
    })
    .sort({ createdAt: -1 })
    .limit(20)
    .populate('artist', 'name image')
    .populate('album', 'title coverImage');

    // Fallback
    if (recentTracks.length < 10) {
        const backfill = await NexoriaTrack.find({ _id: { $nin: recentTracks.map(t=>t._id) } })
            .sort({ createdAt: -1 })
            .limit(20 - recentTracks.length)
            .populate('artist', 'name image')
            .populate('album', 'title coverImage');
        recentTracks.push(...backfill);
    }

    res.status(200).json({ success: true, data: recentTracks, name: "Release Radar", description: "Catch up on the latest releases from artists you listen to." });
  } catch (error) {
    logger.error(`Get Release Radar Error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Failed to generate Release Radar' });
  }
};

export const getDailyMix = async (req, res) => {
  try {
    // Daily Mix: Grouping by top 3 distinct genres in history
    const history = await NexoriaUserHistory.find({ user: req.user._id }).sort({ playedAt: -1 }).limit(100).populate('track');
    let genreCounts = {};
    history.forEach(item => {
        if (item.track && item.track.genre) {
            const g = item.track.genre.toString();
            genreCounts[g] = (genreCounts[g] || 0) + 1;
        }
    });

    const topGenres = Object.entries(genreCounts).sort((a, b) => b[1] - a[1]).slice(0, 3).map(g => g[0]);
    
    let mixes = [];
    let mixCount = 1;
    
    for (const genreId of topGenres) {
        const tracks = await NexoriaTrack.find({ genre: genreId })
            .sort({ playCount: -1 }) // Or mix of random/playcount
            .limit(15)
            .populate('artist', 'name image')
            .populate('album', 'title coverImage');
            
        if (tracks.length > 5) {
            mixes.push({
                id: `daily-mix-${mixCount}`,
                name: `Daily Mix ${mixCount}`,
                description: `A mix of your favorite ${tracks[0].genre ? "styles" : "tracks"}`,
                tracks
            });
            mixCount++;
        }
    }

    res.status(200).json({ success: true, data: mixes });
  } catch (error) {
    logger.error(`Get Daily Mix Error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Failed to generate Daily Mixes' });
  }
};


// ==========================================
// ADMIN: ANALYTICS & INSIGHTS
// ==========================================

export const getAnalytics = async (req, res) => {
  try {
    const totalPlays = await NexoriaUserHistory.countDocuments();
    
    const uniqueListenersData = await NexoriaUserHistory.aggregate([
      { $group: { _id: '$user' } },
      { $count: 'uniqueListeners' }
    ]);
    const uniqueListeners = uniqueListenersData.length > 0 ? uniqueListenersData[0].uniqueListeners : 0;

    const recentActivity = await NexoriaUserHistory.find()
      .sort({ playedAt: -1 })
      .limit(20)
      .populate('user', 'name avatar username')
      .populate({
        path: 'track',
        select: 'title coverImage artist genre',
        populate: [
          { path: 'artist', select: 'name image' },
          { path: 'genre', select: 'name hexColor' }
        ]
      });

    const topTracks = await NexoriaUserHistory.aggregate([
      { $group: { _id: '$track', plays: { $sum: 1 } } },
      { $sort: { plays: -1 } },
      { $limit: 10 },
      { $lookup: { from: 'nexoriatracks', localField: '_id', foreignField: '_id', as: 'trackDetails' } },
      { $unwind: '$trackDetails' },
      { $lookup: { from: 'nexoriaartists', localField: 'trackDetails.artist', foreignField: '_id', as: 'artistDetails' } },
      { $unwind: { path: '$artistDetails', preserveNullAndEmptyArrays: true } },
      { $project: { 
          _id: 1, 
          plays: 1, 
          title: '$trackDetails.title', 
          coverImage: '$trackDetails.coverImage', 
          artistName: '$artistDetails.name' 
        } 
      }
    ]);

    const topArtists = await NexoriaUserHistory.aggregate([
      { $lookup: { from: 'nexoriatracks', localField: 'track', foreignField: '_id', as: 'trackDetails' } },
      { $unwind: '$trackDetails' },
      { $group: { _id: '$trackDetails.artist', plays: { $sum: 1 } } },
      { $sort: { plays: -1 } },
      { $limit: 10 },
      { $lookup: { from: 'nexoriaartists', localField: '_id', foreignField: '_id', as: 'artistDetails' } },
      { $unwind: '$artistDetails' },
      { $project: { 
          _id: 1, 
          plays: 1, 
          name: '$artistDetails.name', 
          image: '$artistDetails.image' 
        } 
      }
    ]);

    const topGenres = await NexoriaUserHistory.aggregate([
      { $lookup: { from: 'nexoriatracks', localField: 'track', foreignField: '_id', as: 'trackDetails' } },
      { $unwind: '$trackDetails' },
      { $group: { _id: '$trackDetails.genre', plays: { $sum: 1 } } },
      { $sort: { plays: -1 } },
      { $limit: 10 },
      { $lookup: { from: 'nexoriagenres', localField: '_id', foreignField: '_id', as: 'genreDetails' } },
      { $unwind: { path: '$genreDetails', preserveNullAndEmptyArrays: true } },
      { $project: { 
          _id: 1, 
          plays: 1, 
          name: '$genreDetails.name', 
          hexColor: '$genreDetails.hexColor' 
        } 
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        overview: { totalPlays, uniqueListeners },
        recentActivity,
        topTracks,
        topArtists,
        topGenres
      }
    });
  } catch (error) {
    logger.error(`Get Analytics Error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Failed to fetch analytics' });
  }
};



// ==========================================
// ADMIN: DEEP ANALYTICS & INSIGHTS
// ==========================================

export const getDeepAnalytics = async (req, res) => {
  try {
    // 1. Global Overview
    const totalPlays = await NexoriaUserHistory.countDocuments();
    const uniqueListenersData = await NexoriaUserHistory.aggregate([
      { $group: { _id: '$user' } },
      { $count: 'uniqueListeners' }
    ]);
    const uniqueListeners = uniqueListenersData.length > 0 ? uniqueListenersData[0].uniqueListeners : 0;

    // 2. Top Listeners (Who listens the most)
    const topListeners = await NexoriaUserHistory.aggregate([
      { $group: { _id: '$user', totalListens: { $sum: 1 } } },
      { $sort: { totalListens: -1 } },
      { $limit: 10 },
      { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'userDetails' } },
      { $unwind: '$userDetails' },
      { $project: { _id: 1, totalListens: 1, name: '$userDetails.name', email: '$userDetails.email', avatar: '$userDetails.profilePicture' } }
    ]);

    // 3. Track Repetition (Who is listening to WHICH song repeatedly)
    const repeatListeners = await NexoriaUserHistory.aggregate([
      { $group: { _id: { user: '$user', track: '$track' }, playCount: { $sum: 1 } } },
      { $match: { playCount: { $gt: 2 } } }, // Listened more than twice
      { $sort: { playCount: -1 } },
      { $limit: 20 },
      { $lookup: { from: 'users', localField: '_id.user', foreignField: '_id', as: 'userDetails' } },
      { $unwind: '$userDetails' },
      { $lookup: { from: 'nexoriatracks', localField: '_id.track', foreignField: '_id', as: 'trackDetails' } },
      { $unwind: '$trackDetails' },
      { $lookup: { from: 'nexoriaartists', localField: 'trackDetails.artist', foreignField: '_id', as: 'artistDetails' } },
      { $unwind: { path: '$artistDetails', preserveNullAndEmptyArrays: true } },
      { $project: { 
          user: { name: '$userDetails.name', avatar: '$userDetails.profilePicture' },
          track: { title: '$trackDetails.title', cover: '$trackDetails.coverImage', artist: '$artistDetails.name' },
          playCount: 1 
      }}
    ]);

    // 4. Trending Types/Moods (Grouping by Genre to see if Sad/Romantic is trending)
    const trendingTypes = await NexoriaUserHistory.aggregate([
      { $lookup: { from: 'nexoriatracks', localField: 'track', foreignField: '_id', as: 'trackDetails' } },
      { $unwind: '$trackDetails' },
      { $group: { _id: '$trackDetails.genre', plays: { $sum: 1 } } },
      { $sort: { plays: -1 } },
      { $limit: 10 },
      { $lookup: { from: 'nexoriagenres', localField: '_id', foreignField: '_id', as: 'genreDetails' } },
      { $unwind: { path: '$genreDetails', preserveNullAndEmptyArrays: true } },
      { $project: { 
          plays: 1, 
          name: '$genreDetails.name', 
          hexColor: '$genreDetails.hexColor' 
        } 
      }
    ]);
    
    // 5. Recent Live Activity
    const recentActivity = await NexoriaUserHistory.find()
      .sort({ playedAt: -1 })
      .limit(30)
      .populate('user', 'name profilePicture username')
      .populate({
        path: 'track',
        select: 'title coverImage artist genre',
        populate: [
          { path: 'artist', select: 'name image' },
          { path: 'genre', select: 'name hexColor' }
        ]
      });

    res.status(200).json({
      success: true,
      data: {
        overview: { totalPlays, uniqueListeners },
        topListeners,
        repeatListeners,
        trendingTypes,
        recentActivity
      }
    });
  } catch (error) {
    logger.error(`Get Deep Analytics Error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Failed to fetch deep analytics' });
  }
};
