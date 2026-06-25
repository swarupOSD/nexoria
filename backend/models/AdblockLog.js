import mongoose from 'mongoose';

const adblockLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      default: null
    },
    ipAddress: {
      type: String,
      required: true
    },
    userAgent: String,
    methodUsed: {
      type: String,
      required: true,
      enum: ['bait_element', 'script_loading', 'google_ads_fetch', 'network_failure', 'unknown']
    },
    detectedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

const AdblockLog = mongoose.model('AdblockLog', adblockLogSchema);
export default AdblockLog;
