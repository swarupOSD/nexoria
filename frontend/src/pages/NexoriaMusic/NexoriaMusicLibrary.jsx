import React from 'react';
import { Compass, Search as SearchIcon, Library, Play, Heart, Clock, MoreVertical } from 'lucide-react';
import { Link } from 'react-router-dom';

const NexoriaMusicLibrary = () => {
  return (
    <div className="min-h-screen bg-[#050505] text-white pb-32">
      {/* Header / Nav */}
      <header className="sticky top-0 z-50 bg-[#050505]/80 backdrop-blur-2xl border-b border-white/5 px-4 lg:px-8 py-4 flex items-center justify-between">
        <h1 className="text-2xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500">
          NEXORIA MUSIC
        </h1>
        <div className="flex items-center gap-6 text-slate-400 font-medium">
          <Link to="/nexoria-music" className="hover:text-white transition-colors flex items-center gap-2">
            <Compass className="w-5 h-5" /> <span className="hidden md:inline">Discover</span>
          </Link>
          <Link to="/nexoria-music/search" className="hover:text-white transition-colors flex items-center gap-2">
            <SearchIcon className="w-5 h-5" /> <span className="hidden md:inline">Search</span>
          </Link>
          <Link to="/nexoria-music/library" className="text-white hover:text-white transition-colors flex items-center gap-2">
            <Library className="w-5 h-5" /> <span className="hidden md:inline">Library</span>
          </Link>
        </div>
      </header>

      <main className="px-4 lg:px-8 py-8 max-w-[1400px] mx-auto">
        <div className="flex items-end justify-between mb-12 border-b border-white/5 pb-8">
          <div>
            <h2 className="text-5xl font-black text-white mb-2">Your Library</h2>
            <p className="text-slate-400 text-lg">All your favorite tracks and playlists in one place.</p>
          </div>
          <div className="flex gap-4 hidden md:flex">
            <button className="px-6 py-2 rounded-full bg-white text-black font-bold hover:scale-105 transition-transform flex items-center gap-2">
              <Play className="w-4 h-4 fill-current" /> Play Liked Songs
            </button>
          </div>
        </div>

        {/* Content Tabs (Static for now until favorites API is ready) */}
        <div className="flex gap-8 border-b border-white/10 mb-8 overflow-x-auto hide-scrollbar">
          <button className="text-purple-400 border-b-2 border-purple-400 pb-4 font-bold whitespace-nowrap">Liked Songs</button>
          <button className="text-slate-400 hover:text-white pb-4 font-bold whitespace-nowrap transition-colors">Playlists</button>
          <button className="text-slate-400 hover:text-white pb-4 font-bold whitespace-nowrap transition-colors">Albums</button>
          <button className="text-slate-400 hover:text-white pb-4 font-bold whitespace-nowrap transition-colors">Artists</button>
          <button className="text-slate-400 hover:text-white pb-4 font-bold whitespace-nowrap transition-colors">History</button>
        </div>

        {/* Liked Songs Empty State (Since DB favorites not connected yet) */}
        <div className="text-center py-20 bg-white/5 rounded-3xl border border-white/5">
          <Heart className="w-16 h-16 mx-auto mb-4 text-slate-600" />
          <h3 className="text-2xl font-bold text-white mb-2">Songs you like will appear here</h3>
          <p className="text-slate-400 max-w-md mx-auto mb-6">Save songs by tapping the heart icon. We'll keep them all right here for you.</p>
          <Link to="/nexoria-music/search" className="inline-block px-8 py-3 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold transition-colors">
            Find Songs
          </Link>
        </div>

      </main>
    </div>
  );
};

export default NexoriaMusicLibrary;
