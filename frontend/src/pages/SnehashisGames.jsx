import React from 'react';
import { motion } from 'framer-motion';
import { Gamepad2, Sparkles, Code, Terminal, Star, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const games = [
  {
    id: 'ludo-pro',
    title: 'Ludo Pro Max',
    description: 'A masterpiece 3D Ludo game with real-time multiplayer, AI opponents, stunning animations, and immersive sound effects.',
    image: 'https://images.unsplash.com/photo-1610890716171-6b1bb98ffaed?q=80&w=800&auto=format&fit=crop',
    status: 'Play Now',
    color: 'from-purple-500 to-indigo-600',
    shadow: 'shadow-purple-500/20'
  },
  {
    id: 'future-game-1',
    title: 'Project Neon',
    description: 'An upcoming cyberpunk racing experience with high-speed chases and neon-lit tracks.',
    image: 'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?q=80&w=800&auto=format&fit=crop',
    status: 'In Development',
    color: 'from-cyan-500 to-blue-600',
    shadow: 'shadow-cyan-500/20'
  }
];

const SnehashisGames = () => {
  return (
    <div className="min-h-screen bg-[#0F172A] relative overflow-hidden text-slate-200 selection:bg-purple-500/30">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/20 blur-[120px] rounded-full mix-blend-screen animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-600/20 blur-[120px] rounded-full mix-blend-screen animate-pulse" style={{ animationDelay: '2s' }}></div>
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+CjxwYXRoIGQ9Ik00MCAwSDB2NDBoNDBWMHptLTEgMWwtMzggMzhWMmgzOHYzN3oiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wMykiLz4KPC9zdmc+')] opacity-20"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20 relative z-10">
        
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-6 backdrop-blur-md"
          >
            <Sparkles className="w-5 h-5 text-purple-400" />
            <span className="text-sm font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-cyan-400">
              Exclusive Developer Hub
            </span>
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl md:text-7xl font-black mb-6 tracking-tight"
          >
            Snehashis <br className="md:hidden" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 via-fuchsia-500 to-cyan-500 drop-shadow-[0_0_15px_rgba(168,85,247,0.4)]">
              Game Zone
            </span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg md:text-xl text-slate-400 leading-relaxed"
          >
            Welcome to my personal arcade. Experience the games I've crafted from scratch, pushing the boundaries of web technology and interactive design.
          </motion.p>
        </div>

        {/* Stats Row */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16"
        >
          {[
            { label: 'Games Built', value: '1', icon: Gamepad2, color: 'text-purple-400' },
            { label: 'Lines of Code', value: '10K+', icon: Code, color: 'text-cyan-400' },
            { label: 'Technologies', value: 'React + Node', icon: Terminal, color: 'text-fuchsia-400' },
            { label: 'Player Rating', value: '5.0', icon: Star, color: 'text-amber-400' }
          ].map((stat, idx) => (
            <div key={idx} className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md flex flex-col items-center justify-center text-center group hover:bg-white/10 transition-colors">
              <stat.icon className={`w-8 h-8 ${stat.color} mb-3 group-hover:scale-110 transition-transform`} />
              <h3 className="text-2xl font-bold text-white mb-1">{stat.value}</h3>
              <p className="text-sm font-medium text-slate-400">{stat.label}</p>
            </div>
          ))}
        </motion.div>

        {/* Games Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
          {games.map((game, idx) => (
            <motion.div
              key={game.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.4 + (idx * 0.1) }}
              className={`group relative rounded-3xl overflow-hidden bg-slate-900 border border-white/10 shadow-2xl hover:shadow-[0_0_30px_rgba(0,0,0,0.5)] transition-all duration-500 hover:-translate-y-2`}
            >
              {/* Image Container */}
              <div className="relative h-64 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent z-10"></div>
                <img 
                  src={game.image} 
                  alt={game.title} 
                  className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 opacity-80 group-hover:opacity-100"
                />
                <div className="absolute top-4 right-4 z-20">
                  <span className="px-3 py-1 rounded-full bg-black/50 backdrop-blur-md border border-white/20 text-xs font-bold text-white uppercase tracking-wider">
                    {game.status}
                  </span>
                </div>
              </div>

              {/* Content Container */}
              <div className="p-8 relative z-20">
                <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r opacity-50 group-hover:opacity-100 transition-opacity duration-300 ${game.color}`}></div>
                
                <h3 className="text-3xl font-black text-white mb-3 tracking-tight group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-slate-400 transition-all">
                  {game.title}
                </h3>
                
                <p className="text-slate-400 mb-8 line-clamp-3 leading-relaxed">
                  {game.description}
                </p>

                {game.status === 'Play Now' ? (
                  <Link 
                    to={game.id === 'ludo-pro' ? `/snehashis-games/ludo-pro/${Math.random().toString(36).substring(7)}` : '#'}
                    className={`w-full py-4 rounded-xl bg-gradient-to-r ${game.color} text-white font-bold text-lg flex items-center justify-center gap-2 hover:brightness-110 transition-all ${game.shadow} shadow-lg active:scale-[0.98]`}
                  >
                    Play Now
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                ) : (
                  <button className={`w-full py-4 rounded-xl bg-gradient-to-r ${game.color} text-white font-bold text-lg flex items-center justify-center gap-2 hover:brightness-110 transition-all ${game.shadow} shadow-lg active:scale-[0.98] opacity-70 cursor-not-allowed`}>
                    Join Waitlist
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default SnehashisGames;
