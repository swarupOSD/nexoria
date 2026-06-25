import mongoose from 'mongoose';

const musicFavoriteSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  song: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Music',
    required: true
  }
}, { timestamps: true });

// Ensure a user can only favorite a song once
musicFavoriteSchema.index({ user: 1, song: 1 }, { unique: true });

const MusicFavorite = mongoose.model('MusicFavorite', musicFavoriteSchema);
export default MusicFavorite;
