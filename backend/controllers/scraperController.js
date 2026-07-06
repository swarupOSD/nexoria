import gplay from 'google-play-scraper';
import asyncHandler from 'express-async-handler';
import axios from 'axios';
import * as cheerio from 'cheerio';

// @desc    Scrape app details from Google Play Store or any URL
// @route   POST /api/scraper/playstore
// @access  Private/Admin
export const scrapePlayStore = asyncHandler(async (req, res) => {
  const { url } = req.body;

  if (!url) {
    res.status(400);
    throw new Error('Please provide a valid App URL');
  }

  try {
    // If it's a play store URL, use gplay
    if (url.includes('play.google.com')) {
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
    } else if (url.includes('getmodsapk.com')) {
      const { data } = await axios.get(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' }
      });
      
      const $ = cheerio.load(data);
      
      const title = $('h1').first().text().trim() || $('meta[property="og:title"]').attr('content') || '';
      let cleanTitle = title.replace(/MOD APK.*?$/, '').trim(); // Remove "MOD APK v1.2..." from title if present
      
      const description = $('meta[property="og:description"]').attr('content') || $('meta[name="description"]').attr('content') || '';
      let icon = $('meta[property="og:image"]').attr('content') || $('img.app-icon, img.icon, .app-img img').attr('src') || '';
      
      // Resolve absolute URLs for images
      if (icon && !icon.startsWith('http')) {
        const urlObj = new URL(url);
        icon = `${urlObj.protocol}//${urlObj.host}${icon.startsWith('/') ? '' : '/'}${icon}`;
      }

      let version = 'Varies';
      let size = 'Varies';
      let category = 'Apps';
      
      // Heuristic extraction for version and size from typical tables/lists
      $('th, td, span, div, li, dt, dd').each((i, el) => {
        const text = $(el).text().toLowerCase().trim();
        if (text === 'version' || text.includes('latest version')) {
          const val = $(el).next().text().trim() || $(el).parent().find('td, dd, span').last().text().trim();
          if (val && val.length < 20) version = val;
        }
        if (text === 'size' || text.includes('app size')) {
          const val = $(el).next().text().trim() || $(el).parent().find('td, dd, span').last().text().trim();
          if (val && val.length < 20) size = val;
        }
        if (text === 'category' || text === 'genre') {
          const val = $(el).next().text().trim() || $(el).parent().find('td, dd, span').last().text().trim();
          if (val && val.length < 30) category = val;
        }
      });
      
      res.json({
        title: cleanTitle || 'Unknown App',
        developer: 'GetModsApk',
        description,
        icon,
        screenshots: icon ? [icon] : [],
        version,
        size,
        category,
        playStoreUrl: url,
        updatedAt: new Date().toISOString(),
      });
    } else {
      // Fallback universal scraper using cheerio
      const { data } = await axios.get(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' }
      });
      
      const $ = cheerio.load(data);
      
      const title = $('meta[property="og:title"]').attr('content') || $('title').text() || '';
      const description = $('meta[property="og:description"]').attr('content') || $('meta[name="description"]').attr('content') || '';
      const icon = $('meta[property="og:image"]').attr('content') || $('link[rel="icon"]').attr('href') || $('link[rel="shortcut icon"]').attr('href') || '';
      const developer = $('meta[property="og:site_name"]').attr('content') || new URL(url).hostname;
      const embedUrl = $('meta[property="og:video:url"]').attr('content') || $('meta[property="twitter:player"]').attr('content') || $('iframe').first().attr('src') || '';
      
      // Attempt to resolve absolute URLs for images
      let finalIcon = icon;
      if (icon && !icon.startsWith('http')) {
        const urlObj = new URL(url);
        finalIcon = `${urlObj.protocol}//${urlObj.host}${icon.startsWith('/') ? '' : '/'}${icon}`;
      }
      
      res.json({
        title: title,
        developer: developer,
        description: description,
        icon: finalIcon,
        embedUrl: embedUrl,
        screenshots: finalIcon ? [finalIcon] : [],
        version: '1.0.0',
        size: 'Varies',
        category: 'Apps',
        playStoreUrl: url,
        updatedAt: new Date().toISOString(),
      });
    }
  } catch (error) {
    console.error('Universal App Scraper Error:', error.message);
    res.status(404);
    throw new Error('Could not fetch app details. Ensure the URL is valid and public.', { cause: error });
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
      // Universal scraper using cheerio
      const { data } = await axios.get(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' }
      });
      
      const $ = cheerio.load(data);
      
      title = $('meta[property="og:title"]').attr('content') || $('title').text() || '';
      image = $('meta[property="og:image"]').attr('content') || '';
      description = $('meta[property="og:description"]').attr('content') || $('meta[name="description"]').attr('content') || '';
      
      // Resolve absolute image URL
      if (image && !image.startsWith('http')) {
        const urlObj = new URL(url);
        image = `${urlObj.protocol}//${urlObj.host}${image.startsWith('/') ? '' : '/'}${image}`;
      }
      
      if (title.includes(' - ')) {
        const parts = title.split(' - ');
        artist = parts[0].trim();
        title = parts[1].trim();
      } else {
        artist = $('meta[property="og:site_name"]').attr('content') || 'Unknown Artist';
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
    throw new Error('Could not fetch music details. Ensure the URL is valid and public.', { cause: error });
  }
});
