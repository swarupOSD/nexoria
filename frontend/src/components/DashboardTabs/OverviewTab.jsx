import { motion } from 'framer-motion';
import { Download, Star, Bell, Calendar, Activity, ArrowRight, Zap, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

const OverviewTab = ({ user, purchases, notificationsCount, premiumRequests, recentActivity }) => {
  return (
    <div className="space-y-4">
      {/* Ultra Compact Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 flex flex-col justify-between overflow-hidden relative group">
          <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-blue-500/20 rounded-full blur-xl group-hover:bg-blue-500/30 transition-colors"></div>
          <div className="flex items-center gap-2 mb-2">
            <Download className="w-4 h-4 text-blue-400" />
            <span className="text-[11px] uppercase tracking-widest text-slate-400 font-bold">Apps</span>
          </div>
          <h3 className="text-3xl font-black text-white leading-none">{purchases?.length || 0}</h3>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }} className="bg-amber-500/10 backdrop-blur-xl border border-amber-500/20 rounded-2xl p-4 flex flex-col justify-between overflow-hidden relative group">
          <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-amber-500/20 rounded-full blur-xl group-hover:bg-amber-500/30 transition-colors"></div>
          <div className="flex items-center gap-2 mb-2">
            <Star className="w-4 h-4 text-amber-500" />
            <span className="text-[11px] uppercase tracking-widest text-amber-500/70 font-bold">Premium</span>
          </div>
          <h3 className="text-xl font-black text-amber-400 leading-none mt-1">{user?.isPremium ? 'ACTIVE' : 'FREE'}</h3>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 flex flex-col justify-between overflow-hidden relative group">
          <div className="flex items-center gap-2 mb-2">
            <Bell className="w-4 h-4 text-indigo-400" />
            <span className="text-[11px] uppercase tracking-widest text-slate-400 font-bold">Alerts</span>
          </div>
          <h3 className="text-3xl font-black text-white leading-none">{notificationsCount || 0}</h3>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 flex flex-col justify-between overflow-hidden relative group">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-4 h-4 text-emerald-400" />
            <span className="text-[11px] uppercase tracking-widest text-slate-400 font-bold">Expiry</span>
          </div>
          <h3 className="text-sm font-bold text-emerald-400 mt-auto leading-tight">
            {user?.isPremium ? (user.premiumEndDate ? new Date(user.premiumEndDate).toLocaleDateString() : 'LIFETIME') : 'N/A'}
          </h3>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Quick Actions */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-5">
          <h3 className="text-sm font-black text-white mb-4 uppercase tracking-widest opacity-50 flex items-center gap-2">
            <Zap className="w-4 h-4"/> Quick Actions
          </h3>
          <div className="flex flex-col gap-3">
            <Link to="/premium" className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-black rounded-2xl font-black transition-all active:scale-95 shadow-lg shadow-yellow-500/20">
              <Star className="w-5 h-5" /> UPGRADE PLAN
            </Link>
            <Link to="/categories" className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-white/10 hover:bg-white/20 text-white border border-white/10 rounded-2xl font-bold transition-all active:scale-95">
              <Download className="w-5 h-5" /> Browse Apps
            </Link>
          </div>
        </motion.div>

        {/* Account Status */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-5">
          <h3 className="text-sm font-black text-white mb-4 uppercase tracking-widest opacity-50 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4"/> Account Profile
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Joined</span>
              <span className="text-sm font-black text-white">{new Date(user?.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Status</span>
              <span className={`px-2.5 py-1 rounded-full text-[10px] font-black tracking-widest ${user?.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                {user?.status?.toUpperCase()}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Role</span>
              <span className="text-sm font-black text-white uppercase tracking-widest">{user?.role}</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Recent Activity */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-5">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-sm font-black text-white uppercase tracking-widest opacity-50 flex items-center gap-2">
            <Activity className="w-4 h-4" /> Activity Feed
          </h3>
          <Link to="/activity" className="text-[11px] font-black text-blue-400 hover:text-blue-300 uppercase tracking-widest bg-blue-500/10 px-3 py-1.5 rounded-full transition-colors">
            View All
          </Link>
        </div>
        
        {recentActivity?.length > 0 ? (
          <div className="space-y-3">
            {recentActivity.slice(0, 5).map((activity) => (
              <div key={activity._id} className="flex gap-3 p-3 bg-black/40 rounded-2xl border border-white/5 items-center">
                <div className="w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center shrink-0">
                  <Zap className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white truncate">{activity.actionType}</p>
                  <p className="text-[11px] text-slate-400 truncate">{activity.description}</p>
                </div>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider shrink-0 text-right">
                  {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-black/20 rounded-2xl border border-white/5 border-dashed">
            <Activity className="w-8 h-8 text-white/20 mx-auto mb-2" />
            <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest">No recent activity</p>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default OverviewTab;
