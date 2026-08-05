import mongoose from 'mongoose';

const hackingToolSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
  },
  icon: {
    type: String,
    required: [true, 'Please specify an icon name (e.g., TerminalIcon)'],
    default: 'TerminalIcon'
  },
  color: {
    type: String,
    required: [true, 'Please specify the gradient color classes'],
    default: 'from-emerald-500/20 to-emerald-900/20'
  },
  border: {
    type: String,
    required: [true, 'Please specify the hover border color classes'],
    default: 'border-emerald-500/30'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  order: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

const HackingTool = mongoose.model('HackingTool', hackingToolSchema);
export default HackingTool;
