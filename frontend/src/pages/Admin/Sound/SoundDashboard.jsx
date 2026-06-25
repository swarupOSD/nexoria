import React from 'react';
import { useGetMusicAnalyticsQuery } from '../../../features/api/musicApiSlice';
import { Activity, Music, Heart, Play } from 'lucide-react';

const SoundDashboard = () => {
  const { data: analyticsRes, isLoading } = useGetMusicAnalyticsQuery();

  if (isLoading) return <div className="p-8 flex justify-center"><div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div></div>;

  const stats = analyticsRes?.data || {};

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-6">Nexoria Sound Analytics</h1>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-500 dark:text-slate-400 font-medium">Total Songs</h3>
            <div className="p-3 bg-purple-500/10 rounded-xl">
              <Music className="w-6 h-6 text-purple-500" />
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-800 dark:text-white">{stats.totalSongs || 0}</p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-500 dark:text-slate-400 font-medium">Total Streams</h3>
            <div className="p-3 bg-blue-500/10 rounded-xl">
              <Play className="w-6 h-6 text-blue-500" />
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-800 dark:text-white">{stats.totalPlays || 0}</p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-500 dark:text-slate-400 font-medium">Total Likes</h3>
            <div className="p-3 bg-rose-500/10 rounded-xl">
              <Heart className="w-6 h-6 text-rose-500" />
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-800 dark:text-white">{stats.totalLikes || 0}</p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-500 dark:text-slate-400 font-medium">Active Status</h3>
            <div className="p-3 bg-emerald-500/10 rounded-xl">
              <Activity className="w-6 h-6 text-emerald-500" />
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-800 dark:text-white">{stats.activeSongs || 0}</p>
        </div>
      </div>
      
      {/* Most Played & Most Loved Tables would go here */}
    </div>
  );
};

export default SoundDashboard;
