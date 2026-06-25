import { useState } from 'react';
import { useGetAllActivitiesQuery } from '../../features/activity/activityApiSlice';
import { Activity, Clock, Search, Filter } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { motion } from 'framer-motion';

const AdminActivityLogs = () => {
  const [page, setPage] = useState(1);
  const [filterAction, setFilterAction] = useState('');
  
  const { data: response, isLoading } = useGetAllActivitiesQuery({ 
    page, 
    limit: 50,
    ...(filterAction ? { actionType: filterAction } : {})
  });

  const activities = response?.data || [];
  const pagination = response?.pagination || {};

  const actionTypes = [
    '',
    'User Login',
    'User Logout',
    'User Registration',
    'Password Reset',
    'Password Changed',
    'Profile Updated',
    'Role Updated',
    'Premium Activated',
    'Premium Revoked',
    'Premium Expired',
    'Comment Added',
    'Reply Added',
    'Rating Added',
    'Report Submitted',
    'Download'
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">System Activity Logs</h2>
          <p className="text-slate-400 text-sm">Monitor user actions and system events.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <select
              value={filterAction}
              onChange={(e) => {
                setFilterAction(e.target.value);
                setPage(1);
              }}
              className="pl-9 pr-8 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-200 focus:ring-2 focus:ring-indigo-500 appearance-none"
            >
              <option value="">All Actions</option>
              {actionTypes.filter(t => t).map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="bg-[#111827] border border-slate-800 rounded-2xl overflow-hidden shadow-xl shadow-black/20">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-800/50 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="px-6 py-4 font-semibold">User</th>
                <th className="px-6 py-4 font-semibold">Action</th>
                <th className="px-6 py-4 font-semibold">Description</th>
                <th className="px-6 py-4 font-semibold">IP Address</th>
                <th className="px-6 py-4 font-semibold">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {isLoading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-slate-400">Loading activities...</td>
                </tr>
              ) : activities.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-slate-400">No activity logs found.</td>
                </tr>
              ) : (
                activities.map((activity) => (
                  <tr key={activity._id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4">
                      {activity.user ? (
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold uppercase">
                            {activity.user.name?.charAt(0) || 'U'}
                          </div>
                          <div>
                            <p className="font-medium text-slate-200">{activity.user.name}</p>
                            <p className="text-xs text-slate-500">{activity.user.email}</p>
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-500 italic">System / Anonymous</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 bg-slate-800 text-slate-300 border border-slate-700 rounded-md text-xs font-medium whitespace-nowrap">
                        {activity.actionType}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-slate-300 max-w-xs truncate" title={activity.description}>
                        {activity.description}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-slate-400 font-mono text-xs">
                        {activity.ipAddress || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-slate-300">{formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}</p>
                      <p className="text-xs text-slate-500">{format(new Date(activity.createdAt), 'PP p')}</p>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {pagination.pages > 1 && (
        <div className="flex justify-between items-center bg-[#111827] border border-slate-800 p-4 rounded-xl">
          <span className="text-sm text-slate-400">
            Showing page {page} of {pagination.pages} ({pagination.total} total records)
          </span>
          <div className="flex gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
            >
              Previous
            </button>
            <button
              disabled={page === pagination.pages}
              onClick={() => setPage(p => p + 1)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminActivityLogs;
