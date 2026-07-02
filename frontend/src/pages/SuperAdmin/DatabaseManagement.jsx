import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { Database, Download, RefreshCcw, HardDrive, Clock, ShieldAlert, X , LayoutTemplate } from 'lucide-react';
import BackButton from '../../components/BackButton';

const DatabaseManagement = () => {
  const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false);

  // Dummy Data
  const backupHistory = [
    { id: 1, date: '2026-06-05 02:00 AM', size: '25.4 MB', type: 'Automated', status: 'Success' },
    { id: 2, date: '2026-06-04 02:00 AM', size: '25.1 MB', type: 'Automated', status: 'Success' },
    { id: 3, date: '2026-06-03 14:30 PM', size: '24.8 MB', type: 'Manual', status: 'Success' },
    { id: 4, date: '2026-06-03 02:00 AM', size: '24.5 MB', type: 'Automated', status: 'Failed' },
  ];

  return (
    <div className="space-y-6 pb-20">
      <Helmet>
        <title>Database Management - Super Admin</title>
      </Helmet>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="flex items-center gap-3">
          <BackButton fallbackRoute="/superadmin" showText={false} />
          <div>
            <h1 className="text-2xl font-bold dark:text-white flex items-center gap-2">
              <LayoutTemplate className="w-6 h-6 text-primary" />
              Database Management
            </h1>
            <p className="text-slate-500 text-sm mt-1">Backup, restore, and schedule MongoDB snapshots.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Backup Controls */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-4 mb-6">
            <HardDrive className="w-5 h-5 text-blue-500" />
            <h2 className="text-lg font-bold dark:text-white">Backup Operations</h2>
          </div>
          
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-900/30 gap-4">
              <div>
                <h3 className="font-bold text-blue-700 dark:text-blue-400">Manual Backup</h3>
                <p className="text-sm text-blue-600 dark:text-blue-500/80 mt-1">Generate a full database snapshot immediately.</p>
              </div>
              <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg flex items-center justify-center gap-2 transition shadow-lg shadow-blue-500/30 whitespace-nowrap">
                <Download className="w-4 h-4" /> Create Backup
              </button>
            </div>

            <div>
              <h3 className="text-sm font-bold mb-3 dark:text-slate-300 flex items-center gap-2">
                <Clock className="w-4 h-4" /> Scheduled Backups
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Enable Auto-Backup</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-green-500"></div>
                  </label>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1 dark:text-slate-400">Frequency</label>
                  <select className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500">
                    <option>Daily at 02:00 AM</option>
                    <option>Weekly (Sunday)</option>
                    <option>Monthly (1st Day)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Restore Controls */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-4 mb-6">
            <RefreshCcw className="w-5 h-5 text-red-500" />
            <h2 className="text-lg font-bold dark:text-white">Restore Operations</h2>
          </div>
          
          <div className="p-4 bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-100 dark:border-red-900/30">
            <div className="flex items-start gap-3 mb-4">
              <ShieldAlert className="w-6 h-6 text-red-500 shrink-0" />
              <div>
                <h3 className="font-bold text-red-700 dark:text-red-400">Danger Zone</h3>
                <p className="text-sm text-red-600 dark:text-red-500/80 mt-1">
                  Restoring a backup will overwrite all current data. Any data created after the backup date will be permanently lost.
                </p>
              </div>
            </div>
            
            <div className="space-y-3">
              <label className="block text-sm font-semibold dark:text-red-300">Select Backup to Restore</label>
              <select className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-red-200 dark:border-red-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm">
                <option>Automated Backup - 2026-06-05 02:00 AM</option>
                <option>Automated Backup - 2026-06-04 02:00 AM</option>
                <option>Manual Backup - 2026-06-03 14:30 PM</option>
              </select>
              <button 
                onClick={() => setIsRestoreModalOpen(true)}
                className="w-full py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-lg flex items-center justify-center gap-2 transition shadow-lg shadow-red-500/30 mt-4"
              >
                <RefreshCcw className="w-4 h-4" /> Restore Database
              </button>
            </div>
          </div>
        </motion.div>

        {/* Backup History Table */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="lg:col-span-2 glass-card overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800">
            <h2 className="font-bold dark:text-white">Backup History</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">
                  <th className="p-4 font-semibold">Date / Time</th>
                  <th className="p-4 font-semibold">Size</th>
                  <th className="p-4 font-semibold">Type</th>
                  <th className="p-4 font-semibold">Status</th>
                  <th className="p-4 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {backupHistory.map((history) => (
                  <tr key={history.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                    <td className="p-4 font-semibold dark:text-white text-sm">{history.date}</td>
                    <td className="p-4 text-sm text-slate-500 dark:text-slate-400">{history.size}</td>
                    <td className="p-4 text-sm text-slate-500">{history.type}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                        history.status === 'Success' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 
                        'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                      }`}>
                        {history.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button className="text-blue-500 hover:text-blue-700 text-sm font-semibold hover:underline">Download file</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

      </div>

      {/* Restore Confirmation Modal */}
      <AnimatePresence>
        {isRestoreModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsRestoreModalOpen(false)}
              className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-card relative w-full max-w-md p-6 shadow-2xl z-10 border border-red-500/50 bg-white dark:bg-slate-900 text-center"
            >
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShieldAlert className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold dark:text-white mb-2">Are you absolutely sure?</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                This action cannot be undone. This will permanently overwrite your current database with the selected backup snapshot. All recent data will be lost.
              </p>
              
              <div className="space-y-3">
                <button className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition shadow-lg shadow-red-500/30">
                  Yes, Restore Database
                </button>
                <button 
                  onClick={() => setIsRestoreModalOpen(false)}
                  className="w-full py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold rounded-xl transition text-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DatabaseManagement;
