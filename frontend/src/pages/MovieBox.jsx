import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import MovieForYouCarousel from '../components/MovieForYouCarousel';
import { useGetMovieHomeSectionsQuery } from '../features/movie/movieApiSlice';
import { useGetWatchHistoryQuery } from '../features/api/watchHistoryApiSlice';
import { useGetMovieSettingsQuery } from '../features/settings/movieSettingsApiSlice';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Star, ChevronLeft, ChevronRight, Lock, History, Flame } from 'lucide-react';

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

  const renderLoadingSkeleton = () => (
    <div className="flex gap-4 overflow-hidden py-4 px-margin-mobile md:px-margin-desktop">
      {[1, 2, 3, 4, 5, 6].map(i => (
        <div key={i} className="min-w-[140px] md:min-w-[200px] aspect-[2/3] bg-surface-container-high rounded-xl animate-pulse shrink-0" />
      ))}
    </div>
  );

  const renderMovieRow = ({ title, movies, loading, icon: Icon }) => {
    if (loading) return <div className="mb-12"><h2 className="text-xl font-bold text-on-surface mb-4 px-margin-mobile md:px-margin-desktop">{title}</h2>{renderLoadingSkeleton()}</div>;
    if (movies.length === 0) return null;

    return (
      <section className="mt-8 pl-margin-mobile md:pl-margin-desktop py-4">
        <h2 className="font-headline-md text-body-lg md:text-headline-md text-on-surface mb-4 font-bold flex items-center gap-2">
          {Icon && <Icon className="w-6 h-6 md:w-8 md:h-8 text-primary" />} {title}
        </h2>
        
        <div className="flex gap-4 overflow-x-auto no-scrollbar pr-margin-mobile md:pr-margin-desktop pb-6 snap-x snap-mandatory">
          {movies.map(movie => (
            <Link key={movie._id} to={`/moviebox/movie/${movie.slug}`} className="block w-[140px] md:w-[200px] flex-shrink-0 snap-start relative group outline-none hover:scale-105 rounded-lg overflow-hidden transition-all duration-300 shadow-[0_4px_20px_rgba(0,0,0,0.3)] hover:shadow-[0_0_15px_rgba(255,211,137,0.15)] hover:border hover:border-primary/30">
              <div className="aspect-[2/3] relative">
                <img src={movie.posterImage || movieSettings.movieBoxBanner} alt={movie.title} className="w-full h-full object-cover" loading="lazy" />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 backdrop-blur-[2px]">
                  <Play className="w-12 h-12 text-primary fill-primary drop-shadow-[0_0_10px_rgba(255,211,137,0.5)]" />
                </div>
                
                {movie.appType === 'Premium' && (
                  <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm border border-white/10 px-2 py-1 rounded font-label-caps text-[10px] text-primary">
                    PRO
                  </div>
                )}
                
                {movie.quality && (
                  <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm border border-white/10 px-1.5 py-0.5 rounded font-label-caps text-[9px] text-on-surface">
                    {movie.quality}
                  </div>
                )}
                
                {movie.rating && (
                  <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-sm border border-white/10 px-1.5 py-0.5 rounded font-label-caps text-[10px] text-primary flex items-center gap-1">
                    <Star className="w-3 h-3 fill-primary" /> {movie.rating.toFixed(1)}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      </section>
    );
  };

  const heroMovies = trendingMovies.slice(0, 5);
  const currentMovie = heroMovies[currentHeroIndex] || heroMovies[0];

  return (
    <>
      {/* Hero Section */}
      {isLoading ? (
        <div className="w-full h-[60vh] md:h-[85vh] bg-surface-container-lowest animate-pulse" />
      ) : heroMovies.length > 0 ? (
        <section className="relative w-full h-[85vh] md:h-[90vh] overflow-hidden bg-surface-container-lowest">
          <AnimatePresence initial={false}>
            <motion.div
              key={currentHeroIndex}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
              className="absolute inset-0"
            >
              {/* Background Image */}
              <div 
                className="absolute inset-0 bg-cover bg-center md:bg-top"
                style={{ backgroundImage: `url('${currentMovie.bannerImage || currentMovie.posterImage || movieSettings.movieBoxBanner}')` }}
              >
                {/* Vignette Gradients */}
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent md:to-background/30"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-background via-background/40 to-transparent hidden md:block"></div>
              </div>

              {/* Hero Content */}
              <div className="absolute bottom-0 left-0 w-full p-margin-mobile md:p-margin-desktop md:w-2/3 flex flex-col justify-end h-full pb-12 z-10">
                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
                  <div className="flex gap-2 mb-4">
                    {currentMovie.quality?.[0] && (
                      <span className="px-2 py-1 border border-outline/50 rounded font-label-caps text-label-caps text-on-surface bg-surface-container/30 backdrop-blur-md">
                        {currentMovie.quality[0]}
                      </span>
                    )}
                    {currentMovie.releaseYear && (
                      <span className="px-2 py-1 border border-outline/50 rounded font-label-caps text-label-caps text-on-surface bg-surface-container/30 backdrop-blur-md">
                        {currentMovie.releaseYear}
                      </span>
                    )}
                  </div>
                  
                  <h1 className="font-display-lg text-display-lg-mobile md:text-display-lg text-on-surface mb-2 drop-shadow-2xl">
                    {currentMovie.title}
                  </h1>
                  
                  <p className="font-body-lg text-body-lg text-on-surface-variant mb-6 line-clamp-3 md:line-clamp-none max-w-2xl drop-shadow-md">
                    {currentMovie.shortDescription || currentMovie.description?.replace(/<[^>]+>/g, '') || 'No description available.'}
                  </p>
                  
                  <div className="flex gap-4">
                    <Link 
                      to={`/moviebox/movie/${currentMovie.slug}`}
                      className="bg-primary text-on-primary font-headline-md text-body-lg px-8 py-3 rounded-lg flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(255,211,137,0.3)] font-bold hover:bg-primary-fixed hover:scale-105"
                    >
                      <Play className="w-6 h-6 fill-on-primary" />
                      Play Now
                    </Link>
                    <button 
                      onClick={() => document.getElementById('movie-rows')?.scrollIntoView({ behavior: 'smooth' })}
                      className="bg-surface-container-high/80 backdrop-blur-md text-on-surface font-headline-md text-body-lg px-6 py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-surface-variant transition-colors border border-white/10 font-bold"
                    >
                      More Info
                    </button>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Indicators */}
          <div className="absolute bottom-8 right-8 md:right-margin-desktop flex gap-2 z-10">
            {heroMovies.map((_, idx) => (
              <button 
                key={idx} 
                onClick={() => setCurrentHeroIndex(idx)}
                className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentHeroIndex ? 'w-8 bg-primary shadow-[0_0_10px_rgba(255,211,137,0.5)]' : 'w-2 bg-white/30 hover:bg-white/50'}`}
              />
            ))}
          </div>
        </section>
      ) : null}

      {/* Movie Rows */}
      <div id="movie-rows" className="relative z-10 w-full pt-4">
        
        {/* Continue Watching Section */}
        {user && watchHistory.length > 0 && (
          <section className="mt-8 pl-margin-mobile md:pl-margin-desktop py-4">
            <h2 className="font-headline-md text-body-lg md:text-headline-md text-on-surface mb-4 font-bold flex items-center gap-2">
              <History className="w-6 h-6 md:w-8 md:h-8 text-primary" /> Continue Watching
            </h2>
            <div className="flex gap-4 overflow-x-auto no-scrollbar pr-margin-mobile md:pr-margin-desktop pb-6 snap-x snap-mandatory">
              {watchHistory.map((item) => {
                const movie = item.movie;
                if (!movie) return null;
                const progressPercent = Math.min(100, (item.progress / item.duration) * 100);
                const minLeft = Math.floor((item.duration - item.progress) / 60);
                
                return (
                  <Link key={movie._id} to={`/moviebox/movie/${movie.slug}`} className="block min-w-[280px] md:min-w-[340px] snap-start relative group outline-none hover:scale-105 rounded-xl overflow-hidden bg-surface-container-low transition-all duration-300 hover:shadow-[0_0_15px_rgba(255,211,137,0.15)] hover:border-primary/50 border border-transparent">
                    <div className="aspect-video relative overflow-hidden">
                      <img src={movie.bannerImage || movie.posterImage} alt={movie.title} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 backdrop-blur-[2px]">
                        <Play className="w-12 h-12 text-primary fill-primary drop-shadow-[0_0_10px_rgba(255,211,137,0.5)]" />
                      </div>
                      <div className="absolute bottom-2 right-2 bg-black/80 px-2 py-1 rounded font-label-caps text-label-caps text-on-surface">
                        {minLeft > 60 ? `${Math.floor(minLeft/60)}h ${minLeft%60}m` : `${minLeft}m`} left
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-headline-md text-body-sm font-bold text-on-surface truncate">{movie.title}</h3>
                      <div className="w-full h-[2px] bg-white/10 mt-3 rounded-full relative overflow-hidden">
                        <div className="absolute top-0 left-0 h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${progressPercent}%`, boxShadow: '2px 0 5px rgba(255, 211, 137, 0.5)' }}></div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        <div className="px-margin-mobile md:px-margin-desktop mb-4">
           <MovieForYouCarousel />
        </div>

        {renderMovieRow({ title: "Trending Now", movies: trendingMovies, loading: isLoading, icon: Flame })}
        {renderMovieRow({ title: "Featured Movies", movies: featuredMovies, loading: isLoading })}
        {renderMovieRow({ title: "Latest Movies", movies: latestMovies, loading: isLoading })}
        {renderMovieRow({ title: "Latest Web Series", movies: latestSeries, loading: isLoading })}
        {renderMovieRow({ title: "Latest Animation", movies: latestAnimation, loading: isLoading })}
        {renderMovieRow({ title: "Most Watched", movies: mostWatched, loading: isLoading })}
        {renderMovieRow({ title: "Coming Soon", movies: comingSoon, loading: isLoading })}
      </div>
    </>
  );
};

export default MovieBox;
