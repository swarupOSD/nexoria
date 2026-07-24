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
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose}></div>
      <div className="relative bg-[#0F0F23]/95 backdrop-blur-2xl sm:rounded-3xl rounded-t-3xl w-full max-w-sm overflow-hidden shadow-[0_0_50px_rgba(79,70,229,0.15)] border border-indigo-500/20 animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200">
        
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
        <div className="p-4 flex flex-col max-h-[60vh] overflow-y-auto hide-scrollbar">
          {currentTimer && (
            <div className="mb-6 p-4 bg-indigo-500/10 rounded-2xl flex items-center justify-between border border-indigo-500/30 shadow-[0_0_30px_rgba(99,102,241,0.1)] relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/0 via-indigo-500/5 to-indigo-500/0 animate-pulse"></div>
              <div className="flex flex-col relative z-10">
                <span className="text-sm font-bold text-indigo-300 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-indigo-400 animate-ping"></div> Active
                </span>
                <span className="text-xs text-indigo-200 mt-1">
                  {currentTimer.minutes === 'track' ? 'Stops after current track' : `Stops in ~${currentTimer.minutes} minutes`}
                </span>
              </div>
              <button 
                onClick={handleTurnOff}
                className="relative z-10 text-xs px-4 py-2 bg-white/10 hover:bg-red-500/20 text-white hover:text-red-400 rounded-full font-bold transition-colors border border-white/10 hover:border-red-500/30"
              >
                Turn off
              </button>
            </div>
          )}

          <div className="flex flex-col gap-2">
            {options.map((opt) => {
              const isSelected = currentTimer?.minutes === opt.minutes;
              return (
                <button
                  key={opt.label}
                  onClick={() => handleSelect(opt)}
                  className={`flex items-center justify-between w-full px-5 py-4 text-left rounded-xl transition-all duration-300 group ${
                    isSelected 
                      ? 'bg-indigo-500/20 border border-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.2)]' 
                      : 'bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10'
                  }`}
                >
                  <span className={`font-medium transition-colors ${isSelected ? 'text-indigo-300' : 'text-white/80 group-hover:text-white'}`}>
                    {opt.label}
                  </span>
                  <Clock className={`w-5 h-5 transition-colors ${isSelected ? 'text-indigo-400' : 'text-white/30 group-hover:text-white/60'}`} />
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SleepTimerModal;
