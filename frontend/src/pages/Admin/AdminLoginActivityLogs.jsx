import CustomSearchBar from '../../components/CustomSearchBar';
import { useState } from 'react';
import { useGetAllActivitiesQuery } from '../../features/activity/activityApiSlice';
import { LogIn, Clock, Search, MapPin, Monitor } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';

const AdminLoginActivityLogs = () => {
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  
  // We filter specifically for Login activities
  const { data: response, isLoading } = useGetAllActivitiesQuery({ 
    page, 
    limit: 50,
    actionType: 'User Login'
  });

  const activities = response?.data || [];
  const pagination = response?.pagination || {};

  const filteredLogs = activities.filter(log => 
    (log.user?.email?.toLowerCase().includes(searchQuery.toLowerCase()) || 
     log.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
     log.ipAddress?.includes(searchQuery))
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <Helmet>
        <title>Login Activity - Admin</title>
      </Helmet>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold dark:text-white flex items-center gap-2">
            <LogIn className="w-6 h-6 text-primary" /> Login Activity Log
          </h2>
          <p className="text-slate-500 text-sm mt-1">Track who logged in, when, and from which IP.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <CustomSearchBar value={searchQuery} placeholder="Search user or IP..." name="text"  onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">User Info</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">IP Address</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Device / Browser</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/50">
              {isLoading ? (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center text-slate-500">Loading login history...</td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center text-slate-500">No login activity found.</td>
                </tr>
              ) : (
                filteredLogs.map((activity) => (
                  <tr key={activity._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4">
                      {activity.user ? (
                        <div className="flex items-center gap-3">
                          <img src={activity.user.profileImage || '/default.jpg'} alt="Avatar" className="w-9 h-9 rounded-full object-cover border border-slate-200 dark:border-slate-700" />
                          <div>
                            <p className="font-semibold text-slate-800 dark:text-slate-200">{activity.user.name}</p>
                            <p className="text-xs text-slate-500">{activity.user.email}</p>
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-500 italic">Unknown User</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-slate-600 dark:text-slate-400 font-mono text-xs">
                          {activity.ipAddress || 'Unknown IP'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 max-w-xs">
                        <Monitor className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span className="text-slate-600 dark:text-slate-400 text-xs truncate" title={activity.userAgent}>
                          {activity.userAgent || 'Unknown Device'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <div>
                          <p className="text-slate-800 dark:text-slate-300 font-medium">{formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}</p>
                          <p className="text-xs text-slate-500">{format(new Date(activity.createdAt), 'PP p')}</p>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {pagination.pages > 1 && (
        <div className="flex justify-between items-center bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-slate-800 p-4 rounded-xl">
          <span className="text-sm text-slate-500 dark:text-slate-400">
            Showing page {page} of {pagination.pages} ({pagination.total} total logins)
          </span>
          <div className="flex gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
              className="px-4 py-2 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
            >
              Previous
            </button>
            <button
              disabled={page === pagination.pages}
              onClick={() => setPage(p => p + 1)}
              className="px-4 py-2 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLoginActivityLogs;
