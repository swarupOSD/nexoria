import React, { useRef, useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, 
  Repeat, Repeat1, Shuffle, Heart, X, ListMusic, Maximize2, MoreVertical, Link2, Download, ChevronDown, Mic2, Infinity, Sliders,
  RotateCcw, RotateCw, Share2, Moon
} from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  playNextTrack, playPrevTrack, togglePlayPause, 
  updateTime, setVolume, toggleMute, 
  toggleRepeat, toggleShuffle, toggleLikeTrack, clearPlayer, addToQueue, playTrack, setQueue, toggleAutoplay
} from '../features/music/nexoriaMusicSlice';
import { BACKEND_URL } from '../features/api/apiSlice';
import { useLogPlayMutation, useLazyGetMusicRecommendationsQuery } from '../features/api/nexoriaMusicApiSlice';
import DropdownMenu from './DropdownMenu';
import toast from 'react-hot-toast';
import NexoriaMusicContextMenu from './NexoriaMusicContextMenu';
import NexoriaMusicAddToPlaylistModal from './NexoriaMusicAddToPlaylistModal';
import EqualizerModal from './EqualizerModal';
import SleepTimerModal from './SleepTimerModal';
import NexoriaMusicShareModal from './NexoriaMusicShareModal';
import NexoriaAudioVisualizer from './NexoriaAudioVisualizer';
import { getBlobUrlForTrack } from '../utils/offlineManager';

