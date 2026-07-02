import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Helmet } from 'react-helmet-async';
import { Save, Globe, Share2, Shield, Settings as SettingsIcon , LayoutTemplate } from 'lucide-react';
import BackButton from '../../components/BackButton';

const AdminSettings = () => {
  const [formData, setFormData] = useState({
    siteName: 'ModsApp',
    logo: 'logo.png',
    seoTitle: 'ModsApp - Download Premium APKs',
    seoDescription: 'Best platform for mods and apps.',
    seoKeywords: 'apk, mod, games, apps',
    facebook: 'https://facebook.com/modsapp',
    twitter: 'https://twitter.com/modsapp',
    instagram: 'https://instagram.com/modsapp',
    analyticsId: 'G-123456789',
    maintenanceMode: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    toast.success('Settings Saved!');
    // RTK Query update call will go here
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Helmet>
        <title>Site Settings - Admin</title>
      </Helmet>

      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold dark:text-white">Global Site Settings</h1>
        <button onClick={handleSubmit} className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition font-medium shadow">
          <Save className="w-4 h-4" /> Save Changes
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-2">
          <div className="glass-card p-4 hover:border-blue-500 cursor-pointer border-l-4 border-blue-500 transition-all">
            <h3 className="font-bold flex items-center gap-2"><Globe className="w-5 h-5 text-blue-500" /> General & SEO</h3>
            <p className="text-xs text-slate-500">Main site info and search engine optimization</p>
          </div>
          <div className="glass-card p-4 hover:border-purple-500 cursor-pointer transition-all">
            <h3 className="font-bold flex items-center gap-2"><Share2 className="w-5 h-5 text-purple-500" /> Social Links</h3>
            <p className="text-xs text-slate-500">Connect your social media accounts</p>
          </div>
          <div className="glass-card p-4 hover:border-red-500 cursor-pointer transition-all">
            <h3 className="font-bold flex items-center gap-2"><Shield className="w-5 h-5 text-red-500" /> Advanced</h3>
            <p className="text-xs text-slate-500">Maintenance mode and analytics</p>
          </div>
        </div>

        <div className="md:col-span-2 space-y-6">
          <div className="glass-card p-6 space-y-4">
            <h2 className="text-xl font-bold border-b pb-2 dark:border-slate-700 flex items-center gap-2">
              <SettingsIcon className="w-5 h-5" /> Site Configuration
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Site Name</label>
                <input type="text" name="siteName" value={formData.siteName} onChange={handleChange} className="w-full px-4 py-2 rounded border dark:bg-slate-800 dark:border-slate-700 focus:ring-2 focus:ring-blue-500" />
              </div>
              
              <div className="pt-4 border-t dark:border-slate-700">
                <h3 className="font-bold mb-2 text-slate-600 dark:text-slate-300">SEO Settings</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium mb-1">Meta Title</label>
                    <input type="text" name="seoTitle" value={formData.seoTitle} onChange={handleChange} className="w-full px-4 py-2 rounded border dark:bg-slate-800 dark:border-slate-700" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">Meta Description</label>
                    <textarea name="seoDescription" value={formData.seoDescription} onChange={handleChange} rows="2" className="w-full px-4 py-2 rounded border dark:bg-slate-800 dark:border-slate-700"></textarea>
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">Meta Keywords</label>
                    <input type="text" name="seoKeywords" value={formData.seoKeywords} onChange={handleChange} className="w-full px-4 py-2 rounded border dark:bg-slate-800 dark:border-slate-700" />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t dark:border-slate-700">
                <h3 className="font-bold mb-2 text-slate-600 dark:text-slate-300">Analytics & Status</h3>
                <div>
                  <label className="block text-xs font-medium mb-1">Google Analytics ID</label>
                  <input type="text" name="analyticsId" value={formData.analyticsId} onChange={handleChange} className="w-full px-4 py-2 rounded border dark:bg-slate-800 dark:border-slate-700" />
                </div>
                <div className="mt-4 flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg">
                  <input type="checkbox" name="maintenanceMode" checked={formData.maintenanceMode} onChange={handleChange} className="w-5 h-5 rounded text-red-600" />
                  <div>
                    <p className="font-bold text-red-700 dark:text-red-400">Enable Maintenance Mode</p>
                    <p className="text-xs text-red-600 dark:text-red-300">Only Admins will be able to access the site.</p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
