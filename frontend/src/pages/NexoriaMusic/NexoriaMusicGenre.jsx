import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Play, Pause, ArrowLeft, MoreHorizontal } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { useGetNexoriaGenresQuery, useGetNexoriaTracksQuery } from '../../features/api/nexoriaMusicApiSlice';
import { playTrack, setQueue, togglePlayPause } from '../../features/music/nexoriaMusicSlice';
import { BACKEND_URL } from '../../features/api/apiSlice';
import NexoriaMusicAddToPlaylistModal from '../../components/NexoriaMusicAddToPlaylistModal';
import NexoriaMusicContextMenu from '../../components/NexoriaMusicContextMenu';

const NexoriaMusicGenre = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { currentTrack, isPlaying } = useSelector(state => state.nexoriaMusic);
  
  const { data: genresRes, isLoading: loadingGenres } = useGetNexoriaGenresQuery();
  const { data: tracksRes, isLoading: loadingTracks } = useGetNexoriaTracksQuery();
  
  const genres = genresRes?.data || [];
  const genre = genres.find(g => g._id === id);
  
  const allTracks = tracksRes?.data || [];
  // genre is an ObjectId reference on track, so track.genre is a string
  const genreTracks = allTracks.filter(track => {
      if (!track.genre) return false;
      const tGenreId = typeof track.genre === 'object' ? track.genre._id : track.genre.toString();
      return tGenreId === id;
  });

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
      dispatch(setQueue(trackList || []));
      dispatch(playTrack(track));
    }
  };

  if (loadingGenres || loadingTracks) {
    return (
      <div className="bg-background min-h-screen pt-8 pb-32 flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-on-surface-variant mt-4 font-bold tracking-wider uppercase text-sm">Loading Genre...</p>
      </div>
    );
  }

  if (!genre) {
    return (
      <div className="bg-background min-h-screen pt-8 pb-32 flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold text-on-surface mb-2">Genre Not Found</h2>
        <button onClick={() => navigate(-1)} className="text-primary hover:underline">Go Back</button>
      </div>
    );
  }

  return (
    <div className="bg-background text-on-surface font-body-md min-h-screen relative pb-32 pt-8 w-full mx-auto">
      {/* Mobile Sticky Header */}
      <div className="md:hidden sticky top-0 z-50 bg-background/90 backdrop-blur-3xl border-b border-outline-variant/30 pt-4 pb-3 px-4 shadow-[0_10px_30px_rgba(0,0,0,0.5)] flex items-center mb-4">
        <button 
          onClick={() => navigate(-1)} 
          className="p-2 rounded-full bg-surface-container/50 hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface transition-all active:scale-95 border border-outline-variant/30 mr-3"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-title-lg font-display-lg text-on-surface tracking-tighter leading-tight font-bold">{genre.name}</h1>
          <p className="text-[9px] font-label-sm uppercase tracking-widest text-primary/80">Genre</p>
        </div>
      </div>

      <div className="relative z-10 px-4 md:px-margin-desktop pt-2 max-w-[1440px] mx-auto md:pt-4">
        
        {/* Genre Hero */}
        <div className="flex flex-col md:flex-row items-end gap-6 md:gap-8 mb-10 pb-8 border-b border-outline-variant/20 pt-4 md:pt-8 relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent blur-3xl -z-10 opacity-50 group-hover:opacity-80 transition-opacity duration-700 rounded-3xl"></div>
          
          <button 
            onClick={() => navigate(-1)}
            className="absolute top-0 left-0 hidden md:flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors bg-surface-container-low/50 backdrop-blur px-4 py-2 rounded-full"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>

          <div className="w-40 h-40 md:w-56 md:h-56 bg-surface-container rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-outline-variant/30 overflow-hidden shrink-0 mx-auto md:mx-0 mt-12 md:mt-16">
            <div className="w-full h-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center opacity-80">
              <span className="text-5xl md:text-7xl font-black text-white mix-blend-overlay">{genre.name[0]}</span>
            </div>
          </div>
          
          <div className="flex-1 text-center md:text-left mt-4 md:mt-0">
            <span className="font-label-sm uppercase tracking-[0.2em] text-on-surface-variant text-sm mb-2 block font-bold">Genre</span>
            <h1 className="font-display-lg text-5xl md:text-8xl text-on-surface font-black tracking-tighter mb-4 leading-none bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
              {genre.name}
            </h1>
            <p className="font-body-md text-on-surface-variant text-lg max-w-2xl hidden md:block">
              {genre.description || `Explore top tracks and hidden gems in ${genre.name}.`}
            </p>
            <div className="flex items-center justify-center md:justify-start gap-4 mt-6 text-sm font-label-sm text-on-surface-variant uppercase tracking-wider font-bold">
              <span>{genreTracks.length} {genreTracks.length === 1 ? 'Song' : 'Songs'}</span>
            </div>
          </div>
        </div>

        {/* Action Bar */}
        {genreTracks.length > 0 && (
          <div className="flex items-center gap-4 mb-8">
            <button 
              onClick={() => handlePlay(genreTracks[0], genreTracks)}
              className="w-14 h-14 md:w-16 md:h-16 bg-primary hover:scale-105 active:scale-95 text-on-primary rounded-full flex items-center justify-center shadow-[0_10px_30px_rgba(210,187,255,0.4)] transition-all"
            >
              <Play className="w-6 h-6 md:w-8 md:h-8 fill-current" style={{ fontVariationSettings: "'FILL' 1" }} />
            </button>
          </div>
        )}

        {/* Tracks List */}
        <div className="mb-16">
          {genreTracks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-24 h-24 bg-surface-container rounded-full flex items-center justify-center mb-6">
                <Play className="w-10 h-10 text-on-surface-variant" />
              </div>
              <h3 className="text-xl font-bold text-on-surface mb-2">No tracks found</h3>
              <p className="text-on-surface-variant max-w-md">We couldn't find any tracks associated with this genre.</p>
            </div>
          ) : (
            <div className="flex flex-col">
              {/* Header */}
              <div className="grid grid-cols-[auto_1fr_auto_auto] md:grid-cols-[auto_1fr_1fr_auto_auto] gap-4 px-4 py-2 border-b border-outline-variant/20 text-on-surface-variant font-label-sm text-sm uppercase tracking-wider mb-2">
                <div className="w-8 text-center">#</div>
                <div>Title</div>
                <div className="hidden md:block">Album</div>
                <div className="w-12 text-center">Time</div>
                <div className="w-10"></div>
              </div>

              {genreTracks.map((track, index) => {
                const isCurrentTrack = currentTrack?._id === track._id;
                
                return (
                  <div 
                    key={track._id} 
                    className={`grid grid-cols-[auto_1fr_auto_auto] md:grid-cols-[auto_1fr_1fr_auto_auto] gap-4 px-4 py-3 items-center rounded-xl group hover:bg-surface-container-low transition-colors cursor-pointer ${isCurrentTrack ? 'bg-surface-container-low/50' : ''}`}
                    onClick={() => handlePlay(track, genreTracks)}
                    onContextMenu={(e) => handleContextMenu(e, track)}
                  >
                    <div className="w-8 flex items-center justify-center relative">
                      {isCurrentTrack && isPlaying ? (
                        <div className="flex items-end gap-[2px] h-4">
                          <div className="w-1 bg-primary h-full animate-[bounce_1s_ease-in-out_infinite]"></div>
                          <div className="w-1 bg-primary h-2/3 animate-[bounce_1s_ease-in-out_infinite_0.2s]"></div>
                          <div className="w-1 bg-primary h-4/5 animate-[bounce_1s_ease-in-out_infinite_0.4s]"></div>
                        </div>
                      ) : (
                        <>
                          <span className={`text-sm font-label-sm ${isCurrentTrack ? 'text-primary font-bold' : 'text-on-surface-variant'} group-hover:opacity-0 transition-opacity`}>
                            {index + 1}
                          </span>
                          <Play className="w-4 h-4 text-on-surface absolute opacity-0 group-hover:opacity-100 transition-opacity fill-current" />
                        </>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 bg-surface-container rounded shrink-0 overflow-hidden">
                        {(track.coverImage || track.album?.coverImage || track.artist?.image) ? (
                           <img src={track.coverImage || track.album?.coverImage || track.artist?.image} alt={track.title} className="w-full h-full object-cover" />
                        ) : (
                           <div className="w-full h-full bg-surface-container-high flex items-center justify-center"><Play className="w-4 h-4 text-on-surface-variant" /></div>
                        )}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className={`font-body-md font-bold truncate ${isCurrentTrack ? 'text-primary' : 'text-on-surface'}`}>
                          {track.title}
                        </span>
                        <span className="font-label-sm text-xs text-on-surface-variant truncate">
                          {track.artist?.name || 'Unknown Artist'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="hidden md:flex items-center text-sm font-body-md text-on-surface-variant truncate">
                      {track.album?.title || 'Single'}
                    </div>
                    
                    <div className="w-12 text-sm font-label-sm text-on-surface-variant text-center">
                      {track.duration ? (() => {
                        const m = Math.floor(track.duration / 60);
                        const s = Math.floor(track.duration % 60).toString().padStart(2, '0');
                        return `${m}:${s}`;
                      })() : '--:--'}
                    </div>

                    <div className="w-10 flex justify-end">
                      <button 
                        onClick={(e) => handleOpenPlaylistModal(e, track._id)}
                        className="p-2 text-on-surface-variant hover:text-on-surface opacity-0 group-hover:opacity-100 transition-all focus:opacity-100 hidden md:block"
                      >
                        <MoreHorizontal className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
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

export default NexoriaMusicGenre;
