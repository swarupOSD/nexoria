import mongoose from 'mongoose';

const siteSettingsSchema = new mongoose.Schema(
  {
    siteName: { type: String, default: 'Premium Apps' },
    logo: { type: String, default: '/logo.png' },
    favicon: { type: String, default: '/favicon.ico' },
    metaTitle: { type: String, default: 'Premium Apps - Download Mods' },
    metaDescription: { type: String, default: 'Download premium apps and games.' },
    heroBackground: { type: String, default: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop' },
    keywords: {
      type: String,
      default: 'premium apps, mods, games',
    },
    defaultOgImage: {
      type: String,
      default: '',
    },
    contactEmail: { type: String, default: 'contact@example.com' },
    supportEmail: { type: String, default: 'support@example.com' },
    businessEmail: { type: String, default: 'business@example.com' },
    legalEmail: { type: String, default: 'legal@example.com' },
    aboutUsText: { type: String, default: 'We are a premium platform dedicated to providing the best mods and applications safely.' },
    footerText: { type: String, default: 'Premium Apps is your ultimate destination for top-tier modified applications.' },
    copyrightText: { type: String, default: 'All Rights Reserved.' },
    tagline: { type: String, default: '' },
    phoneNumber: { type: String, default: '' },
    whatsappNumber: { type: String, default: '' },
    officeAddress: { type: String, default: '' },
    workingHours: { type: String, default: '' },
    googleMapsLink: { type: String, default: '' },
    theme: { type: String, default: 'royal-purple' },
    ownerDp: { type: String, default: '' },
    maintenanceMode: { type: Boolean, default: false },
    defaultCurrency: { type: String, default: 'INR' },
    currencySymbol: { type: String, default: '₹' },
    socialLinks: {
      facebook: String,
      twitter: String,
      instagram: String,
      youtube: String,
      discord: String,
      telegram: String,
      whatsapp: String,
      linkedin: String,
      github: String
    },
    disabledSocialLinks: { type: [String], default: [] },
    newsletter: {
      title: { type: String, default: 'Join the Premium Community' },
      description: { type: String, default: 'Get exclusive updates, early access to premium mods, and weekly newsletters delivered directly to your inbox.' },
      successMessage: { type: String, default: 'Thanks for subscribing!' },
      enabled: { type: Boolean, default: true },
      subscribersCount: { type: Number, default: 0 }
    },
    footerDesign: {
      theme: { type: String, default: 'dark' },
      darkColors: { type: String, default: '#030303' },
      lightColors: { type: String, default: '#f8fafc' },
      gradientColors: { type: String, default: 'from-primary/10 to-accent/10' },
      backgroundImage: { type: String, default: '' },
      glassIntensity: { type: String, default: 'backdrop-blur-2xl' },
      animationEnabled: { type: Boolean, default: true }
    },
    ads: {
      enabled: { type: Boolean, default: true },
      timerSeconds: { type: Number, default: 30 },
      downloadClicks: { type: Number, default: 2 },
      adNetworks: [{ name: String, code: String, active: Boolean }]
    },
    security: {
      underAttackMode: { type: Boolean, default: false },
      bannedIps: [{ type: String }]
    },
    uiTheme: {
      primaryColor: { type: String, default: '#8B5CF6' },
      cyberpunkEffects: { type: Boolean, default: true }
    },
    quickLinks: [
      {
        label: { type: String },
        url: { type: String }
      }
    ],
    offerwallSettings: {
      enabled: { type: Boolean, default: false },
      offerwallUrl: { type: String, default: '' },
      secretKey: { type: String, default: '' }
    },
    paymentSettings: {
      upiId: { type: String, default: '' },
      upiQrUrl: { type: String, default: '' },
      bankDetails: { type: String, default: '' },
      cryptoWallets: { type: String, default: '' },
      paymentInstructions: { type: String, default: 'Please transfer the amount and upload the screenshot.' }
    },
    authSettings: {
      captchaEnabled: { type: Boolean, default: true },
      captchaDifficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'easy' },
      captchaRefreshCount: { type: Number, default: 3 }
    },
    nexoriaMusicSettings: {
      uploadsEnabled: { type: Boolean, default: true },
      downloadsEnabled: { type: Boolean, default: true },
      streamingEnabled: { type: Boolean, default: true },
      recommendationsEnabled: { type: Boolean, default: true },
      lyricsEnabled: { type: Boolean, default: true }
    },
    underDevelopmentModules: {
      apps: { type: Boolean, default: false },
      games: { type: Boolean, default: false },
      movies: { type: Boolean, default: false },
      music: { type: Boolean, default: false },
      arena: { type: Boolean, default: false },
      vipLounge: { type: Boolean, default: false },
      classicSound: { type: Boolean, default: false }
    },
    updatedBy: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

const SiteSettings = mongoose.model('SiteSettings', siteSettingsSchema);
export default SiteSettings;
