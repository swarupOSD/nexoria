import React from 'react';
import { useGetDownloadHistoryQuery } from '../../features/download/downloadApiSlice';
import { motion } from 'framer-motion';
import { Download, Calendar, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import FallbackImage from '../FallbackImage';

const DownloadsTab = ({ user }) => {
  const { data: downloadsRes, isLoading } = useGetDownloadHistoryQuery(undefined, { skip: !user });

  if (isLoading) {
    return <div className="p-8 text-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div></div>;
  }

  const downloads = downloadsRes?.data || [];

  if (downloads.length === 0) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-12 text-center">
        <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <Download className="w-10 h-10 text-indigo-300 dark:text-indigo-500/50" />
        </div>
        <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">No Download History</h3>
        <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-8">
          You haven't downloaded any apps or games yet while logged in.
        </p>
        <Link to="/categories" className="btn-primary inline-flex">
          Explore Apps
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <Download className="w-6 h-6 text-indigo-500" /> Download History
        </h2>
        <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 py-1 px-3 rounded-full text-sm font-semibold">
          {downloads.length} Apps
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {downloads.map((item) => {
          const post = item.post;
          if (!post) return null;
          
          return (
            <motion.div 
              key={post._id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-card group hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col"
            >
              <div className="p-5 flex items-start gap-4 flex-1">
                <Link to={`/post/${post.slug}`} className="shrink-0">
                  <FallbackImage 
                    src={post.appLogo} 
                    fallbackType="logo" 
                    alt={post.title} 
                    className="w-16 h-16 rounded-xl object-cover shadow-sm group-hover:scale-105 transition-transform" 
                  />
                </Link>
                <div className="flex-1 min-w-0">
                  <Link to={`/post/${post.slug}`}>
                    <h3 className="font-bold text-slate-800 dark:text-white truncate group-hover:text-primary transition-colors">
                      {post.title}
                    </h3>
                  </Link>
                  <p className="text-xs font-semibold text-primary/80 mt-1">v{post.version}</p>
                  
                  <div className="flex flex-col gap-1 mt-3">
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> Last: {new Date(item.lastDownloadedAt).toLocaleDateString()}
                    </span>
                    <span className="text-xs text-slate-500 flex items-center gap-1 font-medium bg-slate-100 dark:bg-slate-800 w-fit px-2 py-0.5 rounded-md">
                      Downloaded {item.downloadCount} time(s)
                    </span>
                  </div>
                </div>
              </div>
              <div className="border-t border-slate-100 dark:border-slate-800 p-3 bg-slate-50/50 dark:bg-slate-900/50 flex justify-end items-center">
                <Link to={`/post/${post.slug}`} className="text-sm font-semibold flex items-center gap-1 text-primary hover:text-indigo-600 transition-colors">
                  Get Latest <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default DownloadsTab;
