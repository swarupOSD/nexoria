import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquare, Trash2, ShieldAlert, ShieldCheck, Search, Users, 
  BarChart3, RefreshCw, AlertTriangle, Calendar, Palette, Loader2 
} from 'lucide-react';
import { 
  useGetDMAnalyticsQuery, 
  useGetAdminConversationsQuery, 
  useDeleteAdminConversationMutation, 
  useRestrictUserDMsMutation 
} from '../../features/api/dmApiSlice';
import BackButton from '../../components/BackButton';
import toast from 'react-hot-toast';

const ChatManagement = () => {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [userSearch, setUserSearch] = useState('');
  
  const { data: analyticsRes, isLoading: loadingAnalytics, refetch: refetchAnalytics } = useGetDMAnalyticsQuery();
  const { data: convsRes, isLoading: loadingConvs, refetch: refetchConvs } = useGetAdminConversationsQuery({ page, limit });
  const [deleteConversation, { isLoading: isDeleting }] = useDeleteAdminConversationMutation();
  const [restrictDM, { isLoading: isRestricting }] = useRestrictUserDMsMutation();

  const analytics = analyticsRes?.data || {};
  const conversations = convsRes?.data || [];
  const totalConvs = convsRes?.total || 0;
  const totalPages = convsRes?.pages || 1;

  const handleDelete = async (id) => {
    if (!window.confirm('Are you absolutely sure you want to delete this conversation? This will permanently delete all messages in it.')) return;
    try {
      await deleteConversation(id).unwrap();
      toast.success('Conversation deleted successfully!');
      refetchConvs();
      refetchAnalytics();
    } catch (e) {
      toast.error('Failed to delete conversation.');
    }
  };

  const handleRestrict = async (userId, currentRestriction) => {
    const action = !currentRestriction;
    if (!window.confirm(action 
      ? 'Restrict this user from sending/receiving direct messages?' 
      : 'Remove direct message restriction for this user?'
    )) return;
    
    try {
      await restrictDM({ id: userId, disableDM: action }).unwrap();
      toast.success(action ? 'User DM access disabled.' : 'User DM access restored.');
      refetchConvs();
    } catch (e) {
      toast.error('Failed to update restrictions.');
    }
  };

  const handleRefresh = () => {
    refetchAnalytics();
    refetchConvs();
    toast.success('Data refreshed!');
  };

  const filteredConvs = userSearch.trim() === ''
    ? conversations
    : conversations.filter(c => 
        c.participants?.some(p => 
          p.name?.toLowerCase().includes(userSearch.toLowerCase()) ||
          p.username?.toLowerCase().includes(userSearch.toLowerCase()) ||
          p.email?.toLowerCase().includes(userSearch.toLowerCase())
        )
      );

  return (
    <div className="space-y-6">
      <Helmet>
        <title>Chat Management - Admin Panel</title>
      </Helmet>

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <BackButton fallbackRoute="/admin" showText={false} />
          <div>
            <h1 className="text-2xl font-bold dark:text-white flex items-center gap-2">
              <MessageSquare className="w-6 h-6 text-primary" />
              Chat & DM Management
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Monitor private conversations, analytics, and restrict direct messaging access.
            </p>
          </div>
        </div>
        <button 
          onClick={handleRefresh}
          className="flex items-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 py-2 rounded-xl font-semibold hover:opacity-90 transition-opacity active:scale-95 duration-100"
        >
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-[#111111] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4 relative overflow-hidden"
        >
          <div className="p-4 rounded-xl bg-gradient-to-br from-violet-600 to-purple-700 text-white shadow-glow">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div>
            <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">Total Conversations</p>
            <h3 className="text-3xl font-extrabold text-slate-800 dark:text-white mt-1">
              {loadingAnalytics ? '...' : analytics.totalConversations || 0}
            </h3>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-white dark:bg-[#111111] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4 relative overflow-hidden"
        >
          <div className="p-4 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-glow">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">Total Messages</p>
            <h3 className="text-3xl font-extrabold text-slate-800 dark:text-white mt-1">
              {loadingAnalytics ? '...' : analytics.totalMessages || 0}
            </h3>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-white dark:bg-[#111111] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4 relative overflow-hidden"
        >
          <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-glow">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">Active Last 24 Hours</p>
            <h3 className="text-3xl font-extrabold text-slate-800 dark:text-white mt-1">
              {loadingAnalytics ? '...' : analytics.activeLast24h || 0}
            </h3>
          </div>
        </motion.div>
      </div>

      {/* Theme stats chart */}
      {!loadingAnalytics && analytics.themeStats && (
        <motion.div 
          initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="bg-white dark:bg-[#111111] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm"
        >
          <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
            <Palette className="w-4 h-4 text-primary" /> Active Chat Theme Distribution
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
            {Object.entries(analytics.themeStats).map(([themeName, count]) => (
              <div key={themeName} className="flex flex-col items-center justify-center p-3 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/5">
                <span className="text-2xl mb-1">
                  {themeName === 'default' && '🌌'}
                  {themeName === 'cherry' && '🌸'}
                  {themeName === 'galaxy' && '🌌'}
                  {themeName === 'flame' && '🔥'}
                  {themeName === 'forest' && '🌿'}
                  {themeName === 'cyberpunk' && '⚡'}
                  {themeName === 'ice' && '❄️'}
                  {themeName === 'pride' && '🌈'}
                </span>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 capitalize">{themeName}</span>
                <span className="text-xs text-slate-400 mt-1 font-semibold">{count} active</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Conversations Section */}
      <div className="bg-white dark:bg-[#111111] rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        {/* Search header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={userSearch}
              onChange={e => setUserSearch(e.target.value)}
              placeholder="Search conversations by user..."
              className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-800 dark:text-white outline-none focus:border-primary transition-colors"
            />
          </div>
          <span className="text-xs text-slate-400 font-semibold uppercase">
            Showing {filteredConvs.length} of {totalConvs} chats
          </span>
        </div>

        {/* Conversations Table */}
        <div className="overflow-x-auto">
          {loadingConvs ? (
            <div className="p-12 text-center text-slate-400 flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin text-primary" /> Loading conversations...
            </div>
          ) : filteredConvs.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              No conversations found.
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-white/5 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  <th className="p-4">Participants</th>
                  <th className="p-4">Stats</th>
                  <th className="p-4">Theme</th>
                  <th className="p-4">Last Active</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredConvs.map(conv => (
                  <tr key={conv._id} className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors">
                    <td className="p-4">
                      <div className="flex flex-col gap-2">
                        {conv.participants?.map((p) => {
                          const isRestricted = p.restrictions?.disableDM;
                          return (
                            <div key={p._id} className="flex items-center gap-2">
                              <img 
                                src={p.profileImage?.startsWith('http') ? p.profileImage : 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + p.name} 
                                alt="" className="w-8 h-8 rounded-full object-cover" 
                              />
                              <div className="min-w-0">
                                <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                                  {p.name}
                                  {isRestricted && <span className="px-1.5 py-0.5 text-[9px] font-bold bg-red-500/10 text-red-500 border border-red-500/20 rounded-md">DM Restricted</span>}
                                </span>
                                <span className="text-xs text-slate-400 block">@{p.username}</span>
                              </div>
                              <button
                                onClick={() => handleRestrict(p._id, isRestricted)}
                                title={isRestricted ? "Allow Direct Messaging" : "Restrict Direct Messaging"}
                                className={"ml-auto p-1.5 rounded-lg transition-colors " + (isRestricted ? 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500' : 'bg-red-500/10 hover:bg-red-500/20 text-red-500')}
                              >
                                {isRestricted ? <ShieldCheck className="w-3.5 h-3.5" /> : <ShieldAlert className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </td>

                    <td className="p-4 align-middle">
                      <div className="text-sm text-slate-800 dark:text-slate-200">
                        <span className="font-bold">{conv.messageCount || 0}</span> messages
                      </div>
                      {conv.lastMessage && (
                        <div className="text-xs text-slate-400 truncate max-w-xs mt-1">
                          Last: {conv.lastMessage.isUnsent ? 'unsent' : conv.lastMessage.text || '🎞️ media'}
                        </div>
                      )}
                    </td>

                    <td className="p-4 align-middle capitalize text-sm text-slate-700 dark:text-slate-300">
                      <span className="flex items-center gap-1.5">
                        {conv.theme === 'default' && '🌌'}
                        {conv.theme === 'cherry' && '🌸'}
                        {conv.theme === 'galaxy' && '🌌'}
                        {conv.theme === 'flame' && '🔥'}
                        {conv.theme === 'forest' && '🌿'}
                        {conv.theme === 'cyberpunk' && '⚡'}
                        {conv.theme === 'ice' && '❄️'}
                        {conv.theme === 'pride' && '🌈'}
                        {conv.theme || 'default'}
                      </span>
                    </td>

                    <td className="p-4 align-middle text-sm text-slate-500">
                      {new Date(conv.updatedAt).toLocaleString()}
                    </td>

                    <td className="p-4 align-middle text-right">
                      <button
                        onClick={() => handleDelete(conv._id)}
                        className="p-2 hover:bg-red-500/10 rounded-xl text-slate-400 hover:text-red-500 transition-colors"
                        title="Delete Conversation"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-white/5">
            <button 
              disabled={page === 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
              className="px-3 py-1.5 bg-white dark:bg-slate-900 text-slate-800 dark:text-white rounded-lg border border-slate-200 dark:border-slate-800 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 text-sm font-semibold transition-colors"
            >
              Previous
            </button>
            <span className="text-xs text-slate-400 font-semibold uppercase">Page {page} of {totalPages}</span>
            <button 
              disabled={page === totalPages}
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              className="px-3 py-1.5 bg-white dark:bg-slate-900 text-slate-800 dark:text-white rounded-lg border border-slate-200 dark:border-slate-800 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 text-sm font-semibold transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatManagement;
