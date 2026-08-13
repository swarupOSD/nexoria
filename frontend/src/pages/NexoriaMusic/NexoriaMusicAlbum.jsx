import React, { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Play, Pause, Heart, MoreHorizontal, Clock, ArrowLeft, Disc } from 'lucide-react';
import { useGetAlbumDetailsQuery, useGetFavoritesQuery, useToggleFavoriteMutation } from '../../features/api/nexoriaMusicApiSlice';
import toast from 'react-hot-toast';
import { playTrack, togglePlayPause, setQueue, toggleLikeTrack } from '../../features/music/nexoriaMusicSlice';
import { BACKEND_URL } from '../../features/api/apiSlice';
import NexoriaMusicAddToPlaylistModal from '../../components/NexoriaMusicAddToPlaylistModal';
import NexoriaMusicContextMenu from '../../components/NexoriaMusicContextMenu';

const NexoriaMusicAlbum = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const [modalOpen, setModalOpen] = React.useState(false);
  const [selectedTrackId, setSelectedTrackId] = React.useState(null);
  const [contextMenu, setContextMenu] = React.useState({ isOpen: false, x: 0, y: 0, track: null });

  const handleContextMenu = (e, track) => {
    e.preventDefault();
    setContextMenu({
      isOpen: true,
      x: e.clientX,
      y: e.clientY,
      track
    });
  };

  const { data: albumRes, isLoading } = useGetAlbumDetailsQuery(id, { skip: !id });
  const { currentTrack, isPlaying, likedTracks } = useSelector(state => state.nexoriaMusic);
  
  const albumData = albumRes?.data;
  const album = albumData?.album;
  const tracks = albumData?.tracks || [];

  const { data: favoritesRes } = useGetFavoritesQuery('Album');
  const [toggleFavorite] = useToggleFavoriteMutation();
  
  const isSaved = favoritesRes?.data?.some(fav => fav.itemId?._id === id);

  const handleSaveToggle = async () => {
    try {
      const res = await toggleFavorite({ itemId: id, itemType: 'Album' }).unwrap();
      if (res.isFavorite) {
        toast.success('Album saved to Your Library');
      } else {
        toast.success('Album removed from Your Library');
      }
    } catch (err) {
      toast.error('Failed to toggle save');
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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-outline-variant border-t-primary rounded-full animate-spin shadow-[0_0_15px_rgba(210,187,255,0.5)]"></div>
      </div>
    );
  }

  if (!album) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center text-on-surface pb-32">
        <h2 className="font-display-lg text-headline-sm font-bold mb-4">Album not found</h2>
        <button onClick={() => navigate('/nexoria-music/tracks')} className="px-6 py-3 bg-primary text-on-primary font-bold rounded-full hover:scale-105 transition-transform active:scale-95 glow-primary uppercase tracking-wider text-sm">
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
        <span className="flex-1 text-center font-display-lg font-bold text-on-surface text-lg truncate px-2">{album.title}</span>
        <div className="w-10" /> {/* Spacer for centering */}
      </div>

      {/* Hero Section */}
      <section className="relative w-full h-[450px] md:h-[500px] overflow-hidden mb-8">
        <div className="absolute inset-0 bg-surface-container-high opacity-50 z-0">
          {album.coverImage && (
             <img src={album.coverImage} className="w-full h-full object-cover blur-3xl scale-110 opacity-60" alt="" />
          )}
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent z-0"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/60 to-transparent z-0"></div>
        
        <button 
          onClick={() => navigate(-1)}
          className="hidden md:flex absolute top-6 left-6 w-12 h-12 bg-surface-container-high/50 hover:bg-surface-container-highest backdrop-blur-md rounded-full items-center justify-center transition-colors z-20 text-on-surface-variant hover:text-on-surface border border-outline-variant/30"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        
        <div className="absolute bottom-0 left-0 p-6 md:px-margin-desktop md:pb-12 w-full flex flex-col md:flex-row items-end gap-6 md:gap-8 max-w-[1440px] mx-auto z-10">
          <div className="w-48 h-48 md:w-64 md:h-64 bg-surface-container-high shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex items-center justify-center rounded-xl overflow-hidden shrink-0 mx-auto md:mx-0 border border-outline-variant/20 relative group">
            {album.coverImage ? (
              <img src={album.coverImage} alt={album.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-on-surface-variant">
                <Disc className="w-24 h-24 mb-4" />
              </div>
            )}
          </div>
          <div className="flex flex-col flex-1 w-full text-center md:text-left">
            <span className="font-label-sm text-xs md:text-sm font-bold uppercase tracking-[0.2em] text-primary mb-2 flex items-center justify-center md:justify-start gap-2 glow-accent">
              Album
            </span>
            <h1 className="font-display-lg text-[40px] sm:text-[56px] md:text-[80px] lg:text-[96px] font-bold tracking-tighter text-on-surface pb-2 drop-shadow-lg leading-none glow-text line-clamp-2 sm:line-clamp-3 w-full" title={album.title}>{album.title}</h1>
            
            <div className="flex items-center justify-center md:justify-start gap-3 font-label-sm text-sm uppercase tracking-wider text-on-surface-variant flex-wrap font-bold mt-2">
              {album.artist && (
                <>
                  <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full overflow-hidden bg-surface-container-highest border border-outline-variant/30">
                    {album.artist.image && <img src={album.artist.image} alt={album.artist.name} className="w-full h-full object-cover" />}
                  </div>
                  <Link to={`/nexoria-music/artist/${album.artist._id}`} className="text-on-surface hover:text-primary hover:underline cursor-pointer transition-colors">
                    {album.artist.name}
                  </Link>
                  <span className="w-1.5 h-1.5 bg-primary rounded-full glow-accent mx-1"></span>
                </>
              )}
              <span className="text-on-surface">{album.releaseYear || new Date(album.createdAt).getFullYear()}</span>
              <span className="w-1.5 h-1.5 bg-primary rounded-full glow-accent mx-1"></span>
              <span>{tracks.length} songs</span>
            </div>
          </div>
        </div>
      </section>

      {/* Play Controls Action Row */}
      <div className="px-4 md:px-margin-desktop py-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10 max-w-[1440px] mx-auto mb-8 border-b border-outline-variant/20">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => tracks.length > 0 && handlePlay(tracks[0], tracks)}
            className="w-16 h-16 bg-primary text-on-primary rounded-full flex items-center justify-center shadow-[0_10px_30px_rgba(210,187,255,0.4)] hover:scale-105 active:scale-95 transition-all glow-primary disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            disabled={tracks.length === 0}
          >
            {isPlaying && tracks.some(t => t._id === currentTrack?._id) ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current" style={{ fontVariationSettings: "'FILL' 1" }} />}
          </button>
          <button 
            onClick={handleSaveToggle}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors border ${isSaved ? 'border-primary text-primary hover:bg-primary/10 glow-accent' : 'border-outline-variant text-on-surface-variant hover:text-on-surface hover:border-on-surface'}`}
            title={isSaved ? "Remove from Library" : "Save to Library"}
          >
            <Heart className="w-6 h-6" fill={isSaved ? "currentColor" : "none"} />
          </button>
        </div>
      </div>

      <div className="px-4 md:px-margin-desktop pb-20 relative z-10 max-w-[1440px] mx-auto">
        {tracks.length === 0 ? (
          <div className="text-center py-24 glass-card rounded-3xl border border-outline-variant/20 mx-4 md:mx-0">
            <div className="inline-block p-6 rounded-full bg-surface-container-highest mb-6 shadow-inner">
              <MoreHorizontal className="w-12 h-12 text-on-surface-variant" />
            </div>
            <h3 className="font-display-lg text-headline-sm font-bold mb-3 text-on-surface">No tracks found</h3>
            <p className="font-body-md text-on-surface-variant font-medium">This album doesn't have any songs yet.</p>
          </div>
        ) : (
          <div className="glass-card border border-outline-variant/20 rounded-2xl overflow-hidden bg-surface-container-low">
            {/* Table Header */}
            <div className="grid grid-cols-[32px_1fr_40px] md:grid-cols-[40px_minmax(120px,_4fr)_100px] gap-4 px-4 sm:px-6 py-4 font-label-sm text-xs text-on-surface-variant border-b border-outline-variant/20 sticky top-16 bg-surface-container-low/95 backdrop-blur-md z-10 uppercase tracking-widest font-bold">
              <div className="text-right">#</div>
              <div>Title</div>
              <div className="flex justify-end pr-2"><Clock className="w-4 h-4" /></div>
            </div>

            {/* Tracks List */}
            <div className="flex flex-col p-2">
              {tracks.map((track, idx) => {
                const isActive = currentTrack?._id === track._id;
                return (
                  <div 
                    key={track._id} 
                    className="grid grid-cols-[32px_1fr_40px] md:grid-cols-[40px_minmax(120px,_4fr)_100px] gap-4 px-2 sm:px-4 py-3 hover:bg-surface-container group transition-colors rounded-xl items-center cursor-pointer border-none"
                    onClick={() => handlePlay(track, tracks)}
                    onContextMenu={(e) => handleContextMenu(e, track)}
                  >
                    <div className="flex items-center justify-end shrink-0">
                      <span className={`font-label-sm font-bold text-sm group-hover:hidden ${isActive ? 'text-primary' : 'text-on-surface-variant'}`}>{idx + 1}</span>
                      <span className="hidden group-hover:flex">
                        {isActive && isPlaying ? <Pause className="w-5 h-5 fill-current text-on-surface" /> : <Play className="w-5 h-5 fill-current text-on-surface" style={{ fontVariationSettings: "'FILL' 1" }} />}
                      </span>
                    </div>
                    
                    <div className="flex flex-col truncate min-w-0 justify-center">
                      <span className={`truncate font-body-md font-bold text-base ${isActive ? 'text-primary' : 'text-on-surface'}`}>{track.title}</span>
                      {track.artist && <span className="text-on-surface-variant group-hover:text-on-surface transition-colors truncate font-label-sm text-sm">{track.artist.name}</span>}
                    </div>
                    
                    <div className="flex items-center justify-end gap-3 sm:gap-4 text-on-surface-variant pr-2">
                      <button 
                        className="opacity-0 group-hover:opacity-100 transition-opacity hover:text-primary p-1 hidden sm:block"
                        onClick={(e) => handleAddToPlaylist(e, track._id)}
                      >
                        <MoreHorizontal className="w-5 h-5" />
                      </button>
                      <button 
                        className={`transition-opacity hover:scale-110 p-1 ${likedTracks?.includes(track._id) ? 'opacity-100 text-primary glow-accent' : 'opacity-0 group-hover:opacity-100 hover:text-on-surface'}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          dispatch(toggleLikeTrack(track._id));
                        }}
                      >
                        <Heart className={`w-5 h-5 ${likedTracks?.includes(track._id) ? 'fill-primary' : ''}`} />
                      </button>
                      <span className="font-label-sm text-sm tabular-nums w-8 sm:w-10 text-right">
                        {track.duration ? `${Math.floor(track.duration / 60)}:${(track.duration % 60).toString().padStart(2, '0')}` : '3:24'}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      <NexoriaMusicAddToPlaylistModal 
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
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
            setModalOpen(true);
        }}
      />
    </div>
  );
};

export default NexoriaMusicAlbum;
