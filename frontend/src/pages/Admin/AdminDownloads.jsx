import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Download, TrendingUp, Filter , LayoutTemplate } from 'lucide-react';

import { useGetAdminAnalyticsQuery } from '../../features/analytics/analyticsApiSlice';
import BackButton from '../../components/BackButton';

const AdminDownloads = () => {
  const { data: analyticsRes, isLoading } = useGetAdminAnalyticsQuery();

  if (isLoading) return <div className="text-center mt-20">Loading...</div>;

  const data = analyticsRes?.data;
  const topDownloaded = data?.topDownloaded || [];
  const totalDownloads = data?.stats?.totalDownloads || 0;

  return (
    <div className="space-y-6">
      <Helmet>
        <title>Download Analytics - Admin Panel</title>
      </Helmet>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="flex items-center gap-3">
          <BackButton fallbackRoute="/superadmin" showText={false} />
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-wide flex items-center gap-2">
              <LayoutTemplate className="w-6 h-6 text-primary" />
              Downloads Analytics
            </h1>
            <p className="text-slate-400 text-sm mt-1">Track content performance and file download rates.</p>
          </div>
        </div>
      </div>
        <button className="flex items-center gap-2 px-5 py-2.5 bg-[#111827] border border-slate-700/50 rounded-xl hover:border-blue-500/50 hover:bg-[#0B0F19] text-sm font-medium transition-all w-max text-slate-300 shadow-lg">
          <Filter className="w-4 h-4" /> Filter by Date
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-[#111827] border border-slate-800/80 rounded-2xl md:col-span-2 overflow-hidden shadow-lg shadow-black/20">
          <div className="p-6 border-b border-slate-800 bg-[#0B0F19]/30">
            <h3 className="text-lg font-bold text-white">Top Downloaded Content</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-[#0B0F19]/50 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <th className="p-5 pl-6">Post Name</th>
                  <th className="p-5">Size</th>
                  <th className="p-5">Total Downloads</th>
                  <th className="p-5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {topDownloaded.map((item) => (
                  <tr key={item._id} className="hover:bg-slate-800/30 transition-colors group">
                    <td className="p-5 pl-6 font-bold text-white text-sm">
                      {item.title}
                    </td>
                    <td className="p-5 text-sm text-slate-500 font-medium">-</td>
                    <td className="p-5 font-bold text-slate-300">{item.downloads}</td>
                    <td className="p-5">
                      <span className="flex items-center gap-1.5 w-max px-2.5 py-1 text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                        <TrendingUp className="w-3.5 h-3.5" /> High Demand
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-[#111827] border border-slate-800/80 rounded-2xl p-6 flex flex-col items-center justify-center text-center space-y-4 shadow-lg shadow-black/20">
          <div className="p-6 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl shadow-lg shadow-blue-500/30 rotate-3 hover:rotate-0 transition-transform">
            <Download className="w-12 h-12 text-white" />
          </div>
          <div className="mt-6">
            <h2 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">{totalDownloads}</h2>
            <p className="text-slate-500 font-bold mt-2 uppercase tracking-widest text-xs">Total Lifetime Downloads</p>
          </div>
          <div className="w-full border-t border-slate-800 pt-6 mt-6">
            <div className="flex justify-between text-sm mb-3 font-medium">
              <span className="text-slate-400">Bandwidth Used (This Month)</span>
              <span className="font-bold text-white">45.2 TB</span>
            </div>
            <div className="w-full bg-[#0B0F19] rounded-full h-2.5 overflow-hidden border border-slate-800">
              <div className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full rounded-full relative" style={{ width: '75%' }}>
                <div className="absolute inset-0 bg-white/20 w-full h-full animate-pulse"></div>
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-3 font-bold text-right tracking-wide">75% OF 60TB QUOTA</p>
          </div>
        </motion.div>
      </div>

    </div>
  );
};

export default AdminDownloads;
