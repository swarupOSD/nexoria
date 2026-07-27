import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import FallbackImage from '../components/FallbackImage';
import { 
  useGetSongsQuery,
  useGetPlaylistsQuery, 
  useGetMusicAnalyticsQuery,
  useGetUserPlaylistsQuery
} from '../features/api/musicApiSlice';
import { playSong, playPlaylist, togglePlayPause, removeFromRecentlyPlayed } from '../features/music/musicSlice';
import { Play, Pause, Music, Heart, Clock, TrendingUp, Radio, ListMusic, Plus, Mic2, Search, X, ArrowLeft } from 'lucide-react';

const NexoriaSound = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentSong, isPlaying, recentlyPlayed } = useSelector(state => state.music);
  
  // Queries
  const { data: latestRes, isLoading: loadingLatest } = useGetSongsQuery({ limit: 12 });
  const { data: trendingRes, isLoading: loadingTrending } = useGetSongsQuery({ isTrending: true, limit: 10 });
  const { data: playlistsRes, isLoading: loadingPlaylists } = useGetPlaylistsQuery({ limit: 6 });
  const { data: userPlaylistsRes } = useGetUserPlaylistsQuery();

  if (loadingLatest || loadingTrending || loadingPlaylists) return <div className="p-20 flex justify-center bg-slate-900 min-h-screen"><div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div></div>;

  const latestSongs = latestRes?.data || [];
  const trendingSongs = trendingRes?.data || [];
  const playlists = playlistsRes?.data || [];
  const userPlaylists = userPlaylistsRes?.data || [];

  const handlePlaySong = (song, contextArray = [], index = 0) => {
    if (currentSong?._id === song._id) {
      dispatch(togglePlayPause());
    } else {
      if (contextArray.length > 0) {
        dispatch(playPlaylist({ songs: contextArray, startIndex: index }));
      } else {
        dispatch(playSong(song));
      }
    }
  };

  const handlePlayPlaylist = (playlist) => {
    if (playlist.songs && playlist.songs.length > 0) {
      dispatch(playPlaylist({ songs: playlist.songs, startIndex: 0 }));
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 pb-24 md:pb-32 font-jakarta">
      {/* 📱 MOBILE EXCLUSIVE: STICKY HEADER */}
      <div className="md:hidden sticky top-0 z-50 bg-slate-900/90 backdrop-blur-3xl border-b border-white/5 pt-4 pb-3 px-4 shadow-2xl mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-all active:scale-95 border border-white/5">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-black text-white leading-tight tracking-tight">Classic Sound</h1>
              <p className="text-[9px] font-bold uppercase tracking-widest text-purple-400/80">Ad-Free Music</p>
            </div>
          </div>
          <Link to="/sound/search" className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center border border-purple-500/20 active:scale-95 transition-transform">
            <Search className="w-5 h-5 text-purple-400" />
          </Link>
        </div>
      </div>

      {/* 💻 DESKTOP EXCLUSIVE: HERO HEADER */}
      <div className="hidden md:block relative pt-24 pb-16 px-4 sm:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/40 via-purple-900/20 to-slate-900 z-0"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3"></div>
        
        <div className="relative z-10 max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <Radio className="w-8 h-8 text-purple-400" />
            <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight">Nexoria <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">Sound</span></h1>
          </div>
          <p className="text-lg text-slate-300 max-w-2xl font-medium mb-8">
            Immerse yourself in endless audio. Ad-free background streaming, curated playlists, and GenZ vibes.
          </p>

          <Link to="/sound/search" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white hover:bg-slate-100 text-black rounded-full font-bold transition-all shadow-xl hover:scale-105 active:scale-95">
            <Search className="w-5 h-5" />
            Global Search
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 md:px-8 space-y-8 md:space-y-12 relative z-10">
        
        {/* Recently Played */}
        {recentlyPlayed.length > 0 && (
          <section>
            <h2 className="text-lg md:text-2xl font-bold text-white mb-3 md:mb-6 flex items-center gap-1.5 md:gap-2 px-1 md:px-0">
              <Clock className="w-4 h-4 md:w-6 md:h-6 text-purple-400" /> Continue Listening
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
              {recentlyPlayed.slice(0, 6).map((song, idx) => (
                <div key={song._id} onClick={() => handlePlaySong(song, recentlyPlayed.slice(0, 6), idx)} className="bg-slate-800/40 hover:bg-slate-800 p-2.5 md:p-3 rounded-xl md:rounded-2xl cursor-pointer group transition-all border border-white/5 hover:border-purple-500/30 relative active:scale-[0.98] md:active:scale-100">
                  {/* Remove Button */}
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      dispatch(removeFromRecentlyPlayed(song._id));
                    }}
                    className="absolute top-1.5 right-1.5 md:top-2 md:right-2 z-20 p-1 md:p-1.5 bg-black/60 hover:bg-red-500 rounded-full text-white opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all duration-300"
                    title="Remove from history"
                  >
                    <X className="w-3 h-3 md:w-3.5 md:h-3.5" />
                  </button>
                  
                  <div className="relative aspect-square rounded-lg md:rounded-xl overflow-hidden mb-2 md:mb-3 shadow-lg">
                    <FallbackImage src={song.image} alt={song.title} fallbackType="music" className="w-full h-full object-cover md:group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="w-8 h-8 md:w-10 md:h-10 bg-purple-500 rounded-full flex items-center justify-center shadow-lg shadow-purple-500/40 transform md:translate-y-4 md:group-hover:translate-y-0 transition-transform">
                        {currentSong?._id === song._id && isPlaying ? <Pause className="w-4 h-4 md:w-5 md:h-5 text-white" /> : <Play className="w-4 h-4 md:w-5 md:h-5 text-white ml-1" />}
                      </div>
                    </div>
                  </div>
                  <h3 className="font-bold text-white text-[12px] md:text-sm truncate">{song.title}</h3>
                  <p className="text-[10px] md:text-xs text-slate-400 truncate">{song.artist}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Trending Now */}
        {trendingSongs.length > 0 && (
          <section>
            <h2 className="text-lg md:text-2xl font-bold text-white mb-3 md:mb-6 flex items-center gap-1.5 md:gap-2 px-1 md:px-0">
              <TrendingUp className="w-4 h-4 md:w-6 md:h-6 text-pink-500" /> Trending Hits
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-4">
              {trendingSongs.map((song, idx) => (
                <div key={song._id} onClick={() => handlePlaySong(song, trendingSongs, idx)} className="flex items-center gap-2.5 md:gap-4 bg-slate-800/40 hover:bg-slate-800 p-1.5 md:p-3 rounded-xl md:rounded-2xl cursor-pointer group transition-all border border-white/5 hover:border-pink-500/30 active:scale-[0.98] md:active:scale-100">
                  <div className="w-5 md:w-6 text-center text-slate-500 font-bold text-xs md:text-base">{idx + 1}</div>
                  <div className="relative w-10 h-10 md:w-14 md:h-14 rounded-lg md:rounded-xl overflow-hidden flex-shrink-0">
                    <FallbackImage src={song.image} alt={song.title} fallbackType="music" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      {currentSong?._id === song._id && isPlaying ? <Pause className="w-4 h-4 md:w-5 md:h-5 text-white" /> : <Play className="w-4 h-4 md:w-5 md:h-5 text-white ml-0.5" />}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0 py-1">
                    <h3 className={`font-bold text-[13px] md:text-sm truncate leading-tight mb-0.5 ${currentSong?._id === song._id ? 'text-pink-400' : 'text-white'}`}>{song.title}</h3>
                    <p className="text-[10px] md:text-xs text-slate-400 truncate leading-tight">{song.artist}</p>
                  </div>
                  {song.isYoutube && (
                    <span className="px-1.5 py-0.5 md:px-2 md:py-1 bg-red-500/10 text-red-400 text-[8px] md:text-[10px] font-bold rounded md:rounded-md uppercase mr-2 border border-red-500/20">YT</span>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Your Custom Playlists */}
        {userPlaylists.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-3 md:mb-6 px-1 md:px-0">
              <h2 className="text-lg md:text-2xl font-bold text-white flex items-center gap-1.5 md:gap-2">
                <ListMusic className="w-4 h-4 md:w-6 md:h-6 text-purple-400" /> Your Playlists
              </h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-6">
              {userPlaylists.map(playlist => (
                <div key={playlist._id} onClick={() => handlePlayPlaylist(playlist)} className="group cursor-pointer active:scale-[0.98] md:active:scale-100 transition-transform">
                  <div className="relative aspect-square rounded-xl md:rounded-2xl overflow-hidden mb-2 md:mb-3 shadow-lg border border-white/10 group-hover:border-purple-500/50 transition-colors">
                    <FallbackImage src={playlist.image} alt={playlist.name} fallbackType="music" className="w-full h-full object-cover md:group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 md:group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                      <div className="w-10 h-10 md:w-12 md:h-12 bg-purple-500 rounded-full flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition-transform">
                        <Play className="w-5 h-5 md:w-6 md:h-6 text-white ml-1" />
                      </div>
                    </div>
                  </div>
                  <h3 className="font-bold text-white text-[12px] md:text-sm truncate group-hover:text-purple-400 transition-colors">{playlist.name}</h3>
                  <p className="text-[10px] md:text-xs text-slate-400 truncate">{playlist.songs?.length || 0} tracks</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Curated Playlists */}
        {playlists.length > 0 && (
          <section>
            <h2 className="text-lg md:text-2xl font-bold text-white mb-3 md:mb-6 px-1 md:px-0">Curated Playlists</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-6">
              {playlists.map(playlist => (
                <div key={playlist._id} onClick={() => handlePlayPlaylist(playlist)} className="bg-slate-800/40 hover:bg-slate-800 rounded-xl md:rounded-3xl p-2.5 md:p-4 cursor-pointer group transition-all border border-white/5 hover:border-purple-500/30 overflow-hidden relative active:scale-[0.98] md:active:scale-100">
                  <div className="flex gap-3 md:gap-4">
                    <div className="w-16 h-16 md:w-24 md:h-24 rounded-lg md:rounded-2xl overflow-hidden shadow-lg flex-shrink-0">
                      <FallbackImage src={playlist.image} alt={playlist.name} fallbackType="music" className="w-full h-full object-cover md:group-hover:scale-110 transition-transform duration-500" />
                    </div>
                    <div className="flex flex-col justify-center flex-1 min-w-0 py-1">
                      <h3 className="font-bold text-white text-sm md:text-lg truncate mb-0.5 md:mb-1">{playlist.name}</h3>
                      <p className="text-[11px] md:text-sm text-slate-400 line-clamp-2 leading-tight md:leading-normal">{playlist.description || `${playlist.songs?.length || 0} tracks`}</p>
                    </div>
                  </div>
                  <div className="absolute bottom-2.5 right-2.5 md:bottom-4 md:right-4 w-8 h-8 md:w-10 md:h-10 bg-purple-500 rounded-full flex items-center justify-center shadow-lg shadow-purple-500/40 opacity-100 md:opacity-0 md:group-hover:opacity-100 transform md:translate-y-4 md:group-hover:translate-y-0 transition-all">
                    <Play className="w-4 h-4 md:w-5 md:h-5 text-white ml-0.5 md:ml-1" />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Fresh Drops */}
        <section>
          <h2 className="text-lg md:text-2xl font-bold text-white mb-3 md:mb-6 px-1 md:px-0">Fresh Drops</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-6">
            {latestSongs.map((song, idx) => (
              <div key={song._id} onClick={() => handlePlaySong(song, latestSongs, idx)} className="group cursor-pointer active:scale-[0.98] md:active:scale-100 transition-transform">
                <div className="relative aspect-square rounded-xl md:rounded-2xl overflow-hidden mb-2 md:mb-3 shadow-lg">
                  <FallbackImage src={song.image} alt={song.title} fallbackType="music" className="w-full h-full object-cover md:group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 md:group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-white/20 rounded-full flex items-center justify-center border border-white/50 backdrop-blur-md transform scale-90 group-hover:scale-100 transition-transform">
                      {currentSong?._id === song._id && isPlaying ? <Pause className="w-5 h-5 md:w-6 md:h-6 text-white" /> : <Play className="w-5 h-5 md:w-6 md:h-6 text-white ml-1" />}
                    </div>
                  </div>
                </div>
                <h3 className="font-bold text-white text-[12px] md:text-sm truncate group-hover:text-purple-400 transition-colors">{song.title}</h3>
                <p className="text-[10px] md:text-xs text-slate-400 truncate">{song.artist}</p>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
};

export default NexoriaSound;
