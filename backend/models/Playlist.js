import mongoose from 'mongoose';

const playlistSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  image: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: [
      'Hindi Songs', 'Bengali Songs', 'English Songs', 'LoFi', 'Gaming Music', 
      'K-Pop', 'Top Hits', 'Latest Songs', 'User Playlist', 'Custom', 'Other'
    ],
    default: 'User Playlist'
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  isTrending: {
    type: Boolean,
    default: false
  },
  songs: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Music'
  }],
  status: {
    type: String,
    enum: ['Active', 'Inactive'],
    default: 'Active'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  isPublic: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

const Playlist = mongoose.model('Playlist', playlistSchema);
export default Playlist;
