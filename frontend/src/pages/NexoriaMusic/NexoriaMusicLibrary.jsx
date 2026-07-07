import React from 'react';
import { Compass, Search as SearchIcon, Library, Play, Heart, Clock, MoreVertical, Pause, Download, ListPlus, Link2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useGetNexoriaTracksQuery } from '../../features/api/nexoriaMusicApiSlice';
import { playTrack, setQueue, togglePlayPause, toggleLikeTrack, addToQueue } from '../../features/music/nexoriaMusicSlice';
import DropdownMenu from '../../components/DropdownMenu';
import toast from 'react-hot-toast';

const NexoriaMusicLibrary = () => {
  const dispatch = useDispatch();
  const { currentTrack, isPlaying, likedTracks } = useSelector(state => state.nexoriaMusic);
  const { data: tracksRes, isLoading } = useGetNexoriaTracksQuery();
  
  const allTracks = tracksRes?.data || [];
  const myLikedSongs = allTracks.filter(track => likedTracks.includes(track._id));

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
          <Link to="/nexoria-music/search" className="hover:text-white transition-colors flex items-center gap-2">
            <SearchIcon className="w-5 h-5" /> <span className="hidden md:inline">Search</span>
          </Link>
          <Link to="/nexoria-music/library" className="text-white hover:text-white transition-colors flex items-center gap-2">
            <Library className="w-5 h-5" /> <span className="hidden md:inline">Library</span>
          </Link>
        </div>
      </header>

      <main className="px-4 lg:px-8 py-8 max-w-[1400px] mx-auto">
        <div className="flex items-end justify-between mb-12 border-b border-white/5 pb-8">
          <div>
            <h2 className="text-5xl font-black text-white mb-2">Your Library</h2>
            <p className="text-slate-400 text-lg">All your favorite tracks and playlists in one place.</p>
          </div>
          <div className="flex gap-4">
            <button 
              className="px-6 py-2 rounded-full bg-white text-black font-bold hover:scale-105 transition-transform flex items-center gap-2 disabled:opacity-50"
              disabled={myLikedSongs.length === 0}
              onClick={() => {
                if (myLikedSongs.length > 0) {
                  const audioEl = document.getElementById('nexoria-global-audio');
                  if (audioEl) {
                    const baseUrl = 'http://localhost:5000';
                    const newSrc = myLikedSongs[0].telegramFileId ? `${baseUrl}/api/nexoria-music/stream/${myLikedSongs[0].telegramFileId}` : myLikedSongs[0].audioUrl || "";
                    audioEl.src = newSrc;
                    audioEl.play().catch(e => console.log(e));
                  }
                  dispatch(setQueue(myLikedSongs.slice(1)));
                  dispatch(playTrack(myLikedSongs[0]));
                }
              }}
            >
              <Play className="w-4 h-4 fill-current" /> Play Liked Songs
            </button>
          </div>
        </div>

        {/* Content Tabs */}
        <div className="flex gap-8 border-b border-white/10 mb-8 overflow-x-auto hide-scrollbar">
          <button className="text-purple-400 border-b-2 border-purple-400 pb-4 font-bold whitespace-nowrap">Liked Songs</button>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => <div key={i} className="h-16 bg-white/5 rounded-xl animate-pulse" />)}
          </div>
        ) : myLikedSongs.length === 0 ? (
          <div className="text-center py-20 bg-white/5 rounded-3xl border border-white/5">
            <Heart className="w-16 h-16 mx-auto mb-4 text-slate-600" />
            <h3 className="text-2xl font-bold text-white mb-2">Songs you like will appear here</h3>
            <p className="text-slate-400 max-w-md mx-auto mb-6">Save songs by tapping the heart icon. We'll keep them all right here for you.</p>
            <Link to="/nexoria-music" className="inline-block px-8 py-3 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold transition-colors">
              Find Songs
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-2">
            {myLikedSongs.map((track, idx) => (
              <div 
                key={track._id} 
                className="flex items-center gap-4 p-2.5 rounded-2xl hover:bg-white/[0.03] border border-transparent hover:border-white/5 group transition-all duration-300 cursor-pointer"
                onClick={() => {
                  if (currentTrack?._id === track._id) {
                    dispatch(togglePlayPause());
                  } else {
                    const audioEl = document.getElementById('nexoria-global-audio');
                    if (audioEl) {
                      const baseUrl = 'http://localhost:5000';
                      const newSrc = track.telegramFileId ? `${baseUrl}/api/nexoria-music/stream/${track.telegramFileId}` : track.audioUrl || "";
                      audioEl.src = newSrc;
                      audioEl.play().catch(err => console.log(err));
                    }
                    const remainingTracks = myLikedSongs.slice(idx + 1);
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
                <div className="w-12 h-12 rounded-lg bg-slate-800 flex-shrink-0 overflow-hidden shadow-md">
                  {track.coverImage || track.album?.coverImage || track.artist?.image ? (
                    <img src={track.coverImage || track.album?.coverImage || track.artist?.image} alt={track.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-purple-500/20 to-blue-500/20" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className={`font-bold truncate text-base ${currentTrack?._id === track._id ? 'text-purple-400' : 'text-white'}`}>
                    {track.title}
                  </h4>
                  <p className="text-slate-400 text-sm truncate">{track.artist?.name || 'Unknown Artist'}</p>
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
                      onClick={(e) => e.stopPropagation()}
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
                        const baseUrl = 'http://localhost:5000';
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
            ))}
          </div>
        )}

      </main>
    </div>
  );
};

export default NexoriaMusicLibrary;
