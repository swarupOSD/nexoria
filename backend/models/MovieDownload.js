import mongoose from 'mongoose';

const movieDownloadSchema = new mongoose.Schema(
  {
    movie: {
      type: mongoose.Schema.ObjectId,
      ref: 'Movie',
      required: true,
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
    },
    ipAddress: String,
    userAgent: String,
  },
  {
    timestamps: true,
  }
);

const MovieDownload = mongoose.model('MovieDownload', movieDownloadSchema);
export default MovieDownload;
