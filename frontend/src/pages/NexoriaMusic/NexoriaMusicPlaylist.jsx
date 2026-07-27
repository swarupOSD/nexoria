import React, { useState } from 'react';
import { Play, Pause, Heart, MoreHorizontal, Clock, ArrowLeft, Trash2, Users, Download, CheckCircle2, Loader2 } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import {
  useGetPlaylistDetailsQuery, 
  useDeletePlaylistMutation,
  useRemoveTrackFromPlaylistMutation,
  useTogglePlaylistCollaborativeMutation
} from '../../features/api/nexoriaMusicApiSlice';
import { playTrack, togglePlayPause, setQueue, toggleLikeTrack, addDownloadedTrack, removeDownloadedTrackId } from '../../features/music/nexoriaMusicSlice';
import { BACKEND_URL } from '../../features/api/apiSlice';
import { downloadTrack, removeDownloadedTrack } from '../../utils/offlineManager';
import toast from 'react-hot-toast';
import NexoriaMusicAddToPlaylistModal from '../../components/NexoriaMusicAddToPlaylistModal';
import NexoriaMusicContextMenu from '../../components/NexoriaMusicContextMenu';

const NexoriaMusicPlaylist = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  
  const { user } = useSelector(state => state.auth);
  const { currentTrack, isPlaying, likedTracks, downloadedTracks } = useSelector(state => state.nexoriaMusic);
  
  const [isDownloading, setIsDownloading] = useState(false);
  
  const algorithmicPlaylist = location.state?.algorithmicPlaylist;

  const { data: playlistRes, isLoading, isFetching } = useGetPlaylistDetailsQuery(id, {
    skip: !id || !!algorithmicPlaylist
  });
  
  const [deletePlaylist, { isLoading: isDeleting }] = useDeletePlaylistMutation();
  const [removeTrack] = useRemoveTrackFromPlaylistMutation();
  const [toggleCollaborative, { isLoading: isToggling }] = useTogglePlaylistCollaborativeMutation();
  
  const playlist = algorithmicPlaylist || playlistRes?.data;
  const tracks = playlist?.tracks || [];
  
  const isOwner = user && playlist?.creator?._id === user._id;

  const [playlistModalOpen, setPlaylistModalOpen] = useState(false);
  const [selectedTrackId, setSelectedTrackId] = useState(null);
  const [contextMenu, setContextMenu] = useState({ isOpen: false, x: 0, y: 0, track: null });

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

  const isPlaylistDownloaded = tracks.length > 0 && tracks.every(t => downloadedTracks.includes(t._id));

  const handleDownloadPlaylist = async () => {
    if (tracks.length === 0) return;
    setIsDownloading(true);
    
    if (isPlaylistDownloaded) {
      // Remove all
      let successCount = 0;
      for (const track of tracks) {
        const baseUrl = BACKEND_URL.endsWith('/api') ? BACKEND_URL.slice(0, -4) : BACKEND_URL;
        const audioUrl = track.telegramFileId 
          ? `${baseUrl}/api/nexoria-music/stream/${track.telegramFileId}`
          : track.audioUrl || "";
        if (audioUrl) {
          await removeDownloadedTrack(audioUrl);
          dispatch(removeDownloadedTrackId(track._id));
          successCount++;
        }
      }
      toast.success(`Removed ${successCount} tracks from downloads`);
    } else {
      // Download all missing
      let successCount = 0;
      for (const track of tracks) {
        if (downloadedTracks.includes(track._id)) continue;
        
        const baseUrl = BACKEND_URL.endsWith('/api') ? BACKEND_URL.slice(0, -4) : BACKEND_URL;
        const audioUrl = track.telegramFileId 
          ? `${baseUrl}/api/nexoria-music/stream/${track.telegramFileId}`
          : track.audioUrl || "";
          
        if (audioUrl) {
          const success = await downloadTrack(audioUrl);
          if (success) {
            dispatch(addDownloadedTrack(track._id));
            successCount++;
          }
        }
      }
      toast.success(`Downloaded ${successCount} new tracks`);
    }
    
    setIsDownloading(false);
  };

  const handleDeletePlaylist = async () => {
    if (window.confirm('Are you sure you want to delete this playlist?')) {
      try {
        await deletePlaylist(id).unwrap();
        toast.success('Playlist deleted');
        navigate('/nexoria-music/library');
      } catch (err) {
        toast.error('Failed to delete playlist');
      }
    }
  };

  const handleToggleCollaborative = async () => {
    try {
      const res = await toggleCollaborative(id).unwrap();
      toast.success(res.message);
    } catch (err) {
      toast.error('Failed to toggle collaborative status');
    }
  };

  const handleRemoveTrack = async (e, trackId) => {
    e.stopPropagation();
    try {
      await removeTrack({ playlistId: id, trackId }).unwrap();
      toast.success('Track removed from playlist');
    } catch (err) {
      toast.error('Failed to remove track');
    }
  };

  if (isLoading || isFetching) {
    return (
      <div className="min-h-full bg-[#0F0F23] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#22C55E] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!playlist) {
    return (
      <div className="min-h-full bg-[#0F0F23] flex flex-col items-center justify-center text-white pb-32">
        <h2 className="text-3xl font-bold mb-4">Playlist not found</h2>
        <button onClick={() => navigate('/nexoria-music/library')} className="px-6 py-2 bg-white text-black font-bold rounded-full hover:scale-105 transition-transform">
          Go back to Library
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-[#0F0F23] text-white">
      {/* Header Gradient */}
      <div className="h-[25vh] min-h-[200px] sm:min-h-[300px] bg-gradient-to-b from-[#4A4A4A] to-[#0F0F23] flex items-end px-4 sm:px-6 pb-4 sm:pb-6 relative z-0">
        <button 
          onClick={() => navigate(-1)}
          className="absolute top-4 sm:top-6 left-4 sm:left-6 w-10 h-10 bg-[#0F0F23]/40 hover:bg-[#0F0F23]/60 rounded-full flex items-center justify-center transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        
        <div className="flex gap-4 sm:gap-6 items-end z-10 relative w-full">
          <div className="w-28 h-28 sm:w-48 sm:h-48 bg-[#1E1B4B] shadow-2xl flex items-center justify-center rounded-sm overflow-hidden shrink-0">
            {playlist.coverImage ? (
              <img src={playlist.coverImage} alt={playlist.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-[#b3b3b3]">
                <Heart className="w-10 h-10 sm:w-16 sm:h-16 mb-2" />
                <span className="font-medium text-xs sm:text-sm">Playlist</span>
              </div>
            )}
          </div>
          <div className="flex flex-col gap-1 sm:gap-2 min-w-0 flex-1">
            <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
              {playlist.isCollaborative ? (
                <>
                  <Users className="w-4 h-4 text-[#22C55E]" />
                  <span className="text-[#22C55E]">Collaborative Playlist</span>
                </>
              ) : (
                'Public Playlist'
              )}
            </span>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tighter text-white pb-1 sm:pb-2 drop-shadow-md line-clamp-2 sm:line-clamp-3 w-full" title={playlist.title}>{playlist.title}</h1>
            {playlist.description && (
              <p className="text-[#b3b3b3] text-xs sm:text-sm md:text-base mb-1 sm:mb-2 font-medium truncate">{playlist.description}</p>
            )}
            <div className="flex items-center gap-2 text-xs sm:text-sm text-zinc-300 font-medium">
              <span 
                className="font-bold text-white hover:underline cursor-pointer"
                onClick={() => {
                  if (playlist.creator?._id) navigate(`/nexoria-music/user/${playlist.creator._id}`);
                }}
              >
                {playlist.creator?.name || 'User'}
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
            {isPlaying ? <Pause className="w-7 h-7 fill-current" /> : <Play className="w-7 h-7 fill-current ml-1" />}
          </button>
          
          <button 
            onClick={handleDownloadPlaylist}
            disabled={isDownloading || tracks.length === 0}
            className="w-10 h-10 border border-white/30 rounded-full flex items-center justify-center text-white hover:border-white transition-colors"
            title={isPlaylistDownloaded ? "Remove Downloads" : "Download Playlist"}
          >
            {isDownloading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : isPlaylistDownloaded ? (
              <CheckCircle2 className="w-6 h-6 text-[#22C55E]" />
            ) : (
              <Download className="w-5 h-5" />
            )}
          </button>
        </div>
        
        {isOwner && (
          <div className="flex items-center gap-4">
            <button 
              onClick={handleToggleCollaborative}
              disabled={isToggling}
              className={`flex items-center gap-2 font-medium transition-colors border px-4 py-1.5 rounded-full text-sm ${playlist.isCollaborative ? 'border-[#22C55E] text-[#22C55E] hover:bg-[#22C55E]/10' : 'border-[#94A3B8] text-[#94A3B8] hover:border-white hover:text-white'}`}
            >
              <Users className="w-4 h-4" />
              <span>{playlist.isCollaborative ? 'Collaborative' : 'Make Collaborative'}</span>
            </button>
            <button 
              onClick={handleDeletePlaylist}
              disabled={isDeleting}
              className="flex items-center gap-2 text-[#94A3B8] hover:text-red-500 font-medium transition-colors"
            >
              <Trash2 className="w-5 h-5" />
              <span>Delete</span>
            </button>
          </div>
        )}
      </div>

      <div className="px-2 sm:px-6 pb-20 relative z-10">
        {tracks.length === 0 ? (
          <div className="text-center py-20">
            <div className="inline-block p-6 rounded-full bg-white/5 mb-4">
              <MoreHorizontal className="w-12 h-12 text-[#94A3B8]" />
            </div>
            <h3 className="text-xl font-bold mb-2">It's a bit empty here...</h3>
            <p className="text-[#94A3B8] font-medium">Find some songs to add to your playlist.</p>
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
            <div className="grid grid-cols-[40px_1fr_60px] md:grid-cols-[40px_minmax(0,4fr)_minmax(0,2fr)_80px] gap-2 sm:gap-4 px-2 sm:px-4 py-2 text-xs text-[#94A3B8] border-b border-white/10 mb-1 sticky top-16 bg-[#0F0F23] z-10 uppercase tracking-widest font-medium">
              <div className="text-right">#</div>
              <div>Title</div>
              <div className="hidden md:block">Album</div>
              <div className="flex justify-end pr-1"><Clock className="w-4 h-4" /></div>
            </div>

            {/* Tracks List */}
            <div className="flex flex-col">
              {tracks.map((track, idx) => {
                const isActive = currentTrack?._id === track._id;
                return (
                  <div 
                    key={track._id} 
                    draggable={true}
                    onDragStart={(e) => {
                      e.dataTransfer.setData('trackId', track._id);
                      e.dataTransfer.effectAllowed = 'copy';
                    }}
                    className="grid grid-cols-[40px_1fr_60px] md:grid-cols-[40px_minmax(0,4fr)_minmax(0,2fr)_80px] gap-2 sm:gap-4 px-2 sm:px-4 py-2 hover:bg-white/10 group transition-colors rounded-md items-center cursor-pointer"
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
                          <img src={track.coverImage || track.album?.coverImage || track.artist?.image} alt={track.title} className="w-full h-full object-cover" />
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
                    
                    <div className="hidden md:block min-w-0">
                      {track.album ? (
                        <Link to={`/nexoria-music/album/${track.album._id}`} className="text-[#94A3B8] hover:underline hover:text-white transition-colors truncate text-sm block" onClick={(e) => e.stopPropagation()}>
                          {track.album.title}
                        </Link>
                      ) : (
                        <span className="text-[#94A3B8] truncate text-sm block">{track.title}</span>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-end gap-1 sm:gap-2 text-[#94A3B8]">
                      {isOwner && !algorithmicPlaylist && (
                        <button className="opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-500 p-1" onClick={(e) => handleRemoveTrack(e, track._id)} title="Remove from Playlist">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                      <button className={`transition-opacity hover:text-white p-1 ${likedTracks?.includes(track._id) ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} onClick={(e) => { e.stopPropagation(); dispatch(toggleLikeTrack(track._id)); }}>
                        <Heart className={`w-4 h-4 ${likedTracks?.includes(track._id) ? 'fill-[#22C55E] text-[#22C55E]' : ''}`} />
                      </button>
                      <span className="text-xs tabular-nums w-8 sm:w-10 text-right">
                        {track.duration ? `${Math.floor(track.duration / 60)}:${(track.duration % 60).toString().padStart(2, '0')}` : ''}
                      </span>
                    </div>
                  </div>
                );
              })}
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

export default NexoriaMusicPlaylist;
