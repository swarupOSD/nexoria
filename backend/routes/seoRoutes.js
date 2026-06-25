import express from 'express';
import { generateSitemap, getRobotsTxt } from '../controllers/seoController.js';

const router = express.Router();

router.get('/api/seo/sitemap.xml', generateSitemap);
router.get('/robots.txt', getRobotsTxt);

export default router;
