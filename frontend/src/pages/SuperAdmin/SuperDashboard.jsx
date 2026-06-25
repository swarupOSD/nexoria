import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { 
  Users, Shield, FileText, Folder, 
  Download, DollarSign, TrendingUp, TrendingDown,
  Crown, UserX, Star
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
    { title: 'Total Users', value: data?.overview?.totalUsers || 0, isUp: true, icon: <Users className="w-6 h-6" />, color: 'from-primary to-secondary' },
    { title: 'Premium Users', value: data?.overview?.totalPremiumUsers || 0, isUp: true, icon: <Crown className="w-6 h-6" />, color: 'from-secondary to-accent' },
    { title: 'Total Revenue', value: data?.overview?.revenue || 0, prefix: '$', isUp: true, icon: <DollarSign className="w-6 h-6" />, color: 'from-success to-emerald-400' },
    { title: 'Pending Payments', value: data?.overview?.pendingPayments || 0, isUp: false, icon: <FileText className="w-6 h-6" />, color: 'from-warning to-amber-400' },
    { title: 'Total Downloads', value: data?.overview?.totalDownloads || 0, isUp: true, icon: <Download className="w-6 h-6" />, color: 'from-primary to-accent' },
    { title: 'Expired Premium', value: data?.overview?.expiredPremiumUsers || 0, isUp: false, icon: <UserX className="w-6 h-6" />, color: 'from-danger to-rose-400' },
  ];

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
            className="glass-card p-5 relative overflow-hidden group flex flex-col justify-between"
          >
            <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} text-white shadow-glow w-max mb-4 ring-1 ring-white/20`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">{stat.title}</p>
              <h3 className="text-3xl font-extrabold text-slate-800 dark:text-white mt-1">
                <CountUp value={stat.value} prefix={stat.prefix || ''} />
              </h3>
              <div className="flex items-center gap-1 text-xs font-bold mt-2 text-slate-400">
                <span className="font-medium ml-1">Realtime Live Data</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Revenue Chart */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 glass-panel p-6"
        >
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6">Download Trends</h3>
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
          className="glass-panel p-6 flex flex-col"
        >
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">User Distribution</h3>
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
