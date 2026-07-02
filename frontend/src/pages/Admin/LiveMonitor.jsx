import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Users, Download, Bell, Shield, Database, Cpu, HardDrive, DollarSign , LayoutTemplate } from 'lucide-react';
import { useSocket } from '../../context/SocketContext';
import BackButton from '../../components/BackButton';

const LiveMonitor = () => {
  const socket = useSocket();
  const [onlineStats, setOnlineStats] = useState({ total: 0, guests: 0, premium: 0, admins: 0, superAdmins: 0 });
  const [liveActivities, setLiveActivities] = useState([]);
  const [liveDownloads, setLiveDownloads] = useState([]);
  const [liveRevenue, setLiveRevenue] = useState([]);
  const [notifications, setNotifications] = useState([]);
  
  // Fake server stats that "update" live for the demo (since we don't have real OS stats from Node)
  const [serverStats, setServerStats] = useState({ cpu: 12, memory: 45, connections: 0 });

  useEffect(() => {
    if (!socket) return;

    // Online Stats
    socket.on('onlineStats', (stats) => {
      setOnlineStats(stats);
      setServerStats(prev => ({ ...prev, connections: stats.total }));
    });

    // Activities
    socket.on('newActivity', (activity) => {
      setLiveActivities(prev => [activity, ...prev].slice(0, 20));
    });

    // Downloads
    socket.on('liveDownload', (download) => {
      setLiveDownloads(prev => [download, ...prev].slice(0, 15));
    });

    // Notifications
    socket.on('newNotification', (notif) => {
      setNotifications(prev => [notif, ...prev].slice(0, 10));
    });

    // Revenue
    socket.on('liveRevenue', (rev) => {
      setLiveRevenue(prev => [rev, ...prev].slice(0, 10));
    });

    // Mock CPU/Memory fluctuation
    const interval = setInterval(() => {
      setServerStats(prev => ({
        ...prev,
        cpu: Math.max(5, Math.min(95, prev.cpu + (Math.random() * 10 - 5))),
        memory: Math.max(20, Math.min(90, prev.memory + (Math.random() * 4 - 2)))
      }));
    }, 3000);

    return () => {
      socket.off('onlineStats');
      socket.off('newActivity');
      socket.off('liveDownload');
      socket.off('newNotification');
      socket.off('liveRevenue');
      clearInterval(interval);
    };
  }, [socket]);

  return (
    <div className="space-y-6">
      <Helmet>
        <title>Live Monitor - Admin Panel</title>
      </Helmet>

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold dark:text-white flex items-center gap-2">
            <Activity className="w-6 h-6 text-green-500 animate-pulse" /> Live Monitor
          </h1>
          <p className="text-slate-500 text-sm mt-1">Real-time intelligence and monitoring</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex h-3 w-3 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
          </span>
          <span className="text-sm font-bold text-green-600 dark:text-green-400">System Online</span>
        </div>
      </div>

      {/* ONLINE USERS WIDGETS */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="glass-card p-4 border border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.1)]">
          <p className="text-xs font-semibold text-slate-500 mb-1">Total Online</p>
          <p className="text-3xl font-bold text-blue-500">{onlineStats.total}</p>
        </div>
        <div className="glass-card p-4">
          <p className="text-xs font-semibold text-slate-500 mb-1">Guests</p>
          <p className="text-2xl font-bold text-slate-700 dark:text-slate-300">{onlineStats.guests}</p>
        </div>
        <div className="glass-card p-4">
          <p className="text-xs font-semibold text-slate-500 mb-1">Premium</p>
          <p className="text-2xl font-bold text-yellow-500">{onlineStats.premium}</p>
        </div>
        <div className="glass-card p-4">
          <p className="text-xs font-semibold text-slate-500 mb-1">Admins</p>
          <p className="text-2xl font-bold text-purple-500">{onlineStats.admins}</p>
        </div>
        <div className="glass-card p-4">
          <p className="text-xs font-semibold text-slate-500 mb-1">SuperAdmins</p>
          <p className="text-2xl font-bold text-red-500">{onlineStats.superAdmins}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* SERVER STATUS */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-bold dark:text-white mb-4 flex items-center gap-2"><Database className="text-blue-500 w-5 h-5"/> Server Status</h3>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-semibold flex items-center gap-1"><Cpu className="w-4 h-4"/> CPU Usage</span>
                <span className="text-sm font-bold">{serverStats.cpu.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full transition-all duration-1000" style={{ width: `${serverStats.cpu}%` }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-semibold flex items-center gap-1"><HardDrive className="w-4 h-4"/> Memory Usage</span>
                <span className="text-sm font-bold">{serverStats.memory.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                <div className="bg-purple-500 h-2 rounded-full transition-all duration-1000" style={{ width: `${serverStats.memory}%` }}></div>
              </div>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl flex justify-between items-center border border-slate-200 dark:border-slate-700">
              <span className="text-sm font-bold">Active Connections</span>
              <span className="text-lg font-bold text-green-500">{serverStats.connections}</span>
            </div>
          </div>
        </div>

        {/* LIVE REVENUE */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-bold dark:text-white mb-4 flex items-center gap-2"><DollarSign className="text-green-500 w-5 h-5"/> Live Revenue Stream</h3>
          <div className="space-y-3 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
            <AnimatePresence>
              {liveRevenue.map((rev, i) => (
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  key={i} 
                  className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl flex justify-between items-center"
                >
                  <div>
                    <p className="text-sm font-bold text-green-700 dark:text-green-400">+{rev.amount} {rev.currency}</p>
                    <p className="text-xs text-green-600 dark:text-green-500">{rev.plan} Plan</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-semibold">{rev.user}</p>
                    <p className="text-[10px] text-slate-500">{new Date(rev.timestamp).toLocaleTimeString()}</p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {liveRevenue.length === 0 && <p className="text-sm text-slate-500 italic">Listening for new transactions...</p>}
          </div>
        </div>

        {/* LIVE DOWNLOADS */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-bold dark:text-white mb-4 flex items-center gap-2"><Download className="text-indigo-500 w-5 h-5"/> Live Downloads</h3>
          <div className="space-y-3 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
            <AnimatePresence>
              {liveDownloads.map((dl, i) => (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={i} 
                  className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center gap-3 border border-slate-200 dark:border-slate-700"
                >
                  <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center shrink-0">
                    <Download className="w-4 h-4 text-indigo-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate dark:text-white">{dl.appName}</p>
                    <p className="text-xs text-slate-500 truncate">{dl.user} • {dl.mirror}</p>
                  </div>
                  <span className="text-[10px] text-slate-400 whitespace-nowrap">{new Date(dl.timestamp).toLocaleTimeString()}</span>
                </motion.div>
              ))}
            </AnimatePresence>
            {liveDownloads.length === 0 && <p className="text-sm text-slate-500 italic">Listening for downloads...</p>}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LIVE ACTIVITY FEED */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-bold dark:text-white mb-4 flex items-center gap-2"><Users className="text-purple-500 w-5 h-5"/> Live Activity Feed</h3>
          <div className="space-y-3 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
            <AnimatePresence>
              {liveActivities.map((act, i) => (
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  key={i} 
                  className="flex items-start gap-3 p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl transition-colors"
                >
                  <img src={act.user?.avatar || 'https://cdn-icons-png.flaticon.com/512/149/149071.png'} className="w-8 h-8 rounded-full bg-slate-200" alt="avatar" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold dark:text-white">{act.user?.name || 'Unknown'}</p>
                    <p className="text-xs text-slate-600 dark:text-slate-300">{act.description}</p>
                    <p className="text-[10px] text-slate-400 mt-1">{new Date(act.createdAt).toLocaleTimeString()}</p>
                  </div>
                  <span className="text-xs font-bold px-2 py-1 bg-purple-100 text-purple-600 dark:bg-purple-900/30 rounded">{act.actionType}</span>
                </motion.div>
              ))}
            </AnimatePresence>
            {liveActivities.length === 0 && <p className="text-sm text-slate-500 italic">Listening for activities...</p>}
          </div>
        </div>

        {/* LIVE MODERATION & NOTIFICATIONS */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-bold dark:text-white mb-4 flex items-center gap-2"><Shield className="text-red-500 w-5 h-5"/> Priority Notifications</h3>
          <div className="space-y-3 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
            <AnimatePresence>
              {notifications.map((notif, i) => (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  key={i} 
                  className="p-3 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 rounded-xl flex items-start gap-3"
                >
                  <Bell className="w-5 h-5 text-red-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-red-700 dark:text-red-400">{notif.title}</p>
                    <p className="text-xs text-red-600 dark:text-red-300 mt-1">{notif.message}</p>
                    <p className="text-[10px] text-red-400 mt-2">{new Date(notif.createdAt).toLocaleTimeString()}</p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {notifications.length === 0 && <p className="text-sm text-slate-500 italic">No new priority notifications.</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveMonitor;
