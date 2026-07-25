import React from 'react';
import { motion } from 'framer-motion';
import { useGetPremiumMusicAnalyticsQuery } from '../../../features/api/nexoriaMusicApiSlice';
import { Crown, IndianRupee, TrendingUp, Users, DollarSign } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

const PIE_COLORS = ['#1ed760', '#282828'];

const NexoriaPremiumManager = () => {
  const { data, isLoading, isError, refetch } = useGetPremiumMusicAnalyticsQuery();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-[#b3b3b3]">
        <div className="w-10 h-10 border-4 border-[#1ed760] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="font-semibold tracking-wide">Fetching Premium Stats...</p>
      </div>
    );
  }

  if (isError || !data?.data) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-6 rounded-lg text-center">
        <h3 className="font-bold text-lg mb-2">Analytics Error</h3>
        <p>Failed to load premium revenue data. Please try again.</p>
        <button onClick={refetch} className="mt-4 px-6 py-2 bg-red-500/20 rounded-full font-bold hover:bg-red-500/30 transition-colors">Retry</button>
      </div>
    );
  }

  const { users, totalRevenue, recentTransactions, revenueOverTime } = data.data;
  
  const totalUsers = users.premium + users.free;
  const conversionRate = totalUsers > 0 ? ((users.premium / totalUsers) * 100).toFixed(1) : 0;

  const pieData = [
    { name: 'Premium Users', value: users.premium },
    { name: 'Free Users', value: users.free }
  ];

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-8 pb-10">
      
      {/* Header */}
      <motion.div variants={item} className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <span className="bg-gradient-to-br from-[#ffd700] to-[#f7971e] text-transparent bg-clip-text">Premium & Revenue</span>
            <Crown className="w-8 h-8 text-[#ffd700]" />
          </h2>
          <p className="text-[#b3b3b3] mt-2 font-medium">Track your subscription growth and financial health.</p>
        </div>
      </motion.div>

      {/* Summary Cards */}
      <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Total Revenue */}
        <div className="bg-gradient-to-br from-[#ffd700]/10 to-transparent p-6 rounded-2xl border border-[#ffd700]/20 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <DollarSign className="w-24 h-24 text-[#ffd700]" />
          </div>
          <div className="relative z-10">
            <p className="text-[#ffd700] font-bold text-sm uppercase tracking-wider mb-2 flex items-center gap-2">
              <IndianRupee className="w-4 h-4" /> Total Revenue
            </p>
            <h3 className="text-4xl font-black text-white">₹{totalRevenue.toLocaleString()}</h3>
          </div>
        </div>

        {/* Active Premium */}
        <div className="bg-[#181818] p-6 rounded-2xl border border-white/5 hover:bg-[#282828] transition-colors">
          <p className="text-slate-400 font-bold text-sm uppercase tracking-wider mb-2 flex items-center gap-2">
            <Crown className="w-4 h-4" /> Active Premium
          </p>
          <h3 className="text-4xl font-black text-[#1ed760]">{users.premium.toLocaleString()}</h3>
        </div>

        {/* Conversion Rate */}
        <div className="bg-[#181818] p-6 rounded-2xl border border-white/5 hover:bg-[#282828] transition-colors">
          <p className="text-slate-400 font-bold text-sm uppercase tracking-wider mb-2 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" /> Conversion Rate
          </p>
          <h3 className="text-4xl font-black text-white">{conversionRate}%</h3>
        </div>

        {/* Total Users */}
        <div className="bg-[#181818] p-6 rounded-2xl border border-white/5 hover:bg-[#282828] transition-colors">
          <p className="text-slate-400 font-bold text-sm uppercase tracking-wider mb-2 flex items-center gap-2">
            <Users className="w-4 h-4" /> Total User Base
          </p>
          <h3 className="text-4xl font-black text-white">{totalUsers.toLocaleString()}</h3>
        </div>

      </motion.div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Revenue Over Time */}
        <motion.div variants={item} className="lg:col-span-2 bg-[#181818] p-6 rounded-2xl border border-white/5">
          <h3 className="text-xl font-bold text-white mb-6">Revenue Growth (6 Months)</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueOverTime}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ffd700" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#ffd700" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#282828" vertical={false} />
                <XAxis dataKey="name" stroke="#b3b3b3" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#b3b3b3" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value}`} />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: '#282828', border: 'none', borderRadius: '8px', color: '#fff' }}
                  itemStyle={{ color: '#ffd700', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#ffd700" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* User Distribution */}
        <motion.div variants={item} className="bg-[#181818] p-6 rounded-2xl border border-white/5 flex flex-col">
          <h3 className="text-xl font-bold text-white mb-2">User Distribution</h3>
          <div className="flex-1 min-h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: '#282828', border: 'none', borderRadius: '8px', color: '#fff' }}
                  itemStyle={{ color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 mt-4">
            {pieData.map((entry, index) => (
              <div key={entry.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: PIE_COLORS[index] }} />
                <span className="text-sm text-[#b3b3b3]">{entry.name}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Recent Transactions */}
      <motion.div variants={item} className="bg-[#181818] rounded-2xl overflow-hidden border border-white/5">
        <div className="p-6 border-b border-white/5">
          <h3 className="text-xl font-bold text-white">Recent Premium Activations</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 text-sm font-bold text-[#b3b3b3] uppercase tracking-wider">
                <th className="p-4 pl-6">User</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Date</th>
                <th className="p-4 pr-6 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {recentTransactions.map((tx) => (
                <tr key={tx._id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
                  <td className="p-4 pl-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-zinc-800 overflow-hidden">
                        {tx.user?.avatar ? (
                          <img src={tx.user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs font-bold bg-[#ffd700] text-black">
                            {tx.user?.name?.charAt(0) || '?'}
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-white font-medium">{tx.user?.name || 'Unknown User'}</span>
                        <span className="text-xs text-[#b3b3b3]">{tx.user?.email}</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 font-bold text-[#ffd700]">₹{tx.amount}</td>
                  <td className="p-4 text-[#b3b3b3]">
                    {new Date(tx.updatedAt).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}
                  </td>
                  <td className="p-4 pr-6 text-right">
                    <span className="px-3 py-1 bg-green-500/10 text-green-400 border border-green-500/20 rounded-full text-xs font-bold inline-flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> Approved
                    </span>
                  </td>
                </tr>
              ))}
              {recentTransactions.length === 0 && (
                <tr>
                  <td colSpan="4" className="p-8 text-center text-[#b3b3b3]">
                    No recent premium activations found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

    </motion.div>
  );
};

// Extracted a missing icon
const CheckCircle = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
    <polyline points="22 4 12 14.01 9 11.01"></polyline>
  </svg>
);

export default NexoriaPremiumManager;
