import { useGetAdblockAnalyticsQuery } from '../../features/analytics/analyticsApiSlice';
import { motion } from 'framer-motion';
import { ShieldAlert, Activity, Globe, MonitorOff , LayoutTemplate } from 'lucide-react';
import BackButton from '../../components/BackButton';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell
} from 'recharts';

const COLORS = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6'];

const AdminAdblockAnalytics = () => {
  const { data, isLoading, isError } = useGetAdblockAnalyticsQuery();

  if (isLoading) return <div className="flex justify-center mt-20"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div></div>;
  if (isError) return <div className="text-center mt-20 text-red-500 font-bold">Failed to load AdBlock analytics.</div>;

  const { totalDetections, methodsBreakdown, dailyTrends, topIPs } = data.data;

  const getMethodName = (method) => {
    const map = {
      'bait_element': 'Bait Element',
      'google_ads_fetch': 'Google Ads Blocked',
      'unknown': 'Unknown'
    };
    return map[method] || method;
  };

  const pieData = methodsBreakdown.map(m => ({
    name: getMethodName(m.method),
    value: m.count
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold dark:text-white flex items-center gap-2">
          <ShieldAlert className="w-8 h-8 text-red-500" />
          AdBlock Analytics
        </h1>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 border-l-4 border-red-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Total Blocked Requests</p>
              <h3 className="text-3xl font-bold dark:text-white mt-1">{totalDetections}</h3>
            </div>
            <MonitorOff className="w-8 h-8 text-red-500/80" />
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6 border-l-4 border-orange-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Top Detection Method</p>
              <h3 className="text-xl font-bold dark:text-white mt-1">
                {methodsBreakdown.length > 0 ? getMethodName([...methodsBreakdown].sort((a,b)=>b.count-a.count)[0].method) : 'N/A'}
              </h3>
            </div>
            <Activity className="w-8 h-8 text-orange-500/80" />
          </div>
        </motion.div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Daily Trends Chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-6">
          <h2 className="text-lg font-bold dark:text-white mb-6">Detection Trends (Last 30 Days)</h2>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
                <XAxis dataKey="date" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <RechartsTooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }} />
                <Line type="monotone" dataKey="count" name="Detections" stroke="#ef4444" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Methods Breakdown */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card p-6">
          <h2 className="text-lg font-bold dark:text-white mb-6">Detection Methods</h2>
          <div className="h-80 w-full flex items-center justify-center">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={110}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-slate-500">No data available</p>
            )}
          </div>
          {/* Legend */}
          <div className="flex flex-wrap justify-center gap-4 mt-4">
            {pieData.map((entry, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                <span className="text-sm dark:text-slate-300">{entry.name} ({entry.value})</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Top IPs */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-card p-6">
        <h2 className="text-lg font-bold dark:text-white mb-6 flex items-center gap-2"><Globe className="w-5 h-5 text-blue-500" /> Top Offending IPs</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="p-4 text-slate-500 dark:text-slate-400 font-semibold text-sm">IP Address</th>
                <th className="p-4 text-slate-500 dark:text-slate-400 font-semibold text-sm">Detection Count</th>
              </tr>
            </thead>
            <tbody>
              {topIPs.map((ip, index) => (
                <tr key={index} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                  <td className="p-4 font-medium dark:text-slate-200">{ip.ip}</td>
                  <td className="p-4 dark:text-slate-300">
                    <span className="bg-red-100 text-red-600 dark:bg-red-900/30 px-3 py-1 rounded-full text-xs font-bold">
                      {ip.count} Blocks
                    </span>
                  </td>
                </tr>
              ))}
              {topIPs.length === 0 && (
                <tr>
                  <td colSpan="2" className="p-4 text-center text-slate-500">No data available</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminAdblockAnalytics;
