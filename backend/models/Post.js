import mongoose from 'mongoose';

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add a title'],
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      required: true,
    },
    packageName: String,
    featuredImage: {
      type: String,
      required: true,
    },
    appLogo: {
      type: String,
    },
    galleryImages: [String],
    version: String,
    versions: [
      {
        version: String,
        changelog: String,
        date: Date,
        isLatest: Boolean
      }
    ],
    updateDate: Date,
    publisher: String,
    requirements: String,
    category: {
      type: mongoose.Schema.ObjectId,
      ref: 'Category',
      required: true,
    },
    subCategory: {
      type: mongoose.Schema.ObjectId,
      ref: 'Category',
    },
    tags: [String],
    size: String,
    platform: {
      type: String,
      default: 'Android',
    },
    appType: {
      type: String,
      enum: ['Free', 'Premium Subscription', 'One-Time Purchase', 'Paid', 'Premium'],
      default: 'Free',
    },
    price: {
      type: Number,
    },
    discountPrice: {
      type: Number,
    },
    downloadLinks: [
      {
        label: String, // Primary, Mirror 1, Mirror 2, Premium, etc.
        url: String,
        type: {
          type: String,
          enum: ['primary', 'mirror', 'premium']
        },
        isActive: {
          type: Boolean,
          default: true
        },
        priority: {
          type: Number,
          default: 1
        },
        clickCount: {
          type: Number,
          default: 0
        }
      }
    ],
    description: String,
    modFeatures: [String],
    changelog: String,
    content: {
      type: String,
      required: true,
    },
    
    // Status & Visibility
    status: {
      type: String,
      enum: ['Active', 'Hidden', 'Draft', 'Pending Approval', 'Approved', 'Returned For Changes', 'Under Development', 'Discontinued', 'Maintenance Mode', 'Published', 'Rejected', 'Scheduled'],
      default: 'Draft',
      index: true,
    },
    expectedReleaseDate: Date,
    developmentProgress: { type: Number, default: 0 },
    visibilityStatus: {
      type: String,
      enum: ['Public', 'Premium Only', 'Hidden', 'Admin Only'],
      default: 'Public',
    },
    scheduledPublishDate: Date,
    
    // Moderation
    moderatedBy: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
    },
    moderationTimestamp: Date,
    rejectionReason: String,
    isFeatured: { type: Boolean, default: false, index: true },
    isTrending: { type: Boolean, default: false, index: true },
    isPopular: { type: Boolean, default: false },
    editorChoice: { type: Boolean, default: false },

    // SEO
    seoTitle: String,
    seoDescription: String,
    focusKeyword: String,
    ogImage: String,

    // Metrics
    views: { type: Number, default: 0 },
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

// Compound Index for performance on paginated fetching
postSchema.index({ status: 1, createdAt: -1 });

// Create Atlas Search index on title, tags, description and publisher for fuzzy matching
// Note: Actual Atlas Search index creation must be done via MongoDB Atlas UI or API

const Post = mongoose.model('Post', postSchema);
export default Post;
