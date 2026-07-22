import Download from '../models/Download.js';
import Post from '../models/Post.js';
import SiteSettings from '../models/SiteSettings.js';
import logger from '../middlewares/logger.js';

// @desc    Track download and return URL
// @route   POST /api/downloads/:postId/:linkId
// @access  Public
export const trackDownload = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    const link = post.downloadLinks.id(req.params.linkId);
    if (!link) {
      return res.status(404).json({ success: false, message: 'Download link not found' });
    }

    if (!link.isActive) {
      return res.status(400).json({ success: false, message: 'This link is currently disabled.' });
    }

    if (req.user && req.user.status === 'suspended') {
      return res.status(403).json({ success: false, message: 'Your account is suspended. You cannot download files.' });
    }

    if (link.type === 'premium') {
      const isPremiumUser = req.user && (req.user.isPremium || req.user.role === 'admin' || req.user.role === 'superadmin');
      if (!isPremiumUser) {
        return res.status(403).json({ success: false, message: 'Premium Membership required to access this link.' });
      }
    }

    if (post.appType === 'Premium Subscription') {
      const isPremiumUser = req.user && (req.user.isPremium || req.user.role === 'admin' || req.user.role === 'superadmin');
      if (!isPremiumUser) {
        return res.status(403).json({ success: false, message: 'Premium Membership required to download this app.' });
      }
    } else if (post.appType === 'One-Time Purchase') {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Please login to download this app.' });
      }
      if (req.user.role !== 'admin' && req.user.role !== 'superadmin') {
        const { default: UserPurchases } = await import('../models/UserPurchases.js');
        const purchase = await UserPurchases.findOne({ user: req.user.id, post: post._id });
        if (!purchase) {
          return res.status(403).json({ success: false, message: 'You must purchase this app to download it.' });
        }
      }
    }

    // Increment download count
    link.clickCount += 1;
    post.downloads = (post.downloads || 0) + 1;
    await post.save();

    // Store download analytics
    await Download.create({
      post: post._id,
      downloadLink: link._id,
      user: req.user ? req.user.id : undefined,
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.headers['user-agent']
    });

    // Check for global download URL
    const settings = await SiteSettings.findOne();
    const finalUrl = (settings && settings.ads && settings.ads.globalDownloadUrl) ? settings.ads.globalDownloadUrl : link.url;

    res.status(200).json({ success: true, downloadUrl: finalUrl });
  } catch (error) {
    logger.error(`Track Download Error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Get user's download history
// @route   GET /api/downloads/history
// @access  Private
export const getMyDownloads = async (req, res) => {
  try {
    const downloads = await Download.aggregate([
      { $match: { user: req.user._id } },
      { $group: {
          _id: '$post',
          downloadCount: { $sum: 1 },
          lastDownloadedAt: { $max: '$downloadedAt' }
        }
      },
      { $sort: { lastDownloadedAt: -1 } }
    ]);

    const populated = await Post.populate(downloads, { 
      path: '_id', 
      select: 'title slug version appLogo category isPremium averageRating',
      populate: { path: 'category', select: 'name slug' }
    });

    // Remap for easier frontend consumption
    const history = populated.map(item => ({
      post: item._id,
      downloadCount: item.downloadCount,
      lastDownloadedAt: item.lastDownloadedAt
    })).filter(item => item.post !== null); // Filter out deleted posts

    res.status(200).json({ success: true, count: history.length, data: history });
  } catch (error) {
    logger.error(`Get My Downloads Error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
