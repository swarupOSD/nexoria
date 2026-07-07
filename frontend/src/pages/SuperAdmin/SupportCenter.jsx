import React, { useState, Component } from 'react';
import { Helmet } from 'react-helmet-async';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Filter, Activity, MessageSquare, CheckCircle, 
  Clock, X, Send, Paperclip, AlertTriangle, ShieldAlert, Mail
} from 'lucide-react';
import { 
  useGetContactMessagesQuery, 
  useGetContactAnalyticsQuery,
  useReplyContactMessageMutation,
  useUpdateContactStatusMutation,
  useUpdateContactPriorityMutation,
  useDeleteContactMessageMutation
} from '../../features/contact/contactApiSlice';
import { useSelector } from 'react-redux';
import { useSocket } from '../../context/SocketContext';

class TicketErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidUpdate(prevProps) {
    if (prevProps.ticketId !== this.props.ticketId) {
      this.setState({ hasError: false, error: null });
    }
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex-1 flex items-center justify-center bg-rose-50 dark:bg-rose-900/10 p-6 rounded-xl border border-rose-200 dark:border-rose-800">
          <div className="text-center">
            <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-rose-700 dark:text-rose-400">Error Loading Ticket Details</h3>
            <p className="text-sm text-rose-600 dark:text-rose-300 mt-2 max-w-md">{this.state.error?.message || 'An unexpected error occurred.'}</p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const SupportCenter = ({ isEmbedded = false }) => {
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [attachments, setAttachments] = useState([]);
  const socket = useSocket();

  const { data: messagesRes, isLoading, refetch } = useGetContactMessagesQuery({ search, status: statusFilter, priority: priorityFilter, category: categoryFilter });
  const { data: analyticsRes } = useGetContactAnalyticsQuery();
  
  const [replyMessage, { isLoading: isReplying }] = useReplyContactMessageMutation();
  const [updateStatus] = useUpdateContactStatusMutation();
  const [updatePriority] = useUpdateContactPriorityMutation();
  const [deleteMessage] = useDeleteContactMessageMutation();

  const messages = messagesRes?.data || [];
  const analytics = analyticsRes?.data || { total: 0, open: 0, resolved: 0 };
  const currentUser = useSelector(state => state.auth.user);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput);
  };

  React.useEffect(() => {
    if (!socket) return;
    
    const handleTicketReply = ({ ticketId, reply }) => {
      if (selectedTicket && selectedTicket._id.toString() === ticketId.toString()) {
        setSelectedTicket(prev => {
          // Prevent duplicate replies
          if (prev.replies.some(r => r._id === reply._id || (r.content === reply.content && r.sender === reply.sender && Date.now() - new Date(r.createdAt).getTime() < 5000))) return prev;
          return {
            ...prev,
            replies: [...prev.replies, reply]
          };
        });
      }
      refetch(); // Update inbox list
    };

    socket.on('ticket_reply', handleTicketReply);
    socket.on('newTicket', () => refetch());

    return () => {
      socket.off('ticket_reply', handleTicketReply);
      socket.off('newTicket');
    };
  }, [socket, selectedTicket, refetch]);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      return toast.error("File size must be less than 5MB");
    }

    const formData = new FormData();
    formData.append('image', file);

    const uploadToast = toast.loading('Uploading attachment...');
    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        setAttachments(prev => [...prev, data.image]);
        toast.success('Attached successfully', { id: uploadToast });
      } else {
        toast.error(data.message || 'Error uploading file', { id: uploadToast });
      }
    } catch (error) {
      toast.error('Server error during upload', { id: uploadToast });
    }
  };

  const handleReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim() && attachments.length === 0) return;

    try {
      await replyMessage({ id: selectedTicket._id, data: { content: replyText, attachments } }).unwrap();
      toast.success('Reply sent successfully');
      setReplyText('');
      setAttachments([]);
      refetch();
      // Socket will handle the update in real-time, but we also manually fetch to be safe
      const updatedMessagesRes = await refetch();
      const updatedTicket = updatedMessagesRes.data.data.find(t => t._id === selectedTicket._id);
      if(updatedTicket) setSelectedTicket(updatedTicket);
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to send reply');
    }
  };

  const handleStatusChange = async (e) => {
    const newStatus = e.target.value;
    try {
      await updateStatus({ id: selectedTicket._id, status: newStatus }).unwrap();
      toast.success('Status updated');
      setSelectedTicket({ ...selectedTicket, status: newStatus });
      refetch();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const handlePriorityChange = async (e) => {
    const newPriority = e.target.value;
    try {
      await updatePriority({ id: selectedTicket._id, priority: newPriority }).unwrap();
      toast.success('Priority updated');
      setSelectedTicket({ ...selectedTicket, priority: newPriority });
      refetch();
    } catch (err) {
      toast.error('Failed to update priority');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this ticket completely?')) {
      try {
        await deleteMessage(id).unwrap();
        toast.success('Ticket deleted');
        if (selectedTicket?._id === id) setSelectedTicket(null);
      } catch (err) {
        toast.error('Failed to delete ticket');
      }
    }
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'Urgent': return 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400';
      case 'High': return 'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400';
      case 'Medium': return 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400';
      case 'Low': return 'bg-slate-100 text-slate-700 dark:bg-slate-500/20 dark:text-slate-400';
      default: return 'bg-slate-100 text-slate-700 dark:bg-slate-500/20 dark:text-slate-400';
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Open': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30';
      case 'In Progress': return 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 border-amber-200 dark:border-amber-500/30';
      case 'Pending': return 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400 border-purple-200 dark:border-purple-500/30';
      case 'Resolved': return 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700';
      case 'Closed': return 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-500 border-slate-200 dark:border-slate-700 line-through';
      default: return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700';
    }
  };

  return (
    <div className={`space-y-6 relative h-full flex flex-col ${isEmbedded ? 'p-0' : ''}`}>
      {!isEmbedded && <Helmet><title>Support Center | Super Admin</title></Helmet>}

      {/* Analytics Dashboard */}
      {!isEmbedded && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 shrink-0">
        <div className="glass-card p-4 flex flex-col justify-center relative overflow-hidden">
          <div className="absolute right-[-20px] bottom-[-20px] opacity-5"><MessageSquare className="w-32 h-32" /></div>
          <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Total Tickets</p>
          <h2 className="text-3xl font-black text-slate-800 dark:text-white">{analytics.total}</h2>
        </div>
        <div className="glass-card p-4 flex flex-col justify-center relative overflow-hidden bg-gradient-to-br from-emerald-500/10 to-transparent">
          <div className="absolute right-[-20px] bottom-[-20px] opacity-10 text-emerald-500"><AlertTriangle className="w-32 h-32" /></div>
          <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-1">Open Action Required</p>
          <h2 className="text-3xl font-black text-emerald-600 dark:text-emerald-400">{analytics.open}</h2>
        </div>
        <div className="glass-card p-4 flex flex-col justify-center relative overflow-hidden bg-gradient-to-br from-blue-500/10 to-transparent">
          <div className="absolute right-[-20px] bottom-[-20px] opacity-10 text-blue-500"><CheckCircle className="w-32 h-32" /></div>
          <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1">Resolved Tickets</p>
          <h2 className="text-3xl font-black text-blue-600 dark:text-blue-400">{analytics.resolved}</h2>
        </div>
        <div className="glass-card p-4 flex flex-col justify-center relative overflow-hidden">
          <div className="absolute right-[-20px] bottom-[-20px] opacity-5"><Clock className="w-32 h-32" /></div>
          <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Avg Response</p>
          <h2 className="text-3xl font-black text-slate-800 dark:text-white">&lt; 2h</h2>
        </div>
      </div>
      )}

      <div className={`flex-1 flex gap-6 overflow-hidden ${isEmbedded ? 'h-full' : 'h-[600px]'}`}>
        {/* Ticket List */}
        <div className={`glass-card flex flex-col overflow-hidden transition-all duration-300 ${selectedTicket ? 'hidden lg:flex lg:w-1/3' : 'w-full'}`}>
          <div className="p-4 border-b border-slate-200 dark:border-white/5 shrink-0 space-y-3">
            <h2 className="font-bold text-lg dark:text-white">Tickets Inbox</h2>
            <form onSubmit={handleSearch} className="relative">
              <input 
                type="text" 
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search subject or email..." 
                className="premium-input w-full pl-10 py-2 text-sm"
              />
              <Search className="absolute left-3 top-2.5 text-slate-400 w-4 h-4" />
            </form>
            <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="text-xs premium-input py-1 px-2 min-w-[100px]">
                <option value="">All Status</option>
                <option value="Open">Open</option>
                <option value="In Progress">In Progress</option>
                <option value="Pending">Pending</option>
                <option value="Resolved">Resolved</option>
              </select>
              <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} className="text-xs premium-input py-1 px-2 min-w-[100px]">
                <option value="">All Priority</option>
                <option value="Urgent">Urgent</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar">
            {isLoading ? (
              <div className="p-4 text-center text-slate-500 animate-pulse">Loading tickets...</div>
            ) : messages.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                <CheckCircle className="w-8 h-8 mx-auto mb-2 opacity-20" />
                No tickets found.
              </div>
            ) : (
              messages.map(msg => (
                <div 
                  key={msg._id} 
                  onClick={() => setSelectedTicket(msg)}
                  className={`p-4 rounded-xl cursor-pointer border transition-all ${selectedTicket?._id === msg._id ? 'bg-primary/5 border-primary/30 dark:border-primary/50' : 'bg-slate-50/50 dark:bg-white/[0.02] border-transparent hover:border-slate-200 dark:hover:border-white/10'}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${getPriorityColor(msg.priority)}`}>{msg.priority}</span>
                    <span className="text-xs font-medium text-slate-500">{new Date(msg.createdAt).toLocaleDateString()}</span>
                  </div>
                  <h3 className="font-semibold text-slate-900 dark:text-white text-sm line-clamp-1">{msg.subject}</h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-1">{msg.message}</p>
                  <div className="flex items-center gap-2 mt-3 text-xs">
                    <span className={`px-2 py-0.5 rounded-full border font-medium ${getStatusColor(msg.status)}`}>{msg.status}</span>
                    <span className="text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">{msg.category}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Ticket Details View */}
        <AnimatePresence mode="wait">
          {selectedTicket ? (
            <motion.div 
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
              className="glass-card flex-1 flex flex-col overflow-hidden"
            >
              <TicketErrorBoundary ticketId={selectedTicket._id}>
              {/* Header */}
              <div className="p-4 md:p-6 border-b border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02] flex items-start justify-between gap-4 shrink-0">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">{selectedTicket.subject}</h2>
                    <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${getPriorityColor(selectedTicket.priority)}`}>{selectedTicket.priority}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                    <div className="flex items-center gap-1.5"><Mail className="w-4 h-4"/> {selectedTicket.email || 'No Email'} ({selectedTicket.name || 'Anonymous'})</div>
                    <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md"><Activity className="w-4 h-4"/> {selectedTicket.category || 'General'}</div>
                    {selectedTicket.deviceInfo && <div className="text-xs">Device: {selectedTicket.deviceInfo}</div>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <select value={selectedTicket.status} onChange={handleStatusChange} className={`text-sm premium-input py-1.5 px-3 font-semibold border ${getStatusColor(selectedTicket.status)}`}>
                    <option value="Open">Status: Open</option>
                    <option value="In Progress">Status: In Progress</option>
                    <option value="Pending">Status: Pending</option>
                    <option value="Resolved">Status: Resolved</option>
                    <option value="Closed">Status: Closed</option>
                  </select>
                  <button onClick={() => setSelectedTicket(null)} className="p-2 bg-slate-200 dark:bg-slate-800 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Chat Thread */}
              <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 custom-scrollbar bg-slate-50/30 dark:bg-black/20">
                
                {/* Original Message */}
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center shrink-0 font-bold text-indigo-600 dark:text-indigo-400">
                    {(selectedTicket.name || 'A').charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-slate-900 dark:text-white">{selectedTicket.name || 'Anonymous'}</span>
                      <span className="text-xs text-slate-500">{new Date(selectedTicket.createdAt).toLocaleString()}</span>
                    </div>
                    <div className="bg-white dark:bg-slate-800/80 p-4 rounded-2xl rounded-tl-none border border-slate-200 dark:border-white/5 shadow-sm text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                      {selectedTicket.message || 'No message content.'}
                    </div>
                  </div>
                </div>

                {/* Replies */}
                {selectedTicket.replies?.map((reply, index) => {
                  const isAdmin = reply.sender === 'Admin';
                  const senderName = isAdmin ? 'Support Team' : (selectedTicket.name || 'Anonymous');
                  const initial = isAdmin ? null : (selectedTicket.name || 'A').charAt(0).toUpperCase();
                  return (
                    <div key={index} className={`flex gap-4 ${isAdmin ? 'flex-row-reverse' : ''}`}>
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 font-bold ${isAdmin ? 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400' : 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400'}`}>
                        {isAdmin ? <ShieldAlert className="w-5 h-5"/> : initial}
                      </div>
                      <div className={`flex-1 flex flex-col ${isAdmin ? 'items-end' : 'items-start'}`}>
                        <div className={`flex items-center gap-2 mb-1 ${isAdmin ? 'flex-row-reverse' : ''}`}>
                          <span className="font-bold text-slate-900 dark:text-white">{senderName}</span>
                          <span className="text-xs text-slate-500">{new Date(reply.createdAt).toLocaleString()}</span>
                        </div>
                        <div className={`p-4 rounded-2xl border shadow-sm text-sm whitespace-pre-wrap max-w-[85%] ${
                          isAdmin 
                            ? 'bg-primary/10 border-primary/20 text-slate-800 dark:text-white rounded-tr-none' 
                            : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-white/5 text-slate-700 dark:text-slate-300 rounded-tl-none'
                        }`}>
                          {reply.content}
                          {reply.attachments && reply.attachments.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-2">
                              {reply.attachments.map((img, idx) => (
                                <a key={idx} href={img} target="_blank" rel="noopener noreferrer">
                                  <img src={img} alt="attachment" className="w-20 h-20 object-cover rounded-md border border-slate-200 dark:border-slate-700" />
                                </a>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="p-4 border-t border-slate-200 dark:border-white/5 bg-white dark:bg-[#030303] shrink-0">
                {attachments.length > 0 && (
                  <div className="flex gap-2 mb-2">
                    {attachments.map((img, idx) => (
                      <div key={idx} className="relative group">
                        <img src={img} alt="attachment" className="w-12 h-12 object-cover rounded-md border border-slate-200 dark:border-slate-700" />
                        <button type="button" onClick={() => setAttachments(attachments.filter((_, i) => i !== idx))} className="absolute -top-2 -right-2 bg-rose-500 text-white rounded-full p-0.5 hidden group-hover:block"><X className="w-3 h-3" /></button>
                      </div>
                    ))}
                  </div>
                )}
                <form onSubmit={handleReply} className="flex gap-3 items-end">
                  <div className="flex-1 bg-slate-50 dark:bg-[#111] border border-slate-200 dark:border-white/5 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-primary/50 transition-all">
                    <textarea 
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleReply(e);
                        }
                      }}
                      placeholder="Type your reply to the user... (Press Enter to send)"
                      className="w-full bg-transparent border-none focus:ring-0 resize-none p-3 text-sm h-20"
                    />
                    <div className="px-3 py-2 bg-slate-100/50 dark:bg-black/20 flex justify-between items-center border-t border-slate-200 dark:border-white/5">
                      <label className="p-1.5 text-slate-400 hover:text-primary transition-colors cursor-pointer relative">
                        <Paperclip className="w-4 h-4"/>
                        <input type="file" onChange={handleFileUpload} className="hidden" accept="image/*,.pdf" />
                      </label>
                      <span className="text-xs text-slate-400 font-medium">Replying as Support Team</span>
                    </div>
                  </div>
                  <button type="submit" disabled={isReplying || (!replyText.trim() && attachments.length === 0)} className="premium-btn h-12 w-12 rounded-xl flex items-center justify-center shrink-0 disabled:opacity-50">
                    {isReplying ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span> : <Send className="w-5 h-5 ml-1" />}
                  </button>
                </form>
              </div>
              </TicketErrorBoundary>
            </motion.div>
          ) : (
            <div className="hidden lg:flex flex-1 items-center justify-center glass-card">
              <div className="text-center text-slate-500">
                <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-20" />
                <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300">No Ticket Selected</h3>
                <p className="mt-2 text-sm">Select a ticket from the inbox to view details and reply.</p>
              </div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default SupportCenter;
