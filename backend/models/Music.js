import mongoose from 'mongoose';

const musicSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  artist: {
    type: String,
    required: true,
    trim: true
  },
  album: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: [
      'Hindi', 'Bengali', 'English', 'Tamil', 'Telugu', 'Punjabi', 
      'K-Pop', 'Anime Songs', 'Gaming Music', 'LoFi', 'Instrumental', 
      'Remix', 'Devotional', 'Other'
    ]
  },
  description: {
    type: String,
    trim: true
  },
  image: {
    type: String,
    required: true // Cover image or logo
  },
  audioUrl: {
    type: String,
    required: true // The actual hidden URL
  },
  isYoutube: {
    type: Boolean,
    default: false
  },
  duration: {
    type: Number, // In seconds
    default: 0
  },
  releaseYear: {
    type: Number
  },
  lyrics: {
    type: String,
    default: ''
  },
  lyricsType: {
    type: String,
    enum: ['Plain Text', 'LRC'],
    default: 'Plain Text'
  },
  views: {
    type: Number,
    default: 0
  },
  likes: {
    type: Number,
    default: 0
  },
  playCount: {
    type: Number,
    default: 0
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  isTrending: {
    type: Boolean,
    default: false
  },
  allowDownload: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive'],
    default: 'Active'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, { timestamps: true });

const Music = mongoose.model('Music', musicSchema);
export default Music;
