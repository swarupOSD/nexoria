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
    <Link to={`/post/${app.slug}`} className="snap-start shrink-0 w-[260px] md:w-[300px] card-hover bg-surface-container-lowest rounded-2xl overflow-hidden border-fine group relative flex flex-col">
      <div className="w-full h-40 md:h-48 bg-surface-container relative">
        <FallbackImage src={app.appLogo} fallbackType="logo" alt={app.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest via-surface-container-lowest/20 to-transparent"></div>
        {isPremium && (
          <div className="absolute top-2 right-2 bg-gradient-to-bl from-rose-500 to-pink-500 text-white text-[10px] font-black px-2 py-1 rounded-lg shadow-lg uppercase tracking-widest z-30 flex items-center gap-1">
            <Gem className="w-3 h-3" /> PRO
          </div>
        )}
      </div>
      <div className="p-md flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-xs">
          <h3 className="font-headline-sm text-on-surface truncate flex-1 pr-2">{app.title}</h3>
          <span className="flex items-center gap-xs font-label-sm text-secondary bg-secondary/10 px-sm py-0.5 rounded-full shrink-0">
            <Star className="w-3 h-3 fill-secondary text-secondary" />
            {app.averageRating || '4.5'}
          </span>
        </div>
        <p className="font-body-sm text-on-surface-variant line-clamp-2 mb-md flex-grow">{app.description || app.title}</p>
        <div className="flex items-center justify-between mt-auto">
          <span className="font-label-caps text-primary tracking-wider border-b border-primary/30 pb-0.5">{app.categoryObj?.name || 'App'}</span>
          <button className="w-10 h-10 rounded-full bg-surface-container-highest border border-outline-variant/30 flex items-center justify-center text-on-surface-variant group-hover:bg-primary group-hover:text-on-primary transition-all duration-300 transform group-hover:rotate-12 group-hover:scale-110 shadow-sm">
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>
    </Link>
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

      {/* 📱💻 RESPONSIVE STITCH HERO */}
      <header className="relative w-full min-h-screen flex items-center justify-center pt-24 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/60 to-background z-10"></div>
          <div className="w-full h-full bg-cover bg-center bg-no-repeat opacity-60" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBpon9Ou1srDve1SKBkHx95ehx1TIaFSsLgErxNuy9ZmIPKJ18jFMc4Zcvnf15FjtQ1vItZqAj_wG-hBhr5ZUHka4rj4dQ5kZPodUM-aLYZsywubx-sGo8-3Y5MJkcDKmUEcoWyZQz27T4Tyrk_50_toue-Q_VcEGxk4ndj_6vN0qtKqWw3bhZoY5muQKlzuv6bjKL0J_qTPHyFg1JvjiPjk91gzhtaApxhFz8i5HUgrYVvSxhDZYD5')" }}></div>
        </div>
        <div className="relative z-20 text-center px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto flex flex-col items-center">
          <span className="font-label-caps text-tertiary mb-sm tracking-widest uppercase">Beyond Entertainment</span>
          <h1 className="font-display-lg text-[48px] md:text-display-lg font-bold mb-md text-gradient tracking-tight">EXPLORE THE NEXUS</h1>
          <p className="font-body-lg text-on-surface-variant max-w-2xl mb-xl">The ultimate hub for gaming, technology, and cinema. Immerse yourself in a curated digital luxury experience.</p>
          <div className="flex flex-col sm:flex-row gap-md">
            <Link to="/category/apps" className="px-8 py-3 rounded-xl bg-primary text-on-primary font-label-caps shadow-[0_0_20px_rgba(208,188,255,0.3)] hover:shadow-[0_0_30px_rgba(208,188,255,0.5)] transition-all duration-300 transform hover:scale-105">
              Browse Store
            </Link>
            <Link to="/premium" className="px-8 py-3 rounded-xl bg-surface/50 backdrop-blur-md border border-outline-variant/30 text-on-surface font-label-caps hover:bg-surface-container transition-all duration-300 flex items-center justify-center gap-sm">
              <ShieldCheck className="w-4 h-4" /> Unlock Premium
            </Link>
          </div>
        </div>
      </header>
      
      <div className="px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto py-xl space-y-12 md:space-y-24 relative z-10">
        <ForYouCarousel />
        
        <Leaderboard />
        
        {/* Categories Section - Liquid Glass */}
        <section>
          <div className="flex items-end justify-between mb-4 md:mb-8">
            <div>
              <h2 className="font-headline-md text-on-surface flex items-center gap-sm">
                <div className="p-sm bg-primary/10 rounded-xl border border-primary/20"><Compass className="w-6 h-6 text-primary" /></div> Categories
              </h2>
              <p className="font-body-sm text-on-surface-variant mt-2">Discover by genres</p>
            </div>
            <Link to="/category/apps" className="font-label-caps text-primary hover:text-primary-fixed-dim flex items-center gap-1 group bg-primary/10 px-md py-sm rounded-xl transition-all border border-primary/20 hover:border-primary/40 active:scale-95">
              View All <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {catError ? (
            <RetryComponent onRetry={refetchCats} message="Failed to load Categories" />
          ) : (
            <div className="flex overflow-x-auto gap-4 md:grid md:grid-cols-3 lg:grid-cols-4 md:gap-6 pb-6 pt-2 snap-x hide-scrollbar px-2 -mx-2 md:px-0 md:mx-0">
              {categories.map(cat => (
                <Link key={cat._id} to={`/category/${cat.slug}`} className="snap-start shrink-0 w-[240px] md:w-auto relative p-xl rounded-[2.5rem] bg-surface-container-lowest border border-outline-variant/20 hover:border-outline-variant/40 flex flex-col items-start transition-all duration-300 group overflow-hidden active:scale-95 md:active:scale-100 md:hover:-translate-y-2 card-hover">
                  
                  {/* Subtle hover gradient bloom */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl group-hover:bg-tertiary/20 transition-colors duration-500 -mr-10 -mt-10"></div>
                  
                  <div className="w-16 h-16 rounded-2xl bg-surface-container flex items-center justify-center mb-6 group-hover:-translate-y-2 group-hover:scale-110 transition-transform duration-500 overflow-hidden relative z-10 border border-outline-variant/10 shadow-sm">
                    {cat.image && cat.image !== 'default-category.jpg' ? (
                       <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                    ) : (
                       <span className="text-on-surface font-headline-md">{cat.name.charAt(0)}</span>
                    )}
                  </div>
                  
                  <div className="relative z-10 w-full">
                    <h3 className="font-headline-sm text-on-surface mb-xs group-hover:text-primary transition-colors">{cat.name}</h3>
                    <p className="font-body-sm text-on-surface-variant line-clamp-2 transition-colors">
                      {cat.description || `Explore the best applications, games, and tools in ${cat.name}.`}
                    </p>
                  </div>
                  
                  <div className="absolute bottom-8 right-8 opacity-0 translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500 z-10 hidden md:block">
                    <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-on-primary shadow-lg">
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
              <h2 className="font-headline-md text-on-surface flex items-center gap-sm">
                <div className="p-sm bg-primary/10 rounded-xl border border-primary/20"><Sparkles className="w-6 h-6 text-primary" /></div> Featured Picks
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
              <h2 className="font-headline-md text-on-surface flex items-center gap-sm">
                <div className="p-sm bg-secondary/10 rounded-xl border border-secondary/20"><Flame className="w-6 h-6 text-secondary" /></div> Trending Now
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
              <h2 className="font-headline-md text-on-surface flex items-center gap-sm">
                <div className="p-sm bg-tertiary/10 rounded-xl border border-tertiary/20"><Award className="w-6 h-6 text-tertiary" /></div> Editor's Choice
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
