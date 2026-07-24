import mongoose from 'mongoose';

const nexoriaTrackSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Track title is required'],
      trim: true,
      maxlength: [100, 'Track title cannot be more than 100 characters']
    },
    artist: {
      type: mongoose.Schema.ObjectId,
      ref: 'NexoriaArtist',
      required: [true, 'Artist reference is required']
    },
    album: {
      type: mongoose.Schema.ObjectId,
      ref: 'NexoriaAlbum' // Optional: can be a single without an album
    },
    genre: {
      type: mongoose.Schema.ObjectId,
      ref: 'NexoriaGenre'
    },
    coverImage: {
      type: String,
      required: false
    },
    duration: {
      type: Number,
      required: true // Duration in seconds
    },
    audioUrl: {
      type: String,
      required: false
    },
    telegramFileId: {
      type: String,
      required: false
    },
    fileSizeBytes: {
      type: Number,
      default: 0
    },
    playCount: {
      type: Number,
      default: 0
    },
    downloadCount: {
      type: Number,
      default: 0
    },
    isPremium: {
      type: Boolean,
      default: false // Whether the track requires premium to play
    },
    lyricsId: {
      type: mongoose.Schema.ObjectId,
      ref: 'NexoriaLyrics'
    },
    tags: {
      type: [String],
      default: []
    },
    trackType: {
      type: String,
      enum: ['song', 'podcast'],
      default: 'song'
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

// Indexes
nexoriaTrackSchema.index({ title: 'text', tags: 'text' });
nexoriaTrackSchema.index({ playCount: -1 });

const NexoriaTrack = mongoose.model('NexoriaTrack', nexoriaTrackSchema);
export default NexoriaTrack;
