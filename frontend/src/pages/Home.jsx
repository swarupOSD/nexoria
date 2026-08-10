import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Compass, RefreshCw, AlertCircle, ChevronRight, Star, Download, Flame, Sparkles, Award, Gamepad2, Film, Music, Smartphone, User, Rocket, Gem, LayoutTemplate, PlayCircle, ShieldCheck } from 'lucide-react';
import { useGetCategoriesQuery } from '../features/category/categoryApiSlice';
import { useGetPostsQuery } from '../features/post/postApiSlice';
import { useSelector } from 'react-redux';
import HeroDisplay from '../components/HeroDisplay';
import FallbackImage from '../components/FallbackImage';
import SEO from '../components/SEO';
import Leaderboard from '../components/Leaderboard';
import AdPlacement from '../components/AdPlacement';
import { AuraBadge } from '../components/AuraScore';
import ForYouCarousel from '../components/ForYouCarousel';

const RetryComponent = ({ onRetry, message = "Failed to load content" }) => (
  <div className="flex flex-col items-center justify-center py-12 px-4 text-center border border-white/5 rounded-3xl bg-white/5 backdrop-blur-md">
    <AlertCircle className="w-12 h-12 text-rose-500 mb-4 opacity-80" />
    <h3 className="text-xl font-bold text-white mb-2 font-heading">{message}</h3>
    <p className="text-slate-400 mb-6 max-w-md mx-auto">Check your connection and try again.</p>
    <button onClick={onRetry} className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-rose-500 to-pink-500 text-white font-bold rounded-xl hover:opacity-90 transition-opacity shadow-[0_0_20px_rgba(244,63,94,0.3)]">
      <RefreshCw className="w-4 h-4" /> Try Again
    </button>
  </div>
);

