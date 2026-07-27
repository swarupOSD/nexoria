import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { 
  MessageSquare, Image, Mic, Smile, Video,
  Users, TrendingUp, BarChart3, RefreshCw, Camera
} from 'lucide-react';
import { useGetPrivateChatAnalyticsQuery } from '../../features/analytics/analyticsApiSlice';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import CountUp from '../../components/CountUp';

const PIE_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];

const PrivateChatAnalytics = () => {
  const [days, setDays] = useState(7);
  const { data: res, isLoading, refetch } = useGetPrivateChatAnalyticsQuery(days);
  const data = res?.data || {};

  const messagesPerDay = data.messagesPerDay || [];
  const topSenders = data.topSenders || [];
  const summary = data.summary || {};
  const msgTypeBreakdown = data.messageTypeBreakdown || [];

  const pieData = [
    { name: 'Text', value: summary.textCount || 0 },
    { name: 'Image', value: summary.imageCount || 0 },
    { name: 'GIF', value: summary.gifCount || 0 },
    { name: 'Voice', value: summary.voiceCount || 0 },
  ].filter(d => d.value > 0);

  return (
    <div className="space-y-4 md:space-y-6">
      <Helmet><title>Private Chat Analytics - Admin Panel</title></Helmet>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold dark:text-white flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-indigo-500" /> Private Chat Analytics
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">Message volumes, types, and most active users</p>
        </div>
        <div className="flex items-center gap-2">
          <select value={days} onChange={e => setDays(Number(e.target.value))} className="px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-sm dark:text-white border border-transparent focus:border-indigo-500 outline-none">
            <option value={1}>Last 24h</option>
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
          </select>
          <button onClick={refetch} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition active:scale-95">
            <RefreshCw className="w-4 h-4 dark:text-white" />
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total Conversations', value: data.totalConversations || 0, icon: Users, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
          { label: 'Total Messages', value: data.totalMessages || 0, icon: MessageSquare, color: 'text-blue-500', bg: 'bg-blue-500/10' },
          { label: 'Images Sent', value: summary.imageCount || 0, icon: Image, color: 'text-pink-500', bg: 'bg-pink-500/10' },
          { label: 'Voice Messages', value: summary.voiceCount || 0, icon: Mic, color: 'text-green-500', bg: 'bg-green-500/10' },
        ].map((s) => (
          <div key={s.label} className="glass-card p-3 md:p-4 flex items-center gap-3">
            <div className={`p-2 rounded-lg ${s.bg} shrink-0`}><s.icon className={`w-5 h-5 ${s.color}`} /></div>
            <div>
              <p className="text-xs text-slate-500 font-medium leading-tight">{s.label}</p>
              <p className={`text-xl font-black ${s.color}`}>{isLoading ? '...' : <CountUp value={s.value} />}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Message Breakdown mini cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Text', value: summary.textCount || 0, icon: MessageSquare, color: 'text-slate-400' },
          { label: 'Images', value: summary.imageCount || 0, icon: Camera, color: 'text-pink-400' },
          { label: 'GIFs', value: summary.gifCount || 0, icon: Smile, color: 'text-yellow-400' },
          { label: 'Voice', value: summary.voiceCount || 0, icon: Mic, color: 'text-green-400' },
        ].map(s => (
          <div key={s.label} className="glass-card p-3 flex items-center gap-2">
            <s.icon className={`w-4 h-4 ${s.color} shrink-0`} />
            <div>
              <p className="text-xs text-slate-500">{s.label}</p>
              <p className={`text-lg font-black ${s.color}`}>{isLoading ? '...' : (s.value || 0).toLocaleString()}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Messages Per Day */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-2 glass-card p-4 md:p-6">
          <h3 className="text-base font-bold dark:text-white mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-500" /> Messages Per Day
          </h3>
          <div className="h-52 md:h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={messagesPerDay}>
                <defs>
                  <linearGradient id="chatGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" vertical={false} />
                <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }} />
                <Area type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={2} fill="url(#chatGrad)" name="Messages" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Message Types Pie */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-4 md:p-6">
          <h3 className="text-base font-bold dark:text-white mb-4">Message Types</h3>
          {pieData.length > 0 ? (
            <div className="h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                    {pieData.map((entry, index) => (
                      <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-52 flex items-center justify-center text-slate-400 text-sm">No data</div>
          )}
        </motion.div>
      </div>

      {/* Top Senders */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-4 md:p-6">
        <h3 className="text-base font-bold dark:text-white mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-purple-500" /> Most Active Users (Messages Sent)
        </h3>
        {isLoading ? <p className="text-slate-500 text-sm">Loading...</p> : (
          <div className="space-y-2 max-h-80 overflow-y-auto custom-scrollbar pr-1">
            {topSenders.map((s, i) => (
              <div key={i} className="flex items-center gap-3 p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition">
                <span className="text-xs font-black text-slate-400 w-5">#{i + 1}</span>
                <img
                  src={s.user?.profileImage?.startsWith('http') ? s.user.profileImage : `${import.meta.env.VITE_API_URL || ''}/uploads/avatars/${s.user?.profileImage || 'default.jpg'}`}
                  className="w-8 h-8 rounded-full object-cover"
                  alt=""
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold dark:text-white truncate">{s.user?.name}</p>
                  <p className="text-xs text-slate-500 truncate">{s.user?.email}</p>
                </div>
                <p className="text-sm font-bold text-indigo-500">{s.messageCount} msgs</p>
              </div>
            ))}
            {topSenders.length === 0 && <p className="text-slate-500 text-sm text-center py-6">No data for this period</p>}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default PrivateChatAnalytics;
