import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    rewardType: {
      type: String,
      enum: ['Points', 'PremiumDays'],
      required: true,
    },
    rewardValue: {
      type: Number,
      required: true,
    },
    usageLimit: {
      type: Number,
      default: 1, // How many users can use it in total
    },
    usedCount: {
      type: Number,
      default: 0,
    },
    usedBy: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        usedAt: { type: Date, default: Date.now },
      }
    ],
    expiresAt: {
      type: Date,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }
  },
  { timestamps: true }
);

export default mongoose.model('Coupon', couponSchema);
