import WatchHistory from '../models/WatchHistory.js';
import Movie from '../models/Movie.js';

// @desc    Update watch progress
// @route   POST /api/watch-history/update
// @access  Private
export const updateWatchHistory = async (req, res) => {
  try {
    const { movieId, progress, duration } = req.body;

    if (!movieId || progress === undefined || !duration) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    // Check if movie exists
    const movie = await Movie.findById(movieId);
    if (!movie) {
      return res.status(404).json({ success: false, message: 'Movie not found' });
    }

    const percentage = (progress / duration) * 100;
    const completed = percentage >= 95; // Consider completed if > 95% watched

    let history = await WatchHistory.findOne({ user: req.user._id, movie: movieId });

    if (history) {
      // Update existing
      history.progress = progress;
      history.duration = duration;
      history.completed = completed;
      await history.save();
    } else {
      // Create new
      history = await WatchHistory.create({
        user: req.user._id,
        movie: movieId,
        progress,
        duration,
        completed,
      });
    }

    res.status(200).json({ success: true, data: history });
  } catch (error) {
    console.error('Update watch history error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Get user watch history
// @route   GET /api/watch-history
// @access  Private
export const getWatchHistory = async (req, res) => {
  try {
    const history = await WatchHistory.find({ user: req.user._id })
      .populate('movie', 'title slug poster quality releaseYear rating duration type')
      .sort('-updatedAt')
      .limit(20);

    // Filter out entries where movie might have been deleted
    const validHistory = history.filter(item => item.movie);

    res.status(200).json({ success: true, data: validHistory });
  } catch (error) {
    console.error('Get watch history error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Remove from watch history
// @route   DELETE /api/watch-history/:movieId
// @access  Private
export const removeFromWatchHistory = async (req, res) => {
  try {
    const { movieId } = req.params;
    await WatchHistory.findOneAndDelete({ user: req.user._id, movie: movieId });

    res.status(200).json({ success: true, message: 'Removed from watch history' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
