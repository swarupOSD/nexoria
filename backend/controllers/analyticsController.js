import Download from '../models/Download.js';
import Post from '../models/Post.js';
import User from '../models/User.js';
import Category from '../models/Category.js';
import AdblockLog from '../models/AdblockLog.js';
import logger from '../middlewares/logger.js';

// Helper for date ranges
const getDateNDaysAgo = (n) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
};

// @desc    Get public dashboard analytics
// @route   GET /api/analytics/dashboard
// @access  Public
export const getDashboardAnalytics = async (req, res) => {
  try {
    const totalDownloads = await Download.countDocuments();
    const mostDownloaded = await Post.find().sort({ downloads: -1 }).limit(5).select('title downloads logo featuredImage slug');
    const mostViewed = await Post.find().sort({ views: -1 }).limit(5).select('title views logo featuredImage slug');
    
    // Growth simple metrics
    const usersLast7Days = await User.countDocuments({ createdAt: { $gte: getDateNDaysAgo(7) }, role: { $nin: ['admin', 'superadmin'] } });
    const downloadsLast7Days = await Download.countDocuments({ createdAt: { $gte: getDateNDaysAgo(7) } });
    const contentLast7Days = await Post.countDocuments({ createdAt: { $gte: getDateNDaysAgo(7) } });

    res.status(200).json({
      success: true,
      data: {
        totalDownloads,
        mostDownloaded,
        mostViewed,
        growth: {
          usersLast7Days,
          downloadsLast7Days,
          contentLast7Days
        }
      }
    });
  } catch (error) {
    logger.error(`Dashboard Analytics Error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Get admin analytics
// @route   GET /api/admin/analytics
// @access  Private/Admin
export const getAdminAnalytics = async (req, res) => {
  try {
    const totalPosts = await Post.countDocuments();
    const totalCategories = await Category.countDocuments();
    const totalUsers = await User.countDocuments({ role: { $nin: ['admin', 'superadmin'] } });
    const totalDownloads = await Download.countDocuments();

    // Premium Analytics
    const totalPremiumUsers = await User.countDocuments({ isPremium: true });
    const expiredPremiumUsers = await User.countDocuments({ premiumStatus: 'Expired' });
    const lifetimePremiumUsers = await User.countDocuments({ premiumType: 'Lifetime', isPremium: true });

    // App Analytics
    const publicApps = await Post.countDocuments({ visibilityStatus: 'Public' });
    const premiumApps = await Post.countDocuments({ visibilityStatus: 'Premium Only' });
    const Report = (await import('../models/Report.js')).default;
    const totalReports = await Report.countDocuments();
    const brokenLinkReports = await Report.countDocuments({ reason: 'Broken Download Link', status: 'Pending' });

    // Download by Link Types
    // Note: In real app we'd aggregate from Post.downloadLinks clickCounts
    const posts = await Post.find().select('downloadLinks');
    let primaryDownloads = 0;
    let mirrorDownloads = 0;
    let premiumDownloads = 0;
    let activeLinksCount = 0;
    let inactiveLinksCount = 0;
    let mirrors = [];

    posts.forEach(post => {
      post.downloadLinks.forEach(link => {
        if (link.type === 'primary') primaryDownloads += link.clickCount || 0;
        if (link.type === 'mirror') {
          mirrorDownloads += link.clickCount || 0;
          mirrors.push({ label: link.label || 'Mirror', url: link.url, clicks: link.clickCount || 0 });
        }
        if (link.type === 'premium') premiumDownloads += link.clickCount || 0;
        
        if (link.isActive) activeLinksCount++;
        else inactiveLinksCount++;
      });
    });

    mirrors.sort((a, b) => b.clicks - a.clicks);
    const topMirrors = mirrors.slice(0, 5);

    // Downloads per day (last 7 days)
    const downloadsPerDay = await Download.aggregate([
      { $match: { createdAt: { $gte: getDateNDaysAgo(7) } } },
      { $group: { 
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, 
          count: { $sum: 1 } 
      }},
      { $sort: { _id: 1 } }
    ]);

    const topDownloaded = await Post.find().sort({ downloads: -1 }).limit(10).select('title downloads');
    
    // Featured & Trending Performance
    const featuredApps = await Post.find({ isFeatured: true }).select('title downloads views').sort({ downloads: -1 }).limit(5);
    const trendingAppsStats = await Post.find({ isTrending: true }).select('title downloads views').sort({ downloads: -1 }).limit(5);

    res.status(200).json({
      success: true,
      data: {
        stats: { totalPosts, totalCategories, totalUsers, totalDownloads, totalPremiumUsers, expiredPremiumUsers, lifetimePremiumUsers, publicApps, premiumApps, totalReports, brokenLinkReports },
        linkStats: { primaryDownloads, mirrorDownloads, premiumDownloads, activeLinksCount, inactiveLinksCount },
        topMirrors,
        downloadsPerDay: downloadsPerDay.map(d => ({ date: d._id, downloads: d.count })),
        topDownloaded,
        featuredApps,
        trendingAppsStats
      }
    });
  } catch (error) {
    logger.error(`Admin Analytics Error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Get superadmin analytics
// @route   GET /api/superadmin/analytics
// @access  Private/SuperAdmin
export const getSuperAdminAnalytics = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: { $nin: ['admin', 'superadmin'] } });
    const totalPosts = await Post.countDocuments();
    const totalDownloads = await Download.countDocuments();

    const Payment = (await import('../models/PremiumRequest.js')).default;
    const SubscriptionPlan = (await import('../models/PremiumPlan.js')).default;

    // Premium Stats
    const totalPremiumUsers = await User.countDocuments({ isPremium: true });
    const expiredPremiumUsers = await User.countDocuments({ premiumStatus: 'Expired' });
    const lifetimePremiumUsers = await User.countDocuments({ premiumType: 'Lifetime', isPremium: true });

    const totalRevenueAggr = await Payment.aggregate([
      { $match: { status: 'Approved' } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);
    const totalRevenue = totalRevenueAggr[0]?.total || 0;

    const pendingPayments = await Payment.countDocuments({ status: 'Pending' });

    // Premium Growth & Revenue Growth (Last 6 Months)
    const premiumRevenueGrowth = await Payment.aggregate([
      { $match: { status: 'Approved' } },
      { $group: { 
          _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } }, 
          revenue: { $sum: "$amount" },
          premiumUsers: { $sum: 1 }
      }},
      { $sort: { _id: 1 } },
      { $limit: 6 }
    ]);

    // Subscription Distribution
    const subscriptionDistributionRaw = await Payment.aggregate([
      { $match: { status: 'Approved' } },
      { $lookup: { from: 'premiumplans', localField: 'plan', foreignField: '_id', as: 'planDetails' } },
      { $unwind: "$planDetails" },
      { $group: { _id: "$planDetails.name", count: { $sum: 1 } } }
    ]);
    const subscriptionDistribution = subscriptionDistributionRaw.map(s => ({ name: s._id, value: s.count }));

    // Downloads trends over 6 months mock (could aggregate by month but let's use a simple mock for shape or real aggregate)
    const downloadTrends = await Download.aggregate([
      { $group: { 
          _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } }, 
          count: { $sum: 1 } 
      }},
      { $sort: { _id: 1 } },
      { $limit: 6 }
    ]);

    // Download Links Usage & Broken Links
    const posts = await Post.find().select('downloadLinks');
    let primaryDownloads = 0;
    let mirrorDownloads = 0;
    let premiumDownloads = 0;

    posts.forEach(post => {
      post.downloadLinks.forEach(link => {
        if (link.type === 'primary') primaryDownloads += link.clickCount || 0;
        if (link.type === 'mirror') mirrorDownloads += link.clickCount || 0;
        if (link.type === 'premium') premiumDownloads += link.clickCount || 0;
      });
    });

    const Report = (await import('../models/Report.js')).default;
    const brokenLinkReports = await Report.countDocuments({ reason: 'Broken Download Link', status: { $ne: 'resolved' } });

    const Notification = (await import('../models/Notification.js')).default;
    const UserActivity = (await import('../models/UserActivity.js')).default;
    const SecurityLog = (await import('../models/SecurityLog.js')).default;

    const totalNotifications = await Notification.countDocuments();
    const unreadNotifications = await Notification.countDocuments({ isRead: false });
    const totalActivities = await UserActivity.countDocuments();
    const securityAlerts = await SecurityLog.countDocuments();

    // User Management Stats
    const activeUsers = await User.countDocuments({ status: 'active' });
    const bannedUsers = await User.countDocuments({ status: 'banned' });
    const suspendedUsers = await User.countDocuments({ status: 'suspended' });
    const Warning = (await import('../models/Warning.js')).default;
    const warningCount = await Warning.countDocuments();

    // User Status Distribution
    const userStatusDistributionRaw = await User.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);
    const userStatusDistribution = userStatusDistributionRaw.map(s => ({ name: s._id, value: s.count }));

    // Notification Types Breakdown
    const notificationTypes = await Notification.aggregate([
      { $group: { _id: "$type", count: { $sum: 1 } } }
    ]);

    // Daily Activities (Last 7 Days)
    const dailyActivities = await UserActivity.aggregate([
      { $match: { createdAt: { $gte: getDateNDaysAgo(7) } } },
      { $group: { 
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, 
          count: { $sum: 1 } 
      }},
      { $sort: { _id: 1 } }
    ]);

    // Registrations
    const registrations = await User.aggregate([
      { $match: { createdAt: { $gte: getDateNDaysAgo(7) }, role: { $nin: ['admin', 'superadmin'] } } },
      { $group: { 
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, 
          users: { $sum: 1 } 
      }},
      { $sort: { _id: 1 } }
    ]);

    // Top Downloaded
    const topDownloaded = await Post.find().sort({ downloads: -1 }).limit(5).select('title downloads');

    // Device Usage Aggregation
    const deviceUsageRaw = await UserActivity.aggregate([
      { $group: { _id: "$deviceInfo.deviceType", count: { $sum: 1 } } }
    ]);
    const deviceUsage = deviceUsageRaw.map(d => ({ 
      name: d._id || 'Unknown', 
      value: d.count 
    }));
    if (deviceUsage.length === 0) {
      deviceUsage.push({ name: 'No Data', value: 1 });
    }

    res.status(200).json({
      success: true,
      data: {
        overview: { 
          totalUsers, totalPosts, totalDownloads, revenue: totalRevenue,
          totalPremiumUsers, expiredPremiumUsers, lifetimePremiumUsers, brokenLinkReports, pendingPayments,
          totalNotifications, unreadNotifications, totalActivities, securityAlerts,
          activeUsers, bannedUsers, suspendedUsers, warningCount
        },
        downloadSources: {
          primary: primaryDownloads,
          mirror: mirrorDownloads,
          premium: premiumDownloads
        },
        premiumGrowth: premiumRevenueGrowth.map(p => ({ month: p._id, users: p.premiumUsers, revenue: p.revenue })),
        subscriptionDistribution,
        downloadTrends: downloadTrends.map(d => ({ month: d._id, downloads: d.count })),
        notificationTypes: notificationTypes.map(n => ({ name: n._id, value: n.count })),
        dailyActivities: dailyActivities.map(a => ({ date: a._id, count: a.count })),
        userStatusDistribution,
        registrations: registrations.map(r => ({ name: r._id, users: r.users })),
        topDownloaded: topDownloaded.map(p => ({ name: p.title, downloads: p.downloads })),
        deviceUsage: deviceUsage
      }
    });
  } catch (error) {
    logger.error(`SuperAdmin Analytics Error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Track AdBlock detection
// @route   POST /api/analytics/adblock
// @access  Public
export const trackAdblockDetection = async (req, res) => {
  try {
    const { methodUsed, userAgent } = req.body;
    const ipAddress = req.ip || req.connection.remoteAddress;
    const user = req.user ? req.user._id : null;

    await AdblockLog.create({
      user,
      ipAddress,
      userAgent: userAgent || req.get('User-Agent'),
      methodUsed: methodUsed || 'unknown'
    });

    res.status(201).json({ success: true });
  } catch (error) {
    logger.error(`Track Adblock Error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Get AdBlock analytics
// @route   GET /api/analytics/adblock
// @access  Private/Admin
export const getAdblockAnalytics = async (req, res) => {
  try {
    const totalDetections = await AdblockLog.countDocuments();
    
    // Method breakdown
    const methodsBreakdown = await AdblockLog.aggregate([
      { $group: { _id: "$methodUsed", count: { $sum: 1 } } }
    ]);

    // Daily trends (last 30 days)
    const dailyTrends = await AdblockLog.aggregate([
      { $match: { createdAt: { $gte: getDateNDaysAgo(30) } } },
      { $group: { 
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, 
          count: { $sum: 1 } 
      }},
      { $sort: { _id: 1 } }
    ]);

    // Top IP offenders
    const topIPs = await AdblockLog.aggregate([
      { $group: { _id: "$ipAddress", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalDetections,
        methodsBreakdown: methodsBreakdown.map(m => ({ method: m._id, count: m.count })),
        dailyTrends: dailyTrends.map(d => ({ date: d._id, count: d.count })),
        topIPs: topIPs.map(i => ({ ip: i._id, count: i.count }))
      }
    });
  } catch (error) {
    logger.error(`Adblock Analytics Error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Get module-specific analytics (Apps, Movies, Games, Music, Tools)
// @route   GET /api/analytics/superadmin/module/:module
// @access  Private/SuperAdmin
export const getModuleAnalytics = async (req, res) => {
  try {
    const { module } = req.params;
    
    let totalViews = 0;
    let totalDownloads = 0;
    let topItems = [];
    let dailyTraffic = [];
    
    // Proportional Revenue Calculation
    const Payment = (await import('../models/PremiumRequest.js')).default;
    const totalRevenueAggr = await Payment.aggregate([
      { $match: { status: 'Approved' } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);
    const totalGlobalRevenue = totalRevenueAggr[0]?.total || 0;
    const totalGlobalDownloads = await Download.countDocuments() || 1; // Prevent division by zero

    let moduleDownloads = 0;

    if (module === 'apps' || module === 'movies' || module === 'games') {
      // For now, we will fetch generic top posts. 
      // In a real scenario, this would filter by Category linked to the module.
      // Since 'Post' model handles Apps, Movies, Games, we estimate based on the top items.
      const posts = await Post.find()
        .sort({ downloads: -1 })
        .limit(5)
        .select('title downloads views');

      posts.forEach(p => {
        totalViews += p.views || 0;
        totalDownloads += p.downloads || 0;
      });
      topItems = posts.map(p => ({ name: p.title, downloads: p.downloads, views: p.views }));
      moduleDownloads = totalDownloads; // Rough estimate for the module

    } else if (module === 'music') {
      try {
        const Track = (await import('../models/NexoriaTrack.js')).default;
        const tracks = await Track.find().sort({ playCount: -1 }).limit(5).select('title playCount');
        tracks.forEach(t => {
          totalViews += t.playCount || 0;
          totalDownloads += t.playCount || 0;
        });
        topItems = tracks.map(t => ({ name: t.title, downloads: t.playCount, views: t.playCount }));
        moduleDownloads = totalDownloads;
      } catch (e) {
        // Module might not exist yet
      }
    } else if (module === 'tools') {
      const UserActivity = (await import('../models/UserActivity.js')).default;
      const toolActivity = await UserActivity.countDocuments({ action: 'Visited Video Downloader' });
      totalViews = toolActivity;
      totalDownloads = toolActivity;
      moduleDownloads = toolActivity;
      topItems = [{ name: 'YouTube Downloader', downloads: toolActivity, views: toolActivity }];
    }

    // Calculate Estimated Revenue
    const trafficShare = moduleDownloads / totalGlobalDownloads;
    // Cap at 100% and ensure it's not NaN
    const safeShare = isNaN(trafficShare) ? 0 : Math.min(trafficShare, 1);
    const estimatedRevenue = totalGlobalRevenue * safeShare;

    // Generate Mock Daily Traffic for the last 7 days for the chart
    // In production, this would be an aggregation on Download or UserActivity
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      dailyTraffic.push({
        date: d.toISOString().split('T')[0],
        visits: Math.floor(Math.random() * (totalViews > 0 ? (totalViews / 7) + 10 : 50)),
        downloads: Math.floor(Math.random() * (totalDownloads > 0 ? (totalDownloads / 7) + 5 : 20))
      });
    }

    res.status(200).json({
      success: true,
      data: {
        module,
        totalViews,
        totalDownloads,
        estimatedRevenue: estimatedRevenue.toFixed(2),
        trafficShare: (safeShare * 100).toFixed(1),
        topItems,
        dailyTraffic
      }
    });

  } catch (error) {
    logger.error(`Module Analytics Error (${req.params.module}): ${error.message}`);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
