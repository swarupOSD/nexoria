import React, { useState } from 'react';
import { useGetUserMusicAnalyticsQuery } from '../../features/api/musicApiSlice';
import { Headphones, Play, Heart, Clock, Loader2, Music } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { playSong } from '../../features/music/musicSlice';
import WrappedModal from '../WrappedModal';

const MusicAnalyticsTab = () => {
  const { data, isLoading } = useGetUserMusicAnalyticsQuery();
  const dispatch = useDispatch();
  const [isWrappedOpen, setIsWrappedOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="w-10 h-10 animate-spin text-purple-500" />
      </div>
    );
  }

  const analytics = data?.data;

  if (!analytics) return null;

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none">
          <Headphones className="w-64 h-64 rotate-12" />
        </div>
        <div className="relative z-10">
          <h2 className="text-3xl font-black mb-2">Your Sound Wrapped</h2>
          <p className="text-purple-100 font-medium max-w-lg mb-8">
            Here's a look back at your listening history and favorite tracks. Keep the music playing!
          </p>
          
          <div className="grid grid-cols-2 gap-6 max-w-xl">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <Clock className="w-8 h-8 text-purple-300 mb-3" />
              <div className="text-3xl font-black">{analytics.totalMinutes}</div>
              <div className="text-purple-200 text-sm font-medium">Minutes Listened</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <Play className="w-8 h-8 text-purple-300 mb-3" />
              <div className="text-3xl font-black">{analytics.totalStreams}</div>
              <div className="text-purple-200 text-sm font-medium">Total Streams</div>
            </div>
          </div>
        </div>
      </div>

      <WrappedModal 
        isOpen={isWrappedOpen} 
        onClose={() => setIsWrappedOpen(false)} 
        data={analytics} 
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Played */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 lg:p-8 shadow-sm border border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-purple-100 dark:bg-purple-500/20 rounded-xl text-purple-600 dark:text-purple-400">
              <Play className="w-6 h-6 fill-current" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Your Top Songs</h3>
          </div>
          
          <div className="space-y-4">
            {analytics.topSongs?.length > 0 ? analytics.topSongs.map((song, index) => (
              <div 
                key={song._id} 
                className="flex items-center gap-4 group p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-2xl transition-colors cursor-pointer"
                onClick={() => dispatch(playSong(song))}
              >
                <div className="w-8 font-black text-slate-300 dark:text-slate-700 text-xl text-center group-hover:text-purple-500 transition-colors">
                  {index + 1}
                </div>
                <img src={song.image} alt={song.title} className="w-14 h-14 rounded-xl object-cover shadow-md" />
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-slate-900 dark:text-white truncate group-hover:text-purple-500 transition-colors">{song.title}</h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{song.artist}</p>
                </div>
                <div className="text-xs font-bold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
                  {song.listenCount} plays
                </div>
              </div>
            )) : (
              <p className="text-slate-500 text-center py-10">Start listening to some music to see your top songs!</p>
            )}
          </div>
        </div>

        {/* Most Loved */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 lg:p-8 shadow-sm border border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-rose-100 dark:bg-rose-500/20 rounded-xl text-rose-600 dark:text-rose-400">
              <Heart className="w-6 h-6 fill-current" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Most Loved</h3>
          </div>
          
          <div className="space-y-4">
            {analytics.lovedSongs?.length > 0 ? analytics.lovedSongs.slice(0, 5).map((song, index) => (
              <div 
                key={song._id} 
                className="flex items-center gap-4 group p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-2xl transition-colors cursor-pointer"
                onClick={() => dispatch(playSong(song))}
              >
                <img src={song.image} alt={song.title} className="w-14 h-14 rounded-xl object-cover shadow-md" />
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-slate-900 dark:text-white truncate group-hover:text-rose-500 transition-colors">{song.title}</h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{song.artist}</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Play className="w-4 h-4 text-slate-600 dark:text-slate-300 fill-current" />
                </div>
              </div>
            )) : (
              <p className="text-slate-500 text-center py-10">You haven't favorited any songs yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MusicAnalyticsTab;
