import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Play, Pause, Heart, MoreHorizontal, Clock, ArrowLeft, Disc } from 'lucide-react';
import { useGetArtistDetailsQuery, useGetFavoritesQuery, useToggleFavoriteMutation } from '../../features/api/nexoriaMusicApiSlice';
import toast from 'react-hot-toast';
import { playTrack, togglePlayPause, setQueue, toggleLikeTrack } from '../../features/music/nexoriaMusicSlice';
import { BACKEND_URL } from '../../features/api/apiSlice';
import NexoriaMusicAddToPlaylistModal from '../../components/NexoriaMusicAddToPlaylistModal';

const NexoriaMusicArtist = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const [modalOpen, setModalOpen] = React.useState(false);
  const [selectedTrackId, setSelectedTrackId] = React.useState(null);

  const { data: artistRes, isLoading } = useGetArtistDetailsQuery(id, { skip: !id });
  const { currentTrack, isPlaying, likedTracks } = useSelector(state => state.nexoriaMusic);
  
  const artistData = artistRes?.data;
  const artist = artistData?.artist;
  const popularTracks = artistData?.popularTracks || [];
  const albums = artistData?.albums || [];

  const { data: favoritesRes } = useGetFavoritesQuery('Artist');
  const [toggleFavorite] = useToggleFavoriteMutation();
  
  const isFollowing = favoritesRes?.data?.some(fav => fav.itemId?._id === id);

  const handleFollowToggle = async () => {
    try {
      const res = await toggleFavorite({ itemId: id, itemType: 'Artist' }).unwrap();
      toast.success(res.message);
    } catch (err) {
      toast.error('Failed to toggle follow');
    }
  };

  const handlePlay = (track, trackList) => {
    if (currentTrack?._id === track._id) {
      dispatch(togglePlayPause());
    } else {
      const audioEl = document.getElementById('nexoria-global-audio');
      if (audioEl) {
        const baseUrl = BACKEND_URL.endsWith('/api') ? BACKEND_URL.slice(0, -4) : BACKEND_URL;
        const newSrc = track.telegramFileId ? `${baseUrl}/api/nexoria-music/stream/${track.telegramFileId}` : track.audioUrl || "";
        audioEl.src = newSrc;
        audioEl.play().catch(err => console.log(err));
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
      <div className="min-h-full bg-[#121212] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#1ed760] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!artist) {
    return (
      <div className="min-h-full bg-[#121212] flex flex-col items-center justify-center text-white pb-32">
        <h2 className="text-3xl font-bold mb-4">Artist not found</h2>
        <button onClick={() => navigate('/nexoria-music/tracks')} className="px-6 py-2 bg-white text-black font-bold rounded-full">
          Browse Music
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-[#121212] text-white">
      {/* Header Banner */}
      <div className="relative h-[40vh] min-h-[340px] flex flex-col justify-end px-6 pb-6 overflow-hidden">
        {artist.image && (
          <div 
            className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${artist.image})` }}
          />
        )}
        <div className="absolute inset-0 z-0 bg-gradient-to-t from-[#121212] via-[#121212]/80 to-transparent" />
        
        <button 
          onClick={() => navigate(-1)}
          className="absolute top-6 left-6 z-10 w-10 h-10 bg-black/40 hover:bg-black/60 rounded-full flex items-center justify-center transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>

        <div className="relative z-10 flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-md">✓</span>
            <span className="text-sm font-bold uppercase tracking-wider">Verified Artist</span>
          </div>
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-white drop-shadow-md truncate max-w-[800px]">
            {artist.name}
          </h1>
          <p className="text-zinc-300 text-sm md:text-base mt-2 font-medium max-w-2xl line-clamp-2">
            {artist.bio || "Explore the popular tracks and albums from this artist."}
          </p>
        </div>
      </div>

      {/* Action Row */}
      <div className="px-6 py-6 flex items-center gap-6 relative z-10">
        <button 
          onClick={() => popularTracks.length > 0 && handlePlay(popularTracks[0], popularTracks)}
          className="w-14 h-14 bg-[#1ed760] rounded-full flex items-center justify-center text-black hover:scale-105 active:scale-95 transition-transform shadow-xl"
          disabled={popularTracks.length === 0}
        >
          {isPlaying && popularTracks.some(t => t._id === currentTrack?._id) ? (
            <Pause className="w-7 h-7 fill-current" />
          ) : (
            <Play className="w-7 h-7 fill-current ml-1" />
          )}
        </button>
        <button 
          onClick={handleFollowToggle}
          className={`px-4 py-1.5 border rounded-full text-sm font-bold transition-colors uppercase tracking-widest ${isFollowing ? 'border-white text-white bg-white/10' : 'border-[#a7a7a7] text-[#a7a7a7] hover:border-white hover:text-white'}`}
        >
          {isFollowing ? 'Following' : 'Follow'}
        </button>
      </div>

      {/* Popular Tracks */}
      {popularTracks.length > 0 && (
        <div className="px-6 mb-12">
          <h2 className="text-2xl font-bold mb-4">Popular</h2>
          <div className="flex flex-col">
            {popularTracks.map((track, idx) => (
              <div 
                key={track._id} 
                className="grid grid-cols-[32px_minmax(120px,_4fr)_minmax(120px,_1fr)] gap-4 px-4 py-2 hover:bg-white/10 group transition-colors rounded-md items-center cursor-pointer text-sm font-medium"
                onClick={() => handlePlay(track, popularTracks)}
              >
                <div className="text-[#a7a7a7] text-right group-hover:hidden">{idx + 1}</div>
                <div className="hidden group-hover:block text-right -ml-1">
                  {currentTrack?._id === track._id && isPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white" />}
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-zinc-800 shrink-0 shadow-md">
                    {(track.coverImage || track.album?.coverImage || artist.image) && (
                      <img src={track.coverImage || track.album?.coverImage || artist.image} alt={track.title} className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div className="flex flex-col truncate">
                    <span className={`truncate text-base ${currentTrack?._id === track._id ? 'text-[#1ed760]' : 'text-white'}`}>{track.title}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-end gap-4 text-[#a7a7a7]">
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
                    <Heart className={`w-5 h-5 ${likedTracks?.includes(track._id) ? 'fill-[#1ed760] text-[#1ed760]' : ''}`} />
                  </button>
                  <span className="w-8 text-right tabular-nums">
                    {track.duration ? `${Math.floor(track.duration / 60)}:${(track.duration % 60).toString().padStart(2, '0')}` : '3:24'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Albums Grid */}
      {albums.length > 0 && (
        <div className="px-6 mb-12">
          <h2 className="text-2xl font-bold mb-4">Discography</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {albums.map((album) => (
              <div 
                key={album._id} 
                className="bg-[#181818] p-4 rounded-md hover:bg-[#282828] transition-all group cursor-pointer flex flex-col gap-3 relative"
                onClick={() => navigate(`/nexoria-music/album/${album._id}`)}
              >
                <div className="w-full aspect-square bg-[#333] shadow-lg overflow-hidden rounded-md relative">
                  {album.coverImage ? (
                    <img src={album.coverImage} alt={album.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#b3b3b3]">
                      <Disc className="w-16 h-16" />
                    </div>
                  )}
                  {/* Play Button Overlay */}
                  <div className="absolute bottom-2 right-2 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                    <button 
                      onClick={(e) => { e.stopPropagation(); navigate(`/nexoria-music/album/${album._id}`); }}
                      className="w-12 h-12 bg-[#1ed760] rounded-full flex items-center justify-center text-black hover:scale-105 active:scale-95 shadow-xl"
                    >
                      <Play className="w-6 h-6 fill-current ml-1" />
                    </button>
                  </div>
                </div>
                <div className="flex flex-col min-w-0">
                  <h3 className="font-bold text-white truncate pb-1">{album.title}</h3>
                  <p className="text-[#a7a7a7] text-sm truncate font-medium">
                    {album.releaseYear || new Date(album.createdAt).getFullYear()} • Album
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <NexoriaMusicAddToPlaylistModal 
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        trackId={selectedTrackId}
      />
    </div>
  );
};

export default NexoriaMusicArtist;
