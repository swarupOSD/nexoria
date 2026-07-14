import mongoose from 'mongoose';

const chatMessageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['text', 'voice'],
      default: 'text',
    },
    message: {
      type: String,
      trim: true,
      maxLength: [500, 'Message cannot exceed 500 characters'],
    },
    audioUrl: {
      type: String,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    isEdited: {
      type: Boolean,
      default: false,
    }
  },
  {
    timestamps: true,
  }
);

const ChatMessage = mongoose.model('ChatMessage', chatMessageSchema);

export default ChatMessage;
