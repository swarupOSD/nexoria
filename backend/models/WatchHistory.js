import mongoose from 'mongoose';

const watchHistorySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    movie: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Movie',
      required: true,
    },
    progress: {
      type: Number,
      required: true,
      default: 0, // in seconds
    },
    duration: {
      type: Number,
      required: true,
      default: 0, // in seconds
    },
    completed: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Compound index to ensure one history entry per user per movie
watchHistorySchema.index({ user: 1, movie: 1 }, { unique: true });
watchHistorySchema.index({ user: 1, updatedAt: -1 }); // Fast query for recently watched

const WatchHistory = mongoose.model('WatchHistory', watchHistorySchema);

export default WatchHistory;
