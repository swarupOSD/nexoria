import mongoose from 'mongoose';

const movieWatchHistorySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    movie: {
      type: mongoose.Schema.ObjectId,
      ref: 'Movie',
      required: true,
      index: true,
    },
    series: {
      type: Boolean,
      default: false,
    },
    seasonNumber: {
      type: Number,
    },
    episodeNumber: {
      type: Number,
    },
    watchTime: {
      type: Number, // in seconds
      default: 0,
    },
    lastViewed: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate entries for the same movie/episode per user
movieWatchHistorySchema.index({ user: 1, movie: 1, seasonNumber: 1, episodeNumber: 1 }, { unique: true });

const MovieWatchHistory = mongoose.model('MovieWatchHistory', movieWatchHistorySchema);
export default MovieWatchHistory;
