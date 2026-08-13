import React, { useState, useEffect } from 'react';
import { Maximize2, Shield, AlertTriangle, Swords, Flame, Gamepad2, Play, ArrowLeft, Radio, Users } from 'lucide-react';
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
    <div className="min-h-screen bg-background text-on-surface pb-20 md:pb-12 relative flex flex-col items-center font-body-md overflow-x-hidden selection:bg-primary-container selection:text-on-primary-container">
      <SEO title={activeGame ? `${activeGame.title} | Nexoria Arena` : "Nexoria Arena | Live Gaming"} />
      
      {/* 📱 MOBILE EXCLUSIVE: STICKY HEADER */}
      <div className="md:hidden sticky top-0 z-50 bg-background/90 backdrop-blur-3xl border-b border-outline-variant/30 pt-4 pb-3 px-4 shadow-2xl w-full mb-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface transition-all active:scale-95 border border-outline-variant/30">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h1 className="font-display-lg text-xl text-primary leading-tight tracking-tight uppercase">Nexoria Arena</h1>
            <p className="font-label-sm text-[9px] uppercase tracking-widest text-error flex items-center gap-1"><Radio className="w-2.5 h-2.5" /> Live Matches</p>
          </div>
        </div>
      </div>

      {/* 💻 DESKTOP EXCLUSIVE: HERO HEADER */}
      <div className="hidden md:block w-full relative h-[300px] md:h-[400px] mb-8 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-cover bg-center opacity-40 blur-sm" style={{ backgroundImage: `url(${activeGame?.thumbnail || '/default-hero.jpg'})` }}></div>
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/20"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/50 to-transparent"></div>
        </div>
        
        <div className="relative z-10 w-full max-w-container-max mx-auto h-full flex flex-col justify-end px-4 md:px-margin-desktop pb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-error/10 border border-error/30 text-error font-label-sm text-[10px] uppercase tracking-widest rounded-full mb-4 w-max backdrop-blur-md">
            <Radio className="w-3 h-3 animate-pulse" /> Live Now
          </div>
          <h1 className="font-display-lg text-5xl md:text-7xl text-on-surface uppercase tracking-tight mb-2 drop-shadow-2xl">
            NEXORIA <span className="text-primary italic font-light">ARENA</span>
          </h1>
          <p className="font-body-md text-on-surface-variant text-lg max-w-xl">
            Join active rooms, compete in multiplayer arenas, and climb the global ranks.
          </p>
        </div>
      </div>

      <div className="w-full max-w-container-max mx-auto flex flex-col-reverse lg:grid lg:grid-cols-12 gap-6 md:gap-8 px-4 md:px-margin-desktop mt-4 md:mt-0">
        
        {/* Main Game Container */}
        <div className="lg:col-span-8 flex flex-col">
          <AnimatePresence mode="wait">
            {activeGame ? (
              <motion.div 
                key={activeGame._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="w-full bg-surface-container-low border border-outline-variant/30 rounded-2xl md:rounded-3xl p-1.5 md:p-2 shadow-2xl relative group overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none rounded-2xl"></div>
                
                <div className="absolute top-4 right-4 z-20 flex gap-2">
                  <button 
                    onClick={toggleFullscreen}
                    className="p-3 bg-surface-container-high/80 backdrop-blur-md hover:bg-surface-bright text-on-surface rounded border border-outline-variant/30 shadow-[0_0_15px_rgba(0,0,0,0.5)] transition-all hover:scale-105 active:scale-95 group/btn"
                    title="Toggle Fullscreen"
                  >
                    <Maximize2 className="w-4 h-4 md:w-5 md:h-5 group-hover/btn:text-primary transition-colors" />
                  </button>
                </div>

                <div className="w-full aspect-square sm:aspect-video min-h-[300px] md:min-h-[500px] bg-black rounded-xl md:rounded-2xl overflow-hidden relative z-10">
                  <iframe 
                    src={getEmbedUrl(activeGame.iframeUrl)} 
                    className="w-full h-full border-none bg-black"
                    title={activeGame.title}
                    allow="autoplay; fullscreen; focus-without-user-activation *;"
                    sandbox="allow-scripts allow-popups allow-forms allow-downloads"
                    allowFullScreen
                  ></iframe>
                </div>
                
                <div className="p-4 md:p-6 mt-2 relative z-10 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-label-sm text-[10px] text-primary uppercase tracking-widest px-2 py-0.5 bg-primary/10 border border-primary/20 rounded">Active Match</span>
                      <span className="font-label-sm text-[10px] text-on-surface-variant uppercase tracking-widest"><Users className="w-3 h-3 inline pb-0.5" /> Public Room</span>
                    </div>
                    <h2 className="font-display-lg text-2xl md:text-3xl text-on-surface mb-2">{activeGame.title}</h2>
                    <p className="font-body-md text-on-surface-variant text-sm leading-relaxed max-w-2xl">{activeGame.description}</p>
                  </div>
                  
                  {activeGame.iframeUrl?.includes('crazygames.com') && (
                    <a 
                      href={activeGame.iframeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-6 py-3 bg-surface-container hover:bg-surface-container-high text-on-surface rounded font-label-sm text-xs uppercase tracking-widest transition-colors active:scale-95 flex items-center justify-center gap-2 border border-outline-variant/30 shrink-0 font-bold"
                    >
                      <Play className="w-4 h-4" /> Play Original
                    </a>
                  )}
                </div>
              </motion.div>
            ) : (
              <div className="w-full aspect-video bg-surface-container border border-outline-variant/30 rounded-2xl md:rounded-3xl flex flex-col items-center justify-center text-on-surface-variant shadow-inner">
                <Gamepad2 className="w-16 h-16 md:w-20 md:h-20 mb-6 opacity-20 text-primary" />
                <p className="font-display-lg text-lg md:text-xl text-center text-on-surface-variant">Select an arena room to begin</p>
                <p className="font-label-sm text-xs uppercase tracking-widest mt-2 text-on-surface-variant/50">Awaiting connection...</p>
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Game Sidebar / Selector (Live Rooms) */}
        <div className="lg:col-span-4 flex flex-col">
          <div className="bg-surface-container/50 backdrop-blur-xl border border-outline-variant/30 rounded-2xl md:rounded-3xl p-4 md:p-6 flex-1 flex flex-col">
            <h3 className="font-display-lg text-xl md:text-2xl text-on-surface mb-6 flex items-center gap-3">
              <span className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center border border-primary/20"><Radio className="w-4 h-4 text-primary animate-pulse" /></span>
              Live Rooms
            </h3>
            
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-10 flex-1">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                <span className="font-label-sm text-[10px] text-primary uppercase tracking-widest">Scanning Network...</span>
              </div>
            ) : games.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 flex-1 text-center">
                <Shield className="w-8 h-8 text-on-surface-variant/30 mb-3" />
                <p className="font-body-md text-on-surface-variant text-sm">No live rooms available.</p>
              </div>
            ) : (
              <div className="flex flex-row lg:flex-col gap-3 overflow-x-auto lg:overflow-y-auto no-scrollbar snap-x snap-mandatory pb-4 lg:pb-0 flex-1 lg:max-h-[600px]">
                {games.map(game => {
                  const isActive = activeGame?._id === game._id;
                  return (
                    <button
                      key={game._id}
                      onClick={() => setActiveGame(game)}
                      className={`snap-start shrink-0 w-[260px] lg:w-full text-left p-3 rounded-xl flex gap-4 transition-all duration-300 active:scale-[0.98] lg:active:scale-100 group relative overflow-hidden border ${
                        isActive 
                          ? 'bg-primary/10 border-primary/30 shadow-[0_0_20px_rgba(208,188,255,0.1)]' 
                          : 'bg-surface-container-low border-outline-variant/20 hover:border-outline-variant/50 hover:bg-surface-container'
                      }`}
                    >
                      {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary"></div>}
                      
                      <div className="w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden bg-surface-container-lowest shrink-0 relative">
                        <img 
                          src={game.thumbnail || '/default-game.jpg'} 
                          alt={game.title} 
                          className={`w-full h-full object-cover transition-transform duration-500 ${isActive ? 'scale-110' : 'group-hover:scale-105'}`} 
                          onError={(e) => { e.target.src = 'https://via.placeholder.com/150?text=Arena'; }} 
                        />
                        {!isActive && (
                          <div className="absolute inset-0 bg-background/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Play className="w-6 h-6 text-on-surface" />
                          </div>
                        )}
                        {isActive && (
                          <div className="absolute top-1 right-1">
                            <span className="flex h-2 w-2 relative">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-error opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-error"></span>
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col justify-center">
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className={`font-label-sm text-[9px] uppercase tracking-widest px-1.5 py-0.5 rounded border ${isActive ? 'border-primary/30 text-primary bg-primary/5' : 'border-outline-variant/30 text-on-surface-variant bg-surface-container'}`}>
                            {isActive ? 'Connected' : 'Join'}
                          </span>
                        </div>
                        <h4 className={`font-display-lg text-base truncate ${isActive ? 'text-primary' : 'text-on-surface'}`}>{game.title}</h4>
                        <p className="font-body-md text-xs text-on-surface-variant truncate mt-0.5">{game.description}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Instructions & Elite Ranks Integration */}
      <div className="w-full max-w-container-max mx-auto mt-8 md:mt-16 grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 px-4 md:px-margin-desktop">
        
        <div className="lg:col-span-1 bg-surface-container/30 backdrop-blur-md border border-outline-variant/30 rounded-2xl md:rounded-3xl p-6 md:p-8">
          <h3 className="font-display-lg text-xl md:text-2xl text-on-surface flex items-center gap-3 mb-6">
            <span className="w-8 h-8 rounded bg-secondary/10 flex items-center justify-center border border-secondary/20"><Shield className="w-4 h-4 text-secondary" /></span>
            Arena Rules
          </h3>
          <ul className="space-y-4">
            <li className="flex items-start gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary mt-2 shrink-0 shadow-[0_0_8px_rgba(204,232,228,0.8)]"></span>
              <span className="font-body-md text-sm text-on-surface-variant leading-relaxed">Expand the arena to full screen for maximum visibility and control precision.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary mt-2 shrink-0 shadow-[0_0_8px_rgba(204,232,228,0.8)]"></span>
              <span className="font-body-md text-sm text-on-surface-variant leading-relaxed">Controls are game-specific. Assume WASD or Arrow Keys for movement in most arenas.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary mt-2 shrink-0 shadow-[0_0_8px_rgba(204,232,228,0.8)]"></span>
              <span className="font-body-md text-sm text-on-surface-variant leading-relaxed">Latency depends on your local network connection to the arena servers.</span>
            </li>
          </ul>
        </div>

        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
          <Link to="/aura/battle" className="group flex flex-col justify-between p-6 md:p-8 bg-surface-container-low border border-outline-variant/30 rounded-2xl md:rounded-3xl hover:bg-surface-container transition-all active:scale-[0.98] relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 group-hover:-rotate-12">
              <Swords className="w-32 h-32" />
            </div>
            <div>
              <div className="w-12 h-12 rounded-xl bg-error/10 border border-error/20 flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(255,180,171,0.1)]">
                <Swords className="w-6 h-6 text-error group-hover:scale-110 transition-transform" />
              </div>
              <h3 className="font-display-lg text-2xl md:text-3xl text-on-surface mb-2 group-hover:text-error transition-colors">Aura Battle</h3>
              <p className="font-body-md text-sm text-on-surface-variant max-w-[250px] leading-relaxed">Enter the voting arena and decide the fate of Nexoria's top items.</p>
            </div>
            <div className="mt-8 font-label-sm text-[10px] text-error uppercase tracking-widest flex items-center gap-2">
              Enter Battleground <ArrowLeft className="w-3 h-3 rotate-180" />
            </div>
          </Link>
          
          <Link to="/aura" className="group flex flex-col justify-between p-6 md:p-8 bg-surface-container-low border border-outline-variant/30 rounded-2xl md:rounded-3xl hover:bg-surface-container transition-all active:scale-[0.98] relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 group-hover:rotate-12">
              <Flame className="w-32 h-32" />
            </div>
            <div>
              <div className="w-12 h-12 rounded-xl bg-tertiary/10 border border-tertiary/20 flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(239,184,200,0.1)]">
                <Flame className="w-6 h-6 text-tertiary group-hover:scale-110 transition-transform" />
              </div>
              <h3 className="font-display-lg text-2xl md:text-3xl text-on-surface mb-2 group-hover:text-tertiary transition-colors">Global Ranks</h3>
              <p className="font-body-md text-sm text-on-surface-variant max-w-[250px] leading-relaxed">View the absolute highest Aura-rated items across the ecosystem.</p>
            </div>
            <div className="mt-8 font-label-sm text-[10px] text-tertiary uppercase tracking-widest flex items-center gap-2">
              View Leaderboard <ArrowLeft className="w-3 h-3 rotate-180" />
            </div>
          </Link>
        </div>
      </div>
      
    </div>
  );
};

export default NexoriaArena;
