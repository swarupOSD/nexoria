import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Music, Mic2, Disc3, ListMusic, Plus, Settings } from 'lucide-react';
import NexoriaArtistsManager from './NexoriaArtistsManager';
import NexoriaGenresManager from './NexoriaGenresManager';
import NexoriaAlbumsManager from './NexoriaAlbumsManager';
import NexoriaTracksManager from './NexoriaTracksManager';

const NexoriaMusicDashboard = () => {
  const [activeTab, setActiveTab] = useState('artists');

  const tabs = [
    { id: 'artists', label: 'Artists', icon: Mic2 },
    { id: 'genres', label: 'Genres', icon: ListMusic },
    { id: 'albums', label: 'Albums', icon: Disc3 },
    { id: 'tracks', label: 'Tracks', icon: Music },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2 tracking-tight">
            <div className="w-8 h-8 rounded-full bg-[#1ed760] flex items-center justify-center font-bold text-black text-xl">N</div>
            Music Admin
          </h1>
          <p className="text-[#b3b3b3] mt-1 text-sm font-medium">Manage the proprietary music database.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto hide-scrollbar gap-3 pb-2">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full transition-colors duration-200 whitespace-nowrap text-sm font-bold ${
                isActive 
                  ? 'bg-white text-black' 
                  : 'bg-[#242424] text-white hover:bg-[#2a2a2a]'
              }`}
            >
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Content Area */}
      <div className="bg-[#121212] rounded-lg relative overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="relative z-10"
          >
            {activeTab === 'artists' && <NexoriaArtistsManager />}
            {activeTab === 'genres' && <NexoriaGenresManager />}
            {activeTab === 'albums' && <NexoriaAlbumsManager />}
            {activeTab === 'tracks' && <NexoriaTracksManager />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default NexoriaMusicDashboard;
