import mongoose from 'mongoose';

const advertisementSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add an ad name'],
    },
    location: {
      type: String,
      enum: ['Header', 'Sidebar', 'BetweenContent', 'Footer', 'DownloadSection'],
      required: [true, 'Please specify an ad location'],
    },
    adCode: {
      type: String,
      required: [true, 'Please add ad HTML/JS code'],
    },
    enabled: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

const Advertisement = mongoose.model('Advertisement', advertisementSchema);
export default Advertisement;
