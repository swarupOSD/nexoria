import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useGetMoviesQuery } from '../features/movie/movieApiSlice';
import { motion } from 'framer-motion';
import { Search, Loader2, Star, Download, Play, Filter, Frown } from 'lucide-react';

const MovieSearch = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const initialSort = searchParams.get('sort') || 'newest';
  
  const [searchInput, setSearchInput] = useState(initialQuery);
  const [activeSort, setActiveSort] = useState(initialSort);

  // Sync state when URL params change
  useEffect(() => {
    setSearchInput(searchParams.get('q') || '');
    setActiveSort(searchParams.get('sort') || 'newest');
  }, [searchParams]);

  const { data: moviesRes, isLoading, isFetching } = useGetMoviesQuery({
    search: searchParams.get('q') || '',
    sort: searchParams.get('sort') || 'newest',
    limit: 50
  }, { refetchOnMountOrArgChange: true });

  const movies = moviesRes?.data || [];

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearchParams({ q: searchInput, sort: activeSort });
  };

  const handleSortChange = (e) => {
    const newSort = e.target.value;
    setActiveSort(newSort);
    setSearchParams({ q: searchInput, sort: newSort });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#000000] pb-20">
      <Helmet>
        <title>{initialQuery ? `Search results for "${initialQuery}"` : 'Search Movies'} - MovieBox</title>
      </Helmet>

      {/* Header */}
      <div className="bg-white dark:bg-[#111] border-b border-slate-200 dark:border-white/5 pt-24 pb-8 sticky top-[72px] z-30 shadow-sm">
        <div className="container mx-auto max-w-7xl px-4">
          <form onSubmit={handleSearchSubmit} className="max-w-3xl mx-auto flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <input 
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search movies by title, actor, director..."
                className="w-full pl-12 pr-4 py-3.5 bg-slate-100 dark:bg-[#0A0A0A] border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-purple-500 outline-none text-slate-900 dark:text-white font-medium shadow-inner"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-none">
                <select 
                  value={activeSort}
                  onChange={handleSortChange}
                  className="w-full appearance-none pl-10 pr-8 py-3.5 bg-slate-100 dark:bg-[#0A0A0A] border border-slate-200 dark:border-slate-800 rounded-2xl font-semibold text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
                >
                  <option value="newest">Latest Releases</option>
                  <option value="trending">Trending Now</option>
                  <option value="popular">Most Downloaded</option>
                  <option value="rating">Top Rated</option>
                </select>
                <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              </div>
              <button type="submit" className="px-6 py-3.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-2xl shadow-lg shadow-purple-500/30 transition-colors">
                Search
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Results */}
      <div className="container mx-auto max-w-7xl px-4 py-12">
        {(isLoading || isFetching) ? (
          <div className="flex flex-col items-center justify-center py-20 text-purple-500">
            <Loader2 className="w-12 h-12 animate-spin mb-4" />
            <p className="font-medium text-slate-600 dark:text-slate-400">Searching movies...</p>
          </div>
        ) : movies.length > 0 ? (
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
              {initialQuery ? `Found ${movies.length} result${movies.length === 1 ? '' : 's'} for "${initialQuery}"` : `Showing ${movies.length} movies`}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
              {movies.map((movie, idx) => (
                <Link key={movie._id} to={`/movie/${movie.slug}`} className="group flex flex-col relative">
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: idx * 0.05 }}
                    className="relative aspect-[2/3] rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 mb-3 shadow-lg border border-slate-200/50 dark:border-white/5"
                  >
                    <img src={movie.posterImage} alt={movie.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity" />
                    
                    <div className="absolute top-2 right-2 flex flex-col gap-1 items-end">
                      {movie.quality && movie.quality.length > 0 && (
                        <span className="px-1.5 py-0.5 bg-black/60 backdrop-blur-md text-white text-[9px] font-bold rounded border border-white/20">
                          {movie.quality[0]}
                        </span>
                      )}
                      {movie.appType === 'Premium' && (
                        <span className="px-1.5 py-0.5 bg-amber-500 text-white text-[9px] font-bold rounded shadow-lg shadow-amber-500/20">PREMIUM</span>
                      )}
                    </div>

                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 bg-black/40 backdrop-blur-[2px]">
                      <div className="w-12 h-12 rounded-full bg-purple-600 text-white flex items-center justify-center transform scale-75 group-hover:scale-100 transition-transform duration-300 shadow-xl shadow-purple-500/50">
                        <Play className="w-5 h-5 ml-1 fill-white" />
                      </div>
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-2 group-hover:translate-y-0 transition-transform">
                      <div className="flex items-center justify-between text-white/90 text-xs font-medium mb-1">
                        <span>{movie.releaseDate ? new Date(movie.releaseDate).getFullYear() : 'TBA'}</span>
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                          <span>{movie.averageRating > 0 ? movie.averageRating.toFixed(1) : 'NR'}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                  
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                    {movie.title}
                  </h3>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-[11px] font-medium text-slate-500 line-clamp-1">{movie.category?.name || 'Uncategorized'}</span>
                    <span className="text-[10px] text-slate-400 flex items-center gap-1"><Download className="w-3 h-3"/> {movie.downloads > 1000 ? (movie.downloads/1000).toFixed(1)+'k' : movie.downloads}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-[#111] rounded-3xl border border-slate-200 dark:border-white/5 shadow-sm">
            <Frown className="w-16 h-16 text-slate-300 dark:text-slate-600 mb-4" />
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">No movies found</h2>
            <p className="text-slate-500 text-center max-w-md">
              We couldn't find any movies matching "{initialQuery}". Try checking for typos or searching with different keywords.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MovieSearch;
