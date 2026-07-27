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
      <div className="min-h-full bg-[#0F0F23] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#22C55E] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-[#0F0F23] text-white">
      {/* Header Gradient */}
      <div className="min-h-[350px] md:min-h-[300px] bg-gradient-to-b from-emerald-800 to-[#0F0F23] flex items-end px-4 sm:px-6 pb-4 sm:pb-6 pt-16 md:pt-6 relative z-0">
        <button 
          onClick={() => navigate(-1)}
          className="absolute top-4 sm:top-6 left-4 sm:left-6 w-10 h-10 bg-[#0F0F23]/40 hover:bg-[#0F0F23]/60 rounded-full flex items-center justify-center transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        
        <div className="flex flex-col md:flex-row gap-4 sm:gap-6 items-center md:items-end z-10 relative w-full">
          <div className="w-48 h-48 sm:w-56 sm:h-56 bg-gradient-to-br from-emerald-500 to-emerald-900 shadow-2xl flex items-center justify-center rounded-sm overflow-hidden shrink-0 mx-auto md:mx-0">
            <Download className="w-24 h-24 text-white" />
          </div>
          <div className="flex flex-col gap-1 sm:gap-2 min-w-0 flex-1 w-full text-center md:text-left mt-2 md:mt-0">
            <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-white flex items-center justify-center md:justify-start gap-2">
              Offline Playlist
            </span>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tighter text-white pb-1 sm:pb-2 drop-shadow-md line-clamp-2 sm:line-clamp-3 w-full">Downloaded</h1>
            <div className="flex items-center justify-center md:justify-start gap-2 text-xs sm:text-sm text-zinc-300 font-medium mt-1 flex-wrap">
              <span className="font-bold text-white">
                {user?.name || 'User'}
              </span>
              <span className="w-1 h-1 bg-white rounded-full mx-1"></span>
              <span>{tracks.length} songs</span>
            </div>
          </div>
        </div>
      </div>

      {/* Play Controls Action Row */}
      <div className="px-6 py-6 flex items-center justify-between relative z-10 bg-[#0F0F23]/10 backdrop-blur-sm">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => tracks.length > 0 && handlePlay(tracks[0], tracks)}
            className="w-14 h-14 bg-[#22C55E] rounded-full flex items-center justify-center text-black hover:scale-105 active:scale-95 transition-transform shadow-xl"
            disabled={tracks.length === 0}
          >
            {isPlaying && tracks.some(t => t._id === currentTrack?._id) ? <Pause className="w-7 h-7 fill-current" /> : <Play className="w-7 h-7 fill-current ml-1" />}
          </button>
        </div>
      </div>

      <div className="px-6 pb-20 relative z-10">
        {tracks.length === 0 ? (
          <div className="text-center py-20 text-[#94A3B8]">
            <div className="inline-block p-6 rounded-full bg-white/5 mb-4">
              <Download className="w-12 h-12 text-[#94A3B8]" />
            </div>
            <h3 className="text-xl font-bold mb-2">No downloaded tracks</h3>
            <p className="font-medium">Download songs to listen offline.</p>
            <button 
              onClick={() => navigate('/nexoria-music/tracks')}
              className="mt-6 px-8 py-3 bg-white text-black font-bold rounded-full hover:scale-105 transition-transform"
            >
              Find Songs
            </button>
          </div>
        ) : (
          <>
            {/* Table Header */}
            <div className="grid grid-cols-[40px_1fr_60px] md:grid-cols-[40px_minmax(120px,_4fr)_minmax(120px,_2fr)_80px] gap-2 sm:gap-4 px-2 sm:px-4 py-2 text-xs text-[#94A3B8] border-b border-white/10 mb-4 sticky top-16 bg-[#0F0F23] z-10 uppercase tracking-widest font-medium">
              <div className="text-right">#</div>
              <div>Title</div>
              <div className="hidden md:block">Album</div>
              <div className="flex justify-end pr-1"><Clock className="w-4 h-4" /></div>
            </div>

            {/* Tracks List */}
            <div className="flex flex-col">
              {tracks.map((track, idx) => (
                <div 
                  key={track._id} 
                  draggable={true}
                  onDragStart={(e) => {
                    e.dataTransfer.setData('trackId', track._id);
                    e.dataTransfer.effectAllowed = 'copy';
                  }}
                  className="grid grid-cols-[16px_1fr_80px] md:grid-cols-[16px_minmax(120px,_4fr)_minmax(120px,_2fr)_minmax(120px,_1fr)] gap-4 px-4 py-2 hover:bg-white/10 group transition-colors rounded-md items-center cursor-pointer text-sm font-medium"
                  onClick={() => handlePlay(track, tracks)}
                  onContextMenu={(e) => handleContextMenu(e, track)}
                >
                  <div className="text-[#22C55E] text-right group-hover:hidden">{idx + 1}</div>
                  <div className="hidden group-hover:block text-right -ml-1">
                    {currentTrack?._id === track._id && isPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white" />}
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#4338CA] shrink-0 shadow-md">
                      {(track.coverImage || track.album?.coverImage || track.artist?.image) && (
                        <img src={track.coverImage || track.album?.coverImage || track.artist?.image} alt={track.title} className="w-full h-full object-cover" loading="lazy" />
                      )}
                    </div>
                    <div className="flex flex-col truncate">
                      <span className={`truncate text-base ${currentTrack?._id === track._id ? 'text-[#22C55E]' : 'text-white'}`}>{track.title}</span>
                      {track.artist ? (
                        <Link 
                          to={`/nexoria-music/artist/${track.artist._id}`} 
                          className="text-[#94A3B8] hover:underline hover:text-white transition-colors truncate"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {track.artist.name}
                        </Link>
                      ) : (
                        <span className="text-[#94A3B8] truncate">Unknown Artist</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="hidden md:block truncate">
                    {track.album ? (
                      <Link 
                        to={`/nexoria-music/album/${track.album._id}`} 
                        className="text-[#94A3B8] hover:underline hover:text-white transition-colors truncate"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {track.album.title}
                      </Link>
                    ) : (
                      <span className="text-[#94A3B8] truncate">{track.title}</span>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-end gap-4 text-[#94A3B8]">
                    <button 
                      className={`transition-opacity hover:text-white hover:scale-110 ${likedTracks?.includes(track._id) ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        dispatch(toggleLikeTrack(track._id));
                      }}
                    >
                      <Heart className={`w-5 h-5 ${likedTracks?.includes(track._id) ? 'fill-[#22C55E] text-[#22C55E]' : ''}`} />
                    </button>
                    <span className="w-8 text-right tabular-nums">
                      {track.duration ? `${Math.floor(track.duration / 60)}:${(track.duration % 60).toString().padStart(2, '0')}` : '3:24'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </>
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
