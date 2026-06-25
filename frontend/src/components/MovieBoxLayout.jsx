import CustomSearchBar from './CustomSearchBar';
import ParentalGateModal from './ParentalGateModal';
import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { useGetMovieSettingsQuery } from '../features/settings/movieSettingsApiSlice';
import { useGetSettingsQuery } from '../features/settings/settingsApiSlice';
import { logout, toggleKidsMode } from '../features/auth/authSlice';
import { useState } from 'react';
import {
  Home,
  Tv,
  Film,
  PlaySquare,
  TrendingUp,
  Smartphone,
  Download,
  Gamepad2,
  MonitorPlay,
  Search,
  Menu,
  X,
  User as UserIcon,
  LogOut,
  Settings
} from 'lucide-react';
import { Helmet } from 'react-helmet-async';

const MovieBoxLayout = () => {
  const { data: movieSettingsRes } = useGetMovieSettingsQuery();
  const movieSettings = movieSettingsRes?.data || {};
  
  const { data: settingsRes } = useGetSettingsQuery();
  const settings = settingsRes?.data || {};

  const { user, isKidsMode } = useSelector(state => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isParentalModalOpen, setIsParentalModalOpen] = useState(false);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/moviebox/search?q=${searchQuery}`);
    }
  };

  const menuItems = [
    { name: 'Nexoria Arcade', path: '/moviebox/games', icon: Gamepad2 },
    { name: 'Nexoria FM', path: '/sound', icon: Download },
  ];

  const appItems = [
    { name: 'Requests', path: '/requests', icon: PlaySquare },
  ];

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-[#0d0d0f] border-r border-white/5 text-slate-300">
      {/* Logo Area */}
      <div className="h-20 flex items-center px-6 mb-4">
        <Link to="/moviebox" className="flex items-center gap-3">
          <img src={movieSettings.movieBoxLogo || '/logo.png'} alt={movieSettings.movieBoxName || 'MovieBox'} className="h-8 object-contain" />
          <span className="text-xl font-bold text-white tracking-wide">{movieSettings.movieBoxName || 'MovieBox'}</span>
        </Link>
      </div>

      <div className="px-6 mb-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
        Menu
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 space-y-1 overflow-y-auto custom-scrollbar pb-6">
        {menuItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            end={item.path === '/moviebox'}
            onClick={() => setIsMobileMenuOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group ${
                isActive
                  ? 'bg-purple-600/10 text-purple-400 font-medium'
                  : 'hover:bg-white/5 hover:text-white'
              }`
            }
          >
            <item.icon className="w-5 h-5 opacity-80 group-hover:opacity-100" />
            <span className="text-sm">{item.name}</span>
          </NavLink>
        ))}

        {/* App Items (Games, Apps, etc.) - Only visible in Adult mode */}
        {!isKidsMode && (
          <>
            <div className="mt-8 mb-4 px-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              More Apps & Games
            </div>
            {appItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group ${
                    isActive
                      ? 'bg-purple-600/10 text-purple-400 font-medium'
                      : 'hover:bg-white/5 hover:text-white'
                  }`
                }
              >
                <item.icon className="w-5 h-5 opacity-80 group-hover:opacity-100" />
                <span className="text-sm">{item.name}</span>
              </NavLink>
            ))}
          </>
        )}

        <div className="mt-8 px-4 border-t border-white/5 pt-6">
          <Link to="/" className="flex items-center gap-4 py-3 text-slate-500 hover:text-slate-300 transition-colors text-sm">
            <span>&larr; Back to App Store</span>
          </Link>
        </div>
      </nav>
      
      {/* Footer Area for sidebar */}
      <div className="p-6 border-t border-white/5 mt-auto">
        <div className="bg-gradient-to-br from-purple-900/40 to-blue-900/40 border border-purple-500/20 rounded-2xl p-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-2 opacity-10">
            <Smartphone className="w-16 h-16" />
          </div>
          <p className="text-xs text-purple-200 mb-1 font-medium">Get {movieSettings.movieBoxName || 'Nexoria Play'}</p>
          <p className="text-[10px] text-slate-400 mb-3">Watch movies free everywhere</p>
          <button className="w-full py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-lg transition-colors shadow-lg shadow-purple-600/20">
            Download App
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#050505] text-white font-sans overflow-hidden">
      <Helmet>
        <title>{movieSettings.movieBoxName || 'MovieBox'} - Watch Movies Free</title>
        <meta name="theme-color" content="#050505" />
        {movieSettings.movieBoxFavicon && <link rel="icon" href={movieSettings.movieBoxFavicon} />}
      </Helmet>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 h-full shrink-0 z-40 relative">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="fixed inset-y-0 left-0 w-72 h-full z-50 lg:hidden shadow-2xl"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full relative overflow-hidden">
        
        {/* Top Header */}
        <header className="h-20 shrink-0 flex items-center justify-between px-4 sm:px-8 border-b border-white/5 bg-[#050505]/80 backdrop-blur-xl z-30 sticky top-0">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 -ml-2 text-slate-400 hover:text-white lg:hidden transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>
            
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="hidden sm:flex relative items-center">
              <Search className="absolute left-4 w-4 h-4 text-slate-500" />
              <CustomSearchBar value={searchQuery} placeholder="Search movies, TV shows..." name="text"  onChange={(e) => setSearchQuery(e.target.value)} />
            </form>
          </div>

          <div className="flex items-center gap-4 sm:gap-6">
            <button
              onClick={() => setIsParentalModalOpen(true)}
              className="flex items-center bg-slate-800/50 rounded-full p-1 shadow-inner border border-white/10 transition-colors cursor-pointer group backdrop-blur-md"
              title="Change Content Mode"
            >
              <div className={`px-3 py-1.5 rounded-full flex items-center gap-1.5 text-[10px] sm:text-xs font-bold transition-all duration-300 ${!isKidsMode ? 'bg-rose-500 text-white shadow-md shadow-rose-500/30' : 'text-slate-500 hover:text-slate-300'}`}>
                🔞 ADULT
              </div>
              <div className={`px-3 py-1.5 rounded-full flex items-center gap-1.5 text-[10px] sm:text-xs font-bold transition-all duration-300 ${isKidsMode ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30' : 'text-slate-500 hover:text-slate-300'}`}>
                🧸 KIDS
              </div>
            </button>

            <Link to="/premium" className="hidden sm:block">
              <span className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white text-sm font-bold rounded-full shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40 transition-all transform hover:-translate-y-0.5">
                Go Premium
              </span>
            </Link>

            {user && (
              <div className="flex items-center gap-1.5 bg-amber-500/20 border border-amber-500/30 px-3 py-1.5 rounded-full">
                <span className="text-amber-400 text-sm">🪙</span>
                <span className="font-bold text-amber-400 text-sm">{user.rewardPoints || 0}</span>
              </div>
            )}

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  className="w-10 h-10 rounded-full overflow-hidden border-2 border-white/10 hover:border-purple-500 transition-colors focus:outline-none"
                >
                  <img
                    src={user.profileImage}
                    alt={user.name}
                    className="w-full h-full object-cover"
                  />
                </button>

                <AnimatePresence>
                  {isProfileDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-3 w-56 bg-[#1a1a1f] border border-white/10 rounded-2xl shadow-2xl overflow-hidden py-2 z-50"
                    >
                      <div className="px-4 py-3 border-b border-white/5 mb-2">
                        <p className="text-sm font-bold text-white truncate">{user.name}</p>
                        <p className="text-xs text-slate-400 truncate">{user.email}</p>
                      </div>
                      <Link
                        to="/dashboard"
                        onClick={() => setIsProfileDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                      >
                        <UserIcon className="w-4 h-4" /> My Account
                      </Link>
                      {(user.role === 'admin' || user.role === 'superadmin') && (
                        <Link
                          to="/superadmin"
                          onClick={() => setIsProfileDropdownOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                        >
                          <Settings className="w-4 h-4" /> Admin Panel
                        </Link>
                      )}
                      <button
                        onClick={() => {
                          setIsProfileDropdownOpen(false);
                          handleLogout();
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-400/10 transition-colors text-left"
                      >
                        <LogOut className="w-4 h-4" /> Sign Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link to="/login" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
                Log In
              </Link>
            )}
          </div>
        </header>

        {/* Mobile Search Bar (Visible only on very small screens) */}
        <div className="sm:hidden px-4 py-3 bg-[#050505] border-b border-white/5 z-20">
           <form onSubmit={handleSearch} className="relative items-center">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <CustomSearchBar value={searchQuery} placeholder="Search movies..." name="text"  onChange={(e) => setSearchQuery(e.target.value)} />
            </form>
        </div>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto custom-scrollbar relative">
          <Outlet />
          
          {/* Simple footer for MovieBox */}
          <footer className="mt-20 py-8 border-t border-white/5 text-center">
             <p className="text-sm text-slate-500">© {new Date().getFullYear()} {movieSettings.movieBoxName || 'MovieBox'}. A part of Nexoria.</p>
          </footer>
        </main>
      </div>

      <ParentalGateModal
        isOpen={isParentalModalOpen}
        onClose={() => setIsParentalModalOpen(false)}
        mode={isKidsMode ? 'disable' : 'enable'}
        onSuccess={() => dispatch(toggleKidsMode())}
      />
    </div>
  );
};

export default MovieBoxLayout;
