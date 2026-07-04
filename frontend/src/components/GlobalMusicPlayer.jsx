import React, { useEffect, useRef, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, 
  Repeat, Shuffle, Heart, ListVideo, Mic2, Share2, Radio, Download
} from 'lucide-react';
import { 
  togglePlayPause, playNext, playPrevious, setVolume, 
  toggleMute, toggleLoopMode, toggleShuffle, toggleRadioMode, setPlaying, playSong, clearQueue
} from '../features/music/musicSlice';
import { 
  useToggleFavoriteMutation, 
  useGetUserFavoritesQuery,
  useRecordListenHistoryMutation,
  useGetSongsQuery,
  useLazyGetYoutubeSongStreamQuery
} from '../features/api/musicApiSlice';
import { Link, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import LyricsModal from './LyricsModal';
import AudioVisualizer from './AudioVisualizer';
import AddToPlaylistModal from './AddToPlaylistModal';
import EqualizerModal from './EqualizerModal';
import ShareCardModal from './ShareCardModal';
import { useWebAudio } from '../hooks/useWebAudio';
import { downloadMp3 } from '../utils/downloadMp3';
import { Sliders, X } from 'lucide-react';
import FallbackImage from './FallbackImage';

// Sanitize YouTube URL to standard watch?v= format
const sanitizeYouTubeUrl = (url) => {
  if (!url) return '';
  if (url.includes('youtu.be/')) {
    const id = url.split('youtu.be/')[1].split('?')[0];
    return `https://www.youtube.com/watch?v=${id}`;
  }
  if (url.includes('?si=')) {
    return url.split('?si=')[0];
  }
  return url;
};

const GlobalMusicPlayer = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const { 
    currentSong, isPlaying, volume, isMuted, loopMode, isShuffle, isRadioMode, queue 
  } = useSelector(state => state.music);

  const [played, setPlayed] = useState(0);
  const [playedSeconds, setPlayedSeconds] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isSeeking, setIsSeeking] = useState(false);
  const [isLyricsOpen, setIsLyricsOpen] = useState(false);
  const [isPlaylistModalOpen, setIsPlaylistModalOpen] = useState(false);
  const [isEqOpen, setIsEqOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const playerRef = useRef(null);
  const audioRef = useRef(null);
  
  const [youtubeStreamUrl, setYoutubeStreamUrl] = useState(null);
  const [isFetchingStream, setIsFetchingStream] = useState(false);
  const [getYoutubeStream] = useLazyGetYoutubeSongStreamQuery();

  // Determine playback mode
  const isYouTube = currentSong?.isYoutube || currentSong?.audioUrl?.includes('youtube.com') || currentSong?.audioUrl?.includes('youtu.be');
  const playerUrl = isYouTube ? youtubeStreamUrl : currentSong?.audioUrl;

  const { isReady: webAudioReady, updateEq, getAnalyser, resumeContext } = useWebAudio(audioRef, isYouTube);

  const [toggleFavorite] = useToggleFavoriteMutation();
  const [recordListenHistory] = useRecordListenHistoryMutation();
  const { data: favoritesRes } = useGetUserFavoritesQuery(undefined, {
    skip: !currentSong
  });
  
  // Pre-fetch songs for Smart Radio
  const { data: radioSongsRes } = useGetSongsQuery({ limit: 50 }, { skip: !isRadioMode });

  const isFavorite = favoritesRes?.data?.some(s => s._id === currentSong?._id);

  // Fetch YouTube direct stream URL on demand
  useEffect(() => {
    if (isYouTube && currentSong?._id) {
      let isMounted = true;
      setYoutubeStreamUrl(null);
      setIsFetchingStream(true);
      
      let videoId = currentSong._id;
      if (currentSong.youtubeId) {
        videoId = currentSong.youtubeId;
      } else if (currentSong.audioUrl) {
        const match = currentSong.audioUrl.match(/[?&]v=([^&]+)/) || currentSong.audioUrl.match(/youtu\.be\/([^?]+)/);
        if (match) videoId = match[1];
      }

      getYoutubeStream(videoId).unwrap()
        .then(res => {
          if (isMounted && res?.data?.streamUrl) {
            setYoutubeStreamUrl(res.data.streamUrl);
          }
        })
        .catch(err => {
          if (isMounted) {
            console.error("Failed to fetch YT stream:", err);
            toast.error("Failed to load YouTube audio stream");
            dispatch(setPlaying(false));
          }
        })
        .finally(() => {
          if (isMounted) setIsFetchingStream(false);
        });
        
      return () => { isMounted = false; };
    } else {
      setYoutubeStreamUrl(null);
      setIsFetchingStream(false);
    }
  }, [currentSong, isYouTube, getYoutubeStream, dispatch]);

  // Sync native HTML5 audio play/pause with Redux state
  useEffect(() => {
    if (audioRef.current && currentSong && playerUrl) {
      if (isPlaying) {
        audioRef.current.play().then(() => {
          resumeContext(); // Ensure Web Audio API is resumed
        }).catch(() => {
          dispatch(setPlaying(false));
        });
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentSong, playerUrl, dispatch, resumeContext]);

  // MediaSession API Integration
  useEffect(() => {
    if ('mediaSession' in navigator && currentSong) {
      navigator.mediaSession.metadata = new window.MediaMetadata({
        title: currentSong.title,
        artist: currentSong.artist,
        album: currentSong.album || 'Nexoria Sound',
        artwork: [
          { src: currentSong.image, sizes: '512x512', type: 'image/jpeg' }
        ]
      });

      navigator.mediaSession.setActionHandler('play', () => dispatch(setPlaying(true)));
      navigator.mediaSession.setActionHandler('pause', () => dispatch(setPlaying(false)));
      navigator.mediaSession.setActionHandler('previoustrack', () => dispatch(playPrevious()));
      navigator.mediaSession.setActionHandler('nexttrack', () => dispatch(playNext()));
      
      // Seek functionality for OS controls
      navigator.mediaSession.setActionHandler('seekto', (details) => {
        if (details.fastSeek && 'fastSeek' in (audioRef.current || {})) {
          audioRef.current.fastSeek(details.seekTime);
          return;
        }
        if (audioRef.current) {
          audioRef.current.currentTime = details.seekTime;
        }
      });
    }
  }, [currentSong, dispatch]);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignore if user is typing in an input or textarea
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          dispatch(togglePlayPause());
          break;
        case 'ArrowLeft':
          e.preventDefault();
          if (e.shiftKey) {
            dispatch(playPrevious());
          } else {
            // Seek Back 10 seconds
            const backTime = Math.max(0, playedSeconds - 10);
            if (audioRef.current) audioRef.current.currentTime = backTime;
          }
          break;
        case 'ArrowRight':
          e.preventDefault();
          if (e.shiftKey) {
            dispatch(playNext());
          } else {
            // Seek Forward 10 seconds
            const forwardTime = Math.min(duration, playedSeconds + 10);
            if (audioRef.current) audioRef.current.currentTime = forwardTime;
          }
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [dispatch, playedSeconds, duration]);

  // Sync volume/mute on native audio
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  if (!currentSong) return null;

  // Don't show the player on admin pages
  if (location.pathname.startsWith('/superadmin') || location.pathname.startsWith('/admin')) {
    return null;
  }



  const handleProgress = (state) => {
    if (!isSeeking) {
      setPlayed(state.played);
      setPlayedSeconds(state.playedSeconds);
    }
  };

  const handleDuration = (dur) => {
    setDuration(dur);
  };

  const handleSeekMouseDown = () => {
    setIsSeeking(true);
  };

  const handleSeekChange = (e) => {
    setPlayed(parseFloat(e.target.value));
  };

  const handleSeekMouseUp = (e) => {
    setIsSeeking(false);
    const newTime = parseFloat(e.target.value);
    if (audioRef.current && duration > 0) {
      audioRef.current.currentTime = newTime * duration;
    }
  };

  const onAudioTimeUpdate = () => {
    if (audioRef.current && !isSeeking) {
      setPlayedSeconds(audioRef.current.currentTime);
      if (duration > 0) setPlayed(audioRef.current.currentTime / duration);
    }
  };

  const onAudioLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const formatTime = (seconds) => {
    const date = new Date(seconds * 1000);
    const hh = date.getUTCHours();
    const mm = date.getUTCMinutes();
    const ss = date.getUTCSeconds().toString().padStart(2, '0');
    if (hh) {
      return `${hh}:${mm.toString().padStart(2, '0')}:${ss}`;
    }
    return `${mm}:${ss}`;
  };

  const handleToggleFavorite = async () => {
    if (currentSong) {
      try {
        await toggleFavorite(currentSong._id).unwrap();
        toast.success(isFavorite ? 'Removed from favorites' : 'Added to favorites');
      } catch (err) {
        if (err.status === 401) {
          toast.error('Please login to like songs');
        } else {
          toast.error('Failed to toggle favorite');
        }
      }
    }
  };

  const handleSongEnd = () => {
    if (currentSong && playedSeconds > 10) {
      recordListenHistory({ id: currentSong._id, listenTime: Math.floor(playedSeconds) });
    }
    
    // Smart Radio Logic
    if (queue.length === 0 && isRadioMode && radioSongsRes?.data) {
      const allSongs = radioSongsRes.data;
      // Filter out current song to avoid immediate repetition
      const available = allSongs.filter(s => s._id !== currentSong?._id);
      if (available.length > 0) {
        const randomSong = available[Math.floor(Math.random() * available.length)];
        dispatch(playSong(randomSong));
        return; // Don't call playNext
      }
    }
    
    dispatch(playNext());
  };

  const handleShare = () => {
    setIsShareModalOpen(true);
  };

  return (
    <>
    <LyricsModal 
      isOpen={isLyricsOpen} 
      onClose={() => setIsLyricsOpen(false)} 
      playedSeconds={playedSeconds} 
    />
    <AddToPlaylistModal 
      isOpen={isPlaylistModalOpen}
      onClose={() => setIsPlaylistModalOpen(false)}
      song={currentSong}
    />
    <EqualizerModal
      isOpen={isEqOpen}
      onClose={() => setIsEqOpen(false)}
      isYouTube={isYouTube}
      updateEq={updateEq}
    />
    <ShareCardModal
      isOpen={isShareModalOpen}
      onClose={() => setIsShareModalOpen(false)}
      song={currentSong}
    />
    
    <div className="fixed bottom-0 left-0 right-0 z-[100] px-2 sm:px-4 pb-2 sm:pb-4 pointer-events-none">
      <div className="max-w-6xl mx-auto bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-3 sm:p-4 shadow-2xl pointer-events-auto flex flex-col sm:flex-row items-center gap-4 transition-all duration-300">

        {/* NATIVE HTML5 AUDIO PLAYER - Handles EVERYTHING now! */}
        <audio
          ref={audioRef}
          src={playerUrl || ''}
          onTimeUpdate={onAudioTimeUpdate}
          onLoadedMetadata={onAudioLoadedMetadata}
          onEnded={handleSongEnd}
          onCanPlay={() => {
            // onCanPlay fires after mount + src ready - audioRef.current is guaranteed set here
            if (isPlaying && audioRef.current) {
              audioRef.current.play().catch(() => dispatch(setPlaying(false)));
            }
          }}
          onPlaying={() => dispatch(setPlaying(true))}
          onPause={() => { /* intentionally empty - pause controlled by useEffect only */ }}
          onWaiting={() => { /* buffering */ }}
          onError={(e) => {
            // Ignore error if there's no src yet
            if (audioRef.current && audioRef.current.src) {
              console.error('Audio playback error', e);
            }
          }}
          style={{ position: 'absolute', width: 0, height: 0, opacity: 0, pointerEvents: 'none' }}
        />

        {/* Left: Song Info */}
        <div className="flex items-center gap-3 w-full sm:w-1/3 min-w-0">
          <div className="relative group overflow-hidden rounded-lg w-12 h-12 sm:w-14 sm:h-14 flex-shrink-0">
            <FallbackImage 
              src={currentSong.image} 
              alt={currentSong.title} 
              fallbackType="music"
              className={`w-full h-full object-cover transition-transform duration-700 ${isPlaying ? 'scale-110' : 'scale-100'}`}
            />
            {isPlaying && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center pointer-events-none">
                <AudioVisualizer isPlaying={isPlaying} isYouTube={isYouTube} getAnalyser={getAnalyser} />
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <Link to="/sound" className="text-white font-bold text-sm sm:text-base truncate block hover:text-purple-400 transition-colors">
              {currentSong.title}
            </Link>
            <p className="text-slate-400 text-xs sm:text-sm truncate">
              {currentSong.artist}
            </p>
            {currentSong.description && (
              <p className="text-slate-500 text-[10px] sm:text-xs truncate max-w-[200px]" title={currentSong.description}>
                {currentSong.description}
              </p>
            )}
          </div>
          <button onClick={handleToggleFavorite} className="p-2 text-slate-400 hover:text-rose-500 transition-colors flex-shrink-0">
            <Heart className={`w-5 h-5 ${isFavorite ? 'fill-rose-500 text-rose-500' : ''}`} />
          </button>
        </div>

        {/* Center: Controls & Progress */}
        <div className="flex flex-col items-center w-full sm:w-1/3">
          <div className="flex items-center gap-4 sm:gap-6 mb-2">
            <button 
              onClick={() => dispatch(toggleRadioMode())}
              className={`p-1.5 transition-colors ${isRadioMode ? 'text-rose-500' : 'text-slate-400 hover:text-white'}`}
              title="Smart Radio"
            >
              <Radio className="w-4 h-4" />
            </button>
            <button 
              onClick={() => dispatch(toggleShuffle())}
              className={`p-1.5 transition-colors ${isShuffle ? 'text-purple-500' : 'text-slate-400 hover:text-white'}`}
            >
              <Shuffle className="w-4 h-4" />
            </button>
            <button 
              onClick={() => dispatch(playPrevious())}
              className="text-slate-300 hover:text-white transition-colors"
            >
              <SkipBack className="w-5 h-5 fill-current" />
            </button>
            <button 
              onClick={() => {
                if (!isFetchingStream) dispatch(togglePlayPause());
              }}
              disabled={isFetchingStream}
              className={`w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-full flex items-center justify-center hover:scale-105 transition-transform text-black shadow-lg shadow-white/20 ${isFetchingStream ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isFetchingStream ? (
                <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
              ) : isPlaying ? (
                <Pause className="w-5 h-5 sm:w-6 sm:h-6 fill-current" />
              ) : (
                <Play className="w-5 h-5 sm:w-6 sm:h-6 fill-current ml-1" />
              )}
            </button>
            <button 
              onClick={() => dispatch(playNext())}
              className="text-slate-300 hover:text-white transition-colors"
            >
              <SkipForward className="w-5 h-5 fill-current" />
            </button>
            <button 
              onClick={() => dispatch(toggleLoopMode())}
              className={`p-1.5 transition-colors relative ${loopMode > 0 ? 'text-purple-500' : 'text-slate-400 hover:text-white'}`}
            >
              <Repeat className="w-4 h-4" />
              {loopMode === 2 && <span className="absolute -top-1 -right-1 text-[8px] font-bold bg-purple-500 text-white w-3 h-3 rounded-full flex items-center justify-center">1</span>}
            </button>
          </div>
          <div className="w-full flex items-center gap-2 text-xs font-medium text-slate-400">
            <span className="w-10 text-right">{formatTime(playedSeconds)}</span>
            <input
              type="range"
              min={0}
              max={0.999999}
              step="any"
              value={played}
              onMouseDown={handleSeekMouseDown}
              onChange={handleSeekChange}
              onMouseUp={handleSeekMouseUp}
              onTouchStart={handleSeekMouseDown}
              onTouchEnd={handleSeekMouseUp}
              className="flex-1 h-1.5 bg-slate-700 rounded-full appearance-none cursor-pointer accent-purple-500 hover:h-2 transition-all"
            />
            <span className="w-10">{formatTime(duration)}</span>
          </div>
        </div>

        {/* Right: Volume Controls & Extras */}
        <div className="hidden sm:flex items-center justify-end gap-3 w-1/3">
          <button 
            onClick={() => setIsEqOpen(true)}
            className={`p-2 transition-colors ${!isYouTube ? 'text-slate-300 hover:text-white' : 'text-slate-600 cursor-not-allowed'}`}
            title="Advanced Equalizer"
          >
            <Sliders className="w-4 h-4" />
          </button>

          <button 
            onClick={() => setIsPlaylistModalOpen(true)}
            className="text-slate-400 hover:text-white transition-colors p-2"
            title="Add to Playlist"
          >
            <ListVideo className="w-5 h-5" />
          </button>

          <button 
            onClick={() => setIsLyricsOpen(true)}
            className={`p-2 transition-colors ${currentSong.lyrics ? 'text-slate-300 hover:text-white' : 'text-slate-600 cursor-not-allowed'}`}
            title={currentSong.lyrics ? 'Show Lyrics' : 'No Lyrics'}
          >
            <Mic2 className="w-5 h-5" />
          </button>
          
          <button onClick={handleShare} className="text-slate-400 hover:text-white transition-colors p-2" title="Share Song">
            <Share2 className="w-4 h-4" />
          </button>

          {!isYouTube && (
            <button 
              onClick={() => downloadMp3(currentSong)} 
              className="text-slate-400 hover:text-green-400 transition-colors p-2" 
              title="Download MP3"
            >
              <Download className="w-4 h-4" />
            </button>
          )}

          <Link to="/sound/queue" className="text-slate-400 hover:text-white transition-colors p-2" title="Queue">
            <ListVideo className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-2 group">
            <button onClick={() => dispatch(toggleMute())} className="text-slate-400 group-hover:text-white transition-colors">
              {isMuted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step="any"
              value={isMuted ? 0 : volume}
              onChange={(e) => dispatch(setVolume(parseFloat(e.target.value)))}
              className="w-20 h-1.5 bg-slate-700 rounded-full appearance-none cursor-pointer accent-white hover:accent-purple-500 transition-colors"
            />
          </div>

          <button 
            onClick={() => {
              dispatch(setPlaying(false));
              dispatch(clearQueue());
              // Force next track which handles empty queue gracefully to clear currentSong
              dispatch(playNext()); 
            }}
            className="text-slate-500 hover:text-rose-500 hover:bg-rose-500/10 transition-colors p-2 rounded-full ml-2"
            title="Close Player"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

      </div>
    </div>
    </>
  );
};

export default GlobalMusicPlayer;
