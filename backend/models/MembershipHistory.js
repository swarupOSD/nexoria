import mongoose from 'mongoose';

const membershipHistorySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    action: {
      type: String, // e.g. "Upgraded to Monthly Premium", "Expired", "Revoked"
      required: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    details: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const MembershipHistory = mongoose.model('MembershipHistory', membershipHistorySchema);
export default MembershipHistory;
