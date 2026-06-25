import mongoose from 'mongoose';

const movieReportSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  movie: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Movie',
    required: true
  },
  reason: {
    type: String,
    enum: [
      'Broken Video Link',
      'Broken Download Link',
      'Poor Video Quality',
      'Wrong Movie/Episode',
      'Subtitle Issue',
      'Audio Issue',
      'Other'
    ],
    required: true
  },
  description: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Resolved', 'Rejected'],
    default: 'Pending'
  },
  resolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  resolvedAt: {
    type: Date
  }
}, { timestamps: true });

export default mongoose.model('MovieReport', movieReportSchema);
