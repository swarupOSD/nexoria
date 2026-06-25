import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Edit, Megaphone, Loader2, Bell, Calendar, X, Info, AlertTriangle, CheckCircle, AlertOctagon } from 'lucide-react';
import toast from 'react-hot-toast';

const typeConfig = {
  info:    { label: 'Info',    bg: 'bg-blue-100 dark:bg-blue-900/30',    text: 'text-blue-700 dark:text-blue-300',    icon: <Info className="w-4 h-4" />,           accent: 'border-blue-400'    },
  success: { label: 'Success', bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-300', icon: <CheckCircle className="w-4 h-4" />,    accent: 'border-emerald-400' },
  warning: { label: 'Warning', bg: 'bg-amber-100 dark:bg-amber-900/30',   text: 'text-amber-700 dark:text-amber-300',   icon: <AlertTriangle className="w-4 h-4" />,  accent: 'border-amber-400'   },
  error:   { label: 'Error',   bg: 'bg-red-100 dark:bg-red-900/30',      text: 'text-red-700 dark:text-red-300',      icon: <AlertOctagon className="w-4 h-4" />,   accent: 'border-red-400'     },
};

const SkeletonCard = () => (
  <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-5 animate-pulse">
    <div className="flex justify-between mb-3">
      <div className="h-5 w-16 bg-slate-200 dark:bg-slate-700 rounded-full" />
      <div className="h-4 w-20 bg-slate-100 dark:bg-slate-800 rounded" />
    </div>
    <div className="h-6 w-3/4 bg-slate-200 dark:bg-slate-700 rounded mb-2" />
    <div className="h-4 w-full bg-slate-100 dark:bg-slate-800 rounded mb-1" />
    <div className="h-4 w-2/3 bg-slate-100 dark:bg-slate-800 rounded" />
  </div>
);

const SystemNoticesManager = () => {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [type, setType] = useState('info');
  const [link, setLink] = useState('');
  const [linkText, setLinkText] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [expiresAt, setExpiresAt] = useState('');
  const [notifyUsers, setNotifyUsers] = useState(false);

  const fetchNotices = async () => {
    try {
      const res = await fetch('/api/system-notices/admin', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      if (data.success) setNotices(data.data);
    } catch {
      toast.error('Failed to load system notices');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchNotices(); }, []);

  const resetForm = () => {
    setTitle(''); setContent(''); setType('info');
    setLink(''); setLinkText(''); setIsActive(true);
    setExpiresAt(''); setNotifyUsers(false); setEditingId(null);
  };

  const openEdit = (n) => {
    setEditingId(n._id); setTitle(n.title); setContent(n.content);
    setType(n.type); setLink(n.link || ''); setLinkText(n.linkText || '');
    setIsActive(n.isActive);
    setExpiresAt(n.expiresAt ? new Date(n.expiresAt).toISOString().split('T')[0] : '');
    setNotifyUsers(false); setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { title, content, type, isActive, link, linkText, expiresAt: expiresAt || null, notifyUsers };
      const url = editingId ? `/api/system-notices/${editingId}` : '/api/system-notices';
      const method = editingId ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        toast.success(editingId ? 'Notice updated' : 'Notice created');
        fetchNotices(); setIsModalOpen(false); resetForm();
      } else { toast.error(data.message || 'Action failed'); }
    } catch { toast.error('An error occurred'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this notice?')) return;
    try {
      const res = await fetch(`/api/system-notices/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) { setNotices(notices.filter(n => n._id !== id)); toast.success('Notice deleted'); }
    } catch { toast.error('Error deleting notice'); }
  };

  const inputClass = "w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all text-sm";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
            <Megaphone className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">System Notices</h1>
            <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">Broadcast global notices and system messages to all users.</p>
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          onClick={() => { resetForm(); setIsModalOpen(true); }}
          className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-lg shadow-amber-500/25 w-max"
        >
          <Plus className="w-4 h-4" /> New Notice
        </motion.button>
      </div>

      {/* Cards Grid */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {[1,2,3].map(i => <SkeletonCard key={i} />)}
        </div>
      ) : notices.length === 0 ? (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-center">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center mb-4">
            <Megaphone className="w-8 h-8 text-amber-500/60" />
          </div>
          <h3 className="font-semibold text-slate-700 dark:text-slate-300 mb-1">No system notices yet</h3>
          <p className="text-sm text-slate-400 mb-4">Create your first notice to broadcast a message to all users.</p>
          <button onClick={() => { resetForm(); setIsModalOpen(true); }}
            className="flex items-center gap-2 text-amber-500 border border-amber-500/30 hover:bg-amber-500/10 px-4 py-2 rounded-xl text-sm font-medium transition-colors">
            <Plus className="w-4 h-4" /> Create Notice
          </button>
        </motion.div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <AnimatePresence>
            {notices.map((n, i) => {
              const cfg = typeConfig[n.type] || typeConfig.info;
              return (
                <motion.div key={n._id}
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }} transition={{ delay: i * 0.05 }}
                  className={`bg-white dark:bg-white/5 border rounded-2xl p-5 flex flex-col relative overflow-hidden group transition-shadow hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-black/20 ${n.isActive ? 'border-slate-200 dark:border-white/10' : 'border-slate-100 dark:border-white/5 opacity-60'}`}>
                  <div className={`absolute top-0 left-0 w-1 h-full ${cfg.accent} rounded-l-2xl`} />
                  <div className="flex items-start justify-between mb-3 pl-2">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-bold uppercase px-2.5 py-1 rounded-lg ${cfg.bg} ${cfg.text}`}>
                      {cfg.icon} {cfg.label}
                    </span>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEdit(n)} className="p-1.5 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition-colors">
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleDelete(n._id)} className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base mb-1.5 pl-2">{n.title}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-3 pl-2 flex-1">{n.content}</p>
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100 dark:border-white/5 pl-2">
                    <span className={`flex items-center gap-1.5 text-xs font-semibold ${n.isActive ? 'text-emerald-500' : 'text-slate-400'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${n.isActive ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                      {n.isActive ? 'Active' : 'Inactive'}
                    </span>
                    {n.expiresAt && (
                      <span className="flex items-center gap-1 text-xs text-slate-400">
                        <Calendar className="w-3 h-3" /> {new Date(n.expiresAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
              <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center sticky top-0 bg-white dark:bg-slate-900 z-10">
                <div className="flex items-center gap-2">
                  <Megaphone className="w-5 h-5 text-amber-500" />
                  <h3 className="font-bold text-slate-900 dark:text-white">{editingId ? 'Edit Notice' : 'Create Notice'}</h3>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <form onSubmit={handleSave} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1.5">Title *</label>
                  <input type="text" required value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Scheduled Maintenance" className={inputClass} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1.5">Message *</label>
                  <textarea required value={content} onChange={e => setContent(e.target.value)} rows="3" placeholder="Describe the notice..." className={inputClass + ' resize-none'} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1.5">Type</label>
                    <select value={type} onChange={e => setType(e.target.value)} className={inputClass}>
                      <option value="info">Info</option>
                      <option value="success">Success</option>
                      <option value="warning">Warning</option>
                      <option value="error">Alert</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1.5">Expires At</label>
                    <input type="date" value={expiresAt} onChange={e => setExpiresAt(e.target.value)} className={inputClass} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1.5">Action URL</label>
                    <input type="text" value={link} onChange={e => setLink(e.target.value)} placeholder="/some-path" className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1.5">Button Text</label>
                    <input type="text" value={linkText} onChange={e => setLinkText(e.target.value)} placeholder="Learn More" className={inputClass} />
                  </div>
                </div>
                <div className="flex items-center gap-6 py-2">
                  <label className="flex items-center gap-2.5 cursor-pointer select-none">
                    <div className={`relative w-10 h-5 rounded-full transition-colors ${isActive ? 'bg-amber-500' : 'bg-slate-200 dark:bg-slate-700'}`}
                      onClick={() => setIsActive(!isActive)}>
                      <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${isActive ? 'translate-x-5' : 'translate-x-0.5'}`} />
                    </div>
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Active</span>
                  </label>
                  {!editingId && (
                    <label className="flex items-center gap-2.5 cursor-pointer select-none">
                      <div className={`relative w-10 h-5 rounded-full transition-colors ${notifyUsers ? 'bg-amber-500' : 'bg-slate-200 dark:bg-slate-700'}`}
                        onClick={() => setNotifyUsers(!notifyUsers)}>
                        <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${notifyUsers ? 'translate-x-5' : 'translate-x-0.5'}`} />
                      </div>
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1">
                        <Bell className="w-3.5 h-3.5 text-amber-500" /> Push All
                      </span>
                    </label>
                  )}
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <button type="button" onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">Cancel</button>
                  <motion.button type="submit" disabled={saving} whileTap={{ scale: 0.97 }}
                    className="px-5 py-2 text-sm font-semibold text-white bg-amber-500 hover:bg-amber-600 disabled:opacity-60 rounded-xl shadow-lg shadow-amber-500/25 transition-colors flex items-center gap-2">
                    {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    {editingId ? 'Update' : 'Create'}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SystemNoticesManager;
