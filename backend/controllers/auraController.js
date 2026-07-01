import asyncHandler from 'express-async-handler';
import Aura from '../models/Aura.js';
import Post from '../models/Post.js';
import Game from '../models/Game.js';
import Music from '../models/Music.js';
import User from '../models/User.js';
import { getIO } from '../config/socket.js';

// ─── Aura Score Formula ───────────────────────────────────────────────────────
// Score = (views * 0.01) + (downloads * 0.5) + (rating * 20) + (vibeVotes * 2)
//       + (battleWins * 10) - (daysSinceUpdate * 0.3)
// Capped at 999
const calculateScore = ({ views = 0, downloads = 0, rating = 0, vibeVotes = 0, battleWins = 0, updatedAt }) => {
  const daysSince = updatedAt
    ? Math.max(0, (Date.now() - new Date(updatedAt).getTime()) / (1000 * 60 * 60 * 24))
    : 0;
  const raw =
    views * 0.01 +
    downloads * 0.5 +
    rating * 20 +
    vibeVotes * 2 +
    battleWins * 10 -
    daysSince * 0.3;
  return Math.min(999, Math.max(0, Math.round(raw)));
};

// Get the source item data for a given type + id
const getSourceItem = async (itemType, itemId) => {
  if (itemType === 'post') return Post.findById(itemId).select('title appLogo featuredImage views downloads averageRating updatedAt').lean();
  if (itemType === 'game') return Game.findById(itemId).select('title logo views downloads rating updatedAt').lean();
  if (itemType === 'music') return Music.findById(itemId).select('title coverImage views playCount averageRating updatedAt').lean();
  return null;
};

// ─── Process User Aura Vote (Daily Quest & Rank) ──────────────────────────────
const processUserAuraVote = async (userId) => {
  const user = await User.findById(userId);
  if (!user) return {};

  const today = new Date();
  const lastVote = user.lastAuraVoteDate ? new Date(user.lastAuraVoteDate) : null;
  
  // Reset daily count if it's a new day
  if (!lastVote || lastVote.toDateString() !== today.toDateString()) {
    user.dailyAuraVotes = 0;
  }

  user.dailyAuraVotes += 1;
  user.totalAuraVotes += 1;
  user.lastAuraVoteDate = today;

  let questCompleted = false;
  let reward = 0;

  // Daily Quest: 5 votes = 100 Reward Points (only awarded once per day)
  if (user.dailyAuraVotes === 5) {
    user.rewardPoints += 100;
    questCompleted = true;
    reward = 100;
  }

  // Rank Calculation
  const total = user.totalAuraVotes;
  if (total >= 500) user.auraRank = 'Legend';
  else if (total >= 100) user.auraRank = 'Elite';
  else if (total >= 50) user.auraRank = 'Pro';
  else if (total >= 10) user.auraRank = 'Rising';
  else user.auraRank = 'Rookie';

  await user.save();
  return { questCompleted, reward, auraRank: user.auraRank, dailyAuraVotes: user.dailyAuraVotes };
};

// ─── Get Aura Leaderboard ─────────────────────────────────────────────────────
// @route GET /api/aura/leaderboard?type=all&limit=20
export const getAuraLeaderboard = asyncHandler(async (req, res) => {
  const { type = 'all', limit = 20 } = req.query;
  const filter = type !== 'all' ? { itemType: type } : {};

  const auras = await Aura.find(filter)
    .sort({ score: -1 })
    .limit(Number(limit))
    .lean();

  // Enrich with item details
  const enriched = await Promise.all(
    auras.map(async (aura) => {
      const item = await getSourceItem(aura.itemType, aura.itemId);
      return {
        ...aura,
        item: item || null,
        image: item?.appLogo || item?.logo || item?.coverImage || item?.featuredImage || null,
        title: item?.title || 'Unknown',
      };
    })
  );

  res.json({ success: true, data: enriched.filter(e => e.item) });
});

// ─── Get Single Item Aura ─────────────────────────────────────────────────────
// @route GET /api/aura/:type/:id
export const getItemAura = asyncHandler(async (req, res) => {
  const { type, id } = req.params;

  let aura = await Aura.findOne({ itemId: id, itemType: type });
  if (!aura) {
    // Auto-create aura for item if it doesn't exist
    const item = await getSourceItem(type, id);
    if (!item) {
      res.status(404);
      throw new Error('Item not found');
    }
    const score = calculateScore({
      views: item.views || 0,
      downloads: item.downloads || item.playCount || 0,
      rating: item.averageRating || item.rating || 0,
      vibeVotes: 0,
      battleWins: 0,
      updatedAt: item.updatedAt,
    });
    aura = await Aura.create({ itemId: id, itemType: type, score, vibeVotes: 0 });
  }

  // Check if user already voted today
  let userVotedToday = false;
  if (req.user) {
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
    userVotedToday = aura.voters.some(
      v => v.userId.toString() === req.user._id.toString() && new Date(v.votedAt) > cutoff
    );
  }

  res.json({ success: true, data: { ...aura.toObject(), userVotedToday } });
});