const AppCard = React.memo(({ app }) => {
  const isPremium = app.isPremium || app.premiumOnly;
  
  return (
    <div className="snap-start shrink-0 w-[140px] md:w-[180px] group cursor-pointer perspective-1000">
      <Link to={`/post/${app.slug}`} className="block relative">
        <div className="relative z-10 flex flex-col gap-3 md:gap-4">
          {/* Glass Card Container */}
          <div className="aspect-square w-full rounded-2xl md:rounded-[2rem] overflow-hidden relative bg-white/5 backdrop-blur-xl border border-white/10 dark:border-white/10 shadow-lg group-hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:group-hover:shadow-[0_0_30px_rgba(37,99,235,0.15)] transition-all duration-500 group-hover:-translate-y-1">
            
            {/* Glowing Backdrop inside card */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-rose-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

            <div className="absolute inset-[3px] md:inset-[4px] rounded-xl md:rounded-[1.75rem] overflow-hidden flex items-center justify-center bg-slate-100 dark:bg-[#0A0A0A] z-10 border border-black/5 dark:border-white/5">
              <FallbackImage src={app.appLogo} fallbackType="logo" alt={app.title} className="w-[80%] h-[80%] object-contain group-hover:scale-110 transition-transform duration-500 ease-out" />
            </div>
            
            {isPremium && (
              <div className="absolute top-0 right-0 bg-gradient-to-bl from-rose-500 to-pink-500 text-white text-[9px] md:text-[10px] font-black px-2.5 md:px-3 py-1 md:py-1.5 rounded-bl-2xl shadow-lg uppercase tracking-widest z-30 flex items-center gap-1">
                <Gem className="w-2.5 h-2.5 md:w-3 md:h-3" /> PRO
              </div>
            )}
            {app.auraScore > 0 && (
              <div className="absolute bottom-2 md:bottom-3 right-2 md:right-3 z-30 scale-75 md:scale-90 origin-bottom-right">
                <AuraBadge score={app.auraScore} />
              </div>
            )}
          </div>
          
          <div className="space-y-1 md:space-y-1.5 px-1">
            <h3 className="font-bold text-slate-900 dark:text-white text-[14px] md:text-[16px] line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200 font-heading tracking-tight">{app.title}</h3>
            <div className="flex items-center gap-3 text-[11px] md:text-xs font-semibold text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 px-1.5 py-0.5 rounded-md"><Star className="w-3 h-3 fill-amber-400 text-amber-400" /> {app.averageRating || '4.5'}</span>
              <span className="flex items-center gap-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded-md"><Download className="w-3 h-3" /> {app.downloads > 1000 ? (app.downloads/1000).toFixed(1)+'k' : (app.downloads || 0)}</span>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
});

const Home = () => {
  const { user } = useSelector(state => state.auth);
  const { data: categoriesData, refetch: refetchCats, isError: catError } = useGetCategoriesQuery();
  const categories = categoriesData?.data || [];

  const { data: trendingRes, refetch: refetchTrend } = useGetPostsQuery({ isTrending: true, limit: 12 });
  const { data: featuredRes, refetch: refetchFeat } = useGetPostsQuery({ isFeatured: true, limit: 12 });
  const { data: editorChoiceRes, refetch: refetchEd } = useGetPostsQuery({ editorChoice: true, limit: 12 });

  return (
    <div className="font-sans bg-transparent min-h-screen text-slate-900 dark:text-slate-50 pb-24 md:pb-20 selection:bg-blue-500/30 relative overflow-x-hidden">
      <SEO title="Nexoria – Movies, K-Dramas, Anime, Games, Music & Premium Apps | All In One" />
      <AdPlacement location="Header" />

      {/* 📱 ULTRA-COMPACT LIQUID MOBILE HERO (VISIBLE ONLY ON PHONES) */}
      <div className="md:hidden pt-20 px-4 md:px-6 pb-6 space-y-6 relative overflow-visible">
        
        {/* Animated Background Blob for Mobile */}
        <div className="absolute top-0 right-0 w-[60vw] h-[60vw] bg-rose-500/20 rounded-full blur-[80px] pointer-events-none -z-10 mix-blend-screen"></div>
        <div className="absolute top-[20%] left-[-10%] w-[50vw] h-[50vw] bg-blue-600/20 rounded-full blur-[80px] pointer-events-none -z-10 mix-blend-screen"></div>

        {/* Welcome Text */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="flex flex-col">
          <span className="text-[10px] text-rose-500 font-bold uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
            Liquid Glass Experience
          </span>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white leading-[1.1] tracking-tight font-heading">
            The Ultimate <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-blue-500">Entertainment Hub</span>
          </h1>
        </motion.div>

        {/* Quick Access Mobile Grid - Premium Menu */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }} className="grid grid-cols-2 gap-3 md:gap-4 relative">
          
          <Link to="/category/apps" className="group relative bg-white/5 dark:bg-white/5 backdrop-blur-xl border border-white/10 hover:border-blue-500/40 rounded-2xl p-4 flex flex-col gap-3 active:scale-95 transition-all overflow-hidden shadow-lg">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 group-hover:scale-110 transition-transform shadow-inner">
              <LayoutTemplate className="w-5 h-5 text-blue-400" />
            </div>
            <div className="relative z-10">
              <h3 className="text-[15px] font-black text-slate-900 dark:text-white tracking-tight">Studio</h3>
              <p className="text-[10px] text-blue-500 dark:text-blue-400 font-bold uppercase tracking-widest mt-0.5">Mod Apps</p>
            </div>
          </Link>

          <Link to="/moviebox" className="group relative bg-white/5 dark:bg-white/5 backdrop-blur-xl border border-white/10 hover:border-rose-500/40 rounded-2xl p-4 flex flex-col gap-3 active:scale-95 transition-all overflow-hidden shadow-lg">
            <div className="absolute inset-0 bg-gradient-to-br from-rose-500/10 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center border border-rose-500/20 group-hover:scale-110 transition-transform shadow-inner">
              <Film className="w-5 h-5 text-rose-400" />
            </div>
            <div className="relative z-10">
              <h3 className="text-[15px] font-black text-slate-900 dark:text-white tracking-tight">MovieBox</h3>
              <p className="text-[10px] text-rose-500 dark:text-rose-400 font-bold uppercase tracking-widest mt-0.5">Movies & Shows</p>
            </div>
          </Link>

          <Link to="/category/games" className="group relative bg-white/5 dark:bg-white/5 backdrop-blur-xl border border-white/10 hover:border-purple-500/40 rounded-2xl p-4 flex flex-col gap-3 active:scale-95 transition-all overflow-hidden shadow-lg">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-fuchsia-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20 group-hover:scale-110 transition-transform shadow-inner">
              <Gamepad2 className="w-5 h-5 text-purple-400" />
            </div>
            <div className="relative z-10">
              <h3 className="text-[15px] font-black text-slate-900 dark:text-white tracking-tight">Arcade</h3>
              <p className="text-[10px] text-purple-500 dark:text-purple-400 font-bold uppercase tracking-widest mt-0.5">Premium Games</p>
            </div>
          </Link>

          <Link to="/nexoria-music" className="group relative bg-white/5 dark:bg-white/5 backdrop-blur-xl border border-white/10 hover:border-emerald-500/40 rounded-2xl p-4 flex flex-col gap-3 active:scale-95 transition-all overflow-hidden shadow-lg">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 group-hover:scale-110 transition-transform shadow-inner">
              <Music className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="relative z-10">
              <h3 className="text-[15px] font-black text-slate-900 dark:text-white tracking-tight">Music</h3>
              <p className="text-[10px] text-emerald-500 dark:text-emerald-400 font-bold uppercase tracking-widest mt-0.5">Ad-Free Audio</p>
            </div>
          </Link>

          {/* New Dashboard & Premium Menu Items */}
          <Link to={user ? "/dashboard" : "/login"} className="group relative bg-white/5 dark:bg-white/5 backdrop-blur-xl border border-white/10 hover:border-amber-500/40 rounded-2xl p-4 flex flex-col gap-3 active:scale-95 transition-all overflow-hidden shadow-lg">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-yellow-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20 group-hover:scale-110 transition-transform shadow-inner">
              <User className="w-5 h-5 text-amber-400" />
            </div>
            <div className="relative z-10 flex justify-between items-center">
              <div>
                <h3 className="text-[15px] font-black text-slate-900 dark:text-white tracking-tight">Dashboard</h3>
                <p className="text-[10px] text-amber-500 dark:text-amber-400 font-bold uppercase tracking-widest mt-0.5">My Account</p>
              </div>
              <ChevronRight className="w-4 h-4 text-amber-500/50" />
            </div>
          </Link>

          <Link to="/premium" className="group relative bg-white/5 dark:bg-white/5 backdrop-blur-xl border border-white/10 hover:border-cyan-500/40 rounded-2xl p-4 flex flex-col gap-3 active:scale-95 transition-all overflow-hidden shadow-lg">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20 group-hover:scale-110 transition-transform shadow-inner">
              <Gem className="w-5 h-5 text-cyan-400" />
            </div>
            <div className="relative z-10 flex justify-between items-center">
              <div>
                <h3 className="text-[15px] font-black text-slate-900 dark:text-white tracking-tight">VIP Pass</h3>
                <p className="text-[10px] text-cyan-500 dark:text-cyan-400 font-bold uppercase tracking-widest mt-0.5">Go Premium</p>
              </div>
              <Star className="w-3 h-3 text-cyan-500/50 fill-cyan-500/50" />
            </div>
          </Link>
        </motion.div>

      </div>

      {/* 💻 BEAUTIFUL DESKTOP HERO (LIQUID GLASS + MORPHING) */}
      <div className="hidden md:flex relative overflow-hidden bg-white dark:bg-[#050505] min-h-[85vh] flex-col items-center justify-center border-b border-black/5 dark:border-white/5 perspective-1000">
        
        {/* Dynamic Liquid Gradients (CSS driven for performance) */}
        <div className="absolute top-[-20%] left-[-10%] w-[60vw] h-[60vw] rounded-full bg-rose-500/20 dark:bg-rose-500/15 blur-[120px] pointer-events-none mix-blend-multiply dark:mix-blend-screen animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-blue-600/20 dark:bg-blue-600/15 blur-[120px] pointer-events-none mix-blend-multiply dark:mix-blend-screen animate-pulse" style={{ animationDuration: '10s', animationDelay: '2s' }} />
        <div className="absolute top-[30%] left-[40%] w-[30vw] h-[30vw] rounded-full bg-purple-500/10 dark:bg-purple-500/10 blur-[100px] pointer-events-none mix-blend-multiply dark:mix-blend-screen" />

        {/* Cinematic Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] z-0"></div>

        <div className="container mx-auto px-6 relative z-10 flex flex-col items-center text-center mt-6">
          
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, ease: "easeOut" }} className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-white/50 dark:bg-white/5 border border-black/10 dark:border-white/10 backdrop-blur-xl mb-8 shadow-sm dark:shadow-[0_0_30px_rgba(225,29,72,0.15)] hover:bg-white/80 dark:hover:bg-white/10 transition-colors cursor-default">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
            </span>
            <span className="text-sm md:text-sm font-bold tracking-widest uppercase text-slate-800 dark:text-slate-200">
              Nexoria App Store v2.0
            </span>
          </motion.div>
          
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }} className="text-5xl sm:text-6xl md:text-7xl lg:text-[7.5rem] font-black text-slate-900 dark:text-white mb-6 tracking-tight leading-[1.05] max-w-6xl drop-shadow-sm dark:drop-shadow-2xl font-heading">
            Discover Premium <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 via-purple-500 to-blue-500">Digital Experiences</span>
          </motion.h1>
          
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }} className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 font-medium max-w-3xl mb-12 leading-relaxed">
            Download top-tier applications, high-end games, and ad-free entertainment from the most beautifully designed app store on the web.
          </motion.p>
          
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.3, ease: "easeOut" }} className="flex flex-col sm:flex-row items-center justify-center gap-6 w-full sm:w-auto">
            <Link to="/category/apps" className="group relative px-8 py-4 w-full sm:w-auto bg-gradient-to-r from-rose-600 to-pink-600 rounded-2xl font-black text-lg shadow-[0_10px_40px_rgba(225,29,72,0.3)] transition-all hover:scale-105 active:scale-95 overflow-hidden flex justify-center items-center gap-3 text-white">
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
              <span className="relative z-10 flex items-center gap-2"><Compass className="w-5 h-5" /> Browse Store</span>
            </Link>
            
            <Link to="/premium" className="group px-8 py-4 w-full sm:w-auto bg-white dark:bg-[#111] hover:bg-slate-50 dark:hover:bg-[#1a1a1a] border border-black/10 dark:border-white/10 hover:border-blue-500/50 backdrop-blur-xl text-slate-900 dark:text-white rounded-2xl font-black text-lg transition-all hover:scale-105 active:scale-95 flex justify-center items-center gap-3 shadow-lg">
              <ShieldCheck className="w-5 h-5 text-blue-500" /> Unlock Premium
            </Link>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 0.6 }} className="mt-16 flex flex-wrap justify-center gap-8 md:gap-16 opacity-80">
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-1 text-amber-500">
                <Star className="w-5 h-5 fill-amber-500" /><Star className="w-5 h-5 fill-amber-500" /><Star className="w-5 h-5 fill-amber-500" /><Star className="w-5 h-5 fill-amber-500" /><Star className="w-5 h-5 fill-amber-500" />
              </div>
              <span className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">4.9/5 from 10k+ reviews</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-1 text-emerald-500 font-bold text-xl">
                <ShieldCheck className="w-6 h-6" /> 100% SECURE
              </div>
              <span className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Verified Downloads</span>
            </div>
          </motion.div>

        </div>
      </div>
      
      <div className="px-4 md:px-6 py-8 md:py-20 space-y-12 md:space-y-24 max-w-[1400px] mx-auto relative z-10">
        <ForYouCarousel />
        
        <Leaderboard />
        
        {/* Categories Section - Liquid Glass */}
        <section>
          <div className="flex items-end justify-between mb-4 md:mb-8">
            <div>
              <h2 className="text-2xl md:text-4xl font-black flex items-center gap-2 md:gap-3 text-slate-900 dark:text-white tracking-tight font-heading">
                <div className="p-2 md:p-3 bg-blue-500/10 rounded-xl md:rounded-2xl border border-blue-500/20 shadow-inner"><Compass className="w-6 h-6 md:w-8 md:h-8 text-blue-500" /></div> Categories
              </h2>
              <p className="text-[11px] md:text-base text-slate-500 dark:text-slate-400 mt-2 font-bold uppercase tracking-widest md:normal-case md:font-medium md:tracking-normal">Discover by genres</p>
            </div>
            <Link to="/category/apps" className="text-blue-600 dark:text-blue-400 hover:text-blue-500 font-bold flex items-center gap-1 text-[13px] md:text-[15px] group bg-blue-500/10 px-4 md:px-5 py-2 md:py-2.5 rounded-xl md:rounded-xl transition-all border border-blue-500/20 hover:border-blue-500/40 active:scale-95">
              View All <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {catError ? (
            <RetryComponent onRetry={refetchCats} message="Failed to load Categories" />
          ) : (
            <div className="flex overflow-x-auto gap-4 md:grid md:grid-cols-3 lg:grid-cols-4 md:gap-6 pb-6 pt-2 snap-x hide-scrollbar px-2 -mx-2 md:px-0 md:mx-0">
              {categories.map(cat => (
                <Link key={cat._id} to={`/category/${cat.slug}`} className="snap-start shrink-0 w-[240px] md:w-auto relative p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] bg-white/40 dark:bg-white/5 backdrop-blur-2xl border border-white/50 dark:border-white/10 hover:border-white dark:hover:border-white/20 flex flex-col items-start shadow-xl dark:shadow-none hover:shadow-2xl transition-all duration-300 group overflow-hidden active:scale-95 md:active:scale-100 md:hover:-translate-y-2">
                  
                  {/* Subtle hover gradient bloom */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 dark:bg-blue-500/20 rounded-full blur-3xl group-hover:bg-rose-500/20 transition-colors duration-500 -mr-10 -mt-10"></div>
                  
                  <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-white dark:bg-black/20 flex items-center justify-center mb-5 md:mb-6 group-hover:-translate-y-2 group-hover:scale-110 transition-transform duration-500 overflow-hidden relative z-10 border border-slate-200 dark:border-white/5 shadow-sm dark:shadow-inner">
                    {cat.image && cat.image !== 'default-category.jpg' ? (
                       <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                    ) : (
                       <span className="text-slate-900 dark:text-white font-black text-2xl font-heading">{cat.name.charAt(0)}</span>
                    )}
                  </div>
                  
                  <div className="relative z-10 w-full">
                    <h3 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors tracking-tight font-heading">{cat.name}</h3>
                    <p className="text-[14px] md:text-[15px] text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed font-medium group-hover:text-slate-800 dark:group-hover:text-slate-300 transition-colors">
                      {cat.description || `Explore the best applications, games, and tools in ${cat.name}.`}
                    </p>
                  </div>
                  
                  <div className="absolute bottom-6 md:bottom-8 right-6 md:right-8 opacity-0 translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500 z-10 hidden md:block">
                    <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white shadow-lg">
                      <ChevronRight className="w-5 h-5" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        <AdPlacement location="BetweenContent" />

        {/* Featured Picks */}
        {featuredRes?.data?.length > 0 && (
          <section className="relative">
            <div className="flex items-end justify-between mb-4 md:mb-8">
              <h2 className="text-2xl md:text-4xl font-black flex items-center gap-2 md:gap-3 text-slate-900 dark:text-white tracking-tight font-heading">
                <div className="p-2 md:p-3 bg-amber-500/10 rounded-xl md:rounded-2xl border border-amber-500/20 shadow-inner"><Sparkles className="w-6 h-6 md:w-8 md:h-8 text-amber-500" /></div> Featured Picks
              </h2>
            </div>
            <div className="flex overflow-x-auto gap-4 md:gap-6 pb-8 pt-4 md:pt-4 snap-x hide-scrollbar px-2 -mx-2">
              {featuredRes.data.map(app => <AppCard key={app._id} app={app} />)}
            </div>
          </section>
        )}

        {/* Trending Now */}
        {trendingRes?.data?.length > 0 && (
          <section className="relative mt-4 md:mt-8">
            <div className="flex items-end justify-between mb-4 md:mb-8">
              <h2 className="text-2xl md:text-4xl font-black flex items-center gap-2 md:gap-3 text-slate-900 dark:text-white tracking-tight font-heading">
                <div className="p-2 md:p-3 bg-rose-500/10 rounded-xl md:rounded-2xl border border-rose-500/20 shadow-inner"><Flame className="w-6 h-6 md:w-8 md:h-8 text-rose-500" /></div> Trending Now
              </h2>
            </div>
            <div className="flex overflow-x-auto gap-4 md:gap-6 pb-8 pt-4 md:pt-4 snap-x hide-scrollbar px-2 -mx-2">
              {trendingRes.data.map(app => <AppCard key={app._id} app={app} />)}
            </div>
          </section>
        )}
        
        {/* Editor's Choice */}
        {editorChoiceRes?.data?.length > 0 && (
          <section className="relative mt-4 md:mt-8">
            <div className="flex items-end justify-between mb-4 md:mb-8">
              <h2 className="text-2xl md:text-4xl font-black flex items-center gap-2 md:gap-3 text-slate-900 dark:text-white tracking-tight font-heading">
                <div className="p-2 md:p-3 bg-purple-500/10 rounded-xl md:rounded-2xl border border-purple-500/20 shadow-inner"><Award className="w-6 h-6 md:w-8 md:h-8 text-purple-500" /></div> Editor's Choice
              </h2>
            </div>
            <div className="flex overflow-x-auto gap-4 md:gap-6 pb-8 pt-4 md:pt-4 snap-x hide-scrollbar px-2 -mx-2">
              {editorChoiceRes.data.map(app => <AppCard key={app._id} app={app} />)}
            </div>
          </section>
        )}

        <AdPlacement location="Footer" />
      </div>

      <style jsx="true">{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .perspective-1000 {
          perspective: 1000px;
        }
      `}</style>
    </div>
  );
};

export default Home;
