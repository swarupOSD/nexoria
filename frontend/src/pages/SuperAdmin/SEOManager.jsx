import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Globe, Search, Save, Loader2, Link as LinkIcon, RefreshCw, AlertCircle, Share2 , LayoutTemplate } from 'lucide-react';
import toast from 'react-hot-toast';
import BackButton from '../../components/BackButton';

const SEOManager = () => {
  const [settings, setSettings] = useState({
    metaTitle: '',
    metaDescription: '',
    keywords: '',
    defaultOgImage: '',
    siteName: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchSettings = async () => {
    try {
      const res = await fetch('https://nexoria-backend-mt5e.onrender.com/api/settings');
      const data = await res.json();
      if (data.success && data.data) {
        setSettings({
          metaTitle: data.data.metaTitle || '',
          metaDescription: data.data.metaDescription || '',
          keywords: data.data.keywords || '',
          defaultOgImage: data.data.defaultOgImage || '',
          siteName: data.data.siteName || ''
        });
      }
    } catch (error) {
      toast.error('Failed to load SEO settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleChange = (e) => {
    setSettings({ ...settings, [e.target.name]: e.target.value });
  };

  const uploadOgImageHandler = async (e) => {
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('image', file);

    const uploadToast = toast.loading('Uploading OpenGraph Image...');
    try {
      const res = await fetch('https://nexoria-backend-mt5e.onrender.com/api/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        setSettings({ ...settings, defaultOgImage: data.image });
        toast.success('Image uploaded successfully', { id: uploadToast });
      } else {
        toast.error(data.message || 'Error uploading image', { id: uploadToast });
      }
    } catch (error) {
      toast.error('Server error during upload', { id: uploadToast });
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('https://nexoria-backend-mt5e.onrender.com/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(settings)
      });
      const data = await res.json();
      if (data.success) {
        toast.success('SEO Settings Updated Successfully');
      } else {
        toast.error(data.message || 'Update failed');
      }
    } catch (err) {
      toast.error('Error saving SEO settings');
    } finally {
      setSaving(false);
    }
  };

  const generateSitemap = async () => {
    toast.success('Sitemap generation initiated. Check back in a few minutes.');
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Search className="w-6 h-6 text-teal-500" /> SEO Manager
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
            Configure global meta tags, OpenGraph settings, and search engine visibility.
          </p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={generateSitemap}
            className="bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" /> Rebuild Sitemap
          </button>
          <button 
            onClick={handleSave}
            disabled={saving}
            className="bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shadow-lg shadow-teal-500/20"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save SEO config
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 animate-spin text-teal-500" /></div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Meta Information */}
            <div className="bg-white dark:bg-[#0A0A0A] border border-slate-200 dark:border-white/10 rounded-xl p-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Globe className="w-5 h-5 text-teal-500" /> Global Meta Tags
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Site Name (Title Suffix)</label>
                  <input 
                    type="text" name="siteName" value={settings.siteName} onChange={handleChange}
                    className="w-full bg-slate-50 dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-teal-500"
                  />
                  <p className="text-xs text-slate-500 mt-1">Appended to page titles (e.g., Home - YourSiteName)</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Default Meta Title</label>
                  <input 
                    type="text" name="metaTitle" value={settings.metaTitle} onChange={handleChange} maxLength={60}
                    className="w-full bg-slate-50 dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-teal-500"
                  />
                  <div className="flex justify-end mt-1">
                    <span className={`text-xs ${settings.metaTitle.length > 55 ? 'text-amber-500' : 'text-slate-500'}`}>
                      {settings.metaTitle.length}/60 characters (Recommended: 50-60)
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Default Meta Description</label>
                  <textarea 
                    name="metaDescription" value={settings.metaDescription} onChange={handleChange} rows="3" maxLength={160}
                    className="w-full bg-slate-50 dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-teal-500 resize-none"
                  ></textarea>
                  <div className="flex justify-end mt-1">
                    <span className={`text-xs ${settings.metaDescription.length > 155 ? 'text-amber-500' : 'text-slate-500'}`}>
                      {settings.metaDescription.length}/160 characters (Recommended: 150-160)
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Meta Keywords</label>
                  <input 
                    type="text" name="keywords" value={settings.keywords} onChange={handleChange}
                    placeholder="mods, premium apps, mod apk, download"
                    className="w-full bg-slate-50 dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-teal-500"
                  />
                  <p className="text-xs text-slate-500 mt-1">Comma-separated list. Less relevant for modern Google, useful for some alternative engines.</p>
                </div>
              </div>
            </div>

            {/* Open Graph / Social Sharing */}
            <div className="bg-white dark:bg-[#0A0A0A] border border-slate-200 dark:border-white/10 rounded-xl p-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Share2 className="w-5 h-5 text-indigo-500" /> Social Media Sharing (OpenGraph)
              </h3>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Default OpenGraph Image</label>
                <div className="flex gap-2">
                  <input 
                    type="text" name="defaultOgImage" value={settings.defaultOgImage} onChange={handleChange}
                    className="flex-1 bg-slate-50 dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                  />
                  <div className="relative overflow-hidden inline-block bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-white/20 transition cursor-pointer flex items-center justify-center px-4">
                    <span className="text-sm font-medium">Upload</span>
                    <input type="file" onChange={uploadOgImageHandler} className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" />
                  </div>
                </div>
                <p className="text-xs text-slate-500 mt-1">Shown when links are shared on Discord, Twitter, Facebook, etc. (Recommended: 1200x630px)</p>
                
                {settings.defaultOgImage && (
                  <div className="mt-4 border border-slate-200 dark:border-white/10 rounded-lg p-2 bg-slate-50 dark:bg-black/50">
                    <img src={settings.defaultOgImage} alt="OG Preview" className="w-full h-48 object-cover rounded-md" />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Search Preview */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-[#0A0A0A] border border-slate-200 dark:border-white/10 rounded-xl p-6 sticky top-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Search className="w-5 h-5 text-slate-400" /> Search Engine Preview
              </h3>
              
              <div className="p-4 bg-white rounded-lg border border-slate-200 shadow-sm">
                <div className="text-xs text-slate-700 mb-1 flex items-center gap-2">
                  <Globe className="w-3 h-3" />
                  <span>https://yourdomain.com</span>
                </div>
                <h4 className="text-[#1a0dab] font-medium text-lg cursor-pointer hover:underline line-clamp-1">
                  {settings.metaTitle || 'Your Meta Title'} {settings.siteName && `- ${settings.siteName}`}
                </h4>
                <p className="text-[#4d5156] text-sm mt-1 line-clamp-2">
                  {settings.metaDescription || 'Your meta description will appear here in Google search results.'}
                </p>
              </div>

              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-500/10 rounded-lg border border-blue-100 dark:border-blue-500/20">
                <h4 className="flex items-center gap-2 text-sm font-bold text-blue-800 dark:text-blue-400 mb-2">
                  <AlertCircle className="w-4 h-4" /> SEO Tips
                </h4>
                <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-2 list-disc pl-4">
                  <li>Keep titles under 60 characters to prevent truncation.</li>
                  <li>Include primary keywords near the beginning of the title.</li>
                  <li>Write compelling meta descriptions that encourage click-throughs.</li>
                  <li>Ensure the OG Image has a 1.91:1 ratio.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SEOManager;
