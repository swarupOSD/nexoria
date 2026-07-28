import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Ticket, CheckCircle, Clock, AlertTriangle, XCircle, 
  Filter, Search, ChevronDown, X, User, Mail, 
  MessageSquare, Shield, RefreshCw
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useGetAllTicketsQuery, useResolveTicketMutation, useDeleteTicketMutation } from '../../features/supportTicket/supportTicketApiSlice';
import { useSocket } from '../../context/SocketContext';
import { useEffect } from 'react';

const PRIORITY_COLORS = {
  urgent: 'bg-red-500/10 text-red-500 border-red-500/20',
  high: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
  medium: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  low: 'bg-green-500/10 text-green-500 border-green-500/20',
};

const STATUS_COLORS = {
  open: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  in_progress: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  resolved: 'bg-green-500/10 text-green-400 border-green-500/20',
  closed: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
};

const TYPE_LABELS = {
  forgot_password: '🔐 Forgot Password',
  account_locked: '🔒 Account Locked',
  gmail_change: '📧 Gmail Change',
  billing_issue: '💳 Billing Issue',
  other: '📋 Other',
};

const SupportTicketAdmin = () => {
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [adminNote, setAdminNote] = useState('');
  const [newStatus, setNewStatus] = useState('in_progress');
  const [search, setSearch] = useState('');

  const { data, isLoading, refetch } = useGetAllTicketsQuery({ status: statusFilter, type: typeFilter });
  const [resolveTicket, { isLoading: isResolving }] = useResolveTicketMutation();
  const [deleteTicket] = useDeleteTicketMutation();
  const socket = useSocket();

  useEffect(() => {
    if (!socket) return;
    const handleNewTicket = () => refetch();
    socket.on('newSupportTicket', handleNewTicket);
    return () => socket.off('newSupportTicket', handleNewTicket);
  }, [socket, refetch]);

  const tickets = data?.data || [];
  const stats = data?.stats || {};

  const filtered = tickets.filter(t =>
    !search ||
    t.subject?.toLowerCase().includes(search.toLowerCase()) ||
    t.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
    t.user?.email?.toLowerCase().includes(search.toLowerCase())
  );

  const handleResolve = async () => {
    if (!selectedTicket) return;
    try {
      await resolveTicket({ id: selectedTicket._id, status: newStatus, adminNote }).unwrap();
      toast.success('Ticket updated!');
      setSelectedTicket(null);
      setAdminNote('');
    } catch {
      toast.error('Failed to update ticket');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this ticket?')) return;
    try {
      await deleteTicket(id).unwrap();
      toast.success('Ticket deleted!');
    } catch {
      toast.error('Failed to delete');
    }
  };

  return (
    <div className="space-y-4 md:space-y-6 min-w-0 overflow-x-hidden w-full">
      <Helmet><title>Support Tickets - Admin Panel</title></Helmet>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold dark:text-white flex items-center gap-2">
            <Ticket className="w-6 h-6 text-indigo-500" /> Support Tickets
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">User help requests and account issues</p>
        </div>
        <button onClick={refetch} className="flex items-center gap-2 px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition active:scale-95">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Open', value: stats.open || 0, icon: Clock, color: 'text-blue-500', bg: 'bg-blue-500/10' },
          { label: 'In Progress', value: stats.in_progress || 0, icon: RefreshCw, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
          { label: 'Resolved', value: stats.resolved || 0, icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-500/10' },
          { label: 'Urgent', value: stats.urgent || 0, icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-500/10' },
        ].map((s) => (
          <div key={s.label} className="glass-card p-3 md:p-4 flex items-center gap-3">
            <div className={`p-2 rounded-lg ${s.bg}`}><s.icon className={`w-5 h-5 ${s.color}`} /></div>
            <div>
              <p className="text-xs text-slate-500 font-medium">{s.label}</p>
              <p className={`text-xl font-black ${s.color}`}>{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by user or subject..."
            className="w-full pl-9 pr-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-sm border border-transparent focus:border-indigo-500 outline-none dark:text-white"
          />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-sm dark:text-white border border-transparent focus:border-indigo-500 outline-none">
          <option value="">All Status</option>
          <option value="open">Open</option>
          <option value="in_progress">In Progress</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
        </select>
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-sm dark:text-white border border-transparent focus:border-indigo-500 outline-none">
          <option value="">All Types</option>
          <option value="forgot_password">Forgot Password</option>
          <option value="account_locked">Account Locked</option>
          <option value="gmail_change">Gmail Change</option>
          <option value="billing_issue">Billing Issue</option>
          <option value="other">Other</option>
        </select>
      </div>

      {/* Ticket List */}
      {isLoading ? (
        <div className="text-center py-12 text-slate-500">Loading tickets...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 glass-card">
          <Ticket className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">No tickets found</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((ticket) => (
            <motion.div
              key={ticket._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-3 md:p-4 flex flex-col md:flex-row md:items-center gap-3 cursor-pointer hover:border-indigo-500/30 border border-transparent transition-all"
              onClick={() => { setSelectedTicket(ticket); setAdminNote(ticket.adminNote || ''); setNewStatus(ticket.status); }}
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <img
                  src={ticket.user?.profileImage?.startsWith('http') ? ticket.user.profileImage : `${import.meta.env.VITE_API_URL || ''}/uploads/avatars/${ticket.user?.profileImage || 'default.jpg'}`}
                  className="w-10 h-10 rounded-full object-cover border border-white/10 shrink-0"
                  alt={ticket.user?.name}
                />
                <div className="min-w-0">
                  <p className="font-semibold dark:text-white text-sm truncate">{ticket.subject}</p>
                  <p className="text-xs text-slate-500 truncate">{ticket.user?.name} • {ticket.user?.email}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{TYPE_LABELS[ticket.type] || ticket.type}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${PRIORITY_COLORS[ticket.priority]}`}>{ticket.priority}</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${STATUS_COLORS[ticket.status]}`}>{ticket.status}</span>
                <span className="text-xs text-slate-400">{new Date(ticket.createdAt).toLocaleDateString()}</span>
                <button onClick={e => { e.stopPropagation(); handleDelete(ticket._id); }} className="p-1 text-red-400 hover:bg-red-500/10 rounded-lg transition">
                  <XCircle className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Resolve Modal */}
      <AnimatePresence>
        {selectedTicket && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedTicket(null)} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 md:p-6 w-full max-w-lg shadow-2xl border border-white/10 overflow-y-auto max-h-[90vh]">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold dark:text-white">Ticket Details</h2>
                  <button onClick={() => setSelectedTicket(null)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"><X className="w-5 h-5" /></button>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-3">
                    <img src={selectedTicket.user?.profileImage?.startsWith('http') ? selectedTicket.user.profileImage : `${import.meta.env.VITE_API_URL || ''}/uploads/avatars/${selectedTicket.user?.profileImage || 'default.jpg'}`} className="w-10 h-10 rounded-full" alt="" />
                    <div>
                      <p className="font-semibold dark:text-white">{selectedTicket.user?.name}</p>
                      <p className="text-xs text-slate-500">{selectedTicket.user?.email}</p>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                    <p className="text-xs text-slate-500 mb-1 font-semibold uppercase tracking-wider">Subject</p>
                    <p className="font-semibold dark:text-white">{selectedTicket.subject}</p>
                  </div>

                  <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                    <p className="text-xs text-slate-500 mb-1 font-semibold uppercase tracking-wider">Description</p>
                    <p className="text-sm dark:text-slate-300 whitespace-pre-wrap">{selectedTicket.description}</p>
                  </div>

                  {selectedTicket.userEmail && (
                    <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-200 dark:border-indigo-800">
                      <p className="text-xs text-indigo-600 dark:text-indigo-400 mb-1 font-semibold uppercase tracking-wider">Registered Email (User Provided)</p>
                      <p className="font-bold text-indigo-700 dark:text-indigo-300">{selectedTicket.userEmail}</p>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <span className={`px-2 py-1 rounded-lg text-xs font-bold border ${PRIORITY_COLORS[selectedTicket.priority]}`}>{selectedTicket.priority}</span>
                    <span className="px-2 py-1 rounded-lg text-xs font-bold bg-slate-100 dark:bg-slate-800 dark:text-slate-300">{TYPE_LABELS[selectedTicket.type]}</span>
                  </div>
                </div>

                <div className="border-t border-slate-200 dark:border-slate-700 pt-4 space-y-3">
                  <div>
                    <label className="text-sm font-semibold dark:text-white block mb-1">Update Status</label>
                    <select value={newStatus} onChange={e => setNewStatus(e.target.value)} className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-sm dark:text-white border border-transparent focus:border-indigo-500 outline-none">
                      <option value="open">Open</option>
                      <option value="in_progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-semibold dark:text-white block mb-1">Admin Note (sent to user)</label>
                    <textarea
                      value={adminNote}
                      onChange={e => setAdminNote(e.target.value)}
                      rows={3}
                      placeholder="Explain what was done or what the user should do next..."
                      className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-sm dark:text-white border border-transparent focus:border-indigo-500 outline-none resize-none"
                    />
                  </div>
                  <button
                    onClick={handleResolve}
                    disabled={isResolving}
                    className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold hover:opacity-90 transition active:scale-95 disabled:opacity-50"
                  >
                    {isResolving ? 'Saving...' : '✅ Save & Notify User'}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SupportTicketAdmin;
