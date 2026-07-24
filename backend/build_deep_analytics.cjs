const fs = require('fs');
const path = require('path');

const controllerPath = path.join(__dirname, 'controllers', 'nexoriaMusicController.js');
let controllerCode = fs.readFileSync(controllerPath, 'utf8');

const deepAnalyticsCode = `
// ==========================================
// ADMIN: DEEP ANALYTICS & INSIGHTS
// ==========================================

export const getDeepAnalytics = async (req, res) => {
  try {
    // 1. Global Overview
    const totalPlays = await NexoriaUserHistory.countDocuments();
    const uniqueListenersData = await NexoriaUserHistory.aggregate([
      { $group: { _id: '$user' } },
      { $count: 'uniqueListeners' }
    ]);
    const uniqueListeners = uniqueListenersData.length > 0 ? uniqueListenersData[0].uniqueListeners : 0;

    // 2. Top Listeners (Who listens the most)
    const topListeners = await NexoriaUserHistory.aggregate([
      { $group: { _id: '$user', totalListens: { $sum: 1 } } },
      { $sort: { totalListens: -1 } },
      { $limit: 10 },
      { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'userDetails' } },
      { $unwind: '$userDetails' },
      { $project: { _id: 1, totalListens: 1, name: '$userDetails.name', email: '$userDetails.email', avatar: '$userDetails.profilePicture' } }
    ]);

    // 3. Track Repetition (Who is listening to WHICH song repeatedly)
    const repeatListeners = await NexoriaUserHistory.aggregate([
      { $group: { _id: { user: '$user', track: '$track' }, playCount: { $sum: 1 } } },
      { $match: { playCount: { $gt: 2 } } }, // Listened more than twice
      { $sort: { playCount: -1 } },
      { $limit: 20 },
      { $lookup: { from: 'users', localField: '_id.user', foreignField: '_id', as: 'userDetails' } },
      { $unwind: '$userDetails' },
      { $lookup: { from: 'nexoriatracks', localField: '_id.track', foreignField: '_id', as: 'trackDetails' } },
      { $unwind: '$trackDetails' },
      { $lookup: { from: 'nexoriaartists', localField: 'trackDetails.artist', foreignField: '_id', as: 'artistDetails' } },
      { $unwind: { path: '$artistDetails', preserveNullAndEmptyArrays: true } },
      { $project: { 
          user: { name: '$userDetails.name', avatar: '$userDetails.profilePicture' },
          track: { title: '$trackDetails.title', cover: '$trackDetails.coverImage', artist: '$artistDetails.name' },
          playCount: 1 
      }}
    ]);

    // 4. Trending Types/Moods (Grouping by Genre to see if Sad/Romantic is trending)
    const trendingTypes = await NexoriaUserHistory.aggregate([
      { $lookup: { from: 'nexoriatracks', localField: 'track', foreignField: '_id', as: 'trackDetails' } },
      { $unwind: '$trackDetails' },
      { $group: { _id: '$trackDetails.genre', plays: { $sum: 1 } } },
      { $sort: { plays: -1 } },
      { $limit: 10 },
      { $lookup: { from: 'nexoriagenres', localField: '_id', foreignField: '_id', as: 'genreDetails' } },
      { $unwind: { path: '$genreDetails', preserveNullAndEmptyArrays: true } },
      { $project: { 
          plays: 1, 
          name: '$genreDetails.name', 
          hexColor: '$genreDetails.hexColor' 
        } 
      }
    ]);
    
    // 5. Recent Live Activity
    const recentActivity = await NexoriaUserHistory.find()
      .sort({ playedAt: -1 })
      .limit(30)
      .populate('user', 'name profilePicture username')
      .populate({
        path: 'track',
        select: 'title coverImage artist genre',
        populate: [
          { path: 'artist', select: 'name image' },
          { path: 'genre', select: 'name hexColor' }
        ]
      });

    res.status(200).json({
      success: true,
      data: {
        overview: { totalPlays, uniqueListeners },
        topListeners,
        repeatListeners,
        trendingTypes,
        recentActivity
      }
    });
  } catch (error) {
    logger.error(\`Get Deep Analytics Error: \${error.message}\`);
    res.status(500).json({ success: false, message: 'Failed to fetch deep analytics' });
  }
};
`;

if (!controllerCode.includes('getDeepAnalytics')) {
  // Replace the old getAnalytics with getDeepAnalytics
  if (controllerCode.includes('export const getAnalytics = async (req, res) => {')) {
    const splitStr = 'export const getAnalytics = async (req, res) => {';
    const parts = controllerCode.split(splitStr);
    
    // Find where getAnalytics ends (rough approximation based on the structure)
    // Actually, safer to just append getDeepAnalytics to the end of the file.
    controllerCode += '\n\n' + deepAnalyticsCode;
  } else {
    controllerCode += '\n\n' + deepAnalyticsCode;
  }
  fs.writeFileSync(controllerPath, controllerCode);
}

// Update Routes
const routesPath = path.join(__dirname, 'routes', 'nexoriaMusicRoutes.js');
let routesCode = fs.readFileSync(routesPath, 'utf8');

if (!routesCode.includes('getDeepAnalytics')) {
  routesCode = routesCode.replace(
    'getAnalytics,',
    'getAnalytics,\n  getDeepAnalytics,'
  );
  
  routesCode = routesCode.replace(
    "router.route('/analytics').get(protect, authorize('admin', 'superadmin'), getAnalytics);",
    "router.route('/analytics').get(protect, authorize('admin', 'superadmin'), getAnalytics);\nrouter.route('/deep-analytics').get(protect, authorize('admin', 'superadmin'), getDeepAnalytics);"
  );
  
  fs.writeFileSync(routesPath, routesCode);
}

console.log('Deep Analytics backend deployed.');
