import mongoose from 'mongoose';

const arenaGameSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a game title'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Please add a game description'],
  },
  iframeUrl: {
    type: String,
    required: [true, 'Please add the game embed/iframe URL'],
  },
  thumbnail: {
    type: String,
    default: 'default-game.jpg',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  }
}, {
  timestamps: true,
});

const ArenaGame = mongoose.model('ArenaGame', arenaGameSchema);

export default ArenaGame;
