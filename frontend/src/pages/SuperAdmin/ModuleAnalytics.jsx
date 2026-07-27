import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AreaChart, Area, BarChart, Bar, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { useGetModuleAnalyticsQuery } from '../../features/analytics/analyticsApiSlice';
import { useNavigate } from 'react-router-dom';
import { Activity, Download, Eye, DollarSign, LayoutTemplate, Gamepad2, Film, Music, Wrench, ArrowLeft, TrendingUp } from 'lucide-react';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#111]/90 backdrop-blur-xl border border-white/10 p-3 rounded-2xl shadow-[0_0_20px_rgba(0,0,0,0.5)] z-50 relative">
        <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-2">{label}</p>
        <div className="space-y-1">
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color || entry.fill }}></span>
              <p className="text-sm font-black text-white">
                <span className="text-slate-300 font-medium text-xs mr-2">{entry.name}:</span> 
                {entry.value}
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

const ChartCard = ({ title, icon: Icon, delay, children, color }) => (
  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }} className="bg-[#0A0A0A]/80 backdrop-blur-3xl border border-white/5 rounded-3xl p-4 sm:p-5 shadow-2xl relative overflow-hidden group">
    <div className={`absolute -right-10 -top-10 w-32 h-32 opacity-10 blur-[50px] rounded-full transition-opacity group-hover:opacity-20 ${color}`}></div>
    <div className="flex items-center gap-2 mb-4 relative z-10">
      <Icon className={`w-4 h-4 opacity-70 ${color.replace('bg-', 'text-')}`} />
      <h3 className="text-xs font-black text-white uppercase tracking-widest opacity-80">{title}</h3>
    </div>
    <div className="h-52 w-full relative z-10">
      {children}
    </div>
  </motion.div>
);

const MODULES = [
  { id: 'apps', label: 'Nexoria Studio', icon: LayoutTemplate, color: 'text-blue-500', bg: 'bg-blue-500', from: 'from-blue-500', to: 'to-indigo-500' },
  { id: 'movies', label: 'MovieBox', icon: Film, color: 'text-rose-500', bg: 'bg-rose-500', from: 'from-rose-500', to: 'to-pink-500' },
  { id: 'games', label: 'Nexoria Arcade', icon: Gamepad2, color: 'text-purple-500', bg: 'bg-purple-500', from: 'from-purple-500', to: 'to-fuchsia-500' },
  { id: 'music', label: 'Nexoria Music', icon: Music, color: 'text-emerald-500', bg: 'bg-emerald-500', from: 'from-emerald-500', to: 'to-teal-500' },
  { id: 'tools', label: 'Pro Tools', icon: Wrench, color: 'text-amber-500', bg: 'bg-amber-500', from: 'from-amber-500', to: 'to-yellow-500' }
];

