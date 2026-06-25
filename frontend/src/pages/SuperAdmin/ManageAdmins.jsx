import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Plus, Edit2, UserMinus, ShieldOff, X, Search, Loader2 } from 'lucide-react';
import { useGetUsersQuery, useUpdateUserMutation } from '../../features/user/userApiSlice';

const ManageAdmins = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [promoteEmail, setPromoteEmail] = useState('');
  const [promoteRole, setPromoteRole] = useState('admin');

  const { data: usersRes, isLoading, refetch } = useGetUsersQuery();
  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();

  const allUsers = usersRes?.data || [];
  
  // Display only admins or superadmins in the table by default, unless searching
  const filteredAdmins = allUsers.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const isAdmin = u.role === 'admin' || u.role === 'superadmin';
    return searchTerm ? matchesSearch : isAdmin;
  });

  const handleRoleChange = async (userId, newRole) => {
    try {
      await updateUser({ id: userId, role: newRole }).unwrap();
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to update role');
    }
  };

  const handlePromote = async (e) => {
    e.preventDefault();
    const userToPromote = allUsers.find(u => u.email === promoteEmail);
    if (!userToPromote) {
      toast.error('User with this email not found. They must register first.');
      return;
    }
    await handleRoleChange(userToPromote._id, promoteRole);
    setIsModalOpen(false);
    setPromoteEmail('');
  };

  return (
    <div className="space-y-6">
      <Helmet>
        <title>Manage Admins - Super Admin</title>
      </Helmet>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-wide">Manage Administrators</h1>
          <p className="text-slate-400 text-sm mt-1">Add or remove admin privileges.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="px-5 py-2.5 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 shadow-lg shadow-red-500/20 text-white text-sm font-semibold rounded-xl flex items-center gap-2 transition-all w-max border border-red-500/50"
        >
          <Plus className="w-5 h-5" /> Create Admin
        </button>
      </div>



      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#111827] border border-slate-800/80 rounded-2xl overflow-hidden shadow-lg shadow-black/20"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800/80 bg-[#0B0F19]/50 text-xs font-bold text-slate-400 uppercase tracking-wider">
                <th className="p-5 pl-6">Admin Info</th>
                <th className="p-5">Role</th>
                <th className="p-5">Permissions</th>
                <th className="p-5">Status</th>
                <th className="p-5 pr-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {isLoading ? (
                <tr><td colSpan="5" className="p-10 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-500" /></td></tr>
              ) : filteredAdmins.length === 0 ? (
                <tr><td colSpan="5" className="p-10 text-center text-slate-500">No admins or matching users found.</td></tr>
              ) : filteredAdmins.map((admin) => (
                <tr key={admin._id} className="hover:bg-slate-800/30 transition-colors group">
                  <td className="p-5 pl-6">
                    <div className="font-bold text-white mb-0.5">{admin.name}</div>
                    <div className="text-xs text-slate-500">{admin.email}</div>
                  </td>
                  <td className="p-5">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-full ${
                      admin.role === 'superadmin' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 
                      admin.role === 'admin' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' :
                      admin.role === 'premium_user' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                      'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}>
                      <Shield className="w-3 h-3" />
                      <span className="capitalize">{admin.role.replace('_', ' ')}</span>
                    </span>
                  </td>
                  <td className="p-5 text-sm text-slate-400">
                    {admin.role === 'superadmin' ? 'All Access' : admin.role === 'admin' ? 'Posts, Comments, Categories' : 'Standard Access'}
                  </td>
                  <td className="p-5">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                      admin.accountStatus === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                      'bg-rose-500/10 text-rose-400 border-rose-500/20'
                    }`}>
                      {admin.accountStatus || 'Active'}
                    </span>
                  </td>
                  <td className="p-5 pr-6 text-right">
                    <select
                      value={admin.role}
                      onChange={(e) => handleRoleChange(admin._id, e.target.value)}
                      disabled={isUpdating}
                      className="bg-[#0B0F19] border border-slate-700 text-slate-300 text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                    >
                      <option value="user">User</option>
                      <option value="premium_user">Premium User</option>
                      <option value="admin">Admin</option>
                      <option value="superadmin">Super Admin</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Create Admin Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-card relative w-full max-w-md p-6 shadow-2xl z-10 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold dark:text-white">Promote to Admin</h2>
                <button onClick={() => setIsModalOpen(false)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              <form className="space-y-4" onSubmit={handlePromote}>
                <div>
                  <label className="block text-sm font-semibold mb-2 dark:text-slate-300">User Email</label>
                  <input 
                    type="email"
                    placeholder="Existing user email..."
                    value={promoteEmail}
                    onChange={(e) => setPromoteEmail(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 dark:text-slate-300">Admin Role</label>
                  <select 
                    value={promoteRole}
                    onChange={(e) => setPromoteRole(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <option value="admin">Standard Admin</option>
                    <option value="superadmin">Super Admin</option>
                  </select>
                </div>
                
                <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-200 dark:border-slate-800">
                  <button 
                    type="button" 
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition shadow-lg shadow-red-500/30"
                  >
                    Promote User
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ManageAdmins;
