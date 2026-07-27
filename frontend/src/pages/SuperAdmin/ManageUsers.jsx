import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Trash2, Shield, X, Star, Crown, ShieldAlert, AlertTriangle, FileText, Lock, LayoutTemplate, ArrowLeft, Filter, CheckCircle2 } from 'lucide-react';
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
import { useNavigate } from 'react-router-dom';

const AdminNotesList = ({ userId }) => {
  const { data: notesRes, isLoading } = useGetAdminNotesQuery(userId);
  if (isLoading) return <p className="text-[10px] text-blue-500 font-bold uppercase tracking-widest animate-pulse">Loading notes...</p>;
  const notes = notesRes?.data || [];
  return (
    <div className="space-y-2 mt-4 max-h-40 overflow-y-auto custom-scrollbar pr-2">
      {notes.length === 0 ? <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">No notes found.</p> : notes.map(note => (
        <div key={note._id} className="bg-white/5 border border-white/10 p-3 rounded-2xl text-sm">
          <p className="text-white text-xs">{note.note}</p>
          <div className="text-[10px] text-slate-500 mt-2 flex justify-between font-bold uppercase tracking-widest">
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
  const [activeFilter, setActiveFilter] = useState('All');
  
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [isPremiumModalOpen, setIsPremiumModalOpen] = useState(false);
  const [isModerationModalOpen, setIsModerationModalOpen] = useState(false);
  
  const [selectedUser, setSelectedUser] = useState(null);
  const [moderationAction, setModerationAction] = useState('suspend'); 
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
  const navigate = useNavigate();

  const users = usersData?.data || [];

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase()) || u.email.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    
    switch (activeFilter) {
      case 'Premium': return u.isPremium;
      case 'Admin': return u.role === 'admin';
      case 'SuperAdmin': return u.role === 'superadmin';
      case 'Banned': return u.status === 'banned';
      case 'Suspended': return u.status === 'suspended';
      default: return true;
    }
  });

  const toggleSelectUser = (id) => {
    setSelectedUsersIds(prev => prev.includes(id) ? prev.filter(userId => userId !== id) : [...prev, id]);
  };

  const handleBulkAction = async (action) => {
    if (selectedUsersIds.length === 0) return;
    if (!window.confirm(`Are you sure you want to ${action} ${selectedUsersIds.length} users?`)) return;

    const toastId = toast.loading(`Processing ${selectedUsersIds.length} users...`);
    for (const id of selectedUsersIds) {
      try {
        if (action === 'delete') await deleteUser(id).unwrap();
        if (action === 'ban') await banUser({ id, reason: 'Bulk Ban', days: null });
        if (action === 'suspend') await suspendUser({ id, reason: 'Bulk Suspend', days: 7 });
        if (action === 'restore') await restoreUser(id);
      } catch(e) {}
    }
    toast.success(`Bulk ${action} complete`, { id: toastId });
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

  const getRoleBadge = (user) => {
    if (user.role === 'owner') return <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-[0_0_10px_rgba(245,158,11,0.5)] flex items-center gap-1 uppercase tracking-widest"><Crown className="w-2.5 h-2.5" /> CREATOR</span>;
    if (user.role === 'superadmin') return <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-red-500/20 text-red-400 border border-red-500/20 flex items-center gap-1 uppercase tracking-widest"><Shield className="w-2.5 h-2.5" /> SUPERADMIN</span>;
    if (user.role === 'admin') return <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-purple-500/20 text-purple-400 border border-purple-500/20 flex items-center gap-1 uppercase tracking-widest"><Shield className="w-2.5 h-2.5" /> ADMIN</span>;
    if (user.isPremium) return <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-yellow-500/20 text-yellow-400 border border-yellow-500/20 flex items-center gap-1 uppercase tracking-widest"><Star className="w-2.5 h-2.5" /> PREMIUM</span>;
    return <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-blue-500/10 text-blue-400 border border-blue-500/10 flex items-center gap-1 uppercase tracking-widest">USER</span>;
  };

  const getStatusBadge = (status) => {
    if (status === 'active') return <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>;
    if (status === 'suspended') return <span className="w-2 h-2 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.8)] animate-pulse"></span>;
    return <span className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]"></span>;
  };

  const filters = ['All', 'Premium', 'Admin', 'SuperAdmin', 'Banned', 'Suspended'];

  return (
    <div className="min-h-screen pb-32">
      <Helmet>
        <title>Manage Users - Super Admin</title>
      </Helmet>

      {/* Sleek Premium App Header */}
      <div className="sticky top-0 z-30 bg-[#0A0A0A]/80 backdrop-blur-3xl border-b border-white/5 shadow-2xl pt-4">
        <div className="max-w-4xl mx-auto px-4 flex items-center justify-between mb-4">
          <div className="flex items-center gap-4 relative z-10">
            <button onClick={() => navigate(-1)} className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-all backdrop-blur-md active:scale-95">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                <LayoutTemplate className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h1 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400 leading-tight">God's Eye</h1>
                <p className="text-[10px] text-blue-400/60 font-bold uppercase tracking-widest">User Management</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="max-w-4xl mx-auto px-4 pb-4 space-y-3">
          <div className="relative w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input 
              type="text" 
              placeholder="Search by name or email..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-full py-3 pl-11 pr-4 text-sm text-white placeholder-white/30 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
            />
          </div>
          
          <div className="flex overflow-x-auto gap-2 pb-1 scrollbar-hide">
            {filters.map(filter => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest whitespace-nowrap transition-all active:scale-95 ${
                  activeFilter === filter
                    ? 'bg-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.4)]'
                    : 'bg-white/5 text-white/50 hover:text-white/80 border border-white/5 hover:bg-white/10'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 mt-6">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest animate-pulse">Scanning Database...</span>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-20 bg-white/5 rounded-3xl border border-white/5 border-dashed mt-4">
            <Search className="w-12 h-12 text-white/20 mx-auto mb-3" />
            <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest">No users found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <AnimatePresence>
              {filteredUsers.map((user) => (
                <motion.div 
                  key={user._id}
                  initial={{ opacity: 0, scale: 0.95 }} 
                  animate={{ opacity: 1, scale: 1 }} 
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={`bg-[#0A0A0A]/80 backdrop-blur-xl border ${selectedUsersIds.includes(user._id) ? 'border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.2)]' : 'border-white/5'} rounded-3xl p-4 transition-all relative overflow-hidden flex flex-col justify-between`}
                >
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img src={user.profileImage || '/default.jpg'} alt="Avatar" className="w-12 h-12 rounded-full object-cover border border-white/10" />
                        <div className="absolute bottom-0 right-0 border-2 border-[#0A0A0A] rounded-full">
                          {getStatusBadge(user.status)}
                        </div>
                      </div>
                      <div className="flex flex-col">
                        <h3 className="text-sm font-black text-white truncate max-w-[150px]">{user.name}</h3>
                        <p className="text-[10px] text-white/40 font-mono truncate max-w-[150px]">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className="flex items-center gap-2">
                        {user.warnings > 0 && (
                          <div className="flex items-center gap-1 text-[10px] text-orange-400 font-bold bg-orange-500/10 px-1.5 py-0.5 rounded">
                            <AlertTriangle className="w-3 h-3" /> {user.warnings}
                          </div>
                        )}
                        {getRoleBadge(user)}
                      </div>
                      <button 
                        onClick={() => toggleSelectUser(user._id)}
                        className={`w-6 h-6 rounded-full border flex items-center justify-center transition-colors ${selectedUsersIds.includes(user._id) ? 'bg-blue-500 border-blue-500 text-white' : 'border-white/20 text-transparent hover:border-white/50'}`}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {user.role !== 'owner' && (
                    <div className="flex overflow-x-auto gap-2 pb-1 scrollbar-hide">
                      <button onClick={() => { setSelectedUser(user); setIsNoteModalOpen(true); }} className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-full text-white/70 text-[10px] font-bold uppercase tracking-widest transition-colors whitespace-nowrap active:scale-95">
                        <FileText className="w-3.5 h-3.5" /> Notes
                      </button>
                      
                      <button onClick={() => openModerationModal(user, 'restrict')} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-full text-[10px] font-bold uppercase tracking-widest transition-colors whitespace-nowrap active:scale-95">
                        <Lock className="w-3.5 h-3.5" /> Restrict
                      </button>

                      {user.status === 'active' ? (
                        <>
                          <button onClick={() => openModerationModal(user, 'warn')} className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-500 rounded-full text-[10px] font-bold uppercase tracking-widest transition-colors whitespace-nowrap active:scale-95">
                            <AlertTriangle className="w-3.5 h-3.5" /> Warn
                          </button>
                          <button onClick={() => openModerationModal(user, 'suspend')} className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-500/10 hover:bg-orange-500/20 text-orange-500 rounded-full text-[10px] font-bold uppercase tracking-widest transition-colors whitespace-nowrap active:scale-95">
                            Suspend
                          </button>
                          <button onClick={() => openModerationModal(user, 'ban')} className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-full text-[10px] font-bold uppercase tracking-widest transition-colors whitespace-nowrap active:scale-95">
                            Ban
                          </button>
                        </>
                      ) : (
                        <button onClick={() => handleQuickAction(user.status === 'banned' ? 'unban' : 'restore', user)} className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-full text-[10px] font-bold uppercase tracking-widest transition-colors whitespace-nowrap active:scale-95">
                          Restore
                        </button>
                      )}

                      <button onClick={() => setIsPremiumModalOpen(true) || setSelectedUser(user)} className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-500/10 to-yellow-500/10 hover:from-amber-500/20 hover:to-yellow-500/20 text-amber-500 rounded-full text-[10px] font-bold uppercase tracking-widest transition-colors whitespace-nowrap active:scale-95">
                        <Star className="w-3.5 h-3.5" /> Premium
                      </button>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Floating Bulk Action Bar */}
      <AnimatePresence>
        {selectedUsersIds.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-[90%] max-w-md bg-[#111]/90 backdrop-blur-3xl border border-white/10 rounded-full p-2 shadow-[0_20px_40px_rgba(0,0,0,0.8)] flex items-center justify-between"
          >
            <div className="flex items-center gap-2 pl-3">
              <span className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-xs font-black text-white">
                {selectedUsersIds.length}
              </span>
              <span className="text-[10px] font-bold text-white/50 uppercase tracking-widest hidden sm:inline">Selected</span>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => handleBulkAction('suspend')} className="px-3 py-2 rounded-full text-[10px] font-black uppercase tracking-widest bg-orange-500/10 text-orange-500 hover:bg-orange-500/20 active:scale-95 transition-all">Suspend</button>
              <button onClick={() => handleBulkAction('ban')} className="px-3 py-2 rounded-full text-[10px] font-black uppercase tracking-widest bg-red-500/10 text-red-500 hover:bg-red-500/20 active:scale-95 transition-all">Ban</button>
              <button onClick={() => handleBulkAction('restore')} className="px-3 py-2 rounded-full text-[10px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 active:scale-95 transition-all">Restore</button>
              <button onClick={() => handleBulkAction('delete')} className="w-8 h-8 rounded-full flex items-center justify-center bg-red-600 hover:bg-red-700 text-white active:scale-95 transition-all ml-1"><Trash2 className="w-3.5 h-3.5"/></button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Moderation Modal */}
      <AnimatePresence>
        {isModerationModalOpen && selectedUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModerationModalOpen(false)} className="absolute inset-0 bg-[#0A0A0A]/80 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-[#111]/90 backdrop-blur-3xl relative w-full max-w-md p-6 shadow-2xl z-10 border border-white/10 rounded-3xl">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-red-500" /> {moderationAction} User
                </h2>
                <button onClick={() => setIsModerationModalOpen(false)} className="p-1 hover:bg-white/10 rounded-full transition-colors">
                  <X className="w-5 h-5 text-white/50" />
                </button>
              </div>

              <div className="mb-6 p-4 bg-white/5 border border-white/5 rounded-2xl flex items-center gap-3">
                <img src={selectedUser.profileImage || '/default.jpg'} className="w-10 h-10 rounded-full" alt="avatar" />
                <div>
                  <p className="text-sm font-black text-white">{selectedUser.name}</p>
                  <p className="text-[10px] font-mono text-white/40">{selectedUser.email}</p>
                </div>
              </div>

              <form onSubmit={handleModerationSubmit} className="space-y-4">
                {moderationAction !== 'restrict' ? (
                  <>
                    <div>
                      <label className="block text-[10px] font-bold mb-2 text-white/50 uppercase tracking-widest">Reason</label>
                      <textarea name="reason" required placeholder={`Reason for ${moderationAction}...`} className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-sm text-white placeholder-white/20 focus:outline-none focus:border-red-500/50 h-24 resize-none transition-all"></textarea>
                    </div>
                    
                    {(moderationAction === 'suspend' || moderationAction === 'ban') && (
                      <div>
                        <label className="block text-[10px] font-bold mb-2 text-white/50 uppercase tracking-widest">Duration (Days)</label>
                        <select name="days" className="w-full bg-black/50 border border-white/10 rounded-full py-3 px-4 text-sm text-white focus:outline-none focus:border-red-500/50 appearance-none transition-all">
                          <option value="1">1 Day</option>
                          <option value="3">3 Days</option>
                          <option value="7">7 Days</option>
                          <option value="30">30 Days</option>
                          {moderationAction === 'ban' && <option value="">Permanent</option>}
                        </select>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="space-y-3">
                    <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest mb-4">Toggle restrictions for this user</p>
                    <label className="flex items-center gap-3 p-4 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl cursor-pointer transition-colors">
                      <input type="checkbox" name="disableCommenting" defaultChecked={selectedUser.restrictions?.disableCommenting} className="w-5 h-5 rounded bg-black/50 border-white/20 text-blue-500 focus:ring-blue-500" />
                      <span className="text-sm font-bold text-white">Disable Commenting</span>
                    </label>
                    <label className="flex items-center gap-3 p-4 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl cursor-pointer transition-colors">
                      <input type="checkbox" name="disableRatings" defaultChecked={selectedUser.restrictions?.disableRatings} className="w-5 h-5 rounded bg-black/50 border-white/20 text-blue-500 focus:ring-blue-500" />
                      <span className="text-sm font-bold text-white">Disable Ratings</span>
                    </label>
                    <label className="flex items-center gap-3 p-4 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl cursor-pointer transition-colors">
                      <input type="checkbox" name="disableUploads" defaultChecked={selectedUser.restrictions?.disableUploads} className="w-5 h-5 rounded bg-black/50 border-white/20 text-blue-500 focus:ring-blue-500" />
                      <span className="text-sm font-bold text-white">Disable Avatar Uploads</span>
                    </label>
                    <label className="flex items-center gap-3 p-4 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-2xl cursor-pointer transition-colors">
                      <input type="checkbox" name="avatarReset" className="w-5 h-5 rounded bg-black/50 border-red-500/30 text-red-500 focus:ring-red-500" />
                      <span className="text-sm font-bold text-red-400">Force Reset Avatar</span>
                    </label>
                  </div>
                )}

                <div className="mt-8 flex gap-3">
                  <button type="button" onClick={() => setIsModerationModalOpen(false)} className="flex-1 py-3.5 bg-white/5 hover:bg-white/10 rounded-full font-bold text-white/70 text-sm transition-all active:scale-95">Cancel</button>
                  <button type="submit" className={`flex-1 py-3.5 text-white rounded-full font-bold text-sm transition-all active:scale-95 ${moderationAction === 'ban' ? 'bg-red-600 hover:bg-red-700 shadow-[0_0_20px_rgba(220,38,38,0.4)]' : 'bg-blue-600 hover:bg-blue-700 shadow-[0_0_20px_rgba(37,99,235,0.4)]'}`}>Confirm Action</button>
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
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsNoteModalOpen(false)} className="absolute inset-0 bg-[#0A0A0A]/80 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-[#111]/90 backdrop-blur-3xl relative w-full max-w-md p-6 shadow-2xl z-10 border border-white/10 rounded-3xl">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-500" /> Admin Notes
                </h2>
                <button onClick={() => setIsNoteModalOpen(false)} className="p-1 hover:bg-white/10 rounded-full transition-colors">
                  <X className="w-5 h-5 text-white/50" />
                </button>
              </div>

              <div className="mb-4">
                <p className="text-sm font-black text-white">{selectedUser.name}</p>
                <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Internal logs only</p>
              </div>

              <AdminNotesList userId={selectedUser._id} />

              <form onSubmit={handleNoteSubmit} className="mt-6">
                <label className="block text-[10px] font-bold mb-2 text-white/50 uppercase tracking-widest">Add New Note</label>
                <textarea name="note" required placeholder="Type internal note here..." className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-sm text-white placeholder-white/20 focus:outline-none focus:border-blue-500/50 h-24 resize-none transition-all mb-3"></textarea>
                <button type="submit" className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-bold text-sm transition-all active:scale-95 shadow-[0_0_20px_rgba(37,99,235,0.4)]">Save Note</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Premium Management Modal */}
      <AnimatePresence>
        {isPremiumModalOpen && selectedUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsPremiumModalOpen(false)} className="absolute inset-0 bg-[#0A0A0A]/80 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-[#111]/90 backdrop-blur-3xl relative w-full max-w-md p-6 shadow-2xl z-10 border border-white/10 rounded-3xl">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                  <Crown className="w-5 h-5 text-amber-500" /> Manage Premium
                </h2>
                <button onClick={() => setIsPremiumModalOpen(false)} className="p-1 hover:bg-white/10 rounded-full transition-colors">
                  <X className="w-5 h-5 text-white/50" />
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
                  <label className="block text-[10px] font-bold mb-2 text-white/50 uppercase tracking-widest">Action</label>
                  <select name="action" defaultValue={selectedUser.isPremium ? "grant" : "grant"} className="w-full bg-black/50 border border-white/10 rounded-full py-3 px-4 text-sm text-white focus:outline-none focus:border-amber-500/50 appearance-none transition-all">
                    <option value="grant">Grant / Update Premium</option>
                    <option value="revoke">Revoke Premium</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold mb-2 text-white/50 uppercase tracking-widest">Premium Plan</label>
                  <select name="premiumType" defaultValue={selectedUser.premiumType || '30 Days'} className="w-full bg-black/50 border border-white/10 rounded-full py-3 px-4 text-sm text-white focus:outline-none focus:border-amber-500/50 appearance-none transition-all">
                    <option value="7 Days">7 Days</option>
                    <option value="30 Days">30 Days</option>
                    <option value="Lifetime">Lifetime</option>
                    <option value="Custom Duration">Custom Duration</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold mb-2 text-white/50 uppercase tracking-widest">Custom Days (if applicable)</label>
                  <input type="number" name="customDays" placeholder="e.g. 90" className="w-full bg-white/5 border border-white/10 rounded-full py-3 px-4 text-sm text-white placeholder-white/20 focus:outline-none focus:border-amber-500/50 transition-all" />
                </div>
                
                <div className="mt-8 flex gap-3">
                  <button type="button" onClick={() => setIsPremiumModalOpen(false)} className="flex-1 py-3.5 bg-white/5 hover:bg-white/10 rounded-full font-bold text-white/70 text-sm transition-all active:scale-95">Cancel</button>
                  <button type="submit" className="flex-1 py-3.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-black rounded-full font-black text-sm transition-all active:scale-95 shadow-[0_0_20px_rgba(245,158,11,0.4)]">Confirm</button>
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
