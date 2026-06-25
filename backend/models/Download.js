import mongoose from 'mongoose';

const downloadSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      // Optional, as anonymous users can also download
    },
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
      required: true,
    },
    downloadLink: {
      type: mongoose.Schema.Types.ObjectId,
      // Reference to the specific sub-document inside Post.downloadLinks
    },
    ipAddress: String,
    userAgent: String,
    downloadedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const Download = mongoose.model('Download', downloadSchema);
export default Download;
