import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { 
  Music, TrendingUp, Users, Clock, Headphones, 
  Play, BarChart3, Calendar, RefreshCw
} from 'lucide-react';
import { useGetMusicAnalyticsQuery } from '../../features/analytics/analyticsApiSlice';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, BarChart, Bar 
} from 'recharts';
import CountUp from '../../components/CountUp';

const MusicListeningAnalytics = () => {
  const [days, setDays] = useState(7);
  const { data: res, isLoading, refetch } = useGetMusicAnalyticsQuery(days);
  const data = res?.data || {};

  const playsPerDay = data.playsPerDay || [];
  const topTracks = data.topTracks || [];
  const topListeners = data.topListeners || [];
  const recentHistory = data.recentHistory || [];

  const formatDuration = (secs) => {
    const mins = Math.floor(secs / 60);
    return mins > 60 ? `${Math.floor(mins / 60)}h ${mins % 60}m` : `${mins}m`;
  };

  return (
    <div className="space-y-4 md:space-y-6 min-w-0 overflow-x-hidden w-full">
      <Helmet><title>Music Analytics - Admin Panel</title></Helmet>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold dark:text-white flex items-center gap-2">
            <Music className="w-6 h-6 text-purple-500" /> Music Listening Analytics
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">Who is listening to what, when, and how long</p>
        </div>
        <div className="flex items-center gap-2">
          <select value={days} onChange={e => setDays(Number(e.target.value))} className="px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-sm dark:text-white border border-transparent focus:border-purple-500 outline-none">
            <option value={1}>Last 24h</option>
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
          </select>
          <button onClick={refetch} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition active:scale-95">
            <RefreshCw className="w-4 h-4 dark:text-white" />
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total Plays', value: data.totalPlays || 0, icon: Play, color: 'text-purple-500', bg: 'bg-purple-500/10' },
          { label: 'Top Tracks', value: topTracks.length, icon: TrendingUp, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
          { label: 'Active Listeners', value: topListeners.length, icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
          { label: 'Recent Activity', value: recentHistory.length, icon: Clock, color: 'text-green-500', bg: 'bg-green-500/10' },
        ].map((s) => (
          <div key={s.label} className="glass-card p-3 md:p-4 flex items-center gap-3">
            <div className={`p-2 rounded-lg ${s.bg} shrink-0`}><s.icon className={`w-5 h-5 ${s.color}`} /></div>
            <div>
              <p className="text-xs text-slate-500 font-medium">{s.label}</p>
              <p className={`text-xl font-black ${s.color}`}>{isLoading ? '...' : <CountUp value={s.value} />}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Plays Per Day Chart */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-4 md:p-6 min-w-0">
        <h3 className="text-base font-bold dark:text-white mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-purple-500" /> Plays Per Day
        </h3>
        <div className="h-52 md:h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={playsPerDay}>
              <defs>
                <linearGradient id="musicGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" vertical={false} />
              <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis stroke="#64748b" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }} />
              <Area type="monotone" dataKey="count" stroke="#8b5cf6" strokeWidth={2} fill="url(#musicGrad)" name="Plays" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Top Tracks */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-4 md:p-6 min-w-0">
          <h3 className="text-base font-bold dark:text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-500" /> Top Tracks
          </h3>
          {isLoading ? <p className="text-slate-500 text-sm">Loading...</p> : (
            <div className="space-y-2 max-h-72 overflow-y-auto custom-scrollbar pr-1">
              {topTracks.map((t, i) => (
                <div key={i} className="flex items-center gap-3 p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition">
                  <span className="text-xs font-black text-slate-400 w-5">#{i + 1}</span>
                  {t.track?.coverArt && (
                    <img src={t.track.coverArt} className="w-8 h-8 rounded-lg object-cover" alt="" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold dark:text-white truncate">{t.track?.title}</p>
                    <p className="text-xs text-slate-500 truncate">{t.track?.artist}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-purple-500">{t.playCount} plays</p>
                    <p className="text-xs text-slate-400">{formatDuration(t.totalDuration)}</p>
                  </div>
                </div>
              ))}
              {topTracks.length === 0 && <p className="text-slate-500 text-sm text-center py-6">No data for this period</p>}
            </div>
          )}
        </motion.div>

        {/* Top Listeners */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-4 md:p-6 min-w-0">
          <h3 className="text-base font-bold dark:text-white mb-4 flex items-center gap-2">
            <Headphones className="w-5 h-5 text-blue-500" /> Top Listeners
          </h3>
          {isLoading ? <p className="text-slate-500 text-sm">Loading...</p> : (
            <div className="space-y-2 max-h-72 overflow-y-auto custom-scrollbar pr-1">
              {topListeners.map((l, i) => (
                <div key={i} className="flex items-center gap-3 p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition">
                  <span className="text-xs font-black text-slate-400 w-5">#{i + 1}</span>
                  <img
                    src={l.user?.profileImage?.startsWith('http') ? l.user.profileImage : `${import.meta.env.VITE_API_URL || ''}/uploads/avatars/${l.user?.profileImage || 'default.jpg'}`}
                    className="w-8 h-8 rounded-full object-cover"
                    alt=""
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold dark:text-white truncate">{l.user?.name}</p>
                    <p className="text-xs text-slate-500 truncate">{l.user?.email}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-blue-500">{l.playCount} plays</p>
                    <p className="text-xs text-slate-400">{formatDuration(l.totalDuration)}</p>
                  </div>
                </div>
              ))}
              {topListeners.length === 0 && <p className="text-slate-500 text-sm text-center py-6">No data for this period</p>}
            </div>
          )}
        </motion.div>
      </div>

      {/* Recent Listening History */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-4 md:p-6 min-w-0">
        <h3 className="text-base font-bold dark:text-white mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-green-500" /> Recent Listening Activity (Last 24h)
        </h3>
        {isLoading ? <p className="text-slate-500 text-sm">Loading...</p> : (
          <div className="space-y-2 max-h-80 overflow-y-auto custom-scrollbar pr-1">
            {recentHistory.map((h, i) => (
              <div key={i} className="flex items-center gap-3 p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition">
                <img
                  src={h.user?.profileImage?.startsWith('http') ? h.user.profileImage : `${import.meta.env.VITE_API_URL || ''}/uploads/avatars/${h.user?.profileImage || 'default.jpg'}`}
                  className="w-8 h-8 rounded-full object-cover shrink-0"
                  alt=""
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold dark:text-white truncate">{h.user?.name}</p>
                  <p className="text-xs text-slate-500 truncate">
                    Listened to <span className="text-purple-400 font-medium">{h.track?.title}</span>
                    {h.track?.artist && ` by ${h.track.artist}`}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs text-slate-400">{new Date(h.playedAt).toLocaleTimeString()}</p>
                  {h.durationPlayed > 0 && <p className="text-xs text-green-500">{formatDuration(h.durationPlayed)}</p>}
                </div>
              </div>
            ))}
            {recentHistory.length === 0 && <p className="text-slate-500 text-sm text-center py-6">No recent activity</p>}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default MusicListeningAnalytics;
