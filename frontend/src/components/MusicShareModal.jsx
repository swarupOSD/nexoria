import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Music, Play, Pause, Loader } from 'lucide-react';
import axios from 'axios';

const MusicShareModal = ({ isOpen, onClose, onSelect }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [previewAudio, setPreviewAudio] = useState(null);
  const [playingId, setPlayingId] = useState(null);

  // Fetch initial popular tracks or all tracks when opened
  useEffect(() => {
    if (isOpen && !searchQuery) {
      fetchTracks();
    }
    
    return () => {
      if (previewAudio) {
        previewAudio.pause();
      }
    };
  }, [isOpen]);

  const fetchTracks = async (query = '') => {
    setLoading(true);
    try {
      const endpoint = query 
        ? `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/nexoria-music/search?q=${encodeURIComponent(query)}`
        : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/nexoria-music/tracks`;
        
      // Ensure we send cookies for auth if needed
      const res = await axios.get(endpoint, { withCredentials: true });
      
      // The search endpoint might return different structure than the tracks endpoint
      if (query && res.data.tracks) {
        setResults(res.data.tracks);
      } else if (res.data.data) {
        // Fallback for /tracks which usually has a standard pagination format
        setResults(res.data.data.slice(0, 10)); // Just show top 10 initially
      } else {
        setResults(Array.isArray(res.data) ? res.data : []);
      }
    } catch (err) {
      console.error('Failed to fetch music', err);
      // Fallback empty state
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  // Debounced search
  useEffect(() => {
    if (!isOpen) return;
    
    const delayDebounceFn = setTimeout(() => {
      fetchTracks(searchQuery);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, isOpen]);

  const handlePlayPreview = (track, e) => {
    e.stopPropagation();
    
    if (playingId === track._id && previewAudio) {
      previewAudio.pause();
      setPlayingId(null);
      return;
    }

    if (previewAudio) {
      previewAudio.pause();
    }

    // Determine the audio URL - use stream endpoint if telegramFileId exists
    const audioSrc = track.telegramFileId 
      ? `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/nexoria-music/stream/${track.telegramFileId}`
      : track.audioUrl;

    if (!audioSrc) return;

    const audio = new Audio(audioSrc);
    audio.play();
    setPreviewAudio(audio);
    setPlayingId(track._id);

    audio.onended = () => {
      setPlayingId(null);
    };
  };

  const handleSelect = (track) => {
    if (previewAudio) {
      previewAudio.pause();
      setPlayingId(null);
    }
    onSelect({
      trackId: track._id,
      title: track.title,
      artist: track.artist?.name || 'Unknown Artist',
      coverImage: track.coverImage || '/default-music-cover.jpg',
      audioUrl: track.telegramFileId 
        ? `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/nexoria-music/stream/${track.telegramFileId}`
        : track.audioUrl
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-md bg-[#121212] border border-gray-800 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col max-h-[80vh] font-sans"
        >
          {/* Header */}
          <div className="border-b border-gray-800 p-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-white">
              <Music className="w-5 h-5 text-purple-500" />
              <h2 className="font-semibold text-base">Share Music</h2>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search Bar */}
          <div className="p-4 border-b border-gray-800">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tracks, artists..."
                className="w-full bg-[#262626] text-white p-2.5 pl-11 outline-none text-sm transition-colors rounded-full focus:ring-2 focus:ring-purple-500/50"
                autoFocus
              />
            </div>
          </div>

          {/* Results Area */}
          <div className="flex-1 overflow-y-auto p-2 scrollbar-hide">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-40 text-gray-500 gap-3">
                <Loader className="w-8 h-8 animate-spin" />
                <span className="text-xs font-medium">Searching...</span>
              </div>
            ) : results.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-gray-500 gap-3">
                <Music className="w-8 h-8 opacity-50" />
                <span className="text-xs font-medium">No Tracks Found</span>
              </div>
            ) : (
              <div className="space-y-1">
                {results.map((track) => (
                  <motion.div
                    key={track._id}
                    whileHover={{ backgroundColor: '#262626' }}
                    className="flex items-center gap-3 p-2 rounded-xl cursor-pointer transition-colors group"
                    onClick={() => handleSelect(track)}
                  >
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-gray-800">
                      {track.coverImage ? (
                        <img src={track.coverImage} alt={track.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-500">
                          <Music className="w-5 h-5" />
                        </div>
                      )}
                      
                      {/* Play Preview Overlay */}
                      <div 
                        className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => handlePlayPreview(track, e)}
                      >
                        {playingId === track._id ? (
                          <Pause className="w-5 h-5 text-white" />
                        ) : (
                          <Play className="w-5 h-5 text-white ml-1" />
                        )}
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-white text-sm truncate">{track.title}</h4>
                      <p className="text-xs text-gray-400 truncate">{track.artist?.name || 'Unknown Artist'}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
          
          <div className="p-3 border-t border-gray-800 text-center">
            <span className="text-[11px] text-gray-500 font-medium">Select a track to share securely</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default MusicShareModal;
