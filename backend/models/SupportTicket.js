import mongoose from 'mongoose';

const supportTicketSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['forgot_password', 'account_locked', 'gmail_change', 'billing_issue', 'other'],
      required: true,
      default: 'other',
    },
    subject: {
      type: String,
      required: [true, 'Please provide a subject'],
      trim: true,
      maxlength: [150, 'Subject cannot exceed 150 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please describe your issue'],
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    // For forgot password/gmail - user can provide their registered email
    userEmail: {
      type: String,
      trim: true,
      lowercase: true,
    },
    status: {
      type: String,
      enum: ['open', 'in_progress', 'resolved', 'closed'],
      default: 'open',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    adminNote: {
      type: String,
      maxlength: [1000, 'Admin note cannot exceed 1000 characters'],
    },
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    resolvedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

const SupportTicket = mongoose.model('SupportTicket', supportTicketSchema);
export default SupportTicket;
