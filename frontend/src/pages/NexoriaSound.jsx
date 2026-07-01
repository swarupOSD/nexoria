import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import FallbackImage from '../components/FallbackImage';
import { 
  useGetSongsQuery,
  useGetPlaylistsQuery, 
  useGetMusicAnalyticsQuery,
  useGetUserPlaylistsQuery
} from '../features/api/musicApiSlice';
import { playSong, playPlaylist, togglePlayPause } from '../features/music/musicSlice';
import { Play, Pause, Music, Heart, Clock, TrendingUp, Radio, ListMusic, Plus, Mic2 } from 'lucide-react';

const NexoriaSound = () => {
  const dispatch = useDispatch();
  const { currentSong, isPlaying, recentlyPlayed } = useSelector(state => state.music);
  
  // Queries
  const { data: latestRes, isLoading: loadingLatest } = useGetSongsQuery({ limit: 12 });
  const { data: trendingRes, isLoading: loadingTrending } = useGetSongsQuery({ isTrending: true, limit: 10 });
  const { data: playlistsRes, isLoading: loadingPlaylists } = useGetPlaylistsQuery({ limit: 6 });
  const { data: userPlaylistsRes } = useGetUserPlaylistsQuery();

  if (loadingLatest || loadingTrending || loadingPlaylists) return <div className="p-20 flex justify-center"><div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div></div>;

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
    <div className="min-h-screen bg-slate-900 pb-32">
      {/* Hero Header */}
      <div className="relative pt-24 pb-16 px-4 sm:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/40 via-purple-900/20 to-slate-900 z-0"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3"></div>
        
        <div className="relative z-10 max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <Radio className="w-8 h-8 text-purple-400" />
            <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight">Nexoria <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">Sound</span></h1>
          </div>
          <p className="text-lg text-slate-300 max-w-2xl font-medium">
            Immerse yourself in endless audio. Ad-free background streaming, curated playlists, and GenZ vibes.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-12 relative z-10">
        


        {/* Recently Played */}
        {recentlyPlayed.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <Clock className="w-6 h-6 text-purple-400" /> Continue Listening
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {recentlyPlayed.slice(0, 6).map((song, idx) => (
                <div key={song._id} onClick={() => handlePlaySong(song, recentlyPlayed.slice(0, 6), idx)} className="bg-slate-800/40 hover:bg-slate-800 p-3 rounded-2xl cursor-pointer group transition-all border border-white/5 hover:border-purple-500/30">
                  <div className="relative aspect-square rounded-xl overflow-hidden mb-3 shadow-lg">
                    <FallbackImage src={song.image} alt={song.title} fallbackType="music" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center shadow-lg shadow-purple-500/40 transform translate-y-4 group-hover:translate-y-0 transition-transform">
                        {currentSong?._id === song._id && isPlaying ? <Pause className="w-5 h-5 text-white" /> : <Play className="w-5 h-5 text-white ml-1" />}
                      </div>
                    </div>
                  </div>
                  <h3 className="font-bold text-white text-sm truncate">{song.title}</h3>
                  <p className="text-xs text-slate-400 truncate">{song.artist}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Trending Now */}
        {trendingSongs.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-pink-500" /> Trending Hits
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {trendingSongs.map((song, idx) => (
                <div key={song._id} onClick={() => handlePlaySong(song, trendingSongs, idx)} className="flex items-center gap-4 bg-slate-800/40 hover:bg-slate-800 p-2 sm:p-3 rounded-2xl cursor-pointer group transition-all border border-white/5 hover:border-pink-500/30">
                  <div className="w-6 text-center text-slate-500 font-bold">{idx + 1}</div>
                  <div className="relative w-14 h-14 rounded-xl overflow-hidden flex-shrink-0">
                    <FallbackImage src={song.image} alt={song.title} fallbackType="music" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      {currentSong?._id === song._id && isPlaying ? <Pause className="w-5 h-5 text-white" /> : <Play className="w-5 h-5 text-white ml-0.5" />}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className={`font-bold text-sm truncate ${currentSong?._id === song._id ? 'text-pink-400' : 'text-white'}`}>{song.title}</h3>
                    <p className="text-xs text-slate-400 truncate">{song.artist}</p>
                  </div>
                  {song.isYoutube && (
                    <span className="px-2 py-1 bg-red-500/10 text-red-400 text-[10px] font-bold rounded-md uppercase mr-2 border border-red-500/20">YT</span>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Your Custom Playlists */}
        {userPlaylists.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <ListMusic className="w-6 h-6 text-purple-400" /> Your Playlists
              </h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6">
              {userPlaylists.map(playlist => (
                <div key={playlist._id} onClick={() => handlePlayPlaylist(playlist)} className="group cursor-pointer">
                  <div className="relative aspect-square rounded-2xl overflow-hidden mb-3 shadow-lg border border-white/10 group-hover:border-purple-500/50 transition-colors">
                    <FallbackImage src={playlist.image} alt={playlist.name} fallbackType="music" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                      <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition-transform">
                        <Play className="w-6 h-6 text-white ml-1" />
                      </div>
                    </div>
                  </div>
                  <h3 className="font-bold text-white text-sm truncate group-hover:text-purple-400 transition-colors">{playlist.name}</h3>
                  <p className="text-xs text-slate-400 truncate">{playlist.songs?.length || 0} tracks</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Curated Playlists */}
        {playlists.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold text-white mb-6">Curated Playlists</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {playlists.map(playlist => (
                <div key={playlist._id} onClick={() => handlePlayPlaylist(playlist)} className="bg-slate-800/40 hover:bg-slate-800 rounded-3xl p-4 cursor-pointer group transition-all border border-white/5 hover:border-purple-500/30 overflow-hidden relative">
                  <div className="flex gap-4">
                    <div className="w-24 h-24 rounded-2xl overflow-hidden shadow-lg flex-shrink-0">
                      <FallbackImage src={playlist.image} alt={playlist.name} fallbackType="music" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    </div>
                    <div className="flex flex-col justify-center flex-1 min-w-0">
                      <h3 className="font-bold text-white text-lg truncate mb-1">{playlist.name}</h3>
                      <p className="text-sm text-slate-400 line-clamp-2">{playlist.description || `${playlist.songs?.length || 0} tracks`}</p>
                    </div>
                  </div>
                  <div className="absolute bottom-4 right-4 w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center shadow-lg shadow-purple-500/40 opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all">
                    <Play className="w-5 h-5 text-white ml-1" />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Fresh Drops */}
        <section>
          <h2 className="text-2xl font-bold text-white mb-6">Fresh Drops</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6">
            {latestSongs.map((song, idx) => (
              <div key={song._id} onClick={() => handlePlaySong(song, latestSongs, idx)} className="group cursor-pointer">
                <div className="relative aspect-square rounded-2xl overflow-hidden mb-3 shadow-lg">
                  <FallbackImage src={song.image} alt={song.title} fallbackType="music" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center border border-white/50 backdrop-blur-md transform scale-90 group-hover:scale-100 transition-transform">
                      {currentSong?._id === song._id && isPlaying ? <Pause className="w-6 h-6 text-white" /> : <Play className="w-6 h-6 text-white ml-1" />}
                    </div>
                  </div>
                </div>
                <h3 className="font-bold text-white text-sm truncate group-hover:text-purple-400 transition-colors">{song.title}</h3>
                <p className="text-xs text-slate-400 truncate">{song.artist}</p>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
};

export default NexoriaSound;
