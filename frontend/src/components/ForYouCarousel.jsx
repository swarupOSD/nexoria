import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Sparkles, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useGetRecommendationsQuery } from '../features/post/postApiSlice';
import FallbackImage from './FallbackImage';
import { useSelector } from 'react-redux';

const ForYouCarousel = () => {
  const { user } = useSelector(state => state.auth);
  const { data: recommendationsRes, isLoading, isError } = useGetRecommendationsQuery(undefined, {
    skip: !user // Only fetch if user is logged in
  });
  const carouselRef = useRef(null);

  if (!user || isError || !recommendationsRes?.data || recommendationsRes.data.length === 0) {
    return null; // Don't show if not logged in or no data
  }

  const posts = recommendationsRes.data;

  const scroll = (direction) => {
    if (carouselRef.current) {
      const scrollAmount = direction === 'left' ? -300 : 300;
      carouselRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="my-12">
      <div className="flex items-center justify-between mb-6 px-2">
        <div>
          <h2 className="text-2xl font-black text-slate-800 dark:text-white flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-purple-500" /> Handpicked For Your Aura
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Based on your Vibe History
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => scroll('left')}
            className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-white transition"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button 
            onClick={() => scroll('right')}
            className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-white transition"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="relative group">
        {/* Glow effect behind carousel */}
        <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-slate-50 dark:from-[#030303] to-transparent z-10 pointer-events-none"></div>
        <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-slate-50 dark:from-[#030303] to-transparent z-10 pointer-events-none"></div>

        <div 
          ref={carouselRef}
          className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-6 pt-2 px-2"
        >
          {isLoading ? (
            Array(5).fill(0).map((_, i) => (
              <div key={i} className="min-w-[280px] h-[320px] rounded-3xl bg-slate-200 dark:bg-slate-800 animate-pulse shrink-0 snap-center" />
            ))
          ) : (
            posts.map((post) => (
              <Link 
                key={post._id} 
                to={`/post/${post.slug}`}
                className="relative min-w-[280px] w-[280px] h-[320px] rounded-3xl overflow-hidden shrink-0 snap-center group/card"
              >
                <FallbackImage 
                  src={post.featuredImage || post.appLogo} 
                  fallbackType="app"
                  alt={post.title}
                  className="w-full h-full object-cover transition duration-700 group-hover/card:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-80 group-hover/card:opacity-90 transition-opacity"></div>
                
                <div className="absolute inset-0 p-5 flex flex-col justify-end">
                  <div className="flex items-center gap-2 mb-2">
                    {post.category && (
                      <span className="px-2 py-1 bg-white/20 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider rounded-lg border border-white/20">
                        {post.category.name}
                      </span>
                    )}
                    <span className="flex items-center gap-1 text-amber-400 text-xs font-bold bg-black/40 px-2 py-1 rounded-lg backdrop-blur-md">
                      <Star className="w-3 h-3 fill-current" /> {post.averageRating?.toFixed(1) || '0.0'}
                    </span>
                  </div>
                  <h3 className="text-xl font-black text-white mb-1 leading-tight line-clamp-2">
                    {post.title}
                  </h3>
                  {post.publisher && (
                    <p className="text-xs text-white/70 font-medium">By {post.publisher}</p>
                  )}
                </div>

                {/* Cyberpunk accent corner */}
                <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-purple-500 to-transparent opacity-40 mix-blend-screen"></div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ForYouCarousel;
