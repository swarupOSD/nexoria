import mongoose from 'mongoose';

const adminNoteSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    note: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const AdminNote = mongoose.model('AdminNote', adminNoteSchema);
export default AdminNote;
