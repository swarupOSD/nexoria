import mongoose from 'mongoose';

const appRequestSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
    },
    appName: {
      type: String,
      required: [true, 'Please provide the app name'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please provide a description'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Please provide a category'],
      enum: ['Apps', 'Games', 'Tools', 'Other'],
    },
    priority: {
      type: String,
      enum: ['Low', 'Normal', 'High'],
      default: 'Normal',
    },
    status: {
      type: String,
      enum: ['Pending', 'Under Review', 'Approved', 'Rejected', 'Completed'],
      default: 'Pending',
    },
    adminNotes: {
      type: String,
    }
  },
  {
    timestamps: true,
  }
);

const AppRequest = mongoose.model('AppRequest', appRequestSchema);
export default AppRequest;
