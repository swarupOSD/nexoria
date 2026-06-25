import Review from '../models/Review.js';
import Post from '../models/Post.js';
import logger from '../middlewares/logger.js';
import { logActivity } from '../utils/tracker.js';

// @desc    Get reviews for a post
// @route   GET /api/reviews/post/:postId
// @access  Public
export const getPostReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ post: req.params.postId, isApproved: true })
      .populate('user', 'name username profileImage role')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: reviews.length, data: reviews });
  } catch (error) {
    logger.error(`Get Reviews Error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Create a review
// @route   POST /api/reviews
// @access  Private
export const createReview = async (req, res) => {
  try {
    const { postId, rating, comment } = req.body;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ success: false, message: 'App not found' });
    }

    // Check if user already reviewed
    const existingReview = await Review.findOne({ post: postId, user: req.user._id });
    if (existingReview) {
      return res.status(400).json({ success: false, message: 'You have already reviewed this app' });
    }

    const review = await Review.create({
      user: req.user._id,
      post: postId,
      rating,
      comment,
      isApproved: true, // Auto-approve by default, admin can moderate later
    });

    await logActivity(req.user._id, 'Review Created', `Reviewed ${post.title}`, req);

    res.status(201).json({ success: true, data: review });
  } catch (error) {
    logger.error(`Create Review Error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Update a review
// @route   PUT /api/reviews/:id
// @access  Private
export const updateReview = async (req, res) => {
  try {
    let review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    // Check ownership
    if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin' && req.user.role !== 'superadmin') {
      return res.status(403).json({ success: false, message: 'Not authorized to update this review' });
    }

    review.rating = req.body.rating || review.rating;
    review.comment = req.body.comment || review.comment;
    review.editedAt = Date.now();

    await review.save();

    res.status(200).json({ success: true, data: review });
  } catch (error) {
    logger.error(`Update Review Error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Delete a review
// @route   DELETE /api/reviews/:id
// @access  Private
export const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin' && req.user.role !== 'superadmin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this review' });
    }

    await review.deleteOne();

    res.status(200).json({ success: true, message: 'Review removed' });
  } catch (error) {
    logger.error(`Delete Review Error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Get all reviews (Admin)
// @route   GET /api/reviews/admin/all
// @access  Private/Admin
export const getAdminReviews = async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate('user', 'name email')
      .populate('post', 'title')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: reviews.length, data: reviews });
  } catch (error) {
    logger.error(`Admin Get Reviews Error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Moderate a review (Approve/Reject/Delete)
// @route   PUT /api/reviews/:id/moderate
// @access  Private/Admin
export const moderateReview = async (req, res) => {
  try {
    const { isApproved } = req.body;
    let review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    review = await Review.findByIdAndUpdate(req.params.id, { isApproved }, { new: true, runValidators: true });

    res.status(200).json({ success: true, data: review });
  } catch (error) {
    logger.error(`Moderate Review Error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
