import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Sparkles, Star, Play } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useGetMovieRecommendationsQuery } from '../features/api/recommendationApiSlice';
import { useSelector } from 'react-redux';

const MovieForYouCarousel = () => {
  const { user } = useSelector(state => state.auth);
  const { data: recommendationsRes, isLoading, isError } = useGetMovieRecommendationsQuery(undefined, {
    skip: !user
  });
  const carouselRef = useRef(null);

  if (!user || isError || !recommendationsRes?.data || recommendationsRes.data.length === 0) {
    return null;
  }

  const movies = recommendationsRes.data;

  const scroll = (direction) => {
    if (carouselRef.current) {
      const scrollAmount = direction === 'left' ? -300 : 300;
      carouselRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="mb-12 px-4 md:px-8 relative group">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-white flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-purple-500" /> Recommended For You
          </h2>
          <p className="text-sm text-slate-400 mt-1 font-medium">
            Based on your watch history
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => scroll('left')}
            className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white transition border border-white/10"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button 
            onClick={() => scroll('right')}
            className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white transition border border-white/10"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="relative">
        <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-[#030303] to-transparent z-10 pointer-events-none"></div>
        <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-[#030303] to-transparent z-10 pointer-events-none"></div>

        <div 
          ref={carouselRef}
          className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-6 pt-2"
        >
          {isLoading ? (
            Array(5).fill(0).map((_, i) => (
              <div key={i} className="min-w-[160px] md:min-w-[200px] h-[240px] md:h-[300px] rounded-xl bg-white/5 animate-pulse shrink-0 snap-center" />
            ))
          ) : (
            movies.map((movie) => (
              <Link 
                key={movie._id} 
                to={`/moviebox/movie/${movie.slug}`}
                className="relative min-w-[160px] md:min-w-[200px] h-[240px] md:h-[300px] rounded-xl overflow-hidden shrink-0 snap-start group/card border border-white/5 shadow-lg"
              >
                <img 
                  src={movie.posterImage || movie.bannerImage} 
                  alt={movie.title}
                  className="w-full h-full object-cover transition duration-700 group-hover/card:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#030303] via-black/40 to-transparent opacity-80 group-hover/card:opacity-90 transition-opacity"></div>
                
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-all duration-500 z-20">
                  <div className="w-12 h-12 rounded-full bg-purple-600/90 flex items-center justify-center transform scale-50 group-hover/card:scale-100 transition-all duration-500 shadow-lg backdrop-blur-md">
                    <Play className="w-6 h-6 ml-1 fill-white" />
                  </div>
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="flex items-center gap-1 text-amber-400 text-[10px] font-bold bg-black/60 px-1.5 py-0.5 rounded border border-white/10 backdrop-blur-md">
                      <Star className="w-3 h-3 fill-amber-400" /> {movie.imdbRating?.toFixed(1) || 'NR'}
                    </span>
                    {movie.quality && (
                      <span className="bg-white/10 px-1.5 py-0.5 rounded text-[9px] font-bold text-white uppercase border border-white/10 backdrop-blur-md">
                        {movie.quality[0] || 'HD'}
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm md:text-base font-black text-white mb-0.5 leading-tight line-clamp-1 group-hover/card:text-purple-400 transition-colors">
                    {movie.title}
                  </h3>
                  <p className="text-[10px] md:text-xs text-white/50 font-medium line-clamp-1">
                    {movie.genre?.join(', ') || 'Uncategorized'}
                  </p>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default MovieForYouCarousel;
