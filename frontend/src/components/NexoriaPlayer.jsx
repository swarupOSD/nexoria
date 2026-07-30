import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, 
  Repeat, Repeat1, Shuffle, Heart, X, ListMusic, Maximize2, MoreVertical, ChevronDown, Mic2, Infinity as InfinityIcon, Sliders,
  RotateCcw, RotateCw, Share2, Moon
} from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  playNextTrack, playPrevTrack, togglePlayPause, 
  updateTime, setVolume, toggleMute, 
  toggleRepeat, toggleShuffle, toggleLikeTrack, clearPlayer, addToQueue, playTrack, setQueue, toggleAutoplay, setPlaying
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

// ─── Helper: get audio src for a track ───────────────────────────────────────
function getTrackSrc(track) {
  if (!track) return '';
  const base = BACKEND_URL.endsWith('/api') ? BACKEND_URL.slice(0, -4) : BACKEND_URL;
  if (track.telegramFileId) return `${base}/api/nexoria-music/stream/${track.telegramFileId}`;
  return track.audioUrl || '';
}

// ─── Helper: get best cover image for a track ────────────────────────────────
function getTrackArtwork(track) {
  if (!track) return '';
  return track.coverImage || track.album?.coverImage || track.artist?.image || '';
}

// ─── Helper: update MediaSession metadata safely ─────────────────────────────
function updateMediaSessionMetadata(track) {
  if (!('mediaSession' in navigator) || !track) return;
  try {
    const artworkUrl = getTrackArtwork(track);
    navigator.mediaSession.metadata = new window.MediaMetadata({
      title: track.title || 'Unknown Title',
      artist: track.artist?.name || 'Unknown Artist',
      album: track.album?.title || '',
      artwork: artworkUrl
        ? [
            { src: artworkUrl, sizes: '96x96',   type: 'image/jpeg' },
            { src: artworkUrl, sizes: '128x128',  type: 'image/jpeg' },
            { src: artworkUrl, sizes: '192x192',  type: 'image/jpeg' },
            { src: artworkUrl, sizes: '256x256',  type: 'image/jpeg' },
            { src: artworkUrl, sizes: '384x384',  type: 'image/jpeg' },
            { src: artworkUrl, sizes: '512x512',  type: 'image/jpeg' },
          ]
        : [],
    });
  } catch (e) {
    // Silently catch - MediaSession is a nice-to-have, not critical
    console.warn('MediaSession metadata error:', e);
  }
}

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
  const [sleepTimer, setSleepTimer] = useState(null);
  const sleepTimerRef = useRef(null);
  const [shareModalData, setShareModalData] = useState({ isOpen: false, track: null });

  // We use a ref so that handleSkipForward always sees current Redux state
  // without needing to be re-created (avoids stale closure bugs)
  const stateRef = useRef({});

  const { 
    currentTrack, isPlaying, volume, isMuted, 
    repeatMode, shuffleMode, currentTime, duration,
    likedTracks, queue, history, autoplayEnabled, downloadedTracks,
    crossfadeEnabled, crossfadeDuration
  } = useSelector(state => state.nexoriaMusic);

  // Keep stateRef always up-to-date with latest Redux values
  useEffect(() => {
    stateRef.current = {
      currentTrack, isPlaying, volume, isMuted,
      repeatMode, shuffleMode, currentTime, duration,
      likedTracks, queue, history, autoplayEnabled, downloadedTracks,
      crossfadeEnabled, crossfadeDuration
    };
  });

  const [logPlay] = useLogPlayMutation();
  const [getRecommendations] = useLazyGetMusicRecommendationsQuery();
  const [hasLoggedPlay, setHasLoggedPlay] = useState(false);

  // Blob URL cache for offline tracks
  const blobUrlsRef = useRef({});

  // Reset play-log flag on track change
  useEffect(() => {
    setHasLoggedPlay(false);
  }, [currentTrack?._id]);

  // Expose audioRef globally
  useEffect(() => {
    window.__nexoriaAudioRef = audioRef;
  }, []);

  // ─── Share modal listener ──────────────────────────────────────────────────
  useEffect(() => {
    const handleOpenShare = (e) => setShareModalData({ isOpen: true, track: e.detail });
    window.addEventListener('open-share-modal', handleOpenShare);
    return () => window.removeEventListener('open-share-modal', handleOpenShare);
  }, []);

  const handleMoreClick = (e) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    setContextMenu({ isOpen: true, x: rect.left, y: rect.bottom });
  };

  // ─── Pre-resolve blob URLs for offline tracks ──────────────────────────────
  useEffect(() => {
    const resolve = async () => {
      const tracks = [currentTrack, ...queue.slice(0, 3)].filter(Boolean);
      for (const t of tracks) {
        if (!blobUrlsRef.current[t._id] && downloadedTracks.includes(t._id)) {
          const src = getTrackSrc(t);
          if (src) {
            const blob = await getBlobUrlForTrack(src);
            if (blob) blobUrlsRef.current[t._id] = blob;
          }
        }
      }
    };
    resolve();
  }, [currentTrack?._id, queue, downloadedTracks]);

  // ─── CORE: handleSkipForward ───────────────────────────────────────────────
  // This function uses stateRef so it NEVER has stale closures.
  // Called by: button click, handleEnded, MediaSession nexttrack, keyboard
  const handleSkipForward = useCallback(() => {
    const { queue, history, shuffleMode, repeatMode, autoplayEnabled } = stateRef.current;
    const audio = audioRef.current;

    if (queue.length > 0) {
      const nextIndex = shuffleMode ? Math.floor(Math.random() * queue.length) : 0;
      const nextTrack = queue[nextIndex];

      // Set audio src synchronously (required for iOS autoplay policy)
      if (audio) {
        const src = blobUrlsRef.current[nextTrack._id] || getTrackSrc(nextTrack);
        if (src) {
          audio.src = src;
          audio.load();
          audio.play().catch(e => console.warn('Skip forward play error:', e));
        }
      }

      updateMediaSessionMetadata(nextTrack);
      dispatch(playNextTrack(nextIndex));

    } else if (repeatMode === 'all' && history.length > 0) {
      const nextIndex = shuffleMode ? Math.floor(Math.random() * history.length) : 0;
      const nextTrack = history[nextIndex];

      if (audio) {
        const src = blobUrlsRef.current[nextTrack._id] || getTrackSrc(nextTrack);
        if (src) {
          audio.src = src;
          audio.load();
          audio.play().catch(e => console.warn('Repeat-all play error:', e));
        }
      }

      updateMediaSessionMetadata(nextTrack);
      // playNextTrack with empty queue will re-seed from history in the reducer
      dispatch(playNextTrack(nextIndex));

    } else if (autoplayEnabled) {
      // Queue empty, no repeat — fetch recommendations and play first one
      getRecommendations().unwrap().then(res => {
        if (res?.data?.length > 0) {
          const { currentTrack } = stateRef.current;
          const filtered = res.data.filter(t => t._id !== currentTrack?._id);
          if (filtered.length > 0) {
            dispatch(setQueue(filtered.slice(1)));
            const nextTrack = filtered[0];
            if (audio) {
              const src = getTrackSrc(nextTrack);
              if (src) {
                audio.src = src;
                audio.load();
                audio.play().catch(e => console.warn('Autoplay reco error:', e));
              }
            }
            updateMediaSessionMetadata(nextTrack);
            dispatch(playTrack(nextTrack));
          }
        }
      }).catch(e => console.warn('Recommendations failed:', e));
    } else {
      // Nothing to play
      dispatch(setPlaying(false));
    }
  }, [dispatch, getRecommendations]);

  // Keep handleSkipForward in a ref so MediaSession and other callbacks always use latest
  const handleSkipForwardRef = useRef(handleSkipForward);
  useEffect(() => {
    handleSkipForwardRef.current = handleSkipForward;
  }, [handleSkipForward]);

  // ─── On track change: set audio src and attempt play ──────────────────────
  useEffect(() => {
    if (!currentTrack) {
      if (audioRef.current) audioRef.current.src = '';
      return;
    }

    let cancelled = false;
    const audio = audioRef.current;

    const playSrc = (src) => {
      if (cancelled || !audio) return;
      if (audio.src !== src) {
        audio.src = src;
        audio.load();
      }
      audio.play().catch(e => console.warn('Track change play:', e));
    };

    if (blobUrlsRef.current[currentTrack._id]) {
      playSrc(blobUrlsRef.current[currentTrack._id]);
    } else if (downloadedTracks.includes(currentTrack._id)) {
      const networkSrc = getTrackSrc(currentTrack);
      getBlobUrlForTrack(networkSrc).then(blob => {
        if (blob) {
          blobUrlsRef.current[currentTrack._id] = blob;
          playSrc(blob);
        } else {
          playSrc(networkSrc);
        }
      });
    } else {
      const networkSrc = getTrackSrc(currentTrack);
      if (networkSrc) playSrc(networkSrc);
    }

    // Update lock-screen metadata immediately when track changes
    updateMediaSessionMetadata(currentTrack);

    return () => { cancelled = true; };
  }, [currentTrack?._id]);  

  // ─── Sync isPlaying state to audio element ────────────────────────────────
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      if (audio.paused) {
        audio.play().catch(e => console.warn('Play sync error:', e));
      }
    } else {
      if (!audio.paused) audio.pause();
    }
  }, [isPlaying]);

  // ─── Volume & mute ────────────────────────────────────────────────────────
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // ─── Resume on visibility change (tab switch, screen wake) ────────────────
  useEffect(() => {
    const handle = () => {
      if (document.visibilityState === 'visible' && stateRef.current.isPlaying && audioRef.current?.paused) {
        audioRef.current.play().catch(e => console.warn('Visibility resume:', e));
      }
    };
    document.addEventListener('visibilitychange', handle);
    return () => document.removeEventListener('visibilitychange', handle);
  }, []);

  // ─── MediaSession API setup (runs once, uses refs for callbacks) ──────────
  useEffect(() => {
    if (!('mediaSession' in navigator)) return;

    navigator.mediaSession.setActionHandler('play', () => {
      dispatch(setPlaying(true));
      audioRef.current?.play().catch(e => console.warn(e));
    });

    navigator.mediaSession.setActionHandler('pause', () => {
      dispatch(setPlaying(false));
      audioRef.current?.pause();
    });

    navigator.mediaSession.setActionHandler('nexttrack', () => {
      handleSkipForwardRef.current();
    });

    navigator.mediaSession.setActionHandler('previoustrack', () => {
      const { history, currentTrack } = stateRef.current;
      const audio = audioRef.current;
      if (history.length > 0) {
        const prevTrack = history[history.length - 1];
        if (audio) {
          const src = blobUrlsRef.current[prevTrack._id] || getTrackSrc(prevTrack);
          if (src) {
            audio.src = src;
            audio.load();
            audio.play().catch(e => console.warn(e));
          }
        }
        updateMediaSessionMetadata(prevTrack);
        dispatch(playPrevTrack());
      } else if (audio) {
        audio.currentTime = 0;
      }
    });

    navigator.mediaSession.setActionHandler('seekto', (details) => {
      const audio = audioRef.current;
      if (!audio) return;
      const seekTime = details.seekTime ?? 0;
      if (details.fastSeek && 'fastSeek' in audio) {
        audio.fastSeek(seekTime);
      } else {
        audio.currentTime = seekTime;
      }
      if ('setPositionState' in navigator.mediaSession) {
        try {
          navigator.mediaSession.setPositionState({
            duration: audio.duration || 0,
            playbackRate: audio.playbackRate,
            position: seekTime,
          });
        } catch (e) { /* ignore */ }
      }
    });

    navigator.mediaSession.setActionHandler('seekbackward', (details) => {
      const audio = audioRef.current;
      if (audio) audio.currentTime = Math.max(0, audio.currentTime - (details.seekOffset || 10));
    });

    navigator.mediaSession.setActionHandler('seekforward', (details) => {
      const audio = audioRef.current;
      if (audio) audio.currentTime = Math.min(audio.duration || Infinity, audio.currentTime + (details.seekOffset || 10));
    });
  }, [dispatch]);  

  // ─── Update MediaSession metadata whenever track changes ──────────────────
  useEffect(() => {
    if (currentTrack) updateMediaSessionMetadata(currentTrack);
  }, [currentTrack?._id]);  

  // ─── Pre-fetch recommendations proactively ────────────────────────────────
  useEffect(() => {
    if (autoplayEnabled && queue.length === 0 && currentTrack) {
      getRecommendations().unwrap().then(res => {
        if (res?.data?.length > 0) {
          const filtered = res.data.filter(t => t._id !== currentTrack._id);
          if (filtered.length > 0) dispatch(setQueue(filtered));
        }
      }).catch(() => {});
    }
  }, [autoplayEnabled, queue.length, currentTrack?._id]);  

  // ─── Keyboard shortcuts ───────────────────────────────────────────────────
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;
      const { currentTrack, isPlaying } = stateRef.current;

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          if (currentTrack) {
            if (!isPlaying && audioRef.current) audioRef.current.play().catch(() => {});
            dispatch(togglePlayPause());
          }
          break;
        case 'MediaPlayPause':
          e.preventDefault();
          if (currentTrack) dispatch(togglePlayPause());
          break;
        case 'MediaTrackNext':
          e.preventDefault();
          handleSkipForwardRef.current();
          break;
        case 'MediaTrackPrevious': {
          e.preventDefault();
          const { history } = stateRef.current;
          const audio = audioRef.current;
          if (history.length > 0) {
            const prevTrack = history[history.length - 1];
            if (audio) {
              const src = blobUrlsRef.current[prevTrack._id] || getTrackSrc(prevTrack);
              if (src) { audio.src = src; audio.play().catch(() => {}); }
            }
            updateMediaSessionMetadata(prevTrack);
          }
          dispatch(playPrevTrack());
          break;
        }
        default:
          break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [dispatch]);

  // ─── Audio event handlers ─────────────────────────────────────────────────
  const maxTimeRef = useRef(0);
  const lastTrackIdRef = useRef(null);

  const handleTimeUpdate = () => {
    const audio = audioRef.current;
    if (!audio) return;

    const cTime = audio.currentTime;
    const tDuration = audio.duration || 0;
    const { currentTrack, isPlaying, isMuted, volume, crossfadeEnabled, crossfadeDuration } = stateRef.current;

    // Reset max time tracking on track change
    if (lastTrackIdRef.current !== currentTrack?._id) {
      maxTimeRef.current = 0;
      lastTrackIdRef.current = currentTrack?._id;
    }

    // Ignore tiny backwards stutters
    if (cTime < maxTimeRef.current && (maxTimeRef.current - cTime) < 2) return;
    if (cTime > maxTimeRef.current || (maxTimeRef.current - cTime) >= 2) {
      maxTimeRef.current = cTime;
    }

    // Throttle Redux dispatch to once per second
    const now = Date.now();
    if (!window._nexoriaLastSync || now - window._nexoriaLastSync > 1000) {
      dispatch(updateTime({ currentTime: maxTimeRef.current, duration: tDuration }));
      window._nexoriaLastSync = now;
      // Update MediaSession position state for scrubber on lock screen
      if ('setPositionState' in navigator.mediaSession && tDuration > 0) {
        try {
          navigator.mediaSession.setPositionState({
            duration: tDuration,
            playbackRate: audio.playbackRate,
            position: maxTimeRef.current,
          });
        } catch (e) { /* ignore */ }
      }
    }

    // Crossfade
    if (crossfadeEnabled && tDuration > 0 && currentTrack?.trackType !== 'podcast') {
      const remaining = tDuration - cTime;
      const targetVol = isMuted ? 0 : volume;
      if (remaining <= crossfadeDuration && remaining > 0) {
        audio.volume = Math.max(0, targetVol * (remaining / crossfadeDuration));
      } else if (cTime < crossfadeDuration) {
        audio.volume = Math.min(targetVol, targetVol * (cTime / crossfadeDuration));
      } else {
        audio.volume = targetVol;
      }
    } else {
      audio.volume = isMuted ? 0 : volume;
    }

    // Log play after 10 seconds
    if (cTime > 10 && !hasLoggedPlay && currentTrack?._id) {
      setHasLoggedPlay(true);
      logPlay({ trackId: currentTrack._id }).catch(() => {});
    }
  };

  // ─── Track ended → go to next ────────────────────────────────────────────
  const handleEnded = useCallback(() => {
    const { repeatMode, sleepTimer } = { repeatMode: stateRef.current?.repeatMode, sleepTimer };
    
    if (sleepTimer === 'track') {
      dispatch(setPlaying(false));
      setSleepTimer(null);
      toast.success('Sleep timer finished');
      return;
    }

    if (stateRef.current?.repeatMode === 'one') {
      const audio = audioRef.current;
      if (audio) {
        audio.currentTime = 0;
        audio.play().catch(e => console.warn(e));
      }
    } else {
      handleSkipForwardRef.current();
    }
  }, [dispatch, sleepTimer]);

  // Sleep timer
  const handleSetSleepTimer = (minutes) => {
    setSleepTimer(minutes || null);
    if (sleepTimerRef.current) clearTimeout(sleepTimerRef.current);
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
    return () => { if (sleepTimerRef.current) clearTimeout(sleepTimerRef.current); };
  }, []);

  const handleProgressClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    const newTime = pos * duration;
    if (audioRef.current) audioRef.current.currentTime = newTime;
  };

  const handleSkip15 = (direction) => {
    const audio = audioRef.current;
    if (!audio) return;
    let newTime = audio.currentTime + (direction === 'forward' ? 15 : -15);
    newTime = Math.max(0, Math.min(newTime, duration));
    audio.currentTime = newTime;
  };

  const formatTime = (t) => {
    if (!t || isNaN(t)) return '0:00';
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <>
      {/* Global Audio Element */}
      <audio
        id="nexoria-global-audio"
        ref={audioRef}
        playsInline
        crossOrigin="anonymous"
        preload="auto"
        onEnded={handleEnded}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleTimeUpdate}
        onCanPlay={() => {
          if (stateRef.current?.isPlaying && audioRef.current?.paused) {
            audioRef.current.play().catch(() => {});
          }
        }}
        onError={(e) => {
          console.warn('Audio error:', e.nativeEvent?.message || 'unknown');
        }}
      />

      <AnimatePresence>
        {currentTrack && (
          <>
            {/* ═══════════════════════════════════════
                MOBILE UI
            ═══════════════════════════════════════ */}
            <div className="sm:hidden block">
              {/* Mini Player */}
              {!isExpanded && (
                <motion.div
                  initial={{ y: '100%', opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: '100%', opacity: 0 }}
                  className="fixed bottom-[calc(65px+env(safe-area-inset-bottom,0px))] left-2 right-2 z-[90] bg-[#1E1B4B] border border-white/10 rounded-xl overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.5)] cursor-pointer flex flex-col active:scale-[0.98] transition-transform"
                  onClick={() => setIsExpanded(true)}
                >
                  <div className="flex items-center p-2 gap-3">
                    <div className="w-10 h-10 rounded-md overflow-hidden bg-[#4338CA] shrink-0 shadow-inner">
                      {getTrackArtwork(currentTrack) && (
                        <img src={getTrackArtwork(currentTrack)} className="w-full h-full object-cover" alt="" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-semibold truncate">{currentTrack.title}</p>
                      <p className="text-zinc-400 text-xs truncate">{currentTrack.artist?.name || 'Unknown Artist'}</p>
                    </div>
                    <div className="flex items-center gap-1 pr-1">
                      <button
                        className="p-3 active:scale-90 transition-transform"
                        onClick={(e) => { e.stopPropagation(); dispatch(toggleLikeTrack(currentTrack._id)); }}
                        onPointerDown={(e) => e.stopPropagation()}
                      >
                        <Heart className={`w-6 h-6 ${likedTracks?.includes(currentTrack._id) ? 'fill-pink-500 text-pink-500' : 'text-zinc-400'}`} />
                      </button>
                      <button
                        className="p-3 text-white active:scale-90 transition-transform"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!isPlaying && audioRef.current) audioRef.current.play().catch(() => {});
                          dispatch(togglePlayPause());
                        }}
                        onPointerDown={(e) => e.stopPropagation()}
                      >
                        {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-0.5" />}
                      </button>
                    </div>
                  </div>
                  <div className="h-[2px] bg-white/10 w-full">
                    <div className="h-full bg-white rounded-r-full" style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }} />
                  </div>
                </motion.div>
              )}

              {/* Full Screen Player */}
              {isExpanded && (
                <motion.div
                  initial={{ y: '100%' }}
                  animate={{ y: 0 }}
                  exit={{ y: '100%' }}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  className="fixed inset-0 z-[999] bg-gradient-to-b from-zinc-900 to-black flex flex-col px-6 pb-8 pb-safe pt-4"
                >
                  {/* Header */}
                  <div className="flex items-center justify-between py-4">
                    <button onClick={() => setIsExpanded(false)} className="p-2 text-white/70 hover:text-white active:scale-90 transition-transform">
                      <ChevronDown className="w-7 h-7" />
                    </button>
                    <span className="text-xs uppercase tracking-widest font-semibold text-white/70">
                      {currentTrack.album?.title || 'Playing from Library'}
                    </span>
                    <button onClick={handleMoreClick} className="p-2 text-white/70 hover:text-white relative active:scale-90 transition-transform">
                      <MoreVertical className="w-6 h-6" />
                    </button>
                  </div>

                  {/* Audio Visualizer Background */}
                  <div className="absolute inset-0 pointer-events-none z-[-1] flex items-end opacity-40">
                    <NexoriaAudioVisualizer audioRef={audioRef} isPlaying={isPlaying} />
                  </div>

                  {/* Album Art with Swipe-to-Skip */}
                  <div className="flex-1 flex items-center justify-center min-h-0 w-full my-6 overflow-hidden relative">
                    <motion.div
                      className="w-full aspect-square max-w-sm rounded-xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
                      drag="x"
                      dragConstraints={{ left: 0, right: 0 }}
                      onDragEnd={(e, { offset }) => {
                        if (offset.x < -50) handleSkipForwardRef.current();
                        else if (offset.x > 50) dispatch(playPrevTrack());
                      }}
                    >
                      {getTrackArtwork(currentTrack) ? (
                        <img src={getTrackArtwork(currentTrack)} className="w-full h-full object-cover pointer-events-none" alt="" />
                      ) : (
                        <div className="w-full h-full bg-[#4338CA] pointer-events-none flex items-center justify-center">
                          <span className="text-white/30 text-6xl font-bold">{currentTrack.title?.[0] || '♪'}</span>
                        </div>
                      )}
                    </motion.div>
                  </div>

                  {/* Info + Like */}
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
                    <button onClick={() => dispatch(toggleLikeTrack(currentTrack._id))} className="p-2">
                      <Heart className={`w-8 h-8 ${likedTracks?.includes(currentTrack._id) ? 'fill-pink-500 text-pink-500' : 'text-white/70'}`} />
                    </button>
                  </div>

                  {/* Scrubber */}
                  <div className="mb-6">
                    <div className="w-full h-1.5 bg-white/20 rounded-full mb-2 cursor-pointer relative group" onClick={handleProgressClick}>
                      <div className="absolute top-0 left-0 h-full bg-white group-hover:bg-green-500 rounded-full transition-colors" style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}>
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-md" />
                      </div>
                    </div>
                    <div className="flex justify-between text-xs text-white/60 font-medium tracking-wide mt-1">
                      <span>{formatTime(currentTime)}</span>
                      <span>{formatTime(duration)}</span>
                    </div>
                  </div>

                  {/* Controls */}
                  <div className="flex items-center justify-between mb-8 px-2">
                    <button onClick={() => dispatch(toggleShuffle())} className={`p-2 active:scale-90 transition-transform ${shuffleMode ? 'text-green-500' : 'text-white/70'}`}>
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
                        if (!isPlaying && audioRef.current) audioRef.current.play().catch(() => {});
                        dispatch(togglePlayPause());
                      }}
                      className="w-[72px] h-[72px] bg-white text-black rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-transform shrink-0 shadow-[0_10px_30px_rgba(255,255,255,0.3)]"
                    >
                      {isPlaying ? <Pause className="w-9 h-9 fill-current" /> : <Play className="w-9 h-9 fill-current ml-1" />}
                    </button>
                    {currentTrack.trackType === 'podcast' ? (
                      <button onClick={() => handleSkip15('forward')} className="p-2 text-white active:scale-95 transition-transform flex items-center justify-center relative">
                        <RotateCw className="w-9 h-9" />
                        <span className="absolute text-[9px] font-bold mt-0.5">15</span>
                      </button>
                    ) : (
                      <button onClick={() => handleSkipForwardRef.current()} className="p-2 text-white active:scale-95 transition-transform">
                        <SkipForward className="w-10 h-10 fill-current" />
                      </button>
                    )}
                    <button onClick={() => dispatch(toggleRepeat())} className={`p-2 active:scale-90 transition-transform relative ${repeatMode !== 'none' ? 'text-green-500' : 'text-white/70'}`}>
                      {repeatMode === 'one' ? <Repeat1 className="w-6 h-6" /> : <Repeat className="w-6 h-6" />}
                      {repeatMode === 'all' && <InfinityIcon className="w-2 h-2 absolute top-1.5 right-1.5 text-green-500" />}
                    </button>
                  </div>

                  {/* Bottom Toolbar */}
                  <div className="flex items-center justify-between px-4 mt-auto mb-2">
                    <button onClick={() => setShareModalData({ isOpen: true, track: currentTrack })} className="p-3 text-white/60 hover:text-white active:scale-90 transition-transform">
                      <Share2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => { setIsExpanded(false); navigate(`/nexoria-music/lyrics/${currentTrack._id}`); }}
                      className={`p-3 active:scale-90 transition-all ${location.pathname.includes('/lyrics/') ? 'text-green-500 font-bold' : 'text-white/60 hover:text-white'}`}
                    >
                      <Mic2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => { setIsExpanded(false); navigate('/nexoria-music/queue'); }}
                      className={`p-3 active:scale-90 transition-all ${location.pathname.includes('/queue') ? 'text-green-500 font-bold' : 'text-white/60 hover:text-white'}`}
                    >
                      <ListMusic className="w-5 h-5" />
                    </button>
                    <button onClick={() => setEqModalOpen(true)} className="p-3 text-white/60 hover:text-white active:scale-90 transition-transform">
                      <Sliders className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setSleepTimerModalOpen(true)}
                      className={`p-3 active:scale-90 transition-transform ${sleepTimer ? 'text-green-500' : 'text-white/60 hover:text-white'}`}
                    >
                      <Moon className="w-5 h-5" />
                    </button>
                  </div>
                </motion.div>
              )}
            </div>

            {/* ═══════════════════════════════════════
                DESKTOP UI
            ═══════════════════════════════════════ */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="hidden sm:flex fixed bottom-0 left-0 right-0 z-[100] h-[90px] bg-[#0F0F23]/95 border-t border-white/10 items-center px-4 justify-between relative overflow-hidden"
            >
              {/* Background Visualizer */}
              <div className="absolute inset-0 pointer-events-none z-[0] flex items-end opacity-20">
                <NexoriaAudioVisualizer audioRef={audioRef} isPlaying={isPlaying} />
              </div>

              {/* Left: Track Info */}
              <div className="flex items-center gap-4 w-[30%] min-w-[180px] z-10">
                <div className="w-14 h-14 bg-[#4338CA] rounded shadow-md overflow-hidden shrink-0">
                  {getTrackArtwork(currentTrack) && (
                    <img src={getTrackArtwork(currentTrack)} className="w-full h-full object-cover" alt="" />
                  )}
                </div>
                <div className="flex flex-col justify-center min-w-0">
                  <span className="text-[14px] font-semibold text-white truncate">{currentTrack.title}</span>
                  {currentTrack.artist ? (
                    <Link to={`/nexoria-music/artist/${currentTrack.artist._id}`} className="text-[12px] text-zinc-400 truncate hover:underline hover:text-white cursor-pointer">
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

              {/* Center: Controls + Scrubber */}
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
                      if (!isPlaying && audioRef.current) audioRef.current.play().catch(() => {});
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
                    <button onClick={() => handleSkipForwardRef.current()} className="text-zinc-400 hover:text-white transition-colors">
                      <SkipForward className="w-5 h-5 fill-current" />
                    </button>
                  )}
                  <button onClick={() => dispatch(toggleRepeat())} className={`transition-colors ${repeatMode !== 'none' ? 'text-green-500' : 'text-zinc-400 hover:text-white'}`}>
                    {repeatMode === 'one' ? <Repeat1 className="w-[18px] h-[18px]" /> : <Repeat className="w-[18px] h-[18px]" />}
                  </button>
                  <button onClick={() => dispatch(toggleAutoplay())} className={`transition-colors ${autoplayEnabled ? 'text-green-500' : 'text-zinc-400 hover:text-white'}`} title="Autoplay">
                    <InfinityIcon className="w-[18px] h-[18px]" />
                  </button>
                </div>
                {/* Scrubber */}
                <div className="w-full flex items-center gap-2 max-w-xl">
                  <span className="text-[11px] text-zinc-400 w-10 text-right font-medium">{formatTime(currentTime)}</span>
                  <div className="flex-1 h-1 bg-zinc-700 rounded-full cursor-pointer relative group" onClick={handleProgressClick}>
                    <div className="absolute top-0 left-0 h-full bg-white group-hover:bg-green-500 rounded-full" style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}>
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 shadow-md" />
                    </div>
                  </div>
                  <span className="text-[11px] text-zinc-400 w-10 font-medium">{formatTime(duration)}</span>
                </div>
              </div>

              {/* Right: Volume & Extras */}
              <div className="flex items-center justify-end gap-3 w-[30%] min-w-[180px] z-10">
                <button onClick={() => setShareModalData({ isOpen: true, track: currentTrack })} className="p-1 transition-colors text-zinc-400 hover:text-white" title="Share">
                  <Share2 className="w-[18px] h-[18px]" />
                </button>
                <button onClick={() => navigate(`/nexoria-music/lyrics/${currentTrack._id}`)} className={`p-1 transition-colors ${location.pathname.includes('/lyrics/') ? 'text-green-500' : 'text-zinc-400 hover:text-white'}`} title="Lyrics">
                  <Mic2 className="w-[18px] h-[18px]" />
                </button>
                <button onClick={() => navigate('/nexoria-music/queue')} className={`p-1 transition-colors ${location.pathname.includes('/queue') ? 'text-green-500' : 'text-zinc-400 hover:text-white'}`} title="Queue">
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
                      dispatch(setVolume(Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))));
                    }}
                  >
                    <div className="absolute top-0 left-0 h-full bg-white group-hover:bg-green-500 rounded-full transition-colors" style={{ width: `${isMuted ? 0 : volume * 100}%` }}>
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

      {/* Modals */}
      <NexoriaMusicContextMenu
        isOpen={contextMenu.isOpen}
        onClose={() => setContextMenu({ ...contextMenu, isOpen: false })}
        x={contextMenu.x}
        y={contextMenu.y}
        track={currentTrack}
        onAddToPlaylist={() => { setContextMenu({ ...contextMenu, isOpen: false }); setPlaylistModalOpen(true); }}
      />
      <NexoriaMusicAddToPlaylistModal isOpen={playlistModalOpen} onClose={() => setPlaylistModalOpen(false)} trackId={currentTrack?._id} />
      <EqualizerModal isOpen={eqModalOpen} onClose={() => setEqModalOpen(false)} isYouTube={false} updateEq={(vals) => console.log('EQ updated:', vals)} />
      <SleepTimerModal isOpen={sleepTimerModalOpen} onClose={() => setSleepTimerModalOpen(false)} onSetTimer={handleSetSleepTimer} currentTimer={sleepTimer} />
      <NexoriaMusicShareModal isOpen={shareModalData.isOpen} onClose={() => setShareModalData({ ...shareModalData, isOpen: false })} track={shareModalData.track} />
    </>
  );
};

export default NexoriaPlayer;
