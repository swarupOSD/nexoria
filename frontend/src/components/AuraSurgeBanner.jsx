import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Zap } from 'lucide-react';
import { io } from 'socket.io-client';
import { useSelector } from 'react-redux';

let socket;

const AuraSurgeBanner = () => {
  const [surgeEvent, setSurgeEvent] = useState(null);
  const { token } = useSelector((state) => state.auth);

  useEffect(() => {
    // Setup socket connection
    const socketUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    socket = io(socketUrl, {
      auth: { token },
      withCredentials: true,
    });

    socket.on('auraSurge', (data) => {
      // data: { title, score, image }
      setSurgeEvent(data);
      
      // Auto-hide after 8 seconds
      setTimeout(() => {
        setSurgeEvent(null);
      }, 8000);
    });

    return () => {
      socket.disconnect();
    };
  }, [token]);

  return (
    <AnimatePresence>
      {surgeEvent && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ type: 'spring', damping: 20, stiffness: 100 }}
          className="fixed top-0 left-0 w-full z-[9999] pointer-events-none"
        >
          <div className="bg-gradient-to-r from-red-600 via-amber-500 to-purple-600 p-[2px] shadow-[0_0_50px_rgba(245,158,11,0.6)]">
            <div className="bg-[#050505] px-4 py-3 flex items-center justify-center gap-4 flex-wrap">
              
              {/* Pulsing Fire Icon */}
              <div className="relative flex items-center justify-center">
                <div className="absolute inset-0 bg-amber-500 rounded-full blur-md animate-pulse opacity-50"></div>
                <Flame className="w-6 h-6 text-amber-500 relative z-10 animate-bounce" />
              </div>

              {/* Image */}
              {surgeEvent.image && (
                <img 
                  src={surgeEvent.image} 
                  alt={surgeEvent.title} 
                  className="w-10 h-10 rounded-lg object-cover border border-amber-500/30"
                  crossOrigin="anonymous"
                />
              )}

              {/* Text */}
              <div className="text-center sm:text-left">
                <p className="text-white font-black text-sm sm:text-base tracking-wide uppercase flex items-center gap-2">
                  <Zap className="w-4 h-4 text-purple-400" />
                  {surgeEvent.title} just hit {surgeEvent.score} Aura!
                </p>
                <p className="text-amber-400/80 text-xs font-bold uppercase tracking-widest">
                  🔥 The hype is unreal! Aura is Surging! 🔥
                </p>
              </div>

            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AuraSurgeBanner;
