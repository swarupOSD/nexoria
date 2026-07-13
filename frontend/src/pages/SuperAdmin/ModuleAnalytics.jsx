import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { 
  AreaChart, Area, BarChart, Bar, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { useGetModuleAnalyticsQuery } from '../../features/analytics/analyticsApiSlice';
import BackButton from '../../components/BackButton';
import { Activity, Download, Eye, DollarSign, LayoutTemplate, Gamepad2, Film, Music, Wrench } from 'lucide-react';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-card p-3 border border-slate-200 dark:border-slate-700">
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

const MODULES = [
  { id: 'apps', label: 'Nexoria Studio', icon: LayoutTemplate, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  { id: 'movies', label: 'MovieBox', icon: Film, color: 'text-rose-500', bg: 'bg-rose-500/10' },
  { id: 'games', label: 'Nexoria Arcade', icon: Gamepad2, color: 'text-purple-500', bg: 'bg-purple-500/10' },
  { id: 'music', label: 'Nexoria Music', icon: Music, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  { id: 'tools', label: 'Pro Tools', icon: Wrench, color: 'text-amber-500', bg: 'bg-amber-500/10' }
];

const ModuleAnalytics = () => {
  const [activeTab, setActiveTab] = useState('apps');
  const { data: analyticsRes, isLoading, isFetching } = useGetModuleAnalyticsQuery(activeTab);

  const data = analyticsRes?.data;
  const activeModuleInfo = MODULES.find(m => m.id === activeTab);
  const Icon = activeModuleInfo.icon;

  return (
    <div className="space-y-6 pb-20">
      <Helmet>
        <title>{activeModuleInfo.label} Analytics - Super Admin</title>
      </Helmet>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="flex items-center gap-3">
          <BackButton fallbackRoute="/superadmin" showText={false} />
          <div>
            <h1 className="text-2xl font-bold dark:text-white flex items-center gap-2">
              <Icon className={`w-6 h-6 ${activeModuleInfo.color}`} />
              Module Analytics
            </h1>
            <p className="text-slate-500 text-sm mt-1">Deep dive into specific section performance.</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto custom-scrollbar gap-2 mb-6 bg-slate-50 dark:bg-[#1A1A1A] p-2 rounded-xl border border-slate-200 dark:border-white/5">
        {MODULES.map(module => {
          const ModIcon = module.icon;
          return (
            <button
              key={module.id}
              onClick={() => setActiveTab(module.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
                activeTab === module.id 
                  ? 'bg-white dark:bg-[#222] text-slate-900 dark:text-white shadow-sm border border-slate-200 dark:border-white/10' 
                  : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-white/5 border border-transparent'
              }`}
            >
              <ModIcon className={`w-4 h-4 ${activeTab === module.id ? module.color : 'opacity-70'}`} />
              {module.label}
            </button>
          )
        })}
      </div>

      {isLoading || isFetching ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : !data ? (
        <div className="text-center py-20 bg-slate-50 dark:bg-[#1A1A1A] rounded-xl border border-slate-200 dark:border-white/5">
          <Activity className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">No analytics data available for this module.</p>
        </div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="space-y-6">
          
          {/* Quick Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="glass-card p-6 border border-slate-200 dark:border-slate-800 flex items-center gap-4">
              <div className={`p-3 rounded-xl ${activeModuleInfo.bg} ${activeModuleInfo.color}`}>
                <Eye className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Total Views</p>
                <h3 className="text-2xl font-bold dark:text-white">{(data.totalViews || 0).toLocaleString()}</h3>
              </div>
            </div>
            <div className="glass-card p-6 border border-slate-200 dark:border-slate-800 flex items-center gap-4">
              <div className={`p-3 rounded-xl ${activeModuleInfo.bg} ${activeModuleInfo.color}`}>
                <Download className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Interactions / DLs</p>
                <h3 className="text-2xl font-bold dark:text-white">{(data.totalDownloads || 0).toLocaleString()}</h3>
              </div>
            </div>
            <div className="glass-card p-6 border border-slate-200 dark:border-slate-800 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-500">
                <DollarSign className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Estimated Revenue</p>
                <h3 className="text-2xl font-bold dark:text-white">${data.estimatedRevenue}</h3>
              </div>
            </div>
            <div className="glass-card p-6 border border-slate-200 dark:border-slate-800 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-purple-500/10 text-purple-500">
                <Activity className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Global Traffic Share</p>
                <h3 className="text-2xl font-bold dark:text-white">{data.trafficShare}%</h3>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Daily Traffic Chart */}
            <div className="glass-card p-6 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold dark:text-white">Daily Traffic (Last 7 Days)</h3>
              </div>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.dailyTraffic || []}>
                    <defs>
                      <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorDownloads" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                    <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 12 }} />
                    <YAxis stroke="#64748b" tick={{ fontSize: 12 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Area type="monotone" name="Visits" dataKey="visits" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorVisits)" />
                    <Area type="monotone" name="Interactions" dataKey="downloads" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorDownloads)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Top Items */}
            <div className="glass-card p-6 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold dark:text-white">Top Performing Items</h3>
              </div>
              <div className="h-80 w-full">
                {data.topItems && data.topItems.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.topItems} layout="vertical" margin={{ left: 40, right: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
                      <XAxis type="number" stroke="#64748b" tick={{ fontSize: 12 }} />
                      <YAxis dataKey="name" type="category" stroke="#64748b" tick={{ fontSize: 12 }} width={120} />
                      <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }} />
                      <Legend />
                      <Bar name="Views" dataKey="views" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                      <Bar name="Interactions" dataKey="downloads" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-slate-500">No data available</p>
                  </div>
                )}
              </div>
            </div>
          </div>

        </motion.div>
      )}
    </div>
  );
};

export default ModuleAnalytics;
