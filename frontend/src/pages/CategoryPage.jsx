import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Film, User, Search, Play, Star, Clock, Calendar, ChevronRight, Filter, AlertCircle, Download, LayoutTemplate, ArrowLeft } from 'lucide-react';
import { useGetPostsQuery } from '../features/post/postApiSlice';
import { useGetCategoriesQuery } from '../features/category/categoryApiSlice';
import FallbackImage from '../components/FallbackImage';
import SEO from '../components/SEO';
import BackButton from '../components/BackButton';

// Ultra-sleek mobile optimized search bar
const MobileSearchBar = ({ value, onChange, placeholder }) => (
  <div className="relative w-full">
    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
    <input 
      type="text" 
      placeholder={placeholder} 
      value={value}
      onChange={onChange}
      className="w-full bg-white/5 border border-white/10 rounded-full py-2.5 pl-10 pr-4 text-sm text-white placeholder-white/30 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
    />
  </div>
);

// Desktop search bar (original)
const CustomSearchBar = ({ value, onChange, placeholder }) => (
  <div className="relative w-full max-w-lg mx-auto">
    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
    <input 
      type="text" 
      placeholder={placeholder} 
      value={value}
      onChange={onChange}
      className="w-full bg-[#111] border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-white placeholder-slate-500 focus:outline-none focus:border-primary/50 transition-all"
    />
  </div>
);

const AppCard = React.memo(({ app }) => {
  const isPremium = app.isPremium || app.premiumOnly;
  return (
    <motion.div 
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300 }}
      className="h-full"
    >
      <Link to={`/post/${app.slug}`} className="group block h-full">
        <div className="bg-white/5 dark:bg-[#0A0A0A]/60 backdrop-blur-2xl border border-slate-200/50 dark:border-white/10 rounded-2xl md:rounded-3xl p-2.5 md:p-4 shadow-[0_10px_30px_rgba(0,0,0,0.1)] dark:shadow-[0_10px_30px_rgba(168,85,247,0.05)] hover:shadow-[0_20px_40px_rgba(168,85,247,0.2)] hover:border-purple-500/50 transition-all duration-500 h-full flex flex-col gap-3 md:gap-4 relative overflow-hidden group/card">
          <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/10 to-blue-500/10 pointer-events-none opacity-0 group-hover/card:opacity-100 transition-opacity duration-500"></div>
          <div className="aspect-square w-full rounded-xl md:rounded-2xl overflow-hidden relative bg-black/5 dark:bg-white/5 backdrop-blur-md shadow-inner z-10 border border-white/5">
            <FallbackImage src={app.appLogo} fallbackType="logo" alt={app.title} className="w-full h-full object-contain p-2 md:p-3 group-hover:scale-110 transition-transform duration-500 drop-shadow-xl" />
          {isPremium && (
            <div className="absolute top-1 md:top-2 right-1 md:right-2 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-[8px] md:text-[9px] font-black px-1.5 md:px-2 py-0.5 rounded-full shadow-lg uppercase tracking-wider backdrop-blur-md border border-white/20">
              PRO
            </div>
          )}
        </div>
        <div className="space-y-1 mt-auto px-0.5">
          <h3 className="font-bold text-white text-[12px] md:text-sm line-clamp-2 leading-tight group-hover:text-blue-400 transition-colors">{app.title}</h3>
          <div className="flex items-center gap-2 md:gap-3 text-[10px] md:text-xs text-white/50">
            <span className="flex items-center gap-1"><Star className="w-3 h-3 text-amber-400 fill-amber-400" /> {app.averageRating || '4.5'}</span>
            <span className="flex items-center gap-1"><Download className="w-3 h-3" /> {app.downloads > 1000 ? (app.downloads/1000).toFixed(1)+'k' : (app.downloads || 0)}</span>
          </div>
        </div>
      </div>
    </Link>
    </motion.div>
  );
});

