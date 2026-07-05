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
          <h2 className="text-2xl font-black text-white tracking-tight">Artists</h2>
          <p className="text-slate-500 text-sm mt-0.5">{artists.length} artists in the platform</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-purple-500/20 transition-all hover:scale-105 active:scale-95"
        >
          <Plus className="w-4 h-4" /> Add Artist
        </button>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-28 bg-white/5 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : artists.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-20 h-20 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
            <Mic2 className="w-10 h-10 text-slate-600" />
          </div>
          <p className="text-slate-400 font-semibold text-lg">No artists yet</p>
          <p className="text-slate-600 text-sm">Add your first artist to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {artists.map(artist => (
            <div
              key={artist._id}
              className="group relative bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/8 rounded-2xl overflow-hidden hover:border-purple-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/5"
            >
              {/* Cover Banner */}
              <div className="relative h-20 bg-gradient-to-r from-purple-900/60 via-pink-900/40 to-indigo-900/60 overflow-hidden">
                {artist.coverImage && (
                  <img src={artist.coverImage} alt="" className="w-full h-full object-cover opacity-40" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent" />
              </div>

              {/* Artist Info */}
              <div className="px-4 pb-4">
                <div className="flex items-end gap-3 -mt-8 mb-3">
                  {/* Avatar */}
                  <div className="w-16 h-16 rounded-2xl border-2 border-[#0a0a0a] overflow-hidden bg-gradient-to-br from-purple-800 to-pink-800 shrink-0 shadow-xl">
                    {artist.image ? (
                      <img src={artist.image} alt={artist.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl font-black text-white">
                        {artist.name?.[0]?.toUpperCase()}
                      </div>
                    )}
                  </div>
                  {/* Name & badge */}
                  <div className="flex-1 min-w-0 pb-1">
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-white font-black text-base truncate">{artist.name}</h3>
                      {artist.isVerified && (
                        <CheckCircle className="w-4 h-4 text-blue-400 shrink-0 fill-blue-400/20" />
                      )}
                    </div>
                    <p className="text-slate-500 text-xs">{(artist.totalPlays || 0).toLocaleString()} plays</p>
                  </div>
                </div>

                {/* Bio */}
                {artist.bio && (
                  <p className="text-slate-400 text-xs leading-relaxed line-clamp-2 mb-3">{artist.bio}</p>
                )}

                {/* Actions */}
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => openEdit(artist)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-bold text-purple-400 bg-purple-400/10 hover:bg-purple-400/20 rounded-xl transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(artist)}
                    className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold text-red-400 bg-red-400/10 hover:bg-red-400/20 rounded-xl transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div className="bg-[#0f0f0f] border border-white/10 rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Modal Header */}
            <div className="p-5 border-b border-white/5 flex items-center justify-between sticky top-0 bg-[#0f0f0f]/95 backdrop-blur-sm z-10 rounded-t-3xl">
              <div>
                <h3 className="text-lg font-black text-white">{modal === 'edit' ? 'Edit Artist' : 'Add New Artist'}</h3>
                <p className="text-slate-500 text-xs mt-0.5">{modal === 'edit' ? 'Update artist info' : 'Add a new artist to the platform'}</p>
              </div>
              <button onClick={closeModal} className="p-2 rounded-xl text-slate-500 hover:text-white hover:bg-white/10 transition-all">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              {/* Live Preview (Banner + Avatar) */}
              <div className="relative mb-6">
                {/* Banner */}
                <div className="h-24 w-full rounded-2xl bg-gradient-to-r from-purple-900/40 to-pink-900/40 overflow-hidden relative border border-white/5">
                  {formData.coverImage && (
                    <img src={formData.coverImage} alt="cover preview" className="w-full h-full object-cover opacity-50" />
                  )}
                </div>
                {/* Avatar (Circle) */}
                <div className="absolute -bottom-5 left-1/2 -translate-x-1/2">
                  <div className="w-20 h-20 rounded-full border-4 border-[#0f0f0f] bg-gradient-to-br from-purple-800 to-pink-800 overflow-hidden shadow-2xl relative">
                    {formData.image && !imgPreviewError ? (
                      <img
                        src={formData.image}
                        alt="avatar preview"
                        className="w-full h-full object-cover"
                        onError={() => setImgPreviewError(true)}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Mic2 className="w-8 h-8 text-white/30" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="h-2"></div> {/* Spacer for the avatar overlap */}

              {/* Name */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Artist Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="e.g. Arijit Singh"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-purple-500 focus:bg-purple-500/5 transition-all text-sm"
                />
              </div>

              {/* Image URL */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  <span className="flex items-center gap-1.5"><Link className="w-3 h-3" /> Profile Image URL</span>
                </label>
                <input
                  type="url"
                  value={formData.image}
                  onChange={(e) => { setFormData({ ...formData, image: e.target.value }); setImgPreviewError(false); }}
                  placeholder="Paste Google Images URL here..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-purple-500 focus:bg-purple-500/5 transition-all text-sm"
                />
                <p className="text-slate-600 text-xs mt-1.5">
                  💡 Google Images → Right click → "Copy image address"
                </p>
              </div>

              {/* Cover Image URL */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  <span className="flex items-center gap-1.5"><Link className="w-3 h-3" /> Cover / Banner Image URL (Optional)</span>
                </label>
                <input
                  type="url"
                  value={formData.coverImage}
                  onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                  placeholder="Wide banner image URL..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-purple-500 focus:bg-purple-500/5 transition-all text-sm"
                />
              </div>

              {/* Bio */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Bio</label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Write a short artist bio... (shown on their profile page)"
                  rows={4}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-purple-500 focus:bg-purple-500/5 transition-all text-sm resize-none"
                />
              </div>

              {/* Verified */}
              <label className="flex items-center gap-3 p-3 bg-blue-500/5 border border-blue-500/20 rounded-xl cursor-pointer hover:bg-blue-500/10 transition-colors">
                <input
                  type="checkbox"
                  checked={formData.isVerified}
                  onChange={(e) => setFormData({ ...formData, isVerified: e.target.checked })}
                  className="w-4 h-4 rounded text-blue-500 bg-slate-800 border-slate-600 focus:ring-blue-500 focus:ring-2"
                />
                <div>
                  <p className="text-sm font-bold text-blue-400 flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4" /> Verified Artist
                  </p>
                  <p className="text-xs text-slate-500">Shows blue verified badge on profile</p>
                </div>
              </label>

              {/* Submit */}
              <button
                type="submit"
                disabled={isSaving}
                className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-purple-500/20 flex items-center justify-center gap-2 text-sm"
              >
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {modal === 'edit' ? 'Updating...' : 'Adding...'}
                  </>
                ) : (
                  modal === 'edit' ? '✅ Update Artist' : '🎤 Add Artist'
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default NexoriaArtistsManager;
