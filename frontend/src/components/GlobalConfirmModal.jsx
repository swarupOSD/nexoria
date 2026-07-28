import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';

// Expose a global function for easy usage anywhere without hooks
window.appConfirm = (message) => {
  return new Promise((resolve) => {
    const event = new CustomEvent('open-confirm-modal', {
      detail: { message, resolve }
    });
    window.dispatchEvent(event);
  });
};

const GlobalConfirmModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [resolver, setResolver] = useState(null);

  useEffect(() => {
    const handleOpen = (e) => {
      setMessage(e.detail.message);
      setResolver(() => e.detail.resolve);
      setIsOpen(true);
    };
    window.addEventListener('open-confirm-modal', handleOpen);
    return () => window.removeEventListener('open-confirm-modal', handleOpen);
  }, []);

  const handleConfirm = () => {
    if (resolver) resolver(true);
    setIsOpen(false);
  };

  const handleCancel = () => {
    if (resolver) resolver(false);
    setIsOpen(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-[#0f0f0f] border border-white/10 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden"
          >
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-6 h-6 text-red-500" />
                </div>
                <h3 className="text-xl font-bold text-white">Confirm Action</h3>
              </div>
              <p className="text-slate-300 text-sm mb-6">{message}</p>
              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={handleCancel}
                  className="px-5 py-2.5 rounded-xl text-slate-300 font-semibold hover:bg-white/10 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirm}
                  className="px-5 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold shadow-lg shadow-red-500/20 transition-all cursor-pointer"
                >
                  Confirm
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default GlobalConfirmModal;
