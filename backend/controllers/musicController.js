import Music from '../models/Music.js';
import MusicFavorite from '../models/MusicFavorite.js';
import MusicHistory from '../models/MusicHistory.js';

// Admin: Create new song
export const createSong = async (req, res) => {
  try {
    const song = new Music({
      ...req.body,
      createdBy: req.user._id
    });
    await song.save();
    res.status(201).json({ success: true, data: song });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Admin: Update song
export const updateSong = async (req, res) => {
  try {
    const song = await Music.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!song) return res.status(404).json({ success: false, message: 'Song not found' });
    res.status(200).json({ success: true, data: song });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Admin: Delete song
export const deleteSong = async (req, res) => {
  try {
    const song = await Music.findByIdAndDelete(req.params.id);
    if (!song) return res.status(404).json({ success: false, message: 'Song not found' });
    
    // Cleanup favorites
    await MusicFavorite.deleteMany({ song: req.params.id });
    
    res.status(200).json({ success: true, message: 'Song deleted successfully' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Public: Get all active songs with filters
export const getSongs = async (req, res) => {
  try {
    const { category, isFeatured, isTrending, search, limit = 20, sort = '-createdAt' } = req.query;
    
    let query = { status: 'Active' };
    if (category) query.category = category;
    if (isFeatured) query.isFeatured = isFeatured === 'true';
    if (isTrending) query.isTrending = isTrending === 'true';
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { artist: { $regex: search, $options: 'i' } }
      ];
    }

    const songs = await Music.find(query)
      .sort(sort)
      .limit(parseInt(limit))
      .select('-__v');

    res.status(200).json({ success: true, count: songs.length, data: songs });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Admin: Get all songs (including inactive)
export const getAllSongsAdmin = async (req, res) => {
  try {
    const songs = await Music.find().sort('-createdAt').populate('createdBy', 'name');
    res.status(200).json({ success: true, count: songs.length, data: songs });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Public: Track play count
export const trackPlay = async (req, res) => {
  try {
    const song = await Music.findByIdAndUpdate(req.params.id, { $inc: { playCount: 1 } }, { new: true });
    if (!song) return res.status(404).json({ success: false, message: 'Song not found' });
    res.status(200).json({ success: true, data: { playCount: song.playCount } });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// User: Record Listen History & Time
export const recordListenHistory = async (req, res) => {
  try {
    const { id } = req.params; // song id
    const { listenTime } = req.body; // in seconds
    const userId = req.user._id;

    let history = await MusicHistory.findOne({ user: userId, song: id });
    
    if (history) {
      history.listenCount += 1;
      history.totalListenTime += (listenTime || 0);
      history.lastListenedAt = Date.now();
      await history.save();
    } else {
      await MusicHistory.create({
        user: userId,
        song: id,
        listenCount: 1,
        totalListenTime: listenTime || 0,
        lastListenedAt: Date.now()
      });
    }

    res.status(200).json({ success: true });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// User: Toggle Favorite
export const toggleFavorite = async (req, res) => {
  try {
    const { id } = req.params; // song id
    const userId = req.user._id;

    const existingFavorite = await MusicFavorite.findOne({ user: userId, song: id });

    if (existingFavorite) {
      await MusicFavorite.findByIdAndDelete(existingFavorite._id);
      await Music.findByIdAndUpdate(id, { $inc: { likes: -1 } });
      return res.status(200).json({ success: true, message: 'Removed from favorites', isFavorited: false });
    } else {
      await MusicFavorite.create({ user: userId, song: id });
      await Music.findByIdAndUpdate(id, { $inc: { likes: 1 } });
      return res.status(200).json({ success: true, message: 'Added to favorites', isFavorited: true });
    }
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// User: Get Favorites
export const getUserFavorites = async (req, res) => {
  try {
    const favorites = await MusicFavorite.find({ user: req.user._id }).populate('song');
    // Extract only the songs and filter out any deleted ones
    const songs = favorites.map(f => f.song).filter(s => s && s.status === 'Active');
    res.status(200).json({ success: true, count: songs.length, data: songs });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Admin: Analytics
export const getAnalytics = async (req, res) => {
  try {
    const totalSongs = await Music.countDocuments();
    const activeSongs = await Music.countDocuments({ status: 'Active' });
    
    const [stats] = await Music.aggregate([
      {
        $group: {
          _id: null,
          totalPlays: { $sum: "$playCount" },
          totalLikes: { $sum: "$likes" },
          totalViews: { $sum: "$views" }
        }
      }
    ]);

    const mostPlayed = await Music.find().sort('-playCount').limit(5);
    const mostLoved = await Music.find().sort('-likes').limit(5);

    res.status(200).json({
      success: true,
      data: {
        totalSongs,
        activeSongs,
        totalPlays: stats?.totalPlays || 0,
        totalLikes: stats?.totalLikes || 0,
        totalViews: stats?.totalViews || 0,
        mostPlayed,
        mostLoved
      }
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
// User: Music Analytics (Spotify Wrapped Style)
export const getUserMusicAnalytics = async (req, res) => {
  try {
    const userId = req.user._id;

    // Aggregate total minutes listened
    const historyStats = await MusicHistory.aggregate([
      { $match: { user: userId } },
      { $group: { _id: null, totalSeconds: { $sum: "$totalListenTime" }, totalStreams: { $sum: "$listenCount" } } }
    ]);

    const totalMinutes = historyStats.length > 0 ? Math.round(historyStats[0].totalSeconds / 60) : 0;
    const totalStreams = historyStats.length > 0 ? historyStats[0].totalStreams : 0;

    // Get Top 5 Songs
    const topSongsRecords = await MusicHistory.find({ user: userId })
      .sort('-listenCount')
      .limit(5)
      .populate('song', 'title artist image');

    const topSongs = topSongsRecords.map(h => ({
      _id: h.song._id,
      title: h.song.title,
      artist: h.song.artist,
      image: h.song.image,
      listenCount: h.listenCount
    }));

    // Most loved songs (Favorites)
    const favorites = await MusicFavorite.find({ user: userId })
      .sort('-createdAt')
      .limit(5)
      .populate('song', 'title artist image');
      
    const lovedSongs = favorites.map(f => f.song).filter(s => s != null);

    res.status(200).json({
      success: true,
      data: {
        totalMinutes,
        totalStreams,
        topSongs,
        lovedSongs
      }
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Search songs on JioSaavn (Public)
// @route   GET /api/music/saavn/search
// @access  Public
export const searchJioSaavn = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) return res.status(400).json({ success: false, message: 'Search query is required' });

    const jiosaavn = await import('../utils/jiosaavn.js');
    const songs = await jiosaavn.searchSongs(query);
    
    res.status(200).json({ success: true, data: songs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get JioSaavn song streaming URL
// @route   GET /api/music/saavn/song/:id
// @access  Public
export const getJioSaavnSong = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) return res.status(400).json({ success: false, message: 'Saavn ID is required' });

    const jiosaavn = await import('../utils/jiosaavn.js');
    const details = await jiosaavn.getSongDetails(id);
    
    if (!details.audioUrl) {
      return res.status(400).json({ success: false, message: 'Could not decrypt streaming URL' });
    }

    res.status(200).json({ success: true, data: details });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Search songs on YouTube
// @route   GET /api/music/youtube/search
// @access  Public
export const searchYouTube = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) return res.status(400).json({ success: false, message: 'Search query is required' });

    const ytUtils = await import('../utils/youtube.js');
    const videos = await ytUtils.searchYouTube(query);
    
    res.status(200).json({ success: true, data: videos });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get direct audio stream URL for a YouTube video
// @route   GET /api/music/youtube/stream/:id
// @access  Public
export const getYoutubeStream = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ success: false, message: 'YouTube ID is required' });

    const { createRequire } = await import('module');
    const require = createRequire(import.meta.url);
    const youtubedl = require('youtube-dl-exec');
    
    const output = await youtubedl(`https://www.youtube.com/watch?v=${id}`, {
      dumpJson: true,
      noWarnings: true,
      noCallHome: true,
      noCheckCertificate: true,
      preferFreeFormats: true,
      youtubeSkipDashManifest: true,
      referer: 'https://www.youtube.com'
    });
    
    const formats = output.formats.filter(f => f.acodec !== 'none' && f.vcodec === 'none');
    if (!formats || formats.length === 0) {
      return res.status(404).json({ success: false, message: 'Audio stream not found for this video' });
    }

    res.status(200).json({ success: true, data: { streamUrl: formats[0].url } });
  } catch (error) {
    console.error('Error getting YT stream:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
