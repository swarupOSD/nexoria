import mongoose from 'mongoose';

// ── Conversation Schema ──────────────────────────────────────────────────
const conversationSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PrivateMessage'
  },
  // Theme per conversation (Instagram-style)
  theme: {
    type: String,
    enum: ['default', 'cherry', 'galaxy', 'flame', 'forest', 'cyberpunk', 'ice', 'pride'],
    default: 'default'
  },
  // Pinned by which users
  pinnedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  // Unread count per user
  unreadCount: {
    type: Map,
    of: Number,
    default: {}
  },
  // Muted by which users
  mutedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

export const Conversation = mongoose.model('Conversation', conversationSchema);

// ── Private Message Schema ───────────────────────────────────────────────
const privateMessageSchema = new mongoose.Schema({
  conversationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
    required: true,
    index: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Message type: text | image | gif | sticker | voice
  type: {
    type: String,
    enum: ['text', 'image', 'gif', 'sticker', 'voice'],
    default: 'text'
  },
  text: {
    type: String,
    default: ''
  },
  // For image/gif/voice messages
  mediaUrl: {
    type: String,
    default: ''
  },
  // GIF specific: tenor ID and URL
  gifData: {
    id: String,
    url: String,
    preview: String,
    title: String
  },
  // Reply to another message
  replyTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PrivateMessage',
    default: null
  },
  // Emoji reactions: [{ user: ObjectId, emoji: '❤️' }]
  reactions: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    emoji: {
      type: String,
      maxlength: 10
    }
  }],
  // Seen by list for future multi-user groups
  seenBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    seenAt: {
      type: Date,
      default: Date.now
    }
  }],
  // Legacy: simple isRead for 1-on-1
  isRead: {
    type: Boolean,
    default: false
  },
  // Unsend: message content hidden but record kept
  isUnsent: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

export const PrivateMessage = mongoose.model('PrivateMessage', privateMessageSchema);

