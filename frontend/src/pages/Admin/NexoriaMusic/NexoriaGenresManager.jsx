import React, { useState } from 'react';
import { 
  useGetNexoriaGenresQuery, 
  useCreateNexoriaGenreMutation,
  useUpdateNexoriaGenreMutation,
  useDeleteNexoriaGenreMutation 
} from '../../../features/api/nexoriaMusicApiSlice';
import { Plus, Trash2, XCircle, Tag, Edit2 } from 'lucide-react';
import toast from 'react-hot-toast';

const emptyForm = { name: '', hexColor: '#8B5CF6' };

const NexoriaGenresManager = () => {
  const { data: response, isLoading } = useGetNexoriaGenresQuery();
  const [createGenre, { isLoading: isCreating }] = useCreateNexoriaGenreMutation();
  const [updateGenre, { isLoading: isUpdating }] = useUpdateNexoriaGenreMutation();
  const [deleteGenre] = useDeleteNexoriaGenreMutation();
  
  const [modalMode, setModalMode] = useState(null); // 'create' | 'edit' | null
  const [editTarget, setEditTarget] = useState(null);
  const [formData, setFormData] = useState(emptyForm);

  const genres = response?.data || [];

  const openCreate = () => {
    setFormData(emptyForm);
    setEditTarget(null);
    setModalMode('create');
  };

  const openEdit = (genre) => {
    setFormData({ name: genre.name, hexColor: genre.hexColor });
    setEditTarget(genre);
    setModalMode('edit');
  };

  const closeModal = () => {
    setModalMode(null);
    setEditTarget(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (modalMode === 'edit' && editTarget) {
        await updateGenre({ id: editTarget._id, data: formData }).unwrap();
        toast.success('Genre updated successfully');
      } else {
        await createGenre(formData).unwrap();
        toast.success('Genre created successfully');
      }
      closeModal();
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to save genre');
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight">Music Genres</h2>
          <p className="text-slate-500 text-sm mt-0.5">{genres.length} categories available</p>
        </div>
        <button 
          onClick={openCreate}
          className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-purple-500/20 transition-all hover:scale-105 active:scale-95"
        >
          <Plus className="w-4 h-4" /> Add Genre
        </button>
      </div>

      {isLoading ? (
        <div className="animate-pulse grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-20 bg-white/5 rounded-2xl" />
          ))}
        </div>
      ) : genres.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-20 h-20 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
            <Tag className="w-10 h-10 text-slate-600" />
          </div>
          <p className="text-slate-400 font-semibold text-lg">No genres yet</p>
          <p className="text-slate-600 text-sm">Create categories to organize your music</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {genres.map(genre => (
            <div 
              key={genre._id} 
              className="relative overflow-hidden rounded-2xl p-4 flex items-center justify-between group hover:scale-[1.02] transition-all duration-300 shadow-lg border border-white/10"
              style={{ backgroundColor: `${genre.hexColor}15`, borderColor: `${genre.hexColor}30`, boxShadow: `0 10px 30px -10px ${genre.hexColor}40` }}
            >
              {/* Animated Background Glow */}
              <div 
                className="absolute top-0 right-0 w-32 h-32 rounded-full blur-[50px] opacity-20 group-hover:opacity-40 transition-opacity duration-500 pointer-events-none" 
                style={{ backgroundColor: genre.hexColor }}
              />
              
              <div className="flex items-center gap-3 relative z-10">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg" style={{ backgroundColor: genre.hexColor, boxShadow: `0 4px 15px ${genre.hexColor}40` }}>
                  <Tag className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-white font-black text-lg tracking-tight truncate">{genre.name}</h3>
              </div>
              <div className="opacity-0 group-hover:opacity-100 flex gap-2 relative z-10 transition-all">
                <button 
                  onClick={() => openEdit(genre)} 
                  className="p-2 text-white/40 hover:text-purple-400 hover:bg-purple-400/10 rounded-xl transition-all"
                >
                  <Edit2 className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => handleDelete(genre._id)} 
                  className="p-2 text-white/40 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modalMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div className="bg-[#0f0f0f] border border-white/10 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-5 border-b border-white/5 flex justify-between items-center bg-[#0f0f0f]/95">
              <div>
                <h3 className="text-lg font-black text-white">{modalMode === 'edit' ? 'Edit Genre' : 'Add New Genre'}</h3>
                <p className="text-slate-500 text-xs mt-0.5">{modalMode === 'edit' ? 'Update music category' : 'Create a music category'}</p>
              </div>
              <button onClick={closeModal} className="p-2 rounded-xl text-slate-500 hover:text-white hover:bg-white/10 transition-all">
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-5 space-y-5">
              
              {/* Live Preview Card */}
              <div className="relative">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Live Preview</label>
                <div 
                  className="rounded-2xl p-4 flex items-center gap-3 border transition-colors"
                  style={{ backgroundColor: `${formData.hexColor}15`, borderColor: `${formData.hexColor}30` }}
                >
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg" style={{ backgroundColor: formData.hexColor, boxShadow: `0 4px 15px ${formData.hexColor}40` }}>
                    <Tag className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-white font-black text-lg tracking-tight">{formData.name || 'Genre Name'}</h3>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Genre Name *</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                  placeholder="e.g. Synthwave"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-purple-500 focus:bg-purple-500/5 transition-all text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Theme Color</label>
                <div className="flex items-center gap-3">
                  <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-white/10 shadow-lg shrink-0">
                    <input 
                      type="color" 
                      value={formData.hexColor}
                      onChange={(e) => setFormData({...formData, hexColor: e.target.value})}
                      className="absolute inset-[-10px] w-20 h-20 cursor-pointer"
                    />
                  </div>
                  <input 
                    type="text" 
                    value={formData.hexColor}
                    onChange={(e) => setFormData({...formData, hexColor: e.target.value})}
                    placeholder="#8B5CF6"
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-purple-500 focus:bg-purple-500/5 transition-all text-sm font-mono"
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={isCreating || isUpdating}
                className="w-full py-3.5 mt-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:opacity-50 text-white font-black rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-purple-500/20 flex items-center justify-center gap-2 text-sm"
              >
                {isCreating || isUpdating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  modalMode === 'edit' ? '✅ Update Genre' : '🏷️ Create Genre'
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default NexoriaGenresManager;
