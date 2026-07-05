import React, { useState } from 'react';
import { 
  useGetNexoriaTracksQuery, 
  useCreateNexoriaTrackMutation,
  useUpdateNexoriaTrackMutation,
  useDeleteNexoriaTrackMutation,
  useGetNexoriaArtistsQuery,
  useGetNexoriaAlbumsQuery,
  useGetNexoriaGenresQuery,
  useUploadNexoriaTrackAudioMutation
} from '../../../features/api/nexoriaMusicApiSlice';
import { Plus, Trash2, XCircle, Music, Play, Edit2 } from 'lucide-react';
import toast from 'react-hot-toast';

const emptyForm = { 
  title: '', artist: '', album: '', genre: '', 
  duration: 0, audioUrl: '', coverImage: '', isPremium: false, audioFile: null 
};

const NexoriaTracksManager = () => {
  const { data: response, isLoading } = useGetNexoriaTracksQuery();
  const { data: artistsRes } = useGetNexoriaArtistsQuery();
  const { data: albumsRes } = useGetNexoriaAlbumsQuery();
  const { data: genresRes } = useGetNexoriaGenresQuery();
  
  const [createTrack, { isLoading: isCreating }] = useCreateNexoriaTrackMutation();
  const [updateTrack, { isLoading: isUpdating }] = useUpdateNexoriaTrackMutation();
  const [deleteTrack] = useDeleteNexoriaTrackMutation();
  
  const [modalMode, setModalMode] = useState(null); // 'create' | 'edit' | null
  const [editTarget, setEditTarget] = useState(null);
  const [formData, setFormData] = useState(emptyForm);

  const tracks = response?.data || [];
  const artists = artistsRes?.data || [];
  const albums = albumsRes?.data || [];
  const genres = genresRes?.data || [];

  const [uploadAudio, { isLoading: isUploading }] = useUploadNexoriaTrackAudioMutation();

  const openCreate = () => {
    setFormData(emptyForm);
    setEditTarget(null);
    setModalMode('create');
  };

  const openEdit = (track) => {
    setFormData({
      title: track.title,
      artist: track.artist?._id || track.artist,
      album: track.album?._id || track.album || '',
      genre: track.genre?._id || track.genre || '',
      duration: track.duration || 0,
      audioUrl: track.audioUrl || '',
      coverImage: track.coverImage || '',
      isPremium: track.isPremium || false,
      audioFile: null
    });
    setEditTarget(track);
    setModalMode('edit');
  };

  const closeModal = () => {
    setModalMode(null);
    setEditTarget(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.artist) return toast.error('Please select an artist');
    if (!formData.audioFile && !formData.audioUrl && modalMode === 'create') return toast.error('Please upload an audio file or provide a URL');
    if (formData.audioFile && formData.audioFile.size > 20 * 1024 * 1024) {
      return toast.error('File size must be under 20MB for Telegram CDN');
    }
    
    // Default album handling if not provided
    const payload = { ...formData };
    if (!payload.album) delete payload.album;
    if (!payload.genre) delete payload.genre;

    try {
      let telegramFileId = null;
      let finalDuration = formData.duration;
      let finalAudioUrl = formData.audioUrl;

      // If there's an actual file, upload it to Telegram CDN first
      if (formData.audioFile) {
        const uploadData = new FormData();
        uploadData.append('audio', formData.audioFile);
        uploadData.append('title', formData.title);
        
        const selectedArtist = artists.find(a => a._id === formData.artist);
        if (selectedArtist) {
          uploadData.append('artistName', selectedArtist.name);
        }

        const uploadRes = await uploadAudio(uploadData).unwrap();
        telegramFileId = uploadRes.data.telegramFileId;
        
        // Use Telegram's parsed duration if the user didn't provide one
        if (!finalDuration || finalDuration === 0) {
          finalDuration = uploadRes.data.duration;
        }
      }

      payload.telegramFileId = telegramFileId;
      payload.duration = finalDuration;
      payload.audioUrl = finalAudioUrl;
      delete payload.audioFile;

      if (modalMode === 'edit' && editTarget) {
        await updateTrack({ id: editTarget._id, data: payload }).unwrap();
        toast.success('Track updated successfully');
      } else {
        await createTrack(payload).unwrap();
        toast.success('Track created successfully');
      }
      closeModal();
    } catch (error) {
      console.error(error);
      toast.error(error?.data?.message || 'Failed to process track');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this track?')) {
      try {
        await deleteTrack(id).unwrap();
        toast.success('Track deleted');
      } catch (error) {
        toast.error('Failed to delete track');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight">Audio Tracks</h2>
          <p className="text-slate-500 text-sm mt-0.5">{tracks.length} songs available</p>
        </div>
        <button 
          onClick={openCreate}
          className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-purple-500/20 transition-all hover:scale-105 active:scale-95"
        >
          <Plus className="w-4 h-4" /> Add Track
        </button>
      </div>

      {isLoading ? (
        <div className="animate-pulse space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-white/5 rounded-2xl" />
          ))}
        </div>
      ) : tracks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-20 h-20 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
            <Music className="w-10 h-10 text-slate-600" />
          </div>
          <p className="text-slate-400 font-semibold text-lg">No tracks yet</p>
          <p className="text-slate-600 text-sm">Upload your first audio track</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tracks.map(track => (
            <div 
              key={track._id} 
              className="bg-gradient-to-r from-white/5 to-white/[0.02] border border-white/8 rounded-2xl p-3 flex items-center gap-4 group hover:border-purple-500/30 hover:bg-purple-500/5 transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center relative overflow-hidden flex-shrink-0 shadow-lg group-hover:shadow-purple-500/20 transition-all">
                <Music className="w-5 h-5 text-slate-400 group-hover:text-purple-400 transition-colors" />
                <div className="absolute inset-0 bg-purple-500/80 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-all backdrop-blur-sm">
                  <Play className="w-5 h-5 text-white ml-0.5 fill-white" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <h3 className="text-white font-bold truncate text-[15px]">{track.title}</h3>
                  {track.isPremium && (
                    <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[9px] uppercase font-black px-2 py-0.5 rounded-full shadow-lg shadow-amber-500/20">PRO</span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400 truncate">
                  <span className="font-medium text-purple-400/80">{track.artist?.name || 'Unknown'}</span>
                  {track.album && (
                    <>
                      <span className="w-1 h-1 bg-slate-600 rounded-full" />
                      <span className="text-slate-500">{track.album.title}</span>
                    </>
                  )}
                </div>
              </div>
              <div className="text-sm font-bold text-slate-500 w-16 text-right font-mono bg-white/5 px-2 py-1 rounded-lg">
                {Math.floor(track.duration / 60)}:{(track.duration % 60).toString().padStart(2, '0')}
              </div>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => openEdit(track)} className="p-3 text-slate-500 hover:text-purple-400 hover:bg-purple-400/10 rounded-xl transition-all">
                  <Edit2 className="w-5 h-5" />
                </button>
                <button onClick={() => handleDelete(track._id)} className="p-3 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all">
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
          <div className="bg-[#0f0f0f] border border-white/10 rounded-3xl w-full max-w-lg max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
            <div className="p-5 border-b border-white/5 flex justify-between items-center bg-[#0f0f0f]/95 shrink-0">
              <div>
                <h3 className="text-lg font-black text-white">{modalMode === 'edit' ? 'Edit Track' : 'Add New Track'}</h3>
                <p className="text-slate-500 text-xs mt-0.5">{modalMode === 'edit' ? 'Update track details' : 'Upload a new audio file'}</p>
              </div>
              <button onClick={closeModal} className="p-2 rounded-xl text-slate-500 hover:text-white hover:bg-white/10 transition-all">
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            
            <div className="overflow-y-auto hide-scrollbar p-5">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Track Title *</label>
                  <input 
                    type="text" 
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    required
                    placeholder="e.g. Blinding Lights"
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
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Album</label>
                    <select
                      value={formData.album}
                      onChange={(e) => setFormData({...formData, album: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 focus:bg-purple-500/5 transition-all text-sm [&>option]:bg-slate-900"
                    >
                      <option value="">None / Single</option>
                      {albums.filter(a => a.artist?._id === formData.artist || !formData.artist).map(a => (
                        <option key={a._id} value={a._id}>{a.title}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
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
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Duration (Secs)</label>
                    <input 
                      type="number" 
                      value={formData.duration}
                      onChange={(e) => setFormData({...formData, duration: Number(e.target.value)})}
                      min="0"
                      placeholder="Auto-calculated"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-purple-500 focus:bg-purple-500/5 transition-all text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Track Cover Image URL (Optional)</label>
                  <input 
                    type="url" 
                    value={formData.coverImage}
                    onChange={(e) => setFormData({...formData, coverImage: e.target.value})}
                    placeholder="https://..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-purple-500 focus:bg-purple-500/5 transition-all text-sm"
                  />
                </div>

                <div className="p-4 bg-gradient-to-br from-purple-500/5 to-pink-500/5 border border-purple-500/20 rounded-2xl">
                  <label className="block text-xs font-bold text-purple-400 uppercase tracking-wider mb-3">Upload Audio File (Max 20MB)</label>
                  <input 
                    type="file"
                    accept="audio/mpeg, audio/mp3, audio/flac, audio/wav" 
                    onChange={(e) => setFormData({...formData, audioFile: e.target.files[0]})}
                    className="w-full text-white text-sm file:mr-4 file:py-2.5 file:px-6 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-purple-600 file:text-white hover:file:bg-purple-500 file:transition-colors file:cursor-pointer cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">OR External Audio URL</label>
                  <input 
                    type="url" 
                    value={formData.audioUrl}
                    onChange={(e) => setFormData({...formData, audioUrl: e.target.value})}
                    placeholder="https://... (Leave empty if uploading)"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-purple-500 focus:bg-purple-500/5 transition-all text-sm"
                  />
                </div>

                <div className="flex items-center gap-3 p-4 bg-amber-500/5 border border-amber-500/20 rounded-2xl mt-2">
                  <input 
                    type="checkbox" 
                    id="isPremium"
                    checked={formData.isPremium}
                    onChange={(e) => setFormData({...formData, isPremium: e.target.checked})}
                    className="w-5 h-5 rounded bg-black/50 border-white/10 text-amber-500 focus:ring-amber-500 focus:ring-offset-0 cursor-pointer"
                  />
                  <div>
                    <label htmlFor="isPremium" className="text-sm font-bold text-amber-500 cursor-pointer block">
                      Require Premium Subscription
                    </label>
                    <p className="text-amber-500/60 text-xs">Only PRO users can play this track</p>
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={isCreating || isUpdating || isUploading}
                  className="w-full py-4 mt-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:opacity-50 text-white font-black rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-purple-500/20 flex items-center justify-center gap-2 text-sm"
                >
                  {isUploading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Uploading to Telegram CDN...
                    </>
                  ) : (isCreating || isUpdating) ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Saving Track...
                    </>
                  ) : (
                    modalMode === 'edit' ? '✅ Update Track' : '🎵 Upload & Save Track'
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NexoriaTracksManager;
