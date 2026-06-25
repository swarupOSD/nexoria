import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    required: true
  },
  downloadLink: {
    type: mongoose.Schema.Types.ObjectId,
  },
  reason: {
    type: String,
    enum: [
      'Broken Download Link',
      'Fake App',
      'Wrong Version',
      'Malware Suspicion',
      'Malware/Suspicious Content',
      'Copyright Violation',
      'Wrong Information',
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

export default mongoose.model('Report', reportSchema);
