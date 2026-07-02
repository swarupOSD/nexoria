import { useState } from 'react';
import { motion } from 'framer-motion';
import { Trash2, RotateCcw, Search, AlertCircle, FileWarning, CheckCircle , LayoutTemplate } from 'lucide-react';
import { toast } from 'react-hot-toast';
import BackButton from '../../components/BackButton';
import {
  useGetTrashItemsQuery,
  useRestoreTrashItemMutation,
  useDeleteTrashItemMutation,
  useEmptyTrashMutation
} from '../../features/trash/trashApiSlice';

const TrashBin = () => {
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  const { data: trashData, isLoading, isFetching } = useGetTrashItemsQuery({ type: filter, page, limit: 20 });
  const [restoreItem, { isLoading: isRestoring }] = useRestoreTrashItemMutation();
  const [deleteItem] = useDeleteTrashItemMutation();
  const [emptyTrash] = useEmptyTrashMutation();

  const handleRestore = async (id, name, type) => {
    toast.loading(`Restoring ${name}...`, { id: 'restore' });
    try {
      await restoreItem({ type, id }).unwrap();
      toast.success(`${name} has been restored successfully!`, { id: 'restore' });
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to restore item', { id: 'restore' });
    }
  };

  const handlePermanentDelete = async (id, name, type) => {
    if(window.confirm(`Are you sure you want to permanently delete ${name}? This action CANNOT be undone.`)) {
      toast.loading(`Deleting ${name}...`, { id: 'delete' });
      try {
        await deleteItem({ type, id }).unwrap();
        toast.success(`${name} permanently deleted.`, { id: 'delete' });
      } catch (err) {
        toast.error(err?.data?.message || 'Failed to delete item', { id: 'delete' });
      }
    }
  };

  const handleEmptyTrash = async () => {
    if(!trashData?.data || trashData.data.length === 0) return toast.error('Trash is already empty.');
    if(window.confirm('Are you absolutely sure you want to empty the trash bin? All items will be permanently erased.')) {
      toast.loading('Emptying trash...', { id: 'empty' });
      try {
        await emptyTrash().unwrap();
        toast.success('Trash bin emptied.', { id: 'empty' });
      } catch (err) {
        toast.error(err?.data?.message || 'Failed to empty trash', { id: 'empty' });
      }
    }
  };

  const calculateExpiryDays = (deletedAt) => {
    if (!deletedAt) return 0;
    const deletedDate = new Date(deletedAt);
    const expiryDate = new Date(deletedDate.getTime() + (30 * 24 * 60 * 60 * 1000));
    const now = new Date();
    const diffTime = Math.abs(expiryDate - now);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 30 ? 30 : diffDays;
  };

  const filteredItems = (trashData?.data || []).filter(item => {
    if (search && !item.title?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
            <FileWarning className="w-6 h-6 text-rose-500" />
          </div>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="flex items-center gap-3">
          <BackButton fallbackRoute="/superadmin" showText={false} />
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <LayoutTemplate className="w-6 h-6 text-primary" />
              Trash Bin
            </h1>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-1">Items are kept for 30 days before permanent deletion</p>
          </div>
        </div>
      </div>
        </div>
        <button 
          onClick={handleEmptyTrash}
          className="px-5 py-2.5 bg-rose-100 hover:bg-rose-200 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 dark:hover:bg-rose-900/50 font-bold rounded-xl flex items-center gap-2 transition-colors text-sm w-max"
        >
          <Trash2 className="w-4 h-4" /> Empty Trash
        </button>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-[#111] border border-slate-200 dark:border-white/10 rounded-3xl shadow-xl overflow-hidden">
        
        <div className="p-4 border-b border-slate-200 dark:border-white/10 flex flex-col sm:flex-row gap-4 justify-between bg-slate-50/50 dark:bg-white/[0.02]">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search deleted items..." className="w-full pl-10 pr-4 py-2 bg-white dark:bg-[#050505] border border-slate-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 text-sm font-medium dark:text-white" />
          </div>
          <select 
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full sm:w-auto px-4 py-2 bg-white dark:bg-[#050505] border border-slate-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 font-medium text-sm dark:text-white"
          >
            <option value="all">All Types</option>
            <option value="posts">Posts & Games</option>
            <option value="movies">Movies</option>
            <option value="users">Users</option>
          </select>
        </div>

        {isLoading ? (
          <div className="py-20 flex justify-center text-slate-500 font-medium">Loading trash items...</div>
        ) : filteredItems.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 bg-slate-100 dark:bg-white/5 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-emerald-500" />
            </div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white">Trash is empty</h3>
            <p className="text-sm font-bold text-slate-500 mt-1">Nothing to see here right now.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/70 dark:bg-[#0a0a0a] text-slate-500 dark:text-slate-400 text-[10px] uppercase tracking-widest font-black border-b border-slate-200 dark:border-white/10">
                  <th className="px-6 py-4">Item Name</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Deleted By</th>
                  <th className="px-6 py-4">Time Left</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {filteredItems.map(item => {
                  const expiryDays = calculateExpiryDays(item.deletedAt);
                  return (
                  <tr key={item._id} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors group">
                    <td className="px-6 py-4 font-bold text-sm text-slate-900 dark:text-white flex items-center gap-3">
                      {item.image && <img src={item.image} alt="" className="w-8 h-8 rounded bg-slate-200 object-cover" />}
                      {item.title}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-black uppercase tracking-widest">{item.itemType}</span>
                    </td>
                    <td className="px-6 py-4 text-xs font-semibold text-slate-500">System / Admin</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <AlertCircle className={`w-4 h-4 ${expiryDays < 15 ? 'text-rose-500' : 'text-amber-500'}`} />
                        <span className={`text-xs font-bold ${expiryDays < 15 ? 'text-rose-500' : 'text-amber-500'}`}>{expiryDays} days left</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleRestore(item._id, item.title, item.itemType)}
                          disabled={isRestoring}
                          className="p-2 bg-emerald-100 text-emerald-600 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:hover:bg-emerald-900/50 rounded-lg transition-colors tooltip-trigger relative"
                          title="Restore"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handlePermanentDelete(item._id, item.title, item.itemType)}
                          className="p-2 bg-rose-100 text-rose-600 hover:bg-rose-200 dark:bg-rose-900/30 dark:text-rose-400 dark:hover:bg-rose-900/50 rounded-lg transition-colors tooltip-trigger relative"
                          title="Delete Permanently"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )})}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default TrashBin;
