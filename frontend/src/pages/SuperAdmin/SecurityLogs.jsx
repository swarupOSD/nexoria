import CustomSearchBar from '../../components/CustomSearchBar';
import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { ShieldAlert, AlertTriangle, Info, CheckCircle, Search, Filter, Trash2, Loader2 } from 'lucide-react';

import { useGetSecurityLogsQuery, useClearSecurityLogsMutation } from '../../features/system/systemApiSlice';
import { toast } from 'react-hot-toast';

const SecurityLogs = () => {
  const [filter, setFilter] = useState('All');
  
  const { data: logsData, isLoading, refetch } = useGetSecurityLogsQuery(undefined, { pollingInterval: 60000 });
  const [clearLogs, { isLoading: isClearing }] = useClearSecurityLogsMutation();

  const mockLogs = logsData?.data || [];

  const filteredLogs = filter === 'All' ? mockLogs : mockLogs.filter(log => log.eventType === filter || log.severity === filter);

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'Critical': return <ShieldAlert className="w-5 h-5 text-red-500" />;
      case 'High': return <AlertTriangle className="w-5 h-5 text-orange-500" />;
      case 'Medium': return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'Low': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'Info': return <Info className="w-5 h-5 text-blue-500" />;
      default: return <Info className="w-5 h-5 text-slate-500" />;
    }
  };

  const getSeverityStyle = (severity) => {
    switch (severity) {
      case 'Critical': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800/50';
      case 'High': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border border-orange-200 dark:border-orange-800/50';
      case 'Medium': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800/50';
      case 'Low': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800/50';
      case 'Info': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200 dark:border-blue-800/50';
      default: return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400';
    }
  };

  return (
    <div className="space-y-6 pb-20">
      <Helmet>
        <title>Security Logs - Super Admin</title>
      </Helmet>

      <div>
        <h1 className="text-2xl font-bold dark:text-white">System Security Logs</h1>
        <p className="text-slate-500 text-sm mt-1">Monitor authentication events, administrative actions, and system alerts.</p>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card overflow-hidden"
      >
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex gap-4 items-center w-full sm:w-auto">
            <button
              onClick={async () => {
                if (window.confirm('Are you sure you want to clear all security logs?')) {
                  try {
                    await clearLogs().unwrap();
                    toast.success('Logs cleared successfully');
                    refetch();
                  } catch (err) {
                    toast.error('Failed to clear logs');
                  }
                }
              }}
              disabled={isClearing}
              className="px-4 py-2 bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 font-semibold rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" /> Clear Logs
            </button>
          </div>
          <div className="relative w-full sm:w-96 flex-1">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <CustomSearchBar placeholder="Search logs by IP or Action..." name="text"  />
            <select 
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full sm:w-auto px-4 py-2 bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm dark:text-white"
            >
              <option value="All">All Severities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
              <option value="Info">Info</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">
                <th className="p-4 font-semibold">Action Event</th>
                <th className="p-4 font-semibold">User / Source</th>
                <th className="p-4 font-semibold">IP Address</th>
                <th className="p-4 font-semibold">Severity</th>
                <th className="p-4 font-semibold text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {isLoading ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-slate-500">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-500 mb-2" />
                    Loading logs...
                  </td>
                </tr>
              ) : filteredLogs.map((log) => (
                <tr key={log._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      {getSeverityIcon(log.severity)}
                      <span className="font-semibold dark:text-white text-sm">{log.eventType}</span>
                    </div>
                  </td>
                  <td className="p-4 text-sm font-medium dark:text-slate-300">{log.user?.email || 'System'}</td>
                  <td className="p-4 text-sm text-slate-500 dark:text-slate-400 font-mono">{log.ipAddress}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getSeverityStyle(log.severity)}`}>
                      {log.severity || 'Info'}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-slate-500 text-right">{new Date(log.createdAt).toLocaleString()}</td>
                </tr>
              ))}
              {!isLoading && filteredLogs.length === 0 && (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-slate-500">
                    No logs found for the selected severity level.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};

export default SecurityLogs;