// ─── Vibe Vote ────────────────────────────────────────────────────────────────
// @route POST /api/aura/:type/:id/vote
export const vibeVote = asyncHandler(async (req, res) => {
  const { type, id } = req.params;
  const userId = req.user._id;

  let aura = await Aura.findOne({ itemId: id, itemType: type });
  if (!aura) {
    const item = await getSourceItem(type, id);
    if (!item) { res.status(404); throw new Error('Item not found'); }
    aura = await Aura.create({ itemId: id, itemType: type, score: 0, vibeVotes: 0 });
  }

  // Enforce 24h cooldown per user
  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const alreadyVoted = aura.voters.some(
    v => v.userId.toString() === userId.toString() && new Date(v.votedAt) > cutoff
  );

  if (alreadyVoted) {
    res.status(400);
    throw new Error('You already gave this item a vibe today! Come back in 24 hours.');
  }

  // Remove old vote entry if exists (past 24h)
  aura.voters = aura.voters.filter(
    v => v.userId.toString() !== userId.toString() || new Date(v.votedAt) > cutoff
  );

  aura.voters.push({ userId, votedAt: new Date() });
  aura.vibeVotes += 1;

  // Recalculate score
  const item = await getSourceItem(type, id);
  aura.score = calculateScore({
    views: item?.views || 0,
    downloads: item?.downloads || item?.playCount || 0,
    rating: item?.averageRating || item?.rating || 0,
    vibeVotes: aura.vibeVotes,
    battleWins: aura.battleWins,
    updatedAt: item?.updatedAt,
  });

  // Check for surge (900+)
  let surgeEvent = false;
  if (aura.score >= 900 && !aura.isSurging) {
    aura.isSurging = true;
    aura.surgeTriggeredAt = new Date();
    surgeEvent = true;
  }

  await aura.save();

  // Process User Daily Quest & Rank
  const questData = await processUserAuraVote(userId);

  // Emit Global Surge Event via Socket.io
  if (surgeEvent) {
    try {
      getIO().emit('auraSurge', {
        title: item?.title || 'An item',
        score: aura.score,
        image: item?.appLogo || item?.logo || item?.coverImage || item?.featuredImage
      });
    } catch (err) {
      console.error('Socket emission failed:', err);
    }
  }

  res.json({
    success: true,
    message: questData.questCompleted ? `🔥 Vibe sent! Quest Completed: +${questData.reward} Coins!` : '🔥 Vibe sent! The aura is rising!',
    data: { score: aura.score, vibeVotes: aura.vibeVotes, isSurging: aura.isSurging, ...questData },
  });
});

// ─── Get Active Aura Battle ───────────────────────────────────────────────────
// @route GET /api/aura/battle
export const getAuraBattle = asyncHandler(async (req, res) => {
  // Pick 2 random items from posts to battle
  const posts = await Post.find({ status: 'Published', isDeleted: { $ne: true } })
    .select('title appLogo featuredImage views downloads averageRating')
    .sort({ views: -1 })
    .limit(50)
    .lean();

  if (posts.length < 2) {
    res.status(404);
    throw new Error('Not enough items for a battle');
  }

  // Pick 2 random items
  const shuffled = posts.sort(() => Math.random() - 0.5);
  const [item1, item2] = shuffled.slice(0, 2);

  const [aura1, aura2] = await Promise.all([
    Aura.findOne({ itemId: item1._id, itemType: 'post' }) || { score: 0, vibeVotes: 0 },
    Aura.findOne({ itemId: item2._id, itemType: 'post' }) || { score: 0, vibeVotes: 0 },
  ]);

  res.json({
    success: true,
    data: {
      item1: { ...item1, image: item1.appLogo || item1.featuredImage, auraScore: aura1?.score || 0 },
      item2: { ...item2, image: item2.appLogo || item2.featuredImage, auraScore: aura2?.score || 0 },
      expiresAt: new Date(Date.now() + 60 * 1000).toISOString(), // 60 second battle
    },
  });
});

