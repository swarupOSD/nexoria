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
          <h2 className="text-2xl font-bold text-white tracking-tight">Albums & EPs</h2>
          <p className="text-[#b3b3b3] text-sm mt-1">{albums.length} releases</p>
        </div>
        <button 
          onClick={openCreate}
          className="flex items-center gap-2 bg-[#1ed760] hover:scale-104 active:scale-100 hover:bg-[#1fdf64] text-black px-6 py-2.5 rounded-full font-bold text-sm transition-all"
        >
          <Plus className="w-4 h-4" /> Add Album
        </button>
      </div>

      {isLoading ? (
        <div className="animate-pulse grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="aspect-square bg-white/5 rounded-md" />
          ))}
        </div>
      ) : albums.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 rounded-md bg-white/5 flex items-center justify-center mb-4">
            <Disc3 className="w-8 h-8 text-[#b3b3b3]" />
          </div>
          <p className="text-white font-bold text-lg">No albums yet</p>
          <p className="text-[#b3b3b3] text-sm">Create your first album release</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {albums.map(album => (
            <div key={album._id} className="bg-[#181818] hover:bg-[#282828] rounded-md p-4 group transition-colors duration-300 flex flex-col cursor-default">
              <div className="aspect-square rounded-md bg-zinc-800 mb-4 relative overflow-hidden flex items-center justify-center shadow-md">
                {album.coverImage ? (
                  <img src={album.coverImage} alt={album.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-[#282828] flex items-center justify-center">
                    <Disc3 className="w-10 h-10 text-zinc-500" />
                  </div>
                )}
                {/* Quick Actions (Hover) */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-sm">
                  <button 
                    onClick={() => openEdit(album)}
                    className="p-2 bg-[#121212] hover:bg-[#2a2a2a] text-[#b3b3b3] hover:text-white rounded-full transition-colors"
                    title="Edit Album"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDelete(album._id)}
                    className="p-2 bg-[#121212] hover:bg-[#2a2a2a] text-[#b3b3b3] hover:text-red-500 rounded-full transition-colors"
                    title="Delete Album"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <h3 className="text-white font-bold truncate text-base mb-1">{album.title}</h3>
              <p className="text-[#b3b3b3] text-sm truncate">{album.artist?.name || 'Unknown Artist'}</p>
              <div className="flex items-center mt-2">
                <span className="text-xs font-medium text-[#b3b3b3]">
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
