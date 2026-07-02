import React, { useState } from 'react';
import { useGetAdminMoviesQuery, useUpdateMovieMutation } from '../../../features/movie/movieApiSlice';
import { toast } from 'react-hot-toast';
import { ChevronDown, Plus, Edit, Trash2, Save, X, Film, Search , LayoutTemplate } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import BackButton from '../../../components/BackButton';

const MovieSeriesManager = ({ type = 'Web Series' }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const { data: moviesRes, isLoading } = useGetAdminMoviesQuery({ limit: 100, search: searchTerm });
  const [updateMovie] = useUpdateMovieMutation();
  
  // Filter only the specified type (Web Series or Animation)
  const webSeries = (moviesRes?.data || []).filter(m => m.movieType === type);

  const [selectedSeries, setSelectedSeries] = useState(null);
  const [activeSeasonIndex, setActiveSeasonIndex] = useState(0);

  // Form states
  const [isAddingSeason, setIsAddingSeason] = useState(false);
  const [newSeason, setNewSeason] = useState({ seasonNumber: 1, poster: '', description: '' });
  
  const [isAddingEpisode, setIsAddingEpisode] = useState(false);
  const [newEpisode, setNewEpisode] = useState({ episodeNumber: 1, title: '', thumbnail: '', runtime: '', videoUrl: '', downloadLinks: [] });

  const handleSelectSeries = (series) => {
    setSelectedSeries(JSON.parse(JSON.stringify(series))); // Deep clone for editing
    setActiveSeasonIndex(0);
    setIsAddingSeason(false);
    setIsAddingEpisode(false);
  };

  const handleSaveSeries = async () => {
    try {
      await updateMovie({ id: selectedSeries._id, data: { seasons: selectedSeries.seasons } }).unwrap();
      toast.success('Series updated successfully!');
      setSelectedSeries(null);
    } catch (err) {
      toast.error('Failed to update series');
    }
  };

  const addSeason = () => {
    if (!newSeason.seasonNumber) return toast.error('Season Number is required');
    
    const updatedSeasons = [...(selectedSeries.seasons || []), { ...newSeason, episodes: [] }];
    setSelectedSeries({ ...selectedSeries, seasons: updatedSeasons });
    setActiveSeasonIndex(updatedSeasons.length - 1);
    setIsAddingSeason(false);
    setNewSeason({ seasonNumber: updatedSeasons.length + 1, poster: '', description: '' });
  };

  const deleteSeason = (index) => {
    if(!window.confirm('Delete this season and all its episodes?')) return;
    const updatedSeasons = selectedSeries.seasons.filter((_, i) => i !== index);
    setSelectedSeries({ ...selectedSeries, seasons: updatedSeasons });
    setActiveSeasonIndex(Math.max(0, index - 1));
  };

  const addEpisode = () => {
    if (!newEpisode.episodeNumber || !newEpisode.title) return toast.error('Episode Number and Title required');
    
    const updatedSeasons = [...selectedSeries.seasons];
    updatedSeasons[activeSeasonIndex].episodes.push({ ...newEpisode });
    
    setSelectedSeries({ ...selectedSeries, seasons: updatedSeasons });
    setIsAddingEpisode(false);
    setNewEpisode({ episodeNumber: updatedSeasons[activeSeasonIndex].episodes.length + 1, title: '', thumbnail: '', runtime: '', videoUrl: '', downloadLinks: [] });
  };

  const deleteEpisode = (epIndex) => {
    if(!window.confirm('Delete this episode?')) return;
    const updatedSeasons = [...selectedSeries.seasons];
    updatedSeasons[activeSeasonIndex].episodes = updatedSeasons[activeSeasonIndex].episodes.filter((_, i) => i !== epIndex);
    setSelectedSeries({ ...selectedSeries, seasons: updatedSeasons });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto pb-24">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{type === 'Animation' ? 'Animation' : 'Web Series'} Manager</h1>
        <p className="text-slate-500 dark:text-slate-400">Manage seasons and episodes for your {type === 'Animation' ? 'animation' : 'web series'}.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Series List */}
        <div className="lg:col-span-4 space-y-4">
          <div className="relative">
            <input 
              type="text" 
              placeholder={`Search ${type === 'Animation' ? 'animation' : 'web series'}...`} 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white dark:bg-[#111] border border-slate-200 dark:border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm focus:ring-2 focus:ring-purple-500 dark:text-white"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          </div>

          <div className="bg-white dark:bg-[#111] border border-slate-200 dark:border-white/10 rounded-xl overflow-hidden h-[600px] overflow-y-auto custom-scrollbar">
            {isLoading ? (
              <div className="p-8 text-center text-slate-500">Loading series...</div>
            ) : webSeries.length === 0 ? (
              <div className="p-8 text-center text-slate-500">No {type === 'Animation' ? 'Animation' : 'Web Series'} found. Create one in "Add {type === 'Animation' ? 'Animation' : 'Movie'}".</div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-white/5">
                {webSeries.map(series => (
                  <button 
                    key={series._id}
                    onClick={() => handleSelectSeries(series)}
                    className={`w-full flex items-center gap-4 p-4 text-left hover:bg-slate-50 dark:hover:bg-white/5 transition-colors ${selectedSeries?._id === series._id ? 'bg-purple-50 dark:bg-purple-500/10 border-l-4 border-purple-600' : ''}`}
                  >
                    <img src={series.posterImage} alt={series.title} className="w-12 h-16 object-cover rounded shadow-sm" />
                    <div>
                      <h4 className="font-semibold text-slate-900 dark:text-white text-sm">{series.title}</h4>
                      <p className="text-xs text-slate-500 mt-1">{series.seasons?.length || 0} Seasons</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Series Editor */}
        <div className="lg:col-span-8">
          {!selectedSeries ? (
            <div className="bg-slate-50 dark:bg-[#0A0A0A] border border-dashed border-slate-200 dark:border-white/10 rounded-2xl h-[600px] flex flex-col items-center justify-center text-slate-400">
              <Film className="w-12 h-12 mb-4 opacity-20" />
              <p>Select a {type === 'Animation' ? 'Animation' : 'Web Series'} from the left to manage its seasons and episodes</p>
            </div>
          ) : (
            <div className="bg-white dark:bg-[#111] border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-xl">
              
              <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-100 dark:border-white/10">
                <div className="flex items-center gap-4">
                  <img src={selectedSeries.posterImage} alt="" className="w-16 h-24 object-cover rounded shadow" />
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">{selectedSeries.title}</h2>
                    <p className="text-sm text-slate-500 mt-1">Manage Seasons & Episodes</p>
                  </div>
                </div>
                <button 
                  onClick={handleSaveSeries}
                  className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold shadow-lg shadow-emerald-600/20 transition-all"
                >
                  <Save className="w-4 h-4" /> Save Changes
                </button>
              </div>

              {/* Seasons Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar flex-1 mr-4">
                  {(selectedSeries.seasons || []).map((s, idx) => (
                    <button
                      key={idx}
                      onClick={() => { setActiveSeasonIndex(idx); setIsAddingSeason(false); setIsAddingEpisode(false); }}
                      className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                        activeSeasonIndex === idx 
                          ? 'bg-purple-600 text-white' 
                          : 'bg-slate-100 dark:bg-[#222] text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-[#333]'
                      }`}
                    >
                      Season {s.seasonNumber}
                    </button>
                  ))}
                </div>
                <button 
                  onClick={() => setIsAddingSeason(true)}
                  className="flex-shrink-0 flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-[#222] hover:bg-slate-200 dark:hover:bg-[#333] text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium transition-colors"
                >
                  <Plus className="w-4 h-4" /> Add Season
                </button>
              </div>

              {/* Add Season Form */}
              {isAddingSeason && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-6 bg-slate-50 dark:bg-[#0A0A0A] rounded-xl border border-slate-200 dark:border-white/5 mb-6">
                  <h3 className="font-bold text-slate-900 dark:text-white mb-4">Add New Season</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1">Season Number</label>
                      <input type="number" value={newSeason.seasonNumber} onChange={(e) => setNewSeason({...newSeason, seasonNumber: e.target.value})} className="w-full bg-white dark:bg-black border border-slate-200 dark:border-white/10 rounded p-2.5 text-slate-900 dark:text-white text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1">Poster URL (Optional)</label>
                      <input type="text" value={newSeason.poster} onChange={(e) => setNewSeason({...newSeason, poster: e.target.value})} className="w-full bg-white dark:bg-black border border-slate-200 dark:border-white/10 rounded p-2.5 text-slate-900 dark:text-white text-sm" />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={addSeason} className="px-4 py-2 bg-purple-600 text-white rounded text-sm font-medium">Create Season</button>
                    <button onClick={() => setIsAddingSeason(false)} className="px-4 py-2 bg-slate-200 dark:bg-[#333] text-slate-700 dark:text-white rounded text-sm font-medium">Cancel</button>
                  </div>
                </motion.div>
              )}

              {/* Active Season Content */}
              {!isAddingSeason && selectedSeries.seasons && selectedSeries.seasons[activeSeasonIndex] && (
                <div>
                  <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100 dark:border-white/5">
                    <h3 className="font-bold text-lg text-slate-900 dark:text-white">Season {selectedSeries.seasons[activeSeasonIndex].seasonNumber} Episodes</h3>
                    <div className="flex items-center gap-3">
                      <button onClick={() => setIsAddingEpisode(true)} className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-sm font-medium transition-colors">
                        <Plus className="w-4 h-4" /> Add Episode
                      </button>
                      <button onClick={() => deleteSeason(activeSeasonIndex)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors" title="Delete Season">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Add Episode Form */}
                  {isAddingEpisode && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-6 bg-slate-50 dark:bg-[#0A0A0A] rounded-xl border border-slate-200 dark:border-white/5 mb-6">
                      <h3 className="font-bold text-slate-900 dark:text-white mb-4">Add New Episode</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-xs font-medium text-slate-400 mb-1">Episode Number *</label>
                          <input type="number" value={newEpisode.episodeNumber} onChange={(e) => setNewEpisode({...newEpisode, episodeNumber: e.target.value})} className="w-full bg-white dark:bg-black border border-slate-200 dark:border-white/10 rounded p-2 text-slate-900 dark:text-white text-sm" />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-400 mb-1">Episode Title *</label>
                          <input type="text" value={newEpisode.title} onChange={(e) => setNewEpisode({...newEpisode, title: e.target.value})} className="w-full bg-white dark:bg-black border border-slate-200 dark:border-white/10 rounded p-2 text-slate-900 dark:text-white text-sm" />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-400 mb-1">Thumbnail URL</label>
                          <input type="text" value={newEpisode.thumbnail} onChange={(e) => setNewEpisode({...newEpisode, thumbnail: e.target.value})} className="w-full bg-white dark:bg-black border border-slate-200 dark:border-white/10 rounded p-2 text-slate-900 dark:text-white text-sm" />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-400 mb-1">Video URL / Embed URL</label>
                          <input type="text" value={newEpisode.videoUrl} onChange={(e) => setNewEpisode({...newEpisode, videoUrl: e.target.value})} className="w-full bg-white dark:bg-black border border-slate-200 dark:border-white/10 rounded p-2 text-slate-900 dark:text-white text-sm" />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={addEpisode} className="px-4 py-2 bg-purple-600 text-white rounded text-sm font-medium">Save Episode</button>
                        <button onClick={() => setIsAddingEpisode(false)} className="px-4 py-2 bg-slate-200 dark:bg-[#333] text-slate-700 dark:text-white rounded text-sm font-medium">Cancel</button>
                      </div>
                    </motion.div>
                  )}

                  {/* Episodes List */}
                  <div className="space-y-3">
                    {selectedSeries.seasons[activeSeasonIndex].episodes?.length === 0 ? (
                      <p className="text-slate-500 text-center py-8">No episodes in this season yet.</p>
                    ) : (
                      selectedSeries.seasons[activeSeasonIndex].episodes?.map((ep, epIdx) => (
                        <div key={epIdx} className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-[#0A0A0A] rounded-xl border border-slate-200 dark:border-white/5">
                          <div className="flex-shrink-0 w-12 h-12 bg-slate-200 dark:bg-[#222] rounded flex items-center justify-center font-bold text-slate-500">
                            E{ep.episodeNumber}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-slate-900 dark:text-white text-sm truncate">{ep.title}</h4>
                            {ep.videoUrl && <p className="text-xs text-emerald-500 mt-1 truncate">Video Attached</p>}
                          </div>
                          <button onClick={() => deleteEpisode(epIdx)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default MovieSeriesManager;