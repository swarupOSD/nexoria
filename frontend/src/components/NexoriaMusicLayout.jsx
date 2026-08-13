import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Home, Search, Library, Plus, Heart, ArrowLeft, ArrowRight, User, Bell, ArrowDownToLine, ListMusic, Users, ShieldAlert } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import toast from 'react-hot-toast';
import { useSocket } from '../context/SocketContext';
import { syncMusicState } from '../features/music/nexoriaMusicSlice';
import { useGetPlaylistsQuery, useCreatePlaylistMutation, useAddTrackToPlaylistMutation, useGetFavoritesQuery } from '../features/api/nexoriaMusicApiSlice';
import NexoriaMusicCreatePlaylistModal from './NexoriaMusicCreatePlaylistModal';

const NexoriaMusicLayout = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [showFriendActivity, setShowFriendActivity] = useState(true);
  const [isCreatePlaylistModalOpen, setIsCreatePlaylistModalOpen] = useState(false);
  const [libraryFilter, setLibraryFilter] = useState('All');
  const { user } = useSelector((state) => state.auth);
  const nexoriaMusicState = useSelector((state) => state.nexoriaMusic);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const socket = useSocket();

  const { data: playlistsRes } = useGetPlaylistsQuery(undefined, { skip: !user });
  const { data: artistsRes } = useGetFavoritesQuery('Artist', { skip: !user });
  const { data: albumsRes } = useGetFavoritesQuery('Album', { skip: !user });
  
  const [createPlaylist] = useCreatePlaylistMutation();
  const [addTrackToPlaylist] = useAddTrackToPlaylistMutation();
  
  const playlists = playlistsRes?.data || [];
  // Extract the populated item from the favorite document, filter out nulls
  const artists = (artistsRes?.data || []).map(fav => fav.itemId).filter(Boolean);
  const albums = (albumsRes?.data || []).map(fav => fav.itemId).filter(Boolean);
  
  const [dragOverPlaylistId, setDragOverPlaylistId] = useState(null);

  const handleDrop = async (e, playlistId) => {
    e.preventDefault();
    setDragOverPlaylistId(null);
    const trackId = e.dataTransfer.getData('trackId');
    if (!trackId) return;

    try {
      await addTrackToPlaylist({ playlistId, trackId }).unwrap();
      toast.success('Track added to playlist!');
    } catch (err) {
      toast.error(err.data?.message || 'Failed to add track');
    }
  };

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

  // Socket.io Sync for Spotify Connect Clone
  useEffect(() => {
    if (!socket || !user) return;

    const handleRemoteSync = (payload) => {
      // payload contains { currentTrack, queue, isPlaying, currentTime }
      dispatch(syncMusicState(payload));
    };

    socket.on('nexoria_music_remote_sync', handleRemoteSync);
    
    return () => {
      socket.off('nexoria_music_remote_sync', handleRemoteSync);
    };
  }, [socket, user, dispatch]);

  // Emit state changes when local player state changes (only if it wasn't remotely controlled)
  useEffect(() => {
    if (!socket || !user) return;
    
    // Check if the change came from a remote sync event. If so, do not re-emit to avoid infinite loops.
    if (nexoriaMusicState.isRemoteControlled) {
      return;
    }

    const { currentTrack, queue, isPlaying, currentTime } = nexoriaMusicState;
    
    // WARNING: Sending a massive array over WebSockets blocks the main thread on mobile and causes severe lag!
    // We only send a tiny slice of the queue (e.g. next 20 songs) for sync purposes.
    const optimizedQueue = queue?.slice(0, 20) || [];
    
    socket.emit('nexoria_music_state_update', { 
      currentTrack, 
      queue: optimizedQueue, 
      isPlaying, 
      currentTime 
    });
    
  }, [socket, user, nexoriaMusicState.currentTrack, nexoriaMusicState.isPlaying, nexoriaMusicState.queue, nexoriaMusicState.isRemoteControlled]);

  const navItems = [
    { name: 'Home', path: '/nexoria-music', icon: Home, exact: true },
    { name: 'Search', path: '/nexoria-music/search', icon: Search, exact: false },
    { name: 'All Songs', path: '/nexoria-music/tracks', icon: ListMusic, exact: false },
  ];

  const mobileNavItems = [
    ...navItems,
    { name: 'Library', path: '/nexoria-music/library', icon: Library, exact: false }
  ];

  const handleCreatePlaylistClick = () => {
    if (!user) {
      toast.error('Please log in to create playlists.');
      return;
    }
    setIsCreatePlaylistModalOpen(true);
  };

  const actionItems = [
    { name: 'Create Playlist', icon: Plus, bg: 'bg-[#94A3B8] group-hover:bg-white text-black transition-colors', onClick: handleCreatePlaylistClick },
    { name: 'Liked Songs', path: '/nexoria-music/library', icon: Heart, bg: 'bg-gradient-to-br from-[#450af5] to-[#c4efd9] text-white', onClick: () => navigate('/nexoria-music/library') },
  ];

  return (
    <div className="bg-background text-on-surface font-body-md min-h-screen flex selection:bg-primary-container selection:text-on-primary-container overflow-hidden">
      {/* Desktop Sidebar (Stitch) */}
      <aside className="hidden md:flex flex-col py-8 px-6 bg-surface-container-low h-screen w-64 fixed left-0 top-0 border-r border-outline-variant z-50">
        <div className="mb-12 px-2 cursor-pointer" onClick={() => navigate('/')}>
          <h2 className="font-display-lg text-headline-md text-primary tracking-tighter">Nexoria</h2>
          <p className="font-label-sm text-label-sm text-on-surface-variant mt-1">Music</p>
        </div>

        <nav className="flex-1 flex flex-col gap-2 overflow-y-auto no-scrollbar pb-24">
          {/* Main Links */}
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.exact ? location.pathname === item.path : location.pathname.startsWith(item.path);
            return (
              <NavLink
                key={item.name}
                to={item.path}
                className={`flex items-center gap-4 px-4 py-3 rounded-lg font-medium text-body-md transition-colors duration-150 ${
                  isActive 
                    ? 'text-primary font-bold border-r-2 border-primary bg-surface-bright/5 scale-95' 
                    : 'text-on-surface-variant hover:bg-surface-bright/10 hover:text-primary'
                }`}
              >
                <Icon className="w-5 h-5" style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}} />
                {item.name}
              </NavLink>
            );
          })}

          <div className="mt-8 mb-4 px-4 text-label-sm font-label-sm text-on-surface-variant uppercase tracking-widest cursor-pointer hover:text-primary transition-colors" onClick={() => navigate('/nexoria-music/library')}>
            Library
          </div>
          
          {actionItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.name}
                onClick={item.onClick}
                className="flex items-center gap-4 px-4 py-3 rounded-lg text-on-surface-variant font-medium text-body-md hover:bg-surface-bright/10 hover:text-primary transition-colors duration-150 text-left w-full"
              >
                <Icon className="w-5 h-5" />
                {item.name}
              </button>
            );
          })}

          {playlists.length > 0 && <div className="border-t border-outline-variant/30 my-4 mx-4"></div>}

          {/* User Playlists */}
          {playlists.map((pl) => (
            <button
              key={pl._id}
              onClick={() => navigate(`/nexoria-music/playlist/${pl._id}`)}
              onDragOver={(e) => { e.preventDefault(); setDragOverPlaylistId(pl._id); }}
              onDragLeave={() => setDragOverPlaylistId(null)}
              onDrop={(e) => handleDrop(e, pl._id)}
              className={`flex items-center gap-4 px-4 py-2 rounded-lg transition-colors text-left w-full ${dragOverPlaylistId === pl._id ? 'bg-primary/20 border-l-4 border-primary' : 'hover:bg-surface-bright/10'}`}
            >
              <span className={`font-body-md text-sm truncate ${location.pathname === `/nexoria-music/playlist/${pl._id}` ? 'text-primary font-bold' : 'text-on-surface-variant hover:text-primary'}`}>
                {pl.title}
              </span>
            </button>
          ))}
        </nav>
        
        {/* User Profile Mini */}
        {user && (
          <div className="mt-auto flex items-center gap-4 pt-6 border-t border-outline-variant/30 cursor-pointer" onClick={() => navigate('/dashboard')}>
            <img 
              className="w-10 h-10 rounded-full object-cover border border-outline-variant" 
              src={user.profilePicture || `https://ui-avatars.com/api/?name=${user.name}&background=random`}
              alt={user.name} 
            />
            <div className="flex flex-col min-w-0">
              <span className="font-label-sm text-label-sm text-on-surface truncate">{user.name.split(' ')[0]}</span>
              <span className="font-label-sm text-xs text-on-surface-variant opacity-70">Premium</span>
            </div>
          </div>
        )}
      </aside>

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col md:pl-64 w-full relative h-screen">
        {/* Top App Bar (Mobile & Desktop) */}
        <nav className="bg-background/80 backdrop-blur-xl docked full-width top-0 sticky z-40 bg-transparent flex justify-between items-center h-20 px-4 md:px-margin-desktop transition-colors border-b border-transparent md:border-outline-variant/10">
          <div className="flex items-center gap-8">
            <h1 className="md:hidden font-display-lg text-headline-md text-primary tracking-tighter cursor-pointer" onClick={() => navigate('/')}>Nexoria</h1>
            
            {/* Desktop Center Links */}
            <div className="hidden md:flex gap-6 mt-1">
              <button onClick={() => navigate(-1)} className="text-on-surface-variant hover:text-primary transition-opacity mr-2">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <button onClick={() => navigate(1)} className="text-on-surface-variant hover:text-primary transition-opacity mr-4">
                <ArrowRight className="w-5 h-5" />
              </button>
              <a className="text-primary border-b-2 border-primary pb-1 font-label-sm text-label-sm uppercase transition-opacity font-medium" href="#">Discover</a>
              <a className="text-on-surface-variant font-label-sm text-label-sm uppercase hover:text-primary transition-opacity font-medium" href="#">Live</a>
              <a className="text-on-surface-variant font-label-sm text-label-sm uppercase hover:text-primary transition-opacity font-medium" href="#">Trending</a>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button aria-label="notifications" className="text-on-surface-variant hover:text-primary transition-colors flex items-center justify-center opacity-80" onClick={() => toast.success('No new notifications', { icon: '🔔' })}>
              <Bell className="w-5 h-5" />
            </button>
            <button onClick={() => navigate('/dashboard')} aria-label="settings" className="text-on-surface-variant hover:text-primary transition-colors flex items-center justify-center opacity-80 md:hidden">
               <User className="w-5 h-5" />
            </button>
            
            {!user ? (
              <div className="hidden md:flex gap-2">
                <button onClick={() => navigate('/register')} className="text-on-surface-variant hover:text-on-surface font-label-sm text-label-sm uppercase px-4 py-2">Sign up</button>
                <button onClick={() => navigate('/login')} className="bg-primary text-on-primary font-label-sm text-label-sm uppercase px-6 py-2 rounded-full font-bold">Log in</button>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-4">
                <div className="relative group cursor-pointer" onClick={() => navigate('/nexoria-music/search')}>
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant w-4 h-4" />
                  <input 
                    className="bg-surface-container-low border border-outline-variant/30 text-on-surface rounded-full pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-primary/50 transition-colors w-64 placeholder-on-surface-variant/50 cursor-pointer" 
                    placeholder="Search..." 
                    type="text"
                    readOnly
                  />
                </div>
              </div>
            )}
          </div>
        </nav>

        {/* Scrollable Content Area */}
        <main id="music-main-content" className="flex-1 overflow-y-auto overflow-x-hidden relative">
          <div className="min-h-full pb-32">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation (Visible only on mobile) */}
      <div className="md:hidden fixed bottom-24 left-0 right-0 h-16 bg-surface-container/90 backdrop-blur-3xl border-t border-outline-variant/30 flex items-center justify-around z-40 px-2 pb-safe shadow-[0_-10px_20px_rgba(0,0,0,0.2)] rounded-t-2xl">
        {mobileNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.exact ? location.pathname === item.path : location.pathname.startsWith(item.path);
          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={`flex flex-col items-center justify-center w-16 gap-1 transition-colors ${
                isActive ? 'text-primary' : 'text-on-surface-variant hover:text-primary'
              }`}
            >
              <Icon className="w-5 h-5" style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}} />
              <span className="font-label-sm text-[10px] tracking-wide whitespace-nowrap">{item.name}</span>
            </NavLink>
          );
        })}
      </div>
      {/* extra div removed */}
      {/* Modals */}
      <NexoriaMusicCreatePlaylistModal 
        isOpen={isCreatePlaylistModalOpen} 
        onClose={() => setIsCreatePlaylistModalOpen(false)} 
      />
    </div>
  );
};

export default NexoriaMusicLayout;
