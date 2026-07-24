import React, { useEffect, useState } from 'react';
import { X, Sliders, Waves, Activity, Shuffle } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { toggleCrossfade, setCrossfadeDuration } from '../features/music/nexoriaMusicSlice';

const EqualizerModal = ({ isOpen, onClose, isYouTube, updateEq }) => {
  const dispatch = useDispatch();
  const { crossfadeEnabled, crossfadeDuration } = useSelector(state => state.nexoriaMusic);
  const [eqVals, setEqVals] = useState({ bass: 0, mid: 0, treble: 0, reverb: 0 });

  useEffect(() => {
    if (updateEq) {
      updateEq(eqVals);
    }
  }, [eqVals, updateEq]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-800">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Sliders className="w-5 h-5 text-purple-400" /> Advanced EQ
          </h2>
          <button onClick={onClose} className="p-2 bg-slate-800 hover:bg-slate-700 rounded-full text-slate-400 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6">
          {isYouTube ? (
            <div className="text-center py-8 text-slate-400">
              <Waves className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Equalizer is not available for YouTube streams due to browser restrictions.</p>
              <p className="text-sm mt-2">Play an MP3 to use this feature.</p>
            </div>
          ) : (
            <div className="space-y-6">
              <EqSlider 
                label="Bass (250Hz)" 
                value={eqVals.bass} 
                min={-15} max={15} 
                onChange={(val) => setEqVals(prev => ({ ...prev, bass: parseFloat(val) }))} 
                color="bg-pink-500"
              />
              <EqSlider 
                label="Mid (1kHz)" 
                value={eqVals.mid} 
                min={-15} max={15} 
                onChange={(val) => setEqVals(prev => ({ ...prev, mid: parseFloat(val) }))} 
                color="bg-purple-500"
              />
              <EqSlider 
                label="Treble (4kHz)" 
                value={eqVals.treble} 
                min={-15} max={15} 
                onChange={(val) => setEqVals(prev => ({ ...prev, treble: parseFloat(val) }))} 
                color="bg-indigo-500"
              />
              
              <div className="pt-4 border-t border-slate-800">
                <EqSlider 
                  label="3D Surround (Reverb)" 
                  value={eqVals.reverb} 
                  min={0} max={1} step={0.01}
                  onChange={(val) => setEqVals(prev => ({ ...prev, reverb: parseFloat(val) }))} 
                  color="bg-teal-500"
                  icon={<Activity className="w-4 h-4" />}
                />
              </div>

              <div className="flex justify-center pt-2">
                <button 
                  onClick={() => setEqVals({ bass: 0, mid: 0, treble: 0, reverb: 0 })}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-full text-sm font-medium transition-colors"
                >
                  Reset Defaults
                </button>
              </div>

              {/* Crossfade Settings */}
              <div className="bg-black/30 rounded-xl p-4 border border-white/5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 text-white font-medium">
                    <Shuffle className="w-4 h-4 text-purple-400" />
                    <span>Audio Crossfade</span>
                  </div>
                  <button 
                    onClick={() => dispatch(toggleCrossfade())}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${crossfadeEnabled ? 'bg-green-500' : 'bg-white/20'}`}
                  >
                    <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${crossfadeEnabled ? 'translate-x-5' : 'translate-x-1'}`} />
                  </button>
                </div>
                
                {crossfadeEnabled && (
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-white/50 w-8">1s</span>
                    <input 
                      type="range" 
                      min="1" max="10" step="1"
                      value={crossfadeDuration}
                      onChange={(e) => dispatch(setCrossfadeDuration(Number(e.target.value)))}
                      className="flex-1 accent-green-500 h-1 bg-white/10 rounded-full appearance-none"
                    />
                    <span className="text-xs text-white w-8 text-right">{crossfadeDuration}s</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const EqSlider = ({ label, value, min, max, step = 1, onChange, color, icon }) => (
  <div className="space-y-2">
    <div className="flex justify-between text-sm text-slate-300 font-medium">
      <span className="flex items-center gap-1">{icon}{label}</span>
      <span>{value > 0 && max > 1 ? '+' : ''}{value}{max > 1 ? 'dB' : ''}</span>
    </div>
    <div className="relative flex items-center">
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-2 bg-slate-700 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full transition-all"
        style={{
          background: `linear-gradient(to right, var(--tw-colors-purple-500) 0%, transparent 0%)` // Tailwind handles this natively with accent-color usually, but custom styling is better
        }}
      />
    </div>
  </div>
);

export default EqualizerModal;
