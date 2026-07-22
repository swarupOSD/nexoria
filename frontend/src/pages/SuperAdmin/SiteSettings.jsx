import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Save, Image as ImageIcon, Globe, Type, Mail, Settings as SettingsIcon, Plus, Trash2, ArrowUp, ArrowDown, Link as LinkIcon, Lock , LayoutTemplate } from 'lucide-react';
import { useGetSettingsQuery, useUpdateSettingsMutation } from '../../features/settings/settingsApiSlice';
import ImageUpload from '../../components/ImageUpload';
import { toast } from 'react-hot-toast';
import BackButton from '../../components/BackButton';

const SiteSettings = () => {
  const navigate = useNavigate();
  const { data: settingsRes, isLoading } = useGetSettingsQuery();
  const [updateSettings, { isLoading: isUpdating }] = useUpdateSettingsMutation();

  const [formData, setFormData] = useState({
    siteName: '',
    logo: '',
    favicon: '',
    metaTitle: '',
    metaDescription: '',
    keywords: '',
    defaultOgImage: '',
    heroBackground: '',
    contactEmail: '',
    supportEmail: '',
    businessEmail: '',
    legalEmail: '',
    aboutUsText: '',
    footerText: '',
    copyrightText: '',
    theme: 'royal-purple',
    ownerDp: '',
    maintenanceMode: false,
    socialLinks: { facebook: '', twitter: '', instagram: '', youtube: '', discord: '', telegram: '', whatsapp: '' },
    quickLinks: [{ label: '', url: '' }],
    authSettings: {
      captchaEnabled: true,
      captchaDifficulty: 'easy',
      captchaRefreshCount: 3
    },
    uiTheme: {
      primaryColor: '#7C3AED',
      cyberpunkEffects: true,
    },
    ads: {
      enabled: true,
      timerSeconds: 30,
      downloadClicks: 2,
      socialBarScript: '',
      smartlinkUrl: '',
      globalDownloadUrl: ''
    },
    offerwallSettings: {
      enabled: false,
      offerwallUrl: '',
      secretKey: ''
    },
    nexoriaMusicSettings: {
      uploadsEnabled: true,
      downloadsEnabled: true,
      streamingEnabled: true,
      recommendationsEnabled: true,
      lyricsEnabled: true
    },
    underDevelopmentModules: {
      apps: false,
      games: false,
      movies: false,
      music: false,
      arena: false,
      vipLounge: false,
      classicSound: false,
      ytDownloader: false
    }
  });

  useEffect(() => {
    if (settingsRes?.data) {
      setFormData({
        siteName: settingsRes.data.siteName || '',
        logo: settingsRes.data.logo || '',
        favicon: settingsRes.data.favicon || '',
        metaTitle: settingsRes.data.metaTitle || '',
        metaDescription: settingsRes.data.metaDescription || '',
        keywords: settingsRes.data.keywords || '',
        defaultOgImage: settingsRes.data.defaultOgImage || '',
        heroBackground: settingsRes.data.heroBackground || '',
        contactEmail: settingsRes.data.contactEmail || '',
        supportEmail: settingsRes.data.supportEmail || '',
        businessEmail: settingsRes.data.businessEmail || '',
        legalEmail: settingsRes.data.legalEmail || '',
        aboutUsText: settingsRes.data.aboutUsText || '',
        footerText: settingsRes.data.footerText || '',
        copyrightText: settingsRes.data.copyrightText || '',
        theme: settingsRes.data.theme || 'royal-purple',
        ownerDp: settingsRes.data.ownerDp || '',
        maintenanceMode: settingsRes.data.maintenanceMode || false,
        paymentSettings: {
          upiId: settingsRes.data.paymentSettings?.upiId || '',
          upiQrUrl: settingsRes.data.paymentSettings?.upiQrUrl || '',
          bankDetails: settingsRes.data.paymentSettings?.bankDetails || '',
          cryptoWallets: settingsRes.data.paymentSettings?.cryptoWallets || '',
          paymentInstructions: settingsRes.data.paymentSettings?.paymentInstructions || 'Please transfer the amount and upload the screenshot.'
        },
        socialLinks: {
          facebook: settingsRes.data.socialLinks?.facebook || '',
          twitter: settingsRes.data.socialLinks?.twitter || '',
          instagram: settingsRes.data.socialLinks?.instagram || '',
          youtube: settingsRes.data.socialLinks?.youtube || '',
          discord: settingsRes.data.socialLinks?.discord || '',
          telegram: settingsRes.data.socialLinks?.telegram || '',
          whatsapp: settingsRes.data.socialLinks?.whatsapp || '',
        },
        quickLinks: settingsRes.data.quickLinks?.length > 0 ? settingsRes.data.quickLinks : [{ label: 'Home', url: '/' }],
        authSettings: {
          captchaEnabled: settingsRes.data.authSettings?.captchaEnabled ?? true,
          captchaDifficulty: settingsRes.data.authSettings?.captchaDifficulty || 'easy',
          captchaRefreshCount: settingsRes.data.authSettings?.captchaRefreshCount || 3
        },
        uiTheme: {
          primaryColor: settingsRes.data.uiTheme?.primaryColor || '#7C3AED',
          cyberpunkEffects: settingsRes.data.uiTheme?.cyberpunkEffects ?? true,
        },
        ads: {
          enabled: settingsRes.data.ads?.enabled ?? true,
          timerSeconds: settingsRes.data.ads?.timerSeconds || 30,
          downloadClicks: settingsRes.data.ads?.downloadClicks || 2,
          socialBarScript: settingsRes.data.ads?.socialBarScript || '',
          smartlinkUrl: settingsRes.data.ads?.smartlinkUrl || '',
          globalDownloadUrl: settingsRes.data.ads?.globalDownloadUrl || ''
        },
        offerwallSettings: {
          enabled: settingsRes.data.offerwallSettings?.enabled ?? false,
          offerwallUrl: settingsRes.data.offerwallSettings?.offerwallUrl || '',
          secretKey: settingsRes.data.offerwallSettings?.secretKey || ''
        },
        nexoriaMusicSettings: {
          uploadsEnabled: settingsRes.data.nexoriaMusicSettings?.uploadsEnabled ?? true,
          downloadsEnabled: settingsRes.data.nexoriaMusicSettings?.downloadsEnabled ?? true,
          streamingEnabled: settingsRes.data.nexoriaMusicSettings?.streamingEnabled ?? true,
          recommendationsEnabled: settingsRes.data.nexoriaMusicSettings?.recommendationsEnabled ?? true,
          lyricsEnabled: settingsRes.data.nexoriaMusicSettings?.lyricsEnabled ?? true
        },
        underDevelopmentModules: {
          apps: settingsRes.data.underDevelopmentModules?.apps ?? false,
          games: settingsRes.data.underDevelopmentModules?.games ?? false,
          movies: settingsRes.data.underDevelopmentModules?.movies ?? false,
          music: settingsRes.data.underDevelopmentModules?.music ?? false,
          arena: settingsRes.data.underDevelopmentModules?.arena ?? false,
          vipLounge: settingsRes.data.underDevelopmentModules?.vipLounge ?? false,
          classicSound: settingsRes.data.underDevelopmentModules?.classicSound ?? false,
          ytDownloader: settingsRes.data.underDevelopmentModules?.ytDownloader ?? false,
        }
      });
    }
  }, [settingsRes]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.startsWith('social_')) {
      const socialKey = name.split('_')[1];
      setFormData({ ...formData, socialLinks: { ...formData.socialLinks, [socialKey]: value } });
    } else {
      setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
    }
  };

  const handleSave = async (preventRedirect = false) => {
    try {
      await updateSettings(formData).unwrap();
      toast.success(preventRedirect ? 'Changes applied successfully' : 'Settings updated successfully');
      if (!preventRedirect) {
        setTimeout(() => navigate('/superadmin'), 1000);
      }
    } catch (err) {
      toast.error(err?.data?.message || 'Error updating settings');
    }
  };

  if (isLoading) return <div className="text-center mt-20">Loading settings...</div>;
  return (
    <div className="space-y-6 pb-20">
      <Helmet>
        <title>Site Settings - Super Admin</title>
      </Helmet>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="flex items-center gap-3">
          <BackButton fallbackRoute="/superadmin" showText={false} />
          <div>
            <h1 className="text-2xl font-bold dark:text-white flex items-center gap-2">
              <LayoutTemplate className="w-6 h-6 text-primary" />
              Site Settings
            </h1>
            <p className="text-slate-500 text-sm mt-1">Configure global application details and preferences.</p>
          </div>
        </div>
      </div>
        <div className="flex flex-wrap gap-3 mt-4 sm:mt-0">
          <button 
            type="button"
            disabled={isUpdating}
            onClick={() => navigate('/superadmin')}
            className="px-4 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm font-semibold rounded-xl transition"
          >
            Cancel
          </button>
          <button 
            type="button"
            disabled={isUpdating}
            onClick={() => handleSave(true)}
            className="px-4 py-2 bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-800 text-blue-700 dark:text-blue-400 text-sm font-semibold rounded-xl flex items-center gap-2 transition"
          >
            Apply Changes
          </button>
          <button 
            type="button"
            disabled={isUpdating} 
            onClick={() => handleSave(false)} 
            className="premium-btn w-max disabled:opacity-50"
          >
            <Save className="w-5 h-5" /> Save & Close
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* General Settings */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 border border-slate-200 dark:border-night-border">
          <div className="flex items-center gap-2 border-b border-slate-200 dark:border-night-border pb-4 mb-6">
            <Globe className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold dark:text-white">General Settings</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2 dark:text-slate-300">Website Name</label>
              <input type="text" name="siteName" value={formData.siteName} onChange={handleChange} className="premium-input w-full" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2 dark:text-slate-300">Contact Email</label>
              <input type="email" name="contactEmail" value={formData.contactEmail} onChange={handleChange} className="premium-input w-full" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2 dark:text-slate-300">Support Email</label>
              <input type="email" name="supportEmail" value={formData.supportEmail} onChange={handleChange} className="premium-input w-full" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2 dark:text-slate-300">Business Email</label>
              <input type="email" name="businessEmail" value={formData.businessEmail} onChange={handleChange} className="premium-input w-full" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2 dark:text-slate-300">Legal/DMCA Email</label>
              <input type="email" name="legalEmail" value={formData.legalEmail} onChange={handleChange} className="premium-input w-full" />
            </div>

            <div className="pt-4 border-t border-slate-200 dark:border-night-border">
              <label className="block text-sm font-semibold mb-2 dark:text-slate-300">About Us Content</label>
              <textarea name="aboutUsText" value={formData.aboutUsText} onChange={handleChange} rows="3" className="premium-input w-full"></textarea>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2 dark:text-slate-300">Footer Description</label>
              <textarea name="footerText" value={formData.footerText} onChange={handleChange} rows="2" className="premium-input w-full"></textarea>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2 dark:text-slate-300">Copyright Text</label>
              <input type="text" name="copyrightText" value={formData.copyrightText} onChange={handleChange} className="premium-input w-full" />
            </div>

            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-200 dark:border-night-border">
              <input type="checkbox" name="maintenanceMode" checked={formData.maintenanceMode} onChange={handleChange} id="maintenance" className="w-4 h-4 text-primary bg-slate-100 border-slate-300 rounded focus:ring-primary dark:focus:ring-primary dark:ring-offset-night-bg focus:ring-2 dark:bg-night-bg dark:border-night-border" />
              <label htmlFor="maintenance" className="text-sm font-semibold text-slate-700 dark:text-slate-300">Enable Maintenance Mode</label>
            </div>
            
            <div className="mt-8 pt-6 border-t border-slate-200 dark:border-night-border">
              <div className="flex items-center gap-2 mb-4">
                <SettingsIcon className="w-5 h-5 text-indigo-500" />
                <h3 className="text-lg font-black dark:text-white tracking-tight">Dynamic Theme Builder</h3>
              </div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6">Customize the visual identity of Nexoria without touching code.</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest mb-2">Primary Theme Color</label>
                    <div className="flex gap-3 items-center">
                      <input type="color" name="uiTheme_primaryColor" value={formData.uiTheme?.primaryColor || '#7C3AED'} onChange={(e) => setFormData({...formData, uiTheme: {...formData.uiTheme, primaryColor: e.target.value}})} className="w-12 h-12 rounded-xl border-2 border-slate-200 dark:border-slate-700 cursor-pointer p-1 bg-white dark:bg-[#111]" />
                      <input type="text" value={formData.uiTheme?.primaryColor || '#7C3AED'} onChange={(e) => setFormData({...formData, uiTheme: {...formData.uiTheme, primaryColor: e.target.value}})} className="flex-1 px-4 py-2.5 bg-slate-50 dark:bg-[#111] border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white" />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-200 dark:border-night-border">
                    <input type="checkbox" name="uiTheme_cyberpunkEffects" checked={formData.uiTheme?.cyberpunkEffects} onChange={(e) => setFormData({...formData, uiTheme: {...formData.uiTheme, cyberpunkEffects: e.target.checked}})} id="cyberpunkEffects" className="w-4 h-4 text-primary bg-slate-100 border-slate-300 rounded focus:ring-primary dark:focus:ring-primary dark:ring-offset-night-bg focus:ring-2 dark:bg-night-bg dark:border-night-border" />
                    <label htmlFor="cyberpunkEffects" className="text-sm font-semibold text-slate-700 dark:text-slate-300">Enable Cyberpunk Effects / Particles Globally</label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Branding Assets */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6 border border-slate-200 dark:border-night-border">
          <div className="flex items-center gap-2 border-b border-slate-200 dark:border-night-border pb-4 mb-6">
            <ImageIcon className="w-5 h-5 text-accent" />
            <h2 className="text-lg font-bold dark:text-white">Branding Assets</h2>
          </div>
          
          <div className="space-y-6">
            <div>
              <ImageUpload 
                type="logo" 
                label="Website Logo" 
                value={formData.logo} 
                onChange={(url) => setFormData({ ...formData, logo: url })} 
              />
            </div>
            <div>
              <ImageUpload 
                type="logo" 
                label="Favicon" 
                value={formData.favicon} 
                onChange={(url) => setFormData({ ...formData, favicon: url })} 
              />
            </div>
            <div>
              <ImageUpload 
                type="logo" 
                label="Footer Profile Photo (DP)" 
                value={formData.ownerDp} 
                onChange={(url) => setFormData({ ...formData, ownerDp: url })} 
              />
            </div>
            <div>
              <ImageUpload 
                type="image" 
                label="Homepage Hero Background" 
                value={formData.heroBackground} 
                onChange={(url) => setFormData({ ...formData, heroBackground: url })} 
              />
            </div>
          </div>
        </motion.div>

        {/* SEO Settings */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="lg:col-span-2 glass-card p-6 border border-slate-200 dark:border-night-border">
          <div className="flex items-center gap-2 border-b border-slate-200 dark:border-night-border pb-4 mb-6">
            <Type className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold dark:text-white">Default SEO Configuration</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2 dark:text-slate-300">Default Meta Title</label>
                <input type="text" name="metaTitle" value={formData.metaTitle} onChange={handleChange} className="premium-input w-full" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2 dark:text-slate-300">Default Meta Keywords</label>
                <input type="text" name="keywords" value={formData.keywords} onChange={handleChange} className="premium-input w-full" />
              </div>
              <div>
                <ImageUpload 
                  type="image" 
                  label="Default OG Image" 
                  value={formData.defaultOgImage} 
                  onChange={(url) => setFormData({ ...formData, defaultOgImage: url })} 
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2 dark:text-slate-300">Default Meta Description</label>
              <textarea rows="4" name="metaDescription" value={formData.metaDescription} onChange={handleChange} className="premium-input w-full resize-none"></textarea>
            </div>
          </div>
        </motion.div>

        {/* Social Links */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card p-6 border border-slate-200 dark:border-night-border">
          <div className="flex items-center gap-2 border-b border-slate-200 dark:border-night-border pb-4 mb-6">
            <Globe className="w-5 h-5 text-accent" />
            <h2 className="text-lg font-bold dark:text-white">Social Links</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold mb-2 dark:text-slate-300">Facebook URL</label>
              <input type="text" name="social_facebook" value={formData.socialLinks.facebook} onChange={handleChange} className="premium-input w-full" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2 dark:text-slate-300">Twitter URL</label>
              <input type="text" name="social_twitter" value={formData.socialLinks.twitter} onChange={handleChange} className="premium-input w-full" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2 dark:text-slate-300">Instagram URL</label>
              <input type="text" name="social_instagram" value={formData.socialLinks.instagram} onChange={handleChange} className="premium-input w-full" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2 dark:text-slate-300">YouTube URL</label>
              <input type="text" name="social_youtube" value={formData.socialLinks.youtube} onChange={handleChange} className="premium-input w-full" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2 dark:text-slate-300">Discord URL</label>
              <input type="text" name="social_discord" value={formData.socialLinks.discord} onChange={handleChange} className="premium-input w-full" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2 dark:text-slate-300">Telegram URL</label>
              <input type="text" name="social_telegram" value={formData.socialLinks.telegram} onChange={handleChange} className="premium-input w-full" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2 dark:text-slate-300">WhatsApp Channel URL</label>
              <input type="text" name="social_whatsapp" value={formData.socialLinks.whatsapp} onChange={handleChange} className="premium-input w-full" />
            </div>
          </div>
        </motion.div>

        {/* Authentication Settings */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="glass-card p-6 border border-slate-200 dark:border-night-border">
          <div className="flex items-center gap-2 border-b border-slate-200 dark:border-night-border pb-4 mb-6">
            <Lock className="w-5 h-5 text-indigo-500" />
            <h2 className="text-lg font-bold dark:text-white">Authentication & CAPTCHA</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-200 dark:border-night-border pb-4">
              <input type="checkbox" name="authSettings_captchaEnabled" checked={formData.authSettings.captchaEnabled} onChange={(e) => setFormData({...formData, authSettings: {...formData.authSettings, captchaEnabled: e.target.checked}})} id="captchaEnabled" className="w-4 h-4 text-primary bg-slate-100 border-slate-300 rounded focus:ring-primary dark:focus:ring-primary dark:ring-offset-night-bg focus:ring-2 dark:bg-night-bg dark:border-night-border" />
              <label htmlFor="captchaEnabled" className="text-sm font-semibold text-slate-700 dark:text-slate-300">Enable Math CAPTCHA on Login</label>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2 dark:text-slate-300">CAPTCHA Difficulty</label>
              <select name="authSettings_captchaDifficulty" value={formData.authSettings.captchaDifficulty} onChange={(e) => setFormData({...formData, authSettings: {...formData.authSettings, captchaDifficulty: e.target.value}})} className="premium-input w-full">
                <option value="easy">Easy (Addition 1-20)</option>
                <option value="medium">Medium (Add/Sub 1-50)</option>
                <option value="hard">Hard (Add, Sub, Mult, Div 1-100)</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Payment Settings */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-card p-6 border border-slate-200 dark:border-night-border">
          <div className="flex items-center gap-2 border-b border-slate-200 dark:border-night-border pb-4 mb-6">
            <SettingsIcon className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold dark:text-white">Payment Settings</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2 dark:text-slate-300">UPI ID</label>
              <input type="text" name="payment_upiId" value={formData.paymentSettings?.upiId || ''} onChange={(e) => setFormData({...formData, paymentSettings: {...formData.paymentSettings, upiId: e.target.value}})} className="premium-input w-full" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2 dark:text-slate-300">Bank Details</label>
              <textarea rows="3" name="payment_bankDetails" value={formData.paymentSettings?.bankDetails || ''} onChange={(e) => setFormData({...formData, paymentSettings: {...formData.paymentSettings, bankDetails: e.target.value}})} className="premium-input w-full resize-none"></textarea>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2 dark:text-slate-300">Crypto Wallets</label>
              <textarea rows="3" name="payment_cryptoWallets" value={formData.paymentSettings?.cryptoWallets || ''} onChange={(e) => setFormData({...formData, paymentSettings: {...formData.paymentSettings, cryptoWallets: e.target.value}})} className="premium-input w-full resize-none"></textarea>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2 dark:text-slate-300">Payment Instructions</label>
              <textarea rows="3" name="payment_instructions" value={formData.paymentSettings?.paymentInstructions || ''} onChange={(e) => setFormData({...formData, paymentSettings: {...formData.paymentSettings, paymentInstructions: e.target.value}})} className="premium-input w-full resize-none"></textarea>
            </div>
          </div>
        </motion.div>

        {/* Ads & Revenue Settings */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} className="glass-card p-6 border border-slate-200 dark:border-night-border">
          <div className="flex items-center gap-2 border-b border-slate-200 dark:border-night-border pb-4 mb-6">
            <Globe className="w-5 h-5 text-green-500" />
            <h2 className="text-lg font-bold dark:text-white">Ads & Revenue Manager</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-200 dark:border-night-border pb-4">
              <input type="checkbox" name="ads_enabled" checked={formData.ads?.enabled} onChange={(e) => setFormData({...formData, ads: {...formData.ads, enabled: e.target.checked}})} id="adsEnabled" className="w-4 h-4 text-primary bg-slate-100 border-slate-300 rounded focus:ring-primary dark:focus:ring-primary dark:ring-offset-night-bg focus:ring-2 dark:bg-night-bg dark:border-night-border" />
              <label htmlFor="adsEnabled" className="text-sm font-semibold text-slate-700 dark:text-slate-300">Enable Global Advertisements</label>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2 dark:text-slate-300">Download Timer (Seconds)</label>
              <input type="number" name="ads_timerSeconds" value={formData.ads?.timerSeconds || 30} onChange={(e) => setFormData({...formData, ads: {...formData.ads, timerSeconds: Number(e.target.value)}})} className="premium-input w-full" />
              <p className="text-xs text-slate-500 mt-1">Users will wait this many seconds before the download starts.</p>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2 dark:text-slate-300">Download Page Clicks</label>
              <input type="number" name="ads_downloadClicks" value={formData.ads?.downloadClicks || 2} onChange={(e) => setFormData({...formData, ads: {...formData.ads, downloadClicks: Number(e.target.value)}})} className="premium-input w-full" />
              <p className="text-xs text-slate-500 mt-1">Number of steps/clicks required to reach the final file.</p>
            </div>
            <div className="pt-4 border-t border-slate-200 dark:border-night-border">
              <label className="block text-sm font-semibold mb-2 dark:text-slate-300">Adsterra Social Bar Script</label>
              <textarea rows="3" name="ads_socialBarScript" value={formData.ads?.socialBarScript || ''} onChange={(e) => setFormData({...formData, ads: {...formData.ads, socialBarScript: e.target.value}})} className="premium-input w-full font-mono text-xs" placeholder='<script src="..."></script>'></textarea>
              <p className="text-xs text-slate-500 mt-1">This script will be injected globally across the site.</p>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2 dark:text-slate-300">Adsterra Smartlink URL</label>
              <input type="text" name="ads_smartlinkUrl" value={formData.ads?.smartlinkUrl || ''} onChange={(e) => setFormData({...formData, ads: {...formData.ads, smartlinkUrl: e.target.value}})} className="premium-input w-full font-mono text-xs" placeholder="https://..." />
              <p className="text-xs text-slate-500 mt-1">This will trigger conditionally (e.g. on Download button click) to generate revenue.</p>
            </div>
            <div className="pt-4 border-t border-slate-200 dark:border-night-border">
              <label className="block text-sm font-semibold mb-2 dark:text-slate-300">Download Page Banner Script (HTML/JS)</label>
              <textarea rows="3" name="ads_downloadBannerScript" value={formData.ads?.downloadBannerScript || ''} onChange={(e) => setFormData({...formData, ads: {...formData.ads, downloadBannerScript: e.target.value}})} className="premium-input w-full font-mono text-xs" placeholder='<script>...</script>'></textarea>
              <p className="text-xs text-slate-500 mt-1">This banner ad will be displayed directly inside the 30-second download timer page.</p>
            </div>
            <div className="pt-4 border-t border-slate-200 dark:border-night-border">
              <label className="block text-sm font-semibold mb-2 dark:text-slate-300">Global Download Override Link</label>
              <input type="text" name="ads_globalDownloadUrl" value={formData.ads?.globalDownloadUrl || ''} onChange={(e) => setFormData({...formData, ads: {...formData.ads, globalDownloadUrl: e.target.value}})} className="premium-input w-full font-mono text-xs" placeholder="https://..." />
              <p className="text-xs text-slate-500 mt-1">If set, ALL app downloads on the site will redirect to this link instead of the file's original download link.</p>
            </div>
          </div>
        </motion.div>
        
        {/* Offerwall Settings */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="glass-card p-6 border border-slate-200 dark:border-night-border">
          <div className="flex items-center gap-2 border-b border-slate-200 dark:border-night-border pb-4 mb-6">
            <Globe className="w-5 h-5 text-amber-500" />
            <h2 className="text-lg font-bold dark:text-white">Offerwall & Rewards</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-200 dark:border-night-border pb-4">
              <input type="checkbox" name="offerwall_enabled" checked={formData.offerwallSettings?.enabled} onChange={(e) => setFormData({...formData, offerwallSettings: {...formData.offerwallSettings, enabled: e.target.checked}})} id="offerwallEnabled" className="w-4 h-4 text-primary bg-slate-100 border-slate-300 rounded focus:ring-primary dark:focus:ring-primary dark:ring-offset-night-bg focus:ring-2 dark:bg-night-bg dark:border-night-border" />
              <label htmlFor="offerwallEnabled" className="text-sm font-semibold text-slate-700 dark:text-slate-300">Enable Offerwall</label>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2 dark:text-slate-300">Offerwall URL</label>
              <input type="text" name="offerwall_url" value={formData.offerwallSettings?.offerwallUrl || ''} onChange={(e) => setFormData({...formData, offerwallSettings: {...formData.offerwallSettings, offerwallUrl: e.target.value}})} className="premium-input w-full" placeholder="e.g. https://cpalead.com/wall?pub=123" />
              <p className="text-xs text-slate-500 mt-1">Make sure the URL accepts a 'subid' parameter for tracking.</p>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2 dark:text-slate-300">Secret Key / Hash</label>
              <input type="text" name="offerwall_secret" value={formData.offerwallSettings?.secretKey || ''} onChange={(e) => setFormData({...formData, offerwallSettings: {...formData.offerwallSettings, secretKey: e.target.value}})} className="premium-input w-full" placeholder="Secret Key for Postback Validation" />
              <p className="text-xs text-slate-500 mt-1">Postback Webhook URL: <code>{window.location.origin}/api/webhooks/offerwall</code></p>
            </div>
          </div>
        </motion.div>

        {/* Nexoria Music Settings */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }} className="glass-card p-6 border border-slate-200 dark:border-night-border lg:col-span-2">
          <div className="flex items-center gap-2 border-b border-slate-200 dark:border-night-border pb-4 mb-6">
            <SettingsIcon className="w-5 h-5 text-purple-500" />
            <h2 className="text-lg font-bold dark:text-white">Nexoria Music Platform (Global Toggles)</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            <div className="flex items-center gap-2">
              <input type="checkbox" checked={formData.nexoriaMusicSettings?.streamingEnabled} onChange={(e) => setFormData({...formData, nexoriaMusicSettings: {...formData.nexoriaMusicSettings, streamingEnabled: e.target.checked}})} id="musicStreaming" className="w-4 h-4 text-purple-600 bg-slate-100 border-slate-300 rounded focus:ring-purple-500" />
              <label htmlFor="musicStreaming" className="text-sm font-semibold text-slate-700 dark:text-slate-300">Enable Streaming</label>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" checked={formData.nexoriaMusicSettings?.uploadsEnabled} onChange={(e) => setFormData({...formData, nexoriaMusicSettings: {...formData.nexoriaMusicSettings, uploadsEnabled: e.target.checked}})} id="musicUploads" className="w-4 h-4 text-purple-600 bg-slate-100 border-slate-300 rounded focus:ring-purple-500" />
              <label htmlFor="musicUploads" className="text-sm font-semibold text-slate-700 dark:text-slate-300">Enable Uploads</label>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" checked={formData.nexoriaMusicSettings?.downloadsEnabled} onChange={(e) => setFormData({...formData, nexoriaMusicSettings: {...formData.nexoriaMusicSettings, downloadsEnabled: e.target.checked}})} id="musicDownloads" className="w-4 h-4 text-purple-600 bg-slate-100 border-slate-300 rounded focus:ring-purple-500" />
              <label htmlFor="musicDownloads" className="text-sm font-semibold text-slate-700 dark:text-slate-300">Enable Downloads</label>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" checked={formData.nexoriaMusicSettings?.recommendationsEnabled} onChange={(e) => setFormData({...formData, nexoriaMusicSettings: {...formData.nexoriaMusicSettings, recommendationsEnabled: e.target.checked}})} id="musicRecs" className="w-4 h-4 text-purple-600 bg-slate-100 border-slate-300 rounded focus:ring-purple-500" />
              <label htmlFor="musicRecs" className="text-sm font-semibold text-slate-700 dark:text-slate-300">Enable Recommendations</label>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" checked={formData.nexoriaMusicSettings?.lyricsEnabled} onChange={(e) => setFormData({...formData, nexoriaMusicSettings: {...formData.nexoriaMusicSettings, lyricsEnabled: e.target.checked}})} id="musicLyrics" className="w-4 h-4 text-purple-600 bg-slate-100 border-slate-300 rounded focus:ring-purple-500" />
              <label htmlFor="musicLyrics" className="text-sm font-semibold text-slate-700 dark:text-slate-300">Enable Lyrics</label>
            </div>
          </div>
        </motion.div>

        {/* Under Development Modules */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="glass-card p-6 border border-slate-200 dark:border-night-border lg:col-span-2">
          <div className="flex items-center gap-2 border-b border-slate-200 dark:border-night-border pb-4 mb-6">
            <Lock className="w-5 h-5 text-red-500" />
            <h2 className="text-lg font-bold dark:text-white">Module Access Control (Under Development)</h2>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 border-l-4 border-red-500 pl-4 py-1">
            If you turn on "Under Development" for a module, regular users will see a Coming Soon page instead of the content. SuperAdmins and Admins can still access and test them normally.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {['apps', 'games', 'movies', 'music', 'arena', 'vipLounge', 'classicSound', 'ytDownloader'].map((mod) => (
              <div key={mod} className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                <input 
                  type="checkbox" 
                  checked={formData.underDevelopmentModules?.[mod] || false} 
                  onChange={(e) => setFormData({...formData, underDevelopmentModules: {...formData.underDevelopmentModules, [mod]: e.target.checked}})} 
                  id={`ud_${mod}`} 
                  className="w-5 h-5 text-red-600 bg-white border-slate-300 rounded focus:ring-red-500 dark:bg-slate-900 dark:border-slate-600" 
                />
                <label htmlFor={`ud_${mod}`} className="text-sm font-bold text-slate-700 dark:text-slate-300 capitalize cursor-pointer flex-1">
                  {mod === 'ytDownloader' ? 'YT Downloader' : mod.replace(/([A-Z])/g, ' $1').trim()}
                </label>
              </div>
            ))}
          </div>
        </motion.div>

      </div>

      {/* Quick Links Configuration */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="glass-card p-6 border border-slate-200 dark:border-night-border mt-6">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-night-border pb-4 mb-6">
          <div className="flex items-center gap-2">
            <LinkIcon className="w-5 h-5 text-green-500" />
            <h2 className="text-lg font-bold dark:text-white">Footer Quick Links</h2>
          </div>
          <button
            type="button"
            onClick={() => setFormData({ ...formData, quickLinks: [...formData.quickLinks, { label: '', url: '' }] })}
            className="text-xs flex items-center gap-1 bg-primary/10 text-primary px-3 py-1.5 rounded-full hover:bg-primary hover:text-white transition"
          >
            <Plus className="w-4 h-4" /> Add Link
          </button>
        </div>
        <div className="space-y-4">
          {formData.quickLinks.map((link, index) => (
            <div key={index} className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
              <div className="flex flex-col gap-1">
                <button type="button" disabled={index === 0} onClick={() => {
                  const newLinks = [...formData.quickLinks];
                  const temp = newLinks[index - 1];
                  newLinks[index - 1] = newLinks[index];
                  newLinks[index] = temp;
                  setFormData({ ...formData, quickLinks: newLinks });
                }} className="p-1 text-slate-400 hover:text-primary disabled:opacity-30 disabled:hover:text-slate-400"><ArrowUp className="w-4 h-4" /></button>
                <button type="button" disabled={index === formData.quickLinks.length - 1} onClick={() => {
                  const newLinks = [...formData.quickLinks];
                  const temp = newLinks[index + 1];
                  newLinks[index + 1] = newLinks[index];
                  newLinks[index] = temp;
                  setFormData({ ...formData, quickLinks: newLinks });
                }} className="p-1 text-slate-400 hover:text-primary disabled:opacity-30 disabled:hover:text-slate-400"><ArrowDown className="w-4 h-4" /></button>
              </div>
              <div className="grid grid-cols-2 gap-3 flex-1">
                <input type="text" placeholder="Label (e.g. Home)" value={link.label} onChange={(e) => {
                  const newLinks = [...formData.quickLinks];
                  newLinks[index].label = e.target.value;
                  setFormData({ ...formData, quickLinks: newLinks });
                }} className="premium-input py-2 text-sm" />
                <input type="text" placeholder="URL (e.g. /)" value={link.url} onChange={(e) => {
                  const newLinks = [...formData.quickLinks];
                  newLinks[index].url = e.target.value;
                  setFormData({ ...formData, quickLinks: newLinks });
                }} className="premium-input py-2 text-sm" />
              </div>
              <button type="button" onClick={() => {
                const newLinks = formData.quickLinks.filter((_, i) => i !== index);
                setFormData({ ...formData, quickLinks: newLinks.length > 0 ? newLinks : [{ label: '', url: '' }] });
              }} className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition"><Trash2 className="w-4 h-4" /></button>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default SiteSettings;
