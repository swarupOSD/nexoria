import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Compass, RefreshCw, AlertCircle, ChevronRight, Star, Download } from 'lucide-react';
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
    <motion.div 
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300 }}
      className="snap-start shrink-0 w-[160px] md:w-[180px] group"
    >
      <Link to={`/post/${app.slug}`} className="block">
        <div className="flex flex-col gap-3">
          <div className="aspect-square w-full rounded-3xl overflow-hidden relative border border-white/10 bg-[#111] shadow-lg group-hover:shadow-[0_0_20px_rgba(168,85,247,0.15)] group-hover:border-purple-500/30 transition-all duration-300">
            <FallbackImage src={app.appLogo} fallbackType="logo" alt={app.title} className="w-full h-full object-contain p-2 group-hover:scale-110 transition-transform duration-500" />
          {isPremium && (
            <div className="absolute top-2 right-2 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-[9px] font-bold px-2 py-0.5 rounded shadow-md uppercase tracking-wider">
              PRO
            </div>
          )}
          {app.auraScore > 0 && (
            <div className="absolute bottom-2 right-2 z-10">
              <AuraBadge score={app.auraScore} />
            </div>
          )}
        </div>
        <div className="space-y-1">
          <h3 className="font-bold text-white text-sm line-clamp-1 group-hover:text-primary transition-colors">{app.title}</h3>
          <div className="flex items-center gap-3 text-xs text-slate-400">
            <span className="flex items-center gap-1"><Star className="w-3 h-3 text-amber-400 fill-amber-400" /> {app.averageRating || '4.5'}</span>
            <span className="flex items-center gap-1"><Download className="w-3 h-3" /> {app.downloads > 1000 ? (app.downloads/1000).toFixed(1)+'k' : (app.downloads || 0)}</span>
          </div>
        </div>
        </div>
      </Link>
    </motion.div>
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
    <div className="bg-[#050505] min-h-screen text-white pb-20 font-sans">
      <SEO title="Nexoria – Movies, K-Dramas, Anime, Games, Music & Premium Apps | All In One" />
      <AdPlacement location="Header" />

      {/* 🚀 Futuristic Nexoria Hero Section */}
      <div className="relative overflow-hidden border-b border-white/5 bg-[#050505] min-h-[85vh] flex items-center justify-center">
        
        {/* Cinematic Animated Background Images (Chobi) */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.15 }}
          transition={{ duration: 2 }}
          className="absolute inset-0 z-0"
        >
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=2025&auto=format&fit=crop')] bg-cover bg-center mix-blend-screen opacity-40"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/80 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-transparent to-[#050505]"></div>
        </motion.div>

        {/* Dynamic Background Grid & Orbs */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] z-0"></div>
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3], rotate: [0, 90, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-purple-600/20 rounded-full blur-[150px] mix-blend-screen pointer-events-none"
        />
        <motion.div 
          animate={{ scale: [1, 1.5, 1], opacity: [0.2, 0.4, 0.2], rotate: [0, -90, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] bg-blue-600/20 rounded-full blur-[150px] mix-blend-screen pointer-events-none"
        />
        
        {/* Floating Emojis / Icons background */}
        <motion.div animate={{ y: [0, -20, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} className="absolute top-[20%] left-[10%] text-4xl opacity-20 hidden md:block">🎮</motion.div>
        <motion.div animate={{ y: [0, 20, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }} className="absolute top-[30%] right-[15%] text-5xl opacity-20 hidden md:block">🍿</motion.div>
        <motion.div animate={{ y: [0, -15, 0], rotate: [0, 10, 0] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }} className="absolute bottom-[20%] left-[20%] text-4xl opacity-20 hidden md:block">🎧</motion.div>
        <motion.div animate={{ y: [0, 25, 0], rotate: [0, -15, 0] }} transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }} className="absolute bottom-[30%] right-[10%] text-5xl opacity-20 hidden md:block">🎬</motion.div>

        <div className="container mx-auto px-6 pt-32 pb-24 relative z-10 flex flex-col items-center text-center mt-10">
          {/* Top Badge */}
          <motion.div 
            initial={{ opacity: 0, y: -20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, type: "spring", bounce: 0.5 }}
            className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl mb-10 shadow-[0_0_30px_rgba(168,85,247,0.15)] hover:bg-white/10 transition-colors cursor-default"
          >
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <span className="text-sm md:text-base font-bold tracking-widest uppercase text-slate-200">
              Welcome to Nexoria Universe ✨
            </span>
          </motion.div>
          
          {/* Main Title */}
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-4xl sm:text-6xl md:text-7xl lg:text-[6.5rem] font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-200 to-blue-400 mb-8 tracking-tight leading-[1.1] max-w-6xl drop-shadow-2xl font-heading"
          >
            Everything You <span className="text-purple-400">Watch</span>, Play & <span className="text-blue-400">Create</span>
          </motion.h1>
          
          {/* Subtitle */}
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-xl md:text-3xl text-slate-300 font-medium max-w-4xl mb-12 leading-relaxed"
          >
            One account ⚡ One app 📱 Every story 🍿 Every game 🕹️ Every beat 🎵
          </motion.p>
          
          {/* Call to Actions */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-6"
          >
            <Link to="/moviebox" className="group relative px-8 py-5 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl font-black text-lg md:text-xl shadow-[0_0_40px_rgba(168,85,247,0.4)] transition-all hover:scale-105 active:scale-95 overflow-hidden flex items-center gap-3 text-white">
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
              <span className="relative z-10 flex items-center gap-2">🚀 Explore Universe <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" /></span>
            </Link>
            
            <Link to="/premium" className="group px-8 py-5 bg-[#111] hover:bg-[#1a1a1a] border border-white/10 hover:border-purple-500/50 backdrop-blur-xl text-white rounded-2xl font-black text-lg md:text-xl transition-all hover:scale-105 active:scale-95 flex items-center gap-3 shadow-xl">
              💎 Go Premium
            </Link>
          </motion.div>

          {/* Stats / Trust Badges */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="mt-20 flex flex-wrap justify-center gap-8 md:gap-16 opacity-70 grayscale hover:grayscale-0 transition-all duration-500"
          >
            <div className="flex flex-col items-center gap-2">
              <span className="text-3xl font-black text-white">50K+</span>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Users</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <span className="text-3xl font-black text-white">10K+</span>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Movies & Apps</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <span className="text-3xl font-black text-white">4.9/5</span>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">User Rating ⭐️</span>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6 py-12 lg:py-20 space-y-24 max-w-[1400px]">
        <ForYouCarousel />

        <Leaderboard />
        
        {/* Categories Section */}
        <section>
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold flex items-center gap-3 text-white">
                <Compass className="w-8 h-8 text-primary" /> Explore Categories
              </h2>
              <p className="text-slate-400 mt-2">Discover apps by your favorite genres</p>
            </div>
            <Link to="/category/apps" className="text-primary hover:text-primary-600 font-bold flex items-center gap-1 text-sm md:text-base group">
              View All Categories <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {catError ? (
            <RetryComponent onRetry={refetchCats} message="Failed to load Categories" />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 pb-6">
              {categories.map(cat => (
                <Link key={cat._id} to={`/category/${cat.slug}`} className="relative p-6 rounded-[2rem] bg-gradient-to-b from-[#161616] to-[#0A0A0A] border border-white/5 hover:border-primary/50 flex flex-col items-start hover:shadow-2xl hover:shadow-primary/20 transition-all duration-500 group overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-colors duration-500 -mr-10 -mt-10"></div>
                  
                  <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mb-5 group-hover:-translate-y-2 group-hover:scale-110 group-hover:shadow-lg transition-transform duration-500 overflow-hidden relative z-10 border border-white/5">
                    {cat.image && cat.image !== 'default-category.jpg' ? (
                       <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                    ) : (
                       <span className="text-white font-black text-xl bg-gradient-to-br from-white to-slate-400 bg-clip-text text-transparent">{cat.name.charAt(0)}</span>
                    )}
                  </div>
                  
                  <div className="relative z-10 w-full">
                    <h3 className="text-lg md:text-xl font-bold text-white mb-2 group-hover:text-primary transition-colors tracking-tight">{cat.name}</h3>
                    <p className="text-xs md:text-sm text-slate-400 line-clamp-2 leading-relaxed font-medium group-hover:text-slate-300 transition-colors">
                      {cat.description || `Explore the best applications, games, and tools in ${cat.name}.`}
                    </p>
                  </div>
                  
                  <div className="absolute bottom-6 right-6 opacity-0 translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500 z-10">
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
          <section>
            <div className="flex items-end justify-between mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-white">Featured Apps</h2>
            </div>
            <div className="flex overflow-x-auto gap-6 pb-6 snap-x hide-scrollbar">
              {featuredRes.data.map(app => <AppCard key={app._id} app={app} />)}
            </div>
          </section>
        )}

        {/* Trending Now */}
        {trendingRes?.data?.length > 0 && (
          <section>
            <div className="flex items-end justify-between mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-white">Trending Now</h2>
            </div>
            <div className="flex overflow-x-auto gap-6 pb-6 snap-x hide-scrollbar">
              {trendingRes.data.map(app => <AppCard key={app._id} app={app} />)}
            </div>
          </section>
        )}
        
        {/* Editor's Choice */}
        {editorChoiceRes?.data?.length > 0 && (
          <section>
            <div className="flex items-end justify-between mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-white">Editor's Choice</h2>
            </div>
            <div className="flex overflow-x-auto gap-6 pb-6 snap-x hide-scrollbar">
              {editorChoiceRes.data.map(app => <AppCard key={app._id} app={app} />)}
            </div>
          </section>
        )}

        <AdPlacement location="Footer" />
      </div>
    </div>
  );
};

export default Home;
