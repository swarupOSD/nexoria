import React, { useState } from 'react';
import { 
  useGetNexoriaArtistsQuery, 
  useCreateNexoriaArtistMutation,
  useDeleteNexoriaArtistMutation 
} from '../../../features/api/nexoriaMusicApiSlice';
import { Plus, Edit2, Trash2, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const NexoriaArtistsManager = () => {
  const { data: response, isLoading } = useGetNexoriaArtistsQuery();
  const [createArtist, { isLoading: isCreating }] = useCreateNexoriaArtistMutation();
  const [deleteArtist] = useDeleteNexoriaArtistMutation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', bio: '', image: '', coverImage: '', isVerified: false });

  const artists = response?.data || [];

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createArtist(formData).unwrap();
      toast.success('Artist created successfully');
      setIsModalOpen(false);
      setFormData({ name: '', bio: '', image: '', coverImage: '', isVerified: false });
    } catch (error) {
      console.error('Create artist error:', error);
      const msg = error?.data?.message || error?.message || error?.error || JSON.stringify(error);
      toast.error(`Error: ${msg}`);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this artist?')) {
      try {
        await deleteArtist(id).unwrap();
        toast.success('Artist deleted');
      } catch (error) {
        toast.error('Failed to delete artist');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-white">Artists</h2>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Artist
        </button>
      </div>

      {isLoading ? (
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-20 bg-slate-800/50 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {artists.map(artist => (
            <div key={artist._id} className="bg-slate-800/40 border border-white/5 rounded-xl p-4 flex items-center gap-4 group hover:bg-slate-800/60 transition-colors">
              <div className="w-16 h-16 rounded-full bg-slate-700 overflow-hidden flex-shrink-0 relative">
                {artist.image ? (
                  <img src={artist.image} alt={artist.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-slate-500">
                    {artist.name[0]}
                  </div>
                )}
                {artist.isVerified && (
                  <div className="absolute bottom-0 right-0 bg-blue-500 rounded-full p-0.5">
                    <CheckCircle className="w-3 h-3 text-white" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-semibold truncate">{artist.name}</h3>
                <p className="text-slate-400 text-sm truncate">{artist.totalPlays} plays</p>
              </div>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => handleDelete(artist._id)} className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg">
                  <Trash2 className="w-4 h-4" />
                </button>
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
              <h3 className="text-lg font-bold text-white">Add New Artist</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Artist Name</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Bio</label>
                <textarea 
                  value={formData.bio}
                  onChange={(e) => setFormData({...formData, bio: e.target.value})}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500 h-24"
                />
              </div>
              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  id="isVerified"
                  checked={formData.isVerified}
                  onChange={(e) => setFormData({...formData, isVerified: e.target.checked})}
                  className="rounded bg-slate-800 border-slate-700 text-purple-500 focus:ring-purple-500"
                />
                <label htmlFor="isVerified" className="text-sm font-medium text-slate-300">Verified Artist</label>
              </div>
              <button 
                type="submit" 
                disabled={isCreating}
                className="w-full bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-medium py-2 rounded-lg transition-colors"
              >
                {isCreating ? 'Saving...' : 'Save Artist'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default NexoriaArtistsManager;
