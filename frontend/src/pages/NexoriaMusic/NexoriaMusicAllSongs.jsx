import React from 'react';
import { Link } from 'react-router-dom';
import { Play, Pause, Heart, MoreHorizontal, Clock } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { useGetAllTracksConsumerQuery } from '../../features/api/nexoriaMusicApiSlice';
import { playTrack, togglePlayPause, setQueue, toggleLikeTrack } from '../../features/music/nexoriaMusicSlice';
import NexoriaMusicAddToPlaylistModal from '../../components/NexoriaMusicAddToPlaylistModal';
import NexoriaMusicContextMenu from '../../components/NexoriaMusicContextMenu';
import { BACKEND_URL } from '../../features/api/apiSlice';

const NexoriaMusicAllSongs = () => {
  const [modalOpen, setModalOpen] = React.useState(false);
  const [selectedTrackId, setSelectedTrackId] = React.useState(null);
  const [contextMenu, setContextMenu] = React.useState({ isOpen: false, x: 0, y: 0, track: null });

  const handleContextMenu = (e, track) => {
    e.preventDefault();
    setContextMenu({ isOpen: true, x: e.clientX, y: e.clientY, track });
  };
  
  const dispatch = useDispatch();
  const { currentTrack, isPlaying, likedTracks } = useSelector(state => state.nexoriaMusic);
  
  const { data: tracksRes, isLoading, isFetching } = useGetAllTracksConsumerQuery();
  const tracks = tracksRes?.data || [];

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
      dispatch(setQueue(trackList));
      dispatch(playTrack(track));
    }
  };

  const handleAddToPlaylist = (e, trackId) => {
    e.stopPropagation();
    setSelectedTrackId(trackId);
    setModalOpen(true);
  };

  const formatDuration = (d) => {
    if (!d) return '';
    const m = Math.floor(d / 60);
    const s = Math.floor(d % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-background text-on-surface font-body-md min-h-screen relative pb-32">
      
      {/* Hero Section */}
      <section className="relative w-full h-[400px] md:h-[450px] overflow-hidden mb-8">
        <div className="absolute inset-0 bg-primary opacity-20 z-0 blur-3xl scale-150 rounded-full w-1/2 mx-auto mt-20"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent z-0"></div>
        
        <div className="absolute bottom-0 left-0 p-6 md:px-margin-desktop md:pb-12 w-full flex flex-col md:flex-row items-end gap-6 md:gap-8 max-w-[1440px] mx-auto z-10">
          <div className="w-48 h-48 md:w-64 md:h-64 bg-gradient-to-br from-primary to-primary-dark shadow-[0_20px_50px_rgba(210,187,255,0.4)] flex items-center justify-center rounded-xl overflow-hidden shrink-0 mx-auto md:mx-0 border border-outline-variant/30 relative">
            <Heart className="w-24 h-24 text-on-primary drop-shadow-lg" style={{ fontVariationSettings: "'FILL' 1" }} />
          </div>
          <div className="flex flex-col flex-1 w-full text-center md:text-left">
            <span className="font-label-sm text-xs md:text-sm font-bold uppercase tracking-[0.2em] text-primary mb-2 flex items-center justify-center md:justify-start gap-2 glow-accent">
              Collection
            </span>
            <h1 className="font-display-lg text-[48px] sm:text-[64px] md:text-[80px] lg:text-[96px] font-bold tracking-tighter text-on-surface pb-2 drop-shadow-lg leading-none glow-text w-full">All Songs</h1>
            <div className="flex items-center justify-center md:justify-start gap-3 font-label-sm text-sm uppercase tracking-wider text-on-surface-variant flex-wrap font-bold mt-2">
              <span className="text-on-surface">Nexoria</span>
              <span className="w-1.5 h-1.5 bg-primary rounded-full glow-accent"></span>
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
        </div>
      </div>

      <div className="px-4 md:px-margin-desktop pb-20 relative z-10 max-w-[1440px] mx-auto">
        <div className="glass-card border border-outline-variant/20 rounded-2xl overflow-hidden bg-surface-container-low">
          <div className="grid grid-cols-[40px_1fr_40px] sm:grid-cols-[40px_minmax(0,4fr)_minmax(0,2fr)_80px] gap-4 px-4 sm:px-6 py-4 font-label-sm text-xs text-on-surface-variant border-b border-outline-variant/20 sticky top-16 bg-surface-container-low/95 backdrop-blur-md z-10 uppercase tracking-widest font-bold">
            <div className="text-right">#</div>
            <div>Title</div>
            <div className="hidden sm:block">Album</div>
            <div className="flex justify-end pr-2"><Clock className="w-4 h-4" /></div>
          </div>

          {(isLoading || isFetching) && (
            <div className="flex justify-center my-24">
              <div className="w-12 h-12 border-4 border-outline-variant border-t-primary rounded-full animate-spin shadow-[0_0_15px_rgba(210,187,255,0.5)]"></div>
            </div>
          )}

          <div className="flex flex-col p-2">
            {tracks.map((track, idx) => {
              const isActive = currentTrack?._id === track._id;
              return (
                <div 
                  key={track._id} 
                  className="grid grid-cols-[40px_1fr_40px] sm:grid-cols-[40px_minmax(0,4fr)_minmax(0,2fr)_80px] gap-4 px-2 sm:px-4 py-3 hover:bg-surface-container group transition-colors rounded-xl items-center cursor-pointer border-none"
                  onClick={() => handlePlay(track, tracks)}
                  onContextMenu={(e) => handleContextMenu(e, track)}
                >
                  <div className="flex items-center justify-end shrink-0">
                    <span className={`font-label-sm font-bold text-sm group-hover:hidden ${isActive ? 'text-primary' : 'text-on-surface-variant'}`}>{idx + 1}</span>
                    <span className="hidden group-hover:flex">
                      {isActive && isPlaying ? <Pause className="w-5 h-5 fill-current text-on-surface" /> : <Play className="w-5 h-5 fill-current text-on-surface" style={{ fontVariationSettings: "'FILL' 1" }} />}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-surface-container-high shrink-0 rounded-md shadow-md overflow-hidden relative">
                      {(track.coverImage || track.album?.coverImage || track.artist?.image) && (
                        <img src={track.coverImage || track.album?.coverImage || track.artist?.image} alt="" className="w-full h-full object-cover" loading="lazy" />
                      )}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity md:hidden">
                        {isActive && isPlaying ? <Pause className="w-4 h-4 fill-current text-white" /> : <Play className="w-4 h-4 fill-current text-white" style={{ fontVariationSettings: "'FILL' 1" }} />}
                      </div>
                    </div>
                    <div className="flex flex-col min-w-0 justify-center">
                      <span className={`truncate font-body-md font-bold text-base ${isActive ? 'text-primary' : 'text-on-surface'}`}>{track.title}</span>
                      {track.artist ? (
                        <Link to={`/nexoria-music/artist/${track.artist._id}`} className="text-on-surface-variant hover:underline hover:text-on-surface transition-colors truncate font-label-sm text-sm" onClick={(e) => e.stopPropagation()}>
                          {track.artist.name}
                        </Link>
                      ) : (
                        <span className="text-on-surface-variant truncate font-label-sm text-sm">Unknown Artist</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="hidden sm:block min-w-0 flex items-center">
                    {track.album ? (
                      <Link to={`/nexoria-music/album/${track.album._id}`} className="text-on-surface-variant hover:underline hover:text-on-surface transition-colors truncate font-label-sm text-sm block" onClick={(e) => e.stopPropagation()}>
                        {track.album.title}
                      </Link>
                    ) : (
                      <span className="text-on-surface-variant truncate font-label-sm text-sm block">{track.title}</span>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-end gap-2 sm:gap-3 text-on-surface-variant pr-2">
                    <button className="opacity-0 group-hover:opacity-100 transition-opacity hover:text-primary p-1 hidden sm:block" onClick={(e) => handleAddToPlaylist(e, track._id)} title="Add to Playlist">
                      <MoreHorizontal className="w-5 h-5" />
                    </button>
                    <button className={`transition-opacity hover:scale-110 p-1 ${likedTracks?.includes(track._id) ? 'opacity-100 text-primary glow-accent' : 'opacity-0 group-hover:opacity-100 hover:text-on-surface'}`} onClick={(e) => { e.stopPropagation(); dispatch(toggleLikeTrack(track._id)); }}>
                      <Heart className={`w-5 h-5 ${likedTracks?.includes(track._id) ? 'fill-primary' : ''}`} />
                    </button>
                    <span className="font-label-sm text-sm tabular-nums w-8 sm:w-10 text-right">{formatDuration(track.duration)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      
      <NexoriaMusicAddToPlaylistModal isOpen={modalOpen} onClose={() => setModalOpen(false)} trackId={selectedTrackId} />
      <NexoriaMusicContextMenu isOpen={contextMenu.isOpen} onClose={() => setContextMenu({ ...contextMenu, isOpen: false })} x={contextMenu.x} y={contextMenu.y} track={contextMenu.track} onAddToPlaylist={(trackId) => { setSelectedTrackId(trackId); setModalOpen(true); }} />
    </div>
  );
};

export default NexoriaMusicAllSongs;
