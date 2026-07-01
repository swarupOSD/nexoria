import { useState } from 'react';
import { motion } from 'framer-motion';
import { Trash2, RotateCcw, Search, AlertCircle, FileWarning } from 'lucide-react';
import { toast } from 'react-hot-toast';
import CustomSearchBar from '../../components/CustomSearchBar';

const TrashBin = () => {
  const [isRestoring, setIsRestoring] = useState(false);
  const [filter, setFilter] = useState('All');

  // Simulated trash data
  const [trashItems, setTrashItems] = useState([
    { id: 1, name: 'Spotify Premium Mod', type: 'App', deletedBy: 'Admin (swarup)', deletedAt: '2026-07-01T10:00:00Z', expiryDays: 29 },
    { id: 2, name: 'GTA San Andreas', type: 'Game', deletedBy: 'System Auto-Clean', deletedAt: '2026-06-25T14:30:00Z', expiryDays: 24 },
    { id: 3, name: 'John Doe', type: 'User', deletedBy: 'Admin (swarup)', deletedAt: '2026-06-20T09:15:00Z', expiryDays: 19 },
    { id: 4, name: 'Top 10 RPGs Banner', type: 'Hero Display', deletedBy: 'Moderator (alex)', deletedAt: '2026-06-15T16:45:00Z', expiryDays: 14 }
  ]);

  const filteredItems = filter === 'All' ? trashItems : trashItems.filter(item => item.type === filter);

  const handleRestore = (id, name) => {
    setIsRestoring(true);
    toast.loading(`Restoring ${name}...`, { id: 'restore' });
    
    setTimeout(() => {
      setTrashItems(trashItems.filter(item => item.id !== id));
      toast.success(`${name} has been restored successfully!`, { id: 'restore' });
      setIsRestoring(false);
    }, 1200);
  };

  const handlePermanentDelete = (id, name) => {
    if(window.confirm(`Are you sure you want to permanently delete ${name}? This action CANNOT be undone.`)) {
      setTrashItems(trashItems.filter(item => item.id !== id));
      toast.success(`${name} permanently deleted.`);
    }
  };

  const handleEmptyTrash = () => {
    if(trashItems.length === 0) return toast.error('Trash is already empty.');
    if(window.confirm('Are you absolutely sure you want to empty the trash bin? All items will be permanently erased.')) {
      setTrashItems([]);
      toast.success('Trash bin emptied.');
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
            <FileWarning className="w-6 h-6 text-rose-500" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Trash Bin</h1>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-1">Items are kept for 30 days before permanent deletion</p>
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
            <input type="text" placeholder="Search deleted items..." className="w-full pl-10 pr-4 py-2 bg-white dark:bg-[#050505] border border-slate-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 text-sm font-medium dark:text-white" />
          </div>
          <select 
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full sm:w-auto px-4 py-2 bg-white dark:bg-[#050505] border border-slate-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 font-medium text-sm dark:text-white"
          >
            <option value="All">All Types</option>
            <option value="App">Apps</option>
            <option value="Game">Games</option>
            <option value="User">Users</option>
            <option value="Hero Display">Hero Displays</option>
          </select>
        </div>

        {trashItems.length === 0 ? (
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
                {filteredItems.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors group">
                    <td className="px-6 py-4 font-bold text-sm text-slate-900 dark:text-white">{item.name}</td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-black uppercase tracking-widest">{item.type}</span>
                    </td>
                    <td className="px-6 py-4 text-xs font-semibold text-slate-500">{item.deletedBy}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <AlertCircle className={`w-4 h-4 ${item.expiryDays < 15 ? 'text-rose-500' : 'text-amber-500'}`} />
                        <span className={`text-xs font-bold ${item.expiryDays < 15 ? 'text-rose-500' : 'text-amber-500'}`}>{item.expiryDays} days left</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleRestore(item.id, item.name)}
                          disabled={isRestoring}
                          className="p-2 bg-emerald-100 text-emerald-600 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:hover:bg-emerald-900/50 rounded-lg transition-colors tooltip-trigger relative"
                          title="Restore"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handlePermanentDelete(item.id, item.name)}
                          className="p-2 bg-rose-100 text-rose-600 hover:bg-rose-200 dark:bg-rose-900/30 dark:text-rose-400 dark:hover:bg-rose-900/50 rounded-lg transition-colors tooltip-trigger relative"
                          title="Delete Permanently"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default TrashBin;
