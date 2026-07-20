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
    <div className="font-jakarta bg-[#030303] min-h-screen text-white pt-24 pb-12 transition-colors duration-500 relative overflow-hidden selection:bg-blue-500/30">
      <SEO title="Activity History - Premium Apps" description="View your account activity history." />

      {/* Background Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/20 rounded-full blur-[150px]"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-600/20 rounded-full blur-[150px]"></div>
        
        {/* Animated Rings for visual interest */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[800px] aspect-square flex items-center justify-center opacity-20">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 60, repeat: Infinity, ease: "linear" }} className="absolute w-[100%] h-[100%] rounded-full border border-white/[0.03]" />
          <motion.div animate={{ rotate: -360 }} transition={{ duration: 40, repeat: Infinity, ease: "linear" }} className="absolute w-[80%] h-[80%] rounded-full border border-white/[0.05]" />
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-4xl relative z-10">
        <div className="mb-10 text-center">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center justify-center p-4 bg-white/5 border border-white/10 rounded-2xl mb-6 shadow-inner backdrop-blur-md">
            <Activity className="w-8 h-8 text-blue-400" />
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">
            Activity <span className="bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(59,130,246,0.3)]">History</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="text-lg text-white/60 font-medium max-w-2xl mx-auto leading-relaxed">
            Track your account sessions, downloads, and interactions.
          </motion.p>
        </div>

        <div className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] overflow-hidden shadow-[0_20px_40px_rgba(0,0,0,0.5)]">
        {isLoading ? (
          <div className="p-12 text-center flex justify-center">
            <div className="w-8 h-8 border-2 border-white/30 border-t-blue-500 rounded-full animate-spin"></div>
          </div>
        ) : activities.length === 0 ? (
          <div className="p-16 text-center flex flex-col items-center">
            <div className="w-24 h-24 bg-white/5 border border-white/10 rounded-[2rem] flex items-center justify-center mb-6 shadow-inner">
              <Activity className="w-10 h-10 text-white/30" />
            </div>
            <h3 className="text-2xl font-black text-white mb-2 tracking-tight">No activity found</h3>
            <p className="text-white/50 font-medium">You have no recent activity.</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {activities.map((activity) => (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                key={activity._id}
                className="p-6 flex gap-5 hover:bg-white/5 transition-colors group"
              >
                <div className="flex-shrink-0 mt-1 bg-black/20 p-3 rounded-2xl border border-white/5 shadow-inner group-hover:scale-110 transition-transform">
                  {getActionIcon(activity.actionType)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-lg font-black text-white tracking-tight">
                      {activity.actionType}
                    </h4>
                    <div className="flex items-center text-xs font-bold text-white/40 gap-1.5 whitespace-nowrap bg-black/40 px-3 py-1 rounded-lg">
                      <Clock className="w-3.5 h-3.5" />
                      {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                    </div>
                  </div>
                  <p className="text-[15px] text-white/70 font-medium mb-4 leading-relaxed">
                    {activity.description}
                  </p>
                  
                  <div className="flex flex-wrap items-center gap-3 text-xs font-bold text-white/40">
                    {activity.ipAddress && (
                      <span className="bg-black/40 px-3 py-1.5 rounded-xl border border-white/5 shadow-inner tracking-wider">
                        IP: {activity.ipAddress}
                      </span>
                    )}
                    <span className="tracking-wider">
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
        <div className="flex justify-center mt-12 gap-3 items-center">
          <button
            disabled={page === 1}
            onClick={() => setPage(prev => prev - 1)}
            className="px-5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white font-bold disabled:opacity-50 hover:bg-white/10 transition-colors shadow-inner backdrop-blur-md"
          >
            Previous
          </button>
          <span className="px-4 py-2 font-black text-white/50 tracking-wide">
            Page {page} of {pagination.pages}
          </span>
          <button
            disabled={page === pagination.pages}
            onClick={() => setPage(prev => prev + 1)}
            className="px-5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white font-bold disabled:opacity-50 hover:bg-white/10 transition-colors shadow-inner backdrop-blur-md"
          >
            Next
          </button>
        </div>
      )}
      </div>
    </div>
  );
};

export default UserActivity;
