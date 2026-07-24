import React from 'react';
import { Link } from 'react-router-dom';
import { Play, Pause, Heart, MoreHorizontal, Clock } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { useGetAllTracksConsumerQuery } from '../../features/api/nexoriaMusicApiSlice';
import { playTrack, togglePlayPause, setQueue, toggleLikeTrack } from '../../features/music/nexoriaMusicSlice';
import { BACKEND_URL } from '../../features/api/apiSlice';
import toast from 'react-hot-toast';
import NexoriaMusicAddToPlaylistModal from '../../components/NexoriaMusicAddToPlaylistModal';

const NexoriaMusicAllSongs = () => {
  const [modalOpen, setModalOpen] = React.useState(false);
  const [selectedTrackId, setSelectedTrackId] = React.useState(null);
  
  const dispatch = useDispatch();
  const { currentTrack, isPlaying, likedTracks } = useSelector(state => state.nexoriaMusic);
  
  const { data: tracksRes, isLoading, isFetching } = useGetAllTracksConsumerQuery();
  const tracks = tracksRes?.data || [];

  const handlePlay = (track, trackList) => {
    if (currentTrack?._id === track._id) {
      dispatch(togglePlayPause());
    } else {
      // NexoriaPlayer will automatically detect currentTrack change and play it.
      dispatch(setQueue(trackList));
      dispatch(playTrack(track));
    }
  };

  const handleAddToPlaylist = (e, trackId) => {
    e.stopPropagation();
    setSelectedTrackId(trackId);
    setModalOpen(true);
  };

  return (
    <div className="min-h-full bg-[#0F0F23] text-white">
      {/* Header Gradient */}
      <div className="h-64 bg-gradient-to-b from-[#2E1A47] to-[#0F0F23] flex items-end px-6 pb-6 relative z-0">
        <div className="flex gap-6 items-end z-10 relative">
          <div className="w-48 h-48 bg-gradient-to-br from-indigo-500 to-purple-800 shadow-2xl flex items-center justify-center rounded-sm">
            <Heart className="w-20 h-20 text-white" />
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-sm font-bold uppercase tracking-wider text-white">Collection</span>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white pb-2 drop-shadow-md">All Songs</h1>
            <div className="flex items-center gap-2 text-sm text-zinc-300 font-medium">
              <span>Nexoria</span>
              <span className="w-1 h-1 bg-white rounded-full mx-1"></span>
              <span>{tracks.length} songs</span>
            </div>
          </div>
        </div>
      </div>

      {/* Play Controls Action Row */}
      <div className="px-6 py-6 flex items-center gap-6 relative z-10 bg-[#0F0F23]/10 backdrop-blur-sm">
        <button 
          onClick={() => tracks.length > 0 && handlePlay(tracks[0], tracks)}
          className="w-14 h-14 bg-[#22C55E] rounded-full flex items-center justify-center text-black hover:scale-105 active:scale-95 transition-transform shadow-xl"
        >
          {isPlaying ? <Pause className="w-7 h-7 fill-current" /> : <Play className="w-7 h-7 fill-current ml-1" />}
        </button>
      </div>

      <div className="px-6 pb-32 relative z-10">
        {/* Table Header */}
        <div className="grid grid-cols-[16px_minmax(120px,_4fr)_minmax(120px,_2fr)_minmax(120px,_1fr)] gap-4 px-4 py-2 text-sm text-[#94A3B8] border-b border-white/10 mb-4 sticky top-16 bg-[#0F0F23] z-10 uppercase tracking-widest font-medium">
          <div className="text-right">#</div>
          <div>Title</div>
          <div className="hidden md:block">Album</div>
          <div className="flex justify-end pr-8"><Clock className="w-4 h-4" /></div>
        </div>

        {/* Loading */}
        {(isLoading || isFetching) && (
          <div className="flex justify-center my-20">
            <div className="w-10 h-10 border-4 border-[#22C55E] border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

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
                <button 
                  className="opacity-0 group-hover:opacity-100 transition-opacity hover:text-white hover:scale-110"
                  onClick={(e) => handleAddToPlaylist(e, track._id)}
                  title="Add to Playlist"
                >
                  <MoreHorizontal className="w-5 h-5" />
                </button>
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
      </div>
      
      <NexoriaMusicAddToPlaylistModal 
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        trackId={selectedTrackId}
      />
    </div>
  );
};

export default NexoriaMusicAllSongs;
