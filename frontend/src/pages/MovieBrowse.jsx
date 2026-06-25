import { useParams, Link } from 'react-router-dom';
import BackButton from '../components/BackButton';
import { useGetMoviesQuery } from '../features/movie/movieApiSlice';
import { motion } from 'framer-motion';
import { Star, Download, Play, Film, Lock } from 'lucide-react';
import SEO from '../components/SEO';
import { useGetMovieSettingsQuery } from '../features/settings/movieSettingsApiSlice';

const MovieBrowse = ({ type }) => {
  const getMovieType = () => {
    if (type === 'tv-shows') return 'Web Series';
    if (type === 'animation') return 'Animation';
    if (type === 'most-watched') return undefined; // All types, just sorted
    return 'Movie';
  };

  const movieType = getMovieType();
  const getPageDetails = () => {
    switch (type) {
      case 'tv-shows': return { title: 'TV Shows', desc: 'Binge-watch the most popular and trending TV shows and Web series.', emoji: '📺' };
      case 'animation': return { title: 'Animation', desc: 'Dive into the colorful world of premium animated movies and series.', emoji: '🦄' };
      case 'most-watched': return { title: 'Most Watched', desc: 'Explore the most popular and highly-rated content loved by our community.', emoji: '🔥' };
      case 'movies': return { title: 'Movies', desc: 'Discover a vast collection of blockbuster movies in HD and 4K quality.', emoji: '🍿' };
      default: return { title: 'All Movies', desc: 'Browse our entire premium collection.', emoji: '🎬' };
    }
  };

  const { title: pageTitle, desc: pageDesc, emoji } = getPageDetails();

  const queryParams = { limit: 50 };
  if (movieType) queryParams.movieType = movieType;
  if (type === 'most-watched') queryParams.sort = 'popular';

  const { data: moviesRes, isLoading, isError } = useGetMoviesQuery(queryParams, { refetchOnMountOrArgChange: true });
  const { data: movieSettingsRes } = useGetMovieSettingsQuery();
  const movieSettings = movieSettingsRes?.data || {};

  const movies = moviesRes?.data || [];

  if (isLoading) return <div className="flex justify-center mt-20"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div></div>;
  if (isError) return <div className="text-center mt-20 text-red-500 font-semibold glass-card p-6 max-w-md mx-auto">Error loading content</div>;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#000000] pb-20">
      <div className="max-w-7xl mx-auto space-y-8 px-4 pt-24">
        <div className="mb-4">
          <BackButton fallbackRoute="/moviebox" />
        </div>
        <SEO 
          title={`${pageTitle} - MovieBox`}
          description={`Browse all ${pageTitle} in HD and 4K quality.`}
        />

        {/* Modern Category Header */}
        <div className="text-center py-16 bg-white/80 dark:bg-[#111]/80 backdrop-blur-3xl relative overflow-hidden border border-slate-200/50 dark:border-white/5 shadow-xl rounded-3xl group transition-all duration-500 hover:border-purple-500/30 hover:shadow-purple-500/10">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-500/10 dark:bg-purple-500/5 blur-[100px] rounded-full pointer-events-none -z-10 group-hover:scale-125 transition-transform duration-1000"></div>
          
          <div className="text-5xl md:text-7xl mb-4 transform group-hover:scale-110 group-hover:-rotate-6 transition-all duration-500 inline-block drop-shadow-2xl">
            {emoji}
          </div>
          
          <h1 className="text-4xl md:text-6xl font-black bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-purple-400 dark:to-indigo-400 mb-4 tracking-tight drop-shadow-lg">
            {pageTitle}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-lg md:text-xl max-w-2xl mx-auto">{pageDesc}</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
          {movies.map((movie, idx) => (
            <Link key={movie._id} to={`/moviebox/movie/${movie.slug}`} className="group flex flex-col relative transition-transform duration-300 hover:-translate-y-2">
              <div className="relative aspect-[2/3] rounded-2xl overflow-hidden bg-slate-100 dark:bg-[#111] mb-3 shadow-lg border border-slate-200/50 dark:border-white/5">
                <img src={movie.posterImage || movieSettings.movieBoxBanner} alt={movie.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity" />
                
                {/* Badges */}
                <div className="absolute top-2 right-2 flex flex-col gap-1 items-end">
                  {movie.quality && movie.quality.length > 0 && (
                    <span className="px-1.5 py-0.5 bg-purple-600/80 backdrop-blur-md text-white text-[9px] font-bold rounded shadow-lg shadow-purple-600/20">
                      {movie.quality[0]}
                    </span>
                  )}
                  {movie.appType === 'Premium' && (
                    <span className="px-1.5 py-0.5 bg-amber-500 flex items-center gap-1 text-white text-[9px] font-bold rounded shadow-lg shadow-amber-500/20">
                      <Lock className="w-2.5 h-2.5" /> PRO
                    </span>
                  )}
                </div>

                {/* Hover Overlay */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 bg-black/40 backdrop-blur-[2px]">
                  <div className="w-12 h-12 rounded-full bg-white text-purple-600 flex items-center justify-center transform scale-75 group-hover:scale-100 transition-transform duration-300 shadow-xl shadow-white/10">
                    <Play className="w-5 h-5 ml-1 fill-purple-600" />
                  </div>
                </div>

                {/* Info overlay at bottom */}
                <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-2 group-hover:translate-y-0 transition-transform">
                  <div className="flex items-center justify-between text-white/90 text-xs font-medium mb-1">
                    <span>{movie.releaseYear || 'TBA'}</span>
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                      <span>{movie.imdbRating > 0 ? movie.imdbRating.toFixed(1) : 'NR'}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                {movie.title}
              </h3>
              <div className="flex items-center justify-between mt-1">
                <span className="text-[11px] font-medium text-slate-500 line-clamp-1">{movie.genre?.join(', ') || 'Uncategorized'}</span>
              </div>
            </Link>
          ))}
        </div>
        
        {movies.length === 0 && (
          <div className="text-center text-slate-500 py-20 bg-white dark:bg-[#111] rounded-3xl border border-slate-200 dark:border-white/5 shadow-xl">
            <Film className="w-16 h-16 mx-auto mb-4 text-slate-300 dark:text-slate-600" />
            <h2 className="text-2xl font-bold mb-2 dark:text-white">No Content Found</h2>
            <p>There are no {pageTitle.toLowerCase()} published yet. Check back soon!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MovieBrowse;
