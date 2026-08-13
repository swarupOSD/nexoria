import { useState, useEffect, useRef, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play, Star, ChevronLeft, ChevronRight, Search,
  TrendingUp, Film, Tv, Flame, Trophy, Loader2, Info
} from 'lucide-react';
import {
  getTrendingMovies, getPopularMovies, getTopRatedMovies,
  getNowPlayingMovies, getTrendingTV, getPopularTV,
  getMoviesByGenre, tmdbBackdrop, tmdbPoster, GENRES
} from '../utils/tmdb';
import { useGetMovieSettingsQuery } from '../features/settings/movieSettingsApiSlice';

// ─── Helpers ─────────────────────────────────────────────────────────────────
const FALLBACK_POSTER = 'https://via.placeholder.com/300x450/111827/9CA3AF?text=No+Poster';
const FALLBACK_BACKDROP = 'https://via.placeholder.com/1280x720/030303/374151?text=Nexoria+Cinema';

const getRating = (item) => item?.vote_average?.toFixed(1) || 'NR';
const getYear = (item) => (item?.release_date || item?.first_air_date || '').slice(0, 4);
const getTitle = (item) => item?.title || item?.name || 'Unknown';
const getMediaType = (item) => item?.media_type || (item?.title ? 'movie' : 'tv');

// ─── Movie Card ───────────────────────────────────────────────────────────────
const TMDBCard = ({ item }) => {
  const type = getMediaType(item);
  const to = `/moviebox/tmdb/${type}/${item.id}`;
  return (
    <Link to={to} className="group relative shrink-0 min-w-[150px] sm:min-w-[170px] md:min-w-[190px] rounded-lg overflow-hidden aspect-[2/3] cursor-pointer transition-transform duration-300 hover:scale-105 hover:shadow-[0_0_20px_rgba(168,85,247,0.4)]">
      <img
        src={tmdbPoster(item.poster_path) || FALLBACK_POSTER}
        alt={getTitle(item)}
        className="w-full h-full object-cover"
        loading="lazy"
      />
      
      {/* Dark Overlay Gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity"></div>
      
      {/* Badges */}
      <div className="absolute top-2 left-2 bg-[#0d141d]/60 backdrop-blur-md px-2 py-1 rounded text-xs font-bold text-white flex items-center gap-1 border border-white/10">
        <Star className="w-3 h-3 text-amber-400 fill-amber-400" /> {getRating(item)}
      </div>
      <div className="absolute top-2 right-2 bg-[#0d141d]/60 backdrop-blur-md px-2 py-1 rounded text-[10px] font-bold text-purple-400 border border-white/10 uppercase">
        {type === 'tv' ? 'SERIES' : 'MOVIE'}
      </div>

      {/* Play Button Overlay */}
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="w-12 h-12 rounded-full bg-purple-600/90 text-white flex items-center justify-center backdrop-blur-md shadow-[0_0_15px_rgba(168,85,247,0.5)]">
          <Play className="w-5 h-5 ml-0.5 fill-white" />
        </div>
      </div>

      {/* Title & Year */}
      <div className="absolute bottom-0 left-0 p-4 w-full transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
        <h3 className="text-sm md:text-base text-white font-bold truncate drop-shadow-md">{getTitle(item)}</h3>
        <p className="text-[11px] text-slate-300 mt-0.5">{getYear(item)} • {type === 'tv' ? 'Series' : 'Feature'}</p>
      </div>
    </Link>
  );
};

