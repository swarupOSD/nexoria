import Comment from '../models/Comment.js';
import Post from '../models/Post.js';
import logger from '../middlewares/logger.js';
import { logActivity, sendNotification } from '../utils/tracker.js';

// @desc    Get ratings for a post
// @route   GET /api/ratings/post/:postId
// @access  Public
export const getRatings = async (req, res) => {
  try {
    const ratings = await Comment.find({ 
      post: req.params.postId, 
      rating: { $exists: true },
      status: 'Approved'
    }).populate('user', 'name profileImage').sort('-createdAt');

    res.status(200).json({ success: true, count: ratings.length, data: ratings });
  } catch (error) {
    logger.error(`Get Ratings Error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Get all ratings (Admin)
// @route   GET /api/ratings
// @access  Private/Admin
export const getAllRatings = async (req, res) => {
  try {
    const ratings = await Comment.find({ rating: { $exists: true } })
      .populate('user', 'name email')
      .populate('post', 'title slug')
      .sort('-createdAt');

    res.status(200).json({ success: true, count: ratings.length, data: ratings });
  } catch (error) {
    logger.error(`Get All Ratings Error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Submit a rating
// @route   POST /api/ratings
// @access  Private
export const submitRating = async (req, res) => {
  try {
    const { postId, rating } = req.body;
    
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    if (req.user.status === 'suspended') {
      return res.status(403).json({ success: false, message: 'Your account is suspended. You cannot submit ratings.' });
    }
    if (req.user.restrictions?.disableRatings) {
      return res.status(403).json({ success: false, message: 'Your rating privileges have been disabled.' });
    }

    const newRating = await Comment.create({
      post: postId,
      user: req.user.id,
      name: req.user.name,
      email: req.user.email,
      rating,
      status: 'Pending' // Ratings now require moderation
    });

    await logActivity(req.user.id, 'Rating Added', `Rated post ${post.title} with ${rating} stars`, req, { postId: post._id });

    res.status(201).json({ success: true, data: newRating });
  } catch (error) {
    logger.error(`Submit Rating Error: ${error.message}`);
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'You have already submitted a rating for this post' });
    }
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Update a rating
// @route   PUT /api/ratings/:id
// @access  Private
export const updateRating = async (req, res) => {
  try {
    let ratingDoc = await Comment.findById(req.params.id);

    if (!ratingDoc) {
      return res.status(404).json({ success: false, message: 'Rating not found' });
    }

    if (ratingDoc.user.toString() !== req.user.id && req.user.role !== 'admin' && req.user.role !== 'superadmin') {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    if (req.user.status === 'suspended') {
      return res.status(403).json({ success: false, message: 'Your account is suspended. You cannot update ratings.' });
    }
    if (req.user.restrictions?.disableRatings) {
      return res.status(403).json({ success: false, message: 'Your rating privileges have been disabled.' });
    }

    ratingDoc.rating = req.body.rating;
    await ratingDoc.save();

    res.status(200).json({ success: true, data: ratingDoc });
  } catch (error) {
    logger.error(`Update Rating Error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Delete a rating
// @route   DELETE /api/ratings/:id
// @access  Private/Admin
export const deleteRating = async (req, res) => {
  try {
    const ratingDoc = await Comment.findById(req.params.id);

    if (!ratingDoc) {
      return res.status(404).json({ success: false, message: 'Rating not found' });
    }

    await ratingDoc.deleteOne();

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    logger.error(`Delete Rating Error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Moderate a rating
// @route   PUT /api/ratings/:id/moderate
// @access  Private/Admin
export const moderateRating = async (req, res) => {
  try {
    const { status, rejectionReason } = req.body;
    const validStatuses = ['Pending', 'Approved', 'Rejected'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const ratingDoc = await Comment.findById(req.params.id);

    if (!ratingDoc || !ratingDoc.rating) {
      return res.status(404).json({ success: false, message: 'Rating not found' });
    }

    ratingDoc.status = status;
    ratingDoc.moderatedBy = req.user._id;
    ratingDoc.moderationTimestamp = Date.now();
    
    if (status === 'Rejected') {
      ratingDoc.rejectionReason = rejectionReason;
    } else {
      ratingDoc.rejectionReason = undefined;
    }

    await ratingDoc.save();

    if (status === 'Approved') {
      await sendNotification(ratingDoc.user, 'Rating Approved', 'Your rating has been approved.', 'RATING', 'CheckCircle');
    } else if (status === 'Rejected') {
      await sendNotification(ratingDoc.user, 'Rating Rejected', `Your rating was rejected. Reason: ${rejectionReason}`, 'RATING', 'XCircle');
    }

    res.status(200).json({ success: true, data: ratingDoc });
  } catch (error) {
    logger.error(`Moderate Rating Error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
