import mongoose from 'mongoose';

const movieReviewSchema = new mongoose.Schema(
  {
    movie: {
      type: mongoose.Schema.ObjectId,
      ref: 'Movie',
      required: true,
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: true,
    },
    isApproved: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent user from submitting more than one review per movie
movieReviewSchema.index({ movie: 1, user: 1 }, { unique: true });

const MovieReview = mongoose.model('MovieReview', movieReviewSchema);
export default MovieReview;
