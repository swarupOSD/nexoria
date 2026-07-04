import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Smartphone, DownloadCloud, Sparkles, CheckCircle2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

const AppDownloadTab = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    if (window.deferredPrompt) {
      setDeferredPrompt(window.deferredPrompt);
    }
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      window.deferredPrompt = e;
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallApp = async () => {
    // Determine if the user is on Android
    const isAndroid = /Android/i.test(navigator.userAgent);

    if (isAndroid) {
      // Direct APK download for Android users
      toast.success('Downloading Nexoria Android App...');
      window.location.href = 'https://github.com/swarupOSD/nexoria/releases/latest/download/Nexoria.apk.apk';
      return;
    }

    // Fallback to PWA install prompt for iOS/Desktop
    const prompt = window.deferredPrompt || deferredPrompt;
    if (prompt) {
      prompt.prompt();
      const { outcome } = await prompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        window.deferredPrompt = null;
        toast.success('App installed successfully! 🚀');
      }
    } else {
      toast.error('Installation is only supported on Android or Safari/Chrome via Add to Home Screen.');
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="glass-card overflow-hidden relative"
      >
        {/* GenZ Background Gradient Elements */}
        <div className="absolute -top-32 -right-32 w-64 h-64 bg-primary/20 rounded-full blur-[80px]" />
        <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-accent/20 rounded-full blur-[80px]" />

        <div className="p-8 md:p-12 relative z-10">
          <div className="flex flex-col md:flex-row items-center gap-8">
            
            {/* Left Content */}
            <div className="flex-1 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-bold">
                <Sparkles className="w-4 h-4" />
                <span>Next-Gen Experience</span>
              </div>
              
              <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
                Install <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Nexoria App</span>
              </h2>
              
              <p className="text-lg text-slate-600 dark:text-slate-300 font-medium">
                Get one-tap access to millions of premium apps, games, and music directly from your home screen. No App Store required.
              </p>

              <div className="space-y-3">
                {[
                  'Lightning fast performance ⚡',
                  'Offline access to your downloads 📱',
                  'Instant push notifications 🔔',
                  'Zero storage space required 🚀'
                ].map((feature, idx) => (
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + (idx * 0.1) }}
                    key={idx} 
                    className="flex items-center gap-3 text-slate-700 dark:text-slate-200 font-semibold"
                  >
                    <CheckCircle2 className="w-5 h-5 text-success" />
                    {feature}
                  </motion.div>
                ))}
              </div>

              <div className="pt-6">
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleInstallApp} 
                  className="w-full md:w-auto px-8 py-4 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white rounded-2xl font-black text-lg shadow-xl shadow-primary/25 flex items-center justify-center gap-3 transition-all"
                >
                  <DownloadCloud className="w-6 h-6" />
                  Install App Now
                </motion.button>
                <p className="text-xs text-slate-500 mt-4 text-center md:text-left font-medium">
                  Compatible with iOS (Safari) and Android (Chrome)
                </p>
              </div>
            </div>

            {/* Right Mockup */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="w-64 h-[500px] bg-slate-900 rounded-[3rem] p-2 shadow-2xl border-4 border-slate-800 relative hidden md:block shrink-0"
            >
              {/* Screen */}
              <div className="w-full h-full bg-[#0A0A0A] rounded-[2.5rem] overflow-hidden relative flex flex-col items-center justify-center text-center p-6 border border-white/5">
                <Smartphone className="w-16 h-16 text-primary mb-4" />
                <h3 className="text-xl font-black text-white mb-2">Nexoria</h3>
                <p className="text-sm text-slate-400">Your premium hub</p>
                
                {/* Fake App Grid */}
                <div className="grid grid-cols-4 gap-3 mt-8 opacity-20">
                  {[...Array(12)].map((_, i) => (
                    <div key={i} className="aspect-square bg-white rounded-lg" />
                  ))}
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AppDownloadTab;
