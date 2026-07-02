import React from 'react';
import { Database, Music, Settings, Info , LayoutTemplate } from 'lucide-react';
import BackButton from '../../../components/BackButton';

const SoundCategories = () => {
  const categories = [
    'Hindi', 'Bengali', 'English', 'Tamil', 'Telugu', 'Punjabi', 
    'K-Pop', 'Anime Songs', 'Gaming Music', 'LoFi', 'Instrumental', 
    'Remix', 'Devotional', 'Other'
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Database className="w-6 h-6 text-indigo-500" /> Manage Categories
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Music ecosystem global categories</p>
        </div>
      </div>

      <div className="mb-8 p-4 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 rounded-xl flex gap-3">
        <Info className="w-6 h-6 text-indigo-500 flex-shrink-0" />
        <div>
          <h3 className="text-sm font-bold text-indigo-800 dark:text-indigo-400">Schema Locked Categories</h3>
          <p className="text-xs text-indigo-600 dark:text-indigo-300 mt-1 leading-relaxed">
            For maximum read performance and database optimization, Nexoria Sound categories are hardcoded as Enums in the MongoDB Schema. 
            To add or remove categories, please contact the developer to update the `Music.js` and `Playlist.js` models.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {categories.map((cat, idx) => (
          <div key={idx} className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col items-center justify-center text-center group hover:border-indigo-500/50 transition-colors">
            <div className="w-12 h-12 bg-indigo-50 dark:bg-slate-900 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Music className="w-5 h-5 text-indigo-500" />
            </div>
            <span className="font-bold text-slate-700 dark:text-slate-200 text-sm">{cat}</span>
          </div>
        ))}

        <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 border-dashed rounded-xl p-4 flex flex-col items-center justify-center text-center opacity-70">
          <Settings className="w-8 h-8 text-slate-400 mb-2" />
          <span className="text-xs font-bold text-slate-500">Contact Dev to Add</span>
        </div>
      </div>
    </div>
  );
};

export default SoundCategories;
