import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, Power, X, Sparkles } from 'lucide-react';
import {
  useGetAdvertisementsQuery,
  useCreateAdvertisementMutation,
  useUpdateAdvertisementMutation,
  useDeleteAdvertisementMutation,
  useToggleAdvertisementMutation
} from '../../features/advertisement/advertisementApiSlice';

const LOCATIONS = ['Header', 'Sidebar', 'BetweenContent', 'Footer', 'DownloadSection'];

const SkeletonRow = () => (
  <tr className="border-b border-slate-100 dark:border-slate-800 animate-pulse">
    <td className="p-4"><div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded" /></td>
    <td className="p-4"><div className="h-5 w-20 bg-slate-100 dark:bg-slate-800 rounded-full" /></td>
    <td className="p-4"><div className="h-5 w-16 bg-slate-100 dark:bg-slate-800 rounded-full" /></td>
    <td className="p-4 text-right"><div className="h-8 w-24 bg-slate-100 dark:bg-slate-800 rounded-lg ml-auto" /></td>
  </tr>
);

const SponsoredContentManager = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({ name: '', location: 'Header', adCode: '' });

  const { data: res, isLoading } = useGetAdvertisementsQuery();
  const [createItem] = useCreateAdvertisementMutation();
  const [updateItem] = useUpdateAdvertisementMutation();
  const [deleteItem] = useDeleteAdvertisementMutation();
  const [toggleItem] = useToggleAdvertisementMutation();

  const items = res?.data || [];

  const openModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({ name: item.name, location: item.location, adCode: item.adCode });
    } else {
      setEditingItem(null);
      setFormData({ name: '', location: 'Header', adCode: '' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await updateItem({ id: editingItem._id, data: formData }).unwrap();
        toast.success('Content slot updated');
      } else {
        await createItem(formData).unwrap();
        toast.success('Content slot created');
      }
      setIsModalOpen(false);
    } catch (err) {
      toast.error(err?.data?.message || 'Error saving');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this content slot?')) return;
    try {
      await deleteItem(id).unwrap();
      toast.success('Deleted');
    } catch { toast.error('Delete failed'); }
  };

  const handleToggle = async (id) => {
    try { await toggleItem(id).unwrap(); }
    catch { toast.error('Toggle failed'); }
  };

  const inputClass = "w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-all text-sm";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-violet-500" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">Sponsored Content</h1>
            <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">Manage sponsored content slots and placement scripts.</p>
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          onClick={() => openModal()}
          className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-lg shadow-violet-500/25 w-max"
        >
          <Plus className="w-4 h-4" /> Add Slot
        </motion.button>
      </div>

      {/* Table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden">
        {!isLoading && items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-14 h-14 rounded-2xl bg-violet-500/10 flex items-center justify-center mb-4">
              <Sparkles className="w-7 h-7 text-violet-500/60" />
            </div>
            <h3 className="font-semibold text-slate-700 dark:text-slate-300 mb-1">No content slots</h3>
            <p className="text-sm text-slate-400 mb-4">Add your first sponsored content slot to monetize the site.</p>
            <button onClick={() => openModal()}
              className="flex items-center gap-2 text-violet-500 border border-violet-500/30 hover:bg-violet-500/10 px-4 py-2 rounded-xl text-sm font-medium transition-colors">
              <Plus className="w-4 h-4" /> Add Slot
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/70 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">
                  <th className="px-4 py-3 font-semibold">Slot Name</th>
                  <th className="px-4 py-3 font-semibold">Placement</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {isLoading
                  ? [1,2,3].map(i => <SkeletonRow key={i} />)
                  : items.map((item) => (
                    <tr key={item._id} className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors">
                      <td className="px-4 py-3 font-semibold dark:text-white text-sm">{item.name}</td>
                      <td className="px-4 py-3">
                        <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-medium">{item.location}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${item.enabled ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'}`}>
                          {item.enabled ? 'Active' : 'Disabled'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => handleToggle(item._id)} title="Toggle"
                            className={`p-2 rounded-lg transition-colors ${item.enabled ? 'text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
                            <Power className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => openModal(item)} className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-500 rounded-lg transition-colors">
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => handleDelete(item._id)} className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 rounded-lg transition-colors">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-y-auto max-h-[90vh] z-10">
              <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-violet-500" />
                  <h3 className="font-bold text-slate-900 dark:text-white">{editingItem ? 'Edit Slot' : 'New Content Slot'}</h3>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1.5">Slot Name *</label>
                  <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Homepage Top Slot" className={inputClass} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1.5">Placement *</label>
                  <select value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className={inputClass}>
                    {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1.5">Code / Script *</label>
                  <textarea required value={formData.adCode} onChange={e => setFormData({...formData, adCode: e.target.value})}
                    rows="5" placeholder="Paste script or image URL..." className={inputClass + ' resize-none font-mono text-xs'} />
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">Cancel</button>
                  <motion.button type="submit" whileTap={{ scale: 0.97 }}
                    className="px-5 py-2 text-sm font-semibold text-white bg-violet-600 hover:bg-violet-700 rounded-xl shadow-lg shadow-violet-500/25 transition-colors">
                    {editingItem ? 'Update' : 'Create'}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SponsoredContentManager;
