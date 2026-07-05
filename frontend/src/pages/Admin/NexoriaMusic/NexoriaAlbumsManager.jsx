import React, { useState } from 'react';
import { 
  useGetNexoriaAlbumsQuery, 
  useCreateNexoriaAlbumMutation,
  useUpdateNexoriaAlbumMutation,
  useDeleteNexoriaAlbumMutation,
  useGetNexoriaArtistsQuery,
  useGetNexoriaGenresQuery 
} from '../../../features/api/nexoriaMusicApiSlice';
import { Plus, Trash2, XCircle, Disc3, Edit2 } from 'lucide-react';
import toast from 'react-hot-toast';

const emptyForm = { title: '', artist: '', genre: '', type: 'Album', coverImage: '' };

const NexoriaAlbumsManager = () => {
  const { data: response, isLoading } = useGetNexoriaAlbumsQuery();
  const { data: artistsRes } = useGetNexoriaArtistsQuery();
  const { data: genresRes } = useGetNexoriaGenresQuery();
  
  const [createAlbum, { isLoading: isCreating }] = useCreateNexoriaAlbumMutation();
  const [updateAlbum, { isLoading: isUpdating }] = useUpdateNexoriaAlbumMutation();
  const [deleteAlbum] = useDeleteNexoriaAlbumMutation();
  
  const [modalMode, setModalMode] = useState(null); // 'create' | 'edit' | null
  const [editTarget, setEditTarget] = useState(null);
  const [formData, setFormData] = useState(emptyForm);

  const albums = response?.data || [];
  const artists = artistsRes?.data || [];
  const genres = genresRes?.data || [];

  const openCreate = () => {
    setFormData(emptyForm);
    setEditTarget(null);
    setModalMode('create');
  };

  const openEdit = (album) => {
    setFormData({
      title: album.title,
      artist: album.artist?._id || album.artist,
      genre: album.genre?._id || album.genre,
      type: album.type,
      coverImage: album.coverImage || ''
    });
    setEditTarget(album);
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
        await updateAlbum({ id: editTarget._id, data: formData }).unwrap();
        toast.success('Album updated successfully');
      } else {
        await createAlbum(formData).unwrap();
        toast.success('Album created successfully');
      }
      closeModal();
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to save album');
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight">Albums & EPs</h2>
          <p className="text-slate-500 text-sm mt-0.5">{albums.length} releases in the platform</p>
        </div>
        <button 
          onClick={openCreate}
          className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-purple-500/20 transition-all hover:scale-105 active:scale-95"
        >
          <Plus className="w-4 h-4" /> Add Album
        </button>
      </div>

      {isLoading ? (
        <div className="animate-pulse grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="aspect-square bg-white/5 rounded-2xl" />
          ))}
        </div>
      ) : albums.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-20 h-20 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
            <Disc3 className="w-10 h-10 text-slate-600" />
          </div>
          <p className="text-slate-400 font-semibold text-lg">No albums yet</p>
          <p className="text-slate-600 text-sm">Create your first album release</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {albums.map(album => (
            <div key={album._id} className="bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/8 rounded-2xl p-3 group hover:border-purple-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/5">
              <div className="aspect-square rounded-xl bg-slate-800 mb-3 relative overflow-hidden flex items-center justify-center shadow-lg group-hover:shadow-purple-500/20 transition-all">
                {album.coverImage ? (
                  <img src={album.coverImage} alt={album.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-purple-900/40 to-pink-900/40 flex items-center justify-center">
                    <Disc3 className="w-10 h-10 text-white/30" />
                  </div>
                )}
                {/* Quick Actions (Hover) */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-sm">
                  <button 
                    onClick={() => openEdit(album)}
                    className="p-3 bg-purple-500 text-white rounded-full hover:bg-purple-400 hover:scale-110 transition-all shadow-xl"
                    title="Edit Album"
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => handleDelete(album._id)}
                    className="p-3 bg-red-500 text-white rounded-full hover:bg-red-400 hover:scale-110 transition-all shadow-xl"
                    title="Delete Album"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <h3 className="text-white font-bold truncate text-sm mb-1">{album.title}</h3>
              <p className="text-slate-400 text-xs truncate mb-2">{album.artist?.name || 'Unknown Artist'}</p>
              <div className="flex items-center">
                <span className="text-[10px] uppercase tracking-wider font-black text-purple-400 bg-purple-500/10 px-2 py-1 rounded-lg">
                  {album.type}
                </span>
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
                <h3 className="text-lg font-black text-white">{modalMode === 'edit' ? 'Edit Album' : 'Add New Album'}</h3>
                <p className="text-slate-500 text-xs mt-0.5">{modalMode === 'edit' ? 'Update album details' : 'Release a new record'}</p>
              </div>
              <button onClick={closeModal} className="p-2 rounded-xl text-slate-500 hover:text-white hover:bg-white/10 transition-all">
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              {/* Cover Preview (Square) */}
              <div className="flex justify-center mb-6">
                <div className="w-40 h-40 rounded-2xl overflow-hidden bg-gradient-to-br from-purple-900/40 to-pink-900/40 border-2 border-white/10 shadow-2xl shadow-purple-500/10 relative">
                  {formData.coverImage ? (
                    <img src={formData.coverImage} alt="preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-white/5">
                      <Disc3 className="w-12 h-12 text-white/20 mb-2" />
                      <span className="text-[10px] text-white/40 uppercase tracking-widest font-black">Cover Art</span>
                    </div>
                  )}
                  <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-2xl pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Album Title *</label>
                <input 
                  type="text" 
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  required
                  placeholder="e.g. Midnight Echoes"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-purple-500 focus:bg-purple-500/5 transition-all text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Artist *</label>
                  <select
                    value={formData.artist}
                    onChange={(e) => setFormData({...formData, artist: e.target.value})}
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 focus:bg-purple-500/5 transition-all text-sm [&>option]:bg-slate-900"
                  >
                    <option value="">Select Artist</option>
                    {artists.map(a => <option key={a._id} value={a._id}>{a.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Genre</label>
                  <select
                    value={formData.genre}
                    onChange={(e) => setFormData({...formData, genre: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 focus:bg-purple-500/5 transition-all text-sm [&>option]:bg-slate-900"
                  >
                    <option value="">Select Genre</option>
                    {genres.map(g => <option key={g._id} value={g._id}>{g.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Release Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 focus:bg-purple-500/5 transition-all text-sm [&>option]:bg-slate-900"
                  >
                    <option value="Album">Album</option>
                    <option value="EP">EP</option>
                    <option value="Single">Single</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Cover URL</label>
                  <input 
                    type="url" 
                    value={formData.coverImage}
                    onChange={(e) => setFormData({...formData, coverImage: e.target.value})}
                    placeholder="https://..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-purple-500 focus:bg-purple-500/5 transition-all text-sm"
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
                  modalMode === 'edit' ? '✅ Update Album' : '💿 Publish Album'
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default NexoriaAlbumsManager;
