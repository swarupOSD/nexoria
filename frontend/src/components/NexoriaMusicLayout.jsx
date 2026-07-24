import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Home, Search, Library, Plus, Heart, ArrowLeft, ArrowRight, User, Bell, ArrowDownToLine, ListMusic, Users } from 'lucide-react';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { useGetPlaylistsQuery, useCreatePlaylistMutation } from '../features/api/nexoriaMusicApiSlice';
import NexoriaPlayer from './NexoriaPlayer';
import NexoriaFriendActivity from './NexoriaFriendActivity';

const NexoriaMusicLayout = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [showFriendActivity, setShowFriendActivity] = useState(true);
  const { user } = useSelector((state) => state.auth);
  const location = useLocation();
  const navigate = useNavigate();

  const { data: playlistsRes } = useGetPlaylistsQuery(undefined, { skip: !user });
  const [createPlaylist] = useCreatePlaylistMutation();
  const playlists = playlistsRes?.data || [];

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
    { name: 'All Songs', path: '/nexoria-music/tracks', icon: ListMusic, exact: false },
  ];

  const handleCreatePlaylist = async () => {
    if (!user) {
      toast.error('Please log in to create playlists.');
      return;
    }
    try {
      const res = await createPlaylist({ title: `My Playlist #${playlists.length + 1}` }).unwrap();
      navigate(`/nexoria-music/playlist/${res.data._id}`);
      toast.success('Playlist created!');
    } catch (err) {
      toast.error('Failed to create playlist');
    }
  };

  const actionItems = [
    { name: 'Create Playlist', icon: Plus, bg: 'bg-[#a7a7a7] group-hover:bg-white text-black transition-colors', onClick: handleCreatePlaylist },
    { name: 'Liked Songs', path: '/nexoria-music/library', icon: Heart, bg: 'bg-gradient-to-br from-[#450af5] to-[#c4efd9] text-white', onClick: () => navigate('/nexoria-music/library') },
  ];

  return (
    <div className="flex h-screen bg-black text-white overflow-hidden font-poppins selection:bg-green-500 selection:text-white">
      {/* Desktop Sidebar */}
      <div className="hidden sm:flex flex-col w-64 bg-[#000000] p-2 gap-2 h-full z-10">
        
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
                  <div className={`w-12 h-12 rounded-md flex items-center justify-center shrink-0 shadow-sm opacity-70 group-hover:opacity-100 transition-opacity ${item.bg}`}>
                    <Icon className="w-5 h-5 fill-current" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold text-[#a7a7a7] group-hover:text-white transition-colors truncate">{item.name}</span>
                    <span className="text-xs text-[#a7a7a7]">Action</span>
                  </div>
                </button>
              );
            })}
            
            {/* User Playlists Divider */}
            {playlists.length > 0 && <div className="border-t border-white/10 my-2 mx-2"></div>}
            
            {/* Playlists Render */}
            {playlists.map((pl) => (
              <button
                key={pl._id}
                onClick={() => navigate(`/nexoria-music/playlist/${pl._id}`)}
                className="flex items-center gap-4 p-2 rounded hover:bg-white/5 transition-colors group text-left"
              >
                <div className={`w-12 h-12 rounded-md flex items-center justify-center shrink-0 shadow-sm opacity-70 group-hover:opacity-100 transition-opacity bg-zinc-800`}>
                  {pl.coverImage ? (
                    <img src={pl.coverImage} alt={pl.title} className="w-full h-full object-cover rounded-md" />
                  ) : (
                    <ListMusic className="w-5 h-5 text-white" />
                  )}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className={`font-semibold transition-colors truncate ${location.pathname === `/nexoria-music/playlist/${pl._id}` ? 'text-[#1ed760]' : 'text-[#a7a7a7] group-hover:text-white'}`}>{pl.title}</span>
                  <span className="text-xs text-[#a7a7a7] truncate">Playlist • {user?.name || 'You'}</span>
                </div>
              </button>
            ))}
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
                <button onClick={() => navigate('/register')} className="text-[#a7a7a7] hover:text-white font-bold text-sm sm:text-base px-2 hover:scale-105 transition-all">Sign up</button>
                <button onClick={() => navigate('/login')} className="bg-white text-black font-bold px-8 py-3 rounded-full hover:scale-105 active:scale-95 transition-transform text-sm sm:text-base">Log in</button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <button onClick={() => toast.success('Premium is coming soon!', { icon: '✨' })} className="bg-white text-black font-bold px-4 py-1.5 rounded-full hover:scale-105 transition-transform text-sm hidden sm:block">Explore Premium</button>
                
                <button onClick={() => toast.success('Desktop App coming soon!', { icon: '💻' })} className="hidden sm:flex items-center gap-1.5 text-white bg-black/60 hover:scale-105 transition-transform font-bold text-sm px-3 py-1.5 rounded-full">
                  <ArrowDownToLine className="w-4 h-4" /> Install App
                </button>
                
                <button onClick={() => toast.success('No new notifications', { icon: '🔔' })} className="hidden sm:flex w-8 h-8 rounded-full bg-black/60 items-center justify-center hover:scale-105 transition-transform text-[#a7a7a7] hover:text-white">
                  <Bell className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => setShowFriendActivity(!showFriendActivity)} 
                  className={`hidden lg:flex w-8 h-8 rounded-full bg-black/60 items-center justify-center hover:scale-105 transition-transform ${showFriendActivity ? 'text-white' : 'text-[#a7a7a7] hover:text-white'}`}
                >
                  <Users className="w-5 h-5" />
                </button>

                <button onClick={() => navigate('/dashboard')} className="w-8 h-8 ml-2 rounded-full bg-black/60 border-4 border-[#121212] flex items-center justify-center hover:scale-105 transition-transform overflow-hidden shadow-md">
                  {user.profilePicture ? (
                    <img src={user.profilePicture} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-zinc-800 flex items-center justify-center text-[#a7a7a7]">
                      <User className="w-5 h-5" />
                    </div>
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

      {/* Right Sidebar (Friend Activity) */}
      {showFriendActivity && (
        <div className="hidden lg:flex flex-col w-[280px] z-10 shrink-0 h-full">
          <NexoriaFriendActivity />
        </div>
      )}

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
