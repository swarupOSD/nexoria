import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGetUserProfileQuery } from '../../features/api/nexoriaMusicApiSlice';
import { useSelector, useDispatch } from 'react-redux';
import { playTrack, setQueue, togglePlayPause } from '../../features/music/nexoriaMusicSlice';
import { BACKEND_URL } from '../../features/api/apiSlice';
import { Play, Pause, User, Music, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

const NexoriaMusicUserProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { data: profileRes, isLoading, error } = useGetUserProfileQuery(id);
  const { currentTrack, isPlaying } = useSelector(state => state.nexoriaMusic);
  
  const profileData = profileRes?.data;
  const user = profileData?.user;
  const playlists = profileData?.playlists || [];
  const recentlyPlayed = profileData?.recentlyPlayed || [];

  const handlePlayTrack = (track, trackList) => {
    if (currentTrack?._id === track._id) {
      dispatch(togglePlayPause());
    } else {
      // NexoriaPlayer will automatically detect currentTrack change and play it.
      dispatch(setQueue(trackList));
      dispatch(playTrack(track));
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-full bg-[#0F0F23] flex items-center justify-center text-white">
        <div className="animate-pulse flex flex-col items-center">
           <div className="w-48 h-48 bg-[#4338CA] rounded-full mb-4"></div>
           <div className="w-32 h-6 bg-[#4338CA] rounded mb-2"></div>
           <div className="w-24 h-4 bg-[#4338CA] rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-full bg-[#0F0F23] flex items-center justify-center text-white">
        <p className="text-xl">User not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-[#0F0F23] text-white relative pb-32">
      {/* Background Gradient */}
      <div className="absolute top-0 left-0 right-0 h-[400px] bg-gradient-to-b from-[#535353] to-[#0F0F23] pointer-events-none z-0 opacity-80" />
      
      <div className="relative z-10 px-4 sm:px-8 pt-16 sm:pt-24 max-w-[1920px] mx-auto">
        
        {/* Profile Header */}
        <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 mb-12">
          <div className="w-[192px] h-[192px] sm:w-[232px] sm:h-[232px] rounded-full shadow-[0_4px_60px_rgba(0,0,0,0.5)] overflow-hidden bg-[#4338CA] flex items-center justify-center shrink-0">
            {user.avatar ? (
               <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
            ) : (
               <User className="w-24 h-24 text-zinc-500" />
            )}
          </div>
          <div className="flex flex-col items-center sm:items-start text-center sm:text-left mt-4 sm:mt-0">
            <span className="text-sm font-bold uppercase tracking-wider mb-2">Profile</span>
            <h1 className="text-[40px] sm:text-[72px] lg:text-[96px] font-black tracking-tighter leading-none mb-6">
              {user.name}
            </h1>
            <div className="flex items-center gap-2 text-sm text-white/70 font-medium">
              <span>{playlists.length} Public Playlists</span>
              <span>•</span>
              <span>{recentlyPlayed.length} Recently Played</span>
            </div>
          </div>
        </div>

        {/* Content area with dark background */}
        <div className="bg-[#0F0F23]/20 rounded-xl p-4 sm:p-6 backdrop-blur-md">
           
           {/* Public Playlists Section */}
           {playlists.length > 0 && (
             <section className="mb-12">
               <h2 className="text-2xl font-bold mb-6 tracking-tight">Public Playlists</h2>
               <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
                 {playlists.map(playlist => (
                    <div 
                      key={playlist._id}
                      onClick={() => navigate(`/nexoria-music/playlist/${playlist._id}`)}
                      className="p-4 bg-[#1E1B4B] hover:bg-[#1E1B4B] rounded-md transition-colors duration-300 cursor-pointer group flex flex-col"
                    >
                      <div className="w-full aspect-square bg-[#4338CA] rounded-md mb-4 overflow-hidden shadow-[0_8px_24px_rgba(0,0,0,0.5)] relative">
                        {playlist.coverImage ? (
                          <img src={playlist.coverImage} alt={playlist.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-[#4338CA]">
                             <Music className="w-12 h-12 text-zinc-500" />
                          </div>
                        )}
                        <div className="absolute bottom-2 right-2 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 drop-shadow-xl z-10 hidden sm:block">
                          <button className="w-12 h-12 bg-[#22C55E] rounded-full flex items-center justify-center text-black hover:scale-105 active:scale-95 hover:bg-[#22C55E] shadow-lg"
                             onClick={(e) => {
                               e.stopPropagation();
                               navigate(`/nexoria-music/playlist/${playlist._id}`);
                             }}
                          >
                             <Play className="w-6 h-6 fill-current ml-1" />
                          </button>
                        </div>
                      </div>
                      <h3 className="font-bold text-base truncate mb-1 text-white">{playlist.title}</h3>
                      <p className="text-sm text-[#94A3B8] line-clamp-2 font-medium">By {playlist.creator?.name || 'User'}</p>
                    </div>
                 ))}
               </div>
             </section>
           )}

           {/* Recently Played Section */}
           {recentlyPlayed.length > 0 && (
             <section>
               <h2 className="text-2xl font-bold mb-6 tracking-tight">Top Tracks This Month</h2>
               <div className="flex flex-col">
                 <div className="grid grid-cols-[16px_minmax(120px,1fr)_1fr_minmax(120px,1fr)] sm:grid-cols-[16px_minmax(120px,2fr)_minmax(120px,1.5fr)_minmax(120px,1fr)] gap-4 px-4 py-2 text-[#94A3B8] text-sm border-b border-white/10 mb-2">
                   <div className="text-center font-medium">#</div>
                   <div className="font-medium">Title</div>
                   <div className="font-medium hidden sm:block">Album</div>
                   <div className="flex items-center justify-end"><Clock className="w-4 h-4" /></div>
                 </div>
                 
                 {recentlyPlayed.map((track, index) => {
                   const isPlayingCurrent = currentTrack?._id === track._id && isPlaying;
                   return (
                     <div 
                       key={track._id}
                       onClick={() => handlePlayTrack(track, recentlyPlayed)}
                       className="grid grid-cols-[16px_minmax(120px,1fr)_1fr_minmax(120px,1fr)] sm:grid-cols-[16px_minmax(120px,2fr)_minmax(120px,1.5fr)_minmax(120px,1fr)] gap-4 px-4 py-2 hover:bg-white/10 rounded-md group items-center transition-colors cursor-pointer"
                     >
                       <div className="text-center text-[#94A3B8] text-base font-medium group-hover:hidden">
                         {isPlayingCurrent ? <img src="https://open.spotifycdn.com/cdn/images/equaliser-animated-green.f93a2ef4.gif" alt="playing" className="w-3.5 h-3.5" /> : index + 1}
                       </div>
                       <div className="text-center hidden group-hover:flex items-center justify-center">
                         {isPlayingCurrent ? <Pause className="w-4 h-4 text-white fill-current" /> : <Play className="w-4 h-4 text-white fill-current ml-0.5" />}
                       </div>
                       
                       <div className="flex items-center gap-3 overflow-hidden">
                         <div className="w-10 h-10 bg-[#4338CA] shrink-0">
                           {(track.coverImage || track.album?.coverImage || track.artist?.image) && (
                             <img src={track.coverImage || track.album?.coverImage || track.artist?.image} alt={track.title} className="w-full h-full object-cover" />
                           )}
                         </div>
                         <div className="flex flex-col justify-center overflow-hidden">
                           <span className={`text-base font-normal truncate ${isPlayingCurrent ? 'text-[#22C55E]' : 'text-white'}`}>{track.title}</span>
                           <span className="text-sm text-[#94A3B8] truncate hover:underline cursor-pointer" onClick={(e) => { e.stopPropagation(); navigate(`/nexoria-music/artist/${track.artist?._id}`); }}>
                             {track.artist?.name || 'Unknown Artist'}
                           </span>
                         </div>
                       </div>

                       <div className="text-sm text-[#94A3B8] font-normal truncate hidden sm:block hover:underline cursor-pointer" onClick={(e) => { e.stopPropagation(); if (track.album) navigate(`/nexoria-music/album/${track.album._id}`); }}>
                         {track.album?.title || ''}
                       </div>

                       <div className="flex items-center justify-end text-[#94A3B8] text-sm tabular-nums">
                         {track.duration ? `${Math.floor(track.duration / 60)}:${(track.duration % 60).toString().padStart(2, '0')}` : '3:00'}
                       </div>
                     </div>
                   );
                 })}
               </div>
             </section>
           )}
        </div>
      </div>
    </div>
  );
};

export default NexoriaMusicUserProfile;
