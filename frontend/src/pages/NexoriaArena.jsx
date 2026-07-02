import React, { useState, useEffect } from 'react';
import { Maximize2, Shield, AlertTriangle, Swords, Trophy, Flame, Gamepad2, ChevronRight, Play } from 'lucide-react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import { motion, AnimatePresence } from 'framer-motion';
import { useGetActiveArenaGamesQuery } from '../features/arenaGame/arenaGameApiSlice';

const NexoriaArena = () => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const { data: gamesRes, isLoading } = useGetActiveArenaGamesQuery();
  const [activeGame, setActiveGame] = useState(null);

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
        // Convert /game/slug to /embed/slug
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
    <div className="min-h-screen bg-[#050505] text-white pt-24 pb-12 px-4 relative flex flex-col items-center">
      <SEO title={activeGame ? `${activeGame.title} | Nexoria Arena` : "Nexoria Arena | Live Gaming"} />
      
      <div className="text-center mb-10 max-w-2xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-orange-500 uppercase tracking-widest drop-shadow-[0_0_15px_rgba(220,38,38,0.5)] mb-2">
          Nexoria Arena
        </h1>
        <p className="text-slate-400 font-medium flex items-center justify-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-500" /> Action-Packed Live Games
        </p>
      </div>

      <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Game Sidebar / Selector */}
        <div className="lg:col-span-1 bg-[#111] border border-white/5 rounded-3xl p-4 h-fit max-h-[600px] overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-track]:bg-transparent">
          <h3 className="font-black text-lg text-white mb-4 px-2 uppercase tracking-wide flex items-center gap-2">
            <Gamepad2 className="w-5 h-5 text-primary" /> Select Arena
          </h3>
          
          {isLoading ? (
            <div className="flex justify-center py-10"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>
          ) : games.length === 0 ? (
            <div className="text-center py-10 text-slate-500 text-sm">No games available at the moment.</div>
          ) : (
            <div className="space-y-2">
              {games.map(game => (
                <button
                  key={game._id}
                  onClick={() => setActiveGame(game)}
                  className={`w-full text-left p-3 rounded-2xl flex items-center gap-3 transition-all duration-300 ${
                    activeGame?._id === game._id 
                      ? 'bg-gradient-to-r from-primary/20 to-transparent border border-primary/30 shadow-[0_0_15px_rgba(220,38,38,0.15)]' 
                      : 'hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-black/50 shrink-0 relative group">
                    <img src={game.thumbnail || '/default-game.jpg'} alt={game.title} className="w-full h-full object-cover" onError={(e) => { e.target.src = 'https://via.placeholder.com/150?text=Game'; }} />
                    {activeGame?._id !== game._id && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Play className="w-5 h-5 text-white" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className={`font-bold truncate text-sm ${activeGame?._id === game._id ? 'text-primary' : 'text-white'}`}>{game.title}</h4>
                    <p className="text-xs text-slate-500 truncate">{game.description}</p>
                  </div>
                  {activeGame?._id === game._id && (
                    <ChevronRight className="w-4 h-4 text-primary shrink-0" />
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
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="w-full bg-[#111] border border-white/10 rounded-3xl p-2 shadow-2xl shadow-red-900/20 relative group"
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

                <div className="w-full aspect-square md:aspect-video min-h-[400px] bg-black rounded-2xl overflow-hidden relative">
                  <iframe 
                    src={getEmbedUrl(activeGame.iframeUrl)} 
                    className="w-full h-full border-none bg-black"
                    title={activeGame.title}
                    allow="autoplay; fullscreen; focus-without-user-activation *;"
                    allowFullScreen
                  ></iframe>
                </div>
                
                <div className="p-4 mt-2">
                  <h2 className="text-2xl font-black text-white">{activeGame.title}</h2>
                  <p className="text-slate-400 mt-2 text-sm leading-relaxed">{activeGame.description}</p>
                </div>
              </motion.div>
            ) : (
              <div className="w-full aspect-video bg-[#111] border border-white/5 rounded-3xl flex flex-col items-center justify-center text-slate-500">
                <Gamepad2 className="w-16 h-16 mb-4 opacity-50" />
                <p>Select a game from the list to start playing</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Instructions & Aura Integration */}
      <div className="w-full max-w-7xl mt-10 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-[#111] border border-white/5 rounded-3xl p-6">
          <h3 className="text-lg font-bold flex items-center gap-2 mb-4 text-red-400">
            <Shield className="w-5 h-5" /> Quick Tips
          </h3>
          <ul className="space-y-3 text-sm text-slate-300 font-medium">
            <li className="flex items-start gap-2">
              <span className="text-red-500 font-black">&gt;</span> 
              Click the Fullscreen button on the top right for the best experience.
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-500 font-black">&gt;</span> 
              Controls depend on the specific game selected. Use WASD/Arrows generally.
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-500 font-black">&gt;</span> 
              Performance might vary depending on your device and internet connection.
            </li>
          </ul>
        </div>

        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link to="/aura/battle" className="group flex flex-col items-center justify-center gap-2 p-6 bg-gradient-to-br from-rose-900/20 to-purple-900/20 border border-rose-500/30 rounded-3xl hover:border-rose-400 hover:shadow-[0_0_20px_rgba(225,29,72,0.3)] transition-all">
            <Swords className="w-10 h-10 text-rose-500 group-hover:scale-110 transition-transform" />
            <h3 className="text-lg font-black text-rose-100 uppercase tracking-widest">Aura Battle</h3>
            <p className="text-xs text-rose-300/70 text-center font-medium">Vote for your favorite apps in real-time head-to-head battles!</p>
          </Link>
          <Link to="/aura" className="group flex flex-col items-center justify-center gap-2 p-6 bg-gradient-to-br from-amber-900/20 to-orange-900/20 border border-amber-500/30 rounded-3xl hover:border-amber-400 hover:shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all">
            <Flame className="w-10 h-10 text-amber-500 group-hover:scale-110 transition-transform" />
            <h3 className="text-lg font-black text-amber-100 uppercase tracking-widest">Leaderboard</h3>
            <p className="text-xs text-amber-300/70 text-center font-medium">See the most hyped items with 999+ Aura ranking.</p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NexoriaArena;
