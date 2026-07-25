import asyncHandler from 'express-async-handler';
import { Conversation, PrivateMessage } from '../models/PrivateChat.js';
import User from '../models/User.js';
import logger from '../middlewares/logger.js';

// @desc    Get DM Analytics (Admin Only)
// @route   GET /api/dm/admin/analytics
// @access  Private/Admin
export const getDMAnalytics = asyncHandler(async (req, res) => {
  const totalConvs = await Conversation.countDocuments();
  const totalMessages = await PrivateMessage.countDocuments();

  // Active conversations in last 24 hours
  const past24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const activeConvs24h = await Conversation.countDocuments({ updatedAt: { $gte: past24h } });

  // Theme stats distribution
  const themeAggregation = await Conversation.aggregate([
    { $group: { _id: '$theme', count: { $sum: 1 } } }
  ]);

  const themes = {
    default: 0, cherry: 0, galaxy: 0, flame: 0, forest: 0, cyberpunk: 0, ice: 0, pride: 0
  };

  themeAggregation.forEach(item => {
    if (item._id && themes[item._id] !== undefined) {
      themes[item._id] = item.count;
    }
  });

  res.status(200).json({
    success: true,
    data: {
      totalConversations: totalConvs,
      totalMessages: totalMessages,
      activeLast24h: activeConvs24h,
      themeStats: themes
    }
  });
});

// @desc    Get All Conversations list for Admin
// @route   GET /api/dm/admin/conversations
// @access  Private/Admin
export const getAdminConversations = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const total = await Conversation.countDocuments();
  const conversations = await Conversation.find()
    .populate('participants', 'name username email profileImage status warnings')
    .populate('lastMessage')
    .sort({ updatedAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  // Add message count per conversation dynamically
  const enrichedConvs = await Promise.all(
    conversations.map(async (conv) => {
      const msgCount = await PrivateMessage.countDocuments({ conversationId: conv._id });
      return {
        ...conv,
        messageCount: msgCount
      };
    })
  );

  res.status(200).json({
    success: true,
    count: enrichedConvs.length,
    total,
    pages: Math.ceil(total / limit),
    currentPage: page,
    data: enrichedConvs
  });
});

// @desc    Delete Conversation and its messages
// @route   DELETE /api/dm/admin/conversations/:id
// @access  Private/Admin
export const deleteAdminConversation = asyncHandler(async (req, res) => {
  const conversation = await Conversation.findById(req.params.id);

  if (!conversation) {
    return res.status(404).json({ success: false, message: 'Conversation not found' });
  }

  // Delete all private messages
  await PrivateMessage.deleteMany({ conversationId: conversation._id });

  // Delete conversation
  await conversation.deleteOne();

  logger.info(`Admin ${req.user.name} deleted conversation ${req.params.id}`);

  res.status(200).json({
    success: true,
    message: 'Conversation and all associated messages deleted successfully.'
  });
});

// @desc    Restrict User DM capabilities
// @route   PUT /api/dm/admin/users/:id/dm-restrict
// @access  Private/Admin
export const restrictUserDMs = asyncHandler(async (req, res) => {
  const { disableDM } = req.body;
  const user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  if (!user.restrictions) {
    user.restrictions = {};
  }

  user.restrictions.disableDM = !!disableDM;
  await user.save();

  logger.info(`Admin ${req.user.name} updated DM restriction for user ${user.email} to ${disableDM}`);

  res.status(200).json({
    success: true,
    message: disableDM ? 'Direct Messages disabled for this user.' : 'Direct Messages enabled for this user.',
    data: user
  });
});
