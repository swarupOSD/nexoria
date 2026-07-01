import React, { useState, useEffect } from 'react';
import { Maximize2, Shield, AlertTriangle } from 'lucide-react';
import SEO from '../components/SEO';
import { motion } from 'framer-motion';

const NexoriaArena = () => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    const elem = document.documentElement;
    if (!document.fullscreenElement) {
      elem.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  return (
    <div className="min-h-screen bg-[#050505] text-white pt-24 pb-12 px-4 relative flex flex-col items-center">
      <SEO title="Nexoria Arena | Live Fighting Game" />
      
      <div className="text-center mb-6 max-w-2xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-orange-500 uppercase tracking-widest drop-shadow-[0_0_15px_rgba(220,38,38,0.5)] mb-2">
          Nexoria Arena
        </h1>
        <p className="text-slate-400 font-medium flex items-center justify-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-500" /> Action-Packed Fighting Game 
        </p>
      </div>

      {/* Game Container */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-5xl bg-[#111] border border-white/10 rounded-3xl p-2 shadow-2xl shadow-red-900/20 relative group"
      >
        <div className="absolute -top-4 -right-4 z-10">
          <button 
            onClick={toggleFullscreen}
            className="p-3 bg-red-600 hover:bg-red-500 text-white rounded-full shadow-lg shadow-red-600/30 transition-transform hover:scale-110 active:scale-95"
            title="Toggle Fullscreen"
          >
            <Maximize2 className="w-5 h-5" />
          </button>
        </div>

        <div className="w-full aspect-square md:aspect-video min-h-[350px] bg-black rounded-2xl overflow-hidden relative">
          {/* We are embedding Smash Karts via GamePix API */}
          <iframe 
            src="https://play.gamepix.com/smash-karts/embed" 
            className="w-full h-full border-none"
            title="Nexoria Arena Fighter"
            allow="autoplay; fullscreen; focus-without-user-activation *;"
            allowFullScreen
          ></iframe>
        </div>
      </motion.div>

      {/* Instructions */}
      <div className="max-w-3xl w-full mt-10 bg-[#111] border border-white/5 rounded-2xl p-6 md:p-8">
        <h3 className="text-xl font-bold flex items-center gap-2 mb-4 text-red-400">
          <Shield className="w-5 h-5" /> How to Play
        </h3>
        <ul className="space-y-3 text-slate-300 font-medium">
          <li className="flex items-start gap-2">
            <span className="text-red-500 font-black">&gt;</span> 
            Use W, A, S, D or Arrows to drive your kart.
          </li>
          <li className="flex items-start gap-2">
            <span className="text-red-500 font-black">&gt;</span> 
            Press SPACEBAR to fire weapons and destroy other players!
          </li>
          <li className="flex items-start gap-2">
            <span className="text-red-500 font-black">&gt;</span> 
            Drive over boxes to collect powerful weapons.
          </li>
          <li className="flex items-start gap-2">
            <span className="text-red-500 font-black">&gt;</span> 
            Use the Fullscreen button for the best fighting experience!
          </li>
        </ul>
      </div>
    </div>
  );
};

export default NexoriaArena;
