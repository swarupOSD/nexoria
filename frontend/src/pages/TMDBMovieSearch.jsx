import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Search, Loader2, Star, Play, AlertCircle } from 'lucide-react';
import { searchMovies, tmdbPoster } from '../utils/tmdb';
import SEO from '../components/SEO';
import BackButton from '../components/BackButton';

const FALLBACK_POSTER = 'https://via.placeholder.com/300x450/111827/9CA3AF?text=No+Poster';

const getRating = (item) => item?.vote_average?.toFixed(1) || 'NR';
const getYear = (item) => (item?.release_date || item?.first_air_date || '').slice(0, 4);
const getTitle = (item) => item?.title || item?.name || 'Unknown';
const getMediaType = (item) => item?.media_type || (item?.title ? 'movie' : 'tv');

const TMDBCard = ({ item }) => {
  const type = getMediaType(item);
  const to = `/moviebox/tmdb/${type}/${item.id}`;
  return (
    <Link to={to} className="group relative w-full rounded-lg overflow-hidden aspect-[2/3] cursor-pointer transition-transform duration-300 hover:scale-105 hover:shadow-[0_0_20px_rgba(168,85,247,0.4)]">
      <img
        src={tmdbPoster(item.poster_path) || FALLBACK_POSTER}
        alt={getTitle(item)}
        className="w-full h-full object-cover"
        loading="lazy"
      />
      
      <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity"></div>
      
      <div className="absolute top-2 left-2 bg-[#0d141d]/60 backdrop-blur-md px-2 py-1 rounded text-xs font-bold text-white flex items-center gap-1 border border-white/10">
        <Star className="w-3 h-3 text-amber-400 fill-amber-400" /> {getRating(item)}
      </div>
      <div className="absolute top-2 right-2 bg-[#0d141d]/60 backdrop-blur-md px-2 py-1 rounded text-[10px] font-bold text-purple-400 border border-white/10 uppercase">
        {type === 'tv' || type === 'tv-shows' ? 'SERIES' : 'MOVIE'}
      </div>

      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="w-12 h-12 rounded-full bg-purple-600/90 text-white flex items-center justify-center backdrop-blur-md shadow-[0_0_15px_rgba(168,85,247,0.5)]">
          <Play className="w-5 h-5 ml-0.5 fill-white" />
        </div>
      </div>

      <div className="absolute bottom-0 left-0 p-4 w-full transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
        <h3 className="text-sm md:text-base text-white font-bold truncate drop-shadow-md">{getTitle(item)}</h3>
        <p className="text-[11px] text-slate-300 mt-0.5">{getYear(item)} • {type === 'tv' || type === 'tv-shows' ? 'Series' : 'Feature'}</p>
      </div>
    </Link>
  );
};

const TMDBMovieSearch = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const navigate = useNavigate();
  
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchResults = async () => {
      if (!query.trim()) return;
      setLoading(true);
      setError(false);
      try {
        const res = await searchMovies(query);
        if (res && res.results) {
          // Filter out people, keep only movies and tv shows
          const filtered = res.results.filter(item => item.media_type === 'movie' || item.media_type === 'tv');
          setResults(filtered);
        } else {
          setResults([]);
        }
      } catch (err) {
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [query]);

  return (
    <div className="min-h-screen bg-[#030303] text-white pt-24 pb-20 px-4 md:px-8">
      <SEO title={`Search Results for "${query}" | Nexoria MovieBox`} />
      
      <div className="container mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <BackButton fallbackPath="/moviebox" />
          <h1 className="text-2xl md:text-4xl font-bold flex items-center gap-3">
            <Search className="w-8 h-8 text-primary" />
            Search Results for <span className="text-primary">"{query}"</span>
          </h1>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <AlertCircle className="w-12 h-12 text-rose-500 mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Search Failed</h2>
            <p className="text-slate-400">There was an error processing your search.</p>
          </div>
        ) : results.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <Search className="w-12 h-12 text-slate-600 mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">No Results Found</h2>
            <p className="text-slate-400">We couldn't find any movies or shows matching "{query}".</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
            {results.map((item) => (
              <TMDBCard key={`${item.id}-${item.media_type}`} item={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TMDBMovieSearch;
