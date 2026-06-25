import { motion } from 'framer-motion';
import { Download, Star, Bell, Calendar, Activity, ArrowRight, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

const OverviewTab = ({ user, purchases, notificationsCount, premiumRequests, recentActivity }) => {
  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-5 border border-primary/20 bg-gradient-to-br from-primary/5 to-transparent relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-16 h-16 bg-primary/10 rounded-full blur-xl"></div>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 text-primary rounded-xl"><Download className="w-6 h-6" /></div>
            <div>
              <p className="text-sm text-slate-500 font-medium">Purchased Apps</p>
              <h3 className="text-2xl font-black dark:text-white">{purchases?.length || 0}</h3>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-5 border border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-transparent relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-16 h-16 bg-amber-500/10 rounded-full blur-xl"></div>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-500/10 text-amber-500 rounded-xl"><Star className="w-6 h-6" /></div>
            <div>
              <p className="text-sm text-slate-500 font-medium">Premium Status</p>
              <h3 className="text-lg font-black text-amber-600 dark:text-amber-400 mt-0.5">{user?.isPremium ? 'Active' : 'Free'}</h3>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-5 border border-indigo-500/20 bg-gradient-to-br from-indigo-500/5 to-transparent relative overflow-hidden">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-500/10 text-indigo-500 rounded-xl"><Bell className="w-6 h-6" /></div>
            <div>
              <p className="text-sm text-slate-500 font-medium">Unread Alerts</p>
              <h3 className="text-2xl font-black dark:text-white">{notificationsCount || 0}</h3>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card p-5 border border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-transparent relative overflow-hidden">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl"><Calendar className="w-6 h-6" /></div>
            <div>
              <p className="text-sm text-slate-500 font-medium">Membership Expiry</p>
              <h3 className="text-sm font-bold dark:text-white mt-1 leading-tight">
                {user?.isPremium ? (user.premiumEndDate ? new Date(user.premiumEndDate).toLocaleDateString() : 'Lifetime') : 'N/A'}
              </h3>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-card p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold dark:text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" /> Recent Activity
              </h3>
              <Link to="/activity" className="text-sm font-semibold text-primary hover:text-primary/80 flex items-center gap-1">
                View All <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            
            {recentActivity?.length > 0 ? (
              <div className="space-y-4">
                {recentActivity.slice(0, 5).map((activity) => (
                  <div key={activity._id} className="flex gap-4 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition border border-transparent dark:hover:border-slate-800">
                    <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <Zap className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold dark:text-white">{activity.actionType}</p>
                      <p className="text-xs text-slate-500">{activity.description}</p>
                      <p className="text-[10px] text-slate-400 mt-1 font-mono uppercase">
                        {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                <Activity className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 font-medium">No recent activity found.</p>
              </div>
            )}
          </motion.div>
        </div>

        {/* Sidebar Area */}
        <div className="space-y-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="glass-card p-6 border-t-4 border-t-amber-500">
            <h3 className="text-lg font-bold dark:text-white mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Link to="/premium" className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white rounded-xl font-bold transition shadow-lg shadow-yellow-500/20">
                <Star className="w-5 h-5" /> Upgrade Plan
              </Link>
              <Link to="/categories" className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-white rounded-xl font-bold transition">
                <Download className="w-5 h-5" /> Browse Apps
              </Link>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="glass-card p-6">
            <h3 className="text-lg font-bold dark:text-white mb-4">Account Status</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">Joined</span>
                <span className="text-sm font-semibold dark:text-white">{new Date(user?.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">Status</span>
                <span className={`px-2 py-1 rounded text-xs font-bold ${user?.status === 'active' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                  {user?.status?.toUpperCase()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">Role</span>
                <span className="text-sm font-semibold capitalize dark:text-white">{user?.role}</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default OverviewTab;
