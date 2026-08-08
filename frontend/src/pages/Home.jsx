import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Compass, RefreshCw, AlertCircle, ChevronRight, Star, Download, Flame, Sparkles, Award, Gamepad2, Film, Music, Smartphone, User, Rocket, Gem, LayoutTemplate, PlayCircle } from 'lucide-react';
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
  <div className="flex flex-col items-center justify-center py-12 px-4 text-center border border-white/5 rounded-2xl bg-white/5">
    <AlertCircle className="w-12 h-12 text-rose-500 mb-4 opacity-80" />
    <h3 className="text-xl font-bold text-white mb-2">{message}</h3>
    <p className="text-slate-400 mb-6 max-w-md mx-auto">Check your connection and try again.</p>
    <button onClick={onRetry} className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white font-bold rounded-xl hover:bg-primary-600 transition-colors shadow-lg shadow-primary/30">
      <RefreshCw className="w-4 h-4" /> Try Again
    </button>
  </div>
);

const AppCard = React.memo(({ app }) => {
  const isPremium = app.isPremium || app.premiumOnly;
  
  return (
    <div className="snap-start shrink-0 w-[130px] md:w-[180px] group cursor-pointer">
      <Link to={`/post/${app.slug}`} className="block relative">
        <div className="relative z-10 flex flex-col gap-3 md:gap-4">
          <div className="aspect-square w-full rounded-2xl md:rounded-3xl overflow-hidden relative bg-white border border-slate-200 dark:bg-slate-800 dark:border-slate-700 shadow-sm group-hover:shadow-md transition-all duration-300">
            <div className="absolute inset-2 md:inset-4 rounded-xl md:rounded-2xl overflow-hidden flex items-center justify-center bg-slate-50 dark:bg-slate-900 z-10">
              <FallbackImage src={app.appLogo} fallbackType="logo" alt={app.title} className="w-[85%] h-[85%] object-contain group-hover:scale-105 transition-transform duration-300" />
            </div>
            
            {isPremium && (
              <div className="absolute top-0 right-0 bg-blue-600 text-white text-[9px] md:text-[10px] font-bold px-2 md:px-3 py-1 md:py-1.5 rounded-bl-xl shadow-sm uppercase tracking-widest z-30">
                PRO
              </div>
            )}
            {app.auraScore > 0 && (
              <div className="absolute bottom-1 md:bottom-2 right-1 md:right-2 z-30 scale-75 md:scale-100 origin-bottom-right">
                <AuraBadge score={app.auraScore} />
              </div>
            )}
          </div>
          
          <div className="space-y-1 md:space-y-2 px-1">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-[13px] md:text-[16px] line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">{app.title}</h3>
            <div className="flex items-center gap-2 md:gap-3 text-[10px] md:text-xs font-medium text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1 md:gap-1.5"><Star className="w-3 h-3 md:w-3.5 md:h-3.5 fill-amber-400 text-amber-400" /> {app.averageRating || '4.5'}</span>
              <span className="flex items-center gap-1 md:gap-1.5"><Download className="w-3 h-3 md:w-3.5 md:h-3.5 text-blue-500" /> {app.downloads > 1000 ? (app.downloads/1000).toFixed(1)+'k' : (app.downloads || 0)}</span>
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
    <div className="font-sans bg-transparent min-h-screen text-slate-900 dark:text-slate-50 pb-24 md:pb-20 selection:bg-blue-500/30 relative">
      <SEO title="Nexoria – Movies, K-Dramas, Anime, Games, Music & Premium Apps | All In One" />
      <AdPlacement location="Header" />

      {/* 📱 ULTRA-COMPACT MOBILE HERO (VISIBLE ONLY ON PHONES) */}
      <div className="md:hidden pt-20 px-4 pb-6 space-y-6 relative overflow-hidden">
        
        {/* Welcome Text */}
        <div className="flex flex-col">
          <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold uppercase tracking-widest mb-1 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-500 animate-pulse"></span>
            Welcome to Nexoria
          </span>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50 leading-[1.1] tracking-tight">
            The Ultimate <br/> Entertainment Hub
          </h1>
        </div>

        {/* Quick Access Mobile Grid - Premium Menu */}
        <div className="grid grid-cols-2 gap-3 md:gap-4 relative">
          <Link to="/category/apps" className="bg-gradient-to-br from-blue-500/20 to-indigo-500/5 border border-blue-500/20 hover:border-blue-500/40 rounded-2xl p-4 flex flex-col gap-3 active:scale-95 transition-all relative overflow-hidden group shadow-[0_0_15px_rgba(59,130,246,0.1)]">
            <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-blue-500/20 rounded-full blur-2xl group-active:bg-blue-500/40 transition-colors"></div>
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500/20 to-indigo-500/20 flex items-center justify-center border border-blue-500/30 group-active:scale-110 transition-transform shadow-inner">
              <LayoutTemplate className="w-4 h-4 text-blue-400 drop-shadow-[0_0_8px_rgba(96,165,250,0.8)]" />
            </div>
            <div className="relative z-10">
              <h3 className="text-[15px] font-black text-white tracking-tight">Studio</h3>
              <p className="text-[10px] text-blue-400/80 font-bold uppercase tracking-widest mt-0.5">Mod Apps</p>
            </div>
          </Link>

          <Link to="/moviebox" className="bg-gradient-to-br from-rose-500/20 to-pink-500/5 border border-rose-500/20 hover:border-rose-500/40 rounded-2xl p-4 flex flex-col gap-3 active:scale-95 transition-all relative overflow-hidden group shadow-[0_0_15px_rgba(244,63,94,0.1)]">
            <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-rose-500/20 rounded-full blur-2xl group-active:bg-rose-500/40 transition-colors"></div>
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-rose-500/20 to-pink-500/20 flex items-center justify-center border border-rose-500/30 group-active:scale-110 transition-transform shadow-inner">
              <Film className="w-4 h-4 text-rose-400 drop-shadow-[0_0_8px_rgba(251,113,133,0.8)]" />
            </div>
            <div className="relative z-10">
              <h3 className="text-[15px] font-black text-white tracking-tight">MovieBox</h3>
              <p className="text-[10px] text-rose-400/80 font-bold uppercase tracking-widest mt-0.5">Movies & Shows</p>
            </div>
          </Link>

          <Link to="/category/games" className="bg-gradient-to-br from-purple-500/20 to-fuchsia-500/5 border border-purple-500/20 hover:border-purple-500/40 rounded-2xl p-4 flex flex-col gap-3 active:scale-95 transition-all relative overflow-hidden group shadow-[0_0_15px_rgba(168,85,247,0.1)]">
            <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-purple-500/20 rounded-full blur-2xl group-active:bg-purple-500/40 transition-colors"></div>
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500/20 to-fuchsia-500/20 flex items-center justify-center border border-purple-500/30 group-active:scale-110 transition-transform shadow-inner">
              <Gamepad2 className="w-4 h-4 text-purple-400 drop-shadow-[0_0_8px_rgba(192,132,252,0.8)]" />
            </div>
            <div className="relative z-10">
              <h3 className="text-[15px] font-black text-white tracking-tight">Arcade</h3>
              <p className="text-[10px] text-purple-400/80 font-bold uppercase tracking-widest mt-0.5">Premium Games</p>
            </div>
          </Link>

          <Link to="/nexoria-music" className="bg-gradient-to-br from-emerald-500/20 to-teal-500/5 border border-emerald-500/20 hover:border-emerald-500/40 rounded-2xl p-4 flex flex-col gap-3 active:scale-95 transition-all relative overflow-hidden group shadow-[0_0_15px_rgba(16,185,129,0.1)]">
            <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-emerald-500/20 rounded-full blur-2xl group-active:bg-emerald-500/40 transition-colors"></div>
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center border border-emerald-500/30 group-active:scale-110 transition-transform shadow-inner">
              <Music className="w-4 h-4 text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
            </div>
            <div className="relative z-10">
              <h3 className="text-[15px] font-black text-white tracking-tight">Music</h3>
              <p className="text-[10px] text-emerald-400/80 font-bold uppercase tracking-widest mt-0.5">Ad-Free Audio</p>
            </div>
          </Link>

          {/* New Dashboard & Premium Menu Items */}
          <Link to={user ? "/dashboard" : "/login"} className="bg-gradient-to-br from-amber-500/20 to-yellow-500/5 border border-amber-500/20 hover:border-amber-500/40 rounded-2xl p-4 flex flex-col gap-3 active:scale-95 transition-all relative overflow-hidden group shadow-[0_0_15px_rgba(245,158,11,0.1)]">
            <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-amber-500/20 rounded-full blur-2xl group-active:bg-amber-500/40 transition-colors"></div>
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-500/20 to-yellow-500/20 flex items-center justify-center border border-amber-500/30 group-active:scale-110 transition-transform shadow-inner">
              <User className="w-4 h-4 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
            </div>
            <div className="relative z-10 flex justify-between items-center">
              <div>
                <h3 className="text-[15px] font-black text-white tracking-tight">Dashboard</h3>
                <p className="text-[10px] text-amber-400/80 font-bold uppercase tracking-widest mt-0.5">My Account</p>
              </div>
              <ChevronRight className="w-4 h-4 text-amber-500/50" />
            </div>
          </Link>

          <Link to="/premium" className="bg-gradient-to-br from-cyan-500/20 to-blue-500/5 border border-cyan-500/20 hover:border-cyan-500/40 rounded-2xl p-4 flex flex-col gap-3 active:scale-95 transition-all relative overflow-hidden group shadow-[0_0_15px_rgba(6,182,212,0.1)]">
            <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-cyan-500/20 rounded-full blur-2xl group-active:bg-cyan-500/40 transition-colors"></div>
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center border border-cyan-500/30 group-active:scale-110 transition-transform shadow-inner">
              <Gem className="w-4 h-4 text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
            </div>
            <div className="relative z-10 flex justify-between items-center">
              <div>
                <h3 className="text-[15px] font-black text-white tracking-tight">VIP Pass</h3>
                <p className="text-[10px] text-cyan-400/80 font-bold uppercase tracking-widest mt-0.5">Go Premium</p>
              </div>
              <Star className="w-3 h-3 text-cyan-500/50 fill-cyan-500/50" />
            </div>
          </Link>
        </div>

        {/* Global Stats - Mobile Version */}
        <div className="flex justify-between items-center bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-xl">
          <div className="text-center flex-1 border-r border-white/10">
            <p className="text-lg font-black text-white">50K+</p>
            <p className="text-[9px] text-white/50 font-bold uppercase tracking-widest">Users</p>
          </div>
          <div className="text-center flex-1 border-r border-white/10">
            <p className="text-lg font-black text-white">10K+</p>
            <p className="text-[9px] text-white/50 font-bold uppercase tracking-widest">Items</p>
          </div>
          <div className="text-center flex-1">
            <p className="text-lg font-black text-white flex justify-center items-center gap-1">4.9 <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" /></p>
            <p className="text-[9px] text-white/50 font-bold uppercase tracking-widest">Rating</p>
          </div>
        </div>
      </div>



      <div className="px-4 md:px-6 py-6 md:py-20 space-y-10 md:space-y-24 max-w-[1400px] mx-auto">
        <ForYouCarousel />
        
        <Leaderboard />
        
        {/* Categories Section */}
        <section>
          <div className="flex items-end justify-between mb-4 md:mb-8">
            <div>
              <h2 className="text-2xl md:text-4xl font-black flex items-center gap-2 md:gap-3 text-white tracking-tight">
                <div className="p-2 md:p-3 bg-white/5 rounded-xl md:rounded-2xl border border-white/10 shadow-inner"><Compass className="w-6 h-6 md:w-8 md:h-8 text-blue-400" /></div> Categories
              </h2>
              <p className="text-[11px] md:text-base text-white/50 md:text-white/60 mt-2 font-bold uppercase tracking-widest md:normal-case md:font-medium md:tracking-normal">Discover by genres</p>
            </div>
            <Link to="/category/apps" className="text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1 text-[13px] md:text-[15px] group bg-blue-500/10 px-3 md:px-4 py-1.5 md:py-2 rounded-lg md:rounded-xl transition-colors border border-blue-500/20 active:scale-95">
              View All <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {catError ? (
            <RetryComponent onRetry={refetchCats} message="Failed to load Categories" />
          ) : (
            <div className="flex overflow-x-auto gap-4 md:grid md:grid-cols-3 lg:grid-cols-4 md:gap-6 pb-6 pt-2 snap-x hide-scrollbar px-2 -mx-2 md:px-0 md:mx-0">
              {categories.map(cat => (
                <Link key={cat._id} to={`/category/${cat.slug}`} className="snap-start shrink-0 w-[240px] md:w-auto relative p-5 md:p-6 rounded-[2rem] md:rounded-[2.5rem] bg-white/5 backdrop-blur-3xl border border-white/10 hover:border-white/20 flex flex-col items-start hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)] transition-all duration-300 group overflow-hidden active:scale-95 md:active:scale-100 hover:-translate-y-1">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl group-hover:bg-blue-500/20 transition-colors duration-500 -mr-10 -mt-10"></div>
                  
                  <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-black/20 flex items-center justify-center mb-4 md:mb-6 group-hover:-translate-y-2 group-hover:scale-110 transition-transform duration-500 overflow-hidden relative z-10 border border-white/5 shadow-inner">
                    {cat.image && cat.image !== 'default-category.jpg' ? (
                       <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                    ) : (
                       <span className="text-white font-black text-xl">{cat.name.charAt(0)}</span>
                    )}
                  </div>
                  
                  <div className="relative z-10 w-full">
                    <h3 className="text-lg md:text-xl font-black text-white mb-1.5 md:mb-2 group-hover:text-blue-400 transition-colors tracking-tight">{cat.name}</h3>
                    <p className="text-[13px] md:text-[15px] text-white/50 line-clamp-2 leading-relaxed font-medium group-hover:text-white/70 transition-colors">
                      {cat.description || `Explore the best applications, games, and tools in ${cat.name}.`}
                    </p>
                  </div>
                  
                  <div className="absolute bottom-5 md:bottom-6 right-5 md:right-6 opacity-0 translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500 z-10 hidden md:block">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary backdrop-blur-md">
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        <AdPlacement location="BetweenContent" />

        {/* Featured Apps */}
        {featuredRes?.data?.length > 0 && (
          <section className="relative">
            <div className="flex items-end justify-between mb-4 md:mb-8">
              <h2 className="text-2xl md:text-4xl font-black flex items-center gap-2 md:gap-3 text-white tracking-tight">
                <div className="p-2 md:p-3 bg-white/5 rounded-xl md:rounded-2xl border border-white/10 shadow-inner"><Sparkles className="w-6 h-6 md:w-8 md:h-8 text-amber-400" /></div> Featured Picks
              </h2>
            </div>
            <div className="flex overflow-x-auto gap-4 md:gap-6 pb-6 pt-2 md:pt-4 snap-x hide-scrollbar px-2 -mx-2">
              {featuredRes.data.map(app => <AppCard key={app._id} app={app} />)}
            </div>
          </section>
        )}

        {/* Trending Now */}
        {trendingRes?.data?.length > 0 && (
          <section className="relative mt-8 md:mt-12">
            <div className="flex items-end justify-between mb-4 md:mb-8">
              <h2 className="text-2xl md:text-4xl font-black flex items-center gap-2 md:gap-3 text-white tracking-tight">
                <div className="p-2 md:p-3 bg-white/5 rounded-xl md:rounded-2xl border border-white/10 shadow-inner"><Flame className="w-6 h-6 md:w-8 md:h-8 text-rose-500" /></div> Trending Now
              </h2>
            </div>
            <div className="flex overflow-x-auto gap-4 md:gap-6 pb-6 pt-2 md:pt-4 snap-x hide-scrollbar px-2 -mx-2">
              {trendingRes.data.map(app => <AppCard key={app._id} app={app} />)}
            </div>
          </section>
        )}
        
        {/* Editor's Choice */}
        {editorChoiceRes?.data?.length > 0 && (
          <section className="relative mt-8 md:mt-12">
            <div className="flex items-end justify-between mb-4 md:mb-8">
              <h2 className="text-2xl md:text-4xl font-black flex items-center gap-2 md:gap-3 text-white tracking-tight">
                <div className="p-2 md:p-3 bg-white/5 rounded-xl md:rounded-2xl border border-white/10 shadow-inner"><Award className="w-6 h-6 md:w-8 md:h-8 text-purple-500" /></div> Editor's Choice
              </h2>
            </div>
            <div className="flex overflow-x-auto gap-4 md:gap-6 pb-6 pt-2 md:pt-4 snap-x hide-scrollbar px-2 -mx-2">
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
      `}</style>
    </div>
  );
};

export default Home;
