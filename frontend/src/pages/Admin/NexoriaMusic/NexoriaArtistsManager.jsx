import React, { useState } from 'react';
import { 
  useGetNexoriaArtistsQuery, 
  useCreateNexoriaArtistMutation,
  useUpdateNexoriaArtistMutation,
  useDeleteNexoriaArtistMutation 
} from '../../../features/api/nexoriaMusicApiSlice';
import { Plus, Edit2, Trash2, CheckCircle, XCircle, Music2, Users, Link, Mic2 } from 'lucide-react';
import toast from 'react-hot-toast';

const emptyForm = { name: '', bio: '', image: '', coverImage: '', isVerified: false };

const NexoriaArtistsManager = () => {
  const { data: response, isLoading } = useGetNexoriaArtistsQuery();
  const [createArtist, { isLoading: isCreating }] = useCreateNexoriaArtistMutation();
  const [updateArtist, { isLoading: isUpdating }] = useUpdateNexoriaArtistMutation();
  const [deleteArtist] = useDeleteNexoriaArtistMutation();

  const [modal, setModal] = useState(null); // null | 'create' | 'edit'
  const [editTarget, setEditTarget] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [imgPreviewError, setImgPreviewError] = useState(false);

  const artists = response?.data || [];

  const openCreate = () => {
    setFormData(emptyForm);
    setEditTarget(null);
    setImgPreviewError(false);
    setModal('create');
  };

  const openEdit = (artist) => {
    setFormData({
      name: artist.name || '',
      bio: artist.bio || '',
      image: artist.image || '',
      coverImage: artist.coverImage || '',
      isVerified: artist.isVerified || false,
    });
    setEditTarget(artist);
    setImgPreviewError(false);
    setModal('edit');
  };

  const closeModal = () => { setModal(null); setEditTarget(null); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (modal === 'edit' && editTarget) {
        await updateArtist({ id: editTarget._id, data: formData }).unwrap();
        toast.success('Artist updated! 🎤');
      } else {
        await createArtist(formData).unwrap();
        toast.success('Artist added! 🎉');
      }
      closeModal();
    } catch (error) {
      console.error(error);
      toast.error(error?.data?.message || 'Something went wrong');
    }
  };

  const handleDelete = async (artist) => {
    if (!window.confirm(`Delete "${artist.name}"? This cannot be undone.`)) return;
    try {
      await deleteArtist(artist._id).unwrap();
      toast.success('Artist removed');
    } catch {
      toast.error('Failed to delete');
    }
  };

  const isSaving = isCreating || isUpdating;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Artists</h2>
          <p className="text-[#b3b3b3] text-sm mt-1">{artists.length} artists in the platform</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-[#1ed760] hover:scale-104 active:scale-100 hover:bg-[#1fdf64] text-black px-6 py-2.5 rounded-full font-bold text-sm transition-all"
        >
          <Plus className="w-4 h-4" /> Add Artist
        </button>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="aspect-square bg-white/5 rounded-full animate-pulse mx-auto w-[160px]" />
          ))}
        </div>
      ) : artists.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
            <Mic2 className="w-8 h-8 text-[#b3b3b3]" />
          </div>
          <p className="text-white font-bold text-lg">No artists yet</p>
          <p className="text-[#b3b3b3] text-sm">Add your first artist to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {artists.map(artist => (
            <div
              key={artist._id}
              className="group relative bg-[#181818] hover:bg-[#282828] p-4 rounded-md transition-colors duration-300 flex flex-col items-center cursor-default"
            >
              {/* Avatar (Circle) */}
              <div className="w-full aspect-square rounded-full overflow-hidden bg-zinc-800 shadow-md mb-4 relative">
                {artist.image ? (
                  <img 
                    src={artist.image} 
                    alt={artist.name} 
                    className="w-full h-full object-cover" 
                    onError={(e) => { 
                      e.target.onerror = null; 
                      e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(artist.name || 'Artist')}&background=random&color=fff&size=256`; 
                    }} 
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-3xl font-black text-white">
                    {artist.name?.[0]?.toUpperCase()}
                  </div>
                )}
              </div>
              
              {/* Name & badge */}
              <div className="text-center w-full min-w-0">
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <h3 className="text-white font-bold text-base truncate">{artist.name}</h3>
                  {artist.isVerified && (
                    <CheckCircle className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  )}
                </div>
                <p className="text-[#b3b3b3] text-sm truncate">Artist</p>
              </div>

              {/* Hover Actions */}
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => openEdit(artist)} 
                  className="p-2 bg-[#121212] hover:bg-[#2a2a2a] rounded-full text-[#b3b3b3] hover:text-white transition-colors"
                  title="Edit"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button 
                  onClick={() => handleDelete(artist)} 
                  className="p-2 bg-[#121212] hover:bg-[#2a2a2a] rounded-full text-[#b3b3b3] hover:text-red-500 transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}


      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div className="bg-[#121212] border border-white/10 rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Modal Header */}
            <div className="p-5 border-b border-white/5 flex items-center justify-between sticky top-0 bg-[#121212]/95 backdrop-blur-sm z-10 rounded-t-xl">
              <div>
                <h3 className="text-lg font-bold text-white tracking-tight">{modal === 'edit' ? 'Edit Artist' : 'Add New Artist'}</h3>
                <p className="text-[#b3b3b3] text-sm mt-0.5">{modal === 'edit' ? 'Update artist info' : 'Add a new artist to the platform'}</p>
              </div>
              <button onClick={closeModal} className="p-2 rounded-full text-[#b3b3b3] hover:text-white hover:bg-white/10 transition-all">
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-6">
              {/* Live Preview (Banner + Avatar) */}
              <div className="relative mb-8">
                {/* Banner */}
                <div className="h-32 w-full rounded-lg bg-[#282828] overflow-hidden relative border border-white/5">
                  {formData.coverImage && (
                    <img src={formData.coverImage} alt="cover preview" className="w-full h-full object-cover opacity-70" />
                  )}
                </div>
                {/* Avatar (Circle) */}
                <div className="absolute -bottom-8 left-6">
                  <div className="w-24 h-24 rounded-full border-4 border-[#121212] bg-[#282828] overflow-hidden shadow-2xl relative">
                    {formData.image && !imgPreviewError ? (
                      <img
                        src={formData.image}
                        alt="avatar preview"
                        className="w-full h-full object-cover"
                        onError={() => setImgPreviewError(true)}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Mic2 className="w-8 h-8 text-[#b3b3b3]" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="h-4"></div> {/* Spacer */}

              {/* Name */}
              <div>
                <label className="block text-sm font-bold text-white mb-2">Artist Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="e.g. Arijit Singh"
                  className="w-full bg-[#181818] border border-transparent focus:border-white/20 rounded-md px-4 py-3 text-white placeholder-[#b3b3b3] focus:outline-none transition-all text-sm hover:bg-[#282828]"
                />
              </div>

              {/* Image URL */}
              <div>
                <label className="block text-sm font-bold text-white mb-2">
                  <span className="flex items-center gap-1.5"><Link className="w-3.5 h-3.5" /> Profile Image URL</span>
                </label>
                <input
                  type="url"
                  value={formData.image}
                  onChange={(e) => { setFormData({ ...formData, image: e.target.value }); setImgPreviewError(false); }}
                  placeholder="Paste URL here..."
                  className="w-full bg-[#181818] border border-transparent focus:border-white/20 rounded-md px-4 py-3 text-white placeholder-[#b3b3b3] focus:outline-none transition-all text-sm hover:bg-[#282828]"
                />
              </div>

              {/* Cover Image URL */}
              <div>
                <label className="block text-sm font-bold text-white mb-2">
                  <span className="flex items-center gap-1.5"><Link className="w-3.5 h-3.5" /> Cover Image URL</span>
                </label>
                <input
                  type="url"
                  value={formData.coverImage}
                  onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                  placeholder="Wide banner image URL..."
                  className="w-full bg-[#181818] border border-transparent focus:border-white/20 rounded-md px-4 py-3 text-white placeholder-[#b3b3b3] focus:outline-none transition-all text-sm hover:bg-[#282828]"
                />
              </div>

              {/* Bio */}
              <div>
                <label className="block text-sm font-bold text-white mb-2">Bio</label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Write a short artist bio..."
                  rows={4}
                  className="w-full bg-[#181818] border border-transparent focus:border-white/20 rounded-md px-4 py-3 text-white placeholder-[#b3b3b3] focus:outline-none transition-all text-sm resize-none hover:bg-[#282828]"
                />
              </div>

              {/* Verified */}
              <label className="flex items-center gap-3 p-4 bg-[#181818] hover:bg-[#282828] rounded-md cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={formData.isVerified}
                  onChange={(e) => setFormData({ ...formData, isVerified: e.target.checked })}
                  className="w-4 h-4 rounded text-[#1ed760] bg-[#121212] border-[#282828] focus:ring-[#1ed760] focus:ring-offset-[#181818]"
                />
                <div>
                  <p className="text-sm font-bold text-white flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4 text-[#1ed760]" /> Verified Artist
                  </p>
                  <p className="text-sm text-[#b3b3b3]">Shows blue verified badge on profile</p>
                </div>
              </label>

              {/* Submit */}
              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-6 py-3 rounded-full font-bold text-white hover:scale-105 transition-transform"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-8 py-3 bg-[#1ed760] text-black font-bold rounded-full hover:scale-105 hover:bg-[#1fdf64] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default NexoriaArtistsManager;
