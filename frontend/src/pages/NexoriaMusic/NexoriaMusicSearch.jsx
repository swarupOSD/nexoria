import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search as SearchIcon, Play, Heart, Compass, Library, MoreVertical, X, Download, ListPlus, Link2, ChevronLeft } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchNexoriaMusicQuery } from '../../features/api/nexoriaMusicApiSlice';
import { playTrack, toggleLikeTrack, addToQueue } from '../../features/music/nexoriaMusicSlice';
import DropdownMenu from '../../components/DropdownMenu';
import toast from 'react-hot-toast';

const NexoriaMusicSearch = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const initialQuery = queryParams.get('q') || '';
  
  const { likedTracks } = useSelector(state => state.nexoriaMusic);
  const [searchTerm, setSearchTerm] = useState(initialQuery);
  const [debouncedTerm, setDebouncedTerm] = useState(initialQuery);
  const initialTab = queryParams.get('tab') || 'all';
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    const tab = queryParams.get('tab');
    if (tab) setActiveTab(tab);
  }, [location.search]);

  // Debounce search term to prevent excessive API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedTerm(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const { data: searchRes, isLoading, isFetching } = useSearchNexoriaMusicQuery(debouncedTerm);

  const results = searchRes?.data || { tracks: [], albums: [], artists: [] };
  const hasResults = results.tracks.length > 0 || results.albums.length > 0 || results.artists.length > 0;

  return (
    <div className="min-h-screen bg-[#050505] text-white pb-32">
      {/* Header / Nav */}
      <header className="sticky top-0 z-50 bg-[#050505]/80 backdrop-blur-2xl border-b border-white/5 px-4 lg:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)} 
            className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 hover:scale-105 transition-all"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500">
            NEXORIA MUSIC
          </h1>
        </div>
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

        {/* Tabs */}
        {hasResults && (
          <div className="flex items-center gap-4 mb-8 overflow-x-auto pb-2 scrollbar-hide">
            {['all', 'songs', 'artists', 'albums'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2 rounded-full text-sm font-bold capitalize whitespace-nowrap transition-colors ${activeTab === tab ? 'bg-white text-black' : 'bg-white/10 text-white hover:bg-white/20'}`}
              >
                {tab}
              </button>
            ))}
          </div>
        )}

        {/* Loading State */}
        {(isLoading || isFetching) && (
          <div className="flex justify-center my-12">
            <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        {/* No Results */}
        {!isLoading && !isFetching && !hasResults && (
          <div className="text-center py-20 text-slate-400">
            <h2 className="text-xl font-bold text-white mb-2">No results found</h2>
            <p>Please make sure your words are spelled correctly or use less or different keywords.</p>
          </div>
        )}

        {/* Results */}
        {!isLoading && !isFetching && hasResults && (
          <div className="space-y-12">
            
            {/* Top Result & Songs */}
            {(activeTab === 'all' || activeTab === 'songs') && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* Left: Top Result (Artists usually, or top track) */}
                {activeTab === 'all' && results.artists.length > 0 && (
                <div>
                  <h3 className="text-2xl font-bold mb-6">Top Result</h3>
                  <div className="bg-white/5 hover:bg-white/10 transition-colors p-6 rounded-3xl cursor-pointer group"
                    onClick={() => {
                      setSearchTerm(results.artists[0].name);
                      setDebouncedTerm(results.artists[0].name);
                    }}
                  >
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
                    
                    <button 
                      className="absolute bottom-6 right-6 bg-purple-500 text-white p-4 rounded-full opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all shadow-xl shadow-purple-500/50 hover:scale-110"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Filter tracks globally or locally? We only have search results tracks here.
                        // Actually, if we want ALL tracks of the artist, we should just play the tracks in results.tracks that match.
                        // Since this is the search page for this artist, results.tracks already contains their tracks!
                        const artistTracks = results.tracks.filter(t => t.artist?._id === results.artists[0]._id || t.artist?.name === results.artists[0].name);
                        if (artistTracks.length > 0) {
                          const firstTrack = artistTracks[0];
                          const audioEl = document.getElementById('nexoria-global-audio');
                          if (audioEl) {
                            const baseUrl = BACKEND_URL.endsWith('/api') ? BACKEND_URL.slice(0, -4) : BACKEND_URL;
                            const newSrc = firstTrack.telegramFileId ? `${baseUrl}/api/nexoria-music/stream/${firstTrack.telegramFileId}` : firstTrack.audioUrl || "";
                            audioEl.src = newSrc;
                            audioEl.play().catch(err => console.log(err));
                          }
                          dispatch(setQueue(artistTracks.slice(1)));
                          dispatch(playTrack(firstTrack));
                        } else {
                          toast.error("No songs found for this artist!");
                        }
                      }}
                    >
                      <Play className="w-6 h-6 fill-current" />
                    </button>
                  </div>
                </div>
              )}

              {/* Right: Songs */}
              {results.tracks.length > 0 && (
                <div className={activeTab === 'all' && results.artists.length === 0 ? "md:col-span-2" : (activeTab === 'songs' ? "md:col-span-2" : "")}>
                  <h3 className="text-2xl font-bold mb-6">Songs</h3>
                  <div className="flex flex-col gap-2">
                    {results.tracks.map((track, idx) => (
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
                              const audioEl = document.getElementById('nexoria-global-audio');
                              if (audioEl) {
                                const baseUrl = BACKEND_URL.endsWith('/api') ? BACKEND_URL.slice(0, -4) : BACKEND_URL;
                                const newSrc = track.telegramFileId ? `${baseUrl}/api/nexoria-music/stream/${track.telegramFileId}` : track.audioUrl || "";
                                audioEl.src = newSrc;
                                audioEl.play().catch(err => console.log(err));
                              }
                              dispatch(setQueue(results.tracks.slice(idx + 1)));
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
                          <DropdownMenu
                            align="right"
                            width="w-48"
                            trigger={
                              <button 
                                className="text-slate-400 hover:text-white flex items-center justify-center p-2 rounded-full hover:bg-white/10 transition-colors"
                              >
                                <MoreVertical className="w-5 h-5" />
                              </button>
                            }
                          >
                            <div className="py-2 text-sm font-medium text-slate-300">
                              <button 
                                className="w-full text-left px-4 py-2.5 hover:bg-white/10 hover:text-white flex items-center gap-3 transition-colors"
                                onClick={(e) => { 
                                  e.stopPropagation(); 
                                  dispatch(addToQueue(track)); 
                                  toast.success('Added to Queue'); 
                                }}
                              >
                                <ListPlus className="w-4 h-4" /> Add to Queue
                              </button>
                              <button 
                                className="w-full text-left px-4 py-2.5 hover:bg-white/10 hover:text-white flex items-center gap-3 transition-colors"
                                onClick={(e) => { 
                                  const baseUrl = BACKEND_URL.endsWith('/api') ? BACKEND_URL.slice(0, -4) : BACKEND_URL;
                                  const url = track.telegramFileId ? `${baseUrl}/api/nexoria-music/stream/${track.telegramFileId}` : track.audioUrl;
                                  window.open(url, '_blank');
                                }}
                              >
                                <Download className="w-4 h-4" /> Download
                              </button>
                              <button 
                                className="w-full text-left px-4 py-2.5 hover:bg-white/10 hover:text-white flex items-center gap-3 transition-colors"
                                onClick={(e) => { 
                                  e.stopPropagation(); 
                                  navigator.clipboard.writeText(window.location.href); 
                                  toast.success('Link copied'); 
                                }}
                              >
                                <Link2 className="w-4 h-4" /> Share
                              </button>
                            </div>
                          </DropdownMenu>
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
            )}

            {/* Artists */}
            {(activeTab === 'all' || activeTab === 'artists') && results.artists.length > (activeTab === 'all' ? 1 : 0) && (
              <section>
                <h3 className="text-2xl font-bold mb-6">Artists</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                  {results.artists.slice(activeTab === 'all' ? 1 : 0).map(artist => (
                    <div 
                      key={artist._id} 
                      className="flex flex-col items-center gap-3 group cursor-pointer bg-white/5 hover:bg-white/10 p-4 rounded-2xl transition-colors relative"
                      onClick={() => {
                        setSearchTerm(artist.name);
                        setDebouncedTerm(artist.name);
                      }}
                    >
                      <div className="w-32 h-32 rounded-full overflow-hidden relative shadow-xl">
                        {artist.image ? (
                          <img src={artist.image} alt={artist.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                          <div className="w-full h-full bg-slate-800 flex items-center justify-center text-3xl font-bold text-slate-500">
                            {artist.name[0]}
                          </div>
                        )}
                        
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                          <button 
                            className="bg-purple-500 text-white p-3 rounded-full transform translate-y-4 group-hover:translate-y-0 transition-all shadow-xl hover:scale-110"
                            onClick={(e) => {
                              e.stopPropagation();
                              const artistTracks = results.tracks.filter(t => t.artist?._id === artist._id || t.artist?.name === artist.name);
                              if (artistTracks.length > 0) {
                                const firstTrack = artistTracks[0];
                                const audioEl = document.getElementById('nexoria-global-audio');
                                if (audioEl) {
                                  const baseUrl = BACKEND_URL.endsWith('/api') ? BACKEND_URL.slice(0, -4) : BACKEND_URL;
                                  const newSrc = firstTrack.telegramFileId ? `${baseUrl}/api/nexoria-music/stream/${firstTrack.telegramFileId}` : firstTrack.audioUrl || "";
                                  audioEl.src = newSrc;
                                  audioEl.play().catch(err => console.log(err));
                                }
                                dispatch(setQueue(artistTracks.slice(1)));
                                dispatch(playTrack(firstTrack));
                              } else {
                                toast.error("No songs found for this artist in search results!");
                              }
                            }}
                          >
                            <Play className="w-5 h-5 fill-current" />
                          </button>
                        </div>
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
            {(activeTab === 'all' || activeTab === 'albums') && results.albums.length > 0 && (
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
                          <button 
                            className="bg-purple-500 text-white p-3 rounded-full transform translate-y-4 group-hover:translate-y-0 transition-all shadow-xl hover:scale-110"
                            onClick={(e) => {
                              e.stopPropagation();
                              const albumTracks = results.tracks.filter(t => t.album?._id === album._id || t.album?.title === album.title);
                              if (albumTracks.length > 0) {
                                const firstTrack = albumTracks[0];
                                const audioEl = document.getElementById('nexoria-global-audio');
                                if (audioEl) {
                                  const baseUrl = BACKEND_URL.endsWith('/api') ? BACKEND_URL.slice(0, -4) : BACKEND_URL;
                                  const newSrc = firstTrack.telegramFileId ? `${baseUrl}/api/nexoria-music/stream/${firstTrack.telegramFileId}` : firstTrack.audioUrl || "";
                                  audioEl.src = newSrc;
                                  audioEl.play().catch(err => console.log(err));
                                }
                                dispatch(setQueue(albumTracks.slice(1)));
                                dispatch(playTrack(firstTrack));
                              } else {
                                toast.error("No songs found for this album in search results!");
                              }
                            }}
                          >
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
