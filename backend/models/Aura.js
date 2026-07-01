import mongoose from 'mongoose';

const auraSchema = new mongoose.Schema({
  itemId: {
    type: mongoose.Schema.ObjectId,
    required: true,
    index: true,
  },
  itemType: {
    type: String,
    enum: ['post', 'game', 'music'],
    required: true,
  },
  score: {
    type: Number,
    default: 0,
    min: 0,
    max: 999,
  },
  vibeVotes: {
    type: Number,
    default: 0,
  },
  // Track who voted and when (to enforce 24h cooldown)
  voters: [{
    userId: { type: mongoose.Schema.ObjectId, ref: 'User' },
    votedAt: { type: Date, default: Date.now },
  }],
  battleWins: {
    type: Number,
    default: 0,
  },
  isSurging: {
    type: Boolean,
    default: false,
  },
  surgeTriggeredAt: Date,
  lastRecalculated: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

// Compound index for efficient leaderboard queries
auraSchema.index({ score: -1, itemType: 1 });
auraSchema.index({ itemId: 1, itemType: 1 }, { unique: true });

const Aura = mongoose.model('Aura', auraSchema);
export default Aura;
