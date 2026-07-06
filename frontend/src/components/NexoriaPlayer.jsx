import React, { useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, 
  Repeat, Repeat1, Shuffle, Heart, X, ListMusic, Maximize2 
} from 'lucide-react';
import { 
  playNextTrack, playPrevTrack, togglePlayPause, 
  updateTime, setVolume, toggleMute, 
  toggleRepeat, toggleShuffle, toggleLikeTrack, clearPlayer
} from '../features/music/nexoriaMusicSlice';
import { BACKEND_URL } from '../features/api/apiSlice';

const NexoriaPlayer = () => {
  const dispatch = useDispatch();
  const audioRef = useRef(null);
  
  const { 
    currentTrack, isPlaying, volume, isMuted, 
    repeatMode, shuffleMode, currentTime, duration,
    likedTracks
  } = useSelector(state => state.nexoriaMusic);

  // Sync state to audio element for play/pause toggling
  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch(error => {
             console.log("Autoplay prevented or interrupted:", error);
          });
        }
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying]); // Removed currentTrack so it doesn't interrupt loading

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // Set up MediaSession API for background playback and lock-screen controls
  useEffect(() => {
    if ('mediaSession' in navigator && currentTrack) {
      navigator.mediaSession.metadata = new window.MediaMetadata({
        title: currentTrack.title || 'Unknown Title',
        artist: currentTrack.artist?.name || 'Unknown Artist',
        album: currentTrack.album?.title || 'Unknown Album',
        artwork: [
          { src: currentTrack.coverImage || currentTrack.album?.coverImage || currentTrack.artist?.image || '', sizes: '512x512', type: 'image/jpeg' }
        ]
      });

      navigator.mediaSession.setActionHandler('play', () => {
        dispatch(togglePlayPause());
        if (audioRef.current) audioRef.current.play().catch(e => console.log(e));
      });
      navigator.mediaSession.setActionHandler('pause', () => {
        dispatch(togglePlayPause());
        if (audioRef.current) audioRef.current.pause();
      });
      navigator.mediaSession.setActionHandler('previoustrack', () => dispatch(playPrevTrack()));
      navigator.mediaSession.setActionHandler('nexttrack', () => dispatch(playNextTrack()));
      navigator.mediaSession.setActionHandler('seekto', (details) => {
        if (audioRef.current && details.fastSeek && ('fastSeek' in audioRef.current)) {
          audioRef.current.fastSeek(details.seekTime);
        } else if (audioRef.current) {
          audioRef.current.currentTime = details.seekTime;
        }
      });
    }
  }, [currentTrack, dispatch]);

  // Audio element event handlers
  const handleTimeUpdate = () => {
    if (audioRef.current) {
      dispatch(updateTime({
        currentTime: audioRef.current.currentTime,
        duration: audioRef.current.duration || 0
      }));
    }
  };

  const handleEnded = () => {
    if (repeatMode === 'one') {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play();
      }
    } else {
      dispatch(playNextTrack());
    }
  };

  const handleProgressClick = (e) => {
    if (audioRef.current && duration) {
      const rect = e.currentTarget.getBoundingClientRect();
      const pos = (e.clientX - rect.left) / rect.width;
      audioRef.current.currentTime = pos * duration;
    }
  };

  const formatTime = (timeInSeconds) => {
    if (!timeInSeconds || isNaN(timeInSeconds)) return "0:00";
    const m = Math.floor(timeInSeconds / 60);
    const s = Math.floor(timeInSeconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const baseUrl = BACKEND_URL.endsWith('/api') ? BACKEND_URL.slice(0, -4) : BACKEND_URL;
  const audioSource = currentTrack?.telegramFileId 
    ? `${baseUrl}/api/nexoria-music/stream/${currentTrack.telegramFileId}`
    : currentTrack?.audioUrl || "";

  return (
    <>
      {/* Hidden Audio Element */}
      <audio
        id="nexoria-global-audio"
        ref={audioRef}
        src={audioSource}
        autoPlay={isPlaying}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        onLoadedMetadata={handleTimeUpdate}
        onCanPlay={() => {
          if (isPlaying && audioRef.current && audioRef.current.paused) {
            audioRef.current.play().catch(e => console.log('Playback error:', e));
          }
        }}
        onError={(e) => {
          console.error("Audio Element Error:", e.target.error);
          if (e.target.error) {
             const errorCodes = {
               1: "MEDIA_ERR_ABORTED",
               2: "MEDIA_ERR_NETWORK",
               3: "MEDIA_ERR_DECODE",
               4: "MEDIA_ERR_SRC_NOT_SUPPORTED"
             };
             console.error("Error Code:", errorCodes[e.target.error.code] || "UNKNOWN");
          }
        }}
      />

      {/* Fixed Bottom Player UI */}
      <AnimatePresence>
        {currentTrack && (
          <motion.div 
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed bottom-[72px] lg:bottom-0 left-0 right-0 z-[100] px-2 sm:px-4 pb-2 sm:pb-4 pointer-events-none"
        >
          <div className="mx-auto max-w-7xl bg-[#111111]/90 backdrop-blur-2xl border border-white/10 rounded-2xl sm:rounded-[32px] p-2 sm:p-4 flex flex-col sm:flex-row items-center gap-4 sm:gap-6 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.5)] pointer-events-auto">
            
            {/* Top Progress Bar for Mobile (Hidden on Desktop) */}
            <div className="w-full flex items-center gap-2 sm:hidden px-2 pt-1">
              <span className="text-[10px] text-slate-400 w-8">{formatTime(currentTime)}</span>
              <div 
                className="flex-1 h-1 bg-white/10 rounded-full cursor-pointer relative"
                onClick={handleProgressClick}
              >
                <div 
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full shadow-[0_0_10px_rgba(168,85,247,0.5)]"
                  style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
                />
              </div>
              <span className="text-[10px] text-slate-400 w-8 text-right">{formatTime(duration)}</span>
            </div>

            {/* Left: Track Info */}
            <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-[30%] min-w-0 px-2 sm:px-0">
              <div className="relative w-12 h-12 sm:w-16 sm:h-16 rounded-xl overflow-hidden shrink-0 shadow-lg">
                {currentTrack.coverImage || currentTrack.album?.coverImage || currentTrack.artist?.image ? (
                  <img src={currentTrack.coverImage || currentTrack.album?.coverImage || currentTrack.artist?.image} alt={currentTrack.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-purple-900 to-black" />
                )}
                {isPlaying && (
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center gap-0.5">
                    <span className="w-1 h-3 bg-white animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-1 h-4 bg-white animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-1 h-2 bg-white animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-white truncate text-sm sm:text-base">{currentTrack.title}</h4>
                <p className="text-xs sm:text-sm text-slate-400 truncate">{currentTrack.artist?.name || 'Unknown Artist'}</p>
              </div>
              {/* Mobile Actions: Like, Queue, Close */}
              <div className="flex items-center gap-1 sm:hidden">
                <button 
                  className="text-slate-400 hover:text-white transition-colors p-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    dispatch(toggleLikeTrack(currentTrack._id));
                  }}
                >
                  <Heart className={`w-5 h-5 ${likedTracks?.includes(currentTrack._id) ? 'fill-pink-500 text-pink-500 drop-shadow-[0_0_8px_rgba(236,72,153,0.5)]' : ''}`} />
                </button>
                <button className="text-slate-400 hover:text-white transition-colors p-2">
                  <ListMusic className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => dispatch(clearPlayer())}
                  className="text-slate-400 hover:text-red-500 transition-colors p-2"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Center: Controls & Desktop Progress */}
            <div className="flex-1 flex flex-col items-center gap-1 sm:gap-2 w-full">
              <div className="flex items-center justify-center gap-4 sm:gap-6">
                <button 
                  onClick={() => dispatch(toggleShuffle())}
                  className={`hidden sm:block p-2 rounded-full transition-colors ${shuffleMode ? 'text-purple-400 bg-purple-500/10' : 'text-slate-400 hover:text-white'}`}
                >
                  <Shuffle className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
                <button 
                  onClick={() => dispatch(playPrevTrack())}
                  className="p-2 text-slate-300 hover:text-white transition-colors"
                >
                  <SkipBack className="w-6 h-6 sm:w-7 sm:h-7 fill-current" />
                </button>
                <button
                  className="w-12 h-12 flex items-center justify-center bg-white text-black rounded-full hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)]"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!isPlaying && audioRef.current) {
                      audioRef.current.play().catch(err => console.log(err));
                    }
                    dispatch(togglePlayPause());
                  }}
                >
                  {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-1" />}
                </button>
                <button 
                  onClick={() => dispatch(playNextTrack())}
                  className="p-2 text-slate-300 hover:text-white transition-colors"
                >
                  <SkipForward className="w-6 h-6 sm:w-7 sm:h-7 fill-current" />
                </button>
                <button 
                  onClick={() => dispatch(toggleRepeat())}
                  className={`hidden sm:block p-2 rounded-full transition-colors ${repeatMode !== 'none' ? 'text-purple-400 bg-purple-500/10' : 'text-slate-400 hover:text-white'}`}
                >
                  {repeatMode === 'one' ? <Repeat1 className="w-4 h-4 sm:w-5 sm:h-5" /> : <Repeat className="w-4 h-4 sm:w-5 sm:h-5" />}
                </button>
              </div>

              {/* Desktop Progress Bar */}
              <div className="hidden sm:flex w-full max-w-xl items-center gap-3">
                <span className="text-xs font-medium text-slate-400 w-10 text-right">{formatTime(currentTime)}</span>
                <div 
                  className="flex-1 h-1.5 bg-white/10 hover:bg-white/20 rounded-full cursor-pointer relative group transition-colors"
                  onClick={handleProgressClick}
                >
                  <div 
                    className="absolute top-0 left-0 h-full bg-white group-hover:bg-purple-400 rounded-full transition-colors"
                    style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
                  >
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 shadow-md transform translate-x-1/2 transition-opacity" />
                  </div>
                </div>
                <span className="text-xs font-medium text-slate-400 w-10">{formatTime(duration)}</span>
              </div>
            </div>

            {/* Right: Volume & Extras */}
            <div className="hidden sm:flex items-center justify-end gap-4 w-[30%] min-w-0">
              {/* Desktop controls: Volume, Like, Menu */}
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => dispatch(toggleLikeTrack(currentTrack._id))}
                  className="p-2 transition-colors hidden sm:block"
                >
                  <Heart className={`w-5 h-5 ${likedTracks?.includes(currentTrack._id) ? 'fill-pink-500 text-pink-500' : 'text-slate-400 hover:text-white'}`} />
                </button>
                <button className="text-slate-400 hover:text-white transition-colors p-2 hidden sm:block">
                  <ListMusic className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => dispatch(clearPlayer())}
                  className="text-slate-400 hover:text-red-500 transition-colors p-2"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="flex items-center gap-2 group w-32">
                <button onClick={() => dispatch(toggleMute())} className="text-slate-400 hover:text-white transition-colors">
                  {isMuted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </button>
                <div 
                  className="flex-1 h-1 bg-white/10 rounded-full cursor-pointer relative"
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                    dispatch(setVolume(pos));
                  }}
                >
                  <div 
                    className="absolute top-0 left-0 h-full bg-slate-300 group-hover:bg-purple-400 rounded-full transition-colors"
                    style={{ width: `${isMuted ? 0 : volume * 100}%` }}
                  >
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-white rounded-full opacity-0 group-hover:opacity-100 shadow-md transform translate-x-1/2 transition-opacity" />
                  </div>
                </div>
              </div>

              <button className="text-slate-400 hover:text-white transition-colors ml-2">
                <Maximize2 className="w-5 h-5" />
              </button>
            </div>

          </div>
        </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default NexoriaPlayer;
