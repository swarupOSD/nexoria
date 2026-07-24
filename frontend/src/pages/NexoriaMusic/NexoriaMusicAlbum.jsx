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

  if (isLoading) {
    return (
      <div className="min-h-full bg-[#0F0F23] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#22C55E] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!album) {
    return (
      <div className="min-h-full bg-[#0F0F23] flex flex-col items-center justify-center text-white pb-32">
        <h2 className="text-3xl font-bold mb-4">Album not found</h2>
        <button onClick={() => navigate('/nexoria-music/tracks')} className="px-6 py-2 bg-white text-black font-bold rounded-full">
          Browse Music
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
            {album.coverImage ? (
              <img src={album.coverImage} alt={album.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[#b3b3b3]">
                <Disc className="w-24 h-24" />
              </div>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-sm font-bold uppercase tracking-wider text-white">Album</span>
            <h1 className="text-5xl md:text-8xl font-black tracking-tighter text-white pb-2 drop-shadow-md truncate max-w-[800px]">{album.title}</h1>
            
            <div className="flex items-center gap-2 text-sm text-zinc-300 font-medium mt-2">
              {album.artist && (
                <>
                  <div className="w-6 h-6 rounded-full overflow-hidden bg-[#4338CA]">
                    {album.artist.image && <img src={album.artist.image} alt={album.artist.name} className="w-full h-full object-cover" />}
                  </div>
                  <Link to={`/nexoria-music/artist/${album.artist._id}`} className="font-bold text-white hover:underline cursor-pointer">
                    {album.artist.name}
                  </Link>
                  <span className="w-1 h-1 bg-white rounded-full mx-1"></span>
                </>
              )}
              <span>{album.releaseYear || new Date(album.createdAt).getFullYear()}</span>
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
          <button 
            onClick={handleSaveToggle}
            className={`${isSaved ? 'text-[#22C55E]' : 'text-[#94A3B8] hover:text-white'} transition-colors`}
          >
            <Heart className="w-8 h-8" fill={isSaved ? "currentColor" : "none"} />
          </button>
        </div>
      </div>

      <div className="px-6 pb-20 relative z-10">
        {tracks.length === 0 ? (
          <div className="text-center py-20 text-[#94A3B8]">
            <p>No tracks found in this album.</p>
          </div>
        ) : (
          <>
            {/* Table Header */}
            <div className="grid grid-cols-[32px_1fr_80px] md:grid-cols-[32px_minmax(120px,_4fr)_minmax(120px,_1fr)] gap-4 px-4 py-2 text-sm text-[#94A3B8] border-b border-white/10 mb-4 sticky top-16 bg-[#0F0F23] z-10 uppercase tracking-widest font-medium">
              <div className="text-right">#</div>
              <div>Title</div>
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
                  className="grid grid-cols-[32px_1fr_80px] md:grid-cols-[32px_minmax(120px,_4fr)_minmax(120px,_1fr)] gap-4 px-4 py-2 hover:bg-white/10 group transition-colors rounded-md items-center cursor-pointer text-sm font-medium"
                  onClick={() => handlePlay(track, tracks)}
                  onContextMenu={(e) => handleContextMenu(e, track)}
                >
                  <div className="text-[#94A3B8] text-right group-hover:hidden">{idx + 1}</div>
                  <div className="hidden group-hover:block text-right -ml-1">
                    {currentTrack?._id === track._id && isPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white" />}
                  </div>
                  
                  <div className="flex flex-col truncate">
                    <span className={`truncate text-base ${currentTrack?._id === track._id ? 'text-[#22C55E]' : 'text-white'}`}>{track.title}</span>
                    {track.artist && <span className="text-[#94A3B8] group-hover:text-white transition-colors truncate">{track.artist.name}</span>}
                  </div>
                  
                  <div className="flex items-center justify-end gap-4 text-[#94A3B8]">
                    <button 
                      className="opacity-0 group-hover:opacity-100 transition-opacity hover:text-white hover:scale-110"
                      onClick={(e) => handleAddToPlaylist(e, track._id)}
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
          </>
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
