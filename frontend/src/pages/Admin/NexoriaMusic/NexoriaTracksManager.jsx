import React, { useState } from 'react';
import { 
  useGetNexoriaTracksQuery, 
  useCreateNexoriaTrackMutation,
  useDeleteNexoriaTrackMutation,
  useGetNexoriaArtistsQuery,
  useGetNexoriaAlbumsQuery,
  useGetNexoriaGenresQuery
} from '../../../features/api/nexoriaMusicApiSlice';
import { Plus, Trash2, XCircle, Music, Play } from 'lucide-react';
import toast from 'react-hot-toast';

const NexoriaTracksManager = () => {
  const { data: response, isLoading } = useGetNexoriaTracksQuery();
  const { data: artistsRes } = useGetNexoriaArtistsQuery();
  const { data: albumsRes } = useGetNexoriaAlbumsQuery();
  const { data: genresRes } = useGetNexoriaGenresQuery();
  
  const [createTrack, { isLoading: isCreating }] = useCreateNexoriaTrackMutation();
  const [deleteTrack] = useDeleteNexoriaTrackMutation();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ 
    title: '', artist: '', album: '', genre: '', 
    duration: 0, audioUrl: '', isPremium: false 
  });

  const tracks = response?.data || [];
  const artists = artistsRes?.data || [];
  const albums = albumsRes?.data || [];
  const genres = genresRes?.data || [];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.artist) return toast.error('Please select an artist');
    if (!formData.audioUrl) return toast.error('Audio URL is required');
    
    // Default album handling if not provided
    const payload = { ...formData };
    if (!payload.album) delete payload.album;
    if (!payload.genre) delete payload.genre;

    try {
      await createTrack(payload).unwrap();
      toast.success('Track created successfully');
      setIsModalOpen(false);
      setFormData({ title: '', artist: '', album: '', genre: '', duration: 0, audioUrl: '', isPremium: false });
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to create track');
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
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-white">Tracks</h2>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Track
        </button>
      </div>

      {isLoading ? (
        <div className="animate-pulse space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-slate-800/50 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {tracks.map(track => (
            <div key={track._id} className="bg-slate-800/40 border border-white/5 rounded-xl p-3 flex items-center gap-4 group hover:bg-slate-800/60 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-slate-700 flex items-center justify-center relative overflow-hidden flex-shrink-0 group-hover:bg-purple-500/20 transition-colors">
                <Music className="w-5 h-5 text-slate-400 group-hover:text-purple-400" />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity">
                  <Play className="w-4 h-4 text-white ml-0.5" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-white font-semibold truncate text-sm">{track.title}</h3>
                  {track.isPremium && (
                    <span className="bg-amber-500/20 text-amber-500 text-[10px] uppercase font-bold px-1.5 rounded">PRO</span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400 truncate">
                  <span>{track.artist?.name || 'Unknown'}</span>
                  {track.album && (
                    <>
                      <span className="w-1 h-1 bg-slate-600 rounded-full" />
                      <span>{track.album.title}</span>
                    </>
                  )}
                </div>
              </div>
              <div className="text-sm font-medium text-slate-500 w-12 text-right">
                {Math.floor(track.duration / 60)}:{(track.duration % 60).toString().padStart(2, '0')}
              </div>
              <button onClick={() => handleDelete(track._id)} className="p-2 opacity-0 group-hover:opacity-100 text-red-400 hover:bg-red-400/10 rounded-lg transition-all">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Track Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto hide-scrollbar">
            <div className="p-4 border-b border-white/5 flex justify-between items-center sticky top-0 bg-slate-900/90 backdrop-blur-md z-10">
              <h3 className="text-lg font-bold text-white">Add New Track</h3>
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
                  <label className="block text-sm font-medium text-slate-300 mb-1">Album (Optional)</label>
                  <select
                    value={formData.album}
                    onChange={(e) => setFormData({...formData, album: e.target.value})}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
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
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Duration (Seconds)</label>
                  <input 
                    type="number" 
                    value={formData.duration}
                    onChange={(e) => setFormData({...formData, duration: Number(e.target.value)})}
                    required
                    min="1"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Audio URL (Temporary)</label>
                <input 
                  type="url" 
                  value={formData.audioUrl}
                  onChange={(e) => setFormData({...formData, audioUrl: e.target.value})}
                  required
                  placeholder="https://example.com/audio.mp3"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                />
                <p className="text-xs text-slate-500 mt-1">Direct upload system is deferred. Paste direct URL.</p>
              </div>

              <div className="flex items-center gap-2 p-3 bg-slate-800/50 border border-slate-700 rounded-lg mt-2">
                <input 
                  type="checkbox" 
                  id="isPremium"
                  checked={formData.isPremium}
                  onChange={(e) => setFormData({...formData, isPremium: e.target.checked})}
                  className="rounded bg-slate-800 border-slate-700 text-purple-500 focus:ring-purple-500"
                />
                <label htmlFor="isPremium" className="text-sm font-medium text-amber-500 flex items-center gap-1">
                  Require Premium Subscription
                </label>
              </div>

              <button 
                type="submit" 
                disabled={isCreating}
                className="w-full bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-medium py-3 rounded-lg transition-colors mt-4"
              >
                {isCreating ? 'Saving...' : 'Save Track'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default NexoriaTracksManager;
