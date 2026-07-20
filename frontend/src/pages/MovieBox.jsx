import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useGetMovieHomeSectionsQuery } from '../features/movie/movieApiSlice';
import { useGetWatchHistoryQuery } from '../features/api/watchHistoryApiSlice';
import { useGetMovieSettingsQuery } from '../features/settings/movieSettingsApiSlice';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Star, ChevronLeft, ChevronRight, Download, Lock } from 'lucide-react';

const MovieBox = () => {
  const { data: movieSettingsRes } = useGetMovieSettingsQuery();
  const movieSettings = movieSettingsRes?.data || {};
  const { user } = useSelector(state => state.auth);

  // Fetch watch history
  const { data: historyRes } = useGetWatchHistoryQuery(undefined, { skip: !user });
  const watchHistory = historyRes?.data || [];

  // Fetch all home sections at once
  const { data: homeSectionsRes, isLoading } = useGetMovieHomeSectionsQuery();
  const sections = homeSectionsRes?.data || {};

  const featuredMovies = sections.featured || [];
  const trendingMovies = sections.trending || [];
  const latestMovies = sections.latestMovies || [];
  const latestSeries = sections.latestSeries || [];
  const latestAnimation = sections.latestAnimation || [];
  const mostWatched = sections.mostWatched || [];
  const comingSoon = sections.comingSoon || [];

  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);

  // Auto-slide hero
  useEffect(() => {
    if (trendingMovies.length === 0) return;
    const interval = setInterval(() => {
      setCurrentHeroIndex(prev => (prev + 1) % Math.min(trendingMovies.length, 5));
    }, 6000);
    return () => clearInterval(interval);
  }, [trendingMovies]);

  const nextHero = () => setCurrentHeroIndex(prev => (prev + 1) % Math.min(trendingMovies.length, 5));
  const prevHero = () => setCurrentHeroIndex(prev => (prev - 1 + Math.min(trendingMovies.length, 5)) % Math.min(trendingMovies.length, 5));

  const renderLoadingSkeleton = () => (
    <div className="flex gap-4 overflow-hidden py-4">
      {[1, 2, 3, 4, 5, 6].map(i => (
        <div key={i} className="min-w-[160px] md:min-w-[200px] aspect-[2/3] bg-white/5 rounded-xl animate-pulse shrink-0" />
      ))}
    </div>
  );

  const renderMovieRow = ({ title, movies, loading }) => {
    if (loading) return <div className="mb-12"><h2 className="text-xl font-bold text-white mb-4 px-4">{title}</h2>{renderLoadingSkeleton()}</div>;
    if (movies.length === 0) return null;

    return (
      <div className="mb-12 relative group">
        <h2 className="text-xl font-bold text-white mb-4 px-4 sm:px-8 flex items-center gap-2">
          {title}
        </h2>
        
        {/* Horizontal scroll container */}
        <div className="flex gap-4 overflow-x-auto custom-scrollbar pb-6 px-4 sm:px-8 snap-x">
          {movies.map(movie => (
            <Link key={movie._id} to={`/moviebox/movie/${movie.slug}`} className="min-w-[160px] md:min-w-[200px] shrink-0 snap-start group/card relative transition-all duration-300 hover:-translate-y-2">
              <div className="aspect-[2/3] rounded-[2rem] overflow-hidden bg-black/20 mb-3 relative border border-white/5 shadow-lg group-hover/card:shadow-[0_10px_30px_rgba(59,130,246,0.3)] group-hover/card:border-blue-500/30 transition-all duration-500">
                <img src={movie.posterImage || movieSettings.movieBoxBanner} alt={movie.title} className="w-full h-full object-cover transition-transform duration-700 group-hover/card:scale-110" loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-90 group-hover/card:opacity-100 transition-opacity duration-500" />
                
                {/* Glossy overlay effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-500 z-10 pointer-events-none rounded-[2rem]" />
                
                {movie.appType === 'Premium' && (
                  <div className="absolute top-2 right-2 bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-lg flex items-center gap-1">
                    <Lock className="w-3 h-3" /> PRO
                  </div>
                )}
                
                {movie.rating && (
                  <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-black/60 backdrop-blur-md px-1.5 py-0.5 rounded text-[10px] font-medium text-amber-400 border border-white/10">
                    <Star className="w-3 h-3 fill-amber-400" /> {movie.rating.toFixed(1)}
                  </div>
                )}
                
                {movie.quality && (
                  <div className="absolute bottom-2 right-2 bg-white/10 backdrop-blur-md px-1.5 py-0.5 rounded text-[9px] font-bold text-white uppercase border border-white/10">
                    {movie.quality}
                  </div>
                )}

                {/* Play button overlay */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-all duration-500 bg-black/40 backdrop-blur-sm z-20">
                  <div className="w-14 h-14 rounded-full bg-white/10 border border-white/20 text-white flex items-center justify-center transform scale-50 group-hover/card:scale-100 transition-all duration-500 shadow-[0_0_30px_rgba(255,255,255,0.2)] backdrop-blur-md hover:bg-white/20">
                    <Play className="w-6 h-6 ml-1 fill-white" />
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-2 group-hover/card:translate-y-0 transition-transform">
                  <div className="flex items-center justify-between text-white/90 text-xs font-medium mb-1">
                    <span>{movie.releaseYear || 'TBA'}</span>
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                      <span>{movie.imdbRating > 0 ? movie.imdbRating.toFixed(1) : 'NR'}</span>
                    </div>
                  </div>
                </div>
              </div>
              <h3 className="text-[15px] font-black text-white line-clamp-1 group-hover/card:text-blue-400 transition-colors tracking-tight">{movie.title}</h3>
              <p className="text-xs text-white/50 line-clamp-1 font-medium">{movie.genre?.join(', ') || 'Uncategorized'}</p>
            </Link>
          ))}
        </div>
      </div>
    );
  };

  const heroMovies = trendingMovies.slice(0, 5);
  const currentMovie = heroMovies[currentHeroIndex] || heroMovies[0];

  return (
    <div className="font-jakarta bg-[#030303] min-h-screen text-white pb-20 selection:bg-blue-500/30">
      <Helmet>
        <title>{movieSettings.movieBoxName || 'MovieBox'} | Watch Unlimited Movies & TV Shows</title>
      </Helmet>

      {/* Hero Carousel */}
      {isLoading ? (
        <div className="w-full h-[60vh] lg:h-[80vh] bg-white/5 animate-pulse mb-12" />
      ) : heroMovies.length > 0 ? (
        <div className="relative w-full h-[60vh] lg:h-[80vh] mb-12 overflow-hidden group">
          <AnimatePresence initial={false}>
            <motion.div
              key={currentHeroIndex}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
              className="absolute inset-0"
            >
              <img 
                src={currentMovie.bannerImage || currentMovie.posterImage || movieSettings.movieBoxBanner} 
                alt={currentMovie.title} 
                className="w-full h-full object-cover object-top opacity-60"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#030303] via-[#030303]/60 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#030303] via-[#030303]/50 to-transparent" />
              <div className="absolute inset-0 bg-blue-500/10 mix-blend-overlay" />
              
              <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-12 lg:px-24 pb-20 sm:pb-24 lg:pb-32 lg:w-2/3">
                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }}>
                  {currentMovie.originalTitle && (
                    <p className="text-blue-400 text-xs sm:text-[13px] font-black tracking-widest uppercase mb-2 drop-shadow-md">
                      {currentMovie.originalTitle}
                    </p>
                  )}
                  <h1 className="text-3xl sm:text-5xl lg:text-7xl font-black text-white mb-2 sm:mb-4 leading-tight drop-shadow-2xl">
                    {currentMovie.title}
                  </h1>
                  
                  <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-slate-300 mb-6">
                    <span className="flex items-center gap-1 bg-white/10 px-2 py-1 rounded backdrop-blur-sm">
                      <Star className="w-4 h-4 text-amber-500 fill-amber-500" /> 
                      {currentMovie.imdbRating || 'NR'} IMDB
                    </span>
                    <span>{currentMovie.releaseYear}</span>
                    <span className="px-2 py-0.5 border border-slate-600 rounded text-xs">{currentMovie.quality?.[0] || 'HD'}</span>
                    <span>{currentMovie.runtime || '120 min'}</span>
                    <span className="text-purple-400">{currentMovie.genre?.[0]}</span>
                  </div>

                  <p className="text-slate-300 text-sm sm:text-base mb-8 max-w-2xl line-clamp-3 leading-relaxed drop-shadow-md">
                    {currentMovie.shortDescription || currentMovie.description?.replace(/<[^>]+>/g, '') || 'No description available.'}
                  </p>

                  <div className="flex items-center gap-3 sm:gap-4">
                    <Link 
                      to={`/moviebox/movie/${currentMovie.slug}`}
                      className="flex items-center gap-2 px-6 py-3 sm:px-8 sm:py-4 bg-purple-600 hover:bg-purple-500 text-white rounded-full font-bold text-sm sm:text-base transition-colors shadow-xl shadow-purple-600/30 transform hover:scale-105"
                    >
                      <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-white" /> Watch Now
                    </Link>
                    <button 
                      onClick={() => document.getElementById('movie-rows')?.scrollIntoView({ behavior: 'smooth' })}
                      className="flex items-center gap-2 px-6 py-3 sm:px-8 sm:py-4 bg-white/10 hover:bg-white/20 text-white rounded-full font-bold text-sm sm:text-base backdrop-blur-md transition-colors border border-white/10"
                    >
                      Trailer
                    </button>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation Arrows */}
          <button onClick={prevHero} className="absolute left-4 lg:left-8 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity border border-white/10 z-10">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button onClick={nextHero} className="absolute right-4 lg:right-8 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity border border-white/10 z-10">
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Indicators */}
          <div className="absolute bottom-8 right-8 lg:right-12 flex gap-2 z-10">
            {heroMovies.map((_, idx) => (
              <button 
                key={idx} 
                onClick={() => setCurrentHeroIndex(idx)}
                className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentHeroIndex ? 'w-8 bg-purple-500' : 'w-2 bg-white/30 hover:bg-white/50'}`}
              />
            ))}
          </div>
        </div>
      ) : null}

      {/* Movie Rows */}
      <div id="movie-rows" className="relative z-10 max-w-[2000px] mx-auto pb-24 -mt-10 sm:-mt-20 lg:-mt-32">
        <div className="px-4 md:px-8 mb-12 sm:mb-16 max-w-4xl relative group">
          <div className="absolute -inset-4 bg-gradient-to-r from-purple-600/20 to-indigo-600/20 blur-2xl rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
          <div className="relative">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight flex items-center gap-3 transform group-hover:translate-x-2 transition-transform duration-500">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-400 drop-shadow-lg">Nexoria Play</span> Home 🍿
            </h2>
            <p className="text-slate-300 font-medium text-lg max-w-2xl leading-relaxed transform group-hover:translate-x-2 transition-transform duration-500 delay-75">
              Experience the ultimate cinematic universe. Watch unlimited premium movies and TV shows with stunning quality. ✨
            </p>
          </div>
        </div>
        {/* Continue Watching Section */}
        {user && watchHistory.length > 0 && (
          <div className="mb-12 px-4 md:px-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
                <Play className="w-6 h-6 text-purple-500" /> Continue Watching
              </h2>
            </div>
            <div className="flex gap-4 md:gap-6 overflow-x-auto pb-6 custom-scrollbar snap-x">
              {watchHistory.map((item) => {
                const movie = item.movie;
                if (!movie) return null;
                const progressPercent = Math.min(100, (item.progress / item.duration) * 100);
                
                return (
                  <Link key={movie._id} to={`/moviebox/movie/${movie.slug}`} className="min-w-[200px] md:min-w-[280px] shrink-0 snap-start group/card relative transition-transform duration-300 hover:-translate-y-2">
                    <div className="aspect-video rounded-xl overflow-hidden bg-[#111] relative border border-white/5 mb-3 shadow-lg group-hover/card:shadow-purple-500/20 group-hover/card:border-purple-500/30 transition-all">
                      <img src={movie.bannerImage || movie.posterImage} alt={movie.title} className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-500" />
                      
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/card:opacity-100 transition-opacity flex items-center justify-center">
                        <div className="w-12 h-12 rounded-full bg-purple-600/90 flex items-center justify-center backdrop-blur-sm shadow-lg scale-50 group-hover/card:scale-100 transition-transform">
                          <Play className="w-6 h-6 ml-1 fill-white text-white" />
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-black/50">
                        <div className="h-full bg-purple-500" style={{ width: `${progressPercent}%` }}></div>
                      </div>
                    </div>
                    <h3 className="text-sm font-bold text-white line-clamp-1 group-hover/card:text-purple-400 transition-colors">{movie.title}</h3>
                    <p className="text-xs text-slate-400 mt-1">{Math.floor((item.duration - item.progress) / 60)} min remaining</p>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {renderMovieRow({ title: "Featured Movies", movies: featuredMovies, loading: isLoading })}
        {renderMovieRow({ title: "Trending Now", movies: trendingMovies, loading: isLoading })}
        {renderMovieRow({ title: "Latest Movies", movies: latestMovies, loading: isLoading })}
        {renderMovieRow({ title: "Latest Web Series", movies: latestSeries, loading: isLoading })}
        {renderMovieRow({ title: "Latest Animation", movies: latestAnimation, loading: isLoading })}
        {renderMovieRow({ title: "Most Watched", movies: mostWatched, loading: isLoading })}
        {renderMovieRow({ title: "Coming Soon", movies: comingSoon, loading: isLoading })}
      </div>

    </div>
  );
};

export default MovieBox;
