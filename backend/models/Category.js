import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a category name'],
      trim: true,
      unique: true,
    },
    slug: {
      type: String,
      unique: true,
      required: true,
    },
    description: {
      type: String,
    },
    image: {
      type: String,
      default: 'default-category.jpg',
    },
    icon: {
      type: String,
    },
    order: {
      type: Number,
      default: 0,
    },
    parentCategory: {
      type: mongoose.Schema.ObjectId,
      ref: 'Category',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    banner: {
      type: String,
    },
    visibility: {
      type: String,
      enum: ['Public', 'Hidden', 'Premium Only'],
      default: 'Public',
    },
  },
  {
    timestamps: true,
  }
);

const Category = mongoose.model('Category', categorySchema);
export default Category;
