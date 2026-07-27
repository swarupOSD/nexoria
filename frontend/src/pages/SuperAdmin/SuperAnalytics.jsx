import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Activity, LayoutTemplate, Users, Download, ArrowLeft, TrendingUp, Smartphone, Bell, ShieldCheck, Crown } from 'lucide-react';
import { 
  LineChart, Line, BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { useGetSuperAdminAnalyticsQuery } from '../../features/analytics/analyticsApiSlice';
import { useNavigate } from 'react-router-dom';

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

const SuperAnalytics = () => {
  const { data: analyticsRes, isLoading } = useGetSuperAdminAnalyticsQuery();
  const navigate = useNavigate();

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
      <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest animate-pulse">Compiling Data...</span>
    </div>
  );

  const data = analyticsRes?.data;
  const registrationData = data?.registrations || [];
  const downloadsGrowthData = data?.downloadTrends?.map(d => ({ name: d.month, downloads: d.downloads })) || [];
  const topDownloadedData = data?.topDownloaded || [];
  const userActivityData = data?.deviceUsage || [];
  
  const COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444'];

  return (
    <div className="space-y-4 max-w-7xl mx-auto pb-20">
      <Helmet>
        <title>Global Analytics - Admin</title>
      </Helmet>

      {/* Sleek Premium App Header */}
      <div className="sticky top-0 z-40 bg-[#0A0A0A]/60 backdrop-blur-3xl border-b border-white/5 shadow-2xl">
        <div className="px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4 relative z-10">
            <button onClick={() => navigate(-1)} className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-all backdrop-blur-md active:scale-95">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                <LayoutTemplate className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h1 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400 leading-tight">Global Analytics</h1>
                <p className="text-[10px] text-blue-400/60 font-bold uppercase tracking-widest">Platform Telemetry</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          
          {/* User Registrations */}
          <ChartCard title="Registrations (Week)" icon={Users} delay={0.1} color="bg-blue-500">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={registrationData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                <XAxis dataKey="name" stroke="#ffffff40" tick={{ fontSize: 10, fill: '#ffffff60' }} axisLine={false} tickLine={false} />
                <YAxis stroke="#ffffff40" tick={{ fontSize: 10, fill: '#ffffff60' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#ffffff20' }} />
                <Line type="monotone" dataKey="users" stroke="#3b82f6" strokeWidth={3} dot={{ r: 3, fill: '#0a0a0a', strokeWidth: 2 }} activeDot={{ r: 6, fill: '#3b82f6' }} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Downloads Growth */}
          <ChartCard title="Downloads (6 Mo)" icon={Download} delay={0.2} color="bg-emerald-500">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={downloadsGrowthData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorDownloads" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                <XAxis dataKey="name" stroke="#ffffff40" tick={{ fontSize: 10, fill: '#ffffff60' }} axisLine={false} tickLine={false} />
                <YAxis stroke="#ffffff40" tick={{ fontSize: 10, fill: '#ffffff60' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#ffffff20' }} />
                <Area type="monotone" dataKey="downloads" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorDownloads)" />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Top Downloaded Apps */}
          <ChartCard title="Top Apps" icon={TrendingUp} delay={0.3} color="bg-purple-500">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topDownloadedData} layout="vertical" margin={{ top: 0, right: 10, left: 20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" horizontal={false} />
                <XAxis type="number" stroke="#ffffff40" tick={{ fontSize: 10, fill: '#ffffff60' }} axisLine={false} tickLine={false} />
                <YAxis dataKey="name" type="category" stroke="#ffffff40" tick={{ fontSize: 10, fill: '#ffffff60' }} width={80} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }} />
                <Bar dataKey="downloads" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={16} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Premium Revenue Growth */}
          <ChartCard title="Revenue & Premium" icon={Crown} delay={0.4} color="bg-amber-500">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.premiumGrowth || []} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                <XAxis dataKey="month" stroke="#ffffff40" tick={{ fontSize: 10, fill: '#ffffff60' }} axisLine={false} tickLine={false} />
                <YAxis stroke="#ffffff40" tick={{ fontSize: 10, fill: '#ffffff60' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#ffffff20' }} />
                <Area type="monotone" name="Revenue" dataKey="revenue" stroke="#f59e0b" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                <Line type="monotone" name="Users" dataKey="users" stroke="#8b5cf6" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Daily Activities */}
          <ChartCard title="Activities (7D)" icon={Activity} delay={0.5} color="bg-rose-500">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.dailyActivities || []} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                <XAxis dataKey="date" stroke="#ffffff40" tick={{ fontSize: 10, fill: '#ffffff60' }} axisLine={false} tickLine={false} />
                <YAxis stroke="#ffffff40" tick={{ fontSize: 10, fill: '#ffffff60' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }} />
                <Bar dataKey="count" fill="#f43f5e" radius={[4, 4, 0, 0]} barSize={16} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Device Usage */}
          <ChartCard title="Devices" icon={Smartphone} delay={0.6} color="bg-cyan-500">
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
              <Smartphone className="w-16 h-16 text-cyan-500" />
            </div>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={userActivityData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={4} dataKey="value" stroke="none">
                  {userActivityData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* User Status Distribution */}
          <ChartCard title="User Status" icon={ShieldCheck} delay={0.7} color="bg-emerald-400">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data?.userStatusDistribution || []} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={4} dataKey="value" stroke="none">
                  {(data?.userStatusDistribution || []).map((entry, index) => <Cell key={`cell-${index}`} fill={['#10b981', '#f59e0b', '#ef4444', '#64748b'][index % 4]} />)}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
          
          {/* Notifications */}
          <ChartCard title="Notifications" icon={Bell} delay={0.8} color="bg-pink-500">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data?.notificationTypes || []} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={4} dataKey="value" stroke="none">
                  {(data?.notificationTypes || []).map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>

        </div>
      </div>
    </div>
  );
};

export default SuperAnalytics;
