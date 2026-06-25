import Report from '../models/Report.js';
import { logActivity, sendNotification } from '../utils/tracker.js';

// @desc    Create a new report
// @route   POST /api/reports
// @access  Private
export const createReport = async (req, res) => {
  try {
    const { post, reason, description, downloadLink } = req.body;
    
    if (!post || !reason || !description) {
      return res.status(400).json({ success: false, message: 'Please provide all fields' });
    }

    if (req.user.status === 'suspended') {
      return res.status(403).json({ success: false, message: 'Your account is suspended. You cannot submit reports.' });
    }

    const report = await Report.create({
      user: req.user._id,
      post,
      reason,
      description,
      downloadLink
    });

    await logActivity(req.user._id, 'Report Submitted', `Submitted a report for reason: ${reason}`, req, { postId: post });

    res.status(201).json({ success: true, data: report });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all reports
// @route   GET /api/reports
// @access  Private/Admin
export const getReports = async (req, res) => {
  try {
    const reports = await Report.find()
      .populate('user', 'name email')
      .populate('post', 'title slug appLogo')
      .sort('-createdAt');
    res.status(200).json({ success: true, data: reports });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Resolve a report
// @route   PUT /api/reports/:id/resolve
// @access  Private/Admin
export const resolveReport = async (req, res) => {
  try {
    const report = await Report.findByIdAndUpdate(
      req.params.id,
      {
        status: 'Resolved',
        resolvedBy: req.user._id,
        resolvedAt: Date.now()
      },
      { new: true }
    ).populate('user', 'name email').populate('post', 'title slug appLogo');

    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }

    await sendNotification(report.user._id, 'Report Resolved', `Your report for post "${report.post?.title || 'Unknown'}" has been marked as resolved.`, 'REPORT', 'CheckCircle');
    
    res.status(200).json({ success: true, data: report });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Reject a report
// @route   PUT /api/reports/:id/reject
// @access  Private/Admin
export const rejectReport = async (req, res) => {
  try {
    const report = await Report.findByIdAndUpdate(
      req.params.id,
      {
        status: 'Rejected',
        resolvedBy: req.user._id,
        resolvedAt: Date.now()
      },
      { new: true }
    ).populate('user', 'name email').populate('post', 'title slug appLogo');

    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }

    await sendNotification(report.user._id, 'Report Rejected', `Your report for post "${report.post?.title || 'Unknown'}" has been rejected.`, 'REPORT', 'XCircle');

    res.status(200).json({ success: true, data: report });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a report
// @route   DELETE /api/reports/:id
// @access  Private/Admin
export const deleteReport = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }
    await report.deleteOne();
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
