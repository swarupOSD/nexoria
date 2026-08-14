import React, { useState, useEffect } from 'react';
import { Play, Pause, Settings, Bell, Clock, MoreHorizontal, ArrowLeft, Music, Mic } from 'lucide-react';
import { 
  useGetNexoriaArtistsQuery, 
  useGetNexoriaTracksQuery, 
  useGetMusicRecentlyPlayedQuery, 
  useGetMusicRecommendationsQuery,
  useGetDiscoverWeeklyQuery,
  useGetReleaseRadarQuery,
  useGetDailyMixQuery,
  useGetPublicPlaylistsQuery,
  useGetNexoriaGenresQuery
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
  const { data: genresRes, isLoading: loadingGenres } = useGetNexoriaGenresQuery();

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
          // eslint-disable-next-line
          window.__nexoriaAudioRef.current.src = src;
          window.__nexoriaAudioRef.current.play().catch(() => {});
        }
      }
      dispatch(setQueue(trackList || []));
      dispatch(playTrack(track));
    }
  };
  return (
    <div className="bg-background text-on-surface font-body-md min-h-screen relative pb-32 pt-8 w-full mx-auto">
      
      {/* 📱 MOBILE EXCLUSIVE: STICKY HEADER */}
      <div className="md:hidden sticky top-0 z-50 bg-background/90 backdrop-blur-3xl border-b border-outline-variant/30 pt-4 pb-3 px-4 shadow-[0_10px_30px_rgba(0,0,0,0.5)] flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/')} 
            className="p-2 rounded-full bg-surface-container/50 hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface transition-all active:scale-95 border border-outline-variant/30"
            title="Back to Dashboard"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-title-lg font-display-lg text-on-surface tracking-tighter leading-tight font-bold">Nexoria Music</h1>
            <p className="text-[9px] font-label-sm uppercase tracking-widest text-primary/80">Premium Audio</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/nexoria-music/queue')} className="active:scale-90 transition-transform" title="Queue / History">
            <Clock className="w-5 h-5 text-on-surface-variant" />
          </button>
          <button onClick={() => navigate('/nexoria-music/search')} className="active:scale-90 transition-transform" title="Search">
            <Settings className="w-5 h-5 text-on-surface-variant" />
          </button>
        </div>
      </div>

      <div className="relative z-10 px-4 md:px-margin-desktop pt-2 max-w-[1440px] mx-auto md:pt-4">
        
        {/* Hero Section / Banner */}
        <section className="relative w-full h-[350px] md:h-[500px] rounded-2xl overflow-hidden mb-16 group shadow-2xl border border-outline-variant/20">
          <img src="https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=2070&auto=format&fit=crop" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105 opacity-80" alt="Hero" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/40 to-transparent"></div>
          
          <div className="absolute bottom-0 left-0 p-6 md:p-12 w-full max-w-3xl">
            <span className="font-label-sm text-xs md:text-sm uppercase tracking-[0.2em] text-primary mb-2 md:mb-4 block glow-accent">Welcome Back</span>
            <h1 className="font-display-lg text-headline-lg md:text-display-lg text-on-surface mb-2 font-bold tracking-tighter leading-none">{greetingText}</h1>
            <p className="font-body-md text-body-md md:text-title-md text-on-surface-variant mb-6 md:mb-8 max-w-xl hidden sm:block">Dive back into your favorite sounds or discover something entirely new in the digital realm.</p>
            
            <div className="flex items-center gap-4">
              <button 
                onClick={() => {
                  if (topGridTracks.length > 0) handlePlay(topGridTracks[0], topGridTracks);
                }}
                className="bg-primary hover:bg-primary/90 text-on-primary font-label-sm text-label-sm uppercase px-6 md:px-8 py-3 md:py-4 rounded-full font-bold transition-all active:scale-95 flex items-center gap-2 glow-primary"
              >
                <Play className="w-5 h-5 fill-current" /> Play Latest
              </button>
              <button 
                onClick={() => navigate('/nexoria-music/library')}
                className="bg-surface-container-high/50 hover:bg-surface-container-highest/80 text-on-surface backdrop-blur-md border border-outline-variant font-label-sm text-label-sm uppercase px-6 md:px-8 py-3 md:py-4 rounded-full font-bold transition-all active:scale-95"
              >
                Your Library
              </button>
            </div>
          </div>
        </section>

        {/* Category Chips (All, Music, Podcasts) */}
        <div className="flex gap-3 mb-8 overflow-x-auto no-scrollbar pb-2">
          {['All', 'Music', 'Podcasts'].map(chip => (
            <button
              key={chip}
              onClick={() => setActiveChip(chip)}
              className={`px-5 md:px-6 py-2 md:py-2.5 rounded-full font-label-sm text-label-sm uppercase tracking-wider whitespace-nowrap transition-all active:scale-95 border ${
                activeChip === chip 
                  ? 'bg-primary text-on-primary border-primary font-bold shadow-[0_0_15px_rgba(210,187,255,0.3)]' 
                  : 'bg-surface-container-low text-on-surface-variant border-outline-variant/30 hover:bg-surface-container hover:text-on-surface'
              }`}
            >
              {chip}
            </button>
          ))}

          {/* Creator Studio Link */}
          <div className="ml-auto flex items-center">
            <button
              onClick={() => navigate('/sound/creator-studio')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full font-label-sm text-label-sm uppercase whitespace-nowrap transition-all bg-gradient-to-r from-primary/20 to-secondary/20 text-primary hover:bg-primary/30 border border-primary/30 shadow-[0_0_15px_rgba(210,187,255,0.15)] active:scale-95 font-bold"
            >
              <Mic className="w-4 h-4" />
              Creator Studio
            </button>
          </div>
        </div>
        
        {/* 6-Grid (Recently Played) */}
        <section className="mb-16">
          <h2 className="font-display-lg text-headline-sm text-on-surface mb-6 font-bold tracking-tight">Recently Played</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {loadingTracks || loadingRecent ? (
              [1,2,3,4,5,6].map(i => <div key={i} className="h-20 bg-surface-container-low rounded-xl animate-pulse" />)
            ) : (
              topGridTracks.map(track => (
                <div 
                  key={track._id}
                  className="glass-card flex items-center p-3 gap-4 group cursor-pointer bg-surface-container-low hover:bg-surface-container border border-outline-variant/20 rounded-xl transition-all"
                  onClick={() => handlePlay(track, topGridTracks)}
                  onContextMenu={(e) => handleContextMenu(e, track)}
                >
                  <div className="w-14 h-14 bg-surface-container rounded-md shrink-0 shadow-md overflow-hidden relative">
                    {(track.coverImage || track.album?.coverImage || track.artist?.image) && (
                      <img src={track.coverImage || track.album?.coverImage || track.artist?.image} alt={track.title} className="w-full h-full object-cover" />
                    )}
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      {currentTrack?._id === track._id && isPlaying ? <Pause className="w-6 h-6 text-white fill-current" /> : <Play className="w-6 h-6 text-white fill-current" style={{ fontVariationSettings: "'FILL' 1" }} />}
                    </div>
                  </div>
                  <div className="flex flex-col flex-1 min-w-0 pr-2">
                     <span className="font-body-md font-bold text-on-surface text-sm line-clamp-2 leading-tight">{track.title}</span>
                  </div>
                  
                  {/* Options Button Overlay */}
                  <button 
                    onClick={(e) => handleOpenPlaylistModal(e, track._id)}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors opacity-0 group-hover:opacity-100 hidden md:flex shrink-0"
                    title="Add to Playlist"
                  >
                    <MoreHorizontal className="w-5 h-5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Section: Made For You */}
        <section className="mb-16">
          <h2 className="font-display-lg text-headline-sm text-on-surface mb-6 font-bold tracking-tight hover:text-primary cursor-pointer transition-colors">Made For You</h2>
          
          <div className="flex overflow-x-auto no-scrollbar gap-6 pb-6 -mx-4 px-4 md:mx-0 md:px-0">
            {loadingDiscover || loadingRadar || loadingMix ? (
              [1,2,3,4,5].map(i => <div key={i} className="min-w-[180px] w-[180px] shrink-0 aspect-square bg-surface-container-low rounded-xl animate-pulse" />)
            ) : algorithmicPlaylists.length > 0 ? (
              algorithmicPlaylists.map((playlist) => (
                <div 
                  key={playlist._id}
                  onClick={() => navigate(`/nexoria-music/playlist/${playlist._id}`, { state: { algorithmicPlaylist: playlist } })}
                  className="min-w-[180px] w-[180px] group cursor-pointer shrink-0"
                >
                  <div className="w-full aspect-square bg-surface-container rounded-xl mb-4 overflow-hidden shadow-lg border border-outline-variant/20 relative">
                    {playlist.coverImage && (
                      <img src={playlist.coverImage} alt={playlist.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePlay(playlist.tracks[0], playlist.tracks);
                        }}
                        className="w-14 h-14 bg-primary text-on-primary rounded-full flex items-center justify-center shadow-[0_10px_20px_rgba(210,187,255,0.3)] hover:scale-110 active:scale-95 transition-all glow-primary"
                        title="Play Mix"
                      >
                        <Play className="w-6 h-6 fill-current" style={{ fontVariationSettings: "'FILL' 1" }} />
                      </button>
                    </div>
                  </div>
                  <h3 className="font-body-md font-bold text-on-surface mb-1 truncate text-base">{playlist.name}</h3>
                  <p className="font-label-sm text-xs text-on-surface-variant line-clamp-2">{playlist.description}</p>
                </div>
              ))
            ) : (
              madeForYouTracks.map((track) => (
                <div 
                  key={track._id}
                  onClick={() => handlePlay(track, madeForYouTracks)}
                  onContextMenu={(e) => handleContextMenu(e, track)}
                  className="min-w-[160px] w-[160px] group cursor-pointer shrink-0"
                >
                  <div className="w-full aspect-square bg-surface-container rounded-xl mb-4 overflow-hidden shadow-lg border border-outline-variant/20 relative">
                    {(track.coverImage || track.album?.coverImage || track.artist?.image) && (
                      <img src={track.coverImage || track.album?.coverImage || track.artist?.image} alt={track.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePlay(track, madeForYouTracks);
                        }}
                        className="w-12 h-12 bg-primary text-on-primary rounded-full flex items-center justify-center shadow-[0_10px_20px_rgba(210,187,255,0.3)] hover:scale-110 active:scale-95 transition-all glow-primary"
                      >
                        {currentTrack?._id === track._id && isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" style={{ fontVariationSettings: "'FILL' 1" }} />}
                      </button>
                    </div>
                  </div>
                  <h3 className="font-body-md font-bold text-on-surface mb-1 truncate text-sm">{track.title}</h3>
                  <p className="font-label-sm text-xs text-on-surface-variant line-clamp-1">{track.artist?.name || 'Unknown Artist'}</p>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Section: Featured Playlists (Admin) */}
        {(!loadingPublicPlaylists && publicPlaylistsRes?.data?.length > 0) && (
          <section className="mb-16">
            <h2 className="font-display-lg text-headline-sm text-on-surface mb-6 font-bold tracking-tight hover:text-primary cursor-pointer transition-colors">Featured Playlists</h2>
            
            <div className="flex overflow-x-auto no-scrollbar gap-6 pb-6 -mx-4 px-4 md:mx-0 md:px-0">
              {publicPlaylistsRes.data.map((playlist) => (
                <div 
                  key={playlist._id}
                  onClick={() => navigate(`/nexoria-music/playlist/${playlist._id}`)}
                  className="min-w-[180px] w-[180px] group cursor-pointer shrink-0"
                >
                  <div className="w-full aspect-square bg-surface-container rounded-xl mb-4 overflow-hidden shadow-lg border border-outline-variant/20 relative">
                    {playlist.coverImage && (
                      <img src={playlist.coverImage} alt={playlist.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          if (playlist.tracks && playlist.tracks.length > 0) {
                             handlePlay(playlist.tracks[0], playlist.tracks);
                          } else {
                             navigate(`/nexoria-music/playlist/${playlist._id}`);
                          }
                        }}
                        className="w-14 h-14 bg-primary text-on-primary rounded-full flex items-center justify-center shadow-[0_10px_20px_rgba(210,187,255,0.3)] hover:scale-110 active:scale-95 transition-all glow-primary"
                      >
                        <Play className="w-6 h-6 fill-current" style={{ fontVariationSettings: "'FILL' 1" }} />
                      </button>
                    </div>
                  </div>
                  <h3 className="font-body-md font-bold text-on-surface mb-1 truncate text-base">{playlist.title}</h3>
                  <p className="font-label-sm text-xs text-on-surface-variant line-clamp-2">By Nexoria</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Section: Browse by Genre */}
        <section className="mb-16">
          <h2 className="font-display-lg text-headline-sm text-on-surface mb-6 font-bold tracking-tight hover:text-primary cursor-pointer transition-colors">Browse by Genre</h2>
          
          <div className="flex overflow-x-auto no-scrollbar gap-6 pb-6 -mx-4 px-4 md:mx-0 md:px-0">
            {loadingGenres ? (
              [1,2,3,4,5].map(i => <div key={i} className="min-w-[180px] w-[180px] h-[100px] shrink-0 bg-surface-container-low rounded-xl animate-pulse" />)
            ) : (
              (genresRes?.data || []).map((genre) => (
                <div 
                  key={genre._id}
                  onClick={() => navigate('/nexoria-music/genre/' + genre._id)}
                  className="min-w-[180px] w-[180px] h-[100px] group cursor-pointer shrink-0 rounded-xl overflow-hidden relative border border-outline-variant/30 shadow-lg"
                  style={{
                    background: 'linear-gradient(135deg, rgba(210,187,255,0.2) 0%, rgba(20,20,30,0.8) 100%)',
                    backgroundColor: '#1f1f2e'
                  }}
                >
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="p-4 h-full flex flex-col justify-end">
                    <h3 className="font-body-md font-bold text-on-surface text-lg group-hover:text-primary transition-colors">{genre.name}</h3>
                  </div>
                  <div className="absolute -right-4 -bottom-4 opacity-30 group-hover:opacity-60 transition-opacity group-hover:scale-110 transform duration-500">
                    <Music className="w-20 h-20 text-white mix-blend-overlay" />
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Section: Popular Artists */}
        <section className="mb-16">
          <h2 className="font-display-lg text-headline-sm text-on-surface mb-6 font-bold tracking-tight hover:text-primary cursor-pointer transition-colors">Popular Artists</h2>
          
          <div className="flex overflow-x-auto no-scrollbar gap-6 pb-6 -mx-4 px-4 md:mx-0 md:px-0">
            {loadingArtists ? (
              [1,2,3,4,5].map(i => <div key={i} className="min-w-[160px] w-[160px] shrink-0 aspect-square bg-surface-container-low rounded-full animate-pulse" />)
            ) : (
              artists.map((artist) => (
                <div 
                  key={artist._id}
                  onClick={() => navigate('/nexoria-music/artist/' + artist._id)}
                  className="min-w-[160px] w-[160px] group cursor-pointer shrink-0 flex flex-col items-center text-center"
                >
                  <div className="w-32 h-32 md:w-full md:aspect-square bg-surface-container rounded-full mb-4 overflow-hidden shadow-lg border border-outline-variant/20 relative mx-auto shrink-0">
                    {artist.image && (
                      <img src={artist.image} alt={artist.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate('/nexoria-music/artist/' + artist._id);
                        }}
                        className="w-14 h-14 bg-primary text-on-primary rounded-full flex items-center justify-center shadow-[0_10px_20px_rgba(210,187,255,0.3)] hover:scale-110 active:scale-95 transition-all glow-primary"
                      >
                         <Play className="w-6 h-6 fill-current" style={{ fontVariationSettings: "'FILL' 1" }} />
                      </button>
                    </div>
                  </div>
                  <h3 className="font-body-md font-bold text-on-surface w-full truncate mb-1 hover:text-primary transition-colors text-base">
                    {artist.name}
                  </h3>
                  <p className="font-label-sm text-xs text-on-surface-variant w-full uppercase tracking-wider">Artist</p>
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
