import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search as SearchIcon, Play, Heart, Compass, Library, MoreVertical, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchNexoriaMusicQuery } from '../../features/api/nexoriaMusicApiSlice';
import { playTrack, toggleLikeTrack } from '../../features/music/nexoriaMusicSlice';

const NexoriaMusicSearch = () => {
  const dispatch = useDispatch();
  const { likedTracks } = useSelector(state => state.nexoriaMusic);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedTerm, setDebouncedTerm] = useState('');

  // Debounce search term to prevent excessive API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedTerm(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const { data: searchRes, isLoading, isFetching } = useSearchNexoriaMusicQuery(debouncedTerm, {
    skip: debouncedTerm.length < 2,
  });

  const results = searchRes?.data || { tracks: [], albums: [], artists: [] };
  const hasResults = results.tracks.length > 0 || results.albums.length > 0 || results.artists.length > 0;

  return (
    <div className="min-h-screen bg-[#050505] text-white pb-32">
      {/* Header / Nav */}
      <header className="sticky top-0 z-50 bg-[#050505]/80 backdrop-blur-2xl border-b border-white/5 px-4 lg:px-8 py-4 flex items-center justify-between">
        <h1 className="text-2xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500">
          NEXORIA MUSIC
        </h1>
        <div className="flex items-center gap-6 text-slate-400 font-medium">
          <Link to="/nexoria-music" className="hover:text-white transition-colors flex items-center gap-2">
            <Compass className="w-5 h-5" /> <span className="hidden md:inline">Discover</span>
          </Link>
          <Link to="/nexoria-music/search" className="text-white hover:text-white transition-colors flex items-center gap-2">
            <SearchIcon className="w-5 h-5" /> <span className="hidden md:inline">Search</span>
          </Link>
          <Link to="/nexoria-music/library" className="hover:text-white transition-colors flex items-center gap-2">
            <Library className="w-5 h-5" /> <span className="hidden md:inline">Library</span>
          </Link>
        </div>
      </header>

      <main className="px-4 lg:px-8 py-8 max-w-[1200px] mx-auto">
        
        {/* Search Input */}
        <div className="relative max-w-2xl mx-auto mb-12">
          <div className="relative group">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-purple-500 transition-colors">
              <SearchIcon className="w-6 h-6" />
            </div>
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="What do you want to listen to?" 
              className="w-full bg-white/5 hover:bg-white/10 focus:bg-white/10 text-white placeholder-slate-400 rounded-full py-4 pl-14 pr-12 outline-none border border-white/5 focus:border-purple-500/50 transition-all text-lg shadow-lg"
              autoFocus
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="absolute inset-y-0 right-4 flex items-center text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Loading State */}
        {(isLoading || isFetching) && debouncedTerm.length >= 2 && (
          <div className="flex justify-center my-12">
            <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        {/* Empty State / Initial */}
        {debouncedTerm.length < 2 && (
          <div className="text-center py-20 text-slate-400">
            <SearchIcon className="w-16 h-16 mx-auto mb-4 opacity-20" />
            <h2 className="text-xl font-bold text-white mb-2">Search Nexoria Music</h2>
            <p>Find your favorite tracks, artists, and albums.</p>
          </div>
        )}

        {/* No Results */}
        {debouncedTerm.length >= 2 && !isLoading && !isFetching && !hasResults && (
          <div className="text-center py-20 text-slate-400">
            <h2 className="text-xl font-bold text-white mb-2">No results found for "{debouncedTerm}"</h2>
            <p>Please make sure your words are spelled correctly or use less or different keywords.</p>
          </div>
        )}

        {/* Results */}
        {debouncedTerm.length >= 2 && !isLoading && hasResults && (
          <div className="space-y-12">
            
            {/* Top Result & Songs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Left: Top Result (Artists usually, or top track) */}
              {results.artists.length > 0 && (
                <div>
                  <h3 className="text-2xl font-bold mb-6">Top Result</h3>
                  <div className="bg-white/5 hover:bg-white/10 transition-colors p-6 rounded-3xl cursor-pointer group">
                    <div className="w-24 h-24 rounded-full overflow-hidden mb-4 shadow-xl">
                      {results.artists[0].image ? (
                        <img src={results.artists[0].image} alt={results.artists[0].name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-slate-800 flex items-center justify-center text-3xl font-bold text-slate-500">
                          {results.artists[0].name[0]}
                        </div>
                      )}
                    </div>
                    <h2 className="text-3xl font-black text-white mb-1 truncate">{results.artists[0].name}</h2>
                    <span className="text-sm font-bold bg-black/50 px-3 py-1 rounded-full uppercase tracking-widest text-slate-300">Artist</span>
                    
                    <button className="absolute bottom-6 right-6 bg-purple-500 text-white p-4 rounded-full opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all shadow-xl shadow-purple-500/50 hover:scale-110">
                      <Play className="w-6 h-6 fill-current" />
                    </button>
                  </div>
                </div>
              )}

              {/* Right: Songs */}
              {results.tracks.length > 0 && (
                <div className={results.artists.length === 0 ? "md:col-span-2" : ""}>
                  <h3 className="text-2xl font-bold mb-6">Songs</h3>
                  <div className="flex flex-col gap-2">
                    {results.tracks.slice(0, 4).map((track, idx) => (
                      <div key={track._id} className="flex items-center gap-4 p-2 rounded-xl hover:bg-white/5 group transition-colors cursor-pointer">
                        <div className="relative w-12 h-12 rounded-lg bg-slate-800 flex-shrink-0 overflow-hidden shadow-md">
                          {track.coverImage || track.album?.coverImage || track.artist?.image ? (
                            <img src={track.coverImage || track.album?.coverImage || track.artist?.image} alt={track.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-purple-500/20 to-blue-500/20" />
                          )}
                          <div 
                            className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                            onClick={(e) => {
                              e.stopPropagation();
                              dispatch(playTrack(track));
                            }}
                          >
                            <Play className="w-5 h-5 fill-current text-white" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-white truncate group-hover:text-purple-400 transition-colors">{track.title}</h4>
                          <p className="text-slate-400 text-sm truncate">{track.artist?.name || 'Unknown Artist'}</p>
                        </div>
                        <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            className="text-slate-400 hover:text-white"
                            onClick={(e) => {
                              e.stopPropagation();
                              dispatch(toggleLikeTrack(track._id));
                            }}
                          >
                            <Heart className={`w-5 h-5 ${likedTracks?.includes(track._id) ? 'fill-pink-500 text-pink-500' : ''}`} />
                          </button>
                          <button 
                            className="text-slate-400 hover:text-white"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreVertical className="w-5 h-5" />
                          </button>
                        </div>
                        <span className="text-sm font-medium text-slate-500 w-12 text-right group-hover:opacity-0">
                          {Math.floor(track.duration / 60)}:{(track.duration % 60).toString().padStart(2, '0')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Artists */}
            {results.artists.length > 1 && (
              <section>
                <h3 className="text-2xl font-bold mb-6">Artists</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                  {results.artists.slice(1).map(artist => (
                    <div key={artist._id} className="flex flex-col items-center gap-3 group cursor-pointer bg-white/5 hover:bg-white/10 p-4 rounded-2xl transition-colors">
                      <div className="w-32 h-32 rounded-full overflow-hidden relative shadow-xl">
                        {artist.image ? (
                          <img src={artist.image} alt={artist.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                          <div className="w-full h-full bg-slate-800 flex items-center justify-center text-3xl font-bold text-slate-500">
                            {artist.name[0]}
                          </div>
                        )}
                      </div>
                      <div className="text-center w-full">
                        <h4 className="font-bold text-white truncate">{artist.name}</h4>
                        <p className="text-xs text-slate-400 uppercase tracking-widest mt-1">Artist</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Albums */}
            {results.albums.length > 0 && (
              <section>
                <h3 className="text-2xl font-bold mb-6">Albums</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                  {results.albums.map(album => (
                    <div key={album._id} className="group cursor-pointer bg-white/5 hover:bg-white/10 p-4 rounded-2xl transition-colors">
                      <div className="relative aspect-square rounded-xl overflow-hidden mb-4 shadow-lg">
                        {album.coverImage ? (
                          <img src={album.coverImage} alt={album.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                          <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                            <span className="text-slate-500">No Image</span>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                          <button className="bg-purple-500 text-white p-3 rounded-full transform translate-y-4 group-hover:translate-y-0 transition-all shadow-xl hover:scale-110">
                            <Play className="w-5 h-5 fill-current" />
                          </button>
                        </div>
                      </div>
                      <h4 className="font-bold text-white truncate">{album.title}</h4>
                      <p className="text-slate-400 text-sm truncate">{album.artist?.name || 'Various Artists'}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

          </div>
        )}
      </main>
    </div>
  );
};

export default NexoriaMusicSearch;
