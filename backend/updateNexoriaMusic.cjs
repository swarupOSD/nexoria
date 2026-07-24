const fs = require('fs');
const path = require('path');

const controllerPath = path.join(__dirname, 'controllers', 'nexoriaMusicController.js');
let controllerCode = fs.readFileSync(controllerPath, 'utf8');

if (!controllerCode.includes('NexoriaMusicFavorite')) {
  // Add import
  controllerCode = controllerCode.replace(
    "import NexoriaUserHistory from '../models/NexoriaUserHistory.js';",
    "import NexoriaUserHistory from '../models/NexoriaUserHistory.js';\nimport NexoriaMusicFavorite from '../models/NexoriaMusicFavorite.js';"
  );
}

const newEndpoints = `
// ==========================================
// USER: FAVORITES & LIKES
// ==========================================

export const toggleFavorite = async (req, res) => {
  try {
    const { itemId, itemType } = req.body; // itemType: 'Track', 'Album', 'Artist'
    if (!['Track', 'Album', 'Artist'].includes(itemType)) {
      return res.status(400).json({ success: false, message: 'Invalid itemType' });
    }

    const itemModelMap = {
      'Track': 'NexoriaTrack',
      'Album': 'NexoriaAlbum',
      'Artist': 'NexoriaArtist'
    };

    const existing = await NexoriaMusicFavorite.findOne({
      user: req.user._id,
      itemId,
      itemType
    });

    if (existing) {
      await existing.deleteOne();
      return res.status(200).json({ success: true, message: \`\${itemType} removed from favorites\`, isFavorite: false });
    } else {
      await NexoriaMusicFavorite.create({
        user: req.user._id,
        itemId,
        itemType,
        itemModel: itemModelMap[itemType]
      });
      return res.status(200).json({ success: true, message: \`\${itemType} added to favorites\`, isFavorite: true });
    }
  } catch (error) {
    logger.error(\`Toggle Favorite Error: \${error.message}\`);
    res.status(500).json({ success: false, message: 'Failed to toggle favorite' });
  }
};

export const getFavorites = async (req, res) => {
  try {
    const { type } = req.query; // optional: filter by type
    let query = { user: req.user._id };
    if (type) query.itemType = type;

    const favorites = await NexoriaMusicFavorite.find(query)
      .populate({
        path: 'itemId',
        populate: [
          { path: 'artist', select: 'name image' },
          { path: 'album', select: 'title coverImage' }
        ]
      })
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: favorites });
  } catch (error) {
    logger.error(\`Get Favorites Error: \${error.message}\`);
    res.status(500).json({ success: false, message: 'Failed to get favorites' });
  }
};

// ==========================================
// USER: ADVANCED ALGORITHMIC SHELVES
// ==========================================

export const getDiscoverWeekly = async (req, res) => {
  try {
    // A more advanced discovery: find tracks in genres user likes, but excluding artists they already listen to.
    const favorites = await NexoriaMusicFavorite.find({ user: req.user._id, itemType: 'Track' }).populate('itemId');
    const history = await NexoriaUserHistory.find({ user: req.user._id }).sort({ playedAt: -1 }).limit(50).populate('track');
    
    let knownArtists = new Set();
    let knownTracks = new Set();
    let genrePreferences = {};

    favorites.forEach(fav => {
      if (fav.itemId) {
        knownTracks.add(fav.itemId._id.toString());
        if (fav.itemId.artist) knownArtists.add(fav.itemId.artist.toString());
        if (fav.itemId.genre) {
          const gId = fav.itemId.genre.toString();
          genrePreferences[gId] = (genrePreferences[gId] || 0) + 2; // Favorites weigh more
        }
      }
    });

    history.forEach(item => {
      if (item.track) {
        knownTracks.add(item.track._id.toString());
        if (item.track.artist) knownArtists.add(item.track.artist.toString());
        if (item.track.genre) {
          const gId = item.track.genre.toString();
          genrePreferences[gId] = (genrePreferences[gId] || 0) + 1;
        }
      }
    });

    // Sort genres by preference
    const topGenres = Object.entries(genrePreferences)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(g => g[0]);

    let discoverQuery = { _id: { $nin: Array.from(knownTracks) } };
    
    if (topGenres.length > 0) {
      // Find tracks in their top genres, preferably from artists they HAVEN'T heavily listened to
      discoverQuery.genre = { $in: topGenres };
      discoverQuery.artist = { $nin: Array.from(knownArtists) };
    }

    let discoverTracks = await NexoriaTrack.find(discoverQuery)
      .sort({ playCount: -1 })
      .limit(20)
      .populate('artist', 'name image')
      .populate('album', 'title coverImage');
      
    // Fallback if not enough discovered tracks
    if (discoverTracks.length < 15) {
        const backfillQuery = { _id: { $nin: Array.from(knownTracks).concat(discoverTracks.map(t=>t._id.toString())) } };
        const backfill = await NexoriaTrack.find(backfillQuery).sort({ playCount: -1 }).limit(20 - discoverTracks.length).populate('artist', 'name image').populate('album', 'title coverImage');
        discoverTracks.push(...backfill);
    }

    res.status(200).json({ success: true, data: discoverTracks, name: "Discover Weekly", description: "New music based on your taste." });
  } catch (error) {
    logger.error(\`Get Discover Weekly Error: \${error.message}\`);
    res.status(500).json({ success: false, message: 'Failed to generate Discover Weekly' });
  }
};

export const getReleaseRadar = async (req, res) => {
  try {
    // Release radar: Latest tracks from followed artists or heavily played artists
    const followedArtists = await NexoriaMusicFavorite.find({ user: req.user._id, itemType: 'Artist' });
    const history = await NexoriaUserHistory.find({ user: req.user._id }).sort({ playedAt: -1 }).limit(100).populate('track');
    
    let targetArtists = new Set(followedArtists.map(f => f.itemId.toString()));
    
    history.forEach(item => {
        if (item.track && item.track.artist) targetArtists.add(item.track.artist.toString());
    });

    const recentTracks = await NexoriaTrack.find({
        artist: { $in: Array.from(targetArtists) }
    })
    .sort({ createdAt: -1 })
    .limit(20)
    .populate('artist', 'name image')
    .populate('album', 'title coverImage');

    // Fallback
    if (recentTracks.length < 10) {
        const backfill = await NexoriaTrack.find({ _id: { $nin: recentTracks.map(t=>t._id) } })
            .sort({ createdAt: -1 })
            .limit(20 - recentTracks.length)
            .populate('artist', 'name image')
            .populate('album', 'title coverImage');
        recentTracks.push(...backfill);
    }

    res.status(200).json({ success: true, data: recentTracks, name: "Release Radar", description: "Catch up on the latest releases from artists you listen to." });
  } catch (error) {
    logger.error(\`Get Release Radar Error: \${error.message}\`);
    res.status(500).json({ success: false, message: 'Failed to generate Release Radar' });
  }
};

export const getDailyMix = async (req, res) => {
  try {
    // Daily Mix: Grouping by top 3 distinct genres in history
    const history = await NexoriaUserHistory.find({ user: req.user._id }).sort({ playedAt: -1 }).limit(100).populate('track');
    let genreCounts = {};
    history.forEach(item => {
        if (item.track && item.track.genre) {
            const g = item.track.genre.toString();
            genreCounts[g] = (genreCounts[g] || 0) + 1;
        }
    });

    const topGenres = Object.entries(genreCounts).sort((a, b) => b[1] - a[1]).slice(0, 3).map(g => g[0]);
    
    let mixes = [];
    let mixCount = 1;
    
    for (const genreId of topGenres) {
        const tracks = await NexoriaTrack.find({ genre: genreId })
            .sort({ playCount: -1 }) // Or mix of random/playcount
            .limit(15)
            .populate('artist', 'name image')
            .populate('album', 'title coverImage');
            
        if (tracks.length > 5) {
            mixes.push({
                id: \`daily-mix-\${mixCount}\`,
                name: \`Daily Mix \${mixCount}\`,
                description: \`A mix of your favorite \${tracks[0].genre ? "styles" : "tracks"}\`,
                tracks
            });
            mixCount++;
        }
    }

    res.status(200).json({ success: true, data: mixes });
  } catch (error) {
    logger.error(\`Get Daily Mix Error: \${error.message}\`);
    res.status(500).json({ success: false, message: 'Failed to generate Daily Mixes' });
  }
};
`;

