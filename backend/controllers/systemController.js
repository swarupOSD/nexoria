import Advertisement from '../models/Advertisement.js';
import SiteSettings from '../models/SiteSettings.js';
import logger from '../middlewares/logger.js';

// @desc    Get active ads
// @route   GET /api/ads
// @access  Public
export const getActiveAds = async (req, res) => {
  try {
    const ads = await Advertisement.find({ isActive: true });
    res.status(200).json({ success: true, data: ads });
  } catch (error) {
    logger.error(`Get Ads Error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Manage Ads (Admin)
// @route   POST /api/ads
// @access  Private/Admin
export const createAd = async (req, res) => {
  try {
    const ad = await Advertisement.create(req.body);
    res.status(201).json({ success: true, data: ad });
  } catch (error) {
    logger.error(`Create Ad Error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Get site settings
// @route   GET /api/settings
// @access  Public
export const getSettings = async (req, res) => {
  try {
    let settings = await SiteSettings.findOne();
    if (!settings) {
      settings = await SiteSettings.create({});
    }
    res.status(200).json({ success: true, data: settings });
  } catch (error) {
    logger.error(`Get Settings Error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Update site settings
// @route   PUT /api/settings
// @access  Private/SuperAdmin
export const updateSettings = async (req, res) => {
  try {
    let settings = await SiteSettings.findOne();
    if (!settings) {
      settings = await SiteSettings.create(req.body);
    } else {
      settings = await SiteSettings.findByIdAndUpdate(settings._id, req.body, { new: true, runValidators: true });
    }
    res.status(200).json({ success: true, data: settings });
  } catch (error) {
    logger.error(`Update Settings Error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Get security logs
// @route   GET /api/system/security-logs
// @access  Private/SuperAdmin
export const getSecurityLogs = async (req, res) => {
  try {
    const SecurityLog = (await import('../models/SecurityLog.js')).default;
    const logs = await SecurityLog.find().sort({ createdAt: -1 }).limit(100);
    res.status(200).json({ success: true, data: logs });
  } catch (error) {
    logger.error(`Get Security Logs Error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Clear security logs
// @route   DELETE /api/system/security-logs
// @access  Private/SuperAdmin
export const clearSecurityLogs = async (req, res) => {
  try {
    const SecurityLog = (await import('../models/SecurityLog.js')).default;
    await SecurityLog.deleteMany({});
    res.status(200).json({ success: true, message: 'Logs cleared successfully' });
  } catch (error) {
    logger.error(`Clear Security Logs Error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
