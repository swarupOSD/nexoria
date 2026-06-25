import React, { useState } from 'react';
import { 
  useGetAllPlaylistsAdminQuery, 
  useCreatePlaylistMutation, 
  useDeletePlaylistMutation 
} from '../../../features/api/musicApiSlice';
import { Plus, Trash2, Edit, X, ListVideo } from 'lucide-react';
import toast from 'react-hot-toast';
import FallbackImage from '../../../components/FallbackImage';

const SoundPlaylists = () => {
  const { data, isLoading } = useGetAllPlaylistsAdminQuery();
  const [createPlaylist, { isLoading: isCreating }] = useCreatePlaylistMutation();
  const [deletePlaylist] = useDeletePlaylistMutation();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '', description: '', image: '', category: 'Custom', isFeatured: false, isTrending: false
  });

  const playlists = data?.data || [];

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this playlist?')) {
      try {
        await deletePlaylist(id).unwrap();
        toast.success('Playlist deleted successfully');
      } catch (err) {
        toast.error('Failed to delete playlist');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createPlaylist(formData).unwrap();
      toast.success('Playlist created successfully!');
      setIsModalOpen(false);
      setFormData({ name: '', description: '', image: '', category: 'Custom', isFeatured: false, isTrending: false });
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to create playlist');
    }
  };

  if (isLoading) return <div className="p-8 flex justify-center"><div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div></div>;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <ListVideo className="w-6 h-6 text-purple-500" /> Manage Playlists
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Create and manage curated music playlists</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors font-medium shadow-sm"
        >
          <Plus className="w-4 h-4" /> Create Playlist
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {playlists.map(playlist => (
          <div key={playlist._id} className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden group">
            <div className="relative aspect-square">
              <FallbackImage src={playlist.image} alt={playlist.name} fallbackType="music" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
              
              <div className="absolute top-3 right-3 flex gap-2">
                {playlist.isFeatured && <span className="bg-purple-500 text-white text-[10px] font-bold px-2 py-1 rounded-md uppercase">Featured</span>}
                {playlist.isTrending && <span className="bg-pink-500 text-white text-[10px] font-bold px-2 py-1 rounded-md uppercase">Trending</span>}
              </div>

              <div className="absolute bottom-3 left-3 right-3">
                <h3 className="font-bold text-white text-lg truncate leading-tight mb-1">{playlist.name}</h3>
                <p className="text-slate-300 text-xs truncate">{playlist.songs?.length || 0} tracks • {playlist.category}</p>
              </div>
            </div>
            
            <div className="p-3 bg-slate-50 dark:bg-slate-900/50 flex justify-between items-center border-t border-slate-200 dark:border-slate-700">
              <span className={`text-xs font-bold px-2 py-1 rounded-md ${playlist.status === 'Active' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-slate-500/10 text-slate-500'}`}>
                {playlist.status}
              </span>
              <div className="flex gap-1">
                <button className="p-1.5 text-blue-500 hover:bg-blue-500/10 rounded-md transition-colors">
                  <Edit className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(playlist._id)} className="p-1.5 text-rose-500 hover:bg-rose-500/10 rounded-md transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {playlists.length === 0 && (
          <div className="col-span-full py-12 text-center bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 border-dashed">
            <ListVideo className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-1">No playlists yet</h3>
            <p className="text-slate-500">Create your first curated playlist to engage listeners.</p>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md overflow-y-auto max-h-[90vh] border border-slate-200 dark:border-slate-800">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-800 dark:text-white">Create New Playlist</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-500">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Playlist Name *</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Cover Image URL *</label>
                <input required type="url" value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none" />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
                <textarea rows="2" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none resize-none"></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Category</label>
                <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none">
                  {['Hindi Songs', 'Bengali Songs', 'English Songs', 'LoFi', 'Gaming Music', 'K-Pop', 'Top Hits', 'Latest Songs', 'Custom', 'Other'].map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={formData.isFeatured} onChange={e => setFormData({...formData, isFeatured: e.target.checked})} className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500" />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Featured</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={formData.isTrending} onChange={e => setFormData({...formData, isTrending: e.target.checked})} className="w-4 h-4 text-pink-500 rounded focus:ring-pink-500" />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Trending</span>
                </label>
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                <button disabled={isCreating} type="submit" className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl transition-colors disabled:opacity-50">
                  {isCreating ? 'Creating...' : 'Create Playlist'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SoundPlaylists;