if (!controllerCode.includes('toggleFavorite')) {
    // insert right before getAnalytics or at the end
    if (controllerCode.includes('// ADMIN: ANALYTICS & INSIGHTS')) {
        controllerCode = controllerCode.replace(
            '// ==========================================\n// ADMIN: ANALYTICS & INSIGHTS',
            newEndpoints + '\n\n// ==========================================\n// ADMIN: ANALYTICS & INSIGHTS'
        );
    } else {
        controllerCode += '\n' + newEndpoints;
    }
}

// Modify recommendations to be slightly smarter based on favorites
if (controllerCode.includes('export const getRecommendations = async (req, res) => {') && !controllerCode.includes('const favorites = await NexoriaMusicFavorite.find({ user: req.user._id, itemType: \\\'Track\\\' }).populate(\\\'itemId\\\');')) {
    // We will leave getRecommendations as a generic 'Recommended for you' endpoint
}

fs.writeFileSync(controllerPath, controllerCode);

// Update Routes
const routesPath = path.join(__dirname, 'routes', 'nexoriaMusicRoutes.js');
let routesCode = fs.readFileSync(routesPath, 'utf8');

if (!routesCode.includes('toggleFavorite')) {
    routesCode = routesCode.replace(
        "getAnalytics\n} from '../controllers/nexoriaMusicController.js';",
        "getAnalytics,\n  toggleFavorite,\n  getFavorites,\n  getDiscoverWeekly,\n  getReleaseRadar,\n  getDailyMix\n} from '../controllers/nexoriaMusicController.js';"
    );
    
    routesCode = routesCode.replace(
        "router.route('/analytics').get(protect, authorize('admin', 'superadmin'), getAnalytics);",
        "router.route('/analytics').get(protect, authorize('admin', 'superadmin'), getAnalytics);\n\nrouter.route('/favorites').get(protect, getFavorites);\nrouter.route('/favorites/toggle').post(protect, toggleFavorite);\nrouter.route('/discover-weekly').get(protect, getDiscoverWeekly);\nrouter.route('/release-radar').get(protect, getReleaseRadar);\nrouter.route('/daily-mix').get(protect, getDailyMix);"
    );
    
    fs.writeFileSync(routesPath, routesCode);
}

console.log('Backend endpoints updated successfully.');
