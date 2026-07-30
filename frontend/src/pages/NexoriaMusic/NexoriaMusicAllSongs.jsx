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
          // eslint-disable-next-line
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
    <div className="min-h-full bg-[#0F0F23] text-white">
      <div className="min-h-[350px] md:min-h-[300px] bg-gradient-to-b from-[#2E1A47] to-[#0F0F23] flex items-end px-4 sm:px-6 pb-4 sm:pb-6 pt-16 md:pt-6 relative z-0">
        <div className="flex flex-col md:flex-row gap-4 sm:gap-6 items-center md:items-end z-10 relative w-full">
          <div className="w-48 h-48 sm:w-56 sm:h-56 bg-gradient-to-br from-indigo-500 to-purple-800 shadow-2xl flex items-center justify-center rounded-sm shrink-0 mx-auto md:mx-0">
            <Heart className="w-24 h-24 text-white" />
          </div>
          <div className="flex flex-col gap-1 sm:gap-2 min-w-0 flex-1 w-full text-center md:text-left mt-2 md:mt-0">
            <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-white flex items-center justify-center md:justify-start gap-2">Collection</span>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tighter text-white pb-1 sm:pb-2 drop-shadow-md line-clamp-2 sm:line-clamp-3 w-full">All Songs</h1>
            <div className="flex items-center justify-center md:justify-start gap-2 text-xs sm:text-sm text-zinc-300 font-medium mt-1 flex-wrap">
              <span>Nexoria</span>
              <span className="w-1 h-1 bg-white rounded-full mx-1"></span>
              <span>{tracks.length} songs</span>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 py-4 sm:py-6 flex items-center gap-6 relative z-10">
        <button 
          onClick={() => tracks.length > 0 && handlePlay(tracks[0], tracks)}
          className="w-14 h-14 bg-[#22C55E] rounded-full flex items-center justify-center text-black hover:scale-105 active:scale-95 transition-transform shadow-xl"
        >
          {isPlaying && tracks.some(t => t._id === currentTrack?._id) ? <Pause className="w-7 h-7 fill-current" /> : <Play className="w-7 h-7 fill-current ml-1" />}
        </button>
      </div>

      <div className="px-2 sm:px-6 pb-32 relative z-10">
        <div className="grid grid-cols-[40px_1fr_60px] sm:grid-cols-[40px_minmax(0,4fr)_minmax(0,2fr)_80px] gap-2 sm:gap-4 px-2 sm:px-4 py-2 text-xs text-[#94A3B8] border-b border-white/10 mb-1 sticky top-16 bg-[#0F0F23] z-10 uppercase tracking-widest font-medium">
          <div className="text-right">#</div>
          <div>Title</div>
          <div className="hidden sm:block">Album</div>
          <div className="flex justify-end pr-1"><Clock className="w-4 h-4" /></div>
        </div>

        {(isLoading || isFetching) && (
          <div className="flex justify-center my-20">
            <div className="w-10 h-10 border-4 border-[#22C55E] border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        <div className="flex flex-col">
          {tracks.map((track, idx) => {
            const isActive = currentTrack?._id === track._id;
            return (
              <div 
                key={track._id} 
                className="grid grid-cols-[40px_1fr_60px] sm:grid-cols-[40px_minmax(0,4fr)_minmax(0,2fr)_80px] gap-2 sm:gap-4 px-2 sm:px-4 py-2 hover:bg-white/10 group transition-colors rounded-md items-center cursor-pointer"
                onClick={() => handlePlay(track, tracks)}
                onContextMenu={(e) => handleContextMenu(e, track)}
              >
                <div className="flex items-center justify-end shrink-0">
                  <span className={`text-sm group-hover:hidden ${isActive ? 'text-[#22C55E]' : 'text-[#94A3B8]'}`}>{idx + 1}</span>
                  <span className="hidden group-hover:flex">
                    {isActive && isPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white" />}
                  </span>
                </div>
                
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 bg-[#4338CA] shrink-0 rounded shadow-md overflow-hidden">
                    {(track.coverImage || track.album?.coverImage || track.artist?.image) && (
                      <img src={track.coverImage || track.album?.coverImage || track.artist?.image} alt="" className="w-full h-full object-cover" loading="lazy" />
                    )}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className={`truncate text-sm font-medium ${isActive ? 'text-[#22C55E]' : 'text-white'}`}>{track.title}</span>
                    {track.artist ? (
                      <Link to={`/nexoria-music/artist/${track.artist._id}`} className="text-[#94A3B8] hover:underline hover:text-white transition-colors truncate text-xs" onClick={(e) => e.stopPropagation()}>
                        {track.artist.name}
                      </Link>
                    ) : (
                      <span className="text-[#94A3B8] truncate text-xs">Unknown Artist</span>
                    )}
                  </div>
                </div>
                
                <div className="hidden sm:block min-w-0">
                  {track.album ? (
                    <Link to={`/nexoria-music/album/${track.album._id}`} className="text-[#94A3B8] hover:underline hover:text-white transition-colors truncate text-sm block" onClick={(e) => e.stopPropagation()}>
                      {track.album.title}
                    </Link>
                  ) : (
                    <span className="text-[#94A3B8] truncate text-sm block">{track.title}</span>
                  )}
                </div>
                
                <div className="flex items-center justify-end gap-1 sm:gap-2 text-[#94A3B8]">
                  <button className="opacity-0 group-hover:opacity-100 transition-opacity hover:text-white p-1 hidden sm:block" onClick={(e) => handleAddToPlaylist(e, track._id)} title="Add to Playlist">
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                  <button className={`transition-opacity hover:text-white p-1 ${likedTracks?.includes(track._id) ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} onClick={(e) => { e.stopPropagation(); dispatch(toggleLikeTrack(track._id)); }}>
                    <Heart className={`w-4 h-4 ${likedTracks?.includes(track._id) ? 'fill-[#22C55E] text-[#22C55E]' : ''}`} />
                  </button>
                  <span className="text-xs tabular-nums w-8 sm:w-10 text-right">{formatDuration(track.duration)}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      <NexoriaMusicAddToPlaylistModal isOpen={modalOpen} onClose={() => setModalOpen(false)} trackId={selectedTrackId} />
      <NexoriaMusicContextMenu isOpen={contextMenu.isOpen} onClose={() => setContextMenu({ ...contextMenu, isOpen: false })} x={contextMenu.x} y={contextMenu.y} track={contextMenu.track} onAddToPlaylist={(trackId) => { setSelectedTrackId(trackId); setModalOpen(true); }} />
    </div>
  );
};

export default NexoriaMusicAllSongs;
