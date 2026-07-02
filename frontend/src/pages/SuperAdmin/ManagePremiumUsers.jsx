import CustomSearchBar from '../../components/CustomSearchBar';
import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useGetUsersQuery, useAssignPremiumMutation, useRevokePremiumMutation, useGetPremiumHistoryQuery } from '../../features/user/userApiSlice';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Crown, CheckCircle, XCircle, Shield, Clock, ShieldAlert, X , LayoutTemplate } from 'lucide-react';
import FallbackImage from '../../components/FallbackImage';
import BackButton from '../../components/BackButton';

const HistoryModal = ({ user, onClose }) => {
  const { data: historyRes, isLoading } = useGetPremiumHistoryQuery(user._id);
  const history = historyRes?.data || [];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-500" /> Premium History - {user.name}
          </h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white bg-slate-800 rounded-full"><X className="w-5 h-5"/></button>
        </div>
        <div className="p-5 overflow-y-auto custom-scrollbar flex-1">
          {isLoading ? (
            <div className="text-center text-slate-500 py-10">Loading history...</div>
          ) : history.length === 0 ? (
            <div className="text-center text-slate-500 py-10">No history found for this user.</div>
          ) : (
            <div className="space-y-4">
              {history.map((record) => (
                <div key={record._id} className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-bold text-white">{record.action}</span>
                    <span className="text-xs text-slate-400">{new Date(record.date).toLocaleString()}</span>
                  </div>
                  <p className="text-sm text-slate-300">{record.details}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

const ManagePremiumUsers = () => {
  const { data: usersRes, isLoading } = useGetUsersQuery();
  const [assignPremium, { isLoading: isAssigning }] = useAssignPremiumMutation();
  const [revokePremium, { isLoading: isRevoking }] = useRevokePremiumMutation();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [manageAction, setManageAction] = useState(null); // 'assign', 'revoke', 'history'
  const [duration, setDuration] = useState('1');
  const [reason, setReason] = useState('');

  const users = usersRes?.data || [];

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAssign = async (e) => {
    e.preventDefault();
    try {
      await assignPremium({ userId: selectedUser._id, durationMonths: duration, reason }).unwrap();
      toast.success('Premium granted successfully');
      setManageAction(null);
      setReason('');
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to grant premium');
    }
  };

  const handleRevoke = async (e) => {
    e.preventDefault();
    try {
      await revokePremium({ userId: selectedUser._id, reason }).unwrap();
      toast.success('Premium revoked successfully');
      setManageAction(null);
      setReason('');
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to revoke premium');
    }
  };

  return (
    <div className="space-y-6">
      <Helmet><title>Manage Premium - Super Admin</title></Helmet>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-wide flex items-center gap-3">
            <Crown className="w-8 h-8 text-amber-500" /> Premium Management
          </h1>
          <p className="text-slate-400 text-sm mt-1">Manually grant, extend, or revoke premium memberships.</p>
        </div>
      </div>

      <div className="bg-[#111827] border border-slate-800/80 rounded-2xl p-5 mb-6 shadow-lg">
        <div className="relative max-w-md">
          <CustomSearchBar value={searchTerm} placeholder="Search users by name, email or username..." name="text"  onChange={(e) => setSearchTerm(e.target.value)} />
          <Search className="w-5 h-5 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-[#111827] border border-slate-800/80 rounded-2xl overflow-hidden shadow-lg shadow-black/20">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-slate-800 bg-[#0B0F19]/50 text-xs font-bold text-slate-400 uppercase tracking-wider">
                <th className="p-5 pl-6">User</th>
                <th className="p-5">Status</th>
                <th className="p-5">Expiry</th>
                <th className="p-5">Plan Type</th>
                <th className="p-5 pr-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {isLoading && <tr><td colSpan="5" className="p-10 text-center text-slate-400">Loading...</td></tr>}
              {!isLoading && filteredUsers.map((user) => (
                <tr key={user._id} className="hover:bg-slate-800/30 transition-colors group">
                  <td className="p-5 pl-6">
                    <div className="flex items-center gap-3">
                      <FallbackImage src={user.profileImage} fallbackType="avatar" className="w-10 h-10 rounded-full border border-slate-700 object-cover" />
                      <div>
                        <div className="font-bold text-white text-sm flex items-center gap-1">
                          {user.name} {user.role === 'superadmin' && <Shield className="w-3 h-3 text-rose-500"/>}
                        </div>
                        <div className="text-xs text-slate-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-5">
                    {user.role === 'superadmin' ? (
                       <span className="px-2.5 py-1 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-lg text-xs font-bold flex items-center gap-1 w-max">
                         <Crown className="w-3 h-3"/> Lifetime Admin
                       </span>
                    ) : user.isPremium ? (
                      <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg text-xs font-bold flex items-center gap-1 w-max">
                        <CheckCircle className="w-3 h-3"/> Active
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 bg-slate-800 text-slate-400 border border-slate-700 rounded-lg text-xs font-bold flex items-center gap-1 w-max">
                         Basic
                      </span>
                    )}
                  </td>
                  <td className="p-5 text-sm text-slate-300">
                    {user.role === 'superadmin' || user.premiumType === 'Lifetime' ? 'Never' : user.isPremium && user.premiumEndDate ? new Date(user.premiumEndDate).toLocaleDateString() : '-'}
                  </td>
                  <td className="p-5 text-sm font-bold text-indigo-400">
                    {user.role === 'superadmin' ? 'Lifetime Admin' : user.premiumType || 'None'}
                  </td>
                  <td className="p-5 pr-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => { setSelectedUser(user); setManageAction('history'); }} className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-lg transition-colors">
                        History
                      </button>
                      <button onClick={() => { setSelectedUser(user); setManageAction('assign'); }} className="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 border border-amber-500/20 text-xs font-bold rounded-lg transition-colors">
                        {user.isPremium ? 'Extend' : 'Grant'}
                      </button>
                      {user.isPremium && user.role !== 'superadmin' && (
                        <button onClick={() => { setSelectedUser(user); setManageAction('revoke'); }} className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/20 text-xs font-bold rounded-lg transition-colors">
                          Revoke
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Action Modals */}
      <AnimatePresence>
        {manageAction === 'assign' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl">
              <h2 className="text-xl font-bold text-white mb-4">Grant Premium to {selectedUser?.name}</h2>
              <form onSubmit={handleAssign} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1.5">Duration</label>
                  <select value={duration} onChange={(e) => setDuration(e.target.value)} className="w-full bg-[#0B0F19] border border-slate-700/50 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-amber-500">
                    <option value="1">1 Month</option>
                    <option value="3">3 Months</option>
                    <option value="6">6 Months</option>
                    <option value="12">12 Months</option>
                    <option value="lifetime">Lifetime</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1.5">Reason / Notes</label>
                  <input type="text" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Compensation, Manual upgrade" required className="w-full bg-[#0B0F19] border border-slate-700/50 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-amber-500" />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setManageAction(null)} className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold transition-colors">Cancel</button>
                  <button type="submit" disabled={isAssigning} className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-900 rounded-xl font-bold transition-colors disabled:opacity-50">Confirm</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {manageAction === 'revoke' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl">
              <div className="flex items-center gap-3 text-rose-500 mb-4">
                <ShieldAlert className="w-8 h-8" />
                <h2 className="text-xl font-bold text-white">Revoke Premium</h2>
              </div>
              <p className="text-slate-400 text-sm mb-4">Are you sure you want to revoke premium access for <strong>{selectedUser?.name}</strong>?</p>
              <form onSubmit={handleRevoke} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1.5">Reason for Revocation</label>
                  <input type="text" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Terms violation, Refunded" required className="w-full bg-[#0B0F19] border border-slate-700/50 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-rose-500" />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setManageAction(null)} className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold transition-colors">Cancel</button>
                  <button type="submit" disabled={isRevoking} className="flex-1 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-bold transition-colors disabled:opacity-50">Revoke</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {manageAction === 'history' && <HistoryModal user={selectedUser} onClose={() => setManageAction(null)} />}
      </AnimatePresence>
    </div>
  );
};

export default ManagePremiumUsers;
