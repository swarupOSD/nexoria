import React from 'react';
import { Play, Pause, Download, Clock, ArrowLeft } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { useGetNexoriaTracksQuery } from '../../features/api/nexoriaMusicApiSlice';
import { playTrack, togglePlayPause, setQueue, toggleLikeTrack } from '../../features/music/nexoriaMusicSlice';
import { BACKEND_URL } from '../../features/api/apiSlice';
import NexoriaMusicAddToPlaylistModal from '../../components/NexoriaMusicAddToPlaylistModal';
import NexoriaMusicContextMenu from '../../components/NexoriaMusicContextMenu';
import { Heart } from 'lucide-react';

const NexoriaMusicDownloaded = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { currentTrack, isPlaying, likedTracks, downloadedTracks } = useSelector(state => state.nexoriaMusic);
  const { user } = useSelector(state => state.auth);
  
  const { data: tracksRes, isLoading, isFetching } = useGetNexoriaTracksQuery();
  
  const tracks = (tracksRes?.data || []).filter(track => downloadedTracks.includes(track._id));

  const [playlistModalOpen, setPlaylistModalOpen] = React.useState(false);
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
          // eslint-disable-next-line
          window.__nexoriaAudioRef.current.src = src;
          window.__nexoriaAudioRef.current.play().catch(() => {});
        }
      }
      dispatch(setQueue(trackList));
      dispatch(playTrack(track));
    }
  };

  if (isLoading || isFetching) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-outline-variant border-t-primary rounded-full animate-spin shadow-[0_0_15px_rgba(210,187,255,0.5)]"></div>
      </div>
    );
  }

  return (
    <div className="bg-background text-on-surface font-body-md min-h-screen relative pb-32">
      {/* Hero Section */}
      <section className="relative w-full h-[400px] md:h-[450px] overflow-hidden mb-8">
        <div className="absolute inset-0 bg-primary opacity-20 z-0 blur-3xl scale-150 rounded-full w-1/2 mx-auto mt-20"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent z-0"></div>
        
        <button 
          onClick={() => navigate(-1)}
          className="hidden md:flex absolute top-6 left-6 w-12 h-12 bg-surface-container-high/50 hover:bg-surface-container-highest backdrop-blur-md rounded-full items-center justify-center transition-colors z-20 text-on-surface-variant hover:text-on-surface border border-outline-variant/30"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        
        <div className="absolute bottom-0 left-0 p-6 md:px-margin-desktop md:pb-12 w-full flex flex-col md:flex-row items-end gap-6 md:gap-8 max-w-[1440px] mx-auto z-10">
          <div className="w-48 h-48 md:w-64 md:h-64 bg-gradient-to-br from-emerald-500 to-emerald-800 shadow-[0_20px_50px_rgba(16,185,129,0.4)] flex items-center justify-center rounded-xl overflow-hidden shrink-0 mx-auto md:mx-0 border border-outline-variant/30 relative">
            <Download className="w-24 h-24 text-white drop-shadow-lg" />
          </div>
          <div className="flex flex-col flex-1 w-full text-center md:text-left">
            <span className="font-label-sm text-xs md:text-sm font-bold uppercase tracking-[0.2em] text-primary mb-2 flex items-center justify-center md:justify-start gap-2 glow-accent">
              Offline Playlist
            </span>
            <h1 className="font-display-lg text-[48px] sm:text-[64px] md:text-[80px] lg:text-[96px] font-bold tracking-tighter text-on-surface pb-2 drop-shadow-lg leading-none glow-text w-full">Downloaded</h1>
            <div className="flex items-center justify-center md:justify-start gap-3 font-label-sm text-sm uppercase tracking-wider text-on-surface-variant flex-wrap font-bold mt-2">
              <span className="text-on-surface">
                {user?.name || 'User'}
              </span>
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
        {tracks.length === 0 ? (
          <div className="text-center py-24 glass-card rounded-3xl border border-outline-variant/20 mx-4 md:mx-0">
            <div className="inline-block p-6 rounded-full bg-surface-container-highest mb-6 shadow-inner">
              <Download className="w-12 h-12 text-on-surface-variant" />
            </div>
            <h3 className="font-display-lg text-headline-sm font-bold mb-3 text-on-surface">No downloaded tracks</h3>
            <p className="font-body-md text-on-surface-variant font-medium">Download songs to listen offline.</p>
            <button 
              onClick={() => navigate('/nexoria-music/tracks')}
              className="mt-8 px-8 py-3 bg-primary text-on-primary font-bold rounded-full hover:scale-105 transition-transform active:scale-95 glow-primary uppercase tracking-wider text-sm"
            >
              Find Songs
            </button>
          </div>
        ) : (
          <div className="glass-card border border-outline-variant/20 rounded-2xl overflow-hidden bg-surface-container-low">
            {/* Table Header */}
            <div className="grid grid-cols-[40px_1fr_40px] md:grid-cols-[40px_minmax(120px,_4fr)_minmax(120px,_2fr)_80px] gap-4 px-4 sm:px-6 py-4 font-label-sm text-xs text-on-surface-variant border-b border-outline-variant/20 sticky top-16 bg-surface-container-low/95 backdrop-blur-md z-10 uppercase tracking-widest font-bold">
              <div className="text-right">#</div>
              <div>Title</div>
              <div className="hidden md:block">Album</div>
              <div className="flex justify-end pr-2"><Clock className="w-4 h-4" /></div>
            </div>

            {/* Tracks List */}
            <div className="flex flex-col p-2">
              {tracks.map((track, idx) => {
                const isActive = currentTrack?._id === track._id;
                return (
                  <div 
                    key={track._id} 
                    className="grid grid-cols-[40px_1fr_40px] md:grid-cols-[40px_minmax(120px,_4fr)_minmax(120px,_2fr)_80px] gap-4 px-2 sm:px-4 py-3 hover:bg-surface-container group transition-colors rounded-xl items-center cursor-pointer border-none"
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
                          <img src={track.coverImage || track.album?.coverImage || track.artist?.image} alt={track.title} className="w-full h-full object-cover" loading="lazy" />
                        )}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity md:hidden">
                          {isActive && isPlaying ? <Pause className="w-4 h-4 fill-current text-white" /> : <Play className="w-4 h-4 fill-current text-white" style={{ fontVariationSettings: "'FILL' 1" }} />}
                        </div>
                      </div>
                      <div className="flex flex-col min-w-0 justify-center">
                        <span className={`truncate font-body-md font-bold text-base ${isActive ? 'text-primary' : 'text-on-surface'}`}>{track.title}</span>
                        {track.artist ? (
                          <Link 
                            to={`/nexoria-music/artist/${track.artist._id}`} 
                            className="text-on-surface-variant hover:underline hover:text-on-surface transition-colors truncate font-label-sm text-sm"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {track.artist.name}
                          </Link>
                        ) : (
                          <span className="text-on-surface-variant truncate font-label-sm text-sm">Unknown Artist</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="hidden md:block min-w-0 flex items-center">
                      {track.album ? (
                        <Link 
                          to={`/nexoria-music/album/${track.album._id}`} 
                          className="text-on-surface-variant hover:underline hover:text-on-surface transition-colors truncate font-label-sm text-sm block"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {track.album.title}
                        </Link>
                      ) : (
                        <span className="text-on-surface-variant truncate font-label-sm text-sm block">{track.title}</span>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-end gap-2 sm:gap-3 text-on-surface-variant pr-2">
                      <button 
                        className={`transition-opacity hover:scale-110 p-1 ${likedTracks?.includes(track._id) ? 'opacity-100 text-primary glow-accent' : 'opacity-0 group-hover:opacity-100 hover:text-on-surface'}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          dispatch(toggleLikeTrack(track._id));
                        }}
                      >
                        <Heart className={`w-5 h-5 ${likedTracks?.includes(track._id) ? 'fill-primary' : ''}`} style={likedTracks?.includes(track._id) ? { fontVariationSettings: "'FILL' 1" } : {}} />
                      </button>
                      <span className="font-label-sm text-sm tabular-nums w-8 sm:w-10 text-right">
                        {track.duration ? `${Math.floor(track.duration / 60)}:${(track.duration % 60).toString().padStart(2, '0')}` : ''}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
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

export default NexoriaMusicDownloaded;
