import Comment from '../models/Comment.js';
import Post from '../models/Post.js';
import logger from '../middlewares/logger.js';
import { logActivity, sendNotification } from '../utils/tracker.js';
import { hasBadWords, handleViolation } from '../utils/autoModerator.js';

// @desc    Get comments for a post
// @route   GET /api/comments/post/:postId
// @access  Public
export const getComments = async (req, res) => {
  try {
    const comments = await Comment.find({ 
      post: req.params.postId,
      rating: { $exists: false },
      parentComment: null,
      status: 'Approved'
    })
    .populate({
      path: 'replies',
      match: { status: 'Approved' },
      populate: { path: 'user', select: 'name profileImage' }
    })
    .populate('user', 'name profileImage')
    .sort('-createdAt');

    res.status(200).json({ success: true, count: comments.length, data: comments });
  } catch (error) {
    logger.error(`Get Comments Error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Get all comments (Admin)
// @route   GET /api/comments
// @access  Private/Admin
export const getAllComments = async (req, res) => {
  try {
    const comments = await Comment.find({ rating: { $exists: false } })
      .populate('user', 'name email')
      .populate('post', 'title slug')
      .sort('-createdAt');

    res.status(200).json({ success: true, count: comments.length, data: comments });
  } catch (error) {
    logger.error(`Get All Comments Error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Add comment to post
// @route   POST /api/comments
// @access  Private
export const addComment = async (req, res) => {
  try {
    const { postId, content } = req.body;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    if (req.user.status === 'suspended') {
      return res.status(403).json({ success: false, message: 'Your account is suspended. You cannot comment.' });
    }
    if (req.user.restrictions?.disableCommenting) {
      return res.status(403).json({ success: false, message: 'Your commenting privileges have been disabled.' });
    }

    // AI Auto-Moderator Check
    if (hasBadWords(content)) {
      const modResult = await handleViolation(req.user.id, req);
      const actionMsg = modResult.actionTaken === 'MUTED' 
        ? 'You have been muted for 24 hours.' 
        : `Strike ${modResult.strikes}/3.`;
      
      return res.status(400).json({ 
        success: false, 
        message: `Your comment was blocked for containing inappropriate language. ${actionMsg}` 
      });
    }

    const comment = await Comment.create({
      post: postId,
      user: req.user.id,
      name: req.user.name,
      email: req.user.email,
      content,
      status: 'Pending'
    });

    await logActivity(req.user.id, 'Comment Added', `Commented on post ${post.title}`, req, { postId: post._id });

    res.status(201).json({ success: true, data: comment, message: 'Comment submitted for moderation' });
  } catch (error) {
    logger.error(`Add Comment Error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Add nested reply
// @route   POST /api/comments/:commentId/reply
// @access  Private
export const addReply = async (req, res) => {
  try {
    const { content } = req.body;
    const parentCommentId = req.params.commentId;

    const parent = await Comment.findById(parentCommentId);
    if (!parent) {
      return res.status(404).json({ success: false, message: 'Parent comment not found' });
    }

    if (req.user.status === 'suspended') {
      return res.status(403).json({ success: false, message: 'Your account is suspended. You cannot reply.' });
    }
    if (req.user.restrictions?.disableCommenting) {
      return res.status(403).json({ success: false, message: 'Your commenting privileges have been disabled.' });
    }

    // AI Auto-Moderator Check
    if (hasBadWords(content)) {
      const modResult = await handleViolation(req.user.id, req);
      const actionMsg = modResult.actionTaken === 'MUTED' 
        ? 'You have been muted for 24 hours.' 
        : `Strike ${modResult.strikes}/3.`;
      
      return res.status(400).json({ 
        success: false, 
        message: `Your reply was blocked for containing inappropriate language. ${actionMsg}` 
      });
    }

    const reply = await Comment.create({
      post: parent.post,
      user: req.user.id,
      name: req.user.name,
      email: req.user.email,
      content,
      parentComment: parent._id,
      status: 'Pending'
    });

    parent.replies.push(reply._id);
    await parent.save();

    await logActivity(req.user.id, 'Reply Added', `Replied to a comment`, req, { parentCommentId: parent._id });
    
    // Notify parent comment author if they are not the same user
    if (parent.user && parent.user.toString() !== req.user.id.toString()) {
      await sendNotification(parent.user, 'New Reply', `${req.user.name} replied to your comment.`, 'REPLY', 'MessageCircle');
    }

    res.status(201).json({ success: true, data: reply, message: 'Reply submitted for moderation' });
  } catch (error) {
    logger.error(`Add Reply Error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Update comment status (Moderation)
// @route   PUT /api/comments/:id/moderate
// @access  Private/Admin
export const updateCommentStatus = async (req, res) => {
  try {
    const { status, rejectionReason } = req.body;
    const validStatuses = ['Pending', 'Approved', 'Rejected'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({ success: false, message: 'Comment not found' });
    }

    comment.status = status;
    comment.moderatedBy = req.user._id;
    comment.moderationTimestamp = Date.now();
    
    if (status === 'Rejected') {
      comment.rejectionReason = rejectionReason;
    } else {
      comment.rejectionReason = undefined;
    }

    await comment.save();

    if (status === 'Approved') {
      await sendNotification(comment.user, 'Comment Approved', 'Your comment has been approved.', 'COMMENT', 'CheckCircle');
    } else if (status === 'Rejected') {
      await sendNotification(comment.user, 'Comment Rejected', `Your comment was rejected. Reason: ${rejectionReason}`, 'COMMENT', 'XCircle');
    }

    res.status(200).json({ success: true, data: comment });
  } catch (error) {
    logger.error(`Update Comment Status Error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Delete comment
// @route   DELETE /api/comments/:id
// @access  Private/Admin
export const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({ success: false, message: 'Comment not found' });
    }

    // Also delete any replies
    if (comment.replies && comment.replies.length > 0) {
      await Comment.deleteMany({ _id: { $in: comment.replies } });
    }

    await comment.deleteOne();

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    logger.error(`Delete Comment Error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
