import mongoose from 'mongoose';

const nexoriaMusicFavoriteSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true
    },
    itemType: {
      type: String,
      enum: ['Track', 'Album', 'Artist'],
      required: true
    },
    itemId: {
      type: mongoose.Schema.ObjectId,
      required: true, // Dynamic reference depending on itemType
      refPath: 'itemModel'
    },
    itemModel: {
      type: String,
      required: true,
      enum: ['NexoriaTrack', 'NexoriaAlbum', 'NexoriaArtist']
    }
  },
  {
    timestamps: true
  }
);

// Prevent duplicate likes for the same item by the same user
nexoriaMusicFavoriteSchema.index({ user: 1, itemId: 1, itemType: 1 }, { unique: true });

const NexoriaMusicFavorite = mongoose.model('NexoriaMusicFavorite', nexoriaMusicFavoriteSchema);
export default NexoriaMusicFavorite;
