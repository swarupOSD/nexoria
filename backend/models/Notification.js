import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['SYSTEM', 'DOWNLOAD', 'COMMENT', 'REPLY', 'RATING', 'PREMIUM', 'MODERATION', 'REPORT', 'ADMIN', 'SECURITY', 'STORE'],
    required: true
  },
  icon: {
    type: String,
    default: 'Bell' // Lucide icon name fallback
  },
  isRead: {
    type: Boolean,
    default: false
  },
  actionUrl: {
    type: String,
    default: null
  }
}, { timestamps: true });

export default mongoose.model('Notification', notificationSchema);
