import mongoose from 'mongoose';

const musicHistorySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  song: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Music',
    required: true,
  },
  listenCount: {
    type: Number,
    default: 1,
  },
  totalListenTime: {
    type: Number, // in seconds
    default: 0,
  },
  lastListenedAt: {
    type: Date,
    default: Date.now,
  }
}, { timestamps: true });

// Compound index to ensure we can easily find a user's stats for a specific song
musicHistorySchema.index({ user: 1, song: 1 }, { unique: true });

const MusicHistory = mongoose.model('MusicHistory', musicHistorySchema);
export default MusicHistory;
