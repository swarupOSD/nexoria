import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema(
  {
    post: {
      type: mongoose.Schema.ObjectId,
      ref: 'Post',
      required: true,
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
    },
    name: {
      type: String,
      required: function() { return !this.user; }
    },
    email: {
      type: String,
      required: function() { return !this.user; }
    },
    content: {
      type: String,
      required: function() { return !this.rating; }
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected'],
      default: 'Pending', // Requires moderation
    },
    // Moderation
    moderatedBy: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
    },
    moderationTimestamp: Date,
    rejectionReason: String,
    parentComment: {
      type: mongoose.Schema.ObjectId,
      ref: 'Comment',
      default: null,
    },
    replies: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'Comment',
      }
    ],
  },
  {
    timestamps: true,
  }
);

// Prevent user from submitting multiple ratings for same post
commentSchema.index({ post: 1, user: 1 }, { unique: true, partialFilterExpression: { user: { $exists: true }, rating: { $exists: true } } });

// Static method to get average rating
commentSchema.statics.getAverageRating = async function (postId) {
  const obj = await this.aggregate([
    {
      $match: { post: postId, rating: { $exists: true }, status: 'Approved' },
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
      averageRating: obj[0] ? obj[0].averageRating : 0,
      totalVotes: obj[0] ? obj[0].totalVotes : 0,
    });
  } catch (err) {
    console.error(err);
  }
};

// Call getAverageRating after save
commentSchema.post('save', function () {
  if (this.rating && this.status === 'Approved') {
    this.constructor.getAverageRating(this.post);
  }
});

// Call getAverageRating before remove
commentSchema.pre('deleteOne', { document: true, query: false }, function () {
  if (this.rating && this.status === 'Approved') {
    this.constructor.getAverageRating(this.post);
  }
});

const Comment = mongoose.model('Comment', commentSchema);
export default Comment;
