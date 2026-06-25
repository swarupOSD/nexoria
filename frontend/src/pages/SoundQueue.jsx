import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { Play, Trash2, SkipForward, ArrowLeft, ListVideo } from 'lucide-react';
import { 
  playSong, 
  removeFromQueue, 
  clearQueue,
  playNext
} from '../features/music/musicSlice';

const SoundQueue = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { queue, currentSong } = useSelector(state => state.music);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0F172A] pb-32 pt-20 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-slate-800 dark:text-white" />
          </button>
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white">Playing Queue</h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">
              {queue.length} {queue.length === 1 ? 'song' : 'songs'} in queue
            </p>
          </div>
        </div>

        {currentSong && (
          <div className="mb-10 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
            <h2 className="text-sm font-bold text-purple-500 uppercase tracking-wider mb-4">Now Playing</h2>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden shadow-lg relative group">
                <img 
                  src={currentSong.image} 
                  alt={currentSong.title} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <div className="flex gap-1 items-end h-6">
                    <div className="w-1.5 bg-white animate-music-bar-1 rounded-t-sm"></div>
                    <div className="w-1.5 bg-white animate-music-bar-2 rounded-t-sm"></div>
                    <div className="w-1.5 bg-white animate-music-bar-3 rounded-t-sm"></div>
                  </div>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white truncate">
                  {currentSong.title}
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm truncate mt-1">
                  {currentSong.artist}
                </p>
              </div>
              <button 
                onClick={() => dispatch(playNext())}
                className="p-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-full hover:bg-purple-100 dark:hover:bg-purple-500/20 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                title="Skip to next"
              >
                <SkipForward className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {queue.length > 0 ? (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Up Next</h2>
              <button 
                onClick={() => dispatch(clearQueue())}
                className="text-sm font-medium text-rose-500 hover:text-rose-600 transition-colors"
              >
                Clear Queue
              </button>
            </div>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
              {queue.map((song, index) => (
                <div 
                  key={song._id + index} 
                  className="flex items-center gap-4 p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border-b border-slate-100 dark:border-slate-800 last:border-0 group"
                >
                  <span className="w-6 text-center text-slate-400 font-medium">{index + 1}</span>
                  <div className="w-12 h-12 rounded-lg overflow-hidden relative cursor-pointer" onClick={() => dispatch(playSong(song))}>
                    <img src={song.image} alt={song.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                      <Play className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0 cursor-pointer" onClick={() => dispatch(playSong(song))}>
                    <h4 className="font-bold text-slate-900 dark:text-white truncate group-hover:text-purple-500 transition-colors">
                      {song.title}
                    </h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
                      {song.artist}
                    </p>
                  </div>
                  <button 
                    onClick={() => dispatch(removeFromQueue(song._id))}
                    className="p-2 text-slate-400 opacity-0 group-hover:opacity-100 hover:text-rose-500 transition-all"
                    title="Remove from queue"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-20 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
            <div className="w-20 h-20 mx-auto bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
              <ListVideo className="w-10 h-10 text-slate-400" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Queue is Empty</h3>
            <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-8">
              Add some songs to your queue to keep the music playing without interruption.
            </p>
            <Link 
              to="/sound" 
              className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-xl transition-colors shadow-lg shadow-purple-500/20"
            >
              Explore Music
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default SoundQueue;
