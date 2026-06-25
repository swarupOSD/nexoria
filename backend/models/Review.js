import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
    },
    post: {
      type: mongoose.Schema.ObjectId,
      ref: 'Post',
      required: true,
      index: true,
    },
    rating: {
      type: Number,
      required: [true, 'Please provide a rating'],
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: [true, 'Please provide a review comment'],
      trim: true,
      maxlength: [1000, 'Review cannot exceed 1000 characters'],
    },
    isApproved: {
      type: Boolean,
      default: true,
      index: true,
    },
    editedAt: {
      type: Date,
    }
  },
  {
    timestamps: true,
  }
);

// Prevent user from submitting more than one review per post
reviewSchema.index({ post: 1, user: 1 }, { unique: true });

// Static method to get avg rating and save
reviewSchema.statics.getAverageRating = async function (postId) {
  const obj = await this.aggregate([
    {
      $match: { post: postId, isApproved: true },
    },
    {
      $group: {
        _id: '$post',
        averageRating: { $avg: '$rating' },
        totalVotes: { $sum: 1 },
      },
    },
  ]);

  try {
    await this.model('Post').findByIdAndUpdate(postId, {
      averageRating: obj[0]?.averageRating || 0,
      totalVotes: obj[0]?.totalVotes || 0,
    });
  } catch (err) {
    console.error(err);
  }
};

// Call getAverageRating after save
reviewSchema.post('save', function () {
  this.constructor.getAverageRating(this.post);
});

// Call getAverageRating after remove
reviewSchema.post('deleteOne', { document: true, query: false }, function () {
  this.constructor.getAverageRating(this.post);
});

// For update operations (e.g. approving/unapproving)
reviewSchema.post('findOneAndUpdate', async function(doc) {
  if (doc) {
    await doc.constructor.getAverageRating(doc.post);
  }
});

const Review = mongoose.model('Review', reviewSchema);
export default Review;
