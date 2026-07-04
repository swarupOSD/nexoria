import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, Gift, Copy, Loader2, Calendar, Users, AlertCircle , LayoutTemplate } from 'lucide-react';
import toast from 'react-hot-toast';
import BackButton from '../../components/BackButton';

const CouponManager = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form State
  const [code, setCode] = useState('');
  const [rewardType, setRewardType] = useState('Points');
  const [rewardValue, setRewardValue] = useState(100);
  const [usageLimit, setUsageLimit] = useState(1);
  const [expiresAt, setExpiresAt] = useState('');

  const fetchCoupons = async () => {
    try {
      const res = await fetch('https://nexoria-backend-mt5e.onrender.com/api/coupons', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      if (data.success) {
        setCoupons(data.data);
      }
    } catch (error) {
      toast.error('Failed to load coupons');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('https://nexoria-backend-mt5e.onrender.com/api/coupons', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          code, rewardType, rewardValue, usageLimit, 
          expiresAt: expiresAt || null
        })
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Coupon created');
        setCoupons([data.data, ...coupons]);
        setIsModalOpen(false);
        setCode('');
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error('Error creating coupon');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this coupon?')) return;
    try {
      const res = await fetch(`/api/coupons/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        setCoupons(coupons.filter(c => c._id !== id));
        toast.success('Deleted');
      }
    } catch (err) {
      toast.error('Error deleting coupon');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Gift className="w-6 h-6 text-indigo-500" /> Coupon Manager
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
            Create promotional codes for Points or Premium memberships.
          </p>
        </div>
        <button 
          onClick={() => {
            setCode(Math.random().toString(36).substring(2, 10).toUpperCase());
            setIsModalOpen(true);
          }}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Create Coupon
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 animate-spin text-indigo-500" /></div>
      ) : (
        <div className="bg-white dark:bg-[#0A0A0A] border border-slate-200 dark:border-white/10 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50 dark:bg-white/5 border-b border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="p-4 font-medium">Code</th>
                  <th className="p-4 font-medium">Reward</th>
                  <th className="p-4 font-medium">Usage</th>
                  <th className="p-4 font-medium">Expires</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-white/10">
                {coupons.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="p-8 text-center text-slate-500 dark:text-slate-400">
                      No coupons created yet.
                    </td>
                  </tr>
                ) : coupons.map(coupon => (
                  <tr key={coupon._id} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.02]">
                    <td className="p-4">
                      <div className="flex items-center gap-2 font-mono font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-white/5 px-2 py-1 rounded">
                        {coupon.code}
                        <button onClick={() => { navigator.clipboard.writeText(coupon.code); toast.success('Copied'); }} className="text-slate-400 hover:text-indigo-500">
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                    <td className="p-4 text-slate-700 dark:text-slate-300">
                      <span className="font-semibold text-indigo-500">{coupon.rewardValue}</span> {coupon.rewardType}
                    </td>
                    <td className="p-4 text-slate-700 dark:text-slate-300">
                      <div className="flex items-center gap-1.5">
                        <Users className="w-3 h-3 text-slate-400" />
                        {coupon.usedCount} / {coupon.usageLimit}
                      </div>
                    </td>
                    <td className="p-4 text-slate-700 dark:text-slate-300">
                      {coupon.expiresAt ? new Date(coupon.expiresAt).toLocaleDateString() : 'Never'}
                    </td>
                    <td className="p-4">
                      {coupon.isActive && coupon.usedCount < coupon.usageLimit && (!coupon.expiresAt || new Date(coupon.expiresAt) > new Date()) ? (
                        <span className="px-2.5 py-1 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 rounded-full text-xs font-semibold">
                          Active
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-400 rounded-full text-xs font-semibold">
                          Inactive/Expired
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <button onClick={() => handleDelete(coupon._id)} className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-md transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">Create New Coupon</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">✕</button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Coupon Code</label>
                <input 
                  type="text" required value={code} onChange={e => setCode(e.target.value.toUpperCase())}
                  className="w-full bg-slate-50 dark:bg-[#0A0A0A] border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 font-mono uppercase"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Reward Type</label>
                  <select 
                    value={rewardType} onChange={e => setRewardType(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-[#0A0A0A] border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Points">Points</option>
                    <option value="PremiumDays">Premium Days</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Reward Value</label>
                  <input 
                    type="number" required min="1" value={rewardValue} onChange={e => setRewardValue(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-[#0A0A0A] border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Usage Limit</label>
                  <input 
                    type="number" required min="1" value={usageLimit} onChange={e => setUsageLimit(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-[#0A0A0A] border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Expires At (Optional)</label>
                  <input 
                    type="date" value={expiresAt} onChange={e => setExpiresAt(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-[#0A0A0A] border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
              <div className="pt-4 flex justify-end gap-3 border-t border-slate-200 dark:border-slate-800">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg">
                  Create
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default CouponManager;
