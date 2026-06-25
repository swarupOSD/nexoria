import { useParams, Link } from 'react-router-dom';
import BackButton from '../components/BackButton';
import { useGetMoviesQuery } from '../features/movie/movieApiSlice';
import { useGetMovieCategoriesQuery } from '../features/movieCategory/movieCategoryApiSlice';
import { motion } from 'framer-motion';
import { Star, Download, Play, Film } from 'lucide-react';
import SEO from '../components/SEO';

const MovieCategory = () => {
  const { slug } = useParams();
  const { data: moviesRes, isLoading, isError } = useGetMoviesQuery({ category: slug, limit: 50 }, { refetchOnMountOrArgChange: true });
  const { data: categoriesRes } = useGetMovieCategoriesQuery();

  const movies = moviesRes?.data || [];
  const categories = categoriesRes?.data || [];
  const currentCategory = categories.find(c => c.slug === slug);
  const categoryName = currentCategory ? currentCategory.name : slug.replace('-', ' ');

  if (isLoading) return <div className="flex justify-center mt-20"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div></div>;
  if (isError) return <div className="text-center mt-20 text-red-500 font-semibold glass-card p-6 max-w-md mx-auto">Error loading category</div>;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#000000] pb-20">
      <div className="max-w-7xl mx-auto space-y-8 px-4 pt-24">
        <div className="mb-4">
          <BackButton fallbackRoute="/moviebox" />
        </div>
        <SEO 
          title={`${categoryName} Movies - MovieBox`}
          description={`Explore the best ${categoryName} movies and series in 4K quality.`}
        />

        {/* Modern Category Header */}
        <div className="text-center py-16 bg-white/80 dark:bg-[#111]/80 backdrop-blur-3xl relative overflow-hidden border border-slate-200/50 dark:border-white/5 shadow-xl rounded-3xl">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-500/10 dark:bg-purple-500/5 blur-[100px] rounded-full pointer-events-none -z-10"></div>
          <h1 className="text-4xl md:text-6xl font-black capitalize bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-purple-400 dark:to-indigo-400 mb-4 tracking-tight flex items-center justify-center gap-3">
            <Film className="w-10 h-10 text-purple-500" /> {categoryName}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-lg">Explore the best premium {categoryName} movies on MovieBox</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
          {movies.map((movie, idx) => (
            <Link key={movie._id} to={`/movie/${movie.slug}`} className="group flex flex-col relative">
              <motion.div 
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05, duration: 0.3 }}
                className="relative aspect-[2/3] rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 mb-3 shadow-lg border border-slate-200/50 dark:border-white/5"
              >
                <img src={movie.posterImage} alt={movie.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity" />
                
                {/* Badges */}
                <div className="absolute top-2 right-2 flex flex-col gap-1 items-end">
                  {movie.quality && movie.quality.length > 0 && (
                    <span className="px-1.5 py-0.5 bg-black/60 backdrop-blur-md text-white text-[9px] font-bold rounded border border-white/20">
                      {movie.quality[0]}
                    </span>
                  )}
                  {movie.appType === 'Premium' && (
                    <span className="px-1.5 py-0.5 bg-amber-500 text-white text-[9px] font-bold rounded shadow-lg shadow-amber-500/20">
                      PREMIUM
                    </span>
                  )}
                </div>

                {/* Hover Overlay */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 bg-black/40 backdrop-blur-[2px]">
                  <div className="w-12 h-12 rounded-full bg-purple-600 text-white flex items-center justify-center transform scale-75 group-hover:scale-100 transition-transform duration-300 shadow-xl shadow-purple-500/50">
                    <Play className="w-5 h-5 ml-1 fill-white" />
                  </div>
                </div>

                {/* Info overlay at bottom */}
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
        
        {movies.length === 0 && (
          <div className="text-center text-slate-500 py-20 bg-white dark:bg-[#111] rounded-3xl border border-slate-200 dark:border-white/5">
            <Film className="w-16 h-16 mx-auto mb-4 text-slate-300 dark:text-slate-600" />
            <h2 className="text-2xl font-bold mb-2 dark:text-white">No Movies Found</h2>
            <p>There are no movies published in this category yet. Check back soon!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MovieCategory;
