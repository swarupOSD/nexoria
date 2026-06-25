import Advertisement from '../models/Advertisement.js';
import logger from '../middlewares/logger.js';

// @desc    Get all advertisements
// @route   GET /api/advertisements
// @access  Public
export const getAdvertisements = async (req, res) => {
  try {
    // If admin/superadmin, return all. If public, return only enabled
    const isAdmin = req.user && (req.user.role === 'admin' || req.user.role === 'superadmin');
    const filter = isAdmin ? {} : { enabled: true };
    const ads = await Advertisement.find(filter).sort({ createdAt: -1 }).populate('createdBy', 'username');
    res.status(200).json({ success: true, data: ads });
  } catch (error) {
    logger.error(`Get Ads Error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Create advertisement
// @route   POST /api/advertisements
// @access  Private/Admin
export const createAdvertisement = async (req, res) => {
  try {
    const { name, location, adCode, enabled } = req.body;
    const ad = await Advertisement.create({
      name,
      location,
      adCode,
      enabled: enabled !== undefined ? enabled : true,
      createdBy: req.user.id
    });
    res.status(201).json({ success: true, data: ad });
  } catch (error) {
    logger.error(`Create Ad Error: ${error.message}`);
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Update advertisement
// @route   PUT /api/advertisements/:id
// @access  Private/Admin
export const updateAdvertisement = async (req, res) => {
  try {
    const { name, location, adCode, enabled } = req.body;
    let ad = await Advertisement.findById(req.params.id);
    if (!ad) {
      return res.status(404).json({ success: false, message: 'Ad not found' });
    }
    
    ad.name = name || ad.name;
    ad.location = location || ad.location;
    ad.adCode = adCode || ad.adCode;
    if (enabled !== undefined) ad.enabled = enabled;

    await ad.save();
    res.status(200).json({ success: true, data: ad });
  } catch (error) {
    logger.error(`Update Ad Error: ${error.message}`);
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Delete advertisement
// @route   DELETE /api/advertisements/:id
// @access  Private/Admin
export const deleteAdvertisement = async (req, res) => {
  try {
    const ad = await Advertisement.findById(req.params.id);
    if (!ad) {
      return res.status(404).json({ success: false, message: 'Ad not found' });
    }
    await Advertisement.deleteOne({ _id: ad._id });
    res.status(200).json({ success: true, message: 'Ad removed' });
  } catch (error) {
    logger.error(`Delete Ad Error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Toggle advertisement
// @route   PATCH /api/advertisements/:id/toggle
// @access  Private/Admin
export const toggleAdvertisement = async (req, res) => {
  try {
    const ad = await Advertisement.findById(req.params.id);
    if (!ad) {
      return res.status(404).json({ success: false, message: 'Ad not found' });
    }
    ad.enabled = !ad.enabled;
    await ad.save();
    res.status(200).json({ success: true, data: ad });
  } catch (error) {
    logger.error(`Toggle Ad Error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
