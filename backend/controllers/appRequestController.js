import AppRequest from '../models/AppRequest.js';
import logger from '../middlewares/logger.js';
import { sendNotification } from '../utils/tracker.js';

// @desc    Create an app request
// @route   POST /api/app-requests
// @access  Private
export const createAppRequest = async (req, res) => {
  try {
    const { appName, description, category, priority } = req.body;

    const request = await AppRequest.create({
      user: req.user._id,
      appName,
      description,
      category,
      priority,
    });

    // Notify admins (Assuming role 'superadmin' exists or we broadcast)
    // We can also just send an acknowledgment to the user
    await sendNotification(
      req.user._id,
      'App Request Received',
      `We have received your request for ${appName}. We'll look into it soon!`,
      'SYSTEM',
      'Download'
    );

    res.status(201).json({ success: true, data: request });
  } catch (error) {
    logger.error(`Create App Request Error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Get user's app requests
// @route   GET /api/app-requests/me
// @access  Private
export const getMyAppRequests = async (req, res) => {
  try {
    const requests = await AppRequest.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: requests.length, data: requests });
  } catch (error) {
    logger.error(`Get My App Requests Error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Get all app requests (Admin)
// @route   GET /api/app-requests
// @access  Private/Admin
export const getAllAppRequests = async (req, res) => {
  try {
    const requests = await AppRequest.find().populate('user', 'name email').sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: requests.length, data: requests });
  } catch (error) {
    logger.error(`Get All App Requests Error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Update app request status (Admin)
// @route   PUT /api/app-requests/:id
// @access  Private/Admin
export const updateAppRequest = async (req, res) => {
  try {
    const { status, adminNotes } = req.body;
    let request = await AppRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    request.status = status || request.status;
    if (adminNotes !== undefined) {
      request.adminNotes = adminNotes;
    }

    await request.save();

    // Notify user of status change
    await sendNotification(
      request.user,
      'App Request Update',
      `Your request for ${request.appName} is now: ${request.status}`,
      'SYSTEM',
      'Info'
    );

    res.status(200).json({ success: true, data: request });
  } catch (error) {
    logger.error(`Update App Request Error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
