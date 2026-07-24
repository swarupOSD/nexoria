import React, { useState } from 'react';
import { X, Moon, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

const SleepTimerModal = ({ isOpen, onClose, onSetTimer, currentTimer }) => {
  if (!isOpen) return null;

  const options = [
    { label: '5 minutes', minutes: 5 },
    { label: '15 minutes', minutes: 15 },
    { label: '30 minutes', minutes: 30 },
    { label: '45 minutes', minutes: 45 },
    { label: '1 hour', minutes: 60 },
    { label: 'End of track', minutes: 'track' },
  ];

  const handleSelect = (option) => {
    onSetTimer(option.minutes);
    if (option.minutes === 'track') {
      toast.success('Playback will stop after this track');
    } else {
      toast.success(`Sleep timer set for ${option.label}`);
    }
    onClose();
  };

  const handleTurnOff = () => {
    onSetTimer(null);
    toast.success('Sleep timer turned off');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-end sm:items-center justify-center p-4 pb-0 sm:pb-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-[#1E1B4B] sm:rounded-3xl rounded-t-3xl w-full max-w-sm overflow-hidden shadow-2xl animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Moon className="w-5 h-5 text-indigo-400" /> Sleep Timer
          </h2>
          <button onClick={onClose} className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-white/60 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-2 sm:p-4 flex flex-col max-h-[60vh] overflow-y-auto">
          {currentTimer && (
            <div className="mb-4 px-4 py-3 bg-indigo-500/20 rounded-lg flex items-center justify-between border border-indigo-500/30">
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-indigo-300">Timer is active</span>
                <span className="text-xs text-indigo-400/70">
                  {currentTimer.minutes === 'track' ? 'Stops after current track' : `Stops in ~${currentTimer.minutes} minutes`}
                </span>
              </div>
              <button 
                onClick={handleTurnOff}
                className="text-xs px-3 py-1.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-full font-bold transition-colors"
              >
                Turn off
              </button>
            </div>
          )}

          <div className="flex flex-col gap-1">
            {options.map((opt) => (
              <button
                key={opt.label}
                onClick={() => handleSelect(opt)}
                className="flex items-center justify-between w-full px-4 py-3 text-left hover:bg-white/5 rounded-lg transition-colors group"
              >
                <span className="text-white/90 font-medium group-hover:text-white transition-colors">{opt.label}</span>
                <Clock className="w-4 h-4 text-white/30 group-hover:text-white/60 transition-colors" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SleepTimerModal;
