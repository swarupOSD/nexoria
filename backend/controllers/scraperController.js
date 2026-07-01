import gplay from 'google-play-scraper';
import asyncHandler from 'express-async-handler';
import axios from 'axios';

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

// @desc    Scrape music details from YouTube or Spotify
// @route   POST /api/scraper/music
// @access  Private/Admin
export const scrapeMusic = asyncHandler(async (req, res) => {
  const { url } = req.body;

  if (!url) {
    res.status(400);
    throw new Error('Please provide a valid YouTube or Music URL');
  }

  try {
    const { data } = await axios.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
    });
    
    // Extract og tags using regex
    const titleMatch = data.match(/<meta property="og:title" content="([^"]+)"/i) || data.match(/<title>([^<]+)<\/title>/i);
    const imageMatch = data.match(/<meta property="og:image" content="([^"]+)"/i);
    const descMatch = data.match(/<meta property="og:description" content="([^"]+)"/i);
    
    let title = titleMatch ? titleMatch[1].replace(/&quot;/g, '"').replace(/&amp;/g, '&') : '';
    let artist = '';
    
    // If YouTube video, remove " - YouTube" suffix
    title = title.replace(/ - YouTube$/i, '');
    
    // Attempt to split "Artist - Song Name"
    if (title.includes(' - ')) {
      const parts = title.split(' - ');
      artist = parts[0].trim();
      title = parts[1].trim();
    } else {
      artist = 'Unknown Artist';
    }
    
    res.json({
      title,
      artist,
      image: imageMatch ? imageMatch[1] : '',
      description: descMatch ? descMatch[1].replace(/&quot;/g, '"').replace(/&amp;/g, '&') : '',
    });
  } catch (error) {
    res.status(404);
    throw new Error('Could not fetch music details. Ensure the URL is public.');
  }
});
