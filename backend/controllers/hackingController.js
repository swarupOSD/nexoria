import HackingTool from '../models/HackingTool.js';

// @desc    Get all active hacking tools
// @route   GET /api/v1/hacking
// @access  Public
export const getHackingTools = async (req, res) => {
  try {
    const tools = await HackingTool.find({ isActive: true }).sort('order createdAt');
    res.status(200).json({ success: true, count: tools.length, data: tools });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

// @desc    Get all hacking tools (including inactive for admin)
// @route   GET /api/v1/hacking/admin
// @access  Private/Admin
export const getAdminHackingTools = async (req, res) => {
  try {
    const tools = await HackingTool.find().sort('order createdAt');
    res.status(200).json({ success: true, count: tools.length, data: tools });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

// @desc    Create new hacking tool
// @route   POST /api/v1/hacking
// @access  Private/Admin
export const createHackingTool = async (req, res) => {
  try {
    const tool = await HackingTool.create(req.body);
    res.status(201).json({ success: true, data: tool });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Update hacking tool
// @route   PUT /api/v1/hacking/:id
// @access  Private/Admin
export const updateHackingTool = async (req, res) => {
  try {
    let tool = await HackingTool.findById(req.params.id);
    if (!tool) {
      return res.status(404).json({ success: false, message: 'Tool not found' });
    }
    tool = await HackingTool.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    res.status(200).json({ success: true, data: tool });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Delete hacking tool
// @route   DELETE /api/v1/hacking/:id
// @access  Private/Admin
export const deleteHackingTool = async (req, res) => {
  try {
    const tool = await HackingTool.findById(req.params.id);
    if (!tool) {
      return res.status(404).json({ success: false, message: 'Tool not found' });
    }
    await tool.deleteOne();
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
