import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AgeVerificationModal = ({ onVerified }) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const isVerified = localStorage.getItem('nexoria_eh_age_verified');
    if (!isVerified) {
      // Small delay for dramatic effect
      const timer = setTimeout(() => setIsOpen(true), 500);
      return () => clearTimeout(timer);
    } else {
      if (onVerified) onVerified();
    }
  }, []);

  const handleVerify = (isAdult) => {
    if (isAdult) {
      localStorage.setItem('nexoria_eh_age_verified', 'true');
      setIsOpen(false);
      if (onVerified) onVerified();
    } else {
      navigate('/');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-0">
          {/* Backdrop with extreme blur and dark tint */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/90 backdrop-blur-xl"
          />
          
          {/* Scanline overlay for cyberpunk feel */}
          <div className="absolute inset-0 pointer-events-none opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSJ0cmFuc3BhcmVudCIvPgo8cGF0aCBkPSJNMCAwTDQgMEw0IDFMMSAxWiIgZmlsbD0iIzIyMiIvPgo8L3N2Zz4=')]"></div>

          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-md bg-[#0a0a0a] border border-red-500/30 rounded-2xl shadow-[0_0_50px_rgba(239,68,68,0.15)] overflow-hidden"
          >
            {/* Top Red Bar */}
            <div className="h-1 w-full bg-gradient-to-r from-red-600 via-red-500 to-red-600"></div>
            
            <div className="p-8">
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-red-500 blur-xl opacity-20 rounded-full animate-pulse"></div>
                  <ShieldAlert className="w-16 h-16 text-red-500 relative z-10" />
                </div>
              </div>

              <h2 className="text-2xl font-bold text-center text-white mb-2 tracking-tight font-mono">
                RESTRICTED ACCESS
              </h2>
              
              <div className="space-y-4 mb-8">
                <p className="text-gray-400 text-center text-sm leading-relaxed">
                  The Ethical Hacking section contains advanced cybersecurity concepts, penetration testing tools, and educational material regarding system vulnerabilities.
                </p>
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                  <p className="text-red-400 text-xs text-center uppercase tracking-wider font-semibold">
                    Are you 18 years of age or older?
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => handleVerify(false)}
                  className="px-4 py-3 bg-gray-800/50 hover:bg-gray-800 text-gray-300 rounded-xl transition-all duration-200 font-medium text-sm border border-gray-700/50 hover:border-gray-600"
                >
                  No, I am under 18
                </button>
                <button
                  onClick={() => handleVerify(true)}
                  className="relative group px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-all duration-200 font-bold text-sm overflow-hidden"
                >
                  <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
                  Yes, I am 18+
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AgeVerificationModal;
