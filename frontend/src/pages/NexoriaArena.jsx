import React, { useState, useEffect } from 'react';
import { Maximize2, Shield, AlertTriangle, Swords, Trophy, Flame, Gamepad2, ChevronRight, Play, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import SEO from '../components/SEO';
import { motion, AnimatePresence } from 'framer-motion';
import { useGetActiveArenaGamesQuery } from '../features/arenaGame/arenaGameApiSlice';

const NexoriaArena = () => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const { data: gamesRes, isLoading } = useGetActiveArenaGamesQuery();
  const [activeGame, setActiveGame] = useState(null);
  const navigate = useNavigate();

  const games = gamesRes?.data || [];

  useEffect(() => {
    // Set the first game as active initially
    if (games.length > 0 && !activeGame) {
      setActiveGame(games[0]);
    }
  }, [games, activeGame]);

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

  const getEmbedUrl = (url) => {
    if (!url) return '';
    try {
      const urlObj = new URL(url);
      if (urlObj.hostname.includes('crazygames.com')) {
        if (urlObj.pathname.startsWith('/game/')) {
          return url.replace('/game/', '/embed/');
        }
      }
      return url;
    } catch (e) {
      return url;
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white md:pt-24 pb-20 md:pb-12 px-0 md:px-4 relative flex flex-col items-center font-jakarta">
      <SEO title={activeGame ? `${activeGame.title} | Nexoria Arena` : "Nexoria Arena | Live Gaming"} />
      
      {/* 📱 MOBILE EXCLUSIVE: STICKY HEADER */}
      <div className="md:hidden sticky top-0 z-50 bg-[#050505]/90 backdrop-blur-3xl border-b border-white/5 pt-4 pb-3 px-4 shadow-2xl w-full mb-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-all active:scale-95 border border-white/5">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500 uppercase tracking-widest leading-tight">Nexoria Arena</h1>
            <p className="text-[9px] font-bold uppercase tracking-widest text-amber-500/80 flex items-center gap-1"><AlertTriangle className="w-2.5 h-2.5" /> Live Games</p>
          </div>
        </div>
      </div>

      {/* 💻 DESKTOP EXCLUSIVE: HERO TEXT */}
      <div className="hidden md:block text-center mb-10 max-w-2xl mx-auto w-full">
        <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-orange-500 uppercase tracking-widest drop-shadow-[0_0_15px_rgba(220,38,38,0.5)] mb-2">
          Nexoria Arena
        </h1>
        <p className="text-slate-400 font-medium flex items-center justify-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-500" /> Action-Packed Live Games
        </p>
      </div>

      <div className="w-full max-w-7xl flex flex-col-reverse lg:grid lg:grid-cols-4 gap-4 md:gap-6 px-3 md:px-0">
        
        {/* Game Sidebar / Selector */}
        <div className="lg:col-span-1 bg-transparent md:bg-[#111] md:border border-white/5 rounded-3xl md:p-4 h-fit md:max-h-[600px] overflow-visible md:overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-track]:bg-transparent">
          <h3 className="hidden md:flex font-black text-lg text-white mb-4 px-2 uppercase tracking-wide items-center gap-2">
            <Gamepad2 className="w-5 h-5 text-primary" /> Select Arena
          </h3>
          <h3 className="md:hidden font-black text-sm text-white/50 mb-2 px-1 uppercase tracking-wider flex items-center gap-1">
            <Gamepad2 className="w-4 h-4 text-red-500/50" /> Available Games
          </h3>
          
          {isLoading ? (
            <div className="flex justify-center py-6 md:py-10"><div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div></div>
          ) : games.length === 0 ? (
            <div className="text-center py-6 md:py-10 text-slate-500 text-sm">No games available at the moment.</div>
          ) : (
            <div className="flex flex-row lg:flex-col gap-3 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 hide-scrollbar snap-x snap-mandatory">
              {games.map(game => (
                <button
                  key={game._id}
                  onClick={() => setActiveGame(game)}
                  className={`snap-start shrink-0 w-[220px] lg:w-full text-left p-2.5 md:p-3 rounded-2xl flex items-center gap-2.5 md:gap-3 transition-all duration-300 active:scale-[0.98] lg:active:scale-100 ${
                    activeGame?._id === game._id 
                      ? 'bg-gradient-to-r from-red-900/40 to-transparent border border-red-500/30 shadow-[0_0_15px_rgba(220,38,38,0.15)]' 
                      : 'bg-white/5 md:bg-transparent hover:bg-white/5 border border-white/5 md:border-transparent'
                  }`}
                >
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl overflow-hidden bg-black/50 shrink-0 relative group">
                    <img src={game.thumbnail || '/default-game.jpg'} alt={game.title} className="w-full h-full object-cover" onError={(e) => { e.target.src = 'https://via.placeholder.com/150?text=Game'; }} />
                    {activeGame?._id !== game._id && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                        <Play className="w-4 h-4 md:w-5 md:h-5 text-white" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className={`font-bold truncate text-[13px] md:text-sm ${activeGame?._id === game._id ? 'text-red-400' : 'text-white'}`}>{game.title}</h4>
                    <p className="text-[10px] md:text-xs text-slate-500 truncate">{game.description}</p>
                  </div>
                  {activeGame?._id === game._id && (
                    <ChevronRight className="hidden md:block w-4 h-4 text-red-500 shrink-0" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Main Game Container */}
        <div className="lg:col-span-3">
          <AnimatePresence mode="wait">
            {activeGame ? (
              <motion.div 
                key={activeGame._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="w-full bg-[#111] border border-white/10 rounded-2xl md:rounded-3xl p-1.5 md:p-2 shadow-2xl shadow-red-900/20 relative group"
              >
                <div className="absolute -top-3 -right-3 md:-top-4 md:-right-4 z-10">
                  <button 
                    onClick={toggleFullscreen}
                    className="p-2.5 md:p-3 bg-red-600 hover:bg-red-500 text-white rounded-full shadow-lg shadow-red-600/30 transition-transform hover:scale-110 active:scale-90"
                    title="Toggle Fullscreen"
                  >
                    <Maximize2 className="w-4 h-4 md:w-5 md:h-5" />
                  </button>
                </div>

                <div className="w-full aspect-square sm:aspect-video min-h-[300px] md:min-h-[400px] bg-black rounded-xl md:rounded-2xl overflow-hidden relative">
                  <iframe 
                    src={getEmbedUrl(activeGame.iframeUrl)} 
                    className="w-full h-full border-none bg-black"
                    title={activeGame.title}
                    allow="autoplay; fullscreen; focus-without-user-activation *;"
                    sandbox="allow-scripts allow-popups allow-forms allow-downloads"
                    allowFullScreen
                  ></iframe>
                </div>
                
                <div className="p-3 md:p-4 mt-1 md:mt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 md:gap-4">
                  <div>
                    <h2 className="text-xl md:text-2xl font-black text-white">{activeGame.title}</h2>
                    <p className="text-slate-400 mt-1 md:mt-2 text-[11px] md:text-sm leading-relaxed line-clamp-2 md:line-clamp-none">{activeGame.description}</p>
                  </div>
                  
                  {activeGame.iframeUrl?.includes('crazygames.com') && (
                    <a 
                      href={activeGame.iframeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 md:px-4 py-2 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white rounded-lg md:rounded-xl text-[11px] md:text-sm font-bold transition-all active:scale-95 flex items-center justify-center gap-2 border border-white/10 shrink-0"
                    >
                      <Play className="w-3 h-3 md:w-4 md:h-4" /> Play Original
                    </a>
                  )}
                </div>
              </motion.div>
            ) : (
              <div className="w-full aspect-video bg-[#111] border border-white/5 rounded-2xl md:rounded-3xl flex flex-col items-center justify-center text-slate-500">
                <Gamepad2 className="w-12 h-12 md:w-16 md:h-16 mb-4 opacity-50 text-red-500" />
                <p className="text-sm md:text-base px-4 text-center">Select a game from the list to start playing</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Instructions & Aura Integration */}
      <div className="w-full max-w-7xl mt-6 md:mt-10 grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 px-3 md:px-0">
        <div className="lg:col-span-1 bg-[#111] border border-white/5 rounded-2xl md:rounded-3xl p-5 md:p-6">
          <h3 className="text-base md:text-lg font-bold flex items-center gap-2 mb-3 md:mb-4 text-red-400 uppercase tracking-wider">
            <Shield className="w-4 h-4 md:w-5 md:h-5" /> Quick Tips
          </h3>
          <ul className="space-y-2.5 md:space-y-3 text-[11px] md:text-sm text-slate-300 font-medium leading-relaxed">
            <li className="flex items-start gap-2">
              <span className="text-red-500 font-black shrink-0">&gt;</span> 
              <span>Click the Fullscreen button on the top right for the best experience.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-500 font-black shrink-0">&gt;</span> 
              <span>Controls depend on the specific game selected. Use WASD/Arrows generally.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-500 font-black shrink-0">&gt;</span> 
              <span>Performance might vary depending on your device and internet connection.</span>
            </li>
          </ul>
        </div>

        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
          <Link to="/aura/battle" className="group flex flex-col items-center justify-center gap-1.5 md:gap-2 p-5 md:p-6 bg-gradient-to-br from-rose-900/20 to-purple-900/20 border border-rose-500/20 md:border-rose-500/30 rounded-2xl md:rounded-3xl hover:border-rose-400 hover:shadow-[0_0_20px_rgba(225,29,72,0.3)] transition-all active:scale-[0.98] md:active:scale-100">
            <Swords className="w-8 h-8 md:w-10 md:h-10 text-rose-500 group-hover:scale-110 transition-transform" />
            <h3 className="text-base md:text-lg font-black text-rose-100 uppercase tracking-widest">Aura Battle</h3>
            <p className="text-[10px] md:text-xs text-rose-300/70 text-center font-medium max-w-[250px]">Vote for your favorite apps in real-time head-to-head battles!</p>
          </Link>
          <Link to="/aura" className="group flex flex-col items-center justify-center gap-1.5 md:gap-2 p-5 md:p-6 bg-gradient-to-br from-amber-900/20 to-orange-900/20 border border-amber-500/20 md:border-amber-500/30 rounded-2xl md:rounded-3xl hover:border-amber-400 hover:shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all active:scale-[0.98] md:active:scale-100">
            <Flame className="w-8 h-8 md:w-10 md:h-10 text-amber-500 group-hover:scale-110 transition-transform" />
            <h3 className="text-base md:text-lg font-black text-amber-100 uppercase tracking-widest">Leaderboard</h3>
            <p className="text-[10px] md:text-xs text-amber-300/70 text-center font-medium max-w-[250px]">See the most hyped items with 999+ Aura ranking.</p>
          </Link>
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}} />
    </div>
  );
};

export default NexoriaArena;
