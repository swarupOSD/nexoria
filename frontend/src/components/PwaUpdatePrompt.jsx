import React, { useState, useEffect } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { motion, AnimatePresence } from 'framer-motion';
import { DownloadCloud, RefreshCw, X } from 'lucide-react';
import toast from 'react-hot-toast';

const PwaUpdatePrompt = () => {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      // Setup periodic update check every 60 minutes
      if (r) {
        setInterval(() => {
          r.update();
        }, 60 * 60 * 1000);
      }
    },
    onRegisterError(error) {
      console.error('SW registration error', error);
    },
  });

  const [installPrompt, setInstallPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault();
      // Stash the event so it can be triggered later.
      window.deferredPrompt = e; // Expose globally for AppDownloadTab
      setInstallPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    window.addEventListener('appinstalled', () => {
      setIsInstallable(false);
      setInstallPrompt(null);
      toast.success('App installed successfully! 🎉');
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!installPrompt) return;
    
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setIsInstallable(false);
      setInstallPrompt(null);
    }
  };

  const closeRefresh = () => {
    setOfflineReady(false);
    setNeedRefresh(false);
  };

  return (
    <AnimatePresence>
      {/* UPDATE PROMPT */}
      {needRefresh && (
        <motion.div 
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.9 }}
          className="fixed bottom-6 right-6 z-[9999] bg-[#1a1a1f] border border-purple-500/30 p-4 rounded-2xl shadow-[0_10px_40px_rgba(139,92,246,0.3)] flex items-center gap-4 max-w-sm"
        >
          <div className="bg-purple-500/20 p-3 rounded-full text-purple-400">
            <RefreshCw className="w-6 h-6 animate-spin" />
          </div>
          <div className="flex-1">
            <h4 className="text-white font-bold text-sm">New Update Available!</h4>
            <p className="text-slate-400 text-xs mt-0.5">Click reload to get the latest features.</p>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => updateServiceWorker(true)}
              className="bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors"
            >
              Reload
            </button>
            <button onClick={closeRefresh} className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-white/5 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}

      {/* OFFLINE READY PROMPT (Optional, usually we just show a toast) */}
      {offlineReady && (
        <motion.div 
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          onAnimationComplete={() => setTimeout(closeRefresh, 3000)}
          className="fixed top-6 left-1/2 -translate-x-1/2 z-[9999] bg-emerald-500/10 border border-emerald-500/30 px-6 py-3 rounded-full shadow-lg backdrop-blur-md"
        >
          <p className="text-emerald-400 text-sm font-bold">App is ready to work offline!</p>
        </motion.div>
      )}

      {/* INSTALL APP BUTTON FLOATER */}
      {isInstallable && (
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          className="fixed bottom-6 left-6 z-[9998]"
        >
          <button 
            onClick={handleInstallClick}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-5 py-3 rounded-2xl shadow-lg shadow-blue-500/25 transition-all transform hover:-translate-y-1 font-bold text-sm"
          >
            <DownloadCloud className="w-5 h-5" />
            Install App
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PwaUpdatePrompt;
