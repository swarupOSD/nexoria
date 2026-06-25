import { useState } from 'react';
import { useGetMyActivityQuery } from '../features/activity/activityApiSlice';
import { Activity, Clock, ShieldAlert, Key, LogIn, LogOut, Star, MessageCircle, FileText, Download } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import SEO from '../components/SEO';
import { motion } from 'framer-motion';

const getActionIcon = (actionType) => {
  const t = actionType.toLowerCase();
  if (t.includes('login')) return <LogIn className="w-5 h-5 text-emerald-400" />;
  if (t.includes('logout')) return <LogOut className="w-5 h-5 text-slate-400" />;
  if (t.includes('password')) return <Key className="w-5 h-5 text-red-400" />;
  if (t.includes('premium')) return <Star className="w-5 h-5 text-amber-400" />;
  if (t.includes('comment') || t.includes('reply')) return <MessageCircle className="w-5 h-5 text-blue-400" />;
  if (t.includes('download')) return <Download className="w-5 h-5 text-indigo-400" />;
  if (t.includes('report')) return <ShieldAlert className="w-5 h-5 text-orange-400" />;
  if (t.includes('profile')) return <FileText className="w-5 h-5 text-purple-400" />;
  return <Activity className="w-5 h-5 text-slate-400" />;
};

const UserActivity = () => {
  const [page, setPage] = useState(1);
  const { data: response, isLoading } = useGetMyActivityQuery({ page, limit: 20 });

  const activities = response?.data || [];
  const pagination = response?.pagination || {};

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl min-h-screen">
      <SEO title="Activity History - Premium Apps" description="View your account activity history." />

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Activity History</h1>
        <p className="text-slate-400">Track your account sessions, downloads, and interactions.</p>
      </div>

      <div className="bg-[#111827] border border-slate-800 rounded-2xl overflow-hidden shadow-xl shadow-black/20">
        {isLoading ? (
          <div className="p-8 text-center text-slate-400">Loading activity...</div>
        ) : activities.length === 0 ? (
          <div className="p-12 text-center text-slate-400 flex flex-col items-center">
            <Activity className="w-12 h-12 mb-4 opacity-20" />
            <h3 className="text-lg font-medium text-slate-300 mb-1">No activity found</h3>
            <p>You have no recent activity.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800/50">
            {activities.map((activity) => (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                key={activity._id}
                className="p-5 flex gap-4 hover:bg-slate-800/50 transition-colors"
              >
                <div className="flex-shrink-0 mt-1 bg-slate-800 p-2 rounded-lg border border-slate-700">
                  {getActionIcon(activity.actionType)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-base font-medium text-slate-200">
                      {activity.actionType}
                    </h4>
                    <div className="flex items-center text-xs text-slate-500 gap-1 whitespace-nowrap">
                      <Clock className="w-3 h-3" />
                      {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                    </div>
                  </div>
                  <p className="text-sm text-slate-400 mb-2">
                    {activity.description}
                  </p>
                  
                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                    {activity.ipAddress && (
                      <span className="bg-slate-800/80 px-2 py-1 rounded border border-slate-700/50">
                        IP: {activity.ipAddress}
                      </span>
                    )}
                    <span className="text-slate-600">
                      {format(new Date(activity.createdAt), 'PPpp')}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {pagination.pages > 1 && (
        <div className="flex justify-center mt-8 gap-2">
          <button
            disabled={page === 1}
            onClick={() => setPage(prev => prev - 1)}
            className="px-4 py-2 bg-[#111827] border border-slate-800 rounded-lg text-slate-300 disabled:opacity-50 hover:bg-slate-800 transition-colors"
          >
            Previous
          </button>
          <span className="px-4 py-2 text-slate-400 bg-[#111827] border border-slate-800 rounded-lg">
            Page {page} of {pagination.pages}
          </span>
          <button
            disabled={page === pagination.pages}
            onClick={() => setPage(prev => prev + 1)}
            className="px-4 py-2 bg-[#111827] border border-slate-800 rounded-lg text-slate-300 disabled:opacity-50 hover:bg-slate-800 transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default UserActivity;
