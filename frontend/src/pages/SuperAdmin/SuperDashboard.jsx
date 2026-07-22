import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { 
  Users, Shield, FileText, Folder, 
  Download, DollarSign, TrendingUp, TrendingDown,
  Crown, UserX, Star, Activity, Server, Database, AlertTriangle, Zap, Bell, Circle
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend, PieChart, Pie, Cell
} from 'recharts';
import { useGetSuperAdminAnalyticsQuery } from '../../features/analytics/analyticsApiSlice';
import CountUp from '../../components/CountUp';
import BackButton from '../../components/BackButton';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-card p-3 border border-slate-200/50 dark:border-white/10">
        <p className="font-bold text-slate-800 dark:text-white mb-2">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} style={{ color: entry.color || entry.fill }} className="text-sm font-semibold">
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const SuperDashboard = () => {
  const { data: analyticsRes, isLoading } = useGetSuperAdminAnalyticsQuery();
  
  if (isLoading) return <div className="text-center mt-20">Loading...</div>;

  const data = analyticsRes?.data;
  const stats = [
    { title: 'Total Users', value: data?.overview?.totalUsers || 0, isUp: true, icon: <Users className="w-6 h-6" />, color: 'from-indigo-500 to-purple-600' },
    { title: 'Premium Users', value: data?.overview?.totalPremiumUsers || 0, isUp: true, icon: <Crown className="w-6 h-6" />, color: 'from-amber-400 to-orange-500' },
    { title: 'MRR (Revenue)', value: data?.overview?.revenue || 0, prefix: '$', isUp: true, icon: <DollarSign className="w-6 h-6" />, color: 'from-emerald-400 to-teal-500' },
    { title: 'Adblock Rate', value: data?.overview?.adblockRate || 0, prefix: '', suffix: '%', isUp: false, icon: <Shield className="w-6 h-6" />, color: 'from-rose-400 to-red-500' },
    { title: 'Total Downloads', value: data?.overview?.totalDownloads || 0, isUp: true, icon: <Download className="w-6 h-6" />, color: 'from-blue-500 to-cyan-500' },
    { title: 'Churn Rate', value: data?.overview?.churnRate || 0, prefix: '', suffix: '%', isUp: false, icon: <UserX className="w-6 h-6" />, color: 'from-slate-600 to-slate-800' },
  ];

  const systemHealth = [
    { title: 'Active Users', value: data?.overview?.activeUsers || 0, icon: <Users className="w-5 h-5 text-emerald-400" />, status: 'good' },
    { title: 'Broken Links', value: data?.overview?.brokenLinkReports || 0, icon: <AlertTriangle className="w-5 h-5 text-amber-400" />, status: data?.overview?.brokenLinkReports > 5 ? 'warning' : 'good' },
    { title: 'Security Alerts', value: data?.overview?.securityAlerts || 0, icon: <Shield className="w-5 h-5 text-indigo-400" />, status: data?.overview?.securityAlerts > 10 ? 'warning' : 'good' },
    { title: 'Pending Payments', value: data?.overview?.pendingPayments || 0, icon: <DollarSign className="w-5 h-5 text-amber-400" />, status: 'warning' },
  ];

  const recentActivity = data?.recentActivities || [];

  const downloadTrends = data?.downloadTrends || [];
  const deviceUsage = data?.deviceUsage || [];
  const COLORS = ['#6366F1', '#A855F7', '#F43F5E'];



  return (
    <div className="space-y-6">
      <Helmet>
        <title>Super Admin Dashboard</title>
      </Helmet>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <BackButton fallbackRoute="/superadmin" showText={false} />
          <div>
            <h1 className="text-2xl font-bold dark:text-white flex items-center gap-2">
              <Shield className="w-6 h-6 text-primary" />
              Super Admin Console
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Global system overview and control</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        {stats.map((stat, idx) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white dark:bg-[#111] p-5 rounded-3xl border border-slate-200 dark:border-white/10 shadow-xl shadow-slate-200/50 dark:shadow-none relative overflow-hidden group flex flex-col justify-between"
          >
            <div className={`p-3 rounded-2xl bg-gradient-to-br ${stat.color} text-white w-max mb-4 ring-4 ring-slate-50 dark:ring-white/5`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-slate-500 dark:text-slate-400 text-[11px] font-black uppercase tracking-widest">{stat.title}</p>
              <h3 className="text-3xl font-black text-slate-800 dark:text-white mt-1 tracking-tight">
                <CountUp value={stat.value} prefix={stat.prefix || ''} suffix={stat.suffix || ''} />
              </h3>
              <div className="flex items-center gap-1 text-[10px] font-bold mt-2 text-slate-400 uppercase tracking-widest">
                <Circle className="w-2 h-2 text-green-500 fill-current animate-pulse" />
                <span className="ml-1">Live Feed</span>
              </div>
            </div>
            {/* Ambient Background Gradient */}
            <div className={`absolute -bottom-10 -right-10 w-32 h-32 bg-gradient-to-br ${stat.color} opacity-20 blur-3xl rounded-full group-hover:scale-150 transition-transform duration-700`}></div>
          </motion.div>
        ))}
      </div>

      {/* System Health & Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* System Health Monitor */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="lg:col-span-2 bg-white dark:bg-[#111] border border-slate-200 dark:border-white/10 rounded-3xl p-6 md:p-8 shadow-xl shadow-slate-200/50 dark:shadow-none"
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">System Health</h3>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Real-time infrastructure metrics</p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full text-green-600 dark:text-green-400">
              <Circle className="w-3 h-3 fill-current animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider">All Systems Operational</span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {systemHealth.map((item, idx) => (
              <div key={idx} className="bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-2xl p-5 relative overflow-hidden group">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-white dark:bg-[#050505] rounded-xl shadow-sm border border-slate-100 dark:border-white/5">
                    {item.icon}
                  </div>
                </div>
                <h4 className="text-2xl font-black text-slate-900 dark:text-white mb-1">{item.value}</h4>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{item.title}</p>
                <div className={`absolute bottom-0 left-0 w-full h-1 ${item.status === 'good' ? 'bg-emerald-500' : 'bg-amber-500'} scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500`}></div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Live Activity Feed */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="bg-white dark:bg-[#111] border border-slate-200 dark:border-white/10 rounded-3xl p-6 shadow-xl shadow-slate-200/50 dark:shadow-none flex flex-col h-[320px]"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <Bell className="w-5 h-5 text-indigo-500" /> Audit Log
            </h3>
          </div>
          
          <div className="flex-1 overflow-y-auto pr-2 space-y-4 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-slate-200 dark:[&::-webkit-scrollbar-thumb]:bg-slate-800">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex gap-4 group">
                <div className="relative flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${activity.bg}`}>
                    {activity.alert ? <AlertTriangle className={`w-4 h-4 ${activity.color}`} /> : <Activity className={`w-4 h-4 ${activity.color}`} />}
                  </div>
                  <div className="w-px h-full bg-slate-200 dark:bg-slate-800 group-last:hidden mt-2"></div>
                </div>
                <div className="pb-4">
                  <p className={`text-sm font-bold ${activity.alert ? 'text-red-500' : 'text-slate-800 dark:text-slate-200'}`}>
                    {activity.message}
                  </p>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Revenue Chart */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 bg-white dark:bg-[#111] p-6 rounded-3xl border border-slate-200 dark:border-white/10 shadow-xl shadow-slate-200/50 dark:shadow-none"
        >
          <h3 className="text-lg font-black text-slate-900 dark:text-white mb-6 tracking-tight">Revenue & Download Trends</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={downloadTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.15)" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis stroke="#64748b" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(148, 163, 184, 0.25)', strokeWidth: 1, strokeDasharray: '4 4' }} />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                <Area type="monotone" dataKey="downloads" stroke="#8B5CF6" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* User Distribution Chart */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white dark:bg-[#111] p-6 rounded-3xl border border-slate-200 dark:border-white/10 shadow-xl shadow-slate-200/50 dark:shadow-none flex flex-col"
        >
          <h3 className="text-lg font-black text-slate-900 dark:text-white mb-2 tracking-tight">Traffic Distribution</h3>
          <div className="flex-1 w-full min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={deviceUsage}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {deviceUsage.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

      </div>
    </div>
  );
};

export default SuperDashboard;
