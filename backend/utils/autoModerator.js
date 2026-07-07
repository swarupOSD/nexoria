import User from '../models/User.js';
import { logSecurityEvent } from './securityLogger.js';
import { sendNotification, logActivity } from './tracker.js';
import logger from '../middlewares/logger.js';

// Standard dictionary of inappropriate words/spam triggers (English, Bengali, Hindi)
const BAD_WORDS = [
  // English Profanity & Spam
  'fuck', 'shit', 'bitch', 'asshole', 'cunt', 'dick', 'pussy', 'whore', 'slut', 'fag', 'nigger', 'nigga', 'bastard', 'motherfucker', 'cock', 'suck', 'pornhub', 'xvideos', 'free robux', 'crypto scam', 'click here for free',
  
  // Bengali Slangs
  'bal', 'baal', 'bocchod', 'bokachoda', 'khanki', 'magi', 'madafaka', 'madarchod', 'bara', 'shala', 'shoytan', 'kutta', 'haramjada', 'suor', 'gandu', 'chud', 'chudi', 'chuda', 'chut', 'nongra',
  
  // Hindi Slangs
  'bhenchod', 'madarchod', 'chutiya', 'bhosadike', 'bhosadi', 'gandu', 'randi', 'saala', 'kutta', 'kaminey', 'harami', 'loda', 'lund'
];

/**
 * Normalizes text to handle leetspeak, extra spaces, or special characters.
 * (e.g. f.u.c.k, f0ck, b@l)
 */
const normalizeText = (text) => {
  if (!text) return '';
  return text.toLowerCase()
    .replace(/[0@]/g, 'o')
    .replace(/1/g, 'i')
    .replace(/3/g, 'e')
    .replace(/4/g, 'a')
    .replace(/5/g, 's')
    .replace(/7/g, 't')
    .replace(/8/g, 'b')
    .replace(/[^a-z\s]/g, ''); // Remove punctuation
};

/**
 * Checks if the text contains any blocked words
 * @param {String} text - The text to check
 * @returns {Boolean} true if violation found, false otherwise
 */
export const hasBadWords = (text) => {
  if (!text) return false;
  const normalized = normalizeText(text);
  const words = normalized.split(/\s+/);
  
  // Check exact matches or partial substring matches for really bad words
  for (const word of words) {
    if (BAD_WORDS.includes(word)) return true;
  }
  
  // Check substrings for severe variations
  for (const badWord of BAD_WORDS) {
    if (badWord.length >= 4 && normalized.includes(badWord)) {
      return true;
    }
  }

  return false;
};

/**
 * Handles a user violation (adds strike, mutes if >= 3)
 * @param {String} userId - ID of the violating user
 * @param {Object} req - Express request object (optional)
 * @returns {Object} result - Object containing strike count and action taken
 */
export const handleViolation = async (userId, req) => {
  try {
    const user = await User.findById(userId);
    if (!user) return { success: false, message: 'User not found' };

    // Increment strikes
    user.moderationStrikes = (user.moderationStrikes || 0) + 1;
    let actionTaken = 'WARNING';

    // If 3 strikes, auto-mute for 24 hours
    if (user.moderationStrikes >= 3) {
      if (!user.restrictions) user.restrictions = {};
      user.restrictions.disableCommenting = true;
      user.restrictions.disableRatings = true;
      
      const muteDuration = 24 * 60 * 60 * 1000; // 24 hours
      user.suspensionEndDate = new Date(Date.now() + muteDuration);
      
      actionTaken = 'MUTED';
      
      // Notify user of the mute
      await sendNotification(
        user._id,
        'Account Restricted',
        'You have been muted for 24 hours due to repeated use of abusive language or spam.',
        'SECURITY',
        'AlertOctagon'
      );
      
      // Reset strikes after a severe punishment (optional, but good for rolling periods)
      user.moderationStrikes = 0; 
    } else {
      // Notify user of the warning
      await sendNotification(
        user._id,
        'Moderation Warning',
        `Your recent message was blocked for inappropriate language. Strike ${user.moderationStrikes}/3 before account mute.`,
        'SECURITY',
        'ShieldAlert'
      );
    }

    await user.save();

    // Log the security event
    if (req) {
      logSecurityEvent({
        eventType: 'AUTO_MODERATION',
        req,
        details: { actionTaken, currentStrikes: actionTaken === 'MUTED' ? 3 : user.moderationStrikes }
      });
      await logActivity(user._id, 'Auto-Moderation', `User triggered bad word filter. Action: ${actionTaken}`, req);
    }

    return { success: true, actionTaken, strikes: user.moderationStrikes };

  } catch (error) {
    logger.error(`Auto-Moderator Error: ${error.message}`);
    return { success: false, message: 'Internal error' };
  }
};
