import React, { useState, useEffect } from 'react';
import { X, ListMusic } from 'lucide-react';
import { useSelector } from 'react-redux';
import { useCreatePlaylistMutation } from '../features/api/nexoriaMusicApiSlice';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const NexoriaMusicCreatePlaylistModal = ({ isOpen, onClose, onSuccess }) => {
  const { user } = useSelector(state => state.auth);
  const navigate = useNavigate();
  
  const [createPlaylist, { isLoading }] = useCreatePlaylistMutation();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setTitle('');
      setDescription('');
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please log in first.');
      return;
    }
    if (!title.trim()) {
      toast.error('Playlist title is required');
      return;
    }
    
    try {
      const res = await createPlaylist({ title, description }).unwrap();
      toast.success('Playlist created!');
      onClose();
      if (onSuccess) {
         onSuccess(res.data);
      } else {
         navigate(`/nexoria-music/playlist/${res.data._id}`);
      }
    } catch (err) {
      toast.error('Failed to create playlist');
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-[#0F0F23]/80 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="bg-[#1E1B4B] w-full max-w-md rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh] border border-white/10"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-2xl font-bold text-white">Create Playlist</h2>
          <button onClick={onClose} className="text-[#94A3B8] hover:text-white transition-colors bg-white/5 hover:bg-white/10 p-2 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">
          {!user ? (
            <div className="text-center py-8">
              <p className="text-[#94A3B8] mb-4 font-medium">You need to be logged in to create playlists.</p>
              <button onClick={() => { onClose(); navigate('/login'); }} className="px-6 py-2 bg-white text-black font-bold rounded-full hover:scale-105 transition-transform">Log In</button>
            </div>
          ) : (
            <form onSubmit={handleCreate} className="flex flex-col gap-4">
              
              <div className="flex justify-center mb-4">
                <div className="w-32 h-32 bg-[#4338CA] rounded-md flex flex-col items-center justify-center text-[#94A3B8] shadow-[0_4px_24px_rgba(0,0,0,0.5)] border border-white/5 group hover:bg-zinc-700 transition-colors">
                   <ListMusic className="w-10 h-10 mb-2" />
                   <span className="text-xs font-bold uppercase tracking-wider">Cover</span>
                </div>
              </div>

              <div>
                 <label className="block text-sm font-bold text-white mb-2">Title <span className="text-red-500">*</span></label>
                 <input 
                   type="text" 
                   value={title}
                   onChange={e => setTitle(e.target.value)}
                   className="w-full bg-white/10 border border-white/10 rounded-md px-4 py-3 text-white focus:outline-none focus:border-[#22C55E] transition-colors font-medium"
                   placeholder="My awesome playlist"
                   autoFocus
                   required
                 />
              </div>

              <div>
                 <label className="block text-sm font-bold text-white mb-2">Description <span className="text-[#94A3B8] font-normal">(Optional)</span></label>
                 <textarea 
                   value={description}
                   onChange={e => setDescription(e.target.value)}
                   className="w-full bg-white/10 border border-white/10 rounded-md px-4 py-3 text-white focus:outline-none focus:border-[#22C55E] transition-colors font-medium resize-none"
                   placeholder="Give your playlist a catchy description"
                   rows="3"
                 />
              </div>
              
              <div className="mt-4 flex justify-end">
                <button 
                  type="submit"
                  disabled={isLoading || !title.trim()}
                  className="px-8 py-3 bg-[#22C55E] text-black font-bold rounded-full hover:scale-105 active:scale-95 hover:bg-[#22C55E] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {isLoading ? 'Creating...' : 'Create Playlist'}
                </button>
              </div>

            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default NexoriaMusicCreatePlaylistModal;
