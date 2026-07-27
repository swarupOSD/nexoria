import React, { useState, useEffect } from 'react';
import { Play, Pause, Settings, Bell, Clock, MoreHorizontal, ArrowLeft, Music } from 'lucide-react';
import { 
  useGetNexoriaArtistsQuery, 
  useGetNexoriaTracksQuery, 
  useGetMusicRecentlyPlayedQuery, 
  useGetMusicRecommendationsQuery,
  useGetDiscoverWeeklyQuery,
  useGetReleaseRadarQuery,
  useGetDailyMixQuery,
  useGetPublicPlaylistsQuery
} from '../../features/api/nexoriaMusicApiSlice';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { playTrack, setQueue, togglePlayPause } from '../../features/music/nexoriaMusicSlice';
import { BACKEND_URL } from '../../features/api/apiSlice';
import toast from 'react-hot-toast';
import NexoriaMusicAddToPlaylistModal from '../../components/NexoriaMusicAddToPlaylistModal';
import NexoriaMusicContextMenu from '../../components/NexoriaMusicContextMenu';

const NexoriaMusicHome = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentTrack, isPlaying } = useSelector(state => state.nexoriaMusic);
  const { user } = useSelector(state => state.auth);
  
  const { data: artistsRes, isLoading: loadingArtists } = useGetNexoriaArtistsQuery();
  const { data: tracksRes, isLoading: loadingTracks } = useGetNexoriaTracksQuery();
  
  // Algorithm & History Hooks
  const { data: recentRes, isLoading: loadingRecent } = useGetMusicRecentlyPlayedQuery(undefined, { skip: !user });
  const { data: recRes, isLoading: loadingRecs } = useGetMusicRecommendationsQuery(undefined, { skip: !user });
  
  const { data: discoverData, isLoading: loadingDiscover } = useGetDiscoverWeeklyQuery(undefined, { skip: !user });
  const { data: radarData, isLoading: loadingRadar } = useGetReleaseRadarQuery(undefined, { skip: !user });
  const { data: mixData, isLoading: loadingMix } = useGetDailyMixQuery(undefined, { skip: !user });
  const { data: publicPlaylistsRes, isLoading: loadingPublicPlaylists } = useGetPublicPlaylistsQuery();

  const artists = artistsRes?.data || [];
  const allTracks = tracksRes?.data || [];
  const recentTracks = recentRes?.data || [];
  const recommendedTracks = recRes?.data || [];

  // Fallbacks if user is not logged in or no history yet
  const topGridTracksUnfiltered = user && recentTracks.length > 0 ? recentTracks : allTracks;
  const madeForYouTracksUnfiltered = user && recommendedTracks.length > 0 ? recommendedTracks : allTracks;

  const [greeting, setGreeting] = useState('');
  const [activeChip, setActiveChip] = useState('All');

  // Filter based on chip
  const filterByChip = (tracks) => {
    if (activeChip === 'Music') return tracks.filter(t => t.trackType === 'song' || !t.trackType);
    if (activeChip === 'Podcasts') return tracks.filter(t => t.trackType === 'podcast');
    return tracks;
  };

  const topGridTracks = filterByChip(topGridTracksUnfiltered).slice(0, 6);
  const madeForYouTracks = filterByChip(madeForYouTracksUnfiltered).slice(0, 10);
  
  const algorithmicPlaylists = [];
  
  if (discoverData?.success && discoverData.data?.length > 0) {
    algorithmicPlaylists.push({
      _id: 'discover-weekly',
      name: discoverData.name || 'Discover Weekly',
      description: discoverData.description || 'New music based on your taste.',
      tracks: discoverData.data,
      coverImage: discoverData.data[0]?.album?.coverImage || discoverData.data[0]?.coverImage || '',
      isAlgorithmic: true
    });
  }

  if (radarData?.success && radarData.data?.length > 0) {
    algorithmicPlaylists.push({
      _id: 'release-radar',
      name: radarData.name || 'Release Radar',
      description: radarData.description || 'Catch up on the latest releases.',
      tracks: radarData.data,
      coverImage: radarData.data[0]?.album?.coverImage || radarData.data[0]?.coverImage || '',
      isAlgorithmic: true
    });
  }

  if (mixData?.success && mixData.data?.length > 0) {
    mixData.data.forEach(mix => {
      algorithmicPlaylists.push({
        _id: mix.id,
        name: mix.name,
        description: mix.description,
        tracks: mix.tracks,
        coverImage: mix.tracks[0]?.album?.coverImage || mix.tracks[0]?.coverImage || '',
        isAlgorithmic: true
      });
    });
  }
  
  const [playlistModalOpen, setPlaylistModalOpen] = useState(false);
  const [selectedTrackId, setSelectedTrackId] = useState(null);
  
  const [contextMenu, setContextMenu] = useState({ isOpen: false, x: 0, y: 0, track: null });

  const handleOpenPlaylistModal = (e, trackId) => {
    e.stopPropagation();
    setSelectedTrackId(trackId);
    setPlaylistModalOpen(true);
  };

  const handleContextMenu = (e, track) => {
    e.preventDefault();
    setContextMenu({
      isOpen: true,
      x: e.clientX,
      y: e.clientY,
      track
    });
  };

  useEffect(() => {
    const hour = new Date().getHours();
    let timeGreeting;
    if (hour < 12) timeGreeting = 'Good morning';
    else if (hour < 18) timeGreeting = 'Good afternoon';
    else timeGreeting = 'Good evening';
    
    setGreeting(timeGreeting);
  }, []);

  const firstName = user?.name ? user.name.split(' ')[0] : '';
  const greetingText = firstName ? `${greeting}, ${firstName}` : greeting;

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
    <div className="min-h-full bg-[#0F0F23] text-white relative pb-32">
        {/* Dynamic Background Gradient based on time of day (Spotify Mobile style) */}
        <div className="absolute top-0 left-0 right-0 h-[332px] bg-gradient-to-b from-[#1E1B4B] to-[#0F0F23] pointer-events-none z-0 opacity-80" />
      
      {/* 📱 MOBILE EXCLUSIVE: STICKY HEADER */}
      <div className="sm:hidden sticky top-0 z-50 bg-[#0F0F23]/90 backdrop-blur-3xl border-b border-white/5 pt-4 pb-3 px-4 shadow-2xl flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/')} 
            className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-all active:scale-95 border border-white/5"
            title="Back to Dashboard"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400 tracking-tight leading-tight">Nexoria Music</h1>
            <p className="text-[9px] font-bold uppercase tracking-widest text-emerald-500/80">Premium Audio</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/nexoria-music/queue')} className="active:scale-90 transition-transform" title="Queue / History">
            <Clock className="w-5 h-5 text-white/80" />
          </button>
          <button onClick={() => navigate('/nexoria-music/search')} className="active:scale-90 transition-transform" title="Search">
            <Settings className="w-5 h-5 text-white/80" />
          </button>
        </div>
      </div>

      <div className="relative z-10 px-3 sm:px-4 pt-2 max-w-[1920px] mx-auto sm:pt-20">
        
        {/* 💻 DESKTOP EXCLUSIVE: Header Greeting */}
        <div className="hidden sm:flex items-center gap-4 mb-6">
          <button 
            onClick={() => navigate('/')}
            className="w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center transition-colors backdrop-blur-md"
            title="Back to Dashboard"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-[32px] font-bold tracking-tight">{greetingText}</h1>
        </div>

        {/* 📱 MOBILE EXCLUSIVE: Greeting */}
        <div className="sm:hidden flex items-center gap-3 mb-4 mt-2">
          <div className="w-10 h-10 rounded-full bg-[#1E1B4B] border border-white/10 overflow-hidden flex items-center justify-center font-bold text-white text-base">
            {user?.profilePicture ? (
              <img src={user.profilePicture} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              user?.name?.[0]?.toUpperCase() || 'U'
            )}
          </div>
          <h1 className="text-xl font-bold tracking-tight">{greetingText}</h1>
        </div>

        {/* Category Chips (All, Music, Podcasts) */}
        <div className="flex gap-2 mb-4 sm:mb-6 overflow-x-auto hide-scrollbar pb-1">
          {['All', 'Music', 'Podcasts'].map(chip => (
            <button
              key={chip}
              onClick={() => setActiveChip(chip)}
              className={`px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap transition-colors active:scale-95 ${
                activeChip === chip 
                  ? 'bg-[#22C55E] text-black' 
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              {chip}
            </button>
          ))}
        </div>
        
        {/* 6-Grid (Recently Played) */}
        <section className="mb-6 sm:mb-8">
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
            {loadingTracks || loadingRecent ? (
              [1,2,3,4,5,6].map(i => <div key={i} className="h-12 sm:h-14 bg-white/10 rounded-md sm:rounded-lg animate-pulse" />)
            ) : (
              topGridTracks.map(track => (
                <div 
                  key={track._id}
                  className="bg-white/10 hover:bg-white/20 transition-all duration-200 rounded-md sm:rounded-lg flex items-center gap-2 sm:gap-3 group cursor-pointer overflow-hidden relative shadow-sm active:scale-[0.98] sm:active:scale-100"
                  onClick={() => handlePlay(track, topGridTracks)}
                  onContextMenu={(e) => handleContextMenu(e, track)}
                >
                  <div className="h-12 w-12 sm:h-14 sm:w-14 bg-[#4338CA] shrink-0 shadow-md">
                    {(track.coverImage || track.album?.coverImage || track.artist?.image) && (
                      <img src={track.coverImage || track.album?.coverImage || track.artist?.image} alt={track.title} className="w-full h-full object-cover" />
                    )}
                  </div>
                  <span className="font-bold text-[11px] sm:text-sm line-clamp-2 pr-2 text-white leading-tight">{track.title}</span>
                  
                  {/* Play Button Overlay (Spotify Desktop) */}
                  <div className="absolute right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 drop-shadow-xl hidden sm:flex items-center gap-2">
                    <button 
                      onClick={(e) => handleOpenPlaylistModal(e, track._id)}
                      className="w-10 h-10 bg-[#0F0F23]/50 hover:bg-[#0F0F23]/80 rounded-full flex items-center justify-center text-white transition-colors"
                      title="Add to Playlist"
                    >
                      <MoreHorizontal className="w-5 h-5" />
                    </button>
                    <button className="w-10 h-10 bg-[#22C55E] rounded-full flex items-center justify-center text-black hover:scale-105 active:scale-95 transition-transform shadow-lg">
                      {currentTrack?._id === track._id && isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-1" />}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Section: Made For You */}
        <section className="mb-8 sm:mb-10">
          <h2 className="text-lg sm:text-2xl font-bold mb-3 sm:mb-4 tracking-tight hover:underline cursor-pointer">Made For You</h2>
          
          <div className="flex overflow-x-auto custom-scrollbar gap-3 sm:gap-4 pb-4 sm:pb-6 -mx-3 px-3 sm:mx-0 sm:px-0 scroll-smooth snap-x snap-mandatory">
            {loadingDiscover || loadingRadar || loadingMix ? (
              [1,2,3,4,5].map(i => <div key={i} className="w-[120px] sm:w-[180px] shrink-0 aspect-[3/4] bg-white/5 rounded-md animate-pulse" />)
            ) : algorithmicPlaylists.length > 0 ? (
              algorithmicPlaylists.map((playlist) => (
                <div 
                  key={playlist._id}
                  onClick={() => navigate(`/nexoria-music/playlist/${playlist._id}`, { state: { algorithmicPlaylist: playlist } })}
                  className="w-[120px] sm:w-[180px] shrink-0 p-2 sm:p-3 bg-white/5 hover:bg-white/10 rounded-lg sm:rounded-xl transition-colors duration-300 cursor-pointer group snap-start active:scale-[0.98] sm:active:scale-100"
                >
                  <div className="w-full aspect-square bg-[#4338CA] rounded-md sm:rounded-lg mb-2 sm:mb-3 overflow-hidden shadow-lg relative">
                    {playlist.coverImage && (
                      <img src={playlist.coverImage} alt={playlist.name} className="w-full h-full object-cover" />
                    )}
                    <div className="absolute bottom-2 right-2 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 drop-shadow-xl z-10 hidden sm:flex items-center gap-2">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePlay(playlist.tracks[0], playlist.tracks);
                        }}
                        className="w-12 h-12 bg-[#22C55E] rounded-full flex items-center justify-center text-black hover:scale-105 active:scale-95 hover:bg-[#22C55E] shadow-lg"
                        title="Play Mix"
                      >
                        <Play className="w-6 h-6 fill-current ml-1" />
                      </button>
                    </div>
                  </div>
                  <h3 className="font-bold text-xs sm:text-base truncate text-white mb-0.5 sm:mb-1">{playlist.name}</h3>
                  <p className="text-[10px] sm:text-xs text-white/60 sm:text-white/70 line-clamp-2 leading-tight">{playlist.description}</p>
                </div>
              ))
            ) : (
              madeForYouTracks.map((track) => (
                <div 
                  key={track._id}
                  onClick={() => handlePlay(track, madeForYouTracks)}
                  onContextMenu={(e) => handleContextMenu(e, track)}
                  className="w-[120px] sm:w-[180px] shrink-0 p-2 sm:p-3 bg-[#1E1B4B] hover:bg-[#1E1B4B] rounded-lg sm:rounded-xl transition-colors duration-300 cursor-pointer group snap-start active:scale-[0.98] sm:active:scale-100"
                >
                  <div className="w-full aspect-square bg-[#4338CA] rounded-md sm:rounded-lg mb-2 sm:mb-3 overflow-hidden shadow-lg relative">
                    {(track.coverImage || track.album?.coverImage || track.artist?.image) && (
                      <img src={track.coverImage || track.album?.coverImage || track.artist?.image} alt={track.title} className="w-full h-full object-cover" />
                    )}
                    <div className="absolute bottom-2 right-2 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 drop-shadow-xl z-10 hidden sm:flex items-center gap-2">
                      <button 
                        onClick={(e) => handleOpenPlaylistModal(e, track._id)}
                        className="w-10 h-10 bg-[#0F0F23]/50 hover:bg-[#0F0F23]/80 rounded-full flex items-center justify-center text-white transition-colors"
                        title="Add to Playlist"
                      >
                        <MoreHorizontal className="w-5 h-5" />
                      </button>
                      <button className="w-12 h-12 bg-[#22C55E] rounded-full flex items-center justify-center text-black hover:scale-105 active:scale-95 hover:bg-[#22C55E] shadow-lg">
                        {currentTrack?._id === track._id && isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-1" />}
                      </button>
                    </div>
                  </div>
                  <h3 className="font-bold text-xs sm:text-base truncate text-white mb-0.5 sm:mb-1">{track.title}</h3>
                  <p className="text-[10px] sm:text-sm text-white/60 sm:text-white/70 line-clamp-1">{track.artist?.name || 'Unknown Artist'}</p>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Section: Featured Playlists (Admin) */}
        {(!loadingPublicPlaylists && publicPlaylistsRes?.data?.length > 0) && (
          <section className="mb-8 sm:mb-10">
            <h2 className="text-lg sm:text-2xl font-bold mb-3 sm:mb-4 tracking-tight hover:underline cursor-pointer">Featured Playlists</h2>
            
            <div className="flex overflow-x-auto custom-scrollbar gap-3 sm:gap-4 pb-4 sm:pb-6 -mx-3 px-3 sm:mx-0 sm:px-0 scroll-smooth snap-x snap-mandatory">
              {publicPlaylistsRes.data.map((playlist) => (
                <div 
                  key={playlist._id}
                  onClick={() => navigate(`/nexoria-music/playlist/${playlist._id}`)}
                  className="w-[120px] sm:w-[180px] shrink-0 p-2 sm:p-3 bg-white/5 hover:bg-white/10 rounded-lg sm:rounded-xl transition-colors duration-300 cursor-pointer group snap-start active:scale-[0.98] sm:active:scale-100"
                >
                  <div className="w-full aspect-square bg-[#4338CA] rounded-md sm:rounded-lg mb-2 sm:mb-3 overflow-hidden shadow-lg relative">
                    {playlist.coverImage && (
                      <img src={playlist.coverImage} alt={playlist.title} className="w-full h-full object-cover" />
                    )}
                    <div className="absolute bottom-2 right-2 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 drop-shadow-xl z-10 hidden sm:flex items-center gap-2">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          if (playlist.tracks && playlist.tracks.length > 0) {
                             handlePlay(playlist.tracks[0], playlist.tracks);
                          } else {
                             navigate(`/nexoria-music/playlist/${playlist._id}`);
                          }
                        }}
                        className="w-12 h-12 bg-[#22C55E] rounded-full flex items-center justify-center text-black hover:scale-105 active:scale-95 hover:bg-[#22C55E] shadow-lg"
                        title="Play Playlist"
                      >
                        <Play className="w-6 h-6 fill-current ml-1" />
                      </button>
                    </div>
                  </div>
                  <h3 className="font-bold text-xs sm:text-base truncate text-white mb-0.5 sm:mb-1">{playlist.title}</h3>
                  <p className="text-[10px] sm:text-xs text-white/60 sm:text-white/70 line-clamp-2 leading-tight">By Nexoria Music</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Section: Popular Artists */}
        <section className="mb-10">
          <h2 className="text-lg sm:text-2xl font-bold mb-3 sm:mb-4 tracking-tight hover:underline cursor-pointer">Popular Artists</h2>
          
          <div className="flex overflow-x-auto custom-scrollbar gap-3 sm:gap-4 pb-4 sm:pb-6 -mx-3 px-3 sm:mx-0 sm:px-0 scroll-smooth snap-x snap-mandatory">
            {loadingArtists ? (
              [1,2,3,4,5].map(i => <div key={i} className="w-[120px] sm:w-[180px] shrink-0 aspect-[3/4] bg-white/5 rounded-md animate-pulse" />)
            ) : (
              artists.map((artist) => (
                <div 
                  key={artist._id}
                  onClick={() => navigate('/nexoria-music/artist/' + artist._id)}
                  className="w-[120px] sm:w-[180px] shrink-0 p-2 sm:p-3 bg-[#1E1B4B] hover:bg-[#1E1B4B] rounded-lg sm:rounded-xl transition-colors duration-300 cursor-pointer group snap-start flex flex-col items-center sm:items-start text-center sm:text-left active:scale-[0.98] sm:active:scale-100"
                >
                  <div className="w-[100px] h-[100px] sm:w-full sm:aspect-square bg-[#4338CA] rounded-full mb-2 sm:mb-3 overflow-hidden shadow-lg relative mx-auto shrink-0">
                    {artist.image && (
                      <img src={artist.image} alt={artist.name} className="w-full h-full object-cover" />
                    )}
                    <div className="absolute bottom-2 right-2 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 drop-shadow-xl z-10 hidden sm:block">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate('/nexoria-music/artist/' + artist._id);
                        }}
                        className="w-12 h-12 bg-[#22C55E] rounded-full flex items-center justify-center text-black hover:scale-105 active:scale-95 hover:bg-[#22C55E] shadow-lg"
                      >
                         <Play className="w-6 h-6 fill-current ml-1" />
                      </button>
                    </div>
                  </div>
                  <h3 
                    onClick={() => navigate('/nexoria-music/artist/' + artist._id)}
                    className="font-bold text-xs sm:text-base w-full truncate mb-0.5 sm:mb-1 text-white hover:underline cursor-pointer"
                  >
                    {artist.name}
                  </h3>
                  <p className="text-[10px] sm:text-sm text-white/60 sm:text-[#94A3B8] w-full font-medium">Artist</p>
                </div>
              ))
            )}
          </div>
        </section>

      </div>
      
      {/* Modals */}
      <NexoriaMusicAddToPlaylistModal 
        isOpen={playlistModalOpen} 
        onClose={() => setPlaylistModalOpen(false)} 
        trackId={selectedTrackId} 
      />
      
      <NexoriaMusicContextMenu 
        isOpen={contextMenu.isOpen}
        onClose={() => setContextMenu({ ...contextMenu, isOpen: false })}
        x={contextMenu.x}
        y={contextMenu.y}
        track={contextMenu.track}
        onAddToPlaylist={(trackId) => {
            setSelectedTrackId(trackId);
            setPlaylistModalOpen(true);
        }}
      />
    </div>
  );
};

export default NexoriaMusicHome;
