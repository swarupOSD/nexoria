import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HelpCircle, Plus, CheckCircle, Clock, XCircle, 
  RefreshCw, Send, ChevronDown, X
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useCreateSupportTicketMutation, useGetMyTicketsQuery } from '../../features/supportTicket/supportTicketApiSlice';

const STATUS_COLORS = {
  open: 'bg-blue-500/10 text-blue-400',
  in_progress: 'bg-yellow-500/10 text-yellow-400',
  resolved: 'bg-green-500/10 text-green-400',
  closed: 'bg-slate-500/10 text-slate-400',
};

const STATUS_ICONS = {
  open: Clock,
  in_progress: RefreshCw,
  resolved: CheckCircle,
  closed: XCircle,
};

const TICKET_TYPES = [
  { value: 'forgot_password', label: '🔐 Forgot Password' },
  { value: 'account_locked', label: '🔒 Account Locked' },
  { value: 'gmail_change', label: '📧 Gmail/Email Change' },
  { value: 'billing_issue', label: '💳 Billing / Premium Issue' },
  { value: 'other', label: '📋 Other Issue' },
];

const SupportTicketTab = () => {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ type: 'forgot_password', subject: '', description: '', userEmail: '' });

  const { data: res, isLoading, refetch } = useGetMyTicketsQuery();
  const tickets = res?.data || [];

  const [createTicket, { isLoading: isCreating }] = useCreateSupportTicketMutation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.subject || !form.description) return toast.error('Please fill all fields');
    try {
      await createTicket(form).unwrap();
      toast.success('Ticket submitted! Admin will review and reply.');
      setForm({ type: 'forgot_password', subject: '', description: '', userEmail: '' });
      setShowForm(false);
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to submit ticket');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold dark:text-white flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-indigo-500" /> Support Tickets
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">Submit help requests to the admin team</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition active:scale-95"
        >
          <Plus className="w-4 h-4" /> New Ticket
        </button>
      </div>

      {/* Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="glass-card p-4 border border-indigo-500/30"
          >
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold dark:text-white text-sm">New Support Ticket</h3>
                <button type="button" onClick={() => setShowForm(false)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition">
                  <X className="w-4 h-4 text-slate-500" />
                </button>
              </div>

              <div>
                <label className="text-xs text-slate-500 font-semibold block mb-1">Issue Type</label>
                <select
                  value={form.type}
                  onChange={e => setForm(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-sm dark:text-white border border-transparent focus:border-indigo-500 outline-none"
                >
                  {TICKET_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>

              {(form.type === 'forgot_password' || form.type === 'gmail_change') && (
                <div>
                  <label className="text-xs text-slate-500 font-semibold block mb-1">Your Registered Email</label>
                  <input
                    value={form.userEmail}
                    onChange={e => setForm(prev => ({ ...prev, userEmail: e.target.value }))}
                    type="email"
                    placeholder="Enter your registered email address"
                    className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-sm dark:text-white border border-transparent focus:border-indigo-500 outline-none"
                  />
                </div>
              )}

              <div>
                <label className="text-xs text-slate-500 font-semibold block mb-1">Subject</label>
                <input
                  value={form.subject}
                  onChange={e => setForm(prev => ({ ...prev, subject: e.target.value }))}
                  maxLength={150}
                  placeholder="Brief summary of your issue"
                  className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-sm dark:text-white border border-transparent focus:border-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="text-xs text-slate-500 font-semibold block mb-1">Description</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
                  maxLength={2000}
                  rows={4}
                  placeholder="Describe your issue in detail..."
                  className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-sm dark:text-white border border-transparent focus:border-indigo-500 outline-none resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isCreating}
                className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:opacity-90 transition active:scale-95 disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                {isCreating ? 'Submitting...' : 'Submit Ticket'}
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Ticket List */}
      {isLoading ? (
        <div className="text-center py-8 text-slate-500 text-sm">Loading tickets...</div>
      ) : tickets.length === 0 ? (
        <div className="text-center py-8 glass-card">
          <HelpCircle className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="text-slate-500 text-sm font-medium">No support tickets yet</p>
          <p className="text-slate-400 text-xs mt-1">Click "New Ticket" if you need help from admin</p>
        </div>
      ) : (
        <div className="space-y-2">
          {tickets.map((ticket) => {
            const StatusIcon = STATUS_ICONS[ticket.status] || Clock;
            return (
              <motion.div
                key={ticket._id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card p-3 space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold dark:text-white text-sm truncate">{ticket.subject}</p>
                    <p className="text-xs text-slate-500">{TICKET_TYPES.find(t => t.value === ticket.type)?.label || ticket.type}</p>
                  </div>
                  <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold shrink-0 ${STATUS_COLORS[ticket.status]}`}>
                    <StatusIcon className="w-3 h-3" />
                    {ticket.status?.replace('_', ' ')}
                  </span>
                </div>
                
                {ticket.adminNote && (
                  <div className="p-2.5 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-200 dark:border-indigo-800">
                    <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 mb-0.5">Admin Reply:</p>
                    <p className="text-xs text-slate-700 dark:text-slate-300">{ticket.adminNote}</p>
                  </div>
                )}
                
                <p className="text-xs text-slate-400">{new Date(ticket.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SupportTicketTab;
