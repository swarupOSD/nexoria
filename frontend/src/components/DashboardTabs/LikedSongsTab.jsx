import React from 'react';
import { useGetUserFavoritesQuery } from '../../features/api/musicApiSlice';
import { playSong, togglePlayPause } from '../../features/music/musicSlice';
import { useDispatch, useSelector } from 'react-redux';
import { Play, Pause, Music, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

const LikedSongsTab = () => {
  const dispatch = useDispatch();
  const { data, isLoading } = useGetUserFavoritesQuery();
  const { currentSong, isPlaying } = useSelector(state => state.music);

  const songs = data?.data || [];

  if (isLoading) {
    return <div className="p-12 flex justify-center"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>;
  }

  const handlePlaySong = (song) => {
    if (currentSong?._id === song._id) {
      dispatch(togglePlayPause());
    } else {
      dispatch(playSong(song));
    }
  };

  return (
    <div className="bg-white dark:bg-[#0A0A0A] rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100 dark:border-white/5">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-xl bg-rose-500/10 flex items-center justify-center">
          <Heart className="w-6 h-6 text-rose-500" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-slate-800 dark:text-white">Liked Songs</h2>
          <p className="text-slate-500 dark:text-slate-400">Your personal collection of favorite tracks</p>
        </div>
      </div>

      {songs.length === 0 ? (
        <div className="text-center py-16 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-800 border-dashed">
          <Music className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">No liked songs yet</h3>
          <p className="text-slate-500 max-w-md mx-auto mb-6">Discover new music and tap the heart icon to save them to your collection.</p>
          <Link to="/sound" className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl transition-colors">
            Explore Music
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {songs.map(song => (
            <div 
              key={song._id} 
              onClick={() => handlePlaySong(song)}
              className="bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800/80 p-3 rounded-2xl cursor-pointer group transition-all border border-slate-200 dark:border-white/5 hover:border-purple-500/30"
            >
              <div className="relative aspect-square rounded-xl overflow-hidden mb-3 shadow-md">
                <img src={song.image} alt={song.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center shadow-lg shadow-purple-500/40 transform translate-y-2 group-hover:translate-y-0 transition-transform">
                    {currentSong?._id === song._id && isPlaying ? <Pause className="w-5 h-5 text-white" /> : <Play className="w-5 h-5 text-white ml-1" />}
                  </div>
                </div>
              </div>
              <h3 className={`font-bold text-sm truncate ${currentSong?._id === song._id ? 'text-purple-500' : 'text-slate-800 dark:text-white'}`}>
                {song.title}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{song.artist}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LikedSongsTab;
