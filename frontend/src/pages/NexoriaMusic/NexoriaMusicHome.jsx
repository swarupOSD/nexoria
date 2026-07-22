import React from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, Heart, Search, Library, Compass, MoreVertical, Download, ListPlus, Link2 } from 'lucide-react';
import { useGetNexoriaAlbumsQuery, useGetNexoriaArtistsQuery, useGetNexoriaTracksQuery } from '../../features/api/nexoriaMusicApiSlice';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { playTrack, setQueue, togglePlayPause, toggleLikeTrack, addToQueue } from '../../features/music/nexoriaMusicSlice';
import DropdownMenu from '../../components/DropdownMenu';
import toast from 'react-hot-toast';
import { BACKEND_URL } from '../../features/api/apiSlice';

const NexoriaMusicHome = () => {
  const dispatch = useDispatch();
  const { currentTrack, isPlaying, likedTracks } = useSelector(state => state.nexoriaMusic);
  const { data: albumsRes, isLoading: loadingAlbums } = useGetNexoriaAlbumsQuery();
  const { data: artistsRes, isLoading: loadingArtists } = useGetNexoriaArtistsQuery();
  const { data: tracksRes, isLoading: loadingTracks } = useGetNexoriaTracksQuery();

  const albums = albumsRes?.data || [];
  const artists = artistsRes?.data || [];
  const tracks = tracksRes?.data || [];

  return (
    <div className="min-h-screen bg-[#080312] text-white pb-32 relative overflow-hidden">
      {/* Gen-Z Mesh Gradient Glowing Background */}
      <div className="fixed top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-purple-600/20 blur-[120px] pointer-events-none mix-blend-screen" />
      <div className="fixed bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-pink-600/10 blur-[120px] pointer-events-none mix-blend-screen" />
      <div className="fixed top-[40%] left-[60%] w-[30%] h-[30%] rounded-full bg-indigo-500/10 blur-[100px] pointer-events-none mix-blend-screen" />

      {/* Dynamic Header/Nav */}
      <header className="sticky top-0 z-50 bg-[#080312]/50 backdrop-blur-3xl border-b border-white/5 px-4 lg:px-8 py-5 flex items-center justify-between">
        <h1 className="text-2xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-fuchsia-500 via-purple-500 to-indigo-500 drop-shadow-[0_0_15px_rgba(168,85,247,0.4)]">
          NEXORIA MUSIC
        </h1>
        <div className="flex items-center gap-6 text-slate-400 font-medium">
          <Link to="/nexoria-music" className="text-white hover:text-white transition-colors flex items-center gap-2">
            <Compass className="w-5 h-5" /> <span className="hidden md:inline">Discover</span>
          </Link>
          <Link to="/nexoria-music/search" className="hover:text-white transition-colors flex items-center gap-2">
            <Search className="w-5 h-5" /> <span className="hidden md:inline">Search</span>
          </Link>
          <Link to="/nexoria-music/library" className="hover:text-white transition-colors flex items-center gap-2">
            <Library className="w-5 h-5" /> <span className="hidden md:inline">Library</span>
          </Link>
        </div>
      </header>

      <main className="px-4 lg:px-8 py-8 space-y-12 max-w-[1600px] mx-auto">
        
        {/* Featured Banner / Hero */}
        <section className="relative h-[300px] md:h-[420px] rounded-[2rem] overflow-hidden group shadow-[0_20px_50px_-15px_rgba(168,85,247,0.3)] border border-white/10">
          <div className="absolute inset-0 bg-gradient-to-r from-violet-900/90 via-purple-900/60 to-fuchsia-900/80 z-10 mix-blend-overlay" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#080312] via-[#080312]/40 to-transparent z-10" />
          <img 
            src={tracks.length > 0 && (tracks[0].coverImage || tracks[0].album?.coverImage || tracks[0].artist?.image) ? (tracks[0].coverImage || tracks[0].album?.coverImage || tracks[0].artist?.image) : "https://images.unsplash.com/photo-1493225457124-a1a2a5370217?auto=format&fit=crop&q=80&w=2564"} 
            alt="Featured" 
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute bottom-0 left-0 right-0 p-8 z-20">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase mb-4 inline-block">
                {tracks.length > 0 ? 'New Release' : 'Exclusive Release'}
              </span>
              <h2 className="text-4xl md:text-6xl font-black mb-2">{tracks.length > 0 ? tracks[0].title : 'Midnight Echoes'}</h2>
              <p className="text-slate-300 text-lg md:text-xl max-w-2xl mb-6">
                {tracks.length > 0 
                  ? `${tracks[0].artist?.name ? `Listen to the latest hit from ${tracks[0].artist.name}. ` : ''}Experience the new immersive audio journey.` 
                  : 'Experience the new immersive audio journey crafted for the night.'}
              </p>
              <div className="flex items-center gap-4">
                <button 
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white shadow-lg shadow-purple-500/25 px-8 py-3.5 rounded-full font-bold flex items-center gap-2 hover:scale-105 transition-all active:scale-95"
                  onClick={() => {
                    const audioEl = document.getElementById('nexoria-global-audio');
                    if (tracks.length > 0) {
                      if (audioEl) {
                        const track = tracks[0];
                        const baseUrl = BACKEND_URL.endsWith('/api') ? BACKEND_URL.slice(0, -4) : BACKEND_URL;
                        const newSrc = track.telegramFileId ? `${baseUrl}/api/nexoria-music/stream/${track.telegramFileId}` : track.audioUrl || "";
                        audioEl.src = newSrc;
                        audioEl.play().catch(e => console.log(e));
                      }
                      const remainingTracks = tracks.slice(1);
                      dispatch(setQueue(remainingTracks));
                      dispatch(playTrack(tracks[0]));
                    }
                  }}
                >
                  <Play className="w-5 h-5 fill-current" /> Play Now
                </button>
                <button className="bg-white/10 hover:bg-white/20 backdrop-blur-xl border border-white/10 p-3.5 rounded-full transition-all hover:scale-110 active:scale-95 text-white hover:text-pink-400">
                  <Heart className="w-6 h-6" />
                </button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* New Releases (Albums) */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-bold tracking-tight text-white hover:underline cursor-pointer">All Songs</h3>
            <Link to="/nexoria-music/search" className="text-sm font-bold text-slate-400 hover:text-white uppercase tracking-wider transition-colors">Show All</Link>
          </div>
          {loadingTracks ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="aspect-[3/4] bg-white/5 rounded-xl animate-pulse" />)}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
              {tracks.slice(0, 12).map(track => (
                <div key={track._id} className="bg-[#181818] hover:bg-[#282828] p-4 rounded-xl group cursor-pointer transition-all duration-300 flex flex-col"
                  onClick={() => {
                    if (currentTrack?._id === track._id) {
                      dispatch(togglePlayPause());
                    } else {
                      const audioEl = document.getElementById('nexoria-global-audio');
                      if (audioEl) {
                        const baseUrl = BACKEND_URL.endsWith('/api') ? BACKEND_URL.slice(0, -4) : BACKEND_URL;
                        const newSrc = track.telegramFileId ? `${baseUrl}/api/nexoria-music/stream/${track.telegramFileId}` : track.audioUrl || "";
                        audioEl.src = newSrc;
                        audioEl.play().catch(err => console.log(err));
                      }
                      dispatch(setQueue(tracks));
                      dispatch(playTrack(track));
                    }
                  }}
                >
                  <div className="relative aspect-square rounded-md overflow-hidden mb-4 shadow-[0_8px_24px_rgba(0,0,0,0.5)]">
                    {track.coverImage || track.album?.coverImage || track.artist?.image ? (
                      <img src={track.coverImage || track.album?.coverImage || track.artist?.image} alt={track.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-[#282828] flex items-center justify-center bg-gradient-to-br from-purple-500/20 to-blue-500/20">
                        <span className="text-slate-500 text-xs text-center px-2">No Image</span>
                      </div>
                    )}
                    
                    <div className="absolute bottom-2 right-2 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 z-10">
                      <button className="bg-purple-500 text-white p-3 rounded-full shadow-xl hover:scale-105 hover:bg-purple-400">
                        {currentTrack?._id === track._id && isPlaying ? (
                          <Pause className="w-6 h-6 fill-current" />
                        ) : (
                          <Play className="w-6 h-6 fill-current translate-x-0.5" />
                        )}
                      </button>
                    </div>
                  </div>
                  <h4 className="font-bold text-white truncate text-base mb-1">{track.title}</h4>
                  <p className="text-[#a7a7a7] text-sm truncate font-medium line-clamp-2">{track.artist?.name || 'Unknown'}</p>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Top Tracks */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold tracking-tight text-white hover:underline cursor-pointer">Trending Tracks</h3>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-1">
            {loadingTracks ? (
              [1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-16 bg-white/5 rounded-md animate-pulse" />)
            ) : (
              tracks.slice(0, 10).map((track, idx) => (
                <div 
                  key={track._id} 
                  className="flex items-center gap-4 px-4 py-2.5 rounded-md hover:bg-white/10 group transition-colors duration-200 cursor-pointer"
                  onClick={() => {
                    if (currentTrack?._id === track._id) {
                      dispatch(togglePlayPause());
                    } else {
                      const audioEl = document.getElementById('nexoria-global-audio');
                      if (audioEl) {
                        const baseUrl = BACKEND_URL.endsWith('/api') ? BACKEND_URL.slice(0, -4) : BACKEND_URL;
                        const newSrc = track.telegramFileId ? `${baseUrl}/api/nexoria-music/stream/${track.telegramFileId}` : track.audioUrl || "";
                        audioEl.src = newSrc;
                        audioEl.play().catch(err => console.log(err));
                      }
                      
                      const remainingTracks = tracks.slice(idx + 1);
                      dispatch(setQueue(remainingTracks));
                      dispatch(playTrack(track));
                    }
                  }}
                >
                  <span className="text-slate-500 font-medium w-4 text-right group-hover:hidden md:block hidden">{idx + 1}</span>
                  <div className={`w-4 items-center justify-center text-white ${currentTrack?._id === track._id ? 'flex text-purple-400' : 'hidden group-hover:flex md:hidden flex'}`}>
                    {currentTrack?._id === track._id && isPlaying ? (
                       <Pause className="w-4 h-4 fill-current" />
                    ) : (
                       <Play className="w-4 h-4 fill-current" />
                    )}
                  </div>
                  <div className="w-12 h-12 rounded bg-[#282828] flex-shrink-0 overflow-hidden shadow-md">
                    {track.coverImage || track.album?.coverImage || track.artist?.image ? (
                      <img src={track.coverImage || track.album?.coverImage || track.artist?.image} alt={track.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-purple-500/20 to-blue-500/20" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0 pr-4">
                    <h4 className={`font-medium truncate text-base ${currentTrack?._id === track._id ? 'text-purple-400' : 'text-white'}`}>
                      {track.title}
                    </h4>
                    <Link to={`/nexoria-music/search?q=${track.artist?.name || ''}`} className="text-[#a7a7a7] text-sm truncate hover:underline">{track.artist?.name || 'Unknown Artist'}</Link>
                  </div>
                  <div className="text-[#a7a7a7] text-sm font-medium mr-4 hidden sm:block w-12 text-right">
                    {Math.floor(track.duration / 60)}:{(track.duration % 60).toString().padStart(2, '0')}
                  </div>
                  <button 
                    className="w-10 h-10 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      dispatch(toggleLikeTrack(track._id));
                    }}
                  >
                    <Heart className={`w-4 h-4 ${likedTracks.includes(track._id) ? 'fill-pink-500 text-pink-500' : ''}`} />
                  </button>
                  <DropdownMenu
                    align="right"
                    width="w-48"
                    trigger={
                      <button 
                        className="w-10 h-10 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                      >
                        <MoreVertical className="w-4 h-4" />
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
                          e.stopPropagation(); 
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
              ))
            )}
          </div>
        </section>

        {/* Top Artists */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-bold tracking-tight text-white hover:underline cursor-pointer">Featured Artists</h3>
            <Link to="/nexoria-music/search" className="text-sm font-bold text-slate-400 hover:text-white uppercase tracking-wider transition-colors">Show All</Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {loadingArtists ? (
              [1, 2, 3, 4, 5, 6].map(i => <div key={i} className="aspect-[3/4] rounded-xl bg-white/5 animate-pulse" />)
            ) : (
              artists.slice(0, 12).map(artist => (
                <div 
                  key={artist._id} 
                  className="bg-[#181818] hover:bg-[#282828] p-4 rounded-xl group cursor-pointer transition-all duration-300 flex flex-col items-center"
                  onClick={() => navigate(`/nexoria-music/search?q=${encodeURIComponent(artist.name)}`)}
                >
                  <div className="w-full aspect-square rounded-full overflow-hidden relative shadow-[0_8px_24px_rgba(0,0,0,0.5)] mb-4">
                    {artist.image ? (
                      <img src={artist.image} alt={artist.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-[#282828] flex items-center justify-center text-3xl font-bold text-[#a7a7a7]">
                        {artist.name[0]}
                      </div>
                    )}
                    
                    {/* Spotify-like Green/Purple Play Button on Hover */}
                    <div className="absolute bottom-2 right-2 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 z-10">
                      <button 
                        className="bg-purple-500 text-white p-3 rounded-full shadow-xl hover:scale-105 hover:bg-purple-400"
                        onClick={(e) => {
                          e.stopPropagation();
                          const artistTracks = tracks.filter(t => t.artist?.name === artist.name);
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
                        <Play className="w-6 h-6 fill-current translate-x-0.5" />
                      </button>
                    </div>
                  </div>
                  <h4 className="font-bold text-white truncate text-center w-full mb-1">{artist.name}</h4>
                  <p className="text-[#a7a7a7] text-sm text-center font-medium">Artist</p>
                </div>
              ))
            )}
          </div>
        </section>

      </main>
    </div>
  );
};

export default NexoriaMusicHome;
