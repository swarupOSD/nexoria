import React, { useState } from 'react';
import { 
  useGetNexoriaAlbumsQuery, 
  useCreateNexoriaAlbumMutation,
  useDeleteNexoriaAlbumMutation,
  useGetNexoriaArtistsQuery,
  useGetNexoriaGenresQuery
} from '../../../features/api/nexoriaMusicApiSlice';
import { Plus, Trash2, XCircle, Disc3 } from 'lucide-react';
import toast from 'react-hot-toast';

const NexoriaAlbumsManager = () => {
  const { data: response, isLoading } = useGetNexoriaAlbumsQuery();
  const { data: artistsRes } = useGetNexoriaArtistsQuery();
  const { data: genresRes } = useGetNexoriaGenresQuery();
  
  const [createAlbum, { isLoading: isCreating }] = useCreateNexoriaAlbumMutation();
  const [deleteAlbum] = useDeleteNexoriaAlbumMutation();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ title: '', artist: '', genre: '', type: 'Album', coverImage: '' });

  const albums = response?.data || [];
  const artists = artistsRes?.data || [];
  const genres = genresRes?.data || [];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.artist) return toast.error('Please select an artist');
    
    try {
      await createAlbum(formData).unwrap();
      toast.success('Album created successfully');
      setIsModalOpen(false);
      setFormData({ title: '', artist: '', genre: '', type: 'Album', coverImage: '' });
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to create album');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this album?')) {
      try {
        await deleteAlbum(id).unwrap();
        toast.success('Album deleted');
      } catch (error) {
        toast.error('Failed to delete album');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-white">Albums & EPs</h2>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Album
        </button>
      </div>

      {isLoading ? (
        <div className="animate-pulse grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="aspect-square bg-slate-800/50 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {albums.map(album => (
            <div key={album._id} className="bg-slate-800/40 border border-white/5 rounded-xl p-3 group hover:bg-slate-800/60 transition-colors">
              <div className="aspect-square rounded-lg bg-slate-700 mb-3 relative overflow-hidden flex items-center justify-center">
                {album.coverImage ? (
                  <img src={album.coverImage} alt={album.title} className="w-full h-full object-cover" />
                ) : (
                  <Disc3 className="w-10 h-10 text-slate-500" />
                )}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button onClick={() => handleDelete(album._id)} className="p-2 text-white bg-red-500/80 hover:bg-red-500 rounded-full backdrop-blur-sm transition-colors">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <h3 className="text-white font-semibold truncate text-sm">{album.title}</h3>
              <p className="text-slate-400 text-xs truncate">{album.artist?.name || 'Unknown Artist'}</p>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-wider font-bold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full">
                  {album.type}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Basic Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-md overflow-hidden">
            <div className="p-4 border-b border-white/5 flex justify-between items-center">
              <h3 className="text-lg font-bold text-white">Add New Album</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Title</label>
                <input 
                  type="text" 
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  required
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Artist</label>
                  <select
                    value={formData.artist}
                    onChange={(e) => setFormData({...formData, artist: e.target.value})}
                    required
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="">Select Artist</option>
                    {artists.map(a => <option key={a._id} value={a._id}>{a.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Genre</label>
                  <select
                    value={formData.genre}
                    onChange={(e) => setFormData({...formData, genre: e.target.value})}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="">Select Genre</option>
                    {genres.map(g => <option key={g._id} value={g._id}>{g.name}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="Album">Album</option>
                  <option value="EP">EP</option>
                  <option value="Single">Single</option>
                </select>
              </div>
              <button 
                type="submit" 
                disabled={isCreating}
                className="w-full bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-medium py-2 rounded-lg transition-colors"
              >
                {isCreating ? 'Saving...' : 'Save Album'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default NexoriaAlbumsManager;
