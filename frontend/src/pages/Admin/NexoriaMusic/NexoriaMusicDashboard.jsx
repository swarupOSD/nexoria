import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Music, Mic2, Disc3, ListMusic, Settings, BarChart2, Users, Crown } from 'lucide-react';
import NexoriaArtistsManager from './NexoriaArtistsManager';
import NexoriaGenresManager from './NexoriaGenresManager';
import NexoriaAlbumsManager from './NexoriaAlbumsManager';
import NexoriaTracksManager from './NexoriaTracksManager';
import NexoriaAnalyticsManager from './NexoriaAnalyticsManager';
import NexoriaPlaylistBuilder from './NexoriaPlaylistBuilder';
import NexoriaPremiumManager from './NexoriaPremiumManager';
import { useNavigate } from 'react-router-dom';

const NexoriaMusicDashboard = () => {
  const [activeTab, setActiveTab] = useState('insights');
  const navigate = useNavigate();

  const navItems = [
    { id: 'insights', label: 'Insights', icon: BarChart2 },
    { id: 'artists', label: 'Artists', icon: Mic2 },
    { id: 'tracks', label: 'Tracks', icon: Music },
    { id: 'albums', label: 'Albums', icon: Disc3 },
    { id: 'playlists', label: 'Playlists', icon: ListMusic },
    { id: 'genres', label: 'Genres', icon: ListMusic },
    { id: 'revenue', label: 'Revenue & Premium', icon: Crown },
  ];

  return (
    <div className="flex flex-col h-screen bg-[#121212] text-white font-poppins selection:bg-[#1ed760] selection:text-black">
      
      {/* Top Header */}
      <header className="flex items-center justify-between px-6 py-5 bg-gradient-to-b from-[#121212] to-[#121212]/90 sticky top-0 z-50 border-b border-white/5 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-[#1ed760] flex items-center justify-center font-black text-black text-2xl shadow-[0_0_20px_rgba(30,215,96,0.4)]">
            N
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">Nexoria Admin</h1>
        </div>
        <button 
          onClick={() => navigate('/superadmin')}
          className="flex items-center gap-2 px-4 py-2 bg-[#282828] hover:bg-[#333] text-white rounded-full font-bold transition-all hover:scale-105"
          title="Back to Superadmin"
        >
          <Settings className="w-5 h-5" />
          <span className="hidden sm:inline text-sm">Settings</span>
        </button>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto custom-scrollbar relative z-10 px-6 pb-24 sm:pb-6">
        
        {/* Quick Actions Panel */}
        <div className="w-full max-w-[1920px] mx-auto mt-6 mb-8 flex items-center gap-3 overflow-x-auto custom-scrollbar pb-2">
           <button onClick={() => setActiveTab('tracks')} className="flex-shrink-0 flex items-center gap-2 px-5 py-2.5 bg-white text-black font-bold rounded-full hover:scale-105 transition-transform">
             <Music className="w-4 h-4" /> Add New Track
           </button>
           <button onClick={() => setActiveTab('tracks')} className="flex-shrink-0 flex items-center gap-2 px-5 py-2.5 bg-[#282828] hover:bg-[#333] text-white font-bold rounded-full hover:scale-105 transition-transform border border-white/5">
             <Mic2 className="w-4 h-4" /> Upload Lyrics
           </button>
           <button onClick={() => setActiveTab('artists')} className="flex-shrink-0 flex items-center gap-2 px-5 py-2.5 bg-[#282828] hover:bg-[#333] text-white font-bold rounded-full hover:scale-105 transition-transform border border-white/5">
             <Users className="w-4 h-4" /> Manage Artists
           </button>
           <button onClick={() => setActiveTab('albums')} className="flex-shrink-0 flex items-center gap-2 px-5 py-2.5 bg-[#282828] hover:bg-[#333] text-white font-bold rounded-full hover:scale-105 transition-transform border border-white/5">
             <Disc3 className="w-4 h-4" /> Edit Albums
           </button>
           <button onClick={() => setActiveTab('playlists')} className="flex-shrink-0 flex items-center gap-2 px-5 py-2.5 bg-[#282828] hover:bg-[#333] text-white font-bold rounded-full hover:scale-105 transition-transform border border-white/5">
             <ListMusic className="w-4 h-4 text-indigo-400" /> Playlist Builder
           </button>
        </div>
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
            {activeTab === 'playlists' && <NexoriaPlaylistBuilder />}
            {activeTab === 'revenue' && <NexoriaPremiumManager />}
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
