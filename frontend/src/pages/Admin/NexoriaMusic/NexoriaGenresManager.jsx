import React, { useState } from 'react';
import { 
  useGetNexoriaGenresQuery, 
  useCreateNexoriaGenreMutation,
  useDeleteNexoriaGenreMutation 
} from '../../../features/api/nexoriaMusicApiSlice';
import { Plus, Trash2, XCircle, Tag } from 'lucide-react';
import toast from 'react-hot-toast';

const NexoriaGenresManager = () => {
  const { data: response, isLoading } = useGetNexoriaGenresQuery();
  const [createGenre, { isLoading: isCreating }] = useCreateNexoriaGenreMutation();
  const [deleteGenre] = useDeleteNexoriaGenreMutation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', hexColor: '#8B5CF6' });

  const genres = response?.data || [];

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createGenre(formData).unwrap();
      toast.success('Genre created successfully');
      setIsModalOpen(false);
      setFormData({ name: '', hexColor: '#8B5CF6' });
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to create genre');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this genre?')) {
      try {
        await deleteGenre(id).unwrap();
        toast.success('Genre deleted');
      } catch (error) {
        toast.error('Failed to delete genre');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-white">Genres</h2>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Genre
        </button>
      </div>

      {isLoading ? (
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 bg-slate-800/50 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {genres.map(genre => (
            <div 
              key={genre._id} 
              className="border border-white/5 rounded-xl p-4 flex items-center justify-between group hover:brightness-110 transition-all"
              style={{ backgroundColor: `${genre.hexColor}20`, borderColor: `${genre.hexColor}40` }}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: genre.hexColor }}>
                  <Tag className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-white font-semibold truncate">{genre.name}</h3>
              </div>
              <button 
                onClick={() => handleDelete(genre._id)} 
                className="opacity-0 group-hover:opacity-100 p-2 text-white/50 hover:text-white transition-opacity"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-md overflow-hidden">
            <div className="p-4 border-b border-white/5 flex justify-between items-center">
              <h3 className="text-lg font-bold text-white">Add New Genre</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Genre Name</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Theme Color</label>
                <div className="flex items-center gap-2">
                  <input 
                    type="color" 
                    value={formData.hexColor}
                    onChange={(e) => setFormData({...formData, hexColor: e.target.value})}
                    className="w-12 h-12 p-1 rounded bg-slate-800 border border-slate-700 cursor-pointer"
                  />
                  <input 
                    type="text" 
                    value={formData.hexColor}
                    onChange={(e) => setFormData({...formData, hexColor: e.target.value})}
                    className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>
              <button 
                type="submit" 
                disabled={isCreating}
                className="w-full bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-medium py-2 rounded-lg transition-colors"
              >
                {isCreating ? 'Saving...' : 'Save Genre'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default NexoriaGenresManager;
