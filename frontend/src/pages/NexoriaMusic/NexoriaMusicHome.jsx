import React, { useState, useEffect } from 'react';
import { Play, Pause } from 'lucide-react';
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

  return <div className="min-h-full bg-[#121212] text-white relative">
        {/* Spotify Default Subtle Gradient */}
        <div className="absolute top-0 left-0 right-0 h-80 bg-gradient-to-b from-[#222222] via-[#121212]/80 to-[#121212] pointer-events-none z-0" />
      
      <div className="relative z-10 px-4 sm:px-6 pt-24 pb-8 max-w-[1920px] mx-auto">
        
        {/* Greeting & Top Grid */}
        <section className="mb-8">
          <h2 className="text-2xl sm:text-[32px] font-bold tracking-tight mb-4 sm:mb-6">{greeting}</h2>
          
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {loadingTracks || loadingRecent ? (
              [1,2,3,4,5,6].map(i => <div key={i} className="h-16 sm:h-20 bg-white/5 rounded-md animate-pulse" />)
            ) : (
              topGridTracks.map(track => (
                <div 
                  key={track._id}
                  className="bg-white/5 hover:bg-white/20 transition-colors duration-300 rounded-md flex items-center gap-4 group cursor-pointer overflow-hidden relative"
                  onClick={() => handlePlay(track, topGridTracks)}
                >
                  <div className="h-16 w-16 sm:h-20 sm:w-20 bg-zinc-800 shrink-0 shadow-md">
                    {(track.coverImage || track.album?.coverImage || track.artist?.image) && (
                      <img src={track.coverImage || track.album?.coverImage || track.artist?.image} alt={track.title} className="w-full h-full object-cover" />
                    )}
                  </div>
                  <span className="font-bold text-sm sm:text-base line-clamp-2 pr-12">{track.title}</span>
                  
                  {/* Play Button Overlay */}
                  <div className="absolute right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 drop-shadow-xl hidden sm:block">
                    <button className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-black hover:scale-105 active:scale-95 transition-transform">
                      {currentTrack?._id === track._id && isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-1" />}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Section: Made For You */}
        <section className="mb-10">
          <div className="flex items-end justify-between mb-4">
            <h2 className="text-2xl font-bold hover:underline cursor-pointer">Made For You</h2>
            <span className="text-sm font-bold text-zinc-400 hover:underline cursor-pointer uppercase tracking-widest hidden sm:block">Show all</span>
          </div>
          
          <div className="flex overflow-x-auto custom-scrollbar gap-6 pb-6 -mx-4 px-4 sm:mx-0 sm:px-0 scroll-smooth">
            {loadingTracks || loadingRecs ? (
              [1,2,3,4,5].map(i => <div key={i} className="w-[160px] sm:w-[200px] shrink-0 aspect-[3/4] bg-white/5 rounded-md animate-pulse" />)
            ) : (
              madeForYouTracks.map((track, i) => (
                <div 
                  key={track._id}
                  onClick={() => handlePlay(track, madeForYouTracks)}
                  className="w-[140px] sm:w-[180px] shrink-0 bg-[#181818] hover:bg-[#282828] p-4 rounded-md transition-colors duration-300 cursor-pointer group"
                >
                  <div className="w-full aspect-square bg-zinc-800 rounded-md mb-4 overflow-hidden shadow-lg relative">
                    {(track.coverImage || track.album?.coverImage || track.artist?.image) && (
                      <img src={track.coverImage || track.album?.coverImage || track.artist?.image} alt={track.title} className="w-full h-full object-cover" />
                    )}
                    <div className="absolute bottom-2 right-2 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 drop-shadow-xl z-10 hidden sm:block">
                      <button className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-black hover:scale-105 active:scale-95 hover:bg-green-400">
                        {currentTrack?._id === track._id && isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-1" />}
                      </button>
                    </div>
                  </div>
                  <h3 className="font-bold text-base truncate mb-1">{track.title}</h3>
                  <p className="text-sm text-zinc-400 line-clamp-2 leading-tight">{track.artist?.name || 'Unknown Artist'}</p>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Section: Popular Artists */}
        <section className="mb-10">
          <div className="flex items-end justify-between mb-4">
            <h2 className="text-2xl font-bold hover:underline cursor-pointer">Popular Artists</h2>
            <span className="text-sm font-bold text-zinc-400 hover:underline cursor-pointer uppercase tracking-widest hidden sm:block">Show all</span>
          </div>
          
          <div className="flex overflow-x-auto custom-scrollbar gap-6 pb-6 -mx-4 px-4 sm:mx-0 sm:px-0 scroll-smooth">
            {loadingArtists ? (
              [1,2,3,4,5].map(i => <div key={i} className="w-[160px] sm:w-[200px] shrink-0 aspect-[3/4] bg-white/5 rounded-md animate-pulse" />)
            ) : (
              artists.map((artist) => (
                <div 
                  key={artist._id}
                  className="w-[140px] sm:w-[180px] shrink-0 bg-[#181818] hover:bg-[#282828] p-4 rounded-md transition-colors duration-300 cursor-pointer group"
                >
                  <div className="w-full aspect-square bg-zinc-800 rounded-full mb-4 overflow-hidden shadow-md relative">
                    {artist.image && (
                      <img src={artist.image} alt={artist.name} className="w-full h-full object-cover" />
                    )}
                    <div className="absolute bottom-2 right-2 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 drop-shadow-xl z-10 hidden sm:block">
                      <button className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-black hover:scale-105 active:scale-95 hover:bg-green-400">
                         <Play className="w-6 h-6 fill-current ml-1" />
                      </button>
                    </div>
                  </div>
                  <h3 className="font-bold text-base truncate mb-1">{artist.name}</h3>
                  <p className="text-sm text-zinc-400">Artist</p>
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
