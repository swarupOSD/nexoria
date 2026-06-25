import UserActivity from '../models/UserActivity.js';
import logger from '../middlewares/logger.js';

export const getMyActivity = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const startIndex = (page - 1) * limit;

    const total = await UserActivity.countDocuments({ user: req.user._id });
    const activities = await UserActivity.find({ user: req.user._id })
      .sort('-createdAt')
      .skip(startIndex)
      .limit(limit);

    res.status(200).json({ 
      success: true, 
      data: activities,
      pagination: { total, page, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    logger.error(`Get My Activity Error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const getAllActivities = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 50;
    const startIndex = (page - 1) * limit;

    const query = {};
    if (req.query.user) query.user = req.query.user;
    if (req.query.actionType) query.actionType = req.query.actionType;
    if (req.query.ipAddress) query.ipAddress = req.query.ipAddress;

    const total = await UserActivity.countDocuments(query);
    const activities = await UserActivity.find(query)
      .populate('user', 'name email role')
      .sort('-createdAt')
      .skip(startIndex)
      .limit(limit);

    res.status(200).json({ 
      success: true, 
      data: activities,
      pagination: { total, page, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    logger.error(`Get All Activities Error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
