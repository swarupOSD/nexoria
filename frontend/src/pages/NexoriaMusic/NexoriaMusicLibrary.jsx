import React, { useState } from 'react';
import { Play, Pause, Heart, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useGetNexoriaTracksQuery } from '../../features/api/nexoriaMusicApiSlice';
import { playTrack, setQueue, togglePlayPause, toggleLikeTrack } from '../../features/music/nexoriaMusicSlice';
import { BACKEND_URL } from '../../features/api/apiSlice';

const NexoriaMusicLibrary = () => {
  const dispatch = useDispatch();
  const { currentTrack, isPlaying, likedTracks } = useSelector(state => state.nexoriaMusic);
  const { data: tracksRes, isLoading } = useGetNexoriaTracksQuery();
  
  const allTracks = tracksRes?.data || [];
  const myLikedSongs = allTracks.filter(track => likedTracks.includes(track._id));

  const handlePlay = (track, trackList) => {
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
      dispatch(setQueue(trackList));
      dispatch(playTrack(track));
    }
  };

  return (
    <div className="min-h-full bg-[#121212] text-white">
      
      {/* Top Banner Area (Spotify Liked Songs gradient style) */}
      <div className="bg-gradient-to-b from-indigo-700/60 to-[#121212] px-4 sm:px-8 pt-20 pb-6 flex flex-col md:flex-row items-center md:items-end gap-6">
        <div className="w-40 h-40 sm:w-[232px] sm:h-[232px] bg-gradient-to-br from-indigo-600 to-indigo-300 shadow-2xl flex items-center justify-center shrink-0">
          <Heart className="w-16 h-16 sm:w-24 sm:h-24 text-white" fill="white" />
        </div>
        <div className="flex flex-col text-center md:text-left mt-2 md:mt-0">
          <span className="text-sm font-bold uppercase tracking-widest hidden md:block">Playlist</span>
          <h1 className="text-4xl sm:text-6xl md:text-[80px] font-black tracking-tighter mb-4 sm:mb-6 mt-2 leading-none">Liked Songs</h1>
          <div className="flex items-center justify-center md:justify-start gap-2 text-sm font-medium">
            <div className="w-6 h-6 rounded-full bg-green-500 text-black flex items-center justify-center font-bold text-xs">
              N
            </div>
            <span className="font-bold hover:underline cursor-pointer">Nexoria</span>
            <span className="text-white/70">• {myLikedSongs.length} songs</span>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-8 pb-8 max-w-[1920px] mx-auto bg-black/20">
        
        {/* Actions Bar */}
        <div className="py-6 flex items-center gap-6">
          <button 
            className="w-14 h-14 rounded-full bg-green-500 flex items-center justify-center text-black hover:scale-105 active:scale-95 transition-transform shadow-xl disabled:opacity-50 disabled:hover:scale-100"
            disabled={myLikedSongs.length === 0}
            onClick={() => handlePlay(myLikedSongs[0], myLikedSongs)}
          >
            <Play className="w-6 h-6 fill-current ml-1" />
          </button>
        </div>

        {/* List Header */}
        {myLikedSongs.length > 0 && (
          <div className="grid grid-cols-[16px_1fr_40px] md:grid-cols-[16px_4fr_3fr_40px] lg:grid-cols-[16px_4fr_3fr_minmax(120px,1fr)_40px] gap-4 px-4 py-2 border-b border-white/10 text-sm text-zinc-400 font-medium mb-4 sticky top-16 bg-[#121212]/95 backdrop-blur-md z-10 hidden sm:grid">
            <div className="text-right">#</div>
            <div>Title</div>
            <div className="hidden md:block">Album</div>
            <div className="hidden lg:block">Date added</div>
            <div className="flex justify-center"><Clock className="w-4 h-4" /></div>
          </div>
        )}

        {/* Content */}
        {isLoading ? (
          <div className="space-y-2 mt-4">
            {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-14 bg-white/5 rounded-md animate-pulse" />)}
          </div>
        ) : myLikedSongs.length === 0 ? (
          <div className="text-center py-24">
            <Heart className="w-16 h-16 mx-auto mb-6 text-zinc-600" />
            <h3 className="text-3xl font-bold text-white mb-4">Songs you like will appear here</h3>
            <p className="text-zinc-400 max-w-md mx-auto mb-8 font-medium">Save songs by tapping the heart icon. We'll keep them all right here for you.</p>
            <Link to="/nexoria-music" className="inline-block px-8 py-3.5 rounded-full bg-white text-black font-bold hover:scale-105 transition-transform">
              Find Songs
            </Link>
          </div>
        ) : (
          <div className="flex flex-col pb-8">
            {myLikedSongs.map((track, idx) => {
              const isCurrentPlaying = currentTrack?._id === track._id && isPlaying;
              return (
                <div 
                  key={track._id} 
                  className="grid grid-cols-[auto_1fr_auto] md:grid-cols-[16px_4fr_3fr_40px] lg:grid-cols-[16px_4fr_3fr_minmax(120px,1fr)_40px] gap-4 px-2 sm:px-4 py-2 sm:py-2.5 rounded-md hover:bg-white/10 group transition-colors cursor-pointer items-center text-sm text-zinc-400"
                  onClick={() => handlePlay(track, myLikedSongs)}
                >
                  <div className="w-6 text-right hidden sm:block relative">
                    <span className={`group-hover:hidden ${currentTrack?._id === track._id ? 'text-green-500' : ''}`}>
                      {currentTrack?._id === track._id ? (isPlaying ? 'ılı' : idx + 1) : idx + 1}
                    </span>
                    <button className="hidden group-hover:flex absolute inset-0 items-center justify-end text-white">
                      {isCurrentPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                    </button>
                  </div>
                  
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-zinc-800 rounded shrink-0 shadow-md">
                      {(track.coverImage || track.album?.coverImage || track.artist?.image) && (
                        <img src={track.coverImage || track.album?.coverImage || track.artist?.image} alt={track.title} className="w-full h-full object-cover rounded" />
                      )}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className={`text-base truncate font-medium ${currentTrack?._id === track._id ? 'text-green-500' : 'text-white'}`}>
                        {track.title}
                      </span>
                      <span className="truncate hover:underline hover:text-white cursor-pointer w-fit">
                        {track.artist?.name || 'Unknown Artist'}
                      </span>
                    </div>
                  </div>

                  <div className="hidden md:block truncate hover:underline hover:text-white cursor-pointer">
                    {track.album?.title || track.title}
                  </div>

                  <div className="hidden lg:block truncate">
                    Just now
                  </div>

                  <div className="flex items-center justify-end gap-3 sm:gap-4">
                    <button 
                      className={`transition-opacity ${likedTracks?.includes(track._id) ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        dispatch(toggleLikeTrack(track._id));
                      }}
                    >
                      <Heart className={`w-4 h-4 sm:w-5 sm:h-5 ${likedTracks?.includes(track._id) ? 'fill-green-500 text-green-500' : 'text-zinc-400 hover:text-white'}`} />
                    </button>
                    <span className="w-8 sm:w-10 text-right pr-2">3:24</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default NexoriaMusicLibrary;
