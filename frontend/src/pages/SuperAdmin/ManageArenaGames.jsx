import React, { useState } from 'react';
import { 
  useGetAdminArenaGamesQuery, 
  useAddArenaGameMutation, 
  useUpdateArenaGameMutation, 
  useDeleteArenaGameMutation 
} from '../../features/arenaGame/arenaGameApiSlice';
import { useScrapePlayStoreMutation } from '../../features/post/postApiSlice';
import { toast } from 'react-hot-toast';
import { Plus, Edit2, Trash2, Search, Link as LinkIcon, Gamepad2, Eye, EyeOff, DownloadCloud , LayoutTemplate } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import BackButton from '../../components/BackButton';

const ManageArenaGames = () => {
  const { data: gamesRes, isLoading, refetch } = useGetAdminArenaGamesQuery();
  const [addGame, { isLoading: isAdding }] = useAddArenaGameMutation();
  const [updateGame, { isLoading: isUpdating }] = useUpdateArenaGameMutation();
  const [deleteGame, { isLoading: isDeleting }] = useDeleteArenaGameMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    id: '',
    title: '',
    description: '',
    iframeUrl: '',
    thumbnail: '',
    isActive: true,
    isVip: false
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [scrapeApp, { isLoading: isScraping }] = useScrapePlayStoreMutation();

  const games = gamesRes?.data || [];
  const filteredGames = games.filter(g => g.title.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleOpenModal = (game = null) => {
    if (game) {
      setEditMode(true);
      setFormData({
        id: game._id,
        title: game.title,
        description: game.description,
        iframeUrl: game.iframeUrl,
        thumbnail: game.thumbnail,
        isActive: game.isActive,
        isVip: game.isVip || false
      });
    } else {
      setEditMode(false);
      setFormData({
        id: '',
        title: '',
        description: '',
        iframeUrl: '',
        thumbnail: '',
        isActive: true,
        isVip: false
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editMode) {
        await updateGame(formData).unwrap();
        toast.success('Game updated successfully!');
      } else {
        await addGame(formData).unwrap();
        toast.success('Game added successfully!');
      }
      setIsModalOpen(false);
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to save game');
    }
  };

  const handleFetchInfo = async () => {
    if (!sourceUrl) {
      toast.error('Please enter a Game Source URL to fetch');
      return;
    }
    
    try {
      const result = await scrapeApp({ url: sourceUrl }).unwrap();
      
      // Try to construct iframe URL for known providers first
      let iframeUrl = formData.iframeUrl;
      let isKnownProvider = false;
      
      if (sourceUrl) {
        try {
          const urlObj = new URL(sourceUrl);
          const slug = urlObj.pathname.split('/').filter(Boolean).pop();
          
          if (sourceUrl.includes('gamepix.com') && slug) {
            iframeUrl = `https://play.gamepix.com/${slug}/embed`;
            isKnownProvider = true;
          } else if (sourceUrl.includes('crazygames.com') && slug) {
            iframeUrl = `https://games.crazygames.com/en_US/${slug}/index.html`;
            isKnownProvider = true;
          } else if (sourceUrl.includes('poki.com') && slug) {
            iframeUrl = `https://poki.com/en/g/${slug}`;
            isKnownProvider = true;
          }
        } catch (e) {
          // ignore invalid urls
        }
      }

      // Fallback to scraper's embedUrl if not a known provider
      if (!isKnownProvider) {
        if (result.embedUrl && !result.embedUrl.includes('youtube.com')) {
          iframeUrl = result.embedUrl;
        } else {
          // Last resort: just use the source URL itself
          iframeUrl = sourceUrl;
          toast('Notice: Used the raw URL. This might show the full website instead of just the game.', { icon: '⚠️' });
        }
      }

      setFormData(prev => ({
        ...prev,
        title: result.title || prev.title,
        description: result.description || prev.description,
        thumbnail: result.icon || (result.screenshots?.length > 0 ? result.screenshots[0] : prev.thumbnail),
        iframeUrl: iframeUrl
      }));
      toast.success('Game info fetched successfully!');
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to fetch game details');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this Arena Game?')) {
      try {
        await deleteGame(id).unwrap();
        toast.success('Game deleted successfully');
        refetch();
      } catch (err) {
        toast.error(err?.data?.message || 'Failed to delete game');
      }
    }
  };

  const toggleStatus = async (game) => {
    try {
      await updateGame({ id: game._id, isActive: !game.isActive }).unwrap();
      toast.success(`Game ${!game.isActive ? 'activated' : 'deactivated'}`);
      refetch();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-3">
            <Gamepad2 className="w-8 h-8 text-primary" /> Manage Arena Games
          </h1>
          <p className="text-slate-400 mt-2">Add, edit, or remove games specifically for the Nexoria Arena page.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-primary hover:bg-primary-600 text-white px-5 py-2.5 rounded-xl font-bold transition shadow-lg shadow-primary/20"
        >
          <Plus className="w-5 h-5" /> Add Game
        </button>
      </div>

      <div className="bg-[#111] rounded-2xl border border-white/5 p-6 shadow-xl mb-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              type="text"
              placeholder="Search arena games..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-primary/50"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-slate-400 text-sm">
                  <th className="py-3 px-4 font-semibold uppercase tracking-wider">Game</th>
                  <th className="py-3 px-4 font-semibold uppercase tracking-wider">Embed URL</th>
                  <th className="py-3 px-4 font-semibold uppercase tracking-wider">Status</th>
                  <th className="py-3 px-4 font-semibold uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {filteredGames.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="text-center py-8 text-slate-500">No games found. Add one to get started!</td>
                    </tr>
                  ) : (
                    filteredGames.map((game) => (
                      <motion.tr 
                        key={game._id}
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="border-b border-white/5 hover:bg-white/[0.02] transition-colors"
                      >
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-slate-800 overflow-hidden flex-shrink-0 border border-white/10">
                              {game.thumbnail ? (
                                <img src={game.thumbnail} alt={game.title} className="w-full h-full object-cover" />
                              ) : (
                                <Gamepad2 className="w-6 h-6 text-slate-400 m-auto mt-3" />
                              )}
                            </div>
                            <div>
                              <div className="font-bold text-white mb-1">{game.title}</div>
                              <div className="text-xs text-slate-400 line-clamp-1 max-w-xs">{game.description}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-2 sm:px-4">
                          <div className="flex items-center gap-2 text-xs text-slate-300 font-mono bg-black/30 px-2 py-1 rounded max-w-[120px] sm:max-w-[180px] overflow-hidden text-ellipsis whitespace-nowrap" title={game.iframeUrl}>
                            <LinkIcon className="w-3 h-3 text-slate-500 shrink-0" />
                            {game.iframeUrl}
                          </div>
                        </td>
                        <td className="py-4 px-2 sm:px-4">
                          <button 
                            onClick={() => toggleStatus(game)}
                            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition ${game.isActive ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}
                          >
                            {game.isActive ? <><Eye className="w-3 h-3" /> Active</> : <><EyeOff className="w-3 h-3" /> Hidden</>}
                          </button>
                        </td>
                        <td className="py-4 px-2 sm:px-4 text-right pr-4">
                          <div className="flex items-center justify-end gap-1 sm:gap-2">
                            <button onClick={() => handleOpenModal(game)} className="p-1.5 sm:p-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-lg transition" title="Edit">
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleDelete(game._id)} disabled={isDeleting} className="p-1.5 sm:p-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-lg transition" title="Delete">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))
                  )}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#161616] border border-white/10 rounded-2xl p-6 w-full max-w-lg shadow-2xl"
            >
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                {editMode ? <Edit2 className="w-5 h-5 text-primary" /> : <Plus className="w-5 h-5 text-primary" />} 
                {editMode ? 'Edit Arena Game' : 'Add Arena Game'}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                
                {/* Auto Fetch Section */}
                <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl mb-6">
                  <label className="block text-sm font-medium text-primary mb-1.5 flex items-center gap-2">
                    <DownloadCloud className="w-4 h-4" /> Auto-Fetch Game Info
                  </label>
                  <div className="flex gap-2">
                    <input 
                      type="url"
                      value={sourceUrl} onChange={e => setSourceUrl(e.target.value)}
                      className="flex-1 bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:border-primary/50 outline-none text-sm"
                      placeholder="Paste GamePix URL (e.g. gamepix.com/play/game)"
                    />
                    <button 
                      type="button" 
                      onClick={handleFetchInfo}
                      disabled={isScraping}
                      className="px-4 py-2.5 bg-primary/20 hover:bg-primary/30 text-primary font-bold rounded-xl transition border border-primary/30 whitespace-nowrap disabled:opacity-50"
                    >
                      {isScraping ? 'Fetching...' : 'Fetch'}
                    </button>
                  </div>
                  <p className="text-xs text-slate-500 mt-2">
                    <span className="text-amber-500 font-bold">Recommended:</span> Use <b>GamePix.com</b> or <b>CrazyGames.com</b> links. Some sites like Gamebol do not support clean embedding and will show their full website instead of just the game.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Game Title *</label>
                  <input 
                    type="text" required
                    value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:border-primary/50 outline-none"
                    placeholder="e.g., Smash Karts"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Description *</label>
                  <textarea 
                    required rows="3"
                    value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:border-primary/50 outline-none resize-none"
                    placeholder="Brief description of the game..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Iframe Embed URL *</label>
                  <input 
                    type="url" required
                    value={formData.iframeUrl} onChange={e => setFormData({...formData, iframeUrl: e.target.value})}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:border-primary/50 outline-none"
                    placeholder="https://play.gamepix.com/smash-karts/embed"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Thumbnail Image URL</label>
                  <input 
                    type="url"
                    value={formData.thumbnail} onChange={e => setFormData({...formData, thumbnail: e.target.value})}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:border-primary/50 outline-none"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
                <div className="flex flex-wrap items-center gap-6 pt-2">
                  <div className="flex items-center gap-3">
                    <input 
                      type="checkbox" id="isActive"
                      checked={formData.isActive} onChange={e => setFormData({...formData, isActive: e.target.checked})}
                      className="w-5 h-5 rounded border-white/20 bg-black/50 text-primary focus:ring-primary focus:ring-offset-0"
                    />
                    <label htmlFor="isActive" className="text-sm font-medium text-white cursor-pointer">Active</label>
                  </div>
                  <div className="flex items-center gap-3">
                    <input 
                      type="checkbox" id="isVip"
                      checked={formData.isVip} onChange={e => setFormData({...formData, isVip: e.target.checked})}
                      className="w-5 h-5 rounded border-amber-500/50 bg-black/50 text-amber-500 focus:ring-amber-500 focus:ring-offset-0"
                    />
                    <label htmlFor="isVip" className="text-sm font-bold text-amber-500 cursor-pointer">👑 VIP Exclusive</label>
                  </div>
                </div>

                <div className="flex gap-3 pt-4 mt-2 border-t border-white/10">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-2.5 rounded-xl border border-white/10 hover:bg-white/5 text-white font-semibold transition">Cancel</button>
                  <button type="submit" disabled={isAdding || isUpdating} className="flex-1 py-2.5 rounded-xl bg-primary hover:bg-primary-600 text-white font-semibold shadow-lg shadow-primary/20 transition disabled:opacity-50">
                    {isAdding || isUpdating ? 'Saving...' : 'Save Game'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ManageArenaGames;