// ─── Vote in Aura Battle ──────────────────────────────────────────────────────
// @route POST /api/aura/battle/vote
export const voteAuraBattle = asyncHandler(async (req, res) => {
  const { winnerId, loserId } = req.body;

  if (!winnerId || !loserId) {
    res.status(400);
    throw new Error('Please provide winnerId and loserId');
  }

  // Boost winner's aura
  let winnerAura = await Aura.findOne({ itemId: winnerId, itemType: 'post' });
  if (!winnerAura) {
    winnerAura = new Aura({ itemId: winnerId, itemType: 'post', score: 0, vibeVotes: 0 });
  }

  winnerAura.battleWins += 1;
  const winnerItem = await getSourceItem('post', winnerId);
  winnerAura.score = calculateScore({
    views: winnerItem?.views || 0,
    downloads: winnerItem?.downloads || 0,
    rating: winnerItem?.averageRating || 0,
    vibeVotes: winnerAura.vibeVotes,
    battleWins: winnerAura.battleWins,
    updatedAt: winnerItem?.updatedAt,
  });
  // Check for surge (900+)
  let surgeEvent = false;
  if (winnerAura.score >= 900 && !winnerAura.isSurging) {
    winnerAura.isSurging = true;
    winnerAura.surgeTriggeredAt = new Date();
    surgeEvent = true;
  }

  await winnerAura.save();

  // Process User Daily Quest & Rank
  const questData = await processUserAuraVote(req.user._id);

  // Emit Global Surge Event via Socket.io
  if (surgeEvent) {
    try {
      getIO().emit('auraSurge', {
        title: winnerItem?.title || 'An item',
        score: winnerAura.score,
        image: winnerItem?.appLogo || winnerItem?.featuredImage
      });
    } catch (err) {
      console.error('Socket emission failed:', err);
    }
  }

  res.json({
    success: true,
    message: questData.questCompleted ? `⚡ Battle vote counted! Quest Completed: +${questData.reward} Coins!` : '⚡ Battle vote counted! Winner aura boosted!',
    data: { winnerScore: winnerAura.score, ...questData },
  });
});

// ─── Get Personal Aura Card ───────────────────────────────────────────────────
// @route GET /api/aura/me
export const getPersonalAura = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const user = req.user;

  // Count how many vibe votes this user has cast
  const votedIn = await Aura.countDocuments({ 'voters.userId': userId });

  // Get user's top downloads/views if tracked
  // For now, generate a personal aura score based on activity
  const personalScore = Math.min(999, votedIn * 5 + (user.downloads || 0) * 2);

  // Determine aura tier
  let tier = 'Rookie';
  let color = '#64748b';
  if (personalScore >= 800) { tier = 'LEGEND'; color = '#f59e0b'; }
  else if (personalScore >= 600) { tier = 'Elite'; color = '#8b5cf6'; }
  else if (personalScore >= 400) { tier = 'Pro'; color = '#3b82f6'; }
  else if (personalScore >= 200) { tier = 'Rising'; color = '#10b981'; }

  // Top items user vibed for
  const vibeHistory = await Aura.find({ 'voters.userId': userId })
    .sort({ score: -1 })
    .limit(3)
    .lean();

  const topVibes = await Promise.all(
    vibeHistory.map(async (a) => {
      const item = await getSourceItem(a.itemType, a.itemId);
      return { title: item?.title || 'Unknown', score: a.score, type: a.itemType };
    })
  );

  res.json({
    success: true,
    data: {
      userId,
      username: user.username || user.name,
      avatar: user.profileImage,
      personalScore,
      tier: user.auraRank || tier, // Show actual database rank
      color,
      votedIn,
      topVibes,
    },
  });
});

// ─── Recalculate All Aura Scores (Admin/CRON) ─────────────────────────────────
// @route POST /api/aura/recalculate
export const recalculateAllAura = asyncHandler(async (req, res) => {
  // 1. Recalculate Posts
  const posts = await Post.find({ status: 'Published', isDeleted: { $ne: true } })
    .select('_id views downloads averageRating updatedAt')
    .lean();

  let postsUpdated = 0;
  for (const post of posts) {
    let aura = await Aura.findOne({ itemId: post._id, itemType: 'post' });
    if (!aura) {
      aura = new Aura({ itemId: post._id, itemType: 'post' });
    }
    aura.score = calculateScore({
      views: post.views || 0,
      downloads: post.downloads || 0,
      rating: post.averageRating || 0,
      vibeVotes: aura.vibeVotes || 0,
      battleWins: aura.battleWins || 0,
      updatedAt: post.updatedAt,
    });
    aura.lastRecalculated = new Date();
    // Reset surge if score dropped below 900
    if (aura.score < 900) aura.isSurging = false;
    await aura.save();
    postsUpdated++;
  }

  // 2. Recalculate Users
  const users = await User.find({}).select('_id totalAuraVotes auraRank');
  let usersUpdated = 0;
  for (const user of users) {
    const total = user.totalAuraVotes || 0;
    let newRank = 'Rookie';
    if (total >= 500) newRank = 'Legend';
    else if (total >= 100) newRank = 'Elite';
    else if (total >= 50) newRank = 'Pro';
    else if (total >= 10) newRank = 'Rising';
    
    if (user.auraRank !== newRank) {
      user.auraRank = newRank;
      await user.save();
      usersUpdated++;
    }
  }

  res.json({ 
    success: true, 
    message: `Recalculated aura for ${postsUpdated} posts and updated rank for ${usersUpdated} users.` 
  });
});
