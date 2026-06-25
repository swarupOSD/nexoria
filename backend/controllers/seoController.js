import Post from '../models/Post.js';
import Category from '../models/Category.js';
import logger from '../middlewares/logger.js';

// @desc    Generate robots.txt
// @route   GET /robots.txt
// @access  Public
export const getRobotsTxt = (req, res) => {
  const robotsTxt = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /superadmin

Sitemap: ${process.env.FRONTEND_URL || 'http://localhost:5173'}/api/seo/sitemap.xml
`;
  res.type('text/plain');
  res.send(robotsTxt);
};

// @desc    Generate sitemap.xml
// @route   GET /api/seo/sitemap.xml
// @access  Public
export const generateSitemap = async (req, res) => {
  try {
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    
    const posts = await Post.find({ isPublished: true }).select('slug updateDate createdAt');
    const categories = await Category.find().select('slug');

    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;

    // Static pages
    const staticPages = [
      { url: '/', priority: 1.0 },
      { url: '/contact', priority: 0.8 },
      { url: '/legal/privacy-policy', priority: 0.5 },
      { url: '/legal/terms', priority: 0.5 },
      { url: '/legal/dmca', priority: 0.5 },
      { url: '/legal/about', priority: 0.6 },
      { url: '/legal/sitemap', priority: 0.8 },
    ];

    staticPages.forEach(page => {
      sitemap += `  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>${page.priority}</priority>
  </url>\n`;
    });

    // Categories
    categories.forEach(cat => {
      sitemap += `  <url>
    <loc>${baseUrl}/category/${cat.slug}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>\n`;
    });

    // Posts
    posts.forEach(post => {
      sitemap += `  <url>
    <loc>${baseUrl}/post/${post.slug}</loc>
    <lastmod>${new Date(post.updateDate || post.createdAt).toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>\n`;
    });

    sitemap += `</urlset>`;

    res.header('Content-Type', 'application/xml');
    res.send(sitemap);
  } catch (error) {
    logger.error(`Sitemap Error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