const NexoriaPlayer = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const audioRef = useRef(null);
  const [isExpanded, setIsExpanded] = useState(false);
  
  const [contextMenu, setContextMenu] = useState({ isOpen: false, x: 0, y: 0 });
  const [playlistModalOpen, setPlaylistModalOpen] = useState(false);
  const [eqModalOpen, setEqModalOpen] = useState(false);
  const [sleepTimerModalOpen, setSleepTimerModalOpen] = useState(false);
  const [sleepTimer, setSleepTimer] = useState(null); // null, 'track', or number (minutes)
  const sleepTimerRef = useRef(null);
  const [audioContextSetup, setAudioContextSetup] = useState(false);
  const [shareModalData, setShareModalData] = useState({ isOpen: false, track: null });

  useEffect(() => {
    const handleOpenShare = (e) => {
      setShareModalData({ isOpen: true, track: e.detail });
    };
    window.addEventListener('open-share-modal', handleOpenShare);
    return () => window.removeEventListener('open-share-modal', handleOpenShare);
  }, []);
  
  const handleMoreClick = (e) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    setContextMenu({ isOpen: true, x: rect.left, y: rect.bottom });
  };
  
  const { 
    currentTrack, isPlaying, volume, isMuted, 
    repeatMode, shuffleMode, currentTime, duration,
    likedTracks, queue, history, autoplayEnabled, downloadedTracks,
    crossfadeEnabled, crossfadeDuration
  } = useSelector(state => state.nexoriaMusic);

  const [logPlay] = useLogPlayMutation();
  const [getRecommendations] = useLazyGetMusicRecommendationsQuery();
  const [hasLoggedPlay, setHasLoggedPlay] = useState(false);

  // Reset logged play state when track changes
  useEffect(() => {
    setHasLoggedPlay(false);
  }, [currentTrack?._id]);

  const blobUrlsRef = useRef({});
  const [activeAudioSrc, setActiveAudioSrc] = useState("");

  // Pre-resolve blob URLs for current track and next few tracks in queue
  useEffect(() => {
    const resolveBlobs = async () => {
      const tracksToResolve = [];
      if (currentTrack) tracksToResolve.push(currentTrack);
      if (queue.length > 0) tracksToResolve.push(...queue.slice(0, 3));
      
      for (const track of tracksToResolve) {
        if (!blobUrlsRef.current[track._id] && downloadedTracks.includes(track._id)) {
          const baseUrl = BACKEND_URL.endsWith('/api') ? BACKEND_URL.slice(0, -4) : BACKEND_URL;
          const url = track.telegramFileId 
            ? `${baseUrl}/api/nexoria-music/stream/${track.telegramFileId}`
            : track.audioUrl || "";
          
          if (url) {
            const blobUrl = await getBlobUrlForTrack(url);
            if (blobUrl) blobUrlsRef.current[track._id] = blobUrl;
          }
        }
      }
    };
    resolveBlobs();
  }, [currentTrack?._id, queue, downloadedTracks]);

  // Determine active audio source on track change
  useEffect(() => {
    let isMounted = true;
    const baseUrl = BACKEND_URL.endsWith('/api') ? BACKEND_URL.slice(0, -4) : BACKEND_URL;
    const networkSrc = currentTrack?.telegramFileId 
      ? `${baseUrl}/api/nexoria-music/stream/${currentTrack.telegramFileId}`
      : currentTrack?.audioUrl || "";
      
    if (!networkSrc) {
      if (isMounted) setActiveAudioSrc("");
      return;
    }
    
    // If we already have the blob url, use it immediately
    if (blobUrlsRef.current[currentTrack?._id]) {
      if (isMounted) setActiveAudioSrc(blobUrlsRef.current[currentTrack._id]);
    } else if (downloadedTracks.includes(currentTrack?._id)) {
      // It's downloaded but not resolved yet
      getBlobUrlForTrack(networkSrc).then(blobUrl => {
        if (blobUrl) {
          blobUrlsRef.current[currentTrack._id] = blobUrl;
          if (isMounted) setActiveAudioSrc(blobUrl);
        } else {
          if (isMounted) setActiveAudioSrc(networkSrc);
        }
      });
    } else {
      if (isMounted) setActiveAudioSrc(networkSrc);
    }
    
    return () => { isMounted = false; };
  }, [currentTrack?._id, downloadedTracks]);

  // Sync state to audio element for play/pause toggling
  useEffect(() => {
    let isMounted = true;
    if (autoplayEnabled && queue.length === 0 && currentTrack) {
      getRecommendations().unwrap().then(res => {
        if (isMounted && res.data && res.data.length > 0) {
          dispatch(setQueue(res.data));
        }
      }).catch(e => console.error("Prefetch failed:", e));
    }
    return () => { isMounted = false; };
  }, [queue.length, autoplayEnabled, currentTrack?._id, getRecommendations, dispatch]);
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
  }, [isPlaying]);

  // Force play when currentTrack changes if it should be playing (fixes auto-play next song)
  useEffect(() => {
    if (audioRef.current && isPlaying && currentTrack) {
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
         playPromise.catch(error => console.log("Track change autoplay prevented:", error));
      }
    }
  }, [currentTrack, isPlaying]);

  // Pre-fetch recommendations when queue is empty to ensure smooth background autoplay on mobile
  useEffect(() => {
    if (autoplayEnabled && queue.length === 0 && currentTrack) {
      getRecommendations().unwrap().then(res => {
        if (res.data && res.data.length > 0) {
           const filtered = res.data.filter(t => t._id !== currentTrack._id);
           if (filtered.length > 0) {
             dispatch(setQueue(filtered));
           }
        }
      }).catch(err => console.log("Prefetch failed", err));
    }
  }, [autoplayEnabled, queue.length, currentTrack?._id, dispatch, getRecommendations]);

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
      navigator.mediaSession.setActionHandler('previoustrack', () => {
        if (currentTrack?.trackType === 'podcast') {
          handleSkip15('backward');
        } else {
          if (history.length > 0) {
            const prevTrack = history[history.length - 1];
            if (audioRef.current) {
              const baseUrl = BACKEND_URL.endsWith('/api') ? BACKEND_URL.slice(0, -4) : BACKEND_URL;
              const prevSrc = prevTrack.telegramFileId ? `${baseUrl}/api/nexoria-music/stream/${prevTrack.telegramFileId}` : prevTrack.audioUrl || "";
              audioRef.current.src = prevSrc;
              audioRef.current.play().catch(e => console.log(e));
            }
          }
          dispatch(playPrevTrack());
        }
      });
      navigator.mediaSession.setActionHandler('nexttrack', () => {
        if (currentTrack?.trackType === 'podcast') {
          handleSkip15('forward');
        } else {
          handleSkipForward();
        }
      });
      navigator.mediaSession.setActionHandler('seekto', (details) => {
        if (audioRef.current && details.fastSeek && ('fastSeek' in audioRef.current)) {
          audioRef.current.fastSeek(details.seekTime);
        } else if (audioRef.current) {
          audioRef.current.currentTime = details.seekTime;
        }
      });
    }
  }, [currentTrack, dispatch]);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't trigger if user is typing in an input or textarea
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          if (currentTrack) {
             if (!isPlaying && audioRef.current) audioRef.current.play().catch(err => console.log(err));
             dispatch(togglePlayPause());
          }
          break;
        case 'MediaPlayPause':
          e.preventDefault();
          if (currentTrack) dispatch(togglePlayPause());
          break;
        case 'MediaTrackNext':
          e.preventDefault();
          handleSkipForward();
          break;
        case 'MediaTrackPrevious':
          e.preventDefault();
          if (history.length > 0) {
            const prevTrack = history[history.length - 1];
            if (audioRef.current) {
              const baseUrl = BACKEND_URL.endsWith('/api') ? BACKEND_URL.slice(0, -4) : BACKEND_URL;
              const prevSrc = prevTrack.telegramFileId ? `${baseUrl}/api/nexoria-music/stream/${prevTrack.telegramFileId}` : prevTrack.audioUrl || "";
              audioRef.current.src = prevSrc;
              audioRef.current.play().catch(err => console.log(err));
            }
          }
          dispatch(playPrevTrack());
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentTrack, isPlaying, history, dispatch]);

  // Audio element event handlers
  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const cTime = audioRef.current.currentTime;
      const tDuration = audioRef.current.duration || 0;
      dispatch(updateTime({
        currentTime: cTime,
        duration: tDuration
      }));

      // Crossfade logic
      if (crossfadeEnabled && tDuration > 0 && currentTrack?.trackType !== 'podcast') {
        const remainingTime = tDuration - cTime;
        const targetVol = isMuted ? 0 : volume;
        if (remainingTime <= crossfadeDuration && remainingTime > 0) {
          // Fade out
          audioRef.current.volume = Math.max(0, targetVol * (remainingTime / crossfadeDuration));
        } else if (cTime < crossfadeDuration) {
          // Fade in
          audioRef.current.volume = Math.min(targetVol, targetVol * (cTime / crossfadeDuration));
        } else {
          // Normal playback volume
          audioRef.current.volume = targetVol;
        }
      } else {
         audioRef.current.volume = isMuted ? 0 : volume;
      }

      // Log play after 10 seconds of playback
      if (cTime > 10 && !hasLoggedPlay && currentTrack?._id) {
        setHasLoggedPlay(true);
        logPlay({ trackId: currentTrack._id }).catch(e => console.error("Failed to log play:", e));
      }
    }
  };

  const handleSkipForward = () => {
    if (queue.length > 0) {
      let nextIndex = 0;
      if (shuffleMode) nextIndex = Math.floor(Math.random() * queue.length);
      const nextTrack = queue[nextIndex];
      
      // Synchronously set src and play to bypass iOS/mobile restrictions
      if (audioRef.current) {
        const baseUrl = BACKEND_URL.endsWith('/api') ? BACKEND_URL.slice(0, -4) : BACKEND_URL;
        let nextSrc = nextTrack.telegramFileId 
          ? `${baseUrl}/api/nexoria-music/stream/${nextTrack.telegramFileId}`
          : nextTrack.audioUrl || "";
          
        if (blobUrlsRef.current[nextTrack._id]) {
          nextSrc = blobUrlsRef.current[nextTrack._id];
        }
          
        audioRef.current.src = nextSrc;
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch(e => console.error("Autoplay next failed:", e));
        }
      }
      dispatch(playNextTrack(nextIndex));
    } else {
      if (repeatMode === 'all' && history.length > 0) {
        let nextIdx = 0;
        if (shuffleMode) nextIdx = Math.floor(Math.random() * history.length);
        const nextTrack = history[nextIdx];
        
        if (audioRef.current) {
          const baseUrl = BACKEND_URL.endsWith('/api') ? BACKEND_URL.slice(0, -4) : BACKEND_URL;
          let nextSrc = nextTrack.telegramFileId 
            ? `${baseUrl}/api/nexoria-music/stream/${nextTrack.telegramFileId}`
            : nextTrack.audioUrl || "";
            
          if (blobUrlsRef.current[nextTrack._id]) {
            nextSrc = blobUrlsRef.current[nextTrack._id];
          }
            
          audioRef.current.src = nextSrc;
          audioRef.current.play().catch(e => console.error("Autoplay next failed:", e));
        }
        dispatch(playNextTrack(nextIdx));
      } else {
        dispatch(playNextTrack());
      }
    }
  };

  const handleEnded = () => {
    if (sleepTimer === 'track') {
      dispatch(setPlaying(false));
      setSleepTimer(null);
      toast.success('Sleep timer finished');
      return;
    }

    if (repeatMode === 'one') {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(e => console.error(e));
      }
    } else {
      handleSkipForward();
    }
  };

  const handleEndedRef = useRef(handleEnded);
  useEffect(() => {
    handleEndedRef.current = handleEnded;
  }, [handleEnded]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onNativeEnded = () => {
      if (handleEndedRef.current) handleEndedRef.current();
    };
    audio.addEventListener('ended', onNativeEnded);
    return () => audio.removeEventListener('ended', onNativeEnded);
  }, []);

  const handleSetSleepTimer = (minutes) => {
    setSleepTimer(minutes ? { minutes, startTime: Date.now() } : null);
    if (sleepTimerRef.current) {
      clearTimeout(sleepTimerRef.current);
    }
    
    if (typeof minutes === 'number') {
      sleepTimerRef.current = setTimeout(() => {
        dispatch(setPlaying(false));
        setSleepTimer(null);
        toast.success('Sleep timer finished');
      }, minutes * 60 * 1000);
    } else if (minutes === 'track') {
      setSleepTimer('track');
    }
  };

  useEffect(() => {
    return () => {
      if (sleepTimerRef.current) clearTimeout(sleepTimerRef.current);
    };
  }, []);

  const handleProgressClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    const newTime = pos * duration;
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  };

  const handleSkip15 = (direction) => {
    if (audioRef.current) {
      let newTime = audioRef.current.currentTime + (direction === 'forward' ? 15 : -15);
      if (newTime < 0) newTime = 0;
      if (newTime > duration) newTime = duration;
      audioRef.current.currentTime = newTime;
    }
  };

  const formatTime = (timeInSeconds) => {
    if (!timeInSeconds || isNaN(timeInSeconds)) return "0:00";
    const m = Math.floor(timeInSeconds / 60);
    const s = Math.floor(timeInSeconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <>
      {/* Hidden Audio Element */}
      <audio
        id="nexoria-global-audio"
        ref={audioRef}
        src={activeAudioSrc}
        crossOrigin="anonymous"
        autoPlay={isPlaying}
        playsInline
        preload="auto"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleTimeUpdate}
        onCanPlay={() => {
          if (isPlaying && audioRef.current && audioRef.current.paused) {
            audioRef.current.play().catch(e => console.log('Playback error:', e));
          }
        }}
        onError={(e) => {
          console.error("Audio Element Error:", e.target.error);
          if (e.target.error) {
             const errorCodes = { 1: "ABORTED", 2: "NETWORK", 3: "DECODE", 4: "SRC_NOT_SUPPORTED" };
             if (e.target.error.code === 2 && audioRef.current) {
               const cTime = audioRef.current.currentTime;
               audioRef.current.load();
               audioRef.current.currentTime = cTime;
               if (isPlaying) audioRef.current.play().catch(err => console.log(err));
             }
          }
        }}
      />

      <AnimatePresence>
        {currentTrack && (
          <>
            {/* =========================================
                MOBILE UI (Hidden on Desktop)
                ========================================= */}
            <div className="sm:hidden block">
              {/* MINI PLAYER (Visible when NOT expanded) */}
              {!isExpanded && (
                <motion.div 
                  initial={{ y: '100%', opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: '100%', opacity: 0 }}
                  className="fixed bottom-[calc(60px+env(safe-area-inset-bottom,0px))] left-2 right-2 z-[90] bg-[#1E1B4B]/95 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.5)] cursor-pointer flex flex-col"
                  onClick={() => setIsExpanded(true)}
                  drag="y">
                  <div className="flex items-center p-2 gap-3">
                    {/* Small Image */}
                    <div className="w-10 h-10 rounded-md overflow-hidden bg-[#4338CA] shrink-0 shadow-inner">
                      {(currentTrack.coverImage || currentTrack.album?.coverImage || currentTrack.artist?.image) && (
                        <img src={currentTrack.coverImage || currentTrack.album?.coverImage || currentTrack.artist?.image} className="w-full h-full object-cover" alt="" />
                      )}
                    </div>
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-semibold truncate">{currentTrack.title}</p>
                      <p className="text-zinc-400 text-xs truncate">{currentTrack.artist?.name || 'Unknown Artist'}</p>
                    </div>
                    {/* Actions */}
                    <div className="flex items-center gap-2 pr-1">
                      <button 
                        className="p-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          dispatch(toggleLikeTrack(currentTrack._id));
                        }}
                      >
                        <Heart className={`w-5 h-5 ${likedTracks?.includes(currentTrack._id) ? 'fill-pink-500 text-pink-500' : 'text-zinc-400'}`} />
                      </button>
                      <button 
                        className="p-2 text-white"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!isPlaying && audioRef.current) audioRef.current.play().catch(err => console.log(err));
                          dispatch(togglePlayPause());
                        }}
                      >
                        {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
                      </button>
                    </div>
                  </div>
                  {/* Thin Progress Bar at bottom */}
                  <div className="h-[2px] bg-white/10 w-full">
                    <div className="h-full bg-white rounded-r-full" style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }} />
                  </div>
                </motion.div>
              )}

              {/* FULL SCREEN PLAYER (Visible when expanded) */}
              {isExpanded && (
                <motion.div
                  initial={{ y: '100%' }}
                  animate={{ y: 0 }}
                  exit={{ y: '100%' }}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  drag="y"
                  dragConstraints={{ top: 0, bottom: 0 }}
                  onDragEnd={(e, { offset, velocity }) => {
                    if (offset.y > 100 || velocity.y > 500) {
                      setIsExpanded(false);
                    }
                  }}
                  className="fixed inset-0 z-[100] bg-gradient-to-b from-zinc-900 to-black flex flex-col px-6 pb-8 pb-safe pt-4"
                >
                  {/* Top Header */}
                  <div className="flex items-center justify-between py-4">
                    <button onClick={() => setIsExpanded(false)} className="p-2 text-white/70 hover:text-white">
                      <ChevronDown className="w-6 h-6" />
                    </button>
                    <span className="text-xs uppercase tracking-widest font-semibold text-white/70">
                      {currentTrack.album?.title || 'Playing from Library'}
                    </span>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => {
                          setIsExpanded(false);
                          navigate(`/nexoria-music/lyrics/${currentTrack._id}`);
                        }}
                        className={`p-2 transition-colors ${location.pathname.includes('/lyrics/') ? 'text-green-500' : 'text-white/70 hover:text-white'}`}
                      >
                        <Mic2 className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => {
                          setIsExpanded(false);
                          navigate(`/nexoria-music/queue`);
                        }}
                        className={`p-2 transition-colors ${location.pathname.includes('/queue') ? 'text-green-500' : 'text-white/70 hover:text-white'}`}
                      >
                        <ListMusic className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => setSleepTimerModalOpen(true)}
                        className={`p-2 transition-colors ${sleepTimer ? 'text-indigo-400' : 'text-white/70 hover:text-white'}`}
                        title="Sleep Timer"
                      >
                        <Moon className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => setEqModalOpen(true)}
                        className="p-2 text-white/70 hover:text-white transition-colors"
                      >
                        <Sliders className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={handleMoreClick}
                        className="p-2 text-white/70 hover:text-white relative"
                      >
                        <MoreVertical className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Audio Visualizer Background */}
                  <div className="absolute inset-0 pointer-events-none z-[-1] flex items-end opacity-40">
                     <NexoriaAudioVisualizer audioRef={audioRef} isPlaying={isPlaying} />
                  </div>

                  {/* Big Album Art with Swipe-to-Skip Gestures */}
                  <div className="flex-1 flex items-center justify-center min-h-0 w-full my-6 overflow-hidden relative">
                    <motion.div 
                      className="w-full aspect-square max-w-sm rounded-xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
                      drag="x"
                      dragConstraints={{ left: 0, right: 0 }}
                      onDragEnd={(e, { offset, velocity }) => {
                        const swipeThreshold = 50;
                        if (offset.x < -swipeThreshold) {
                          // Swipe left = Next Track
                          handleSkipForward();
                        } else if (offset.x > swipeThreshold) {
                          // Swipe right = Prev Track
                          dispatch(playPrevTrack());
                        }
                      }}
                    >
                       {(currentTrack.coverImage || currentTrack.album?.coverImage || currentTrack.artist?.image) ? (
                        <img src={currentTrack.coverImage || currentTrack.album?.coverImage || currentTrack.artist?.image} className="w-full h-full object-cover pointer-events-none" alt="" />
                      ) : (
                        <div className="w-full h-full bg-[#4338CA] pointer-events-none" />
                      )}
                    </motion.div>
                  </div>

                  {/* Info and Like */}
                  <div className="flex items-center justify-between mb-8 mt-4">
                    <div className="flex-1 min-w-0 pr-4">
                      <h2 className="text-[28px] leading-tight font-bold text-white truncate">{currentTrack.title}</h2>
                      {currentTrack.artist ? (
                        <Link 
                          to={`/nexoria-music/artist/${currentTrack.artist._id}`}
                          onClick={() => setIsExpanded(false)}
                          className="block text-lg text-white/70 hover:text-white hover:underline truncate mt-1"
                        >
                          {currentTrack.artist.name}
                        </Link>
                      ) : (
                        <p className="text-lg text-white/70 truncate mt-1">Unknown Artist</p>
                      )}
                    </div>
                    <button 
                        onClick={() => dispatch(toggleLikeTrack(currentTrack._id))}
                        className="p-2"
                      >
                        <Heart className={`w-8 h-8 ${likedTracks?.includes(currentTrack._id) ? 'fill-pink-500 text-pink-500' : 'text-white/70'}`} />
                    </button>
                  </div>

                  {/* Scrubber */}
                  <div className="mb-6">
                    <div 
                      className="w-full h-1.5 bg-white/20 rounded-full mb-2 cursor-pointer relative group"
                      onClick={handleProgressClick}
                    >
                      <div className="absolute top-0 left-0 h-full bg-white group-hover:bg-green-500 rounded-full transition-colors" style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}>
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-md" />
                      </div>
                    </div>
                    <div className="flex justify-between text-xs text-white/60 font-medium tracking-wide mt-1">
                      <span>{formatTime(currentTime)}</span>
                      <span>{formatTime(duration)}</span>
                    </div>
                  </div>

                  {/* Main Controls */}
                  <div className="flex items-center justify-between mb-10 px-2">
                    <button onClick={() => dispatch(toggleShuffle())} className={`p-2 ${shuffleMode ? 'text-green-500' : 'text-white/70'}`}>
                      <Shuffle className="w-6 h-6" />
                    </button>
                    {currentTrack.trackType === 'podcast' ? (
                      <button onClick={() => handleSkip15('backward')} className="p-2 text-white active:scale-95 transition-transform flex items-center justify-center relative">
                        <RotateCcw className="w-9 h-9" />
                        <span className="absolute text-[9px] font-bold mt-0.5">15</span>
                      </button>
                    ) : (
                      <button onClick={() => dispatch(playPrevTrack())} className="p-2 text-white active:scale-95 transition-transform">
                        <SkipBack className="w-10 h-10 fill-current" />
                      </button>
                    )}
                    <button 
                      onClick={() => {
                        if (!isPlaying && audioRef.current) audioRef.current.play().catch(err => console.log(err));
                        dispatch(togglePlayPause());
                      }}
                      className="w-[72px] h-[72px] bg-white text-black rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-transform shrink-0"
                    >
                      {isPlaying ? <Pause className="w-9 h-9 fill-current" /> : <Play className="w-9 h-9 fill-current ml-1" />}
                    </button>
                    {currentTrack.trackType === 'podcast' ? (
                      <button onClick={() => handleSkip15('forward')} className="p-2 text-white active:scale-95 transition-transform flex items-center justify-center relative">
                        <RotateCw className="w-9 h-9" />
                        <span className="absolute text-[9px] font-bold mt-0.5">15</span>
                      </button>
                    ) : (
                      <button onClick={handleSkipForward} className="p-2 text-white active:scale-95 transition-transform">
                        <SkipForward className="w-10 h-10 fill-current" />
                      </button>
                    )}
                    <button onClick={() => dispatch(toggleRepeat())} className={`p-2 ${repeatMode !== 'none' ? 'text-green-500' : 'text-white/70'}`}>
                      {repeatMode === 'one' ? <Repeat1 className="w-6 h-6" /> : <Repeat className="w-6 h-6" />}
                    </button>
                    <button onClick={() => dispatch(toggleAutoplay())} className={`p-2 hidden md:block ${autoplayEnabled ? 'text-green-500' : 'text-white/70'}`} title="Autoplay">
                      <Infinity className="w-6 h-6" />
                    </button>
                  </div>
                </motion.div>
              )}
            </div>

            {/* =========================================
                DESKTOP UI (Hidden on Mobile)
                ========================================= */}
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="hidden sm:flex fixed bottom-0 left-0 right-0 z-[100] h-[90px] bg-[#0F0F23]/95 border-t border-white/10 items-center px-4 justify-between relative overflow-hidden"
            >
              {/* Audio Visualizer Background */}
              <div className="absolute inset-0 pointer-events-none z-[0] flex items-end opacity-20">
                 <NexoriaAudioVisualizer audioRef={audioRef} isPlaying={isPlaying} />
              </div>

              {/* Left: Info */}
              <div className="flex items-center gap-4 w-[30%] min-w-[180px] z-10">
                <div className="w-14 h-14 bg-[#4338CA] rounded shadow-md overflow-hidden shrink-0">
                  {(currentTrack.coverImage || currentTrack.album?.coverImage || currentTrack.artist?.image) && (
                    <img src={currentTrack.coverImage || currentTrack.album?.coverImage || currentTrack.artist?.image} className="w-full h-full object-cover" alt="" />
                  )}
                </div>
                <div className="flex flex-col justify-center min-w-0">
                  <span className="text-[14px] font-semibold text-white truncate">{currentTrack.title}</span>
                  {currentTrack.artist ? (
                    <Link 
                      to={`/nexoria-music/artist/${currentTrack.artist._id}`}
                      className="text-[12px] text-zinc-400 truncate hover:underline hover:text-white cursor-pointer"
                    >
                      {currentTrack.artist.name}
                    </Link>
                  ) : (
                    <span className="text-[12px] text-zinc-400 truncate">Unknown Artist</span>
                  )}
                </div>
                <button onClick={() => dispatch(toggleLikeTrack(currentTrack._id))} className="ml-2 p-1">
                  <Heart className={`w-[18px] h-[18px] ${likedTracks?.includes(currentTrack._id) ? 'fill-green-500 text-green-500' : 'text-zinc-400 hover:text-white'}`} />
                </button>
              </div>

              {/* Center: Controls */}
              <div className="flex flex-col items-center justify-center max-w-[40%] flex-1 gap-1.5 z-10">
                <div className="flex items-center gap-5">
                  <button onClick={() => dispatch(toggleShuffle())} className={`transition-colors ${shuffleMode ? 'text-green-500' : 'text-zinc-400 hover:text-white'}`}>
                    <Shuffle className="w-[18px] h-[18px]" />
                  </button>
                  {currentTrack.trackType === 'podcast' ? (
                    <button onClick={() => handleSkip15('backward')} className="text-zinc-400 hover:text-white transition-colors relative flex items-center justify-center">
                      <RotateCcw className="w-[20px] h-[20px]" />
                      <span className="absolute text-[7px] font-bold mt-0.5">15</span>
                    </button>
                  ) : (
                    <button onClick={() => dispatch(playPrevTrack())} className="text-zinc-400 hover:text-white transition-colors">
                      <SkipBack className="w-5 h-5 fill-current" />
                    </button>
                  )}
                  <button 
                    onClick={() => {
                      if (!isPlaying && audioRef.current) audioRef.current.play().catch(err => console.log(err));
                      dispatch(togglePlayPause());
                    }}
                    className="w-8 h-8 flex items-center justify-center bg-white text-black rounded-full hover:scale-105 transition-transform shrink-0"
                  >
                    {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
                  </button>
                  {currentTrack.trackType === 'podcast' ? (
                    <button onClick={() => handleSkip15('forward')} className="text-zinc-400 hover:text-white transition-colors relative flex items-center justify-center">
                      <RotateCw className="w-[20px] h-[20px]" />
                      <span className="absolute text-[7px] font-bold mt-0.5">15</span>
                    </button>
                  ) : (
                    <button onClick={handleSkipForward} className="text-zinc-400 hover:text-white transition-colors">
                      <SkipForward className="w-5 h-5 fill-current" />
                    </button>
                  )}
                  <button onClick={() => dispatch(toggleRepeat())} className={`transition-colors ${repeatMode !== 'none' ? 'text-green-500' : 'text-zinc-400 hover:text-white'}`}>
                    {repeatMode === 'one' ? <Repeat1 className="w-[18px] h-[18px]" /> : <Repeat className="w-[18px] h-[18px]" />}
                  </button>
                  <button onClick={() => dispatch(toggleAutoplay())} className={`transition-colors ${autoplayEnabled ? 'text-green-500' : 'text-zinc-400 hover:text-white'}`} title="Autoplay">
                    <Infinity className="w-[18px] h-[18px]" />
                  </button>
                </div>
                {/* Scrubber */}
                <div className="w-full flex items-center gap-2 max-w-xl">
                  <span className="text-[11px] text-zinc-400 w-10 text-right font-medium">{formatTime(currentTime)}</span>
                  <div 
                    className="flex-1 h-1 bg-zinc-700 rounded-full cursor-pointer relative group"
                    onClick={handleProgressClick}
                  >
                    <div className="absolute top-0 left-0 h-full bg-white group-hover:bg-green-500 rounded-full" style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}>
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 shadow-md" />
                    </div>
                  </div>
                  <span className="text-[11px] text-zinc-400 w-10 font-medium">{formatTime(duration)}</span>
                </div>
              </div>

              {/* Right: Volume & Extras */}
              <div className="flex items-center justify-end gap-3 w-[30%] min-w-[180px] z-10">
                <button 
                  onClick={() => setShareModalData({ isOpen: true, track: currentTrack })}
                  className="p-1 transition-colors text-zinc-400 hover:text-white"
                  title="Share"
                >
                  <Share2 className="w-[18px] h-[18px]" />
                </button>
                <button 
                  onClick={() => navigate(`/nexoria-music/lyrics/${currentTrack._id}`)} 
                  className={`p-1 transition-colors ${location.pathname.includes('/lyrics/') ? 'text-green-500' : 'text-zinc-400 hover:text-white'}`}
                  title="Lyrics"
                >
                  <Mic2 className="w-[18px] h-[18px]" />
                </button>
                <button 
                  onClick={() => navigate(`/nexoria-music/queue`)} 
                  className={`p-1 transition-colors ${location.pathname.includes('/queue') ? 'text-green-500' : 'text-zinc-400 hover:text-white'}`}
                  title="Queue"
                >
                  <ListMusic className="w-[18px] h-[18px]" />
                </button>
                <button onClick={() => dispatch(clearPlayer())} className="text-zinc-400 hover:text-red-500 transition-colors p-1" title="Close Player">
                  <X className="w-[18px] h-[18px]" />
                </button>
                <div className="flex items-center gap-2 group w-24">
                  <button onClick={() => dispatch(toggleMute())} className="text-zinc-400 hover:text-white transition-colors">
                    {isMuted || volume === 0 ? <VolumeX className="w-[18px] h-[18px]" /> : <Volume2 className="w-[18px] h-[18px]" />}
                  </button>
                  <div 
                    className="flex-1 h-1 bg-zinc-700 rounded-full cursor-pointer relative"
                    onClick={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                      dispatch(setVolume(pos));
                    }}
                  >
                    <div 
                      className="absolute top-0 left-0 h-full bg-white group-hover:bg-green-500 rounded-full transition-colors"
                      style={{ width: `${isMuted ? 0 : volume * 100}%` }}
                    >
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 shadow-md transform translate-x-1/2" />
                    </div>
                  </div>
                </div>
                <button className="text-zinc-400 hover:text-white transition-colors">
                  <Maximize2 className="w-[18px] h-[18px]" />
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      {/* Modals and Context Menus */}
      <NexoriaMusicContextMenu 
        isOpen={contextMenu.isOpen}
        onClose={() => setContextMenu({ ...contextMenu, isOpen: false })}
        x={contextMenu.x}
        y={contextMenu.y}
        track={currentTrack}
        onAddToPlaylist={() => {
          setContextMenu({ ...contextMenu, isOpen: false });
          setPlaylistModalOpen(true);
        }}
      />

      <NexoriaMusicAddToPlaylistModal 
        isOpen={playlistModalOpen}
        onClose={() => setPlaylistModalOpen(false)}
        trackId={currentTrack?._id}
      />

      <EqualizerModal 
        isOpen={eqModalOpen}
        onClose={() => setEqModalOpen(false)}
        isYouTube={false}
        updateEq={(vals) => console.log('EQ updated:', vals)}
      />

      <SleepTimerModal 
        isOpen={sleepTimerModalOpen}
        onClose={() => setSleepTimerModalOpen(false)}
        onSetTimer={handleSetSleepTimer}
        currentTimer={sleepTimer}
      />

      <NexoriaMusicShareModal
        isOpen={shareModalData.isOpen}
        onClose={() => setShareModalData({ ...shareModalData, isOpen: false })}
        track={shareModalData.track}
      />
    </>
  );
};

export default NexoriaPlayer;
