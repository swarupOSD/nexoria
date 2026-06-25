import mongoose from 'mongoose';

const requestSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a title for your request'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    type: {
      type: String,
      enum: ['Movie', 'Web Series', 'Game', 'App', 'Other'],
      required: [true, 'Please specify the type of request'],
    },
    description: {
      type: String,
      required: [true, 'Please provide some details or description'],
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    upvotes: {
      type: Number,
      default: 0,
    },
    upvotedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    status: {
      type: String,
      enum: ['Pending', 'In Progress', 'Completed', 'Rejected'],
      default: 'Pending',
    },
    adminResponse: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const Request = mongoose.model('Request', requestSchema);
export default Request;
