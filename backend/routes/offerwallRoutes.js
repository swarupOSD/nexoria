import express from 'express';
import User from '../models/User.js';
import SiteSettings from '../models/SiteSettings.js';

const router = express.Router();

/**
 * @route   GET /api/webhooks/offerwall
 * @desc    Handle postback from offerwall providers
 * @access  Public (protected by secret key)
 */
router.get('/', async (req, res) => {
  try {
    // Typical parameters sent by offerwalls
    const { subid, amount, secret } = req.query;

    if (!subid || !amount) {
      return res.status(400).send('Missing subid or amount');
    }

    const settings = await SiteSettings.findOne();
    const offerwallSettings = settings?.offerwallSettings;

    if (!offerwallSettings || !offerwallSettings.enabled) {
      return res.status(403).send('Offerwall is disabled');
    }

    // Check secret if it is configured
    if (offerwallSettings.secretKey) {
      if (secret !== offerwallSettings.secretKey) {
        return res.status(401).send('Invalid secret key');
      }
    }

    // Find the user by subid (which should be the user's _id)
    const user = await User.findById(subid);
    if (!user) {
      return res.status(404).send('User not found');
    }

    // Add points to user
    const pointsToAdd = parseFloat(amount);
    if (isNaN(pointsToAdd) || pointsToAdd <= 0) {
      return res.status(400).send('Invalid amount');
    }

    user.rewardPoints = (user.rewardPoints || 0) + pointsToAdd;
    
    // Add to transaction history (if we had a model for it, but for now just save user)
    await user.save();

    console.log(`[Offerwall] Credited ${pointsToAdd} points to user ${user.name} (${user._id})`);

    // The offerwall provider usually expects a 200 OK or '1' as a response.
    res.status(200).send('OK');
  } catch (error) {
    console.error('Offerwall Postback Error:', error);
    res.status(500).send('Internal Server Error');
  }
});

export default router;
