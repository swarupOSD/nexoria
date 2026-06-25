import React, { useState } from 'react';
import { X, Plus, Loader2, Music, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { 
  useGetUserPlaylistsQuery, 
  useCreateUserPlaylistMutation, 
  useToggleSongInUserPlaylistMutation 
} from '../features/api/musicApiSlice';

const AddToPlaylistModal = ({ isOpen, onClose, song }) => {
  const { data: playlistsRes, isLoading } = useGetUserPlaylistsQuery(undefined, { skip: !isOpen });
  const [createPlaylist, { isLoading: isCreating }] = useCreateUserPlaylistMutation();
  const [toggleSong, { isLoading: isToggling }] = useToggleSongInUserPlaylistMutation();

  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');

  if (!isOpen || !song) return null;

  const playlists = playlistsRes?.data || [];

  const handleCreateAndAdd = async (e) => {
    e.preventDefault();
    if (!newPlaylistName.trim()) return;

    try {
      // 1. Create Playlist
      const res = await createPlaylist({ 
        name: newPlaylistName, 
        image: song.image || 'https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?q=80&w=500&auto=format&fit=crop' 
      }).unwrap();
      
      // 2. Add song to it
      await toggleSong({ playlistId: res.data._id, songId: song._id, action: 'add' }).unwrap();
      
      toast.success(`Added to ${newPlaylistName}`);
      setIsCreatingNew(false);
      setNewPlaylistName('');
      onClose();
    } catch (error) {
      toast.error('Failed to create playlist');
    }
  };

  const handleToggleSong = async (playlist) => {
    const isAdded = playlist.songs.some(s => s._id === song._id || s === song._id);
    try {
      await toggleSong({ 
        playlistId: playlist._id, 
        songId: song._id, 
        action: isAdded ? 'remove' : 'add' 
      }).unwrap();
      
      if (isAdded) {
        toast.success(`Removed from ${playlist.name}`);
      } else {
        toast.success(`Added to ${playlist.name}`);
        onClose(); // Auto close on successful add
      }
    } catch (error) {
      toast.error('Failed to update playlist');
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-800">
          <h2 className="text-xl font-bold text-white">Add to Playlist</h2>
          <button onClick={onClose} className="p-2 bg-slate-800 hover:bg-slate-700 rounded-full text-slate-400 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 max-h-[60vh] overflow-y-auto">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
            </div>
          ) : (
            <div className="space-y-3">
              {isCreatingNew ? (
                <form onSubmit={handleCreateAndAdd} className="space-y-4 bg-slate-800/50 p-4 rounded-2xl border border-purple-500/30">
                  <input
                    type="text"
                    value={newPlaylistName}
                    onChange={(e) => setNewPlaylistName(e.target.value)}
                    placeholder="Playlist name..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors"
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setIsCreatingNew(false)}
                      className="flex-1 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={!newPlaylistName.trim() || isCreating || isToggling}
                      className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-xl font-bold transition-colors flex justify-center items-center"
                    >
                      {isCreating || isToggling ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create'}
                    </button>
                  </div>
                </form>
              ) : (
                <button
                  onClick={() => setIsCreatingNew(true)}
                  className="w-full flex items-center justify-center gap-2 p-4 border-2 border-dashed border-slate-700 hover:border-purple-500 hover:text-purple-400 text-slate-400 rounded-2xl transition-colors font-bold"
                >
                  <Plus className="w-5 h-5" />
                  New Playlist
                </button>
              )}

              <div className="space-y-2 mt-4">
                {playlists.map(playlist => {
                  const isAdded = playlist.songs.some(s => s._id === song._id || s === song._id);
                  return (
                    <button
                      key={playlist._id}
                      onClick={() => handleToggleSong(playlist)}
                      disabled={isToggling}
                      className="w-full flex items-center gap-4 p-3 hover:bg-slate-800 rounded-2xl transition-colors group text-left"
                    >
                      <img src={playlist.image} alt={playlist.name} className="w-12 h-12 rounded-xl object-cover" />
                      <div className="flex-1 min-w-0">
                        <h4 className={`font-bold truncate ${isAdded ? 'text-purple-400' : 'text-white'}`}>{playlist.name}</h4>
                        <p className="text-xs text-slate-500">{playlist.songs.length} tracks</p>
                      </div>
                      {isAdded ? (
                        <Check className="w-5 h-5 text-purple-500" />
                      ) : (
                        <Plus className="w-5 h-5 text-slate-600 group-hover:text-white transition-colors" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddToPlaylistModal;
