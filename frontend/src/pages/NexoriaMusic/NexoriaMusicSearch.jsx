import React, { useState, useEffect } from 'react';
import { Search as SearchIcon, Play, Pause, Heart, X, ArrowLeft } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { BACKEND_URL } from '../../features/api/apiSlice';
import { useSearchNexoriaMusicQuery } from '../../features/api/nexoriaMusicApiSlice';
import { playTrack, togglePlayPause, setQueue, toggleLikeTrack } from '../../features/music/nexoriaMusicSlice';
import toast from 'react-hot-toast';

const BROWSE_CATEGORIES = [
  { id: 1, name: "Podcasts", color: "bg-gradient-to-br from-orange-400 to-orange-600", img: "https://images.unsplash.com/photo-1593697972674-84594c798083?q=80&w=100&auto=format&fit=crop" },
  { id: 2, name: "Made For You", color: "bg-gradient-to-br from-indigo-500 to-purple-700", img: "https://images.unsplash.com/photo-1493225457124-a1a2a5370217?q=80&w=100&auto=format&fit=crop" },
  { id: 3, name: "New Releases", color: "bg-gradient-to-br from-pink-500 to-rose-600", img: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=100&auto=format&fit=crop" },
  { id: 4, name: "Pop", color: "bg-gradient-to-br from-emerald-400 to-emerald-600", img: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=100&auto=format&fit=crop" },
  { id: 5, name: "Hip-Hop", color: "bg-gradient-to-br from-amber-400 to-amber-600", img: "https://images.unsplash.com/photo-1602934445884-da0fa1c9d3b3?q=80&w=100&auto=format&fit=crop" },
  { id: 6, name: "Rock", color: "bg-gradient-to-br from-red-500 to-red-700", img: "https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?q=80&w=100&auto=format&fit=crop" },
  { id: 7, name: "Chill", color: "bg-gradient-to-br from-teal-400 to-teal-600", img: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=100&auto=format&fit=crop" },
  { id: 8, name: "Workout", color: "bg-gradient-to-br from-blue-500 to-blue-700", img: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=100&auto=format&fit=crop" },
  { id: 9, name: "Focus", color: "bg-gradient-to-br from-fuchsia-600 to-fuchsia-800", img: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?q=80&w=100&auto=format&fit=crop" },
  { id: 10, name: "Sleep", color: "bg-gradient-to-br from-sky-700 to-sky-900", img: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?q=80&w=100&auto=format&fit=crop" },
  { id: 11, name: "Party", color: "bg-gradient-to-br from-rose-400 to-rose-600", img: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=100&auto=format&fit=crop" },
  { id: 12, name: "Jazz", color: "bg-gradient-to-br from-cyan-600 to-cyan-800", img: "https://images.unsplash.com/photo-1511192336575-5a79af67a629?q=80&w=100&auto=format&fit=crop" },
];

const NexoriaMusicSearch = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialQuery = queryParams.get('q') || '';
  
  const { currentTrack, isPlaying, likedTracks } = useSelector(state => state.nexoriaMusic);
  const [searchTerm, setSearchTerm] = useState(initialQuery);
  const [debouncedTerm, setDebouncedTerm] = useState(initialQuery);
  const initialTab = queryParams.get('tab') || 'all';
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    const tab = queryParams.get('tab');
    if (tab) setActiveTab(tab);
  }, [location.search]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedTerm(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const { data: searchRes, isLoading, isFetching } = useSearchNexoriaMusicQuery(debouncedTerm);
  const results = searchRes?.data || { tracks: [], albums: [], artists: [] };
  const hasResults = results.tracks.length > 0 || results.albums.length > 0 || results.artists.length > 0;

  const handlePlay = (track, trackList) => {
    if (currentTrack?._id === track._id) {
      dispatch(togglePlayPause());
    } else {
      // Immediately set audio src for zero-delay play
      if (window.__nexoriaAudioRef?.current) {
        const baseUrl = BACKEND_URL.endsWith('/api') ? BACKEND_URL.slice(0, -4) : BACKEND_URL;
        const src = track.telegramFileId
          ? `${baseUrl}/api/nexoria-music/stream/${track.telegramFileId}`
          : track.audioUrl || '';
        if (src) {
           
          window.__nexoriaAudioRef.current.src = src;
          window.__nexoriaAudioRef.current.play().catch(() => {});
        }
      }
      dispatch(setQueue(trackList || []));
      dispatch(playTrack(track));
    }
  };

  return (
    <div className="min-h-screen bg-background text-on-surface font-body-md pb-32">
      {/* Mobile Sticky Header */}
      <div className="sm:hidden sticky top-0 z-50 bg-background/95 backdrop-blur-3xl border-b border-outline-variant/30 flex items-center px-4 h-16 shadow-lg">
        <button 
          onClick={() => window.history.back()}
          className="w-10 h-10 flex items-center justify-center text-on-surface-variant hover:text-on-surface active:scale-90 transition-transform bg-surface-container rounded-full"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <span className="flex-1 text-center font-display-lg font-bold text-on-surface text-lg truncate px-2">Search</span>
        <div className="w-10" /> {/* Spacer for centering */}
      </div>

      <div className="px-4 md:px-margin-desktop pt-6 sm:pt-12 pb-8 max-w-[1440px] mx-auto">
        
        {/* Search Bar */}
        <div className="relative max-w-2xl mb-12 group">
          <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-on-surface-variant group-focus-within:text-primary transition-colors">
            <SearchIcon className="w-6 h-6" />
          </div>
          <input 
            type="text" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="What do you want to listen to?" 
            className="w-full bg-surface-container hover:bg-surface-container-high focus:bg-surface-container-high text-on-surface placeholder-on-surface-variant rounded-full py-4 pl-14 pr-12 outline-none border border-outline-variant/50 focus:border-primary transition-all shadow-[0_8px_30px_rgb(0,0,0,0.12)] focus:shadow-[0_8px_30px_rgba(210,187,255,0.15)] font-body-md text-lg"
            autoFocus
          />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm('')}
              className="absolute inset-y-0 right-5 flex items-center text-on-surface-variant hover:text-on-surface transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          )}
        </div>

        {/* Loading */}
        {(isLoading || isFetching) && (
          <div className="flex justify-center my-24">
            <div className="w-12 h-12 border-4 border-outline-variant border-t-primary rounded-full animate-spin shadow-[0_0_15px_rgba(210,187,255,0.5)]"></div>
          </div>
        )}

        {/* Empty State / Browse All */}
        {!debouncedTerm && !isLoading && !isFetching && (
          <section>
            <h2 className="font-display-lg text-headline-sm text-on-surface mb-8 font-bold tracking-tight">Browse all</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
              {BROWSE_CATEGORIES.map((cat) => (
                <div 
                  key={cat.id} 
                  className={`${cat.color} rounded-2xl p-5 h-44 overflow-hidden relative cursor-pointer hover:scale-[1.02] hover:-translate-y-1 active:scale-[0.98] transition-all shadow-lg hover:shadow-xl`}
                >
                  <h3 className="font-display-md font-bold text-xl text-white leading-tight break-words max-w-[85%]">{cat.name}</h3>
                  <img 
                    src={cat.img} 
                    alt={cat.name} 
                    className="w-28 h-28 object-cover absolute -bottom-6 -right-6 rotate-[20deg] rounded-xl shadow-2xl"
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* No Results */}
        {debouncedTerm && !isLoading && !isFetching && !hasResults && (
          <div className="text-center py-32 text-on-surface-variant flex flex-col items-center justify-center">
            <SearchIcon className="w-16 h-16 mb-6 opacity-50" />
            <h2 className="font-display-lg text-headline-md text-on-surface mb-4 font-bold tracking-tight">No results found for "{debouncedTerm}"</h2>
            <p className="font-body-md text-title-md max-w-md">Please make sure your words are spelled correctly or use less or different keywords.</p>
          </div>
        )}

        {/* Search Results */}
        {debouncedTerm && !isLoading && !isFetching && hasResults && (
          <div className="space-y-10">
            
            {/* Tabs */}
            <div className="flex items-center gap-3 overflow-x-auto pb-4 no-scrollbar">
              {['all', 'songs', 'artists', 'albums'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-2.5 rounded-full font-label-sm text-sm uppercase tracking-wider whitespace-nowrap transition-all border ${
                    activeTab === tab 
                      ? 'bg-primary text-on-primary border-primary font-bold shadow-[0_0_15px_rgba(210,187,255,0.3)]' 
                      : 'bg-surface-container-low text-on-surface-variant border-outline-variant/30 hover:bg-surface-container hover:text-on-surface'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Top Result & Songs */}
            {(activeTab === 'all' || activeTab === 'songs') && (
              <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
                
                {/* Left: Top Result */}
                {activeTab === 'all' && results.artists.length > 0 && (
                  <div className="xl:col-span-2">
                    <h2 className="font-display-lg text-headline-sm text-on-surface mb-6 font-bold tracking-tight">Top result</h2>
                    <div className="glass-card p-6 rounded-2xl cursor-pointer group relative hover:bg-surface-container transition-all border border-outline-variant/20 h-[300px] flex flex-col justify-end overflow-hidden">
                      {results.artists[0].image && (
                        <div className="absolute inset-0 opacity-40 group-hover:opacity-60 transition-opacity duration-500 z-0">
                           <img src={results.artists[0].image} className="w-full h-full object-cover blur-sm scale-110" alt="" />
                           <div className="absolute inset-0 bg-gradient-to-t from-surface-container-low via-surface-container-low/80 to-transparent"></div>
                        </div>
                      )}
                      
                      <div className="w-[120px] h-[120px] rounded-full overflow-hidden mb-6 shadow-2xl relative z-10 border-4 border-surface-container-high shrink-0">
                        {results.artists[0].image ? (
                          <img src={results.artists[0].image} alt={results.artists[0].name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                          <div className="w-full h-full bg-surface-container-high flex items-center justify-center text-5xl font-display-lg font-bold text-on-surface-variant">
                            {results.artists[0].name[0]}
                          </div>
                        )}
                      </div>
                      <h3 className="font-display-lg text-[40px] font-bold text-on-surface mb-3 truncate leading-none relative z-10 tracking-tight">{results.artists[0].name}</h3>
                      <div className="flex items-center gap-4 relative z-10">
                        <span className="font-label-sm text-xs font-bold bg-surface-container-highest px-4 py-1.5 rounded-full uppercase tracking-widest text-on-surface">Artist</span>
                      </div>
                      
                      {/* Big Play Button */}
                      <button 
                        className="absolute bottom-6 right-6 w-16 h-16 bg-primary text-on-primary rounded-full opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 shadow-[0_10px_30px_rgba(210,187,255,0.4)] flex items-center justify-center hover:scale-110 active:scale-95 z-20 glow-primary"
                        onClick={(e) => {
                          e.stopPropagation();
                          const artistTracks = results.tracks.filter(t => t.artist?._id === results.artists[0]._id || t.artist?.name === results.artists[0].name);
                          if (artistTracks.length > 0) {
                            handlePlay(artistTracks[0], artistTracks);
                          } else {
                            toast.error("No songs found for this artist!");
                          }
                        }}
                      >
                        <Play className="w-8 h-8 fill-current" style={{ fontVariationSettings: "'FILL' 1" }} />
                      </button>
                    </div>
                  </div>
                )}

                {/* Right: Songs list */}
                {results.tracks.length > 0 && (
                  <div className={(activeTab === 'all' && results.artists.length > 0) ? "xl:col-span-3" : "xl:col-span-5"}>
                    <h2 className="font-display-lg text-headline-sm text-on-surface mb-6 font-bold tracking-tight">Songs</h2>
                    <div className="flex flex-col gap-2">
                      {results.tracks.slice(0, activeTab === 'all' ? 4 : 20).map((track, idx) => (
                        <div 
                          key={track._id} 
                          className="glass-panel flex items-center gap-4 p-3 rounded-xl hover:bg-surface-container group transition-colors cursor-pointer border-none"
                          onClick={() => handlePlay(track, results.tracks)}
                        >
                          <div className="relative w-12 h-12 bg-surface-container-high shrink-0 rounded-md overflow-hidden shadow-md">
                            {track.coverImage || track.album?.coverImage || track.artist?.image ? (
                              <img src={track.coverImage || track.album?.coverImage || track.artist?.image} alt={track.title} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-on-surface-variant"><Play className="w-5 h-5" /></div>
                            )}
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                              {currentTrack?._id === track._id && isPlaying ? <Pause className="w-5 h-5 fill-current text-white" /> : <Play className="w-5 h-5 fill-current text-white" style={{ fontVariationSettings: "'FILL' 1" }} />}
                            </div>
                          </div>
                          
                          <div className="flex-1 min-w-0 flex flex-col justify-center">
                            <h4 className={`font-body-md text-base truncate font-bold ${currentTrack?._id === track._id ? 'text-primary' : 'text-on-surface'}`}>{track.title}</h4>
                            <p className="font-label-sm text-sm text-on-surface-variant truncate">{track.artist?.name || 'Unknown Artist'}</p>
                          </div>

                          <button 
                            className="p-2 opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110"
                            onClick={(e) => {
                              e.stopPropagation();
                              dispatch(toggleLikeTrack(track._id));
                            }}
                          >
                            <Heart className={`w-5 h-5 ${likedTracks?.includes(track._id) ? 'fill-primary text-primary glow-accent' : 'text-on-surface-variant hover:text-on-surface'}`} />
                          </button>
                          
                          <span className="font-label-sm text-sm text-on-surface-variant w-10 text-right pr-2 tabular-nums">3:24</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Albums */}
            {/* Albums */}
            {(activeTab === 'all' || activeTab === 'albums') && results.albums.length > 0 && (
              <section className="mt-8">
                <h2 className="font-display-lg text-headline-sm text-on-surface mb-6 font-bold tracking-tight">Albums</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
                  {results.albums.map(album => (
                    <div key={album._id} className="group cursor-pointer flex flex-col">
                      <div className="w-full aspect-square bg-surface-container rounded-xl mb-4 shadow-lg overflow-hidden relative border border-outline-variant/20">
                        {album.coverImage && <img src={album.coverImage} alt={album.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button className="w-14 h-14 bg-primary text-on-primary rounded-full flex items-center justify-center shadow-[0_10px_20px_rgba(210,187,255,0.3)] hover:scale-110 active:scale-95 transition-all glow-primary">
                             <Play className="w-6 h-6 fill-current" style={{ fontVariationSettings: "'FILL' 1" }} />
                          </button>
                        </div>
                      </div>
                      <h4 className="font-body-md font-bold text-on-surface text-base truncate mb-1">{album.title}</h4>
                      <p className="font-label-sm text-sm text-on-surface-variant line-clamp-1">{album.artist?.name || 'Unknown Artist'}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Artists */}
            {(activeTab === 'all' || activeTab === 'artists') && results.artists.length > 0 && (
              <section className="mt-8">
                <h2 className="font-display-lg text-headline-sm text-on-surface mb-6 font-bold tracking-tight">Artists</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
                  {results.artists.map(artist => (
                    <div key={artist._id} className="group cursor-pointer flex flex-col items-center text-center">
                      <div className="w-32 h-32 md:w-full md:aspect-square bg-surface-container rounded-full mb-4 shadow-lg overflow-hidden relative border border-outline-variant/20 mx-auto shrink-0">
                        {artist.image ? (
                          <img src={artist.image} alt={artist.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-5xl font-bold text-on-surface-variant">{artist.name[0]}</div>
                        )}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button className="w-14 h-14 bg-primary text-on-primary rounded-full flex items-center justify-center shadow-[0_10px_20px_rgba(210,187,255,0.3)] hover:scale-110 active:scale-95 transition-all glow-primary">
                             <Play className="w-6 h-6 fill-current" style={{ fontVariationSettings: "'FILL' 1" }} />
                          </button>
                        </div>
                      </div>
                      <h4 className="font-body-md font-bold text-on-surface text-base truncate mb-1 hover:text-primary transition-colors w-full">{artist.name}</h4>
                      <p className="font-label-sm text-xs uppercase tracking-wider text-on-surface-variant w-full">Artist</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

          </div>
        )}
      </div>
    </div>
  );
};

export default NexoriaMusicSearch;
