import mongoose from 'mongoose';

const nexoriaUserHistorySchema = new mongoose.Schema(
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
    }
  },
  { timestamps: true }
);

// Index to quickly fetch recent history for a user
nexoriaUserHistorySchema.index({ user: 1, playedAt: -1 });

const NexoriaUserHistory = mongoose.model('NexoriaUserHistory', nexoriaUserHistorySchema);
export default NexoriaUserHistory;
