import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Plus, Share2, User, Disc, ListMusic, Download, CheckCircle2, Loader2 } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { playTrack, addToQueueNext, addDownloadedTrack, removeDownloadedTrackId } from '../features/music/nexoriaMusicSlice';
import { BACKEND_URL } from '../features/api/apiSlice';
import { downloadTrack, removeDownloadedTrack } from '../utils/offlineManager';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const NexoriaMusicContextMenu = ({ isOpen, onClose, x, y, track, onAddToPlaylist }) => {
  const menuRef = useRef(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { downloadedTracks } = useSelector(state => state.nexoriaMusic);
  const [isDownloading, setIsDownloading] = React.useState(false);

  const isDownloaded = downloadedTracks.includes(track?._id);

  // Handle clicking outside to close
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      // Close on scroll to prevent detached menus
      window.addEventListener('scroll', onClose, { passive: true });
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', onClose);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !track) return null;

  // Calculate position to prevent overflowing screen edges
  const menuWidth = 240;
  const menuHeight = 280; // approximate
  const safeX = x + menuWidth > window.innerWidth ? window.innerWidth - menuWidth - 16 : x;
  const safeY = y + menuHeight > window.innerHeight ? window.innerHeight - menuHeight - 16 : y;

  const handleAction = (action) => {
    action();
    onClose();
  };

  const copyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/nexoria-music/album/${track.album?._id || ''}`);
    toast.success('Link copied to clipboard!');
  };

  const handleDownloadToggle = async () => {
    setIsDownloading(true);
    const baseUrl = BACKEND_URL.endsWith('/api') ? BACKEND_URL.slice(0, -4) : BACKEND_URL;
    const audioUrl = track.telegramFileId 
      ? `${baseUrl}/api/nexoria-music/stream/${track.telegramFileId}`
      : track.audioUrl || "";

    if (!audioUrl) {
      toast.error('Audio source not available');
      setIsDownloading(false);
      return;
    }

    if (isDownloaded) {
      const success = await removeDownloadedTrack(audioUrl);
      if (success) {
        dispatch(removeDownloadedTrackId(track._id));
        toast.success('Removed from downloads');
      } else {
        toast.error('Failed to remove download');
      }
    } else {
      const success = await downloadTrack(audioUrl);
      if (success) {
        dispatch(addDownloadedTrack(track._id));
        toast.success('Downloaded successfully');
      } else {
        toast.error('Failed to download track');
      }
    }
    setIsDownloading(false);
    onClose();
  };

  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.1 }}
        ref={menuRef}
        style={{ top: safeY, left: safeX }}
        className="fixed z-[9999] w-60 bg-[#1E1B4B]/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl py-2 flex flex-col text-sm text-white/90 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-4 py-2 border-b border-white/10 flex items-center gap-3 mb-1">
          <img 
            src={track.coverImage || track.album?.coverImage || track.artist?.image || 'https://via.placeholder.com/150'} 
            alt={track.title} 
            className="w-10 h-10 rounded shadow-md object-cover"
          />
          <div className="flex flex-col overflow-hidden">
            <span className="font-semibold truncate text-white">{track.title}</span>
            <span className="text-xs text-zinc-400 truncate">{track.artist?.name || 'Unknown Artist'}</span>
          </div>
        </div>

        <button 
          onClick={() => handleAction(() => dispatch(playTrack(track)))}
          className="flex items-center gap-3 px-4 py-2.5 hover:bg-white/10 transition-colors w-full text-left"
        >
          <Play className="w-4 h-4 text-zinc-300" />
          <span>Play</span>
        </button>
        
        <button 
          onClick={() => handleAction(() => dispatch(addToQueueNext(track)))}
          className="flex items-center gap-3 px-4 py-2.5 hover:bg-white/10 transition-colors w-full text-left"
        >
          <ListMusic className="w-4 h-4 text-zinc-300" />
          <span>Add to queue next</span>
        </button>

        <button 
          onClick={() => handleAction(() => onAddToPlaylist && onAddToPlaylist(track._id))}
          className="flex items-center gap-3 px-4 py-2.5 hover:bg-white/10 transition-colors w-full text-left"
        >
          <Plus className="w-4 h-4 text-zinc-300" />
          <span>Add to playlist</span>
        </button>

        <button 
          onClick={handleDownloadToggle}
          disabled={isDownloading}
          className="flex items-center gap-3 px-4 py-2.5 hover:bg-white/10 transition-colors w-full text-left"
        >
          {isDownloading ? (
            <Loader2 className="w-4 h-4 text-zinc-300 animate-spin" />
          ) : isDownloaded ? (
            <CheckCircle2 className="w-4 h-4 text-green-500" />
          ) : (
            <Download className="w-4 h-4 text-zinc-300" />
          )}
          <span className={isDownloaded ? "text-green-500" : ""}>
            {isDownloading ? 'Downloading...' : isDownloaded ? 'Downloaded' : 'Download'}
          </span>
        </button>

        <div className="h-px bg-white/10 my-1 mx-2" />

        <button 
          onClick={() => handleAction(() => {
            if (track.artist?._id) navigate(`/nexoria-music/artist/${track.artist._id}`);
            else toast.error('Artist info not available');
          })}
          className="flex items-center gap-3 px-4 py-2.5 hover:bg-white/10 transition-colors w-full text-left"
        >
          <User className="w-4 h-4 text-zinc-300" />
          <span>Go to artist</span>
        </button>

        <button 
          onClick={() => handleAction(() => {
            if (track.album?._id) navigate(`/nexoria-music/album/${track.album._id}`);
            else toast.error('Album info not available');
          })}
          className="flex items-center gap-3 px-4 py-2.5 hover:bg-white/10 transition-colors w-full text-left"
        >
          <Disc className="w-4 h-4 text-zinc-300" />
          <span>Go to album</span>
        </button>

        <div className="h-px bg-white/10 my-1 mx-2" />

        <button 
          onClick={() => handleAction(copyLink)}
          className="flex items-center gap-3 px-4 py-2.5 hover:bg-white/10 transition-colors w-full text-left"
        >
          <Share2 className="w-4 h-4 text-zinc-300" />
          <span>Share</span>
        </button>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
};

export default NexoriaMusicContextMenu;
