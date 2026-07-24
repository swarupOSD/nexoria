import React, { useState } from 'react';
import { Play, Pause, Heart, MoreHorizontal, Clock, ArrowLeft, Trash2, Users } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  useGetPlaylistDetailsQuery, 
  useDeletePlaylistMutation,
  useRemoveTrackFromPlaylistMutation,
  useTogglePlaylistCollaborativeMutation
} from '../../features/api/nexoriaMusicApiSlice';
import { playTrack, togglePlayPause, setQueue, toggleLikeTrack } from '../../features/music/nexoriaMusicSlice';
import { BACKEND_URL } from '../../features/api/apiSlice';
import toast from 'react-hot-toast';

const NexoriaMusicPlaylist = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { user } = useSelector(state => state.auth);
  const { currentTrack, isPlaying, likedTracks } = useSelector(state => state.nexoriaMusic);
  
  const { data: playlistRes, isLoading, isFetching } = useGetPlaylistDetailsQuery(id, {
    skip: !id
  });
  
  const [deletePlaylist, { isLoading: isDeleting }] = useDeletePlaylistMutation();
  const [removeTrack] = useRemoveTrackFromPlaylistMutation();
  const [toggleCollaborative, { isLoading: isToggling }] = useTogglePlaylistCollaborativeMutation();
  
  const playlist = playlistRes?.data;
  const tracks = playlist?.tracks || [];
  
  const isOwner = user && playlist?.creator?._id === user._id;

  const handlePlay = (track, trackList) => {
    if (currentTrack?._id === track._id) {
      dispatch(togglePlayPause());
    } else {
      // NexoriaPlayer will automatically detect currentTrack change and play it.
      dispatch(setQueue(trackList));
      dispatch(playTrack(track));
    }
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
      <div className="h-[30vh] min-h-[300px] bg-gradient-to-b from-[#4A4A4A] to-[#0F0F23] flex items-end px-6 pb-6 relative z-0">
        <button 
          onClick={() => navigate(-1)}
          className="absolute top-6 left-6 w-10 h-10 bg-[#0F0F23]/40 hover:bg-[#0F0F23]/60 rounded-full flex items-center justify-center transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        
        <div className="flex gap-6 items-end z-10 relative">
          <div className="w-48 h-48 sm:w-56 sm:h-56 bg-[#1E1B4B] shadow-2xl flex items-center justify-center rounded-sm overflow-hidden shrink-0">
            {playlist.coverImage ? (
              <img src={playlist.coverImage} alt={playlist.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-[#b3b3b3]">
                <Heart className="w-16 h-16 mb-2" />
                <span className="font-medium text-sm">Playlist</span>
              </div>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
              {playlist.isCollaborative ? (
                <>
                  <Users className="w-4 h-4 text-[#22C55E]" />
                  <span className="text-[#22C55E]">Collaborative Playlist</span>
                </>
              ) : (
                'Public Playlist'
              )}
            </span>
            <h1 className="text-5xl md:text-8xl font-black tracking-tighter text-white pb-2 drop-shadow-md truncate max-w-[800px]">{playlist.title}</h1>
            {playlist.description && (
              <p className="text-[#b3b3b3] text-sm md:text-base mb-2 font-medium">{playlist.description}</p>
            )}
            <div className="flex items-center gap-2 text-sm text-zinc-300 font-medium">
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

      <div className="px-6 pb-20 relative z-10">
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
            <div className="grid grid-cols-[16px_minmax(120px,_4fr)_minmax(120px,_2fr)_minmax(120px,_1fr)] gap-4 px-4 py-2 text-sm text-[#94A3B8] border-b border-white/10 mb-4 sticky top-16 bg-[#0F0F23] z-10 uppercase tracking-widest font-medium">
              <div className="text-right">#</div>
              <div>Title</div>
              <div className="hidden md:block">Album</div>
              <div className="flex justify-end pr-8"><Clock className="w-4 h-4" /></div>
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
                  className="grid grid-cols-[16px_minmax(120px,_4fr)_minmax(120px,_2fr)_minmax(120px,_1fr)] gap-4 px-4 py-2 hover:bg-white/10 group transition-colors rounded-md items-center cursor-pointer text-sm font-medium"
                  onClick={() => handlePlay(track, tracks)}
                >
                  <div className="text-[#94A3B8] text-right group-hover:hidden">{idx + 1}</div>
                  <div className="hidden group-hover:block text-right -ml-1">
                    {currentTrack?._id === track._id && isPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white" />}
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#4338CA] shrink-0 shadow-md">
                      {(track.coverImage || track.album?.coverImage || track.artist?.image) && (
                        <img src={track.coverImage || track.album?.coverImage || track.artist?.image} alt={track.title} className="w-full h-full object-cover" />
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
                    {isOwner && (
                      <button 
                        className="opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-500 hover:scale-110"
                        onClick={(e) => handleRemoveTrack(e, track._id)}
                        title="Remove from Playlist"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
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
    </div>
  );
};

export default NexoriaMusicPlaylist;
