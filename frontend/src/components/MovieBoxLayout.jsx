import CustomSearchBar from './CustomSearchBar';
import ParentalGateModal from './ParentalGateModal';
import { Outlet, NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { useGetMovieSettingsQuery } from '../features/settings/movieSettingsApiSlice';
import { useGetSettingsQuery } from '../features/settings/settingsApiSlice';
import { logout, toggleKidsMode } from '../features/auth/authSlice';
import { useState, useEffect } from 'react';
import {
  Home, Search, Bell, Menu, X, User as UserIcon, LogOut, Settings, Music, Compass, Download, PlaySquare, Gamepad2
} from 'lucide-react';
import { Helmet } from 'react-helmet-async';

const MovieBoxLayout = () => {
  const { data: movieSettingsRes } = useGetMovieSettingsQuery();
  const movieSettings = movieSettingsRes?.data || {};
  
  const { user, isKidsMode } = useSelector(state => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [isParentalModalOpen, setIsParentalModalOpen] = useState(false);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/moviebox/search?q=${searchQuery}`);
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <div className="bg-background text-on-surface font-body-lg antialiased selection:bg-primary/30 selection:text-primary relative overflow-x-hidden">
      <Helmet>
        <title>{movieSettings.movieBoxName || 'MovieBox'} - Watch Movies Free</title>
        <meta name="theme-color" content="#131313" />
        {movieSettings.movieBoxFavicon && <link rel="icon" href={movieSettings.movieBoxFavicon} />}
      </Helmet>

      {/* Top Navigation (Mobile & Desktop) */}
      <nav id="main-nav" className={`fixed top-0 w-full z-50 backdrop-blur-xl border-b border-white/10 flex justify-between items-center px-margin-mobile md:px-margin-desktop h-20 transition-all duration-300 ${scrolled ? 'bg-background/80' : 'bg-transparent'}`}>
        <div className="flex items-center gap-12">
          <Link to="/moviebox" className="font-display-lg text-display-lg-mobile md:text-display-lg font-extrabold text-primary tracking-tighter hover:scale-95 transition-transform duration-200">
            {movieSettings.movieBoxName || 'Nexoria'}
          </Link>
          <div className="hidden md:flex gap-8 items-center">
            <NavLink to="/moviebox" end className={({ isActive }) => `font-body-lg text-body-lg hover:text-on-surface transition-colors duration-300 ${isActive ? 'text-primary font-bold border-b-2 border-primary pb-1' : 'text-on-surface-variant'}`}>Home</NavLink>
            <NavLink to="/moviebox/movies" className={({ isActive }) => `font-body-lg text-body-lg hover:text-on-surface transition-colors duration-300 ${isActive ? 'text-primary font-bold border-b-2 border-primary pb-1' : 'text-on-surface-variant'}`}>Movies</NavLink>
            <NavLink to="/moviebox/tv" className={({ isActive }) => `font-body-lg text-body-lg hover:text-on-surface transition-colors duration-300 ${isActive ? 'text-primary font-bold border-b-2 border-primary pb-1' : 'text-on-surface-variant'}`}>TV Shows</NavLink>
            <NavLink to="/requests" className={({ isActive }) => `font-body-lg text-body-lg hover:text-on-surface transition-colors duration-300 ${isActive ? 'text-primary font-bold border-b-2 border-primary pb-1' : 'text-on-surface-variant'}`}>Requests</NavLink>
          </div>
        </div>
        
        <div className="flex items-center gap-4 md:gap-6">
          <form onSubmit={handleSearch} className="hidden md:flex items-center bg-surface-container-low rounded-full px-4 py-2 border border-surface-variant focus-within:border-primary transition-colors">
            <Search className="w-5 h-5 text-on-surface-variant mr-2" />
            <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search..." className="bg-transparent border-none text-on-surface focus:ring-0 placeholder:text-on-surface-variant/50 w-48 font-label-caps text-label-caps outline-none" />
          </form>

          {/* Parental Gate Toggle */}
          <button
            onClick={() => setIsParentalModalOpen(true)}
            className="hidden sm:flex items-center bg-surface-container-low rounded-full p-1 border border-surface-variant transition-colors cursor-pointer group"
            title="Change Content Mode"
          >
            <div className={`px-3 py-1.5 rounded-full flex items-center gap-1.5 text-[10px] font-bold transition-all duration-300 ${!isKidsMode ? 'bg-error text-on-error shadow-[0_0_10px_rgba(255,180,171,0.3)]' : 'text-on-surface-variant hover:text-on-surface'}`}>
              ADULT
            </div>
            <div className={`px-3 py-1.5 rounded-full flex items-center gap-1.5 text-[10px] font-bold transition-all duration-300 ${isKidsMode ? 'bg-primary text-on-primary shadow-[0_0_10px_rgba(255,211,137,0.3)]' : 'text-on-surface-variant hover:text-on-surface'}`}>
              KIDS
            </div>
          </button>
          
          <button onClick={() => setIsMobileMenuOpen(true)} className="md:hidden text-on-surface-variant hover:text-primary transition-colors hover:backdrop-brightness-125">
            <Search className="w-6 h-6" />
          </button>
          
          <button className="hidden md:block text-on-surface-variant hover:text-primary transition-colors hover:backdrop-brightness-125">
            <Bell className="w-6 h-6" />
          </button>

          {user ? (
            <div className="relative z-50">
              <button onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)} className="w-10 h-10 rounded-full bg-surface-container overflow-hidden border border-surface-variant cursor-pointer hover:border-primary transition-colors">
                <img src={user.profileImage} alt={user.name} className="w-full h-full object-cover" />
              </button>
              <AnimatePresence>
                {isProfileDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-3 w-56 bg-surface-container-highest border border-outline-variant/30 rounded-2xl shadow-2xl overflow-hidden py-2"
                  >
                    <div className="px-4 py-3 border-b border-white/5 mb-2">
                      <p className="text-sm font-bold text-on-surface truncate">{user.name}</p>
                      <p className="text-xs text-on-surface-variant truncate">{user.email}</p>
                    </div>
                    <Link to="/dashboard" onClick={() => setIsProfileDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-on-surface-variant hover:text-on-surface hover:bg-white/5 transition-colors">
                      <UserIcon className="w-4 h-4" /> My Account
                    </Link>
                    {(user.role === 'admin' || user.role === 'superadmin') && (
                      <Link to="/superadmin" onClick={() => setIsProfileDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-on-surface-variant hover:text-on-surface hover:bg-white/5 transition-colors">
                        <Settings className="w-4 h-4" /> Admin Panel
                      </Link>
                    )}
                    <button onClick={() => { setIsProfileDropdownOpen(false); handleLogout(); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-error hover:text-error hover:bg-error/10 transition-colors text-left">
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <Link to="/login" className="px-4 py-2 bg-primary text-on-primary font-bold rounded-lg text-sm transition-colors hover:bg-primary-fixed shadow-[0_0_15px_rgba(255,211,137,0.2)]">Log In</Link>
          )}
        </div>
      </nav>

      {/* Main Content Canvas */}
      <main className="w-full relative min-h-screen">
        <Outlet />
        
        {/* Footer */}
        <footer className="bg-surface-container-lowest/80 backdrop-blur-2xl border-t border-white/5 w-full py-12 mt-16 md:mt-24 pb-32 md:pb-12">
          <div className="flex flex-col md:flex-row justify-between items-center px-margin-mobile md:px-margin-desktop gap-gutter">
            <div className="font-display-lg text-headline-md text-primary">
              {movieSettings.movieBoxName || 'Nexoria'}
            </div>
            <div className="flex gap-6 flex-wrap justify-center font-label-caps text-label-caps text-on-surface-variant mt-4 md:mt-0">
              <Link to="/privacy-policy" className="hover:text-primary transition-colors">Privacy Policy</Link>
              <Link to="/terms" className="hover:text-primary transition-colors">Terms of Service</Link>
              <Link to="/support" className="hover:text-primary transition-colors">Help Center</Link>
            </div>
            <div className="font-label-caps text-label-caps text-on-surface-variant mt-4 md:mt-0">
              © {new Date().getFullYear()} Nexoria MovieBox. Cinematic Excellence.
            </div>
          </div>
        </footer>
      </main>

      {/* Bottom Navigation (Mobile Only) */}
      <nav className="fixed bottom-0 w-full z-50 md:hidden bg-surface-container-lowest/90 backdrop-blur-2xl border-t border-white/5 flex justify-around items-center h-20 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
        <NavLink to="/moviebox" end className={({isActive}) => `flex flex-col items-center gap-1 p-2 ${isActive ? 'text-primary' : 'text-on-surface-variant hover:text-on-surface'}`}>
          <Home className="w-6 h-6" />
          <span className="font-label-caps text-[10px]">Home</span>
        </NavLink>
        <button onClick={() => setIsMobileMenuOpen(true)} className="flex flex-col items-center gap-1 p-2 text-on-surface-variant hover:text-on-surface">
          <Search className="w-6 h-6" />
          <span className="font-label-caps text-[10px]">Search</span>
        </button>
        <NavLink to="/moviebox/games" className={({isActive}) => `flex flex-col items-center gap-1 p-2 ${isActive ? 'text-primary' : 'text-on-surface-variant hover:text-on-surface'}`}>
          <Gamepad2 className="w-6 h-6" />
          <span className="font-label-caps text-[10px]">Arcade</span>
        </NavLink>
        {user ? (
          <Link to="/dashboard" className="flex flex-col items-center gap-1 p-2 text-on-surface-variant hover:text-on-surface">
            <UserIcon className="w-6 h-6" />
            <span className="font-label-caps text-[10px]">Profile</span>
          </Link>
        ) : (
          <Link to="/login" className="flex flex-col items-center gap-1 p-2 text-on-surface-variant hover:text-on-surface">
            <UserIcon className="w-6 h-6" />
            <span className="font-label-caps text-[10px]">Login</span>
          </Link>
        )}
      </nav>

      {/* Mobile Search Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="fixed inset-0 z-[60] bg-background/95 backdrop-blur-3xl px-4 py-8 flex flex-col">
            <div className="flex justify-between items-center mb-8">
              <h2 className="font-headline-md text-on-surface">Search</h2>
              <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-on-surface-variant hover:text-on-surface"><X className="w-6 h-6" /></button>
            </div>
            <form onSubmit={handleSearch} className="relative w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant" />
              <input autoFocus type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search movies, TV shows..." className="w-full bg-surface-container rounded-2xl py-4 pl-12 pr-4 text-on-surface outline-none border border-outline-variant/30 focus:border-primary transition-colors font-body-lg" />
            </form>
          </motion.div>
        )}
      </AnimatePresence>

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
