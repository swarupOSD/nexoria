import mongoose from 'mongoose';

const premiumPlanSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    price: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: 'INR',
    },
    durationDays: {
      type: Number,
      required: true,
    },
    benefits: [
      {
        type: String,
      }
    ],
    badgeColor: {
      type: String,
      default: 'blue',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const PremiumPlan = mongoose.model('PremiumPlan', premiumPlanSchema);
export default PremiumPlan;
