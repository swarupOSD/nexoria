import React, { useState, useEffect } from 'react';
import { X, Lock, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';


const ParentalGateModal = ({ isOpen, onClose, mode, onSuccess }) => {
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [step, setStep] = useState(1);

  useEffect(() => {
    if (isOpen) {
      setPin('');
      setConfirmPin('');
      setStep(1);
    }
  }, [isOpen, mode]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (mode === 'enable') {
      if (step === 1) {
        if (pin.length < 4) return;
        setStep(2);
      } else {
        if (pin !== confirmPin) { setPin(''); setConfirmPin(''); setStep(1); return; }
        localStorage.setItem('kidsPin', pin);
        onSuccess(); onClose();
      }
    } else {
      const saved = localStorage.getItem('kidsPin');
      if (!saved || saved === pin) { onSuccess(); onClose(); }
      else { setPin(''); }
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
                ? (step === 1 ? 'Set a 4-digit PIN to secure Adult Mode.' : 'Confirm your PIN.')
                : 'Enter your PIN to unlock Adult Mode.'
              }
            </p>
            <form onSubmit={handleSubmit} className="w-full flex flex-col items-center gap-4">
              <input
                type="password"
                inputMode="numeric"
                maxLength={6}
                value={step === 2 ? confirmPin : pin}
                onChange={(e) => step === 2 ? setConfirmPin(e.target.value.replace(/\D/g,'')) : setPin(e.target.value.replace(/\D/g,''))}
                placeholder="Enter PIN"
                className="w-48 text-center text-2xl tracking-[0.5em] font-bold bg-white/5 border border-white/20 rounded-2xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-purple-500 transition-colors"
                autoFocus
              />
              <button type="submit" className="w-full max-w-xs py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-2xl hover:opacity-90 transition-opacity active:scale-95">
                {mode === 'enable' ? (step === 1 ? 'Next' : 'Confirm') : 'Unlock'}
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ParentalGateModal;
