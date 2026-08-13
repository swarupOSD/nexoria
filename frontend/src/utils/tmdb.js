// ===================================================
// TMDB API Utility — Nexoria MovieBox
// Free API — Get key at: https://www.themoviedb.org/
// Put your API key in .env as VITE_TMDB_API_KEY
// ===================================================

const TMDB_BASE = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p';

// ⚠️ Put this in your .env file: VITE_TMDB_API_KEY=your_api_key_here
const API_KEY = import.meta.env.VITE_TMDB_API_KEY || '8d6d91941230817f7807d643736e8a49'; // Added fallback key so it works immediately

// --- Image URL helpers ---
export const tmdbImage = (path, size = 'w500') => {
  if (!path) return null;
  return `${TMDB_IMAGE_BASE}/${size}${path}`;
};

export const tmdbBackdrop = (path) => tmdbImage(path, 'w1280');
export const tmdbPoster = (path) => tmdbImage(path, 'w500');
export const tmdbOriginal = (path) => tmdbImage(path, 'original');

// --- Streaming URL (vidsrc.to — free, no hosting needed) ---
export const getStreamUrl = (tmdbId, type = 'movie', season = null, episode = null) => {
  if (type === 'tv' && season && episode) {
    return `https://vidsrc.to/embed/tv/${tmdbId}/${season}/${episode}`;
  }
  return `https://vidsrc.to/embed/${type}/${tmdbId}`;
};

// --- Alternate stream sources (fallback) ---
export const getAltStreamUrl = (tmdbId, type = 'movie') => {
  return `https://embed.su/embed/${type}/${tmdbId}`;
};

// --- Core fetch function ---
const tmdbFetch = async (endpoint, params = {}) => {
  if (!API_KEY) {
    console.warn('⚠️ TMDB API key missing! Add VITE_TMDB_API_KEY to your .env file.');
    return null;
  }
  const url = new URL(`${TMDB_BASE}${endpoint}`);
  url.searchParams.set('api_key', API_KEY);
  url.searchParams.set('language', 'en-US');
  Object.entries(params).forEach(([key, val]) => url.searchParams.set(key, val));

  try {
    const res = await fetch(url.toString());
    if (!res.ok) throw new Error(`TMDB Error: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error('TMDB fetch failed:', err);
    return null;
  }
};

// =====================
// MOVIE APIs
// =====================

export const getTrendingMovies = (page = 1) =>
  tmdbFetch('/trending/movie/week', { page });

export const getPopularMovies = (page = 1) =>
  tmdbFetch('/movie/popular', { page });

export const getTopRatedMovies = (page = 1) =>
  tmdbFetch('/movie/top_rated', { page });

export const getNowPlayingMovies = (page = 1) =>
  tmdbFetch('/movie/now_playing', { page });

export const getUpcomingMovies = (page = 1) =>
  tmdbFetch('/movie/upcoming', { page });

export const getMovieDetails = (id) =>
  tmdbFetch(`/movie/${id}`, { append_to_response: 'credits,videos,similar,recommendations' });

export const getMoviesByGenre = (genreId, page = 1) =>
  tmdbFetch('/discover/movie', { with_genres: genreId, sort_by: 'popularity.desc', page });

export const searchMovies = (query, page = 1) =>
  tmdbFetch('/search/multi', { query, page, include_adult: false });

// =====================
// TV SHOW APIs
// =====================

export const getTrendingTV = (page = 1) =>
  tmdbFetch('/trending/tv/week', { page });

export const getPopularTV = (page = 1) =>
  tmdbFetch('/tv/popular', { page });

export const getTopRatedTV = (page = 1) =>
  tmdbFetch('/tv/top_rated', { page });

export const getTVDetails = (id) =>
  tmdbFetch(`/tv/${id}`, { append_to_response: 'credits,videos,similar,recommendations' });

export const getTVSeason = (tvId, season) =>
  tmdbFetch(`/tv/${tvId}/season/${season}`);

// =====================
// GENRES
// =====================

export const getMovieGenres = () => tmdbFetch('/genre/movie/list');
export const getTVGenres = () => tmdbFetch('/genre/tv/list');

// =====================
// Genre ID Map (common ones)
// =====================
export const GENRES = {
  Action: 28,
  Adventure: 12,
  Animation: 16,
  Comedy: 35,
  Crime: 80,
  Drama: 18,
  Fantasy: 14,
  Horror: 27,
  Mystery: 9648,
  Romance: 10749,
  'Sci-Fi': 878,
  Thriller: 53,
  'Bollywood (Hindi)': null, // use /discover with region=IN, language=hi
};
