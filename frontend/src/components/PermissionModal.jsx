import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Camera, Bell, ShieldAlert, X, Lock } from 'lucide-react';

const PermissionModal = ({ isOpen, type, status, onAllow, onDeny }) => {
  if (!isOpen) return null;

  const contentMap = {
    microphone: {
      icon: <Mic className="w-12 h-12 text-purple-500 mb-4" />,
      title: 'Microphone Access Required',
      desc: 'Nexoria needs access to your microphone so you can chat with other members in Voice Lounges and send Voice Messages.',
      gradient: 'from-purple-500/20 to-indigo-500/20'
    },
    camera: {
      icon: <Camera className="w-12 h-12 text-pink-500 mb-4" />,
      title: 'Camera Access Required',
      desc: 'Nexoria needs access to your camera for video calls and visual interactions with your friends.',
      gradient: 'from-pink-500/20 to-rose-500/20'
    },
    notifications: {
      icon: <Bell className="w-12 h-12 text-amber-500 mb-4" />,
      title: 'Enable Notifications',
      desc: 'Stay updated on incoming calls, new messages, and exclusive Nexoria alerts. We promise not to spam!',
      gradient: 'from-amber-500/20 to-orange-500/20'
    }
  };

  const currentContent = contentMap[type] || contentMap.microphone;
  const isDenied = status === 'denied';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className={`relative max-w-md w-full bg-[#111116] border border-white/10 rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl p-6 sm:p-8 text-center bg-gradient-to-br ${currentContent.gradient}`}
        >
          <button 
            onClick={onDeny}
            className="absolute top-3 right-3 sm:top-4 sm:right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>

          <div className="flex justify-center">
            <div className="relative">
              {currentContent.icon}
              {isDenied && (
                <div className="absolute -bottom-2 -right-2 bg-red-500 rounded-full p-1 border-2 border-[#111116]">
                  <Lock className="w-4 h-4 text-white" />
                </div>
              )}
            </div>
          </div>

          <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">{currentContent.title}</h3>
          <p className="text-slate-400 text-xs sm:text-sm mb-6 sm:mb-8 leading-relaxed">
            {isDenied 
              ? `You have previously blocked ${type} access. To use this feature, please click the 🔒 Lock icon in your browser's address bar and change the permission to "Allow".` 
              : currentContent.desc}
          </p>

          <div className="flex flex-col gap-2 sm:gap-3">
            {!isDenied ? (
              <button
                onClick={onAllow}
                className="w-full py-3 sm:py-4 bg-white text-black font-bold rounded-xl hover:bg-slate-200 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.3)] text-sm sm:text-base"
              >
                Continue & Allow
              </button>
            ) : (
              <button
                onClick={onDeny}
                className="w-full py-3 sm:py-4 bg-red-500/20 text-red-400 font-bold rounded-xl border border-red-500/50 hover:bg-red-500/30 transition-colors text-sm sm:text-base"
              >
                I Understand
              </button>
            )}
            {!isDenied && (
              <button
                onClick={onDeny}
                className="w-full py-3 sm:py-4 bg-transparent text-slate-400 font-semibold hover:text-white transition-colors text-sm sm:text-base"
              >
                Not Now
              </button>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PermissionModal;
