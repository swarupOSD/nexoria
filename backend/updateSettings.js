import mongoose from 'mongoose';
import dotenv from 'dotenv';
import SiteSettings from './models/SiteSettings.js';

dotenv.config();

async function updateDb() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB');
    
    let settings = await SiteSettings.findOne();
    if (!settings) settings = new SiteSettings();
    
    settings.siteName = 'Nexoria';
    settings.metaTitle = 'Nexoria – Movies, K-Dramas, Anime, Games, Music & Premium Apps | All In One';
    settings.metaDescription = 'Nexoria unites movies, K-Dramas, anime, mobile & kids games, music, editing tools and premium apps in one futuristic platform. Explore now.';
    settings.footerText = 'Nexoria — Your Entertainment Universe.';
    settings.aboutUsText = 'Welcome to Nexoria, the digital ecosystem built for everyone who loves to watch, play, and create. We bring together blockbuster movies, trending K-Dramas, top anime series, mobile and kids games, premium apps, music, and powerful editing tools — all under one platform. No more switching between ten different apps. Nexoria is where your entertainment world lives.';
    settings.contactEmail = 'hello@nexoria.com';
    settings.supportEmail = 'support@nexoria.com';
    settings.businessEmail = 'hello@nexoria.com';
    settings.legalEmail = 'legal@nexoria.com';
    
    if (!settings.socialLinks) settings.socialLinks = {};
    settings.socialLinks.facebook = 'https://facebook.com/nexoriaofficial';
    settings.socialLinks.instagram = 'https://instagram.com/nexoria';
    settings.socialLinks.youtube = 'https://youtube.com/@nexoria';
    settings.socialLinks.whatsapp = 'Nexoria';
    
    settings.theme = 'royal-purple';
    
    await settings.save();
    console.log('Settings updated successfully in DB!');
    process.exit(0);
  } catch(e) {
    console.error(e);
    process.exit(1);
  }
}

updateDb();
