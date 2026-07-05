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
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Music className="text-purple-500 w-8 h-8" />
            Nexoria Music Platform
          </h1>
          <p className="text-slate-400 mt-1">Manage the proprietary music database.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto hide-scrollbar gap-2 pb-2">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 whitespace-nowrap ${
                isActive 
                  ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/25' 
                  : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700/50 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Content Area */}
      <div className="bg-slate-900/50 backdrop-blur-xl border border-white/5 rounded-2xl p-4 sm:p-6 shadow-2xl relative overflow-hidden">
        {/* Ambient Glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />
        
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
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
