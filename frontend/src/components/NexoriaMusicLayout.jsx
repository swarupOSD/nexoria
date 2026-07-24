import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Home, Search, Library, PlusSquare, Heart, ArrowLeft, ArrowRight, User } from 'lucide-react';
import { useSelector } from 'react-redux';
import NexoriaPlayer from './NexoriaPlayer';

const NexoriaMusicLayout = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const { user } = useSelector((state) => state.auth);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const mainContent = document.getElementById('music-main-content');
    const handleScroll = () => {
      setIsScrolled(mainContent.scrollTop > 50);
    };
    if (mainContent) {
      mainContent.addEventListener('scroll', handleScroll);
    }
    return () => {
      if (mainContent) mainContent.removeEventListener('scroll', handleScroll);
    };
  }, [location.pathname]);

  const navItems = [
    { name: 'Home', path: '/nexoria-music', icon: Home, exact: true },
    { name: 'Search', path: '/nexoria-music/search', icon: Search, exact: false },
    { name: 'Your Library', path: '/nexoria-music/library', icon: Library, exact: false },
  ];

  const actionItems = [
    { name: 'Create Playlist', icon: PlusSquare, bg: 'bg-zinc-300 text-black', onClick: () => {} },
    { name: 'Liked Songs', path: '/nexoria-music/library', icon: Heart, bg: 'bg-gradient-to-br from-indigo-600 to-indigo-300 text-white', onClick: () => navigate('/nexoria-music/library') },
  ];

  return (
    <div className="flex h-screen bg-black text-white overflow-hidden font-poppins selection:bg-green-500 selection:text-white">
      {/* Desktop Sidebar */}
      <div className="hidden sm:flex flex-col w-64 bg-black p-2 gap-2 h-full z-10">
        
        {/* Top Nav Block */}
        <div className="bg-[#121212] rounded-lg p-4 flex flex-col gap-5">
          <div className="flex items-center gap-2 px-2 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-8 h-8 rounded-full bg-[#1ed760] flex items-center justify-center font-bold text-black text-xl">N</div>
            <span className="font-bold text-lg tracking-tight">Nexoria</span>
          </div>
          
          <nav className="flex flex-col gap-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.exact ? location.pathname === item.path : location.pathname.startsWith(item.path);
              return (
                <NavLink
                  key={item.name}
                  to={item.path}
                  className={`flex items-center gap-4 px-2 font-semibold transition-colors duration-200 ${
                    isActive ? 'text-white' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <Icon className={`w-6 h-6 ${isActive ? 'fill-current' : ''}`} />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Library Block */}
        <div className="bg-[#121212] rounded-lg p-2 flex-1 flex flex-col min-h-0 overflow-hidden">
          <div className="px-4 py-3 flex items-center gap-2 text-zinc-400 font-semibold hover:text-white transition-colors cursor-pointer" onClick={() => navigate('/nexoria-music/library')}>
            <Library className="w-6 h-6" />
            <span>Your Library</span>
          </div>
          
          <div className="mt-4 px-2 flex flex-col gap-3 overflow-y-auto custom-scrollbar flex-1 pb-24">
            {actionItems.map((item) => {
              const Icon = item.icon;
              return (
                <button 
                  key={item.name} 
                  onClick={item.onClick}
                  className="flex items-center gap-4 p-2 rounded hover:bg-white/5 transition-colors group text-left"
                >
                  <div className={`w-12 h-12 rounded flex items-center justify-center shrink-0 shadow-sm opacity-70 group-hover:opacity-100 transition-opacity ${item.bg}`}>
                    <Icon className="w-6 h-6 fill-current" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold text-white truncate">{item.name}</span>
                    <span className="text-xs text-zinc-400">Playlist</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#121212] sm:m-2 sm:rounded-lg overflow-hidden relative">
        
        {/* Top Bar */}
        <header 
          className={`absolute top-0 left-0 right-0 h-16 flex items-center justify-between px-4 sm:px-6 z-20 transition-colors duration-300 ${
            isScrolled ? 'bg-[#121212] shadow-md' : 'bg-transparent'
          }`}
        >
          <div className="flex items-center gap-2">
            <button 
              onClick={() => navigate(-1)} 
              className="w-8 h-8 rounded-full bg-black/60 flex items-center justify-center hover:bg-black/80 transition-colors text-white/70 hover:text-white backdrop-blur-md"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <button 
              onClick={() => navigate(1)} 
              className="hidden sm:flex w-8 h-8 rounded-full bg-black/60 items-center justify-center hover:bg-black/80 transition-colors text-white/70 hover:text-white backdrop-blur-md"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
          
          <div className="flex items-center gap-3">
            {!user ? (
              <>
                <button onClick={() => navigate('/register')} className="text-zinc-300 hover:text-white font-bold text-sm sm:text-base px-2">Sign up</button>
                <button onClick={() => navigate('/login')} className="bg-white text-black font-bold px-6 py-2 rounded-full hover:scale-105 active:scale-95 transition-transform text-sm sm:text-base">Log in</button>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <button className="bg-white text-black font-bold px-4 py-1.5 rounded-full hover:scale-105 transition-transform text-sm hidden sm:block">Explore Premium</button>
                <button onClick={() => navigate('/dashboard')} className="w-8 h-8 rounded-full bg-black/60 border-2 border-zinc-700 flex items-center justify-center hover:scale-105 transition-transform overflow-hidden">
                  {user.profilePicture ? (
                    <img src={user.profilePicture} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-5 h-5 text-white/70" />
                  )}
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Scrollable Content */}
        <main id="music-main-content" className="flex-1 overflow-y-auto custom-scrollbar relative">
          <Outlet />
          {/* Bottom spacer for player */}
          <div className="h-24 sm:h-[120px]"></div>
        </main>
      </div>

      {/* Mobile Bottom Navigation (Visible only on mobile when mini player is active/inactive) */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 h-[60px] bg-gradient-to-t from-black via-black to-black/90 backdrop-blur-lg border-t border-white/10 flex items-center justify-around z-[110] px-2 pb-safe">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.exact ? location.pathname === item.path : location.pathname.startsWith(item.path);
          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={`flex flex-col items-center justify-center w-16 gap-1 transition-colors ${
                isActive ? 'text-white' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Icon className={`w-6 h-6 ${isActive ? 'fill-current' : ''}`} />
              <span className="text-[10px] font-medium tracking-wide">{item.name}</span>
            </NavLink>
          );
        })}
      </div>

      {/* The Global Music Player */}
      <NexoriaPlayer />

    </div>
  );
};

export default NexoriaMusicLayout;
