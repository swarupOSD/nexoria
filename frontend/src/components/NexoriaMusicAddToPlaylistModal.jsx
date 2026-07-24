import React, { useEffect, useState } from 'react';
import { X, Plus, ListMusic } from 'lucide-react';
import { useSelector } from 'react-redux';
import { useGetPlaylistsQuery, useCreatePlaylistMutation, useAddTrackToPlaylistMutation } from '../features/api/nexoriaMusicApiSlice';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import NexoriaMusicCreatePlaylistModal from './NexoriaMusicCreatePlaylistModal';

const NexoriaMusicAddToPlaylistModal = ({ isOpen, onClose, trackId }) => {
  const { user } = useSelector(state => state.auth);
  const navigate = useNavigate();
  
  const { data: playlistsRes, isLoading } = useGetPlaylistsQuery(undefined, { skip: !user || !isOpen });
  const [createPlaylist] = useCreatePlaylistMutation();
  const [addTrack] = useAddTrackToPlaylistMutation();
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  const playlists = playlistsRes?.data || [];

  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCreateAndAdd = async (newPlaylist) => {
    if (!user) return;
    try {
      await addTrack({ playlistId: newPlaylist._id, trackId }).unwrap();
      toast.success('Playlist created and track added!');
      setShowCreateModal(false);
      onClose();
    } catch (err) {
      toast.error('Failed to add track to new playlist');
    }
  };

  const handleAddToPlaylist = async (playlistId) => {
    try {
      await addTrack({ playlistId, trackId }).unwrap();
      toast.success('Added to playlist!');
      onClose();
    } catch (err) {
      toast.error('Failed to add track. Maybe it is already there?');
    }
  };

  return (
    <>
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-[#0F0F23]/80 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="bg-[#1E1B4B] w-full max-w-md rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh] border border-white/10"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-2xl font-bold text-white">Add to Playlist</h2>
          <button onClick={onClose} className="text-[#94A3B8] hover:text-white transition-colors bg-white/5 hover:bg-white/10 p-2 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-2">
          {!user ? (
            <div className="text-center py-8">
              <p className="text-[#94A3B8] mb-4 font-medium">You need to be logged in to manage playlists.</p>
              <button onClick={() => { onClose(); navigate('/login'); }} className="px-6 py-2 bg-white text-black font-bold rounded-full hover:scale-105 transition-transform">Log In</button>
            </div>
          ) : (
            <>
              <button 
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-4 p-3 rounded-lg hover:bg-white/10 transition-colors group text-left w-full mb-2"
              >
                <div className="w-12 h-12 rounded-md bg-white/10 flex items-center justify-center shrink-0 group-hover:bg-white/20 transition-colors">
                  <Plus className="w-6 h-6 text-white" />
                </div>
                <span className="font-bold text-white text-base">New Playlist</span>
              </button>

              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="w-8 h-8 border-4 border-[#22C55E] border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : (
                playlists.map(pl => (
                  <button 
                    key={pl._id}
                    onClick={() => handleAddToPlaylist(pl._id)}
                    className="flex items-center gap-4 p-3 rounded-lg hover:bg-white/10 transition-colors group text-left w-full"
                  >
                    <div className="w-12 h-12 rounded-md bg-[#4338CA] flex items-center justify-center shrink-0 overflow-hidden shadow-md">
                      {pl.coverImage ? (
                        <img src={pl.coverImage} alt={pl.title} className="w-full h-full object-cover" />
                      ) : (
                        <ListMusic className="w-6 h-6 text-[#94A3B8]" />
                      )}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="font-bold text-white text-base truncate">{pl.title}</span>
                      <span className="text-sm text-[#94A3B8] truncate">{pl.tracks?.length || 0} tracks</span>
                    </div>
                  </button>
                ))
              )}
            </>
          )}
        </div>
      </div>
    </div>
    
    {showCreateModal && (
      <NexoriaMusicCreatePlaylistModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleCreateAndAdd}
      />
    )}
    </>
  );
};

export default NexoriaMusicAddToPlaylistModal;
