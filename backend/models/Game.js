import mongoose from 'mongoose';

const gameSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add a game title'],
      trim: true,
    },
    logo: {
      type: String,
      default: '',
    },
    banner: {
      type: String,
      default: '',
    },
    version: {
      type: String,
      default: '1.0.0',
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    review: {
      type: String,
      default: '',
    },
    description: {
      type: String,
      default: '',
    },
    githubLink: {
      type: String,
      required: [true, 'Please add a GitHub link'],
    },
    videoUrl: {
      type: String,
      default: '',
    },
    isPaid: {
      type: Boolean,
      default: false,
    },
    price: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const Game = mongoose.model('Game', gameSchema);
export default Game;
