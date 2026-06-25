import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Download, Gamepad2, Users, Box, MessageSquare, AlertCircle } from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, BarChart, Bar 
} from 'recharts';
import { useGetAdminAnalyticsQuery } from '../../features/analytics/analyticsApiSlice';
import CountUp from '../../components/CountUp';
import BackButton from '../../components/BackButton';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 rounded-lg shadow-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-primary to-accent"></div>
        <p className="font-semibold text-slate-800 dark:text-white mb-1">{label}</p>
        <p className="text-primary font-bold">
          {payload[0].value.toLocaleString()} <span className="text-sm font-normal text-slate-500">downloads</span>
        </p>
      </div>
    );
  }
  return null;
};

const Dashboard = () => {
  const { data: analyticsRes, isLoading } = useGetAdminAnalyticsQuery();
  
  if (isLoading) return <div className="text-center py-12 dark:text-white flex items-center justify-center gap-2"><TrendingUp className="animate-pulse w-5 h-5 text-primary" /> Loading metrics...</div>;

  const data = analyticsRes?.data || {};
  
  const stats = [
    { title: 'Total Posts', value: data?.stats?.totalPosts || 0, icon: <Box className="w-6 h-6" />, color: 'from-primary to-secondary' },
    { title: 'Public Apps', value: data?.stats?.publicApps || 0, icon: <Box className="w-6 h-6" />, color: 'from-primary to-accent' },
    { title: 'Premium Apps', value: data?.stats?.premiumApps || 0, icon: <Box className="w-6 h-6" />, color: 'from-secondary to-accent' },
    { title: 'Categories', value: data?.stats?.totalCategories || 0, icon: <Gamepad2 className="w-6 h-6" />, color: 'from-primary to-accent' },
    { title: 'Downloads', value: data?.stats?.totalDownloads || 0, icon: <Download className="w-6 h-6" />, color: 'from-success to-emerald-400' },
    { title: 'Total Reports', value: data?.stats?.totalReports || 0, icon: <Users className="w-6 h-6" />, color: 'from-danger to-rose-400' },
    { title: 'Broken Links (Pending)', value: data?.stats?.brokenLinkReports || 0, icon: <Box className="w-6 h-6" />, color: 'from-warning to-amber-400' },
  ];

  const downloadsData = data?.downloadsPerDay?.map(d => ({ name: d.date, downloads: d.downloads })) || [];
  const topDownloadedData = data?.topDownloaded?.map(d => ({ name: d.title.substring(0, 10), downloads: d.downloads })) || [];

  return (
    <div className="space-y-6">
      <Helmet>
        <title>Dashboard Overview - Admin Panel</title>
      </Helmet>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <BackButton fallbackRoute="/admin" showText={false} />
          <div>
            <h1 className="text-2xl font-bold dark:text-white flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-primary" />
              Dashboard Overview
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Platform metrics and analytics</p>
          </div>
        </div>
        <button onClick={() => window.print()} className="flex items-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 py-2 rounded-md font-medium hover:opacity-90 transition-opacity">
          <TrendingUp className="w-4 h-4" /> Generate Report
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat, idx) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white dark:bg-[#111111] p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4 relative overflow-hidden group hover:shadow-md transition-all duration-300"
          >
            <div className={`p-4 rounded-xl bg-gradient-to-br ${stat.color} text-white shadow-glow`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">{stat.title}</p>
              <h3 className="text-3xl font-extrabold text-slate-800 dark:text-white mt-1">
                <CountUp value={stat.value} />
              </h3>
            </div>
            {/* Decorative background circle */}
            <div className={`absolute -right-6 -top-6 w-24 h-24 bg-gradient-to-br ${stat.color} opacity-20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500`}></div>
          </motion.div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Downloads Chart */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 bg-white dark:bg-[#111111] border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm"
        >
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6">Downloads Analytics</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={downloadsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorGames" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorApps" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.15)" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis stroke="#64748b" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(148, 163, 184, 0.25)', strokeWidth: 1, strokeDasharray: '4 4' }} />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                <Area type="monotone" dataKey="downloads" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorGames)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* User Growth Chart */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white dark:bg-[#111111] border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm"
        >
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6">Top Downloaded</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topDownloadedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.15)" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 12 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }} />
                <Bar dataKey="downloads" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

      </div>

      {/* Link Health Monitor & Performance Tracker */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Link Health */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white dark:bg-[#111111] border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm"
        >
          <h3 className="text-lg font-bold dark:text-white mb-6">Link Health Stats</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-100/50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200/50 dark:border-white/10">
              <p className="text-sm text-slate-500 font-semibold mb-1">Active Links</p>
              <p className="text-3xl font-bold text-green-500"><CountUp value={data?.linkStats?.activeLinksCount || 0} /></p>
            </div>
            <div className="bg-slate-100/50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200/50 dark:border-white/10">
              <p className="text-sm text-slate-500 font-semibold mb-1">Inactive/Broken</p>
              <p className="text-3xl font-bold text-red-500"><CountUp value={data?.linkStats?.inactiveLinksCount || 0} /></p>
            </div>
            <div className="bg-slate-100/50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200/50 dark:border-white/10">
              <p className="text-sm text-slate-500 font-semibold mb-1">Primary Downloads</p>
              <p className="text-2xl font-bold text-blue-500"><CountUp value={data?.linkStats?.primaryDownloads || 0} /></p>
            </div>
            <div className="bg-slate-100/50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200/50 dark:border-white/10">
              <p className="text-sm text-slate-500 font-semibold mb-1">Mirror Downloads</p>
              <p className="text-2xl font-bold text-purple-500"><CountUp value={data?.linkStats?.mirrorDownloads || 0} /></p>
            </div>
          </div>
        </motion.div>

        {/* Trending & Featured Stats */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white dark:bg-[#111111] border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm flex flex-col gap-6"
        >
          <div>
            <h3 className="text-lg font-bold dark:text-white mb-4">Top Featured Performance</h3>
            <div className="space-y-2">
              {data?.featuredApps?.map((app, idx) => (
                <div key={idx} className="flex justify-between items-center text-sm border-b border-slate-200/50 dark:border-white/10 pb-2">
                  <span className="font-semibold dark:text-slate-300 truncate w-1/2">{app.title}</span>
                  <span className="text-blue-500">{app.downloads} dl</span>
                  <span className="text-purple-500">{app.views} views</span>
                </div>
              ))}
              {(!data?.featuredApps || data.featuredApps.length === 0) && <p className="text-xs text-slate-500">No data</p>}
            </div>
          </div>
          <div>
            <h3 className="text-lg font-bold dark:text-white mb-4">Top Trending Performance</h3>
            <div className="space-y-2">
              {data?.trendingAppsStats?.map((app, idx) => (
                <div key={idx} className="flex justify-between items-center text-sm border-b border-slate-200/50 dark:border-white/10 pb-2">
                  <span className="font-semibold dark:text-slate-300 truncate w-1/2">{app.title}</span>
                  <span className="text-blue-500">{app.downloads} dl</span>
                  <span className="text-purple-500">{app.views} views</span>
                </div>
              ))}
              {(!data?.trendingAppsStats || data.trendingAppsStats.length === 0) && <p className="text-xs text-slate-500">No data</p>}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
