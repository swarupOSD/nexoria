import NexoriaMusicHistory from '../models/NexoriaMusicHistory.js';
import NexoriaTrack from '../models/NexoriaTrack.js';
import User from '../models/User.js';
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

    // Total plays
    const totalPlays = await NexoriaMusicHistory.countDocuments({ playedAt: { $gte: since } });

    // Top tracks by plays
    const topTracks = await NexoriaMusicHistory.aggregate([
      { $match: { playedAt: { $gte: since } } },
      { $group: { _id: '$track', playCount: { $sum: 1 }, totalDuration: { $sum: '$durationPlayed' } } },
      { $sort: { playCount: -1 } },
      { $limit: 10 },
      { $lookup: { from: 'nexoriatracks', localField: '_id', foreignField: '_id', as: 'track' } },
      { $unwind: '$track' },
      { $project: { playCount: 1, totalDuration: 1, 'track.title': 1, 'track.artist': 1, 'track.coverArt': 1 } }
    ]);

    // Top listeners
    const topListeners = await NexoriaMusicHistory.aggregate([
      { $match: { playedAt: { $gte: since } } },
      { $group: { _id: '$user', playCount: { $sum: 1 }, totalDuration: { $sum: '$durationPlayed' } } },
      { $sort: { playCount: -1 } },
      { $limit: 10 },
      { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
      { $unwind: '$user' },
      { $project: { playCount: 1, totalDuration: 1, 'user.name': 1, 'user.profileImage': 1, 'user.email': 1 } }
    ]);

    // Plays per day (timeline)
    const playsPerDay = await NexoriaMusicHistory.aggregate([
      { $match: { playedAt: { $gte: since } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$playedAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } },
      { $project: { date: '$_id', count: 1, _id: 0 } }
    ]);

    // Recent history (last 50)
    const recentHistory = await NexoriaMusicHistory.find({ playedAt: { $gte: getDateNDaysAgo(1) } })
      .sort({ playedAt: -1 })
      .limit(50)
      .populate('user', 'name profileImage email')
      .populate('track', 'title artist coverArt');

    res.status(200).json({
      success: true,
      data: {
        totalPlays,
        topTracks,
        topListeners,
        playsPerDay,
        recentHistory,
        period: `Last ${days} days`,
      }
    });
  } catch (err) {
    console.error('Music Analytics Error:', err);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Get private chat analytics
// @route   GET /api/analytics/private-chat
// @access  Private/Admin
export const getPrivateChatAnalytics = async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 7;
    const since = getDateNDaysAgo(days);

    // Total conversations
    const totalConversations = await Conversation.countDocuments();

    // Total messages in period
    const totalMessages = await PrivateMessage.countDocuments({ createdAt: { $gte: since } });

    // Message type breakdown
    const messageTypeBreakdown = await PrivateMessage.aggregate([
      { $match: { createdAt: { $gte: since } } },
      { $group: { _id: '$type', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Messages per day
    const messagesPerDay = await PrivateMessage.aggregate([
      { $match: { createdAt: { $gte: since } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } },
      { $project: { date: '$_id', count: 1, _id: 0 } }
    ]);

    // Top active senders
    const topSenders = await PrivateMessage.aggregate([
      { $match: { createdAt: { $gte: since } } },
      { $group: { _id: '$sender', messageCount: { $sum: 1 } } },
      { $sort: { messageCount: -1 } },
      { $limit: 10 },
      { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
      { $unwind: '$user' },
      { $project: { messageCount: 1, 'user.name': 1, 'user.profileImage': 1, 'user.email': 1 } }
    ]);

    // Image messages count
    const imageCount = await PrivateMessage.countDocuments({ type: 'image', createdAt: { $gte: since } });
    const voiceCount = await PrivateMessage.countDocuments({ type: 'voice', createdAt: { $gte: since } });
    const gifCount = await PrivateMessage.countDocuments({ type: 'gif', createdAt: { $gte: since } });
    const textCount = await PrivateMessage.countDocuments({ type: 'text', createdAt: { $gte: since } });

    res.status(200).json({
      success: true,
      data: {
        totalConversations,
        totalMessages,
        messageTypeBreakdown,
        messagesPerDay,
        topSenders,
        summary: {
          imageCount,
          voiceCount,
          gifCount,
          textCount,
        },
        period: `Last ${days} days`,
      }
    });
  } catch (err) {
    console.error('Private Chat Analytics Error:', err);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
