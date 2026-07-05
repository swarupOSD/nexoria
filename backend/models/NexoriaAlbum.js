import mongoose from 'mongoose';

const nexoriaAlbumSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Album title is required'],
      trim: true,
      maxlength: [100, 'Album title cannot be more than 100 characters']
    },
    artist: {
      type: mongoose.Schema.ObjectId,
      ref: 'NexoriaArtist',
      required: [true, 'Artist reference is required']
    },
    releaseDate: {
      type: Date,
      default: Date.now
    },
    coverImage: {
      type: String,
      default: ''
    },
    type: {
      type: String,
      enum: ['Album', 'EP', 'Single'],
      default: 'Album'
    },
    genre: {
      type: mongoose.Schema.ObjectId,
      ref: 'NexoriaGenre'
    },
    totalPlays: {
      type: Number,
      default: 0
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
nexoriaAlbumSchema.index({ title: 'text' });
nexoriaAlbumSchema.index({ releaseDate: -1 });

const NexoriaAlbum = mongoose.model('NexoriaAlbum', nexoriaAlbumSchema);
export default NexoriaAlbum;
