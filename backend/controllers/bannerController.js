import Banner from '../models/Banner.js';
import logger from '../middlewares/logger.js';

export const getActiveBanners = async (req, res) => {
  try {
    const banners = await Banner.find({ isActive: true }).sort('order createdAt');
    res.json({ success: true, data: banners });
  } catch (error) {
    logger.error(`Get Active Banners Error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const getAllBanners = async (req, res) => {
  try {
    const banners = await Banner.find().sort('order createdAt');
    res.json({ success: true, data: banners });
  } catch (error) {
    logger.error(`Get All Banners Error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const createBanner = async (req, res) => {
  try {
    const banner = await Banner.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json({ success: true, data: banner });
  } catch (error) {
    logger.error(`Create Banner Error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const updateBanner = async (req, res) => {
  try {
    const banner = await Banner.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!banner) return res.status(404).json({ success: false, message: 'Banner not found' });
    res.json({ success: true, data: banner });
  } catch (error) {
    logger.error(`Update Banner Error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const deleteBanner = async (req, res) => {
  try {
    const banner = await Banner.findByIdAndDelete(req.params.id);
    if (!banner) return res.status(404).json({ success: false, message: 'Banner not found' });
    res.json({ success: true, message: 'Banner deleted' });
  } catch (error) {
    logger.error(`Delete Banner Error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
