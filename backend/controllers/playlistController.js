import Playlist from '../models/Playlist.js';

// Admin: Create new playlist
export const createPlaylist = async (req, res) => {
  try {
    const playlist = new Playlist({
      ...req.body,
      createdBy: req.user._id
    });
    await playlist.save();
    res.status(201).json({ success: true, data: playlist });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Admin: Update playlist
export const updatePlaylist = async (req, res) => {
  try {
    const playlist = await Playlist.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!playlist) return res.status(404).json({ success: false, message: 'Playlist not found' });
    res.status(200).json({ success: true, data: playlist });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Admin: Delete playlist
export const deletePlaylist = async (req, res) => {
  try {
    const playlist = await Playlist.findByIdAndDelete(req.params.id);
    if (!playlist) return res.status(404).json({ success: false, message: 'Playlist not found' });
    res.status(200).json({ success: true, message: 'Playlist deleted successfully' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Public: Get playlists
export const getPlaylists = async (req, res) => {
  try {
    const { category, isFeatured, isTrending, limit = 20 } = req.query;
    
    let query = { status: 'Active' };
    if (category) query.category = category;
    if (isFeatured) query.isFeatured = isFeatured === 'true';
    if (isTrending) query.isTrending = isTrending === 'true';

    const playlists = await Playlist.find(query)
      .sort('-createdAt')
      .limit(parseInt(limit))
      .populate({
        path: 'songs',
        match: { status: 'Active' },
        select: 'title artist image duration audioUrl isYoutube'
      });

    res.status(200).json({ success: true, count: playlists.length, data: playlists });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Admin: Get all playlists
export const getAllPlaylistsAdmin = async (req, res) => {
  try {
    const playlists = await Playlist.find()
      .sort('-createdAt')
      .populate('createdBy', 'name')
      .populate('songs', 'title artist');
    res.status(200).json({ success: true, count: playlists.length, data: playlists });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Public: Get single playlist
export const getPlaylist = async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id).populate({
      path: 'songs',
      match: { status: 'Active' }
    });
    if (!playlist) return res.status(404).json({ success: false, message: 'Playlist not found' });
    res.status(200).json({ success: true, data: playlist });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Admin: Add/Remove song from playlist
export const toggleSongInPlaylist = async (req, res) => {
  try {
    const { playlistId, songId } = req.params;
    const { action } = req.body; // 'add' or 'remove'

    const playlist = await Playlist.findById(playlistId);
    if (!playlist) return res.status(404).json({ success: false, message: 'Playlist not found' });

    if (action === 'add') {
      if (!playlist.songs.includes(songId)) {
        playlist.songs.push(songId);
      }
    } else if (action === 'remove') {
      playlist.songs = playlist.songs.filter(id => id.toString() !== songId);
    }

    await playlist.save();
    
    // Repopulate before returning
    await playlist.populate('songs', 'title artist');
    
    res.status(200).json({ success: true, data: playlist });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// ==========================================
// USER PLAYLIST CONTROLLERS
// ==========================================

export const createUserPlaylist = async (req, res) => {
  try {
    const playlist = new Playlist({
      ...req.body,
      createdBy: req.user._id,
      category: 'User Playlist'
    });
    await playlist.save();
    res.status(201).json({ success: true, data: playlist });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getUserPlaylists = async (req, res) => {
  try {
    const playlists = await Playlist.find({ createdBy: req.user._id })
      .sort('-createdAt')
      .populate('songs', 'title artist image duration audioUrl isYoutube');
    res.status(200).json({ success: true, count: playlists.length, data: playlists });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updateUserPlaylist = async (req, res) => {
  try {
    const playlist = await Playlist.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!playlist) return res.status(404).json({ success: false, message: 'Playlist not found or unauthorized' });
    res.status(200).json({ success: true, data: playlist });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteUserPlaylist = async (req, res) => {
  try {
    const playlist = await Playlist.findOneAndDelete({ _id: req.params.id, createdBy: req.user._id });
    if (!playlist) return res.status(404).json({ success: false, message: 'Playlist not found or unauthorized' });
    res.status(200).json({ success: true, message: 'Playlist deleted successfully' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const toggleSongInUserPlaylist = async (req, res) => {
  try {
    const { playlistId, songId } = req.params;
    const { action } = req.body;

    const playlist = await Playlist.findOne({ _id: playlistId, createdBy: req.user._id });
    if (!playlist) return res.status(404).json({ success: false, message: 'Playlist not found or unauthorized' });

    if (action === 'add') {
      if (!playlist.songs.includes(songId)) playlist.songs.push(songId);
    } else if (action === 'remove') {
      playlist.songs = playlist.songs.filter(id => id.toString() !== songId);
    }

    await playlist.save();
    await playlist.populate('songs', 'title artist image duration audioUrl isYoutube');
    
    res.status(200).json({ success: true, data: playlist });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
