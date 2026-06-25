import mongoose from 'mongoose';

const bannerSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    subtitle: { type: String },
    image: { type: String, required: true }, // Image URL
    actionLink: { type: String, default: '/' },
    actionText: { type: String, default: 'Read More' },
    position: { type: String, enum: ['Hero', 'Sidebar', 'Footer'], default: 'Hero' },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 }, // For sorting multiple banners
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

export default mongoose.model('Banner', bannerSchema);