const CategoryPage = ({ type }) => {
  const { slug } = useParams();
  const navigate = useNavigate();
  
  const { data: categoriesRes } = useGetCategoriesQuery();
  const categories = categoriesRes?.data || [];
  const currentCategory = categories.find(c => c.slug === slug);
  
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  
  const queryParams = {
    page,
    limit: 20,
    search: searchTerm
  };
  if (slug) queryParams.category = slug;
  if (type) queryParams.type = type;

  const { data: postsRes, isLoading, isError } = useGetPostsQuery(queryParams, {
    skip: !slug && !type,
    refetchOnMountOrArgChange: true
  });
  
  const posts = postsRes?.data || [];
  const totalPages = postsRes?.pagination?.total || 1;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug, type, page]);

  // Determine Title & Description
  const isAppHub = type === 'App' && !slug;
  const pageTitle = isAppHub ? 'Nexoria Studio' : (currentCategory ? currentCategory.name : 'Category');
  const pageDesc = isAppHub ? 'Premium modded apps & tools.' : (currentCategory?.description || `Browse the best applications.`);

  return (
    <div className="bg-[#0A0A0A] min-h-screen text-white pb-24 md:pb-20 font-jakarta">
      <SEO title={`${pageTitle} - PremiumApps`} />
      
      {/* 📱 MOBILE EXCLUSIVE: STICKY HEADER & COMPACT NAVBAR (Hidden on PC) */}
      <div className="md:hidden sticky top-0 z-50 bg-[#0A0A0A]/90 backdrop-blur-3xl border-b border-white/5 pt-4 pb-3 shadow-2xl">
        <div className="px-4 flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-all active:scale-95 border border-white/5">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-black text-white leading-tight tracking-tight">{pageTitle}</h1>
              <p className="text-[9px] font-bold uppercase tracking-widest text-blue-400/80">{pageDesc.substring(0,35)}...</p>
            </div>
          </div>
          {isAppHub && (
            <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
              <LayoutTemplate className="w-5 h-5 text-blue-400" />
            </div>
          )}
        </div>
        
        {/* Mobile Search Bar */}
        <div className="px-4 mb-3">
          <MobileSearchBar 
            placeholder={`Search in ${currentCategory?.name || 'Studio'}...`} 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Mobile Horizontal Scrolling Category Chips */}
        <div className="px-4 flex overflow-x-auto gap-2 pb-1 hide-scrollbar snap-x">
          <Link 
            to="/apps" 
            className={`snap-start shrink-0 px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-widest whitespace-nowrap transition-all active:scale-95 ${!slug ? 'bg-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.4)]' : 'bg-white/5 text-white/50 hover:text-white border border-white/5'}`}
          >
            All Studio
          </Link>
          {categories.map(cat => (
            <Link 
              key={cat._id}
              to={`/category/${cat.slug}`} 
              className={`snap-start shrink-0 px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-widest whitespace-nowrap transition-all active:scale-95 ${cat.slug === slug ? 'bg-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.4)]' : 'bg-white/5 text-white/50 hover:text-white border border-white/5'}`}
            >
              {cat.name}
            </Link>
          ))}
        </div>
      </div>
      
      {/* 💻 DESKTOP EXCLUSIVE: MASSIVE HERO BANNER (Hidden on Mobile) */}
      <div className="hidden md:block relative bg-[#111] border-b border-white/5 overflow-hidden mb-10">
        <div className="absolute top-6 left-6 z-20">
          <BackButton fallbackRoute="/" />
        </div>
        {currentCategory?.banner && !isAppHub && (
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-overlay" 
            style={{ backgroundImage: `url(${currentCategory.banner})` }}
          />
        )}
        {isAppHub && (
           <div className="absolute inset-0 bg-gradient-to-br from-blue-900/40 via-purple-900/20 to-[#0A0A0A]"></div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/60 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent"></div>
        
        <div className="relative container mx-auto px-4 pt-16 pb-12 text-center max-w-3xl z-10 perspective-1000">
          <motion.h1 
            initial={{ opacity: 0, y: 20, rotateX: -20 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            className={`text-4xl md:text-6xl font-black mb-4 drop-shadow-2xl tracking-tight ${isAppHub ? 'text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500' : 'text-white'}`}
          >
            {pageTitle}
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-slate-300 text-lg md:text-xl font-medium drop-shadow-md bg-black/20 backdrop-blur-md inline-block px-6 py-2 rounded-full border border-white/5"
          >
            {isAppHub ? 'Discover premium modded apps, tools, and utilities.' : (currentCategory?.description || `Browse the best applications and mods.`)}
          </motion.p>
        </div>
      </div>

      <div className="container mx-auto px-3 md:px-4 flex flex-col md:flex-row gap-4 md:gap-8 mt-4 md:mt-0 max-w-[1400px]">
        
        {/* 💻 DESKTOP EXCLUSIVE: SIDEBAR (Hidden on Mobile) */}
        <div className="hidden md:block w-full md:w-1/4">
          <div className="bg-[#111] rounded-2xl border border-white/5 p-6 sticky top-24">
            <h3 className="font-bold text-white mb-6 uppercase tracking-wider text-sm text-slate-400">All Categories</h3>
            <ul className="space-y-2 max-h-[60vh] overflow-y-auto custom-scrollbar pr-2">
              <li>
                <Link 
                  to={`/apps`} 
                  className={`block py-2.5 px-4 rounded-xl transition-colors font-medium flex items-center justify-between group ${!slug ? 'bg-blue-500/20 text-blue-400' : 'text-slate-300 hover:bg-white/5 hover:text-white'}`}
                >
                  All Studio Apps
                  <ChevronRight className={`w-4 h-4 transition-transform ${!slug ? 'opacity-100 translate-x-1' : 'opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0'}`} />
                </Link>
              </li>
              {categories.map(cat => (
                <li key={cat._id}>
                  <Link 
                    to={`/category/${cat.slug}`} 
                    className={`block py-2.5 px-4 rounded-xl transition-colors font-medium flex items-center justify-between group ${cat.slug === slug ? 'bg-blue-500/20 text-blue-400' : 'text-slate-300 hover:bg-white/5 hover:text-white'}`}
                  >
                    {cat.name}
                    <ChevronRight className={`w-4 h-4 transition-transform ${cat.slug === slug ? 'opacity-100 translate-x-1' : 'opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0'}`} />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Main Content */}
        <div className="w-full md:w-3/4 space-y-4 md:space-y-8">
          
          {/* 💻 DESKTOP EXCLUSIVE: SEARCH BAR (Hidden on Mobile) */}
          <div className="hidden md:flex relative justify-center mt-2">
            <CustomSearchBar 
              placeholder={`Search in ${currentCategory?.name || 'Studio'}...`} 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest animate-pulse">Scanning Archive...</span>
            </div>
          ) : isError ? (
            <div className="text-center py-20 text-rose-500 bg-white/5 backdrop-blur-xl rounded-3xl border border-rose-500/20 shadow-2xl">
              <AlertCircle className="w-10 h-10 mx-auto mb-3 opacity-50" />
              Failed to load applications.
            </div>
          ) : posts.length === 0 ? (
            <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-12 md:p-20 text-center shadow-2xl mt-4">
              <h3 className="text-xl md:text-2xl font-black text-white mb-2 md:mb-3">No Apps Found</h3>
              <p className="text-xs md:text-sm text-white/50 font-medium">There are currently no apps matching your criteria.</p>
            </div>
          ) : (
            <>
              {/* ULTRA DENSE MOBILE GRID: gap-3 and p-2 padding on cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
                {posts.map(app => <AppCard key={app._id} app={app} />)}
              </div>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center mt-8 md:mt-12 gap-2">
                  <button 
                    disabled={page === 1}
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    className="px-4 md:px-5 py-2 md:py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl md:rounded-full text-[12px] md:text-sm text-white font-bold disabled:opacity-50 transition-colors active:scale-95"
                  >
                    Prev
                  </button>
                  <span className="px-4 md:px-5 py-2 md:py-2.5 bg-blue-600 text-white rounded-xl md:rounded-full font-black text-[12px] md:text-sm shadow-[0_0_15px_rgba(37,99,235,0.4)]">
                    {page}
                  </span>
                  <button 
                    disabled={page === totalPages}
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    className="px-4 md:px-5 py-2 md:py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl md:rounded-full text-[12px] md:text-sm text-white font-bold disabled:opacity-50 transition-colors active:scale-95"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}

        </div>
      </div>
      
      <style jsx="true">{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default CategoryPage;
