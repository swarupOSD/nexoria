import SiteSettings from '../models/SiteSettings.js';
import logger from '../middlewares/logger.js';

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
    const updateData = { ...req.body, updatedBy: req.user.id };
    
    if (!settings) {
      settings = await SiteSettings.create(updateData);
    } else {
      settings = await SiteSettings.findByIdAndUpdate(settings._id, updateData, { new: true, runValidators: true });
    }
    res.status(200).json({ success: true, data: settings });
  } catch (error) {
    logger.error(`Update Settings Error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
