import mongoose from 'mongoose';

const nexoriaLyricsSchema = new mongoose.Schema(
  {
    trackId: {
      type: mongoose.Schema.ObjectId,
      ref: 'NexoriaTrack',
      required: true,
      unique: true // One lyrics document per track
    },
    plainText: {
      type: String,
      default: ''
    },
    syncedLyrics: {
      type: Array, // Array of objects: { time: Number (seconds), text: String }
      default: []
    },
    addedBy: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true
    }
  },
  {
    timestamps: true
  }
);

const NexoriaLyrics = mongoose.model('NexoriaLyrics', nexoriaLyricsSchema);
export default NexoriaLyrics;
