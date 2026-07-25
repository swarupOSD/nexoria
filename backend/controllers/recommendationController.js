import MovieWatchHistory from '../models/MovieWatchHistory.js';
import Movie from '../models/Movie.js';
import NexoriaUserHistory from '../models/NexoriaUserHistory.js';
import NexoriaTrack from '../models/NexoriaTrack.js';
import User from '../models/User.js';

export const getMovieRecommendations = async (req, res) => {
  try {
    const userId = req.user._id;

    // Fetch user's watch history
    const history = await MovieWatchHistory.find({ user: userId }).populate('movie');
    
    if (!history || history.length === 0) {
      // Fallback: return top rated/trending movies
      const trendingMovies = await Movie.find({ status: 'published' })
        .sort('-views -rating')
        .limit(10);
      return res.status(200).json({ success: true, data: trendingMovies });
    }

    // Extract genres from watched movies
    const genreCounts = {};
    history.forEach(record => {
      if (record.movie && record.movie.genres) {
        record.movie.genres.forEach(genre => {
          genreCounts[genre] = (genreCounts[genre] || 0) + 1;
        });
      }
    });

    // Find top 3 genres
    const topGenres = Object.entries(genreCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(entry => entry[0]);

    // Get movie IDs already watched
    const watchedMovieIds = history.map(record => record.movie?._id);

    // Fetch recommended movies
    let recommendations = await Movie.find({
      _id: { $nin: watchedMovieIds },
      genres: { $in: topGenres },
      status: 'published'
    })
    .sort('-rating -views')
    .limit(10);

    // If not enough recommendations, pad with trending
    if (recommendations.length < 10) {
      const moreMovies = await Movie.find({
        _id: { $nin: [...watchedMovieIds, ...recommendations.map(m => m._id)] },
        status: 'published'
      })
      .sort('-views')
      .limit(10 - recommendations.length);
      
      recommendations = [...recommendations, ...moreMovies];
    }

    res.status(200).json({ success: true, data: recommendations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMusicRecommendations = async (req, res) => {
  try {
    const userId = req.user._id;

    const history = await NexoriaUserHistory.findOne({ user: userId }).populate('recentlyPlayed.track');
    
    if (!history || !history.recentlyPlayed || history.recentlyPlayed.length === 0) {
      // Fallback: return trending tracks
      const trendingTracks = await NexoriaTrack.find({ status: 'published' })
        .sort('-playCount')
        .limit(10)
        .populate('artist album');
      return res.status(200).json({ success: true, data: trendingTracks });
    }

    // Extract tags from recently played tracks
    const tagCounts = {};
    history.recentlyPlayed.forEach(record => {
      if (record.track && record.track.tags) {
        record.track.tags.forEach(tag => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
      }
    });

    const topTags = Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(entry => entry[0]);

    const playedTrackIds = history.recentlyPlayed.map(record => record.track?._id);

    let recommendations = await NexoriaTrack.find({
      _id: { $nin: playedTrackIds },
      tags: { $in: topTags },
      status: 'published'
    })
    .sort('-playCount')
    .limit(10)
    .populate('artist album');

    if (recommendations.length < 10) {
      const moreTracks = await NexoriaTrack.find({
        _id: { $nin: [...playedTrackIds, ...recommendations.map(t => t._id)] },
        status: 'published'
      })
      .sort('-playCount')
      .limit(10 - recommendations.length)
      .populate('artist album');

      recommendations = [...recommendations, ...moreTracks];
    }

    res.status(200).json({ success: true, data: recommendations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
