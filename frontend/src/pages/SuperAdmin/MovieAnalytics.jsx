import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { useGetMovieAnalyticsQuery } from '../../features/movie/movieApiSlice';
import { 
  Activity, Users, PlaySquare, TrendingUp, Download, Star, 
  Clock, Loader2 
} from 'lucide-react';

const MovieAnalytics = () => {
  const { data: analyticsRes, isLoading } = useGetMovieAnalyticsQuery();
  const data = analyticsRes?.data || null;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  const statCards = [
    { title: 'Total Movies', value: data?.totalMovies || 0, icon: PlaySquare, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { title: 'Total Views', value: data?.totalViews || 0, icon: Activity, color: 'text-purple-500', bg: 'bg-purple-500/10' },
    { title: 'Total Watch Count', value: data?.totalWatchCount || 0, icon: Clock, color: 'text-rose-500', bg: 'bg-rose-500/10' },
    { title: 'Total Downloads', value: data?.totalDownloads || 0, icon: Download, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  ];

  return (
    <div className="p-6">
      <Helmet>
        <title>Movie Analytics | Super Admin</title>
      </Helmet>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Movie Analytics Dashboard</h1>
        <p className="text-slate-500">Monitor movie performance, views, and downloads.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white dark:bg-[#111] p-6 rounded-2xl border border-slate-200 dark:border-white/5"
          >
            <div className="flex items-center gap-4">
              <div className={`p-4 rounded-xl ${stat.bg}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500 mb-1">{stat.title}</p>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                  {stat.value.toLocaleString()}
                </h3>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Most Watched */}
        <div className="bg-white dark:bg-[#111] rounded-2xl border border-slate-200 dark:border-white/5 overflow-hidden">
          <div className="p-6 border-b border-slate-200 dark:border-white/5">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-500" />
              Most Watched Movies
            </h3>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-white/5">
            {data?.mostWatched?.map((movie, idx) => (
              <div key={movie._id} className="p-4 flex items-center gap-4 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                <span className="text-xl font-bold text-slate-300 dark:text-slate-600 w-6">{idx + 1}</span>
                <div className="flex-1">
                  <h4 className="font-semibold text-slate-900 dark:text-white">{movie.title}</h4>
                  <div className="flex items-center gap-4 text-xs text-slate-500 mt-1">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {movie.watchCount} watches</span>
                    <span className="flex items-center gap-1"><Activity className="w-3 h-3" /> {movie.views} views</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Rated */}
        <div className="bg-white dark:bg-[#111] rounded-2xl border border-slate-200 dark:border-white/5 overflow-hidden">
          <div className="p-6 border-b border-slate-200 dark:border-white/5">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-500" />
              Top Rated Movies
            </h3>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-white/5">
            {data?.topRated?.map((movie, idx) => (
              <div key={movie._id} className="p-4 flex items-center gap-4 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                <span className="text-xl font-bold text-slate-300 dark:text-slate-600 w-6">{idx + 1}</span>
                <div className="flex-1 flex justify-between items-center">
                  <h4 className="font-semibold text-slate-900 dark:text-white">{movie.title}</h4>
                  <div className="flex items-center gap-1 text-amber-500 font-bold bg-amber-500/10 px-2 py-1 rounded">
                    <Star className="w-4 h-4 fill-amber-500" />
                    {movie.averageRating.toFixed(1)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieAnalytics;
