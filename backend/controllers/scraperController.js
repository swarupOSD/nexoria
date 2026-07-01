import gplay from 'google-play-scraper';
import asyncHandler from 'express-async-handler';

// @desc    Scrape app details from Google Play Store
// @route   POST /api/scraper/playstore
// @access  Private/Admin
export const scrapePlayStore = asyncHandler(async (req, res) => {
  const { url } = req.body;

  if (!url) {
    res.status(400);
    throw new Error('Please provide a Google Play Store URL or App ID');
  }

  try {
    // Extract appId from URL if a full URL is provided
    // e.g. https://play.google.com/store/apps/details?id=com.spotify.music
    let appId = url;
    if (url.includes('id=')) {
      appId = new URL(url).searchParams.get('id');
    }

    const appData = await gplay.app({ appId });

    res.json({
      title: appData.title,
      developer: appData.developer,
      description: appData.description,
      icon: appData.icon,
      screenshots: appData.screenshots,
      version: appData.version || 'Varies with device',
      size: appData.size || 'Varies with device',
      category: appData.genre || 'Apps',
      playStoreUrl: appData.url,
      updatedAt: appData.updated,
    });
  } catch (error) {
    res.status(404);
    throw new Error('App not found or invalid Play Store URL');
  }
});
