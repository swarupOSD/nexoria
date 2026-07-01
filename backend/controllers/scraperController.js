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
    let title = '';
    let artist = '';
    let image = '';
    let description = '';

    // Check if it's a YouTube URL
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;
      const { data } = await axios.get(oembedUrl);
      
      title = data.title || '';
      artist = data.author_name || '';
      image = data.thumbnail_url || '';
      description = title; // YouTube oembed doesn't provide desc, use title

      // Attempt to split "Artist - Song Name"
      if (title.includes(' - ')) {
        const parts = title.split(' - ');
        artist = parts[0].trim();
        title = parts[1].trim();
      }
    } else {
      // Fallback for other URLs like Spotify
      const { data } = await axios.get(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
      });
      
      const titleMatch = data.match(/<meta property="og:title" content="([^"]+)"/i) || data.match(/<title>([^<]+)<\/title>/i);
      const imageMatch = data.match(/<meta property="og:image" content="([^"]+)"/i);
      const descMatch = data.match(/<meta property="og:description" content="([^"]+)"/i);
      
      title = titleMatch ? titleMatch[1].replace(/&quot;/g, '"').replace(/&amp;/g, '&') : '';
      image = imageMatch ? imageMatch[1] : '';
      description = descMatch ? descMatch[1].replace(/&quot;/g, '"').replace(/&amp;/g, '&') : '';
      
      if (title.includes(' - ')) {
        const parts = title.split(' - ');
        artist = parts[0].trim();
        title = parts[1].trim();
      } else {
        artist = 'Unknown Artist';
      }
    }
    
    res.json({
      title,
      artist,
      image,
      description,
    });
  } catch (error) {
    console.error('Music Scraper Error:', error.message);
    res.status(404);
    throw new Error('Could not fetch music details. Ensure the URL is valid and public.');
  }
});
