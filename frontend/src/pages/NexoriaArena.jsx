import React, { useState, useEffect } from 'react';
import { Maximize2, Shield, AlertTriangle, Swords, Trophy, Flame } from 'lucide-react';
import { Link } from 'react-router-dom';
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
      {/* Aura System Integration */}
      <div className="max-w-3xl w-full mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link to="/aura/battle" className="group flex flex-col items-center justify-center gap-2 p-6 bg-gradient-to-br from-rose-900/20 to-purple-900/20 border border-rose-500/30 rounded-2xl hover:border-rose-400 hover:shadow-[0_0_20px_rgba(225,29,72,0.3)] transition-all">
          <Swords className="w-10 h-10 text-rose-500 group-hover:scale-110 transition-transform" />
          <h3 className="text-lg font-black text-rose-100 uppercase tracking-widest">Aura Battle</h3>
          <p className="text-xs text-rose-300/70 text-center font-medium">Vote for your favorite apps in real-time head-to-head battles!</p>
        </Link>
        <Link to="/aura" className="group flex flex-col items-center justify-center gap-2 p-6 bg-gradient-to-br from-amber-900/20 to-orange-900/20 border border-amber-500/30 rounded-2xl hover:border-amber-400 hover:shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all">
          <Flame className="w-10 h-10 text-amber-500 group-hover:scale-110 transition-transform" />
          <h3 className="text-lg font-black text-amber-100 uppercase tracking-widest">Aura Leaderboard</h3>
          <p className="text-xs text-amber-300/70 text-center font-medium">See the most hyped items with 999+ Aura ranking.</p>
        </Link>
      </div>
    </div>
  );
};

export default NexoriaArena;
