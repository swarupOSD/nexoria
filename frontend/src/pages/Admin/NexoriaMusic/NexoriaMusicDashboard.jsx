import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Music, Mic2, Disc3, ListMusic, Settings, BarChart2 } from 'lucide-react';
import NexoriaArtistsManager from './NexoriaArtistsManager';
import NexoriaGenresManager from './NexoriaGenresManager';
import NexoriaAlbumsManager from './NexoriaAlbumsManager';
import NexoriaTracksManager from './NexoriaTracksManager';
import NexoriaAnalyticsManager from './NexoriaAnalyticsManager';
import { useNavigate } from 'react-router-dom';

const NexoriaMusicDashboard = () => {
  const [activeTab, setActiveTab] = useState('insights');
  const navigate = useNavigate();

  const navItems = [
    { id: 'insights', label: 'Insights', icon: BarChart2 },
    { id: 'artists', label: 'Artists', icon: Mic2 },
    { id: 'tracks', label: 'Tracks', icon: Music },
    { id: 'albums', label: 'Albums', icon: Disc3 },
    { id: 'genres', label: 'Genres', icon: ListMusic },
  ];

  return (
    <div className="flex flex-col h-screen bg-[#121212] text-white font-poppins selection:bg-[#1ed760] selection:text-black">
      
      {/* Mobile Top Header */}
      <header className="flex items-center justify-between px-4 py-4 bg-[#121212] sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#1ed760] flex items-center justify-center font-bold text-black text-xl shadow-[0_0_15px_rgba(30,215,96,0.3)]">
            N
          </div>
          <h1 className="text-xl font-bold tracking-tight">Nexoria Music Admin</h1>
        </div>
        <button 
          onClick={() => navigate('/superadmin')}
          className="p-2 text-[#b3b3b3] hover:text-white transition-colors"
          title="Back to Superadmin"
        >
          <Settings className="w-6 h-6" />
        </button>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto custom-scrollbar relative z-10 px-4 pb-24 sm:pb-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-[1920px] mx-auto pt-4"
          >
            {activeTab === 'insights' && <NexoriaAnalyticsManager />}
            {activeTab === 'artists' && <NexoriaArtistsManager />}
            {activeTab === 'genres' && <NexoriaGenresManager />}
            {activeTab === 'albums' && <NexoriaAlbumsManager />}
            {activeTab === 'tracks' && <NexoriaTracksManager />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Mobile Bottom Navigation (Spotify Mobile Style) */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 h-[65px] bg-gradient-to-t from-black via-black/95 to-black/80 backdrop-blur-lg border-t border-white/5 flex items-center justify-around z-50 px-2 pb-safe shadow-[0_-5px_20px_rgba(0,0,0,0.5)]">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center w-[20%] gap-1 transition-colors ${
                isActive ? 'text-white' : 'text-[#b3b3b3] hover:text-white'
              }`}
            >
              <Icon className={`w-6 h-6 ${isActive ? 'text-white' : 'text-[#b3b3b3]'}`} />
              <span className="text-[10px] font-medium tracking-wide">{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Desktop Sidebar (Optional fallback if user is on huge screen, but matching the mobile-first ethos) */}
      <div className="hidden sm:flex fixed bottom-0 left-0 right-0 h-[70px] bg-[#181818] border-t border-white/5 items-center justify-center gap-8 z-50">
         {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full transition-colors ${
                isActive ? 'bg-white text-black font-bold' : 'text-[#b3b3b3] hover:text-white font-medium hover:bg-[#282828]'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-sm">{item.label}</span>
            </button>
          );
        })}
      </div>

    </div>
  );
};

export default NexoriaMusicDashboard;
