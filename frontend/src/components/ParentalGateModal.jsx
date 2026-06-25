import React, { useState, useEffect } from 'react';
import { X, Lock, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ParentalGateModal = ({ isOpen, onClose, mode, onSuccess }) => {
  const [pin, setPin] = useState('');
  const [mathAnswer, setMathAnswer] = useState('');
  const [num1, setNum1] = useState(0);
  const [num2, setNum2] = useState(0);
  const [error, setError] = useState('');

  // mode: 'enable' or 'disable'

  useEffect(() => {
    if (isOpen && mode === 'disable') {
      // Generate random math problem
      setNum1(Math.floor(Math.random() * 9) + 2); // 2-10
      setNum2(Math.floor(Math.random() * 9) + 2); // 2-10
      setMathAnswer('');
      setPin('');
      setError('');
    } else if (isOpen && mode === 'enable') {
      setPin('');
      setError('');
    }
  }, [isOpen, mode]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (mode === 'enable') {
      // Save PIN if provided (can be empty)
      if (pin && pin.length !== 4) {
        return setError('PIN must be exactly 4 digits');
      }
      if (pin) {
        localStorage.setItem('kidsPin', pin);
      } else {
        localStorage.removeItem('kidsPin');
      }
      onSuccess();
      onClose();
    } else {
      // Disable mode (Verify)
      const expectedAnswer = num1 * num2;
      if (parseInt(mathAnswer) !== expectedAnswer) {
        return setError('Incorrect math answer');
      }

      const savedPin = localStorage.getItem('kidsPin');
      if (savedPin && pin !== savedPin) {
        return setError('Incorrect PIN');
      }

      onSuccess();
      onClose();
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
          className="relative w-full max-w-md bg-[#1a1a1f] rounded-2xl border border-white/10 shadow-2xl overflow-hidden"
        >
          <div className="p-6 border-b border-white/5 flex items-center justify-between bg-black/20">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              {mode === 'enable' ? <ShieldCheck className="w-6 h-6 text-emerald-500" /> : <Lock className="w-6 h-6 text-amber-500" />}
              {mode === 'enable' ? 'Enable Kids Mode' : 'Parental Verification'}
            </h2>
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-white/5 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-bold rounded-xl text-center">
                {error}
              </div>
            )}

            {mode === 'enable' ? (
              <div className="space-y-4">
                <p className="text-slate-300 text-sm">
                  You are about to switch to Kids Mode. Everything except games will be locked. 
                  You can set an optional 4-digit PIN to prevent kids from switching back to Adult mode.
                </p>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-400">Set 4-Digit PIN (Optional)</label>
                  <input
                    type="password"
                    maxLength="4"
                    value={pin}
                    onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                    placeholder="e.g. 1234"
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-purple-500 transition-colors text-center text-2xl tracking-[0.5em]"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <p className="text-slate-300 text-sm text-center">
                  To switch back to Adult mode, please verify you are an adult.
                </p>

                <div className="space-y-2 text-center bg-black/20 p-4 rounded-xl border border-white/5">
                  <label className="text-sm font-bold text-slate-400 block mb-2">Solve this math problem:</label>
                  <div className="text-2xl font-black text-white mb-3">
                    {num1} &times; {num2} = ?
                  </div>
                  <input
                    type="number"
                    value={mathAnswer}
                    onChange={(e) => setMathAnswer(e.target.value)}
                    placeholder="Answer"
                    required
                    className="w-full max-w-[150px] mx-auto bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 transition-colors text-center text-xl font-bold"
                  />
                </div>

                {localStorage.getItem('kidsPin') && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-400 text-center block">Enter your 4-Digit PIN:</label>
                    <input
                      type="password"
                      maxLength="4"
                      value={pin}
                      onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                      placeholder="PIN"
                      required
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 transition-colors text-center text-2xl tracking-[0.5em]"
                    />
                  </div>
                )}
              </div>
            )}

            <button
              type="submit"
              className={`w-full py-3 px-4 rounded-xl font-bold text-white transition-all transform hover:-translate-y-0.5 shadow-lg ${
                mode === 'enable' 
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:shadow-emerald-500/25' 
                  : 'bg-gradient-to-r from-amber-500 to-orange-600 hover:shadow-amber-500/25'
              }`}
            >
              {mode === 'enable' ? 'Enable Kids Mode' : 'Verify & Unlock Adult Mode'}
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ParentalGateModal;
