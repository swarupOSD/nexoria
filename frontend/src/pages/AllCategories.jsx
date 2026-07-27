import CustomSearchBar from '../components/CustomSearchBar';
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useGetCategoriesQuery } from '../features/category/categoryApiSlice';
import { Compass, Search, ChevronLeft, Smartphone, Gamepad2, Film, Music, Scissors, LayoutGrid, AlertCircle, RefreshCw, ArrowLeft, Database } from 'lucide-react';
import { useGetSettingsQuery } from '../features/settings/settingsApiSlice';

const categoryStyles = {
  apps: { icon: Smartphone, color: 'from-blue-500 to-indigo-600' },
  games: { icon: Gamepad2, color: 'from-emerald-400 to-green-600' },
  movies: { icon: Film, color: 'from-rose-400 to-red-600' },
  music: { icon: Music, color: 'from-purple-500 to-fuchsia-600' },
  editing: { icon: Scissors, color: 'from-amber-400 to-orange-500' },
  default: { icon: LayoutGrid, color: 'from-slate-500 to-slate-700' }
};

// Ultra-sleek mobile optimized search bar
const MobileSearchBar = ({ value, onChange, placeholder }) => (
  <div className="relative w-full">
    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
    <input 
      type="text" 
      placeholder={placeholder} 
      value={value}
      onChange={onChange}
      className="w-full bg-white/5 border border-white/10 rounded-full py-2.5 pl-10 pr-4 text-[13px] text-white placeholder-white/30 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
    />
  </div>
);

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
    <div className="min-h-screen bg-slate-50 dark:bg-[#030303] md:pt-24 pb-24 md:pb-20 transition-colors duration-500 font-jakarta">
      <Helmet>
        <title>All Categories - {settings.siteName || 'Premium Apps'}</title>
        <meta name="description" content="Browse all premium app and game categories." />
      </Helmet>

      {/* Decorative Gradients (Desktop) */}
      <div className="hidden md:block fixed top-0 left-1/4 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] pointer-events-none -translate-y-1/2"></div>
      <div className="hidden md:block fixed bottom-0 right-1/4 w-[600px] h-[600px] bg-accent/5 rounded-full blur-[120px] pointer-events-none translate-y-1/2"></div>

      {/* 📱 MOBILE EXCLUSIVE: STICKY HEADER & SEARCH */}
      <div className="md:hidden sticky top-0 z-50 bg-[#030303]/90 backdrop-blur-3xl border-b border-white/5 pt-4 pb-3 shadow-2xl mb-4">
        <div className="px-4 flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-all active:scale-95 border border-white/5">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-black text-white leading-tight tracking-tight">App Categories</h1>
              <p className="text-[9px] font-bold uppercase tracking-widest text-primary/80">Discover by genres</p>
            </div>
          </div>
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
            <Database className="w-5 h-5 text-primary" />
          </div>
        </div>
        
        <div className="px-4">
          <MobileSearchBar 
            placeholder="Search categories..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="container mx-auto px-3 md:px-4 max-w-7xl relative z-10">
        
        {/* 💻 DESKTOP EXCLUSIVE: MASSIVE HERO HEADER (Hidden on Mobile) */}
        <div className="hidden md:flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
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

          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <CustomSearchBar value={searchTerm} placeholder="Search categories..." name="text"  onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
        </div>

        {/* Categories Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="bg-white/5 dark:bg-slate-800 rounded-2xl md:rounded-3xl p-3 md:p-6 h-32 md:h-48 animate-pulse border border-slate-200/10 dark:border-slate-700 shadow-sm flex flex-col justify-between">
                <div className="w-10 h-10 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-white/10 dark:bg-slate-700"></div>
                <div>
                  <div className="h-3 md:h-5 w-3/4 bg-white/10 dark:bg-slate-700 rounded mb-1 md:mb-2"></div>
                  <div className="h-2 md:h-4 w-1/2 bg-white/10 dark:bg-slate-700 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-12 md:py-20 px-4 text-center bg-white/5 dark:bg-slate-800 rounded-2xl md:rounded-3xl border border-rose-500/20 shadow-sm mx-4">
            <AlertCircle className="w-12 h-12 md:w-16 md:h-16 text-rose-500 mb-4 md:mb-6 opacity-80" />
            <h3 className="text-lg md:text-2xl font-bold text-white mb-2">Failed to load categories</h3>
            <p className="text-xs md:text-base text-slate-400 mb-6 md:mb-8 font-medium">Please check your internet connection.</p>
            <button onClick={refetch} className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white font-bold rounded-xl active:scale-95 md:active:scale-100 hover:bg-primary-600 transition-colors">
              <RefreshCw className="w-4 h-4 md:w-5 md:h-5" /> Retry Connection
            </button>
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 md:py-20 px-4 text-center bg-white/5 dark:bg-slate-800 rounded-2xl md:rounded-3xl border border-white/5 shadow-sm mt-4">
            <Compass className="w-12 h-12 md:w-16 md:h-16 text-slate-600 mb-4 md:mb-6" />
            <h3 className="text-lg md:text-2xl font-bold text-white mb-2">No categories found</h3>
            <p className="text-xs md:text-sm text-slate-400 font-medium">Try adjusting your search term.</p>
          </div>
        ) : (
          /* MOBILE: 2-COLUMN DENSE GRID | DESKTOP: 3/4-COLUMN GRID */
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6"
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
                    <Link to={`/category/${cat.slug}`} className="block h-full outline-none focus:ring-4 focus:ring-primary/50 rounded-2xl md:rounded-3xl">
                      <div className="h-full bg-white/5 dark:bg-[#0A0A0A]/80 backdrop-blur-2xl rounded-2xl md:rounded-3xl p-3.5 md:p-6 border border-slate-200/10 dark:border-white/5 shadow-sm md:shadow-[0_8px_30px_rgb(0,0,0,0.5)] hover:shadow-xl md:hover:shadow-2xl hover:-translate-y-1 md:hover:-translate-y-1.5 active:scale-[0.98] md:active:scale-100 transition-all duration-300 flex flex-col group relative overflow-hidden">
                        
                        {/* Hover Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/0 to-accent/0 group-hover:from-primary/5 group-hover:to-accent/5 transition-colors duration-300"></div>

                        <div className="flex justify-between items-start mb-3 md:mb-6 relative z-10">
                          <div className={`w-10 h-10 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-gradient-to-br ${style.color} flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}>
                            <Icon className="w-5 h-5 md:w-8 md:h-8 text-white drop-shadow-sm" />
                          </div>
                          {cat.appCount > 50 && (
                            <span className="bg-rose-500/10 dark:bg-rose-500/20 text-rose-500 dark:text-rose-400 text-[8px] md:text-[10px] font-bold px-2 py-0.5 md:px-2.5 md:py-1 rounded-full uppercase tracking-wider">
                              Hot
                            </span>
                          )}
                        </div>
                        
                        <div className="relative z-10 mt-auto">
                          <h2 className="text-[13px] md:text-xl font-bold text-slate-900 dark:text-white mb-1 md:mb-2 group-hover:text-primary transition-colors line-clamp-1">{cat.name}</h2>
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-1 md:gap-0">
                            <p className="text-[10px] md:text-sm text-slate-500 dark:text-slate-400 font-medium line-clamp-1 md:line-clamp-2 md:pr-4">
                              {cat.description || `Explore ${cat.name}`}
                            </p>
                            <div className="shrink-0 bg-white/10 dark:bg-slate-700/50 text-slate-900 dark:text-slate-300 px-2 py-1 md:px-3 md:py-1.5 rounded-lg md:rounded-xl text-[9px] md:text-sm font-bold shadow-inner self-start md:self-auto mt-1 md:mt-0">
                              {cat.appCount || 0} Apps
                            </div>
                          </div>
                        </div>
                        
                        {/* Shimmer Border on Hover */}
                        <div className="absolute inset-0 border border-transparent md:border-2 group-hover:border-primary/20 rounded-2xl md:rounded-3xl transition-colors duration-300 pointer-events-none"></div>
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
