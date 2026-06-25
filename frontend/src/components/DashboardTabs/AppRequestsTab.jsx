import React, { useState } from 'react';
import { useGetMyAppRequestsQuery, useCreateAppRequestMutation } from '../../features/appRequest/appRequestApiSlice';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, Plus, X, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

const AppRequestsTab = ({ user }) => {
  const { data: requestsRes, isLoading } = useGetMyAppRequestsQuery(undefined, { skip: !user });
  const [createAppRequest, { isLoading: isCreating }] = useCreateAppRequestMutation();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    appName: '',
    description: '',
    category: 'Apps',
    priority: 'Normal',
  });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createAppRequest(formData).unwrap();
      toast.success('App request submitted successfully!');
      setIsModalOpen(false);
      setFormData({ appName: '', description: '', category: 'Apps', priority: 'Normal' });
    } catch (err) {
      toast.error(err?.data?.message || 'Error submitting request');
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Pending': return 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400';
      case 'Under Review': return 'bg-amber-100 text-amber-600 dark:bg-amber-500/10 dark:text-amber-500';
      case 'Approved': return 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-500';
      case 'Completed': return 'bg-indigo-100 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-500';
      case 'Rejected': return 'bg-rose-100 text-rose-600 dark:bg-rose-500/10 dark:text-rose-500';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div></div>;
  }

  const requests = requestsRes?.data || [];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <HelpCircle className="w-6 h-6 text-emerald-500" /> My App Requests
        </h2>
        <button onClick={() => setIsModalOpen(true)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Request an App
        </button>
      </div>

      {requests.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <HelpCircle className="w-10 h-10 text-emerald-300 dark:text-emerald-500/50" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">No Requests Yet</h3>
          <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            Can't find the app or game you're looking for? Submit a request and our team will try to add it.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {requests.map(req => (
            <div key={req._id} className="glass-card p-5 hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white">{req.appName}</h3>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(req.status)}`}>
                  {req.status}
                </span>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-2">{req.description}</p>
              
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 border-t border-slate-100 dark:border-slate-800 pt-3">
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(req.createdAt).toLocaleDateString()}</span>
                <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded font-semibold">{req.category}</span>
                <span className={`px-2 py-0.5 rounded font-semibold ${req.priority === 'High' ? 'text-rose-500 bg-rose-50 dark:bg-rose-500/10' : 'bg-slate-100 dark:bg-slate-800'}`}>
                  Priority: {req.priority}
                </span>
              </div>
              {req.adminNotes && (
                <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-700/30 rounded-xl flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <p className="text-sm text-amber-700 dark:text-amber-400"><span className="font-bold">Admin Note:</span> {req.adminNotes}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Request Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200 dark:border-slate-800"
            >
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                <h3 className="text-xl font-bold text-slate-800 dark:text-white">Request an App</h3>
                <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white bg-slate-100 dark:bg-slate-800 rounded-full transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">App / Game Name</label>
                  <input type="text" name="appName" value={formData.appName} onChange={handleChange} required className="premium-input w-full" placeholder="e.g. Minecraft PE" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Category</label>
                  <select name="category" value={formData.category} onChange={handleChange} className="premium-input w-full">
                    <option value="Apps">Apps</option>
                    <option value="Games">Games</option>
                    <option value="Tools">Tools</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Priority</label>
                  <select name="priority" value={formData.priority} onChange={handleChange} className="premium-input w-full">
                    <option value="Low">Low (Just a suggestion)</option>
                    <option value="Normal">Normal (I'd like this)</option>
                    <option value="High">High (I really need this)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Description / URL (Optional)</label>
                  <textarea name="description" value={formData.description} onChange={handleChange} required className="premium-input w-full" rows="3" placeholder="Provide Play Store link or describe what the app does..."></textarea>
                </div>
                <div className="pt-4 flex gap-3">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 px-4 rounded-xl font-bold text-slate-600 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition">Cancel</button>
                  <button type="submit" disabled={isCreating} className="flex-1 btn-primary disabled:opacity-50">
                    {isCreating ? 'Submitting...' : 'Submit Request'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </motion.div>
  );
};

export default AppRequestsTab;
