import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Play, Pause, Heart, MoreHorizontal, Clock, ArrowLeft, Disc, User } from 'lucide-react';
import { useGetArtistDetailsQuery, useGetFavoritesQuery, useToggleFavoriteMutation } from '../../features/api/nexoriaMusicApiSlice';
import toast from 'react-hot-toast';
import { playTrack, togglePlayPause, setQueue, toggleLikeTrack } from '../../features/music/nexoriaMusicSlice';
import { BACKEND_URL } from '../../features/api/apiSlice';
import NexoriaMusicAddToPlaylistModal from '../../components/NexoriaMusicAddToPlaylistModal';

const NexoriaMusicArtist = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const [modalOpen, setModalOpen] = React.useState(false);
  const [selectedTrackId, setSelectedTrackId] = React.useState(null);

  const { data: artistRes, isLoading } = useGetArtistDetailsQuery(id, { skip: !id });
  const { currentTrack, isPlaying, likedTracks } = useSelector(state => state.nexoriaMusic);
  
  const artistData = artistRes?.data;
  const artist = artistData?.artist;
  const popularTracks = artistData?.popularTracks || [];
  const albums = artistData?.albums || [];

  const { data: favoritesRes } = useGetFavoritesQuery('Artist');
  const [toggleFavorite] = useToggleFavoriteMutation();
  
  const isFollowing = favoritesRes?.data?.some(fav => fav.itemId?._id === id);

  const handleFollowToggle = async () => {
    try {
      const res = await toggleFavorite({ itemId: id, itemType: 'Artist' }).unwrap();
      toast.success(res.message);
    } catch (err) {
      toast.error('Failed to toggle follow');
    }
  };

  const handlePlay = (track, trackList) => {
    if (currentTrack?._id === track._id) {
      dispatch(togglePlayPause());
    } else {
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
      dispatch(setQueue(trackList));
      dispatch(playTrack(track));
    }
  };

  const handleAddToPlaylist = (e, trackId) => {
    e.stopPropagation();
    setSelectedTrackId(trackId);
    setModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-full bg-[#0F0F23] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#22C55E] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!artist) {
    return (
      <div className="min-h-full bg-[#0F0F23] flex flex-col items-center justify-center text-white pb-32">
        <h2 className="text-3xl font-bold mb-4">Artist not found</h2>
        <button onClick={() => navigate('/nexoria-music/tracks')} className="px-6 py-2 bg-white text-black font-bold rounded-full">
          Browse Music
        </button>
      </div>
    );
  }

  return (
    <div className="bg-background text-on-surface font-body-md min-h-screen relative pb-32">
      {/* Mobile Sticky Header */}
      <div className="md:hidden sticky top-0 z-50 bg-background/90 backdrop-blur-3xl border-b border-outline-variant/30 flex items-center px-4 h-16 shadow-lg">
        <button 
          onClick={() => navigate(-1)}
          className="w-10 h-10 flex items-center justify-center text-on-surface-variant hover:text-on-surface active:scale-90 transition-transform bg-surface-container rounded-full"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <span className="flex-1 text-center font-display-lg font-bold text-on-surface text-lg truncate px-2">{artist.name}</span>
        <div className="w-10" /> {/* Spacer for centering */}
      </div>

      {/* Artist Hero Section */}
      <section className="relative w-full h-[450px] md:h-[550px] overflow-hidden mb-16">
        <img 
          src={artist.image || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=2070&auto=format&fit=crop'} 
          className="absolute inset-0 w-full h-full object-cover opacity-60" 
          alt={artist.name}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent"></div>
        
        <div className="absolute bottom-0 left-0 p-6 md:px-margin-desktop md:pb-12 w-full flex flex-col md:flex-row items-end gap-6 md:gap-8 max-w-[1440px] mx-auto">
          {artist.image && (
            <img src={artist.image} className="w-40 h-40 md:w-64 md:h-64 rounded-full border-4 border-surface-container-high object-cover shadow-[0_20px_50px_rgba(0,0,0,0.5)] hidden sm:block shrink-0" alt={artist.name} />
          )}
          <div className="flex flex-col flex-1 w-full text-center sm:text-left">
            <span className="font-label-sm text-xs md:text-sm uppercase tracking-[0.2em] text-primary mb-2 flex items-center justify-center sm:justify-start gap-2 glow-accent font-bold">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span> Verified Artist
            </span>
            <h1 className="font-display-lg text-[48px] sm:text-[64px] md:text-[96px] text-on-surface mb-2 md:mb-4 font-bold tracking-tighter leading-none glow-text drop-shadow-lg line-clamp-2" title={artist.name}>
              {artist.name}
            </h1>
            <p className="font-body-md text-body-md md:text-title-md text-on-surface-variant mb-6 max-w-2xl mx-auto sm:mx-0 line-clamp-2">
              {artist.bio || "Explore the popular tracks and albums from this artist."}
            </p>
            
            <div className="flex items-center justify-center sm:justify-start gap-3 md:gap-4 flex-wrap">
              <button 
                onClick={() => popularTracks.length > 0 && handlePlay(popularTracks[0], popularTracks)}
                disabled={popularTracks.length === 0}
                className="bg-primary hover:bg-primary/90 text-on-primary font-label-sm text-sm md:text-base uppercase px-6 md:px-8 py-3 md:py-4 rounded-full font-bold transition-all active:scale-95 flex items-center gap-2 glow-primary shadow-[0_0_30px_rgba(210,187,255,0.4)] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPlaying && popularTracks.some(t => t._id === currentTrack?._id) ? (
                  <Pause className="w-5 h-5 md:w-6 md:h-6 fill-current" />
                ) : (
                  <Play className="w-5 h-5 md:w-6 md:h-6 fill-current" style={{ fontVariationSettings: "'FILL' 1" }} />
                )}
                Play
              </button>
              <button 
                onClick={handleFollowToggle}
                className={`bg-transparent hover:bg-surface-container border ${isFollowing ? 'border-primary text-primary' : 'border-outline-variant text-on-surface'} font-label-sm text-sm md:text-base uppercase px-6 md:px-8 py-3 md:py-4 rounded-full font-bold transition-all active:scale-95`}
              >
                {isFollowing ? 'Following' : 'Follow'}
              </button>
              <button className="w-12 h-12 md:w-[54px] md:h-[54px] flex items-center justify-center rounded-full border border-outline-variant text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-all hidden sm:flex shrink-0">
                <MoreHorizontal className="w-5 h-5 md:w-6 md:h-6" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Two Column Layout: Popular Tracks & About/Albums */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-16 px-4 md:px-margin-desktop max-w-[1440px] mx-auto">
        
        {/* Left Col: Popular Tracks */}
        <div className="lg:col-span-8">
          {popularTracks.length > 0 && (
            <>
              <h2 className="font-display-lg text-headline-sm text-on-surface mb-6 font-bold tracking-tight">Popular Tracks</h2>
              
              <div className="flex flex-col gap-2 mb-12">
                {popularTracks.map((track, idx) => (
                  <div 
                    key={track._id} 
                    className="glass-panel flex items-center p-2 sm:p-3 gap-3 sm:gap-4 group cursor-pointer hover:bg-surface-container transition-colors rounded-xl border-none"
                    onClick={() => handlePlay(track, popularTracks)}
                  >
                    <span className="font-label-sm w-6 text-center text-on-surface-variant group-hover:hidden">{idx + 1}</span>
                    <span className="hidden group-hover:flex w-6 justify-center text-on-surface">
                      {currentTrack?._id === track._id && isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" style={{ fontVariationSettings: "'FILL' 1" }} />}
                    </span>
                    
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-surface-container-high shrink-0 shadow-md rounded-md overflow-hidden">
                      {(track.coverImage || track.album?.coverImage || artist.image) && (
                        <img src={track.coverImage || track.album?.coverImage || artist.image} alt={track.title} className="w-full h-full object-cover" />
                      )}
                    </div>
                    
                    <div className="flex flex-col flex-1 min-w-0">
                      <span className={`truncate text-sm sm:text-base font-bold ${currentTrack?._id === track._id ? 'text-primary' : 'text-on-surface'}`}>{track.title}</span>
                    </div>
                    
                    <div className="flex items-center gap-3 sm:gap-4 text-on-surface-variant shrink-0">
                      <button 
                        className="opacity-0 group-hover:opacity-100 transition-opacity hover:text-on-surface hover:scale-110 hidden sm:block"
                        onClick={(e) => handleAddToPlaylist(e, track._id)}
                      >
                        <MoreHorizontal className="w-5 h-5" />
                      </button>
                      <button 
                        className={`transition-opacity hover:scale-110 ${likedTracks?.includes(track._id) ? 'opacity-100 text-primary glow-accent' : 'opacity-0 group-hover:opacity-100 hover:text-on-surface'}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          dispatch(toggleLikeTrack(track._id));
                        }}
                      >
                        <Heart className={`w-5 h-5 ${likedTracks?.includes(track._id) ? 'fill-primary text-primary' : ''}`} />
                      </button>
                      <span className="w-8 text-right font-label-sm tabular-nums text-xs sm:text-sm">
                        {track.duration ? `${Math.floor(track.duration / 60)}:${(track.duration % 60).toString().padStart(2, '0')}` : '3:24'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Albums Grid inside Left Column */}
          {albums.length > 0 && (
            <div className="mb-12">
              <h2 className="font-display-lg text-headline-sm text-on-surface mb-6 font-bold tracking-tight">Discography</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
                {albums.map((album) => (
                  <div 
                    key={album._id} 
                    className="group cursor-pointer flex flex-col"
                    onClick={() => navigate(`/nexoria-music/album/${album._id}`)}
                  >
                    <div className="w-full aspect-square bg-surface-container shadow-lg overflow-hidden rounded-xl mb-3 relative border border-outline-variant/20">
                      {album.coverImage ? (
                        <img src={album.coverImage} alt={album.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-on-surface-variant">
                          <Disc className="w-12 h-12" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button 
                          onClick={(e) => { e.stopPropagation(); navigate(`/nexoria-music/album/${album._id}`); }}
                          className="w-12 h-12 bg-primary text-on-primary rounded-full flex items-center justify-center shadow-[0_10px_20px_rgba(210,187,255,0.3)] hover:scale-110 active:scale-95 transition-all glow-primary"
                        >
                          <Play className="w-6 h-6 fill-current" style={{ fontVariationSettings: "'FILL' 1" }} />
                        </button>
                      </div>
                    </div>
                    <h3 className="font-body-md font-bold text-on-surface truncate pb-1">{album.title}</h3>
                    <p className="font-label-sm text-xs text-on-surface-variant truncate">
                      {album.releaseYear || new Date(album.createdAt).getFullYear()} • Album
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Col: About */}
        <div className="lg:col-span-4 flex flex-col gap-8">
          <div>
            <h2 className="font-display-lg text-headline-sm text-on-surface mb-6 font-bold tracking-tight">About</h2>
            <div className="glass-card p-6 rounded-2xl relative overflow-hidden group border border-outline-variant/20 bg-surface-container-low">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              {artist.image && (
                <div className="w-full h-40 mb-4 rounded-xl overflow-hidden shadow-inner hidden xl:block">
                  <img src={artist.image} className="w-full h-full object-cover opacity-70" alt="" />
                </div>
              )}
              <h3 className="font-display-md text-title-lg font-bold text-on-surface mb-2 tracking-tight">
                {artist.bio ? 'Artist Bio' : 'Nexoria Original'}
              </h3>
              <p className="font-body-md text-sm text-on-surface-variant leading-relaxed line-clamp-6">
                {artist.bio || `Explore the world of ${artist.name}. This artist has brought a unique sound to Nexoria Music, blending diverse genres into a cohesive auditory experience.`}
              </p>
            </div>
          </div>
        </div>
      </div>

      <NexoriaMusicAddToPlaylistModal 
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        trackId={selectedTrackId}
      />
    </div>
  );
};

export default NexoriaMusicArtist;
