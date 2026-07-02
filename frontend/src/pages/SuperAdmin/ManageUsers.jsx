import CustomSearchBar from '../../components/CustomSearchBar';
import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Trash2, Eye, Shield, X, Star, Crown, ShieldAlert, AlertTriangle, FileText, Lock , LayoutTemplate } from 'lucide-react';
import { 
  useGetUsersQuery, 
  useDeleteUserMutation, 
  useManagePremiumMutation,
  useUpdateUserMutation
} from '../../features/user/userApiSlice';
import {
  useBanUserMutation,
  useUnbanUserMutation,
  useSuspendUserMutation,
  useRestoreUserMutation,
  useWarnUserMutation,
  useAddAdminNoteMutation,
  useGetAdminNotesQuery,
  useUpdateRestrictionsMutation
} from '../../features/api/userModerationApiSlice';
import { toast } from 'react-hot-toast';
import BackButton from '../../components/BackButton';

const AdminNotesList = ({ userId }) => {
  const { data: notesRes, isLoading } = useGetAdminNotesQuery(userId);
  if (isLoading) return <p>Loading notes...</p>;
  const notes = notesRes?.data || [];
  return (
    <div className="space-y-3 mt-4 max-h-40 overflow-y-auto custom-scrollbar pr-2">
      {notes.length === 0 ? <p className="text-slate-500 text-sm">No notes found.</p> : notes.map(note => (
        <div key={note._id} className="bg-slate-100 dark:bg-slate-800 p-3 rounded-lg text-sm">
          <p className="text-slate-700 dark:text-slate-300">{note.note}</p>
          <div className="text-xs text-slate-500 mt-2 flex justify-between">
            <span>By: {note.admin?.name || 'Admin'}</span>
            <span>{new Date(note.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

const ManageUsers = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('All Roles');
  const [statusFilter, setStatusFilter] = useState('All Status');
  
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isPremiumModalOpen, setIsPremiumModalOpen] = useState(false);
  const [isModerationModalOpen, setIsModerationModalOpen] = useState(false);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  
  const [selectedUser, setSelectedUser] = useState(null);
  const [moderationAction, setModerationAction] = useState('suspend'); // suspend, ban, warn, restrict
  const [selectedUsersIds, setSelectedUsersIds] = useState([]);

  const { data: usersData, isLoading, refetch } = useGetUsersQuery();
  const [deleteUser] = useDeleteUserMutation();
  const [managePremium] = useManagePremiumMutation();
  
  const [banUser] = useBanUserMutation();
  const [unbanUser] = useUnbanUserMutation();
  const [suspendUser] = useSuspendUserMutation();
  const [restoreUser] = useRestoreUserMutation();
  const [warnUser] = useWarnUserMutation();
  const [addAdminNote] = useAddAdminNoteMutation();
  const [updateRestrictions] = useUpdateRestrictionsMutation();

  const users = usersData?.data || [];

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase()) || u.email.toLowerCase().includes(searchQuery.toLowerCase());
    const roleMatches = roleFilter === 'All Roles' ? true :
                        roleFilter === 'Premium User' ? u.isPremium :
                        roleFilter.toLowerCase() === u.role;
    const statusMatches = statusFilter === 'All Status' ? true :
                          statusFilter.toLowerCase() === u.status;
    return matchesSearch && roleMatches && statusMatches;
  });

  const toggleSelectUser = (id) => {
    setSelectedUsersIds(prev => prev.includes(id) ? prev.filter(userId => userId !== id) : [...prev, id]);
  };

  const selectAll = () => {
    if (selectedUsersIds.length === filteredUsers.length) {
      setSelectedUsersIds([]);
    } else {
      setSelectedUsersIds(filteredUsers.map(u => u._id));
    }
  };

  const handleBulkAction = async (action) => {
    if (selectedUsersIds.length === 0) {
      toast.error('Select users first');
      return;
    }
    if (!window.confirm(`Are you sure you want to ${action} ${selectedUsersIds.length} users?`)) return;

    for (const id of selectedUsersIds) {
      try {
        if (action === 'delete') await deleteUser(id);
        if (action === 'ban') await banUser({ id, reason: 'Bulk Ban', days: null });
        if (action === 'suspend') await suspendUser({ id, reason: 'Bulk Suspend', days: 7 });
        if (action === 'restore') await restoreUser(id);
      } catch(e) {}
    }
    setSelectedUsersIds([]);
    refetch();
  };

  const openModerationModal = (user, action) => {
    setSelectedUser(user);
    setModerationAction(action);
    setIsModerationModalOpen(true);
  };

  const handleModerationSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const reason = formData.get('reason');
    const days = formData.get('days');

    try {
      if (moderationAction === 'suspend') {
        await suspendUser({ id: selectedUser._id, reason, days: days ? Number(days) : 7 }).unwrap();
      } else if (moderationAction === 'ban') {
        await banUser({ id: selectedUser._id, reason, days: days ? Number(days) : null }).unwrap();
      } else if (moderationAction === 'warn') {
        await warnUser({ id: selectedUser._id, reason }).unwrap();
      } else if (moderationAction === 'restrict') {
        const restrictions = {
          avatarReset: formData.get('avatarReset') === 'on',
          disableUploads: formData.get('disableUploads') === 'on',
          disableCommenting: formData.get('disableCommenting') === 'on',
          disableRatings: formData.get('disableRatings') === 'on',
        };
        await updateRestrictions({ id: selectedUser._id, restrictions }).unwrap();
      }
      setIsModerationModalOpen(false);
      toast.success('Action applied successfully');
      refetch();
    } catch (error) {
      toast.error('Error applying action: ' + (error?.data?.message || 'Server error'));
    }
  };

  const handleNoteSubmit = async (e) => {
    e.preventDefault();
    const note = new FormData(e.target).get('note');
    if (!note) return;
    await addAdminNote({ id: selectedUser._id, note });
    e.target.reset();
  };

  const handleQuickAction = async (action, user) => {
    try {
      if (action === 'unban') {
        if(window.confirm('Unban this user?')) { await unbanUser(user._id); refetch(); }
      } else if (action === 'restore') {
        if(window.confirm('Restore this user from suspension?')) { await restoreUser(user._id); refetch(); }
      }
    } catch (error) {}
  };

  return (
    <div className="space-y-6">
      <Helmet>
        <title>Manage Users - Super Admin</title>
      </Helmet>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="flex items-center gap-3">
          <BackButton fallbackRoute="/superadmin" showText={false} />
          <div>
            <h1 className="text-2xl font-bold dark:text-white flex items-center gap-2">
              <LayoutTemplate className="w-6 h-6 text-primary" />
              User Management
            </h1>
            <p className="text-slate-500 text-sm mt-1">Advanced enforcement and moderation tools.</p>
          </div>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card overflow-hidden"
      >
        <div className="p-4 border-b border-slate-200 dark:border-night-border flex flex-col lg:flex-row gap-4 items-center justify-between">
          <div className="flex gap-4 w-full lg:w-auto">
            <div className="relative flex-1 lg:w-64">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <CustomSearchBar value={searchQuery} placeholder="Search users..." name="text"  onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
            <select 
              value={roleFilter} 
              onChange={(e) => setRoleFilter(e.target.value)}
              className="premium-input px-4 py-2 text-sm"
            >
              <option>All Roles</option>
              <option>User</option>
              <option>Premium User</option>
              <option>Admin</option>
              <option>Super Admin</option>
            </select>
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
              className="premium-input px-4 py-2 text-sm"
            >
              <option>All Status</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="banned">Banned</option>
              <option value="deleted">Deleted</option>
            </select>
          </div>

          {selectedUsersIds.length > 0 && (
            <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 px-4 py-2 rounded-lg border border-blue-200 dark:border-blue-900">
              <span className="text-sm font-semibold text-blue-600 dark:text-blue-400 mr-2">{selectedUsersIds.length} Selected</span>
              <button onClick={() => handleBulkAction('suspend')} className="text-xs bg-orange-500 hover:bg-orange-600 text-white px-3 py-1.5 rounded transition">Suspend</button>
              <button onClick={() => handleBulkAction('ban')} className="text-xs bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded transition">Ban</button>
              <button onClick={() => handleBulkAction('restore')} className="text-xs bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded transition">Restore</button>
              <button onClick={() => handleBulkAction('delete')} className="text-xs bg-slate-800 hover:bg-slate-900 text-white px-3 py-1.5 rounded transition"><Trash2 className="w-3.5 h-3.5"/></button>
            </div>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-night-bg text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">
                <th className="p-4 w-10"><input type="checkbox" onChange={selectAll} checked={selectedUsersIds.length === filteredUsers.length && filteredUsers.length > 0} className="rounded border-slate-300 text-primary focus:ring-primary" /></th>
                <th className="p-4 font-semibold">User Info</th>
                <th className="p-4 font-semibold">Role</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold">Warnings</th>
                <th className="p-4 font-semibold text-right">Moderation Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-night-border">
              {isLoading ? (
                <tr><td colSpan="6" className="p-4 text-center">Loading users...</td></tr>
              ) : filteredUsers.map((user) => (
                <tr key={user._id} className={`hover:bg-slate-50/50 dark:hover:bg-night-bg transition-colors ${selectedUsersIds.includes(user._id) ? 'bg-primary/10' : ''}`}>
                  <td className="p-4">
                    <input type="checkbox" checked={selectedUsersIds.includes(user._id)} onChange={() => toggleSelectUser(user._id)} className="rounded border-slate-300 text-primary focus:ring-primary" />
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <img src={user.profileImage || '/default.jpg'} alt="Avatar" className="w-10 h-10 rounded-full border border-slate-200 dark:border-slate-700 object-cover" />
                      <div>
                        <div className="font-semibold dark:text-white text-sm flex items-center gap-1">
                          {user.name}
                          {user.isPremium && <Crown className="w-3 h-3 text-yellow-500" title="Premium User" />}
                        </div>
                        <div className="text-xs text-slate-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`flex items-center gap-1 text-xs font-semibold capitalize ${
                      user.role === 'superadmin' ? 'text-red-500' :
                      user.role === 'admin' ? 'text-purple-500' :
                      user.isPremium ? 'text-yellow-500' : 'text-blue-500'
                    }`}>
                      {user.role === 'superadmin' && <Shield className="w-3 h-3" />}
                      {user.isPremium && user.role === 'user' ? 'Premium User' : user.role}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${
                      user.status === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 
                      user.status === 'suspended' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                      'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="flex items-center gap-1 text-sm font-semibold text-slate-600 dark:text-slate-400">
                      <AlertTriangle className={`w-4 h-4 ${user.warnings > 0 ? 'text-orange-500' : 'text-slate-400'}`} /> {user.warnings || 0}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => { setSelectedUser(user); setIsNoteModalOpen(true); }} title="Admin Notes" className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 rounded-lg transition">
                        <FileText className="w-4 h-4" />
                      </button>
                      <button onClick={() => openModerationModal(user, 'warn')} title="Warn User" className="p-1.5 hover:bg-yellow-100 text-yellow-600 rounded-lg transition">
                        <AlertTriangle className="w-4 h-4" />
                      </button>
                      <button onClick={() => openModerationModal(user, 'restrict')} title="Account Restrictions" className="p-1.5 hover:bg-blue-100 text-blue-600 rounded-lg transition">
                        <Lock className="w-4 h-4" />
                      </button>
                      
                      {user.status === 'active' ? (
                        <>
                          <button onClick={() => openModerationModal(user, 'suspend')} title="Suspend User" className="p-1.5 bg-orange-100 text-orange-600 hover:bg-orange-200 rounded-lg transition">
                            Suspend
                          </button>
                          <button onClick={() => openModerationModal(user, 'ban')} title="Ban User" className="p-1.5 bg-red-100 text-red-600 hover:bg-red-200 rounded-lg transition">
                            Ban
                          </button>
                        </>
                      ) : (
                        <button onClick={() => handleQuickAction(user.status === 'banned' ? 'unban' : 'restore', user)} className="p-1.5 bg-green-100 text-green-600 hover:bg-green-200 rounded-lg transition">
                          Restore
                        </button>
                      )}

                      <button onClick={() => setIsPremiumModalOpen(true) || setSelectedUser(user)} title="Manage Premium" className="p-1.5 hover:bg-yellow-100 text-yellow-500 rounded-lg transition">
                        <Star className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Moderation Modal */}
      <AnimatePresence>
        {isModerationModalOpen && selectedUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModerationModalOpen(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="glass-card relative w-full max-w-md p-6 shadow-2xl z-10 border border-slate-200 dark:border-night-border bg-white dark:bg-slate-900">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold dark:text-white capitalize flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-red-500" /> {moderationAction} User
                </h2>
                <button onClick={() => setIsModerationModalOpen(false)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              <div className="mb-4 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg flex items-center gap-3">
                <img src={selectedUser.profileImage || '/default.jpg'} className="w-10 h-10 rounded-full" alt="avatar" />
                <div>
                  <p className="text-sm font-bold dark:text-white">{selectedUser.name}</p>
                  <p className="text-xs text-slate-500">{selectedUser.email}</p>
                </div>
              </div>

              <form onSubmit={handleModerationSubmit} className="space-y-4">
                {moderationAction !== 'restrict' ? (
                  <>
                    <div>
                      <label className="block text-sm font-semibold mb-2 dark:text-slate-300">Reason</label>
                      <textarea name="reason" required placeholder={`Reason for ${moderationAction}...`} className="premium-input w-full h-24 resize-none"></textarea>
                    </div>
                    
                    {(moderationAction === 'suspend' || moderationAction === 'ban') && (
                      <div>
                        <label className="block text-sm font-semibold mb-2 dark:text-slate-300">Duration (Days)</label>
                        <select name="days" className="premium-input w-full">
                          <option value="1">1 Day</option>
                          <option value="3">3 Days</option>
                          <option value="7">7 Days</option>
                          <option value="30">30 Days</option>
                          {moderationAction === 'ban' && <option value="">Permanent</option>}
                        </select>
                        {moderationAction === 'suspend' && <p className="text-xs text-slate-500 mt-1">Suspension will automatically lift after this period.</p>}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm text-slate-500 mb-4">Toggle restrictions for this user.</p>
                    <label className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-night-bg rounded-lg cursor-pointer">
                      <input type="checkbox" name="disableCommenting" defaultChecked={selectedUser.restrictions?.disableCommenting} className="w-5 h-5 rounded border-slate-300 text-primary focus:ring-primary" />
                      <span className="text-sm font-semibold dark:text-slate-300">Disable Commenting</span>
                    </label>
                    <label className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-night-bg rounded-lg cursor-pointer">
                      <input type="checkbox" name="disableRatings" defaultChecked={selectedUser.restrictions?.disableRatings} className="w-5 h-5 rounded border-slate-300 text-primary focus:ring-primary" />
                      <span className="text-sm font-semibold dark:text-slate-300">Disable Ratings</span>
                    </label>
                    <label className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-night-bg rounded-lg cursor-pointer">
                      <input type="checkbox" name="disableUploads" defaultChecked={selectedUser.restrictions?.disableUploads} className="w-5 h-5 rounded border-slate-300 text-primary focus:ring-primary" />
                      <span className="text-sm font-semibold dark:text-slate-300">Disable Avatar Uploads</span>
                    </label>
                    <label className="flex items-center gap-3 p-3 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/50 rounded-lg cursor-pointer">
                      <input type="checkbox" name="avatarReset" className="w-5 h-5 rounded border-red-300 text-red-600 focus:ring-red-500" />
                      <span className="text-sm font-semibold text-red-600 dark:text-red-400">Force Reset Avatar to Default</span>
                    </label>
                  </div>
                )}

                <div className="mt-8 pt-4 border-t border-slate-200 dark:border-night-border flex gap-3">
                  <button type="button" onClick={() => setIsModerationModalOpen(false)} className="flex-1 py-2 bg-slate-100 dark:bg-night-bg hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl font-semibold transition">Cancel</button>
                  <button type="submit" className={`flex-1 py-2 text-white rounded-xl font-semibold transition ${moderationAction === 'ban' ? 'bg-red-600 hover:bg-red-700' : 'premium-btn shadow-glow'}`}>Apply Action</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Admin Notes Modal */}
      <AnimatePresence>
        {isNoteModalOpen && selectedUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsNoteModalOpen(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="glass-card relative w-full max-w-md p-6 shadow-2xl z-10 border border-slate-200 dark:border-night-border bg-white dark:bg-slate-900">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold dark:text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" /> Admin Notes
                </h2>
                <button onClick={() => setIsNoteModalOpen(false)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              <div className="mb-4">
                <p className="text-sm font-semibold dark:text-white">{selectedUser.name}</p>
                <p className="text-xs text-slate-500">Only visible to administrators.</p>
              </div>

              <AdminNotesList userId={selectedUser._id} />

              <form onSubmit={handleNoteSubmit} className="mt-4 pt-4 border-t border-slate-200 dark:border-night-border">
                <label className="block text-sm font-semibold mb-2 dark:text-slate-300">Add New Note</label>
                <textarea name="note" required placeholder="Type internal note here..." className="premium-input w-full h-20 resize-none mb-3"></textarea>
                <button type="submit" className="premium-btn w-full mt-2">Add Note</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Premium Management Modal */}
      <AnimatePresence>
        {isPremiumModalOpen && selectedUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsPremiumModalOpen(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="glass-card relative w-full max-w-md p-6 shadow-2xl z-10 border border-slate-200 dark:border-night-border bg-white dark:bg-slate-900">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold dark:text-white flex items-center gap-2"><Star className="w-5 h-5 text-accent" /> Manage Premium</h2>
                <button onClick={() => setIsPremiumModalOpen(false)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              <form onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                await managePremium({ 
                  id: selectedUser._id, 
                  action: formData.get('action'),
                  premiumType: formData.get('premiumType'),
                  customDays: Number(formData.get('customDays'))
                });
                setIsPremiumModalOpen(false);
                refetch();
              }} className="space-y-4">
                
                <div>
                  <label className="block text-sm font-semibold mb-2 dark:text-slate-300">Action</label>
                  <select name="action" defaultValue={selectedUser.isPremium ? "grant" : "grant"} className="premium-input w-full">
                    <option value="grant">Grant / Update Premium</option>
                    <option value="revoke">Revoke Premium</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 dark:text-slate-300">Premium Plan</label>
                  <select name="premiumType" defaultValue={selectedUser.premiumType || '30 Days'} className="premium-input w-full">
                    <option value="7 Days">7 Days</option>
                    <option value="30 Days">30 Days</option>
                    <option value="Lifetime">Lifetime</option>
                    <option value="Custom Duration">Custom Duration</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 dark:text-slate-300">Custom Days (if applicable)</label>
                  <input type="number" name="customDays" placeholder="e.g. 90" className="premium-input w-full" />
                </div>
                <div className="mt-8 pt-4 border-t border-slate-200 dark:border-night-border flex gap-3">
                  <button type="button" onClick={() => setIsPremiumModalOpen(false)} className="flex-1 py-2 bg-slate-100 dark:bg-night-bg hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl font-semibold transition">Cancel</button>
                  <button type="submit" className="flex-1 py-2 bg-accent hover:bg-purple-600 text-white rounded-xl font-semibold transition shadow-glow">Confirm</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ManageUsers;
