import mongoose from 'mongoose';

const userPurchasesSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
      required: true,
    },
    purchaseDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

userPurchasesSchema.index({ user: 1, post: 1 }, { unique: true });

const UserPurchases = mongoose.model('UserPurchases', userPurchasesSchema);
export default UserPurchases;