// ─── Section Row ──────────────────────────────────────────────────────────────
const MovieRow = ({ title, icon: Icon, items, loading }) => {
  const scrollRef = useRef(null);
  const scroll = (dir) => {
    scrollRef.current?.scrollBy({ left: dir * 600, behavior: 'smooth' });
  };

  return (
    <div className="mb-12 group/row relative px-4 sm:px-8 max-w-[1440px] mx-auto">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
          {Icon && <span className="text-2xl"><Icon className="w-6 h-6 text-purple-500" /></span>}
          {title}
        </h2>
        <div className="flex gap-2">
          <button onClick={() => scroll(-1)} className="text-slate-400 hover:text-white transition-colors">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button onClick={() => scroll(1)} className="text-slate-400 hover:text-white transition-colors">
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex gap-4 overflow-hidden">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="shrink-0 min-w-[150px] sm:min-w-[170px] aspect-[2/3] bg-white/5 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : (
        <div ref={scrollRef} className="flex gap-4 md:gap-5 overflow-x-auto hide-scrollbar pb-6 snap-x -mx-4 px-4 sm:mx-0 sm:px-0">
          {items.map(item => <TMDBCard key={`${item.id}-${item.media_type || ''}`} item={item} />)}
        </div>
      )}
      
      {/* Custom styles for hide-scrollbar */}
      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

// ─── Genre Pills ──────────────────────────────────────────────────────────────
const GenreBar = ({ activeGenre, onSelect }) => {
  const genres = [
    { label: 'All', id: null },
    { label: 'Action', id: GENRES.Action },
    { label: 'Comedy', id: GENRES.Comedy },
    { label: 'Horror', id: GENRES.Horror },
    { label: 'Sci-Fi', id: GENRES['Sci-Fi'] },
    { label: 'Drama', id: GENRES.Drama },
    { label: 'Thriller', id: GENRES.Thriller },
    { label: 'Fantasy', id: GENRES.Fantasy },
    { label: 'Romance', id: GENRES.Romance },
    { label: 'Animation', id: GENRES.Animation },
  ];

  return (
    <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-4 mb-8 px-4 sm:px-8 max-w-[1440px] mx-auto">
      {genres.map(g => (
        <button
          key={g.label}
          onClick={() => onSelect(g.id)}
          className={`shrink-0 px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300
            ${activeGenre === g.id
              ? 'bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)] scale-105'
              : 'border border-slate-700 text-slate-300 hover:border-purple-500 hover:text-purple-400'
            }`}
        >
          {g.label}
        </button>
      ))}
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const TMDBMovieSection = () => {
  const navigate = useNavigate();
  const { data: movieSettingsRes } = useGetMovieSettingsQuery();
  const movieSettings = movieSettingsRes?.data || {};

  const [hero, setHero] = useState([]);
  const [heroIdx, setHeroIdx] = useState(0);
  const [trending, setTrending] = useState([]);
  const [popular, setPopular] = useState([]);
  const [topRated, setTopRated] = useState([]);
  const [nowPlaying, setNowPlaying] = useState([]);
  const [trendingTV, setTrendingTV] = useState([]);
  const [popularTV, setPopularTV] = useState([]);
  const [genreMovies, setGenreMovies] = useState([]);
  const [activeGenre, setActiveGenre] = useState(null);
  const [searchQ, setSearchQ] = useState('');
  const [loading, setLoading] = useState(true);

  // Fetch all data
  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      const [trendRes, popRes, topRes, nowRes, tvTrendRes, tvPopRes] = await Promise.all([
        getTrendingMovies(),
        getPopularMovies(),
        getTopRatedMovies(),
        getNowPlayingMovies(),
        getTrendingTV(),
        getPopularTV(),
      ]);

      const trendItems = trendRes?.results || [];
      setTrending(trendItems);
      setHero(trendItems.slice(0, 6).map(m => ({ ...m, media_type: m.media_type || 'movie' })));
      setPopular(popRes?.results || []);
      setTopRated(topRes?.results || []);
      setNowPlaying(nowRes?.results || []);
      setTrendingTV(tvTrendRes?.results || []);
      setPopularTV(tvPopRes?.results || []);
      setLoading(false);
    };
    fetchAll();
  }, []);

  // Genre filter
  useEffect(() => {
    if (activeGenre === null) { setGenreMovies([]); return; }
    getMoviesByGenre(activeGenre).then(r => setGenreMovies(r?.results || []));
  }, [activeGenre]);

  // Hero auto-slide
  useEffect(() => {
    if (!hero.length) return;
    const t = setInterval(() => setHeroIdx(i => (i + 1) % hero.length), 8000);
    return () => clearInterval(t);
  }, [hero]);

  const currentHero = hero[heroIdx];

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQ.trim()) navigate(`/moviebox/tmdb/search?q=${encodeURIComponent(searchQ)}`);
  };

  return (
    <div className="bg-[#050505] min-h-screen text-[#dce3f0] font-sans overflow-x-hidden">
      <Helmet>
        <title>{movieSettings.movieBoxName || 'MovieBox'} - Premium Streaming</title>
      </Helmet>

      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <section className="relative w-full h-[60vh] sm:h-[75vh] min-h-[500px] flex items-end pb-24 mb-10">
        <div className="absolute inset-0 z-0">
          <AnimatePresence initial={false}>
            {currentHero && (
              <motion.div
                key={heroIdx}
                initial={{ opacity: 0, scale: 1.02 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.5 }}
                className="absolute inset-0"
              >
                <div
                  className="w-full h-full bg-cover bg-center opacity-80"
                  style={{ backgroundImage: `url('${tmdbBackdrop(currentHero.backdrop_path) || FALLBACK_BACKDROP}')` }}
                />
                {/* Stitch-style Gradients */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/80 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-[#050505]/60 to-transparent w-2/3" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="relative z-10 w-full max-w-[1440px] mx-auto px-4 sm:px-8">
          {currentHero && (
            <motion.div
              key={`content-${heroIdx}`}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="max-w-2xl space-y-6"
            >
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white drop-shadow-[0_0_15px_rgba(168,85,247,0.4)] tracking-tight leading-tight">
                {getTitle(currentHero)}
              </h1>
              
              <div className="flex items-center gap-3 sm:gap-4 text-slate-300 text-sm font-medium flex-wrap">
                <div className="flex items-center gap-1 text-[#f5c518]">
                  <Star className="w-4 h-4 fill-[#f5c518]" />
                  <span className="text-white font-bold">{getRating(currentHero)}</span>
                </div>
                <span className="text-slate-600">•</span>
                <span>{getYear(currentHero)}</span>
                <span className="text-slate-600">•</span>
                <span className="px-2 py-0.5 border border-slate-600 rounded text-[10px] uppercase tracking-wider">{getMediaType(currentHero) === 'tv' ? 'SERIES' : 'MOVIE'}</span>
                <span className="text-slate-600">•</span>
                <span className="px-2 py-0.5 border border-slate-600 rounded text-[10px] uppercase tracking-wider">4K Ultra HD</span>
              </div>

              <div className="flex gap-2 flex-wrap">
                {(currentHero.genre_ids || []).slice(0, 3).map(id => {
                  const name = Object.entries(GENRES).find(([, v]) => v === id)?.[0];
                  return name ? (
                    <span key={id} className="px-3 py-1 rounded-full text-xs font-medium border border-slate-700 bg-white/5 text-slate-300">
                      {name}
                    </span>
                  ) : null;
                })}
              </div>

              <div className="flex gap-4 pt-4 flex-wrap">
                <Link
                  to={`/moviebox/tmdb/${getMediaType(currentHero)}/${currentHero.id}`}
                  className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-[#861fdd] text-white px-8 py-3.5 rounded-lg font-semibold hover:scale-105 transition-all shadow-[0_0_20px_rgba(168,85,247,0.4)] active:scale-95"
                >
                  <Play className="w-5 h-5 fill-white" />
                  Play Now
                </Link>
                <Link
                  to={`/moviebox/tmdb/${getMediaType(currentHero)}/${currentHero.id}`}
                  className="flex items-center gap-2 bg-[#0d141d]/40 backdrop-blur-xl border border-white/10 text-white px-8 py-3.5 rounded-lg font-semibold hover:bg-white/10 hover:scale-105 transition-all active:scale-95"
                >
                  <Info className="w-5 h-5" />
                  More Info
                </Link>
              </div>
            </motion.div>
          )}

          {/* Hero Nav Controls */}
          <div className="absolute right-4 sm:right-8 bottom-0 flex flex-col gap-2 z-20">
            {hero.map((_, i) => (
              <button key={i} onClick={() => setHeroIdx(i)}
                className={`w-1.5 rounded-full transition-all duration-300 ${i === heroIdx ? 'h-8 bg-purple-500' : 'h-2 bg-white/30 hover:bg-white/50'}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── SEARCH BAR ────────────────────────────────────────────────── */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 mb-8">
        <form onSubmit={handleSearch} className="relative max-w-xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={searchQ}
            onChange={e => setSearchQ(e.target.value)}
            placeholder="Search movies, TV shows..."
            className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-slate-700/50 rounded-xl focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none text-white placeholder:text-slate-500 backdrop-blur-md transition-all"
          />
        </form>
      </div>

      {/* ── MAIN CONTENT ───────────────────────────────────────────────── */}
      <main className="flex-grow w-full z-10">
        
        {/* Genre Filters */}
        <GenreBar activeGenre={activeGenre} onSelect={setActiveGenre} />

        {/* Content Rows */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-purple-500">
            <Loader2 className="w-12 h-12 animate-spin mb-4" />
            <p className="text-slate-400 font-medium">Loading Dashboard...</p>
          </div>
        ) : activeGenre !== null ? (
          <MovieRow title="Genre Results" items={genreMovies} loading={genreMovies.length === 0} />
        ) : (
          <>
            <MovieRow title="🔥 Trending This Week" items={trending} loading={false} />
            <MovieRow title="🎬 Now Playing in Theaters" items={nowPlaying} loading={false} />
            <MovieRow title="🏆 Top Rated All Time" items={topRated} loading={false} />
            <MovieRow title="📺 Trending TV Series" items={trendingTV.map(m => ({ ...m, media_type: 'tv' }))} loading={false} />
            <MovieRow title="⭐ Popular Series" items={popularTV.map(m => ({ ...m, media_type: 'tv' }))} loading={false} />
          </>
        )}
      </main>
    </div>
  );
};

export default TMDBMovieSection;