const ModuleAnalytics = () => {
  const [activeTab, setActiveTab] = useState('apps');
  const { data: analyticsRes, isLoading, isFetching } = useGetModuleAnalyticsQuery(activeTab);
  const navigate = useNavigate();

  const data = analyticsRes?.data;
  const activeModuleInfo = MODULES.find(m => m.id === activeTab);
  const MainIcon = activeModuleInfo.icon;

  const tabContentVariants = {
    hidden: { opacity: 0, y: 10 },
    enter: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
    exit: { opacity: 0, y: -10, transition: { duration: 0.2, ease: 'easeIn' } }
  };

  return (
    <div className="space-y-4 max-w-7xl mx-auto pb-20">
      <Helmet>
        <title>{activeModuleInfo.label} Analytics - Admin</title>
      </Helmet>

      {/* Sleek Premium App Header */}
      <div className="sticky top-0 z-40 bg-[#0A0A0A]/60 backdrop-blur-3xl border-b border-white/5 shadow-2xl">
        <div className="px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4 relative z-10">
            <button onClick={() => navigate(-1)} className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-all backdrop-blur-md active:scale-95">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10`}>
                <MainIcon className={`w-5 h-5 ${activeModuleInfo.color}`} />
              </div>
              <div>
                <h1 className={`text-xl font-black text-transparent bg-clip-text bg-gradient-to-r ${activeModuleInfo.from} ${activeModuleInfo.to} leading-tight`}>
                  {activeModuleInfo.label}
                </h1>
                <p className="text-[10px] text-white/50 font-bold uppercase tracking-widest">Module Analytics</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Horizontal Scrollable Tabs */}
        <div className="px-4 pb-3">
          <div className="flex overflow-x-auto gap-2 pb-1 scrollbar-hide">
            {MODULES.map(module => {
              const ModIcon = module.icon;
              return (
                <button
                  key={module.id}
                  onClick={() => setActiveTab(module.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm whitespace-nowrap transition-all active:scale-95 ${
                    activeTab === module.id
                      ? `${module.bg} text-white shadow-[0_0_15px_rgba(255,255,255,0.1)]`
                      : 'bg-white/5 hover:bg-white/10 text-white/60 hover:text-white border border-white/5'
                  }`}
                >
                  <ModIcon className={`w-4 h-4 ${activeTab === module.id ? '' : 'opacity-70'}`} />
                  {module.label}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      <div className="px-4 relative z-10">
        {isLoading || isFetching ? (
          <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
            <div className={`w-8 h-8 border-2 ${activeModuleInfo.color.replace('text-', 'border-')} border-t-transparent rounded-full animate-spin`}></div>
            <span className={`text-[10px] font-bold ${activeModuleInfo.color} uppercase tracking-widest animate-pulse`}>Syncing Module...</span>
          </div>
        ) : !data ? (
          <div className="text-center py-20 bg-white/5 rounded-3xl border border-white/5 border-dashed">
            <Activity className="w-12 h-12 text-white/20 mx-auto mb-3" />
            <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest">No telemetry data found.</p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              variants={tabContentVariants}
              initial="hidden"
              animate="enter"
              exit="exit"
              className="space-y-4"
            >
              {/* Ultra Compact Quick Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 flex flex-col justify-between overflow-hidden relative group">
                  <div className={`absolute -right-4 -bottom-4 w-16 h-16 ${activeModuleInfo.bg}/20 rounded-full blur-xl group-hover:${activeModuleInfo.bg}/30 transition-colors`}></div>
                  <div className="flex items-center gap-2 mb-2">
                    <Eye className={`w-4 h-4 ${activeModuleInfo.color}`} />
                    <span className="text-[11px] uppercase tracking-widest text-slate-400 font-bold">Views</span>
                  </div>
                  <h3 className="text-2xl font-black text-white leading-none">{(data.totalViews || 0).toLocaleString()}</h3>
                </motion.div>

                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 flex flex-col justify-between overflow-hidden relative group">
                  <div className={`absolute -right-4 -bottom-4 w-16 h-16 ${activeModuleInfo.bg}/20 rounded-full blur-xl group-hover:${activeModuleInfo.bg}/30 transition-colors`}></div>
                  <div className="flex items-center gap-2 mb-2">
                    <Download className={`w-4 h-4 ${activeModuleInfo.color}`} />
                    <span className="text-[11px] uppercase tracking-widest text-slate-400 font-bold">Interactions</span>
                  </div>
                  <h3 className="text-2xl font-black text-white leading-none">{(data.totalDownloads || 0).toLocaleString()}</h3>
                </motion.div>

                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} className="bg-emerald-500/10 backdrop-blur-xl border border-emerald-500/20 rounded-2xl p-4 flex flex-col justify-between overflow-hidden relative group">
                  <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-emerald-500/20 rounded-full blur-xl group-hover:bg-emerald-500/30 transition-colors"></div>
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="w-4 h-4 text-emerald-500" />
                    <span className="text-[11px] uppercase tracking-widest text-emerald-500/70 font-bold">Revenue</span>
                  </div>
                  <h3 className="text-2xl font-black text-emerald-400 leading-none">${data.estimatedRevenue || 0}</h3>
                </motion.div>

                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }} className="bg-purple-500/10 backdrop-blur-xl border border-purple-500/20 rounded-2xl p-4 flex flex-col justify-between overflow-hidden relative group">
                  <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-purple-500/20 rounded-full blur-xl group-hover:bg-purple-500/30 transition-colors"></div>
                  <div className="flex items-center gap-2 mb-2">
                    <Activity className="w-4 h-4 text-purple-500" />
                    <span className="text-[11px] uppercase tracking-widest text-purple-500/70 font-bold">Share</span>
                  </div>
                  <h3 className="text-2xl font-black text-purple-400 leading-none">{data.trafficShare || 0}%</h3>
                </motion.div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Daily Traffic Chart */}
                <ChartCard title="Daily Traffic (7D)" icon={Activity} delay={0.4} color={activeModuleInfo.bg}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data.dailyTraffic || []} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorDownloads" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                      <XAxis dataKey="date" stroke="#ffffff40" tick={{ fontSize: 10, fill: '#ffffff60' }} axisLine={false} tickLine={false} />
                      <YAxis stroke="#ffffff40" tick={{ fontSize: 10, fill: '#ffffff60' }} axisLine={false} tickLine={false} />
                      <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#ffffff20' }} />
                      <Area type="monotone" name="Visits" dataKey="visits" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorVisits)" />
                      <Area type="monotone" name="Interactions" dataKey="downloads" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorDownloads)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </ChartCard>

                {/* Top Performing Items Chart */}
                <ChartCard title="Top Items" icon={TrendingUp} delay={0.5} color={activeModuleInfo.bg}>
                  {data.topItems && data.topItems.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={data.topItems} layout="vertical" margin={{ top: 0, right: 10, left: 10, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" horizontal={false} />
                        <XAxis type="number" stroke="#ffffff40" tick={{ fontSize: 10, fill: '#ffffff60' }} axisLine={false} tickLine={false} />
                        <YAxis dataKey="name" type="category" stroke="#ffffff40" tick={{ fontSize: 10, fill: '#ffffff60' }} width={90} axisLine={false} tickLine={false} />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }} />
                        <Bar name="Views" dataKey="views" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={8} />
                        <Bar name="Interactions" dataKey="downloads" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={8} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full opacity-50">
                      <TrendingUp className="w-8 h-8 text-white/30 mb-2" />
                      <p className="text-[10px] text-white/50 font-bold uppercase tracking-widest">No Item Data</p>
                    </div>
                  )}
                </ChartCard>
              </div>

            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};

export default ModuleAnalytics;
