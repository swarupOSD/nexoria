import mongoose from 'mongoose';

const nexoriaArtistSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Artist name is required'],
      trim: true,
      maxlength: [100, 'Artist name cannot be more than 100 characters']
    },
    bio: {
      type: String,
      default: '',
      maxlength: [2000, 'Bio cannot be more than 2000 characters']
    },
    image: {
      type: String,
      default: '' // Profile picture
    },
    coverImage: {
      type: String,
      default: '' // Banner image for artist page
    },
    socialLinks: {
      instagram: { type: String, default: '' },
      twitter: { type: String, default: '' },
      website: { type: String, default: '' }
    },
    isVerified: {
      type: Boolean,
      default: false
    },
    totalPlays: {
      type: Number,
      default: 0
    },
    followersCount: {
      type: Number,
      default: 0
    },
    addedBy: {
      type: mongoose.Schema.ObjectId,
      ref: 'User', // Admin who created the artist profile
      required: true
    }
  },
  {
    timestamps: true
  }
);

// Indexes for faster search and sorting
nexoriaArtistSchema.index({ name: 'text' });
nexoriaArtistSchema.index({ totalPlays: -1 });

const NexoriaArtist = mongoose.model('NexoriaArtist', nexoriaArtistSchema);
export default NexoriaArtist;
