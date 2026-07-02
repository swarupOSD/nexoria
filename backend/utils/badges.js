import User from '../models/User.js';
import { logActivity, sendNotification } from './tracker.js';

const BADGE_DEFINITIONS = [
  { id: 'first_vibe', name: 'First Vibe', description: 'Awarded for your first Aura vote.' },
  { id: 'music_lover', name: 'Music Lover', description: 'Listened to 50 songs.' },
  { id: 'aura_legend', name: 'Aura Legend', description: 'Reached the Legend Aura rank.' },
  { id: 'app_tester', name: 'App Tester', description: 'Requested or downloaded 10 apps.' },
  { id: 'social_butterfly', name: 'Social Butterfly', description: 'Added 5 items to your wishlist.' },
  { id: 'streak_master', name: 'Streak Master', description: 'Maintained a 7-day login streak.' }
];

export const checkAndAwardBadges = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) return;

    let newBadgesEarned = [];

    const awardBadge = (badgeId) => {
      if (!user.badges.includes(badgeId)) {
        user.badges.push(badgeId);
        newBadgesEarned.push(badgeId);
      }
    };

    // 1. First Vibe
    if (user.totalAuraVotes >= 1) awardBadge('first_vibe');

    // 2. Aura Legend
    if (user.auraRank === 'Legend') awardBadge('aura_legend');

    // 3. Social Butterfly
    if (user.wishlist && user.wishlist.length >= 5) awardBadge('social_butterfly');

    // 4. Streak Master
    if (user.longestStreak >= 7) awardBadge('streak_master');

    // Save and notify if new badges were awarded
    if (newBadgesEarned.length > 0) {
      await user.save();
      
      for (const badgeId of newBadgesEarned) {
        const badgeDef = BADGE_DEFINITIONS.find(b => b.id === badgeId);
        if (badgeDef) {
          // Log Activity
          await logActivity(user._id, 'Badge Earned', `You earned the ${badgeDef.name} badge!`);
          
          // Send Notification
          await sendNotification(
            user._id,
            'New Badge Earned! 🏆',
            `Congratulations! You've unlocked the '${badgeDef.name}' badge.`,
            'SYSTEM',
            'Trophy'
          );
        }
      }
    }
  } catch (error) {
    console.error('Check and Award Badges Error:', error);
  }
};
