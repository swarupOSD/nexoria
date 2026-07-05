import mongoose from 'mongoose';

const nexoriaGenreSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Genre name is required'],
      unique: true,
      trim: true,
      maxlength: [50, 'Genre name cannot be more than 50 characters']
    },
    coverImage: {
      type: String,
      default: '' // Used for category grid displays
    },
    hexColor: {
      type: String,
      default: '#8B5CF6' // Default purple for dynamic UI rendering
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

const NexoriaGenre = mongoose.model('NexoriaGenre', nexoriaGenreSchema);
export default NexoriaGenre;
