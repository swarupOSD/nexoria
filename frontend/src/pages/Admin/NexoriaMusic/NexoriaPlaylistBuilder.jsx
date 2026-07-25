import React, { useState, useEffect } from 'react';
import { 
  useGetAdminPlaylistsQuery, 
  useCreateAdminPlaylistMutation, 
  useUpdateAdminPlaylistMutation, 
  useDeleteAdminPlaylistMutation,
  useGetNexoriaTracksQuery
} from '../../../features/api/nexoriaMusicApiSlice';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Plus, Save, Trash, Search, GripVertical, Image as ImageIcon, Music, PlayCircle, X, Check, Loader2, ListMusic } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch } from 'react-redux';
import { playTrack, setQueue } from '../../../features/music/nexoriaMusicSlice';

const NexoriaPlaylistBuilder = () => {
  const dispatch = useDispatch();
  const { data: playlistsRes, isLoading: isLoadingPlaylists } = useGetAdminPlaylistsQuery();
  const { data: tracksRes, isLoading: isLoadingTracks } = useGetNexoriaTracksQuery();
  
  const [createPlaylist] = useCreateAdminPlaylistMutation();
  const [updatePlaylist] = useUpdateAdminPlaylistMutation();
  const [deletePlaylist] = useDeleteAdminPlaylistMutation();

  const playlists = playlistsRes?.data || [];
  const allTracks = tracksRes?.data || [];

  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    coverImage: '',
    type: 'Featured',
    tracks: []
  });

  // Load selected playlist into form
  useEffect(() => {
    if (selectedPlaylist) {
      setFormData({
        title: selectedPlaylist.title,
        description: selectedPlaylist.description || '',
        coverImage: selectedPlaylist.coverImage || '',
        type: selectedPlaylist.type || 'Featured',
        tracks: selectedPlaylist.tracks || []
      });
      setIsCreating(false);
    }
  }, [selectedPlaylist]);

  const handleNewPlaylist = () => {
    setSelectedPlaylist(null);
    setIsCreating(true);
    setFormData({
      title: 'New Featured Playlist',
      description: '',
      coverImage: '',
      type: 'Featured',
      tracks: []
    });
  };

  const handleSave = async () => {
    try {
      // Map tracks array of objects to array of IDs for backend
      const payload = {
        ...formData,
        tracks: formData.tracks.map(t => t._id || t)
      };

      if (isCreating) {
        await createPlaylist(payload).unwrap();
        toast.success('Playlist created successfully!');
        setIsCreating(false);
      } else if (selectedPlaylist) {
        await updatePlaylist({ id: selectedPlaylist._id, ...payload }).unwrap();
        toast.success('Playlist updated successfully!');
      }
    } catch (err) {
      toast.error(err.data?.message || 'Failed to save playlist');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this playlist?')) {
      try {
        await deletePlaylist(id).unwrap();
        toast.success('Playlist deleted');
        if (selectedPlaylist?._id === id) {
          setSelectedPlaylist(null);
        }
      } catch (err) {
        toast.error('Failed to delete playlist');
      }
    }
  };

  // Drag and Drop Logic
  const onDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(formData.tracks);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setFormData({ ...formData, tracks: items });
  };

  const addTrackToPlaylist = (track) => {
    if (!formData.tracks.find(t => t._id === track._id)) {
      setFormData({ ...formData, tracks: [...formData.tracks, track] });
      toast.success('Track added');
    } else {
      toast.error('Track already in playlist');
    }
  };

  const removeTrackFromPlaylist = (index) => {
    const newTracks = [...formData.tracks];
    newTracks.splice(index, 1);
    setFormData({ ...formData, tracks: newTracks });
  };

  const filteredSearchTracks = allTracks.filter(track => 
    track.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    track.artist?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  ).slice(0, 50); // Limit results for performance

  return (
    <div className="flex h-[calc(100vh-140px)] gap-6 p-6">
      
      {/* LEFT PANEL: Playlists List */}
      <div className="w-[300px] shrink-0 bg-[#0F0F23] rounded-2xl border border-white/10 flex flex-col overflow-hidden">
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <h2 className="font-bold text-white flex items-center gap-2">
            <ListMusic className="w-5 h-5 text-indigo-400" /> Playlists
          </h2>
          <button 
            onClick={handleNewPlaylist}
            className="p-1.5 bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500 hover:text-white rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
          {isLoadingPlaylists ? (
            <div className="p-8 flex justify-center text-zinc-500">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : playlists.length === 0 ? (
            <div className="p-8 text-center text-zinc-500 text-sm">
              No playlists found. Create one!
            </div>
          ) : (
            playlists.map(pl => (
              <div 
                key={pl._id}
                onClick={() => setSelectedPlaylist(pl)}
                className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${
                  selectedPlaylist?._id === pl._id 
                    ? 'bg-white/10 border border-white/20' 
                    : 'hover:bg-white/5 border border-transparent'
                }`}
              >
                <div className="w-10 h-10 rounded-lg overflow-hidden bg-zinc-800 shrink-0">
                  {pl.coverImage ? (
                    <img src={pl.coverImage} className="w-full h-full object-cover" alt="" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Music className="w-4 h-4 text-zinc-500" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white truncate">{pl.title}</p>
                  <p className="text-xs text-indigo-400 font-medium truncate">{pl.type}</p>
                </div>
                <button 
                  onClick={(e) => { e.stopPropagation(); handleDelete(pl._id); }}
                  className="p-2 text-zinc-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Trash className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* RIGHT PANEL: Editor */}
      <div className="flex-1 bg-[#0F0F23] rounded-2xl border border-white/10 flex flex-col overflow-hidden relative">
        {(!selectedPlaylist && !isCreating) ? (
          <div className="flex-1 flex flex-col items-center justify-center text-zinc-500">
            <ListMusic className="w-16 h-16 mb-4 opacity-20" />
            <p>Select a playlist or create a new one to start building.</p>
          </div>
        ) : (
          <div className="flex-1 flex overflow-hidden">
            
            {/* Editor Form & Reorder List */}
            <div className="flex-1 flex flex-col border-r border-white/10 overflow-hidden">
              <div className="p-6 border-b border-white/10 bg-gradient-to-r from-indigo-500/10 to-transparent">
                <div className="flex gap-6">
                  {/* Image Preview */}
                  <div className="w-32 h-32 rounded-xl bg-zinc-800 border-2 border-dashed border-white/20 flex flex-col items-center justify-center shrink-0 relative overflow-hidden group">
                    {formData.coverImage ? (
                      <img src={formData.coverImage} className="w-full h-full object-cover" alt="Cover" />
                    ) : (
                      <>
                        <ImageIcon className="w-8 h-8 text-zinc-500 mb-2" />
                        <span className="text-xs text-zinc-500">No Image</span>
                      </>
                    )}
                  </div>
                  
                  {/* Meta Inputs */}
                  <div className="flex-1 space-y-4">
                    <div>
                      <input 
                        type="text" 
                        value={formData.title}
                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                        className="w-full bg-transparent border-b-2 border-white/10 focus:border-indigo-500 text-3xl font-black text-white px-0 py-2 outline-none transition-colors"
                        placeholder="Playlist Title"
                      />
                    </div>
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <label className="text-xs text-zinc-400 font-bold uppercase tracking-wider mb-1 block">Description</label>
                        <input 
                          type="text"
                          value={formData.description}
                          onChange={(e) => setFormData({...formData, description: e.target.value})}
                          className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                          placeholder="Short description..."
                        />
                      </div>
                      <div className="w-1/3">
                        <label className="text-xs text-zinc-400 font-bold uppercase tracking-wider mb-1 block">Type</label>
                        <select 
                          value={formData.type}
                          onChange={(e) => setFormData({...formData, type: e.target.value})}
                          className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                        >
                          <option value="Featured">Featured (Top Hits)</option>
                          <option value="Trending">Trending</option>
                          <option value="Algorithm">Algorithm / Mood</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-zinc-400 font-bold uppercase tracking-wider mb-1 block">Cover Image URL</label>
                      <input 
                        type="text"
                        value={formData.coverImage}
                        onChange={(e) => setFormData({...formData, coverImage: e.target.value})}
                        className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>
                  </div>
                </div>
                
                {/* Actions */}
                <div className="mt-6 flex justify-end">
                  <button 
                    onClick={handleSave}
                    className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-2 rounded-full font-bold transition-transform hover:scale-105 active:scale-95 shadow-lg shadow-indigo-500/20"
                  >
                    <Save className="w-4 h-4" /> {isCreating ? 'Create Playlist' : 'Save Changes'}
                  </button>
                </div>
              </div>

              {/* Tracks Drag and Drop Area */}
              <div className="flex-1 flex flex-col overflow-hidden bg-black/20">
                <div className="px-6 py-3 border-b border-white/5 flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white">Tracks ({formData.tracks.length})</h3>
                  <span className="text-xs text-zinc-500">Drag to reorder</span>
                </div>
                
                <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
                  <DragDropContext onDragEnd={onDragEnd}>
                    <Droppable droppableId="playlist-tracks">
                      {(provided) => (
                        <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                          {formData.tracks.map((track, index) => (
                            <Draggable key={track._id || index} draggableId={track._id || `track-${index}`} index={index}>
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  className={`flex items-center gap-4 bg-[#1A1A2E] border border-white/10 rounded-xl p-3 group transition-colors ${snapshot.isDragging ? 'shadow-2xl shadow-black border-indigo-500/50 rotate-1 z-50' : 'hover:border-white/20 hover:bg-white/5'}`}
                                >
                                  <div {...provided.dragHandleProps} className="text-zinc-500 hover:text-white cursor-grab active:cursor-grabbing p-1">
                                    <GripVertical className="w-5 h-5" />
                                  </div>
                                  
                                  <div className="text-zinc-500 font-bold text-sm w-6 text-center">{index + 1}</div>
                                  
                                  <div className="w-10 h-10 rounded-md overflow-hidden shrink-0 bg-zinc-800">
                                    {(track.coverImage || track.album?.coverImage) ? (
                                      <img src={track.coverImage || track.album?.coverImage} className="w-full h-full object-cover" alt="" />
                                    ) : (
                                      <Music className="w-4 h-4 m-auto mt-3 text-zinc-500" />
                                    )}
                                  </div>
                                  
                                  <div className="flex-1 min-w-0">
                                    <p className="text-white font-bold text-sm truncate">{track.title}</p>
                                    <p className="text-zinc-400 text-xs truncate">{track.artist?.name || 'Unknown Artist'}</p>
                                  </div>
                                  
                                  <button 
                                    onClick={() => removeTrackFromPlaylist(index)}
                                    className="p-2 text-zinc-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                  >
                                    <X className="w-5 h-5" />
                                  </button>
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </DragDropContext>
                  
                  {formData.tracks.length === 0 && (
                    <div className="text-center py-10 border-2 border-dashed border-white/10 rounded-2xl text-zinc-500">
                      Search and add tracks from the right panel
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Side: Track Search */}
            <div className="w-[350px] shrink-0 bg-[#0F0F23] flex flex-col">
              <div className="p-4 border-b border-white/10">
                <h3 className="font-bold text-white mb-3">Add Tracks</h3>
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input 
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by title or artist..."
                    className="w-full bg-black/40 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
                {isLoadingTracks ? (
                  <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-zinc-500" /></div>
                ) : (
                  filteredSearchTracks.map(track => {
                    const isAdded = formData.tracks.some(t => t._id === track._id);
                    return (
                      <div key={track._id} className="flex items-center gap-3 p-2 hover:bg-white/5 rounded-lg group transition-colors">
                        <div className="w-10 h-10 rounded-md bg-zinc-800 overflow-hidden relative shrink-0">
                          {(track.coverImage || track.album?.coverImage) ? (
                            <img src={track.coverImage || track.album?.coverImage} className="w-full h-full object-cover" alt="" />
                          ) : (
                            <Music className="w-4 h-4 m-auto mt-3 text-zinc-500" />
                          )}
                          <div 
                            className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity"
                            onClick={() => {
                              dispatch(setQueue([track]));
                              dispatch(playTrack(track));
                            }}
                          >
                            <PlayCircle className="w-5 h-5 text-white" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm font-semibold truncate">{track.title}</p>
                          <p className="text-zinc-400 text-xs truncate">{track.artist?.name}</p>
                        </div>
                        <button 
                          onClick={() => addTrackToPlaylist(track)}
                          disabled={isAdded}
                          className={`p-2 rounded-lg transition-colors ${
                            isAdded 
                              ? 'text-indigo-400 bg-indigo-400/10 cursor-not-allowed' 
                              : 'text-white hover:bg-white/10'
                          }`}
                        >
                          {isAdded ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                        </button>
                      </div>
                    )
                  })
                )}
                {filteredSearchTracks.length === 0 && searchQuery && (
                  <div className="text-center p-4 text-zinc-500 text-sm">No tracks found matching your search.</div>
                )}
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};

export default NexoriaPlaylistBuilder;
