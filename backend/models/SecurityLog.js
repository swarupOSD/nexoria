import mongoose from 'mongoose';

const securityLogSchema = new mongoose.Schema({
  eventType: {
    type: String,
    required: true,
    enum: ['FAILED_LOGIN', 'RATE_LIMIT_VIOLATION', 'UNAUTHORIZED_ADMIN_ACCESS', 'MALICIOUS_PAYLOAD', 'CSRF_VIOLATION', 'GAME_CREATED', 'GAME_UPDATED', 'GAME_DELETED'],
  },
  ipAddress: {
    type: String,
    required: true,
  },
  userAgent: {
    type: String,
  },
  details: {
    type: Object,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 86400 * 30, // Auto-delete after 30 days
  }
});

const SecurityLog = mongoose.model('SecurityLog', securityLogSchema);

export default SecurityLog;
