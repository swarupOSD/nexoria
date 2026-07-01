import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Bell } from 'lucide-react';
import toast from 'react-hot-toast';

const BroadcastModal = ({ isOpen, onClose }) => {
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSend = () => {
    if (!message.trim()) {
      toast.error('Please enter a message to broadcast.');
      return;
    }
    
    setIsSending(true);
    
    // Simulating API call
    setTimeout(() => {
      setIsSending(false);
      toast.success('Broadcast notice sent to all users!');
      setMessage('');
      onClose();
    }, 1500);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-lg bg-white dark:bg-[#111] rounded-3xl shadow-2xl border border-slate-200 dark:border-white/10 overflow-hidden"
        >
          <div className="p-6 border-b border-slate-100 dark:border-white/5 flex items-center justify-between bg-slate-50 dark:bg-white/5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-500/10 rounded-xl text-indigo-500">
                <Bell className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white">Broadcast Notice</h3>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Send alert to all active users</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white bg-slate-200/50 dark:bg-white/5 rounded-full transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="p-6">
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Notice Message</label>
            <textarea 
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your important announcement here..."
              className="w-full bg-slate-50 dark:bg-[#050505] border border-slate-200 dark:border-white/10 rounded-2xl p-4 text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 min-h-[120px] resize-y"
            />
            
            <div className="mt-6 flex justify-end gap-3">
              <button 
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleSend}
                disabled={isSending}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-white bg-indigo-500 hover:bg-indigo-600 transition-colors disabled:opacity-50"
              >
                {isSending ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <Send className="w-5 h-5" />
                )}
                {isSending ? 'Sending...' : 'Broadcast Now'}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default BroadcastModal;
