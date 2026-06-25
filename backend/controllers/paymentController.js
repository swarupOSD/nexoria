import PremiumRequest from '../models/PremiumRequest.js';
import PurchaseRequest from '../models/PurchaseRequest.js';
import PremiumPlan from '../models/PremiumPlan.js';
import UserPurchases from '../models/UserPurchases.js';
import MembershipHistory from '../models/MembershipHistory.js';
import User from '../models/User.js';
import Post from '../models/Post.js';
import logger from '../middlewares/logger.js';
import { logActivity, sendNotification, emitAdminEvent } from '../utils/tracker.js';

import sendEmail from '../utils/sendEmail.js';
import { getPremiumApprovedTemplate, getPurchaseApprovedTemplate } from '../utils/emailTemplates.js';

export const submitPremiumRequest = async (req, res) => {
  try {
    const { planId, transactionId, amount, proofImage } = req.body;

    const existingTx = await PremiumRequest.findOne({ transactionId });
    if (existingTx) {
      return res.status(400).json({ success: false, message: 'Transaction ID already submitted.' });
    }

    const plan = await PremiumPlan.findById(planId);
    if (!plan) return res.status(404).json({ success: false, message: 'Plan not found.' });

    const request = await PremiumRequest.create({
      user: req.user.id,
      plan: plan._id,
      amount,
      transactionId,
      proofImage,
      status: 'Pending'
    });

    await logActivity(req.user.id, 'Premium Request Submitted', `Submitted payment for plan ${plan.name}`, req);
    await sendNotification(req.user.id, 'Payment Submitted', 'Your premium payment is under review.', 'PREMIUM', 'Clock');

    res.status(201).json({ success: true, data: request });
  } catch (error) {
    logger.error(`Submit Premium Request Error: ${error.message}`);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getPremiumPlans = async (req, res) => {
  try {
    const plans = await PremiumPlan.find({ isActive: true }).sort('price');
    res.status(200).json({ success: true, count: plans.length, data: plans });
  } catch (error) {
    logger.error(`Get Premium Plans Error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const getPremiumRequests = async (req, res) => {
  try {
    const requests = await PremiumRequest.find().populate('user', 'name email profileImage').populate('plan', 'name durationDays price').sort('-createdAt');
    res.status(200).json({ success: true, count: requests.length, data: requests });
  } catch (error) {
    logger.error(`Get Premium Requests Error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const approvePremiumRequest = async (req, res) => {
  try {
    const request = await PremiumRequest.findById(req.params.id).populate('plan').populate('user');
    if (!request) return res.status(404).json({ success: false, message: 'Request not found' });
    if (request.status === 'Approved') return res.status(400).json({ success: false, message: 'Already approved' });

    const user = await User.findById(request.user._id);
    const plan = request.plan;

    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (!plan) return res.status(404).json({ success: false, message: 'Premium Plan not found' });
    
    user.isPremium = true;
    user.premiumType = plan.name;
    user.premiumStatus = 'Active';

    let startDate = Date.now();
    if (user.premiumEndDate && user.premiumEndDate > Date.now()) {
      startDate = user.premiumEndDate.getTime();
    }
    user.premiumStartDate = new Date(startDate);
    const expiryDate = new Date(startDate + plan.durationDays * 24 * 60 * 60 * 1000);
    user.premiumEndDate = expiryDate;
    await user.save();

    await MembershipHistory.create({
      user: user._id,
      action: `Upgraded to ${plan.name}`,
      details: `Transaction ID: ${request.transactionId}`
    });

    request.status = 'Approved';
    request.approvedBy = req.user.id;
    await request.save();

    await sendNotification(user._id, 'Payment Approved', `Your payment was approved! Premium ${plan.name} is now active.`, 'PREMIUM', 'CheckCircle');
    
    emitAdminEvent('liveRevenue', {
      amount: request.amount,
      currency: 'INR',
      plan: plan.name,
      user: user.name,
      timestamp: Date.now()
    });

    try {
      await sendEmail({
        email: user.email,
        subject: 'Premium Membership Activated!',
        html: getPremiumApprovedTemplate(user.name, plan.name, `${process.env.FRONTEND_URL}/profile`)
      });
    } catch(e) {}

    res.status(200).json({ success: true, data: request });
  } catch (error) {
    logger.error(`Approve Premium Request Error: ${error.message}`);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const rejectPremiumRequest = async (req, res) => {
  try {
    const request = await PremiumRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ success: false, message: 'Request not found' });

    request.status = 'Rejected';
    request.rejectionReason = req.body.reason || 'Invalid transaction details';
    request.approvedBy = req.user.id;
    await request.save();

    await sendNotification(request.user, 'Payment Rejected', `Your premium payment was rejected: ${request.rejectionReason}`, 'PREMIUM', 'XCircle');
    res.status(200).json({ success: true, data: request });
  } catch (error) {
    logger.error(`Reject Premium Request Error: ${error.message}`);
    res.status(500).json({ success: false, message: error.message });
  }
};

// --- PURCHASE REQUESTS ---

export const submitPurchaseRequest = async (req, res) => {
  try {
    const { postId, gameId, transactionId, amount, proofImage } = req.body;

    const existingTx = await PurchaseRequest.findOne({ transactionId });
    if (existingTx) return res.status(400).json({ success: false, message: 'Transaction ID already submitted.' });

    if (!proofImage || !transactionId) {
      return res.status(400).json({ success: false, message: 'Payment details missing.' });
    }

    let requestData = {
      user: req.user.id,
      amount,
      transactionId,
      proofImage,
      status: 'Pending'
    };

    if (gameId) {
      const game = await mongoose.model('Game').findById(gameId);
      if (!game) return res.status(404).json({ success: false, message: 'Game not found.' });
      if (!game.isPaid) return res.status(400).json({ success: false, message: 'This game is free.' });
      requestData.game = game._id;
    } else if (postId) {
      const post = await Post.findById(postId);
      if (!post) return res.status(404).json({ success: false, message: 'App not found.' });
      if (post.appType !== 'One-Time Purchase' && post.appType !== 'Paid') {
        return res.status(400).json({ success: false, message: 'This app is not available for purchase.' });
      }
      requestData.post = post._id;
    } else {
      return res.status(400).json({ success: false, message: 'Item ID missing.' });
    }

    const request = await PurchaseRequest.create(requestData);

    const itemName = requestData.game ? 'Game' : 'App';
    await logActivity(req.user.id, `${itemName} Purchase Submitted`, `Submitted payment for ${itemName}`, req);
    await sendNotification(req.user.id, 'Payment Submitted', `Your ${itemName.toLowerCase()} purchase payment is under review.`, 'STORE', 'Clock');

    res.status(201).json({ success: true, data: request });
  } catch (error) {
    logger.error(`Submit Purchase Request Error: ${error.message}`);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const buyItemWithCoins = async (req, res) => {
  try {
    const { gameId, postId } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    let item, itemModel, itemRef, itemName;

    if (gameId) {
      itemModel = mongoose.model('Game');
      item = await itemModel.findById(gameId);
      if (!item) return res.status(404).json({ success: false, message: 'Game not found' });
      itemRef = { game: item._id };
      itemName = item.title;
    } else if (postId) {
      item = await Post.findById(postId);
      if (!item) return res.status(404).json({ success: false, message: 'App not found' });
      itemRef = { post: item._id };
      itemName = item.title;
    } else {
      return res.status(400).json({ success: false, message: 'Item ID missing' });
    }

    const price = item.discountPrice || item.price || 0;
    
    if (user.rewardPoints < price) {
      return res.status(400).json({ success: false, message: 'Not enough coins' });
    }

    // Deduct coins
    user.rewardPoints -= price;
    await user.save();

    // Create an APPROVED purchase request
    const request = await PurchaseRequest.create({
      user: user._id,
      amount: price,
      transactionId: `COINS-${Date.now()}`,
      proofImage: 'paid_with_coins',
      status: 'Approved',
      approvedBy: user._id, // Auto-approved
      ...itemRef
    });

    if (postId) {
      await UserPurchases.create({
        user: user._id,
        post: item._id,
      });
    }

    await logActivity(user._id, 'Purchase with Coins', `Purchased ${itemName} using ${price} coins`, req);
    await sendNotification(user._id, 'Purchase Successful', `You successfully purchased ${itemName} using coins!`, 'STORE', 'CheckCircle');

    res.status(200).json({ success: true, message: `Successfully purchased ${itemName}`, data: request });
  } catch (error) {
    logger.error(`Buy Item With Coins Error: ${error.message}`);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getPurchaseRequests = async (req, res) => {
  try {
    const requests = await PurchaseRequest.find()
      .populate('user', 'name email profileImage')
      .populate('post', 'title appType price')
      .populate('game', 'title price')
      .sort('-createdAt');
    res.status(200).json({ success: true, count: requests.length, data: requests });
  } catch (error) {
    logger.error(`Get Purchase Requests Error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const approvePurchaseRequest = async (req, res) => {
  try {
    const request = await PurchaseRequest.findById(req.params.id).populate('post').populate('game').populate('user');
    if (!request) return res.status(404).json({ success: false, message: 'Request not found' });
    if (request.status === 'Approved') return res.status(400).json({ success: false, message: 'Already approved' });

    // Unlock App or Game
    if (request.post) {
      await UserPurchases.create({
        user: request.user._id,
        post: request.post._id,
      });
    } // For games, we just check PurchaseRequest status='Approved' on the frontend

    request.status = 'Approved';
    request.approvedBy = req.user.id;
    await request.save();

    const itemName = request.game ? request.game.title : (request.post ? request.post.title : 'Item');
    await sendNotification(request.user._id, 'Purchase Approved', `Your purchase for ${itemName} was approved!`, 'STORE', 'CheckCircle');
    
    emitAdminEvent('liveRevenue', {
      amount: request.amount,
      currency: 'INR',
      plan: 'App Purchase',
      user: request.user.name,
      timestamp: Date.now()
    });

    try {
      await sendEmail({
        email: request.user.email,
        subject: 'Purchase Approved!',
        html: getPurchaseApprovedTemplate(request.user.name, itemName, `${process.env.FRONTEND_URL}/profile`)
      });
    } catch(e) {}

    res.status(200).json({ success: true, data: request });
  } catch (error) {
    logger.error(`Approve Purchase Request Error: ${error.message}`);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const rejectPurchaseRequest = async (req, res) => {
  try {
    const request = await PurchaseRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ success: false, message: 'Request not found' });

    request.status = 'Rejected';
    request.rejectionReason = req.body.reason || 'Invalid transaction details';
    request.approvedBy = req.user.id;
    await request.save();

    const itemName = request.game ? 'Game' : 'App';
    await sendNotification(request.user, 'Purchase Rejected', `Your ${itemName.toLowerCase()} purchase was rejected: ${request.rejectionReason}`, 'STORE', 'XCircle');
    res.status(200).json({ success: true, data: request });
  } catch (error) {
    logger.error(`Reject Purchase Request Error: ${error.message}`);
    res.status(500).json({ success: false, message: error.message });
  }
};

// --- USER QUERIES ---

export const getMyRequests = async (req, res) => {
  try {
    const premiumRequests = await PremiumRequest.find({ user: req.user.id }).populate('plan', 'name durationDays').sort('-createdAt');
    const purchaseRequests = await PurchaseRequest.find({ user: req.user.id }).populate('post', 'title appType').populate('game', 'title price').sort('-createdAt');
    const purchases = await UserPurchases.find({ user: req.user.id }).populate('post', 'title appType featuredImage slug').sort('-createdAt');
    
    res.status(200).json({ 
      success: true, 
      data: {
        premiumRequests: premiumRequests.filter(r => r.plan != null),
        purchaseRequests: purchaseRequests, // Send all purchase requests including games
        purchases: purchases.filter(p => p.post != null)
      } 
    });
  } catch (error) {
    logger.error(`Get My Requests Error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
