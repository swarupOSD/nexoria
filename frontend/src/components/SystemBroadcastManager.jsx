import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Info, ShieldAlert, X } from 'lucide-react';

let broadcastSocket;

const SystemBroadcastManager = () => {
  const [broadcasts, setBroadcasts] = useState([]);

  useEffect(() => {
    if (!broadcastSocket) {
      broadcastSocket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
        withCredentials: true,
      });
    }

    broadcastSocket.on('systemBroadcast', (data) => {
      setBroadcasts((prev) => [...prev, { ...data, id: Date.now() }]);
      
      // Auto-remove info broadcasts after 15 seconds, but keep warnings and errors until manually closed
      if (data.type === 'info') {
        setTimeout(() => {
          setBroadcasts((prev) => prev.filter(b => b.id !== data.id));
        }, 15000);
      }
    });

    return () => {
      broadcastSocket.off('systemBroadcast');
    };
  }, []);

  const removeBroadcast = (id) => {
    setBroadcasts((prev) => prev.filter(b => b.id !== id));
  };

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999] flex flex-col items-center justify-center p-4">
      <AnimatePresence>
        {broadcasts.map((b) => {
          let bgClass = 'bg-blue-600';
          let Icon = Info;
          if (b.type === 'warning') {
            bgClass = 'bg-amber-600';
            Icon = AlertTriangle;
          } else if (b.type === 'error') {
            bgClass = 'bg-red-600';
            Icon = ShieldAlert;
          }

          return (
            <motion.div
              key={b.id}
              initial={{ scale: 0.8, opacity: 0, y: -50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 50 }}
              className={`relative max-w-2xl w-full pointer-events-auto rounded-3xl shadow-2xl overflow-hidden mb-4 border-2 border-white/20`}
            >
              <div className={`absolute inset-0 opacity-80 ${bgClass} mix-blend-multiply`}></div>
              <div className="absolute inset-0 bg-black/40 backdrop-blur-md"></div>
              
              <div className="relative p-8 md:p-12 text-center text-white">
                <button 
                  onClick={() => removeBroadcast(b.id)}
                  className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="flex justify-center mb-6">
                  <div className={`p-4 rounded-full bg-white/10 border-4 border-white/20 animate-bounce`}>
                    <Icon className="w-12 h-12" />
                  </div>
                </div>

                <h1 className="text-3xl md:text-5xl font-black mb-4 tracking-tight drop-shadow-lg">
                  {b.title}
                </h1>
                
                <p className="text-lg md:text-xl font-medium text-white/90 leading-relaxed mb-8">
                  {b.message}
                </p>
                
                <button 
                  onClick={() => removeBroadcast(b.id)}
                  className="px-8 py-3 bg-white text-slate-900 hover:bg-slate-100 font-bold rounded-xl transition-transform active:scale-95 shadow-xl"
                >
                  Acknowledge & Close
                </button>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

export default SystemBroadcastManager;
