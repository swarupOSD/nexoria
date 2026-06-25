import mongoose from 'mongoose';

const movieCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a category name'],
      unique: true,
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      required: true,
    },
    icon: {
      type: String,
      default: 'Film',
    },
    description: String,
    isActive: {
      type: Boolean,
      default: true,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const MovieCategory = mongoose.model('MovieCategory', movieCategorySchema);
export default MovieCategory;
