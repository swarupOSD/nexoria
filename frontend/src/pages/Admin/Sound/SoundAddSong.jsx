import React, { useState } from 'react';
import { useCreateSongMutation } from '../../../features/api/musicApiSlice';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const SoundAddSong = () => {
  const [createSong, { isLoading }] = useCreateSongMutation();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '', artist: '', album: '', category: 'Hindi', description: '',
    image: '', audioUrl: '', isYoutube: false, duration: '', releaseYear: '', lyrics: ''
  });

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

  return (
    <div className="p-6 max-w-4xl">
      <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-6">Add New Song</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
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
