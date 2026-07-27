import NexoriaMusicHistory from '../models/NexoriaMusicHistory.js';
import { PrivateMessage, Conversation } from '../models/PrivateChat.js';

const getDateNDaysAgo = (n) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
};

// @desc    Get music listening analytics
// @route   GET /api/analytics/music
// @access  Private/Admin
export const getMusicAnalytics = async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 7;
    const since = getDateNDaysAgo(days);

    const totalPlays = await NexoriaMusicHistory.countDocuments({ playedAt: { $gte: since } });

    const topTracks = await NexoriaMusicHistory.aggregate([
      { $match: { playedAt: { $gte: since } } },
      { $group: { _id: '$track', playCount: { $sum: 1 }, totalDuration: { $sum: '$durationPlayed' } } },
      { $sort: { playCount: -1 } },
      { $limit: 10 },
      { $lookup: { from: 'nexoriatracks', localField: '_id', foreignField: '_id', as: 'track' } },
      { $unwind: '$track' },
      { $project: { playCount: 1, totalDuration: 1, 'track.title': 1, 'track.artist': 1, 'track.coverArt': 1 } }
    ]);

    const topListeners = await NexoriaMusicHistory.aggregate([
      { $match: { playedAt: { $gte: since } } },
      { $group: { _id: '$user', playCount: { $sum: 1 }, totalDuration: { $sum: '$durationPlayed' } } },
      { $sort: { playCount: -1 } },
      { $limit: 10 },
      { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
      { $unwind: '$user' },
      { $project: { playCount: 1, totalDuration: 1, 'user.name': 1, 'user.profileImage': 1, 'user.email': 1 } }
    ]);

    const playsPerDay = await NexoriaMusicHistory.aggregate([
      { $match: { playedAt: { $gte: since } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$playedAt' } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
      { $project: { date: '$_id', count: 1, _id: 0 } }
    ]);

    const recentHistory = await NexoriaMusicHistory.find({ playedAt: { $gte: getDateNDaysAgo(1) } })
      .sort({ playedAt: -1 })
      .limit(50)
      .populate('user', 'name profileImage email')
      .populate('track', 'title artist coverArt');

    res.status(200).json({
      success: true,
      data: { totalPlays, topTracks, topListeners, playsPerDay, recentHistory, period: `Last ${days} days` }
    });
  } catch (err) {
    console.error('Music Analytics Error:', err);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Get private chat analytics (stats only)
// @route   GET /api/analytics/private-chat
// @access  Private/Admin
export const getPrivateChatAnalytics = async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 7;
    const since = getDateNDaysAgo(days);

    const totalConversations = await Conversation.countDocuments();
    const totalMessages = await PrivateMessage.countDocuments({ createdAt: { $gte: since } });

    const messageTypeBreakdown = await PrivateMessage.aggregate([
      { $match: { createdAt: { $gte: since } } },
      { $group: { _id: '$type', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const messagesPerDay = await PrivateMessage.aggregate([
      { $match: { createdAt: { $gte: since } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
      { $project: { date: '$_id', count: 1, _id: 0 } }
    ]);

    const topSenders = await PrivateMessage.aggregate([
      { $match: { createdAt: { $gte: since } } },
      { $group: { _id: '$sender', messageCount: { $sum: 1 } } },
      { $sort: { messageCount: -1 } },
      { $limit: 10 },
      { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
      { $unwind: '$user' },
      { $project: { messageCount: 1, 'user.name': 1, 'user.profileImage': 1, 'user.email': 1 } }
    ]);

    const imageCount = await PrivateMessage.countDocuments({ type: 'image', createdAt: { $gte: since } });
    const voiceCount = await PrivateMessage.countDocuments({ type: 'voice', createdAt: { $gte: since } });
    const gifCount = await PrivateMessage.countDocuments({ type: 'gif', createdAt: { $gte: since } });
    const textCount = await PrivateMessage.countDocuments({ type: 'text', createdAt: { $gte: since } });

    res.status(200).json({
      success: true,
      data: {
        totalConversations, totalMessages, messageTypeBreakdown, messagesPerDay, topSenders,
        summary: { imageCount, voiceCount, gifCount, textCount },
        period: `Last ${days} days`,
      }
    });
  } catch (err) {
    console.error('Private Chat Analytics Error:', err);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Get all conversations list for admin (with participants & last message)
// @route   GET /api/analytics/private-chat/conversations
// @access  Private/Admin
export const getAdminConversations = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';

    const total = await Conversation.countDocuments();

    let conversations = await Conversation.find()
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('participants', 'name profileImage email role')
      .populate({
        path: 'lastMessage',
        populate: { path: 'sender', select: 'name profileImage' }
      });

    // Filter by search (participant name/email)
    if (search) {
      conversations = conversations.filter(conv =>
        conv.participants.some(p =>
          p.name?.toLowerCase().includes(search.toLowerCase()) ||
          p.email?.toLowerCase().includes(search.toLowerCase())
        )
      );
    }

    // Get message count per conversation
    const convIds = conversations.map(c => c._id);
    const msgCounts = await PrivateMessage.aggregate([
      { $match: { conversationId: { $in: convIds } } },
      { $group: { _id: '$conversationId', count: { $sum: 1 } } }
    ]);
    const countMap = {};
    msgCounts.forEach(m => { countMap[m._id.toString()] = m.count; });

    const enriched = conversations.map(conv => ({
      ...conv.toObject(),
      messageCount: countMap[conv._id.toString()] || 0
    }));

    res.status(200).json({ success: true, total, totalPages: Math.ceil(total / limit), currentPage: page, data: enriched });
  } catch (err) {
    console.error('Admin Conversations Error:', err);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Get all messages in a specific conversation for admin
// @route   GET /api/analytics/private-chat/conversations/:id/messages
// @access  Private/Admin
export const getAdminConversationMessages = async (req, res) => {
  try {
    const { id } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const total = await PrivateMessage.countDocuments({ conversationId: id });

    const messages = await PrivateMessage.find({ conversationId: id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('sender', 'name profileImage email role')
      .populate({ path: 'replyTo', populate: { path: 'sender', select: 'name' } });

    // Conversation participants
    const conversation = await Conversation.findById(id)
      .populate('participants', 'name profileImage email role');

    res.status(200).json({
      success: true,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      conversation,
      data: messages.reverse() // Show oldest first
    });
  } catch (err) {
    console.error('Admin Conv Messages Error:', err);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
