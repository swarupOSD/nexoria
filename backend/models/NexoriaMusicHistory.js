import mongoose from 'mongoose';

const nexoriaMusicHistorySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true
    },
    track: {
      type: mongoose.Schema.ObjectId,
      ref: 'NexoriaTrack',
      required: true
    },
    playedAt: {
      type: Date,
      default: Date.now
    },
    durationPlayed: {
      type: Number,
      default: 0 // How many seconds the user actually listened
    }
  },
  {
    timestamps: true // Useful for 'recently played' algorithms
  }
);

nexoriaMusicHistorySchema.index({ user: 1, playedAt: -1 }); // Fast querying for user's history

const NexoriaMusicHistory = mongoose.model('NexoriaMusicHistory', nexoriaMusicHistorySchema);
export default NexoriaMusicHistory;
