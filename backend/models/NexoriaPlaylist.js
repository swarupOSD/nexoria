import mongoose from 'mongoose';

const nexoriaPlaylistSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Playlist title is required'],
      trim: true,
      maxlength: [100, 'Playlist title cannot be more than 100 characters']
    },
    description: {
      type: String,
      default: '',
      maxlength: [500, 'Description cannot be more than 500 characters']
    },
    coverImage: {
      type: String,
      default: ''
    },
    creator: {
      type: mongoose.Schema.ObjectId,
      ref: 'User', // Could be Admin creating public lists, or User creating private ones
      required: true
    },
    tracks: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'NexoriaTrack'
      }
    ],
    isPublic: {
      type: Boolean,
      default: true // False means only the creator can see it
    },
    totalPlays: {
      type: Number,
      default: 0
    },
    type: {
      type: String,
      enum: ['Featured', 'Trending', 'User', 'Algorithm'],
      default: 'User'
    },
    isCollaborative: {
      type: Boolean,
      default: false
    },
    collaborators: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
      }
    ]
  },
  {
    timestamps: true
  }
);

const NexoriaPlaylist = mongoose.model('NexoriaPlaylist', nexoriaPlaylistSchema);
export default NexoriaPlaylist;
