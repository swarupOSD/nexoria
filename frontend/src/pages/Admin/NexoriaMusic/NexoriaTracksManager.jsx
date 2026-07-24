import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { playTrack } from '../../../features/music/nexoriaMusicSlice';
import { 
  useGetNexoriaTracksQuery, 
  useCreateNexoriaTrackMutation,
  useUpdateNexoriaTrackMutation,
  useDeleteNexoriaTrackMutation,
  useGetNexoriaArtistsQuery,
  useGetNexoriaAlbumsQuery,
  useGetNexoriaGenresQuery,
  useUploadNexoriaTrackAudioMutation,
  useUpdateNexoriaTrackLyricsMutation,
  useGetTrackLyricsQuery
} from '../../../features/api/nexoriaMusicApiSlice';
import { Plus, Trash2, XCircle, Music, Play, Edit2, FileText } from 'lucide-react';
import toast from 'react-hot-toast';

const emptyForm = { 
  title: '', artist: '', album: '', genre: '', trackType: 'song',
  duration: 0, audioUrl: '', coverImage: '', isPremium: false, audioFile: null, telegramFileId: null,
  lyricsRaw: ''
};

const NexoriaTracksManager = () => {
  const dispatch = useDispatch();
  const { data: response, isLoading } = useGetNexoriaTracksQuery();
  const { data: artistsRes } = useGetNexoriaArtistsQuery();
  const { data: albumsRes } = useGetNexoriaAlbumsQuery();
  const { data: genresRes } = useGetNexoriaGenresQuery();
  
  const [createTrack, { isLoading: isCreating }] = useCreateNexoriaTrackMutation();
  const [updateTrack, { isLoading: isUpdating }] = useUpdateNexoriaTrackMutation();
  const [deleteTrack] = useDeleteNexoriaTrackMutation();
  const [updateTrackLyrics] = useUpdateNexoriaTrackLyricsMutation();
  
  const [modalMode, setModalMode] = useState(null); // 'create' | 'edit' | null
  const [editTarget, setEditTarget] = useState(null);
  const [formData, setFormData] = useState(emptyForm);

  const { data: lyricsData, isFetching: isFetchingLyrics } = useGetTrackLyricsQuery(editTarget?._id, {
    skip: !editTarget || modalMode !== 'edit',
  });

  React.useEffect(() => {
    if (lyricsData?.data && editTarget) {
      let text = '';
      if (lyricsData.data.syncedLyrics && lyricsData.data.syncedLyrics.length > 0) {
        text = lyricsData.data.syncedLyrics.map(line => {
          const m = Math.floor(line.time / 60).toString().padStart(2, '0');
          const s = (line.time % 60).toFixed(2).padStart(5, '0');
          return `[${m}:${s}] ${line.text}`;
        }).join('\n');
      }
      setFormData(prev => ({ ...prev, lyricsRaw: text }));
    }
  }, [lyricsData, editTarget]);

  const tracks = response?.data || [];
  const artists = artistsRes?.data || [];
  const albums = albumsRes?.data || [];
  const genres = genresRes?.data || [];

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
      trackType: track.trackType || 'song',
      isPremium: track.isPremium || false,
      telegramFileId: track.telegramFileId || null,
      audioFile: null,
      lyricsRaw: ''
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
    if (formData.audioFile && formData.audioFile.size > 50 * 1024 * 1024) {
      return toast.error('File size must be under 50MB for Telegram CDN');
    }
    try {
      const selectedArtist = artists.find(a => a._id === formData.artist);
      
      let submitData;
      if (formData.audioFile) {
        submitData = new FormData();
        submitData.append('audio', formData.audioFile);
        submitData.append('title', formData.title);
        submitData.append('artist', formData.artist);
        if (selectedArtist) submitData.append('artistName', selectedArtist.name);
        if (formData.album) submitData.append('album', formData.album);
        if (formData.genre) submitData.append('genre', formData.genre);
        submitData.append('duration', formData.duration || 0);
        submitData.append('trackType', formData.trackType);
        submitData.append('isPremium', formData.isPremium);
        if (formData.coverImage) submitData.append('coverImage', formData.coverImage);
        if (formData.audioUrl) submitData.append('audioUrl', formData.audioUrl);
        if (formData.telegramFileId) submitData.append('telegramFileId', formData.telegramFileId);
      } else {
        submitData = { ...formData };
        if (!submitData.album) delete submitData.album;
        if (!submitData.genre) delete submitData.genre;
        delete submitData.audioFile;
      }

      if (modalMode === 'create') {
        await createTrack(submitData).unwrap();
        toast.success('Track created successfully');
      } else {
        await updateTrack({ id: editTarget._id, data: submitData }).unwrap();
        
        // Handle Lyrics update if in edit mode
        const lines = formData.lyricsRaw.split('\n').filter(l => l.trim());
        const syncedLyrics = [];
        let parseError = false;
        
        for (const line of lines) {
          const match = line.match(/\[(\d{2}):(\d{2}(?:\.\d{1,2})?)\]\s*(.*)/);
          if (match) {
            const time = parseInt(match[1]) * 60 + parseFloat(match[2]);
            syncedLyrics.push({ time, text: match[3] || '' });
          } else if (line.trim().startsWith('[')) {
            parseError = true;
          }
        }
        
        if (parseError) {
          toast.error('Some lyrics lines had invalid LRC format, but track was updated.');
        }
        
        // Only call if we have lyrics or if we want to clear them
        await updateTrackLyrics({ 
          trackId: editTarget._id, 
          data: { syncedLyrics, plainText: formData.lyricsRaw } 
        }).unwrap().catch(e => console.log('Lyrics update error', e));

        if (!parseError) toast.success('Track updated successfully');
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
          <h2 className="text-2xl font-bold text-white tracking-tight">Tracks</h2>
          <p className="text-[#b3b3b3] text-sm mt-1">{tracks.length} songs</p>
        </div>
        <button 
          onClick={openCreate}
          className="flex items-center gap-2 bg-[#1ed760] hover:scale-104 active:scale-100 hover:bg-[#1fdf64] text-black px-6 py-2.5 rounded-full font-bold text-sm transition-all"
        >
          <Plus className="w-4 h-4" /> Add Track
        </button>
      </div>

      {isLoading ? (
        <div className="animate-pulse space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-14 bg-white/5 rounded-md" />
          ))}
        </div>
      ) : tracks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
            <Music className="w-8 h-8 text-[#b3b3b3]" />
          </div>
          <p className="text-white font-bold text-lg">No tracks found</p>
          <p className="text-[#b3b3b3] text-sm">Upload your first audio track</p>
        </div>
      ) : (
        <div className="flex flex-col overflow-x-auto pb-4">
          <div className="min-w-[600px]">
            {/* Table Header */}
            <div className="grid grid-cols-[auto_1fr_64px_80px] gap-4 px-4 py-2 border-b border-white/10 text-xs text-[#b3b3b3] font-medium mb-2 uppercase tracking-wider">
              <div className="w-12 text-center">#</div>
              <div>Title</div>
              <div className="text-right">Duration</div>
              <div className="text-right">Actions</div>
            </div>

            <div className="space-y-1">
            {tracks.map((track, index) => (
              <div 
                key={track._id} 
                className="grid grid-cols-[auto_1fr_64px_80px] items-center gap-4 p-2 rounded-md hover:bg-white/10 transition-colors group cursor-default"
              >
                <div className="w-12 flex items-center justify-center text-[#b3b3b3] relative">
                  <span className="group-hover:hidden text-sm">{index + 1}</span>
                  <button 
                    onClick={() => {
                      const audioEl = document.getElementById('nexoria-global-audio');
                      if (audioEl) audioEl.play().catch(e => console.log(e));
                      dispatch(playTrack(track));
                    }}
                    className="hidden group-hover:flex absolute text-white hover:scale-110 transition-transform"
                  >
                    <Play className="w-4 h-4 fill-white" />
                  </button>
                </div>

                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded overflow-hidden bg-zinc-800 flex-shrink-0">
                    {track.coverImage || track.album?.coverImage || track.artist?.image ? (
                      <img src={track.coverImage || track.album?.coverImage || track.artist?.image} alt={track.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-zinc-800">
                        <Music className="w-4 h-4 text-zinc-500" />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-white font-medium truncate group-hover:underline cursor-pointer">{track.title}</span>
                    <span className="text-[#b3b3b3] text-sm truncate hover:underline cursor-pointer">
                      {track.artist?.name || 'Unknown Artist'}
                    </span>
                  </div>
                </div>

                <div className="text-sm text-[#b3b3b3] text-right tabular-nums">
                  {Math.floor(track.duration / 60)}:{(track.duration % 60).toString().padStart(2, '0')}
                </div>

                <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity pr-2">
                  <button onClick={() => openEdit(track)} className="text-[#b3b3b3] hover:text-white transition-colors" title="Edit">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(track._id)} className="text-[#b3b3b3] hover:text-red-500 transition-colors" title="Delete">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
          </div>
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
                    className="w-full bg-[#181818] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-[#1ed760] transition-all text-sm"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Track Type *</label>
                  <select
                    value={formData.trackType}
                    onChange={(e) => setFormData({...formData, trackType: e.target.value})}
                    required
                    className="w-full bg-[#181818] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#1ed760] transition-all text-sm [&>option]:bg-slate-900"
                  >
                    <option value="song">Song (Music)</option>
                    <option value="podcast">Podcast Episode</option>
                  </select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Artist *</label>
                    <select
                      value={formData.artist}
                      onChange={(e) => setFormData({...formData, artist: e.target.value})}
                      required
                      className="w-full bg-[#181818] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#1ed760] transition-all text-sm [&>option]:bg-slate-900"
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
                      className="w-full bg-[#181818] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#1ed760] transition-all text-sm [&>option]:bg-slate-900"
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
                      className="w-full bg-[#181818] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#1ed760] transition-all text-sm [&>option]:bg-slate-900"
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
                      className="w-full bg-[#181818] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-[#1ed760] transition-all text-sm"
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
                    className="w-full bg-[#181818] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-[#1ed760] transition-all text-sm"
                  />
                </div>

                {modalMode === 'edit' && (
                  <div>
                    <label className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                      <FileText className="w-4 h-4" /> Synced Lyrics (LRC Format)
                    </label>
                    <textarea 
                      value={formData.lyricsRaw}
                      onChange={(e) => setFormData({...formData, lyricsRaw: e.target.value})}
                      placeholder={`[00:15.22] First line of lyrics\n[00:20.10] Second line of lyrics...`}
                      rows={6}
                      className="w-full bg-[#181818] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-[#1ed760] transition-all text-sm font-mono"
                    />
                    {isFetchingLyrics && <p className="text-xs text-slate-500 mt-1">Loading existing lyrics...</p>}
                  </div>
                )}

                <div className="p-4 bg-[#181818] border border-white/10 rounded-2xl border-dashed">
                  <label className="block text-xs font-bold text-[#1ed760] uppercase tracking-wider mb-3">Upload Audio File (Max 50MB)</label>
                  <input 
                    type="file"
                    accept="audio/*, .mp3, .wav, .flac, .ogg, .m4a, .aac" 
                    onChange={(e) => setFormData({...formData, audioFile: e.target.files[0]})}
                    className="w-full text-white text-sm file:mr-4 file:py-2.5 file:px-6 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-white file:text-black hover:file:bg-gray-200 file:transition-colors file:cursor-pointer cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">OR External Audio URL</label>
                  <input 
                    type="url" 
                    value={formData.audioUrl}
                    onChange={(e) => setFormData({...formData, audioUrl: e.target.value})}
                    placeholder="https://... (Leave empty if uploading)"
                    className="w-full bg-[#181818] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-[#1ed760] transition-all text-sm"
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

                <div className="flex justify-end gap-4 mt-8">
                <button 
                  type="submit" 
                  disabled={isCreating || isUpdating}
                  className="w-full py-4 mt-2 bg-[#1ed760] hover:bg-[#1fdf64] disabled:opacity-50 text-black font-black rounded-full transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 text-sm"
                >
                  {(isCreating || isUpdating) ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Saving Track...
                    </>
                  ) : (
                    modalMode === 'edit' ? '✅ Update Track' : '🎵 Upload & Save Track'
                  )}
                </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NexoriaTracksManager;
