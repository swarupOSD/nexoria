import React, { useState, useEffect } from 'react';
import { X, Lock, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PatternLock from './PatternLock';

const ParentalGateModal = ({ isOpen, onClose, mode, onSuccess }) => {
  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      setError(false);
      setSuccess(false);
      setFeedbackMsg('');
    }
  }, [isOpen, mode]);

  const handlePatternComplete = (pattern) => {
    if (pattern === 'TOO_SHORT' || pattern.length < 4) {
      setError(true);
      setFeedbackMsg('Pattern must connect at least 4 dots');
      setTimeout(() => setError(false), 1000);
      return;
    }

    if (mode === 'enable') {
      // Setup Mode: Save pattern
      localStorage.setItem('kidsPattern', pattern);
      setSuccess(true);
      setFeedbackMsg('Pattern Saved!');
      
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 800);

    } else {
      // Disable Mode: Verify pattern
      const savedPattern = localStorage.getItem('kidsPattern');
      
      // If no pattern was ever set, let them pass if they draw any valid pattern
      // or we just check if it matches
      if (savedPattern && pattern !== savedPattern) {
        setError(true);
        setFeedbackMsg('Incorrect pattern');
        setTimeout(() => setError(false), 1000);
      } else {
        setSuccess(true);
        setFeedbackMsg('Pattern Accepted!');
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 800);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="relative w-full max-w-sm bg-[#1a1a1f] rounded-3xl border border-white/10 shadow-[0_0_50px_rgba(139,92,246,0.1)] overflow-hidden flex flex-col items-center"
        >
          <div className="w-full p-5 border-b border-white/5 flex items-center justify-between bg-black/20">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              {mode === 'enable' ? <ShieldCheck className="w-5 h-5 text-emerald-500" /> : <Lock className="w-5 h-5 text-amber-500" />}
              {mode === 'enable' ? 'Set Parental Pattern' : 'Verify Pattern'}
            </h2>
            <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-full hover:bg-white/5 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 w-full flex flex-col items-center">
            
            <p className="text-slate-300 text-sm text-center mb-6 px-4">
              {mode === 'enable' 
                ? 'Draw an unlock pattern to secure Adult Mode. You will need this pattern to switch back.'
                : 'Draw your parental pattern to unlock Adult Mode.'
              }
            </p>
            
            <div className="h-[300px] w-full flex items-center justify-center">
              <PatternLock 
                size={260} 
                onComplete={handlePatternComplete} 
                error={error}
                success={success}
              />
            </div>

            <div className="mt-6 h-6 flex items-center justify-center w-full">
              <AnimatePresence mode="wait">
                {feedbackMsg ? (
                  <motion.p
                    key={feedbackMsg}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={`text-sm font-bold ${error ? 'text-red-400' : success ? 'text-emerald-400' : 'text-slate-400'}`}
                  >
                    {feedbackMsg}
                  </motion.p>
                ) : (
                  <motion.p
                    key="default"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-xs text-slate-500 uppercase tracking-widest font-semibold"
                  >
                    Draw your pattern
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
            
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ParentalGateModal;
