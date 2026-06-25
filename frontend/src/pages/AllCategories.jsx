import CustomSearchBar from '../components/CustomSearchBar';
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useGetCategoriesQuery } from '../features/category/categoryApiSlice';
import { Compass, Search, ChevronLeft, Smartphone, Gamepad2, Film, Music, Scissors, LayoutGrid, AlertCircle, RefreshCw } from 'lucide-react';
import { useGetSettingsQuery } from '../features/settings/settingsApiSlice';

const categoryStyles = {
  apps: { icon: Smartphone, color: 'from-blue-500 to-indigo-600' },
  games: { icon: Gamepad2, color: 'from-emerald-400 to-green-600' },
  movies: { icon: Film, color: 'from-rose-400 to-red-600' },
  music: { icon: Music, color: 'from-purple-500 to-fuchsia-600' },
  editing: { icon: Scissors, color: 'from-amber-400 to-orange-500' },
  default: { icon: LayoutGrid, color: 'from-slate-500 to-slate-700' }
};

const AllCategories = () => {
  const navigate = useNavigate();
  const { data: settingsRes } = useGetSettingsQuery();
  const settings = settingsRes?.data || {};
  const { data: categoriesData, isLoading, isError, refetch } = useGetCategoriesQuery();
  const categories = categoriesData?.data || [];

  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const filteredCategories = categories.filter(cat => 
    cat.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (cat.description && cat.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#030303] pt-24 pb-20 transition-colors duration-500">
      <Helmet>
        <title>All Categories - {settings.siteName || 'Premium Apps'}</title>
        <meta name="description" content="Browse all premium app and game categories." />
      </Helmet>

      {/* Decorative Gradients */}
      <div className="fixed top-0 left-1/4 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] pointer-events-none -translate-y-1/2"></div>
      <div className="fixed bottom-0 right-1/4 w-[600px] h-[600px] bg-accent/5 rounded-full blur-[120px] pointer-events-none translate-y-1/2"></div>

      <div className="container mx-auto px-4 max-w-7xl relative z-10">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <button 
              onClick={() => navigate(-1)} 
              className="mb-6 flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-full font-bold shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md hover:-translate-x-1 transition-all"
            >
              <ChevronLeft className="w-5 h-5" /> Back
            </button>
            <h1 className="text-4xl md:text-5xl font-black flex items-center gap-4 text-slate-900 dark:text-white tracking-tight">
              <Compass className="w-10 h-10 md:w-12 md:h-12 text-primary" /> App Categories
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-lg mt-3 font-medium">Explore thousands of premium apps and games by category.</p>
          </div>

          {/* Search Bar */}
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <CustomSearchBar value={searchTerm} placeholder="Search categories..." name="text"  onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
        </div>

        {/* Categories Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-slate-800 rounded-3xl p-6 h-48 animate-pulse border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-between">
                <div className="w-16 h-16 rounded-2xl bg-slate-200 dark:bg-slate-700"></div>
                <div>
                  <div className="h-5 w-3/4 bg-slate-200 dark:bg-slate-700 rounded mb-2"></div>
                  <div className="h-4 w-1/2 bg-slate-200 dark:bg-slate-700 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <AlertCircle className="w-16 h-16 text-rose-500 mb-6 opacity-80" />
            <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Failed to load categories</h3>
            <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-md mx-auto font-medium">Please check your internet connection and try again.</p>
            <button onClick={refetch} className="flex items-center gap-2 px-8 py-3.5 bg-primary text-white font-bold rounded-xl hover:bg-primary-600 transition-colors shadow-lg shadow-primary/30 hover:-translate-y-1">
              <RefreshCw className="w-5 h-5" /> Retry Connection
            </button>
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <Compass className="w-16 h-16 text-slate-300 dark:text-slate-600 mb-6" />
            <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">No categories found</h3>
            <p className="text-slate-500 dark:text-slate-400 font-medium">Try adjusting your search term.</p>
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            <AnimatePresence>
              {filteredCategories.map((cat, index) => {
                const style = categoryStyles[cat.slug] || categoryStyles.default;
                const Icon = style.icon;
                
                return (
                  <motion.div
                    key={cat._id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                  >
                    <Link to={`/category/${cat.slug}`} className="block h-full outline-none focus:ring-4 focus:ring-primary/50 rounded-3xl">
                      <div className="h-full bg-white/80 dark:bg-[#0A0A0A]/80 backdrop-blur-2xl rounded-3xl p-6 border border-slate-200/50 dark:border-white/5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)] hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col group relative overflow-hidden">
                        
                        {/* Hover Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/0 to-accent/0 group-hover:from-primary/5 group-hover:to-accent/5 transition-colors duration-300"></div>

                        <div className="flex justify-between items-start mb-6 relative z-10">
                          <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${style.color} flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}>
                            <Icon className="w-8 h-8 text-white drop-shadow-sm" />
                          </div>
                          {cat.appCount > 50 && (
                            <span className="bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                              Trending
                            </span>
                          )}
                        </div>
                        
                        <div className="relative z-10 mt-auto">
                          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-primary transition-colors">{cat.name}</h2>
                          <div className="flex items-center justify-between">
                            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium line-clamp-2 pr-4">
                              {cat.description || `Explore top ${cat.name.toLowerCase()} for your device.`}
                            </p>
                            <div className="shrink-0 bg-slate-100 dark:bg-slate-700/50 text-slate-700 dark:text-slate-300 px-3 py-1.5 rounded-xl text-sm font-bold shadow-inner">
                              {cat.appCount || 0} Apps
                            </div>
                          </div>
                        </div>
                        
                        {/* Shimmer Border on Hover */}
                        <div className="absolute inset-0 border-2 border-transparent group-hover:border-primary/20 rounded-3xl transition-colors duration-300 pointer-events-none"></div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default AllCategories;
