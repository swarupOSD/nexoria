import mongoose from 'mongoose';

const movieSettingsSchema = new mongoose.Schema(
  {
    movieBoxName: { type: String, default: 'MovieBox' },
    movieBoxLogo: { type: String, default: '/logo.png' },
    movieBoxBanner: { type: String, default: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop' },
    movieBoxFavicon: { type: String, default: '/favicon.svg' },
    updatedBy: { type: mongoose.Schema.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

const MovieSettings = mongoose.model('MovieSettings', movieSettingsSchema);

export default MovieSettings;
