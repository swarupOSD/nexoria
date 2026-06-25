import React, { useState } from 'react';
import { useGetAllSongsAdminQuery, useDeleteSongMutation, useUpdateSongMutation } from '../../../features/api/musicApiSlice';
import { Link } from 'react-router-dom';
import { Plus, Trash2, Edit, X } from 'lucide-react';
import toast from 'react-hot-toast';

const SoundSongs = () => {
  const { data, isLoading } = useGetAllSongsAdminQuery();
  const [deleteSong] = useDeleteSongMutation();
  const [updateSong, { isLoading: isUpdating }] = useUpdateSongMutation();

  const [editSong, setEditSong] = useState(null);

  const categories = [
    'Hindi', 'Bengali', 'English', 'Tamil', 'Telugu', 'Punjabi', 
    'K-Pop', 'Anime Songs', 'Gaming Music', 'LoFi', 'Instrumental', 
    'Remix', 'Devotional', 'Other'
  ];

  if (isLoading) return <div className="p-8 flex justify-center"><div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div></div>;
  
  const songs = data?.data || [];

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this song?')) {
      try {
        await deleteSong(id).unwrap();
        toast.success('Song deleted successfully');
      } catch (err) {
        toast.error('Failed to delete song');
      }
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateSong({ id: editSong._id, ...editSong }).unwrap();
      toast.success('Song updated successfully');
      setEditSong(null);
    } catch (err) {
      toast.error('Failed to update song');
    }
  };

  return (
    <div className="p-6 relative">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Manage Songs</h1>
        <Link to="/superadmin/sound/add-song" className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors">
          <Plus className="w-4 h-4" /> Add Song
        </Link>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
              <th className="p-4 text-sm font-bold text-slate-500 dark:text-slate-400">Song</th>
              <th className="p-4 text-sm font-bold text-slate-500 dark:text-slate-400">Category</th>
              <th className="p-4 text-sm font-bold text-slate-500 dark:text-slate-400">Plays</th>
              <th className="p-4 text-sm font-bold text-slate-500 dark:text-slate-400">Actions</th>
            </tr>
          </thead>
          <tbody>
            {songs.map(song => (
              <tr key={song._id} className="border-b border-slate-200 dark:border-slate-700 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <img src={song.image} alt="" className="w-10 h-10 rounded-lg object-cover" />
                    <div>
                      <p className="font-bold text-slate-800 dark:text-white">{song.title}</p>
                      <p className="text-xs text-slate-500">{song.artist}</p>
                    </div>
                  </div>
                </td>
                <td className="p-4 text-slate-600 dark:text-slate-300">{song.category}</td>
                <td className="p-4 text-slate-600 dark:text-slate-300">{song.playCount}</td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <button onClick={() => setEditSong({...song})} className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition-colors">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(song._id)} className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {songs.length === 0 && (
              <tr>
                <td colSpan="4" className="p-8 text-center text-slate-500">No songs found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {editSong && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-800 dark:text-white">Edit Song</h2>
              <button onClick={() => setEditSong(null)} className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Title</label>
                  <input required type="text" value={editSong.title} onChange={e => setEditSong({...editSong, title: e.target.value})} className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Artist</label>
                  <input required type="text" value={editSong.artist} onChange={e => setEditSong({...editSong, artist: e.target.value})} className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Category</label>
                  <select required value={editSong.category} onChange={e => setEditSong({...editSong, category: e.target.value})} className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg">
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description (Optional)</label>
                  <textarea rows="3" value={editSong.description || ''} onChange={e => setEditSong({...editSong, description: e.target.value})} className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg" placeholder="Write something about this song..."></textarea>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Album (Optional)</label>
                  <input type="text" value={editSong.album || ''} onChange={e => setEditSong({...editSong, album: e.target.value})} className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Cover Image URL</label>
                  <input required type="url" value={editSong.image} onChange={e => setEditSong({...editSong, image: e.target.value})} className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Audio URL</label>
                  <input required type="url" value={editSong.audioUrl} onChange={e => setEditSong({...editSong, audioUrl: e.target.value})} className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg" />
                </div>
                <div className="md:col-span-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={editSong.isYoutube} onChange={e => setEditSong({...editSong, isYoutube: e.target.checked})} className="w-4 h-4 text-purple-600 rounded" />
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Is this a YouTube Link?</span>
                  </label>
                </div>
              </div>
              <button disabled={isUpdating} type="submit" className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl transition-colors mt-6">
                {isUpdating ? 'Updating...' : 'Save Changes'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SoundSongs;
