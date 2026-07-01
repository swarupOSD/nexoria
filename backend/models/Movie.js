import mongoose from 'mongoose';

const movieSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add a movie title'],
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      required: true,
    },
    originalTitle: String,
    posterImage: {
      type: String,
      required: true,
    },
    bannerImage: String,
    backdropImages: [String],
    mobileBanner: String,
    desktopBanner: String,
    galleryImages: [String],
    description: {
      type: String,
      required: true,
    },
    shortDescription: String,
    releaseDate: Date,
    releaseYear: Number,
    country: String,
    language: String,
    genre: [String],
    runtime: String, // Replaces duration
    size: String,
    quality: [String], // Changed from enum to allow arbitrary qualities like '480p', '720p', etc.
    director: String,
    writers: [String],
    producers: [String],
    cast: [String],
    ageRating: String,
    audio: [String],
    subtitles: [String],
    movieType: {
      type: String,
      enum: ['Movie', 'Web Series', 'Animation'],
      default: 'Movie'
    },
    version: String, // e.g., 'Hindi Dubbed', 'Dual Audio', 'Original', 'Director Cut'
    
    // Web Series Specific
    seasons: [{
      seasonNumber: Number,
      poster: String,
      description: String,
      episodes: [{
        episodeNumber: Number,
        title: String,
        thumbnail: String,
        runtime: String,
        description: String,
        videoUrl: String,
        downloadLinks: [{
          label: String,
          url: String,
          quality: String,
          isActive: { type: Boolean, default: true }
        }]
      }]
    }],
    
    trailerUrl: String,
    videoUrl: String,
    videoFile: String,
    imdbRating: { type: Number, default: 0 },
    tmdbRating: { type: Number, default: 0 },
    downloadLinks: [
      {
        label: String,
        url: String,
        quality: String,
        isActive: { type: Boolean, default: true },
        priority: { type: Number, default: 1 },
        clickCount: { type: Number, default: 0 }
      }
    ],
    externalLink: String,
    category: {
      type: mongoose.Schema.ObjectId,
      ref: 'MovieCategory',
      required: true,
    },
    tags: [String],
    
    // Status & Visibility
    status: {
      type: String,
      enum: ['Active', 'Hidden', 'Draft', 'Pending Approval', 'Approved', 'Rejected'],
      default: 'Draft',
      index: true,
    },
    visibilityStatus: {
      type: String,
      enum: ['Public', 'Premium Only', 'Hidden', 'Admin Only'],
      default: 'Public',
    },
    isFeatured: { type: Boolean, default: false, index: true },
    isTrending: { type: Boolean, default: false, index: true },
    appType: { // To match existing premium architecture checks where possible
      type: String,
      enum: ['Free', 'Premium', 'Paid'],
      default: 'Free'
    },
    price: Number,

    // SEO
    seoTitle: String,
    seoDescription: String,
    
    // Metrics
    views: { type: Number, default: 0 },
    watchCount: { type: Number, default: 0 },
    downloads: { type: Number, default: 0, index: true },
    averageRating: { type: Number, default: 0 },
    totalVotes: { type: Number, default: 0 },
    
    author: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
    },
    // Soft Delete (Trash Bin)
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

movieSchema.index({ status: 1, createdAt: -1 });

const Movie = mongoose.model('Movie', movieSchema);
export default Movie;
