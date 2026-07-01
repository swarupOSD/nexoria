import React, { useState } from 'react';
import { useCreateSongMutation, useScrapeMusicMutation } from '../../../features/api/musicApiSlice';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Globe, Download } from 'lucide-react';

const SoundAddSong = () => {
  const [createSong, { isLoading }] = useCreateSongMutation();
  const [scrapeMusic, { isLoading: isScraping }] = useScrapeMusicMutation();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '', artist: '', album: '', category: 'Hindi', description: '',
    image: '', audioUrl: '', isYoutube: false, duration: '', releaseYear: '', lyrics: ''
  });
  
  const [scrapeUrl, setScrapeUrl] = useState('');

  const categories = [
    'Hindi', 'Bengali', 'English', 'Tamil', 'Telugu', 'Punjabi', 
    'K-Pop', 'Anime Songs', 'Gaming Music', 'LoFi', 'Instrumental', 
    'Remix', 'Devotional', 'Other'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createSong(formData).unwrap();
      toast.success('Song added successfully!');
      navigate('/superadmin/sound/songs');
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to add song');
    }
  };

  const handleAutoScrape = async () => {
    if (!scrapeUrl) return toast.error('Please enter a valid YouTube or Music URL');
    
    try {
      toast.loading('Fetching music details...', { id: 'scrape' });
      const response = await scrapeMusic({ url: scrapeUrl }).unwrap();
      
      setFormData(prev => ({
        ...prev,
        title: response.title || prev.title,
        artist: response.artist || prev.artist,
        image: response.image || prev.image,
        description: response.description ? response.description.slice(0, 200) + '...' : prev.description,
        audioUrl: scrapeUrl,
        isYoutube: scrapeUrl.includes('youtube.com') || scrapeUrl.includes('youtu.be')
      }));
      
      toast.success('Music details fetched successfully!', { id: 'scrape' });
      setScrapeUrl('');
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to fetch music details', { id: 'scrape' });
    }
  };

  return (
    <div className="p-6 max-w-4xl space-y-8 pb-20">
      <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Add New Song</h1>
      
      {/* Auto-Scraper Tool */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-gradient-to-r from-pink-500/10 to-purple-500/10 border border-pink-500/20 p-6 rounded-3xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
          <Globe className="w-32 h-32 text-pink-500" />
        </div>
        <div className="relative z-10">
          <h3 className="text-lg font-black text-slate-900 dark:text-white mb-1 tracking-tight flex items-center gap-2">
            <Globe className="w-5 h-5 text-pink-500" /> Auto-Scraper (Beta)
          </h3>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Paste a YouTube or Spotify link to auto-fill details</p>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <input 
              type="text" 
              value={scrapeUrl}
              onChange={(e) => setScrapeUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..." 
              className="flex-1 px-4 py-3 bg-white dark:bg-[#111] border border-pink-500/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 font-medium text-sm text-slate-700 dark:text-slate-200"
            />
            <button 
              type="button"
              onClick={handleAutoScrape}
              disabled={isScraping}
              className="px-6 py-3 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-bold rounded-xl shadow-lg shadow-pink-500/30 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isScraping ? (
                <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span> Fetching...</>
              ) : (
                <><Download className="w-4 h-4" /> Fetch Song</>
              )}
            </button>
          </div>
        </div>
      </motion.div>

      <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Title *</label>
            <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-purple-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Artist *</label>
            <input required type="text" value={formData.artist} onChange={e => setFormData({...formData, artist: e.target.value})} className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-purple-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Album</label>
            <input type="text" value={formData.album} onChange={e => setFormData({...formData, album: e.target.value})} className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-purple-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Category *</label>
            <select required value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-purple-500">
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description (Optional)</label>
            <textarea rows="3" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-purple-500" placeholder="Write something about this song..."></textarea>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Cover Image URL *</label>
            <input required type="url" value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})} className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-purple-500" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Audio URL (Direct MP3 or YouTube) *</label>
            <input required type="url" value={formData.audioUrl} onChange={e => setFormData({...formData, audioUrl: e.target.value})} className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-purple-500" />
          </div>
          <div className="md:col-span-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={formData.isYoutube} onChange={e => setFormData({...formData, isYoutube: e.target.checked})} className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500" />
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Is this a YouTube Link?</span>
            </label>
          </div>
        </div>

        <button disabled={isLoading} type="submit" className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl transition-colors disabled:opacity-50">
          {isLoading ? 'Adding...' : 'Add Song'}
        </button>
      </form>
    </div>
  );
};

export default SoundAddSong;
