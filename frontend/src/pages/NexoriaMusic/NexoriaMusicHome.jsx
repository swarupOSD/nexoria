import React, { useState, useEffect } from 'react';
import { Play, Pause, Settings, Bell, Clock } from 'lucide-react';
import { 
  useGetNexoriaArtistsQuery, 
  useGetNexoriaTracksQuery, 
  useGetRecentlyPlayedQuery, 
  useGetRecommendationsQuery 
} from '../../features/api/nexoriaMusicApiSlice';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { playTrack, setQueue, togglePlayPause } from '../../features/music/nexoriaMusicSlice';
import { BACKEND_URL } from '../../features/api/apiSlice';
import toast from 'react-hot-toast';

const NexoriaMusicHome = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentTrack, isPlaying } = useSelector(state => state.nexoriaMusic);
  const { user } = useSelector(state => state.auth);
  
  const { data: artistsRes, isLoading: loadingArtists } = useGetNexoriaArtistsQuery();
  const { data: tracksRes, isLoading: loadingTracks } = useGetNexoriaTracksQuery();
  
  // Algorithm & History Hooks
  const { data: recentRes, isLoading: loadingRecent } = useGetRecentlyPlayedQuery(undefined, { skip: !user });
  const { data: recRes, isLoading: loadingRecs } = useGetRecommendationsQuery(undefined, { skip: !user });

  const artists = artistsRes?.data || [];
  const allTracks = tracksRes?.data || [];
  const recentTracks = recentRes?.data || [];
  const recommendedTracks = recRes?.data || [];

  // Fallbacks if user is not logged in or no history yet
  const topGridTracks = user && recentTracks.length > 0 ? recentTracks.slice(0, 6) : allTracks.slice(0, 6);
  const madeForYouTracks = user && recommendedTracks.length > 0 ? recommendedTracks : allTracks.slice(6, 16);

  const [greeting, setGreeting] = useState('');
  const [activeChip, setActiveChip] = useState('All');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 18) setGreeting('Good afternoon');
    else setGreeting('Good evening');
  }, []);

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
    <div className="min-h-full bg-[#121212] text-white relative pb-32">
        {/* Dynamic Background Gradient based on time of day (Spotify Mobile style) */}
        <div className="absolute top-0 left-0 right-0 h-[332px] bg-gradient-to-b from-[#1E3264] to-[#121212] pointer-events-none z-0 opacity-80" />
      
      <div className="relative z-10 px-4 pt-12 max-w-[1920px] mx-auto sm:pt-6">
        
        {/* Mobile Header: Profile, Title, Icons */}
        <div className="flex items-center justify-between mb-6 sm:hidden">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-500 overflow-hidden flex items-center justify-center font-bold text-white text-sm">
              {user?.profilePicture ? (
                <img src={user.profilePicture} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                user?.name?.[0]?.toUpperCase() || 'U'
              )}
            </div>
            <h1 className="text-2xl font-bold tracking-tight">{greeting}</h1>
          </div>
          <div className="flex items-center gap-5">
            <button onClick={() => toast.success('Notifications coming soon', { icon: '🔔' })} className="hover:scale-110 transition-transform">
              <Bell className="w-[22px] h-[22px] text-white" />
            </button>
            <button onClick={() => toast.success('Listening history coming soon', { icon: '🕒' })} className="hover:scale-110 transition-transform">
              <Clock className="w-[22px] h-[22px] text-white" />
            </button>
            <button onClick={() => toast.success('Settings coming soon', { icon: '⚙️' })} className="hover:scale-110 transition-transform">
              <Settings className="w-[22px] h-[22px] text-white" />
            </button>
          </div>
        </div>

        {/* Desktop Header Greeting */}
        <div className="hidden sm:block mb-6">
          <h1 className="text-[32px] font-bold tracking-tight">{greeting}</h1>
        </div>

        {/* Category Chips (All, Music, Podcasts) */}
        <div className="flex gap-2 mb-6 overflow-x-auto hide-scrollbar pb-1">
          {['All', 'Music', 'Podcasts'].map(chip => (
            <button
              key={chip}
              onClick={() => setActiveChip(chip)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                activeChip === chip 
                  ? 'bg-[#1ed760] text-black' 
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              {chip}
            </button>
          ))}
        </div>
        
        {/* 6-Grid (Recently Played) */}
        <section className="mb-8">
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
            {loadingTracks || loadingRecent ? (
              [1,2,3,4,5,6].map(i => <div key={i} className="h-14 bg-white/10 rounded-md animate-pulse" />)
            ) : (
              topGridTracks.map(track => (
                <div 
                  key={track._id}
                  className="bg-white/10 hover:bg-white/20 transition-colors duration-200 rounded-md flex items-center gap-3 group cursor-pointer overflow-hidden relative shadow-sm"
                  onClick={() => handlePlay(track, topGridTracks)}
                >
                  <div className="h-14 w-14 bg-zinc-800 shrink-0 shadow-md">
                    {(track.coverImage || track.album?.coverImage || track.artist?.image) && (
                      <img src={track.coverImage || track.album?.coverImage || track.artist?.image} alt={track.title} className="w-full h-full object-cover" />
                    )}
                  </div>
                  <span className="font-bold text-xs sm:text-sm line-clamp-2 pr-2 text-white">{track.title}</span>
                  
                  {/* Play Button Overlay (Spotify Desktop) */}
                  <div className="absolute right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 drop-shadow-xl hidden sm:block">
                    <button className="w-10 h-10 bg-[#1ed760] rounded-full flex items-center justify-center text-black hover:scale-105 active:scale-95 transition-transform shadow-lg">
                      {currentTrack?._id === track._id && isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-1" />}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Section: Made For You */}
        <section className="mb-10">
          <h2 className="text-xl sm:text-2xl font-bold mb-4 tracking-tight hover:underline cursor-pointer">Made For You</h2>
          
          <div className="flex overflow-x-auto custom-scrollbar gap-4 pb-6 -mx-4 px-4 sm:mx-0 sm:px-0 scroll-smooth snap-x snap-mandatory">
            {loadingTracks || loadingRecs ? (
              [1,2,3,4,5].map(i => <div key={i} className="w-[140px] sm:w-[180px] shrink-0 aspect-[3/4] bg-white/5 rounded-md animate-pulse" />)
            ) : (
              madeForYouTracks.map((track) => (
                <div 
                  key={track._id}
                  onClick={() => handlePlay(track, madeForYouTracks)}
                  className="w-[140px] sm:w-[180px] shrink-0 p-3 bg-[#181818] hover:bg-[#282828] rounded-md transition-colors duration-300 cursor-pointer group snap-start"
                >
                  <div className="w-full aspect-square bg-zinc-800 rounded-md mb-3 overflow-hidden shadow-[0_8px_24px_rgba(0,0,0,0.5)] relative">
                    {(track.coverImage || track.album?.coverImage || track.artist?.image) && (
                      <img src={track.coverImage || track.album?.coverImage || track.artist?.image} alt={track.title} className="w-full h-full object-cover" />
                    )}
                    <div className="absolute bottom-2 right-2 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 drop-shadow-xl z-10 hidden sm:block">
                      <button className="w-12 h-12 bg-[#1ed760] rounded-full flex items-center justify-center text-black hover:scale-105 active:scale-95 hover:bg-[#1fdf64] shadow-lg">
                        {currentTrack?._id === track._id && isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-1" />}
                      </button>
                    </div>
                  </div>
                  <h3 className="font-bold text-sm sm:text-base truncate mb-1 text-white">{track.title}</h3>
                  <p className="text-xs sm:text-sm text-[#a7a7a7] line-clamp-2 leading-tight font-medium">{track.artist?.name || 'Unknown Artist'}</p>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Section: Popular Artists */}
        <section className="mb-10">
          <h2 className="text-xl sm:text-2xl font-bold mb-4 tracking-tight hover:underline cursor-pointer">Popular Artists</h2>
          
          <div className="flex overflow-x-auto custom-scrollbar gap-4 pb-6 -mx-4 px-4 sm:mx-0 sm:px-0 scroll-smooth snap-x snap-mandatory">
            {loadingArtists ? (
              [1,2,3,4,5].map(i => <div key={i} className="w-[140px] sm:w-[180px] shrink-0 aspect-[3/4] bg-white/5 rounded-md animate-pulse" />)
            ) : (
              artists.map((artist) => (
                <div 
                  key={artist._id}
                  className="w-[140px] sm:w-[180px] shrink-0 p-3 bg-[#181818] hover:bg-[#282828] rounded-md transition-colors duration-300 cursor-pointer group snap-start flex flex-col items-center sm:items-start text-center sm:text-left"
                >
                  <div className="w-[116px] h-[116px] sm:w-full sm:h-auto sm:aspect-square bg-zinc-800 rounded-full mb-3 overflow-hidden shadow-[0_8px_24px_rgba(0,0,0,0.5)] relative">
                    {artist.image && (
                      <img src={artist.image} alt={artist.name} className="w-full h-full object-cover" />
                    )}
                    <div className="absolute bottom-2 right-2 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 drop-shadow-xl z-10 hidden sm:block">
                      <button className="w-12 h-12 bg-[#1ed760] rounded-full flex items-center justify-center text-black hover:scale-105 active:scale-95 hover:bg-[#1fdf64] shadow-lg">
                         <Play className="w-6 h-6 fill-current ml-1" />
                      </button>
                    </div>
                  </div>
                  <h3 className="font-bold text-sm sm:text-base w-full truncate mb-1 text-white">{artist.name}</h3>
                  <p className="text-xs sm:text-sm text-[#a7a7a7] w-full font-medium">Artist</p>
                </div>
              ))
            )}
          </div>
        </section>

      </div>
    </div>
  );
};

export default NexoriaMusicHome;
