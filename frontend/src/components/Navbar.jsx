import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Search, Menu, Moon, Sun, X, ChevronDown, ChevronRight, User as UserIcon,
  LogOut, ShieldAlert, History, TrendingUp, XCircle, Music,
  Compass, Smartphone, Star, ArrowUpRight, LayoutGrid, Gamepad2, Dices, Flame, DownloadCloud
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector, useDispatch } from 'react-redux';
import { logout, toggleKidsMode } from '../features/auth/authSlice';
import FallbackImage from './FallbackImage';
import Logo from './Logo';
import { useLogoutMutation } from '../features/auth/authApiSlice';
import DropdownMenu from './DropdownMenu';
import { useGetCategoriesQuery } from '../features/category/categoryApiSlice';
import { useSearchPostsQuery, useGetPostsQuery } from '../features/post/postApiSlice';
import { useGetSettingsQuery } from '../features/settings/settingsApiSlice';
import NotificationBell from './Layout/NotificationBell';
import { toast } from 'react-hot-toast';
import CustomSearchBar from './CustomSearchBar';
import ParentalGateModal from './ParentalGateModal';
import BottomNavigation from './Layout/BottomNavigation';
import { BACKEND_URL } from '../features/api/apiSlice';

const Navbar = () => {
  const { isDarkMode, toggleTheme, isCyberpunk, toggleCyberpunk } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isParentalModalOpen, setIsParentalModalOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchSuggest, setShowSearchSuggest] = useState(false);
  const [searchHistory, setSearchHistory] = useState([]);
  const searchRef = useRef(null);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const { user, isKidsMode } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [logoutApiCall] = useLogoutMutation();
  const { data: searchRes, isFetching: isSearching } = useSearchPostsQuery(searchQuery, { skip: searchQuery.length < 2 });
  const searchSuggestions = searchRes?.data || [];
  const { data: trendingRes } = useGetPostsQuery({ isTrending: true, limit: 4 });
  const trendingSearches = trendingRes?.data || [];
  const { data: categoriesData } = useGetCategoriesQuery();
  const categories = categoriesData?.data || [];
  const { data: settingsRes } = useGetSettingsQuery();
  const settings = settingsRes?.data || {};

  useEffect(() => {
    const h = (e) => { e.preventDefault(); window.deferredPrompt = e; setDeferredPrompt(e); };
    window.addEventListener('beforeinstallprompt', h);
    if (window.deferredPrompt) setDeferredPrompt(window.deferredPrompt);
    return () => window.removeEventListener('beforeinstallprompt', h);
  }, []);
  useEffect(() => {
    const s = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', s, { passive: true });
    return () => window.removeEventListener('scroll', s);
  }, []);
  useEffect(() => { setIsMobileMenuOpen(false); }, [location.pathname]);
  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') setIsMobileMenuOpen(false); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, []);
  useEffect(() => {
    if (isMobileMenuOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'auto';
    return () => { document.body.style.overflow = 'auto'; };
  }, [isMobileMenuOpen]);
  useEffect(() => { setSearchHistory(JSON.parse(localStorage.getItem('searchHistory') || '[]')); }, []);
  useEffect(() => {
    const h = (e) => { if (searchRef.current && !searchRef.current.contains(e.target)) setShowSearchSuggest(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const handleInstallApp = async () => {
    if (/Android/i.test(navigator.userAgent)) {
      toast.success('Downloading...');
      window.open('https://nightly.link/swarupOSD/nexoria/workflows/build-android.yml/main/Nexoria-App-Debug.zip', '_blank');
      return;
    }
    const prompt = window.deferredPrompt || deferredPrompt;
    if (prompt) {
      prompt.prompt();
      const { outcome } = await prompt.userChoice;
      if (outcome === 'accepted') { setDeferredPrompt(null); window.deferredPrompt = null; }
    } else {
      toast('Install via your browser address bar!', { icon: 'info' });
    }
  };
  const handleLogout = async () => {
    try { await logoutApiCall().unwrap(); } catch (e) {}
    finally { dispatch(logout()); navigate('/'); }
  };
  const executeSearch = (query) => {
    if (!query.trim()) return;
    let h = JSON.parse(localStorage.getItem('searchHistory') || '[]');
    h = [query, ...h.filter(x => x !== query)].slice(0, 5);
    localStorage.setItem('searchHistory', JSON.stringify(h));
    setSearchHistory(h);
    setSearchQuery('');
    setShowSearchSuggest(false);
    navigate('/search?q=' + encodeURIComponent(query));
  };
  const handleSearchSubmit = (e) => { e.preventDefault(); executeSearch(searchQuery); };
  const removeHistoryItem = (e, item) => {
    e.stopPropagation();
    const h = searchHistory.filter(x => x !== item);
    localStorage.setItem('searchHistory', JSON.stringify(h));
    setSearchHistory(h);
  };
  const handleSurpriseMe = async () => {
    try {
      const r = await fetch(BACKEND_URL + '/posts?limit=50');
      const d = await r.json();
      const a = d?.data?.posts || [];
      if (a.length) { navigate('/post/' + a[Math.floor(Math.random() * a.length)].slug); toast.success('Surprise!'); }
    } catch (e) {}
  };

  return (
    <>
      <nav className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-xl border-b border-outline-variant/20 shadow-[0_0_40px_rgba(208,188,255,0.05)]">
        <div className="flex justify-between items-center w-full px-margin-mobile md:px-margin-desktop py-md max-w-container-max mx-auto">

          {/* Brand */}
          <Link to="/" className="flex items-center gap-sm group hover:scale-105 transition-transform duration-300">
            <div className="h-8 w-8 rounded-full overflow-hidden shadow-[0_0_15px_rgba(208,188,255,0.3)]">
              <Logo src={settings.logo} />
            </div>
            <span className="font-display-sm tracking-tighter text-primary bg-clip-text hidden md:block" style={{ fontSize: '24px', lineHeight: '32px' }}>
              {settings?.siteName || 'Nexoria'}
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-lg whitespace-nowrap">
            <Link to="/apps" className="text-on-surface-variant font-label-caps hover:text-primary transition-all duration-300">Apps</Link>
            <Link to="/moviebox" className="text-on-surface-variant font-label-caps hover:text-primary transition-all duration-300">Movies</Link>
            <Link to="/nexoria-music" className="text-on-surface-variant font-label-caps hover:text-primary transition-all duration-300">Music</Link>
            <Link to="/moviebox/games" className="text-on-surface-variant font-label-caps hover:text-primary transition-all duration-300">Games</Link>
            <Link to="/premium" className="text-on-surface-variant font-label-caps hover:text-primary transition-all duration-300">Premium</Link>

              <DropdownMenu align="left" width="w-[480px]" closeOnClickInside={true} trigger={
                <button className="flex items-center gap-1 text-sm font-bold text-slate-700 dark:text-slate-300 hover:text-primary transition-colors">
                  <LayoutGrid className="w-4 h-4" /> Categories <ChevronDown className="w-3 h-3" />
                </button>
              }>
                <div className="grid grid-cols-3 gap-2 p-3">
                  {categories.slice(0, 9).map(cat => (
                    <Link key={cat._id} to={`/category/${cat.slug}`} className="flex items-center gap-2 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                      <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary overflow-hidden">
                        {cat.image && cat.image !== 'default-category.jpg' ? <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" /> : cat.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-sm">{cat.name}</p>
                        <p className="text-[10px] text-slate-500">{cat.appCount || 0} Apps</p>
                      </div>
                    </Link>
                  ))}
                  <Link to="/categories" className="col-span-3 text-center py-1.5 text-primary font-bold text-sm hover:underline">View All</Link>
                </div>
              </DropdownMenu>

              <DropdownMenu align="left" width="w-[200px]" closeOnClickInside={true} trigger={
                <button className="flex items-center gap-1 text-sm font-bold text-slate-700 dark:text-slate-300 hover:text-primary transition-colors">
                  <Compass className="w-4 h-4" /> Explore <ChevronDown className="w-3 h-3" />
                </button>
              }>
                <div className="flex flex-col p-2 gap-0.5">
                  <Link to="/requests" className="flex items-center gap-2 px-3 py-2 text-sm font-bold hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"><Compass className="w-4 h-4 text-indigo-500" /> Requests</Link>
                  <Link to="/sound" className="flex items-center gap-2 px-3 py-2 text-sm font-bold hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"><Music className="w-4 h-4 text-purple-500" /> Classic Sound</Link>
                  <Link to="/nexoria-music" className="flex items-center gap-2 px-3 py-2 text-sm font-bold hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"><Music className="w-4 h-4 text-pink-500" /> Nexoria Music</Link>
                  <Link to="/nexoria-arena" className="flex items-center gap-2 px-3 py-2 text-sm font-bold hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"><Gamepad2 className="w-4 h-4 text-red-500" /> Arena</Link>
                  <Link to="/aura" className="flex items-center gap-2 px-3 py-2 text-sm font-bold hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"><Flame className="w-4 h-4 text-amber-500" /> Aura</Link>
                  <Link to="/video-downloader" className="flex items-center gap-2 px-3 py-2 text-sm font-bold hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"><DownloadCloud className="w-4 h-4 text-emerald-500" /> YT Downloader</Link>
                  <div className="h-px bg-slate-200 dark:bg-slate-700 my-1"></div>
                  <Link to="/premium" className="flex items-center gap-2 px-3 py-2 text-sm font-bold text-accent hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"><Star className="w-4 h-4" /> Premium</Link>
                </div>
              </DropdownMenu>

              {/* Search */}
              <div className="relative w-full max-w-[200px] xl:max-w-xs focus-within:max-w-[260px] transition-all duration-300" ref={searchRef}>
                <form onSubmit={handleSearchSubmit}>
                  <CustomSearchBar
                    value={searchQuery}
                    onChange={(e) => { setSearchQuery(e.target.value); setShowSearchSuggest(true); }}
                    onFocus={() => setShowSearchSuggest(true)}
                    placeholder="Search..."
                  />
                </form>
                <AnimatePresence>
                  {showSearchSuggest && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
                      className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl overflow-y-auto max-h-96"
                    >
                      {searchQuery.length >= 2 ? (
                        <div className="p-2">
                          <h4 className="text-xs font-bold text-slate-400 uppercase px-3 py-2">Results</h4>
                          {isSearching ? (
                            <div className="p-4 text-center"><div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div></div>
                          ) : searchSuggestions.length > 0 ? searchSuggestions.map(a => (
                            <div key={a._id} onClick={() => executeSearch(a.title)} className="flex items-center gap-3 p-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl cursor-pointer group">
                              <img src={a.appLogo} alt={a.title} className="w-10 h-10 rounded-lg" />
                              <div className="flex-1">
                                <p className="text-sm font-bold group-hover:text-primary truncate">{a.title}</p>
                                <p className="text-[10px] text-slate-500">{a.categoryObj?.name}</p>
                              </div>
                              <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100" />
                            </div>
                          )) : <p className="p-4 text-center text-sm text-slate-500">No results</p>}
                        </div>
                      ) : (
                        <>
                          {searchHistory.length > 0 && (
                            <div className="p-2 border-b border-slate-100 dark:border-slate-800">
                              <h4 className="text-xs font-bold text-slate-400 uppercase px-3 py-2 flex items-center gap-2"><History className="w-3 h-3" />Recent</h4>
                              {searchHistory.map((item, i) => (
                                <div key={i} className="flex items-center justify-between px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg cursor-pointer group" onClick={() => executeSearch(item)}>
                                  <span className="text-sm">{item}</span>
                                  <button onClick={(e) => removeHistoryItem(e, item)} className="opacity-0 group-hover:opacity-100 text-red-400"><XCircle className="w-4 h-4" /></button>
                                </div>
                              ))}
                            </div>
                          )}
                          <div className="p-2">
                            <h4 className="text-xs font-bold text-slate-400 uppercase px-3 py-2 flex items-center gap-2"><TrendingUp className="w-3 h-3" />Trending</h4>
                            <div className="flex flex-wrap gap-2 px-3 pb-2">
                              {trendingSearches.map(a => (
                                <span key={a._id} onClick={() => executeSearch(a.title)} className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-primary hover:text-white text-xs font-medium rounded-full cursor-pointer transition-colors">{a.title}</span>
                              ))}
                            </div>
                          </div>
                        </>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <div className="hidden lg:flex items-center gap-md">
              <button onClick={() => setIsParentalModalOpen(true)} className="hidden xl:flex items-center bg-surface-container-highest rounded-full p-0.5 border border-outline-variant/30 cursor-pointer" title="Content Mode">
                <div className={`px-2 py-1 rounded-full text-[10px] font-bold transition-all duration-300 ${!isKidsMode ? 'bg-rose-500 text-white' : 'text-on-surface-variant'}`}>18+</div>
                <div className={`px-2 py-1 rounded-full text-[10px] font-bold transition-all duration-300 ${isKidsMode ? 'bg-emerald-500 text-white' : 'text-on-surface-variant'}`}>Kids</div>
              </button>
              <button onClick={toggleCyberpunk} className={`hidden xl:flex p-2 rounded-full transition-all ${isCyberpunk ? 'bg-primary/20 text-primary' : 'hover:bg-surface-container-highest text-on-surface-variant'}`} title="Cyberpunk"><Gamepad2 className="w-4 h-4 xl:w-5 xl:h-5" /></button>
              <button onClick={handleSurpriseMe} className="hidden xl:flex p-2 rounded-full hover:bg-surface-container-highest text-on-surface-variant hover:rotate-180 transition-all duration-500" title="Surprise Me"><Dices className="w-4 h-4 xl:w-5 xl:h-5 text-indigo-500" /></button>
              <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-surface-container-highest text-on-surface-variant transition-colors">
                {isDarkMode ? <Sun className="w-4 h-4 xl:w-5 xl:h-5" /> : <Moon className="w-4 h-4 xl:w-5 xl:h-5" />}
              </button>
              {user && <NotificationBell iconClassName="text-on-surface-variant hover:text-primary transition-colors" />}
              {user ? (
                <DropdownMenu align="right" width="w-64" trigger={
                  <div className="flex items-center gap-xs cursor-pointer group">
                    <div className="w-8 h-8 rounded-full bg-surface-container-highest border border-primary overflow-hidden group-hover:shadow-[0_0_15px_rgba(208,188,255,0.3)] transition-all">
                      <FallbackImage src={user.profileImage} fallbackType="avatar" alt="avatar" className="w-full h-full object-cover" />
                    </div>
                    <div className="hidden md:flex flex-col ml-2">
                      <span className="font-label-caps text-on-surface">{user.name.split(' ')[0]}</span>
                    </div>
                  </div>
                }>
                  <div className="p-4 text-center border-b border-slate-100 dark:border-slate-800 mb-2">
                    <FallbackImage src={user.profileImage} fallbackType="avatar" className="w-16 h-16 rounded-full object-cover mx-auto mb-2 border-2 border-primary" alt="Profile" />
                    <p className="font-bold text-slate-900 dark:text-white">{user.name}</p>
                    <p className="text-xs text-slate-500 uppercase font-bold">{user.role}</p>
                  </div>
                  <Link to="/dashboard" className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl mx-2 mb-1"><UserIcon className="w-4 h-4 text-primary" /> My Dashboard</Link>
                  {['admin', 'superadmin', 'owner'].includes(user.role) && (
                    <Link to={user.role !== 'admin' ? '/superadmin' : '/admin'} className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl mx-2 mb-1"><ShieldAlert className="w-4 h-4 text-accent" /> Admin Panel</Link>
                  )}
                  <button onClick={handleInstallApp} className="w-[calc(100%-16px)] flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-primary hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl mx-2 mb-1 text-left"><Smartphone className="w-4 h-4 text-primary" /> Install App</button>
                  <button onClick={handleLogout} className="w-[calc(100%-16px)] flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl mx-2 mb-2"><LogOut className="w-4 h-4" /> Logout</button>
                </DropdownMenu>
              ) : (
                <div className="flex items-center gap-2">
                  <Link to="/login" className="px-5 py-2.5 text-sm font-semibold text-slate-700 dark:text-white/70 hover:text-slate-900 dark:hover:text-white transition-colors">Log in</Link>
                  <Link to="/register" className="px-5 py-2.5 text-sm font-semibold bg-black dark:bg-white text-white dark:text-black rounded-full shadow-lg active:scale-95 hover:bg-slate-800 dark:hover:bg-slate-200 transition-all">Sign Up</Link>
                </div>
              )}
            </div>

            {/* Mobile Right */}
            <div className="flex items-center gap-1 sm:gap-2 lg:hidden">
              <button onClick={() => setIsMobileMenuOpen(true)} className={`p-2 rounded-full transition-colors ${scrolled ? 'text-slate-700 dark:text-slate-300' : 'text-white'}`}><Search className="w-5 h-5" /></button>
              {user && <NotificationBell iconClassName={scrolled ? 'text-slate-700 dark:text-slate-300' : 'text-white'} />}
              {user && (
                <Link to="/dashboard" className="hidden sm:block ml-1">
                  <FallbackImage src={user.profileImage} fallbackType="avatar" className={`w-8 h-8 rounded-full border-2 object-cover ${scrolled ? 'border-primary' : 'border-white'}`} alt="avatar" />
                </Link>
              )}
              <button className={`p-2 ml-1 transition-colors ${scrolled ? 'text-slate-700 dark:text-slate-300' : 'text-white'}`} onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Drawer */}
          <AnimatePresence>
            {isMobileMenuOpen && (
              <>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsMobileMenuOpen(false)} className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] lg:hidden" />
                <motion.div
                  initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  className="fixed top-0 bottom-0 left-0 h-[100dvh] w-[85%] max-w-[320px] bg-white/95 dark:bg-[#0A0A0A]/95 backdrop-blur-3xl border-r border-slate-200/50 dark:border-white/10 z-[101] lg:hidden flex flex-col shadow-2xl"
                >
                  {/* Drawer Header */}
                  <div className="p-4 border-b border-slate-200/50 dark:border-slate-700/50 bg-slate-50/50 dark:bg-slate-800/30 shrink-0">
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center gap-2">
                        <Logo src={settings?.logo} />
                        <span className="font-heading text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">{settings?.siteName || 'Nexoria'}</span>
                      </div>
                      <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 bg-slate-200/50 dark:bg-slate-700/50 rounded-full text-slate-500"><X className="w-5 h-5" /></button>
                    </div>
                    {user ? (
                      <Link to="/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center justify-between bg-white/50 dark:bg-slate-800/50 p-2 rounded-xl border border-slate-200 dark:border-slate-700">
                        <div className="flex items-center gap-3">
                          <FallbackImage src={user.profileImage} fallbackType="avatar" className="w-12 h-12 rounded-xl object-cover" alt="Profile" />
                          <div>
                            <p className="font-bold text-base text-slate-900 dark:text-white line-clamp-1">{user.name}</p>
                            <p className="text-[10px] text-primary font-bold uppercase">{user.role}</p>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      </Link>
                    ) : (
                      <div className="flex gap-3">
                        <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="flex-1 py-2.5 bg-white dark:bg-slate-800 rounded-xl font-bold text-center text-sm border border-slate-200 dark:border-slate-700">Login</Link>
                        <Link to="/register" onClick={() => setIsMobileMenuOpen(false)} className="flex-1 py-2.5 bg-primary text-white rounded-xl font-bold text-center text-sm">Sign Up</Link>
                      </div>
                    )}
                  </div>

                  {/* Drawer Links */}
                  <div className="flex-1 overflow-y-auto p-4 [&::-webkit-scrollbar]:hidden space-y-1.5">
                    <form onSubmit={handleSearchSubmit} className="mb-3">
                      <CustomSearchBar value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search..." />
                    </form>
                    <h4 className="text-xs font-bold text-slate-400 uppercase px-2 pb-1">Navigation</h4>
                    {user && <Link to="/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 px-3 py-2.5 bg-slate-50 dark:bg-slate-800/40 hover:bg-primary/10 rounded-xl font-bold text-sm transition-colors"><UserIcon className="w-5 h-5 text-emerald-500" /> My Dashboard</Link>}
                    <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 px-3 py-2.5 bg-slate-50 dark:bg-slate-800/40 hover:bg-primary/10 rounded-xl font-bold text-sm transition-colors"><Compass className="w-5 h-5 text-primary" /> Home</Link>
                    <Link to="/apps" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 px-3 py-2.5 bg-slate-50 dark:bg-slate-800/40 hover:bg-primary/10 rounded-xl font-bold text-sm transition-colors"><Smartphone className="w-5 h-5 text-indigo-500" /> Apps</Link>
                    <Link to="/categories" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 px-3 py-2.5 bg-slate-50 dark:bg-slate-800/40 hover:bg-primary/10 rounded-xl font-bold text-sm transition-colors"><LayoutGrid className="w-5 h-5 text-blue-500" /> Categories</Link>
                    <Link to="/moviebox/games" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 px-3 py-2.5 bg-slate-50 dark:bg-slate-800/40 hover:bg-primary/10 rounded-xl font-bold text-sm transition-colors"><Gamepad2 className="w-5 h-5 text-blue-500" /> Games</Link>
                    <Link to="/sound" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 px-3 py-2.5 bg-slate-50 dark:bg-slate-800/40 hover:bg-primary/10 rounded-xl font-bold text-sm transition-colors"><Music className="w-5 h-5 text-purple-500" /> Classic Sound</Link>
                    <Link to="/nexoria-music" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 px-3 py-2.5 bg-slate-50 dark:bg-slate-800/40 hover:bg-primary/10 rounded-xl font-bold text-sm transition-colors"><Music className="w-5 h-5 text-pink-500" /> Nexoria Music</Link>
                    <Link to="/nexoria-arena" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 px-3 py-2.5 bg-slate-50 dark:bg-slate-800/40 hover:bg-primary/10 rounded-xl font-bold text-sm transition-colors"><Gamepad2 className="w-5 h-5 text-red-500" /> Arena</Link>
                    <Link to="/aura" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 px-3 py-2.5 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/30 rounded-xl font-bold text-sm text-amber-600 dark:text-amber-400 transition-colors"><Flame className="w-5 h-5" /> Aura Leaderboard</Link>
                    <Link to="/video-downloader" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 px-3 py-2.5 bg-slate-50 dark:bg-slate-800/40 hover:bg-primary/10 rounded-xl font-bold text-sm transition-colors"><DownloadCloud className="w-5 h-5 text-emerald-500" /> YT Downloader</Link>
                    <Link to="/requests" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 px-3 py-2.5 bg-slate-50 dark:bg-slate-800/40 hover:bg-primary/10 rounded-xl font-bold text-sm transition-colors"><Compass className="w-5 h-5 text-indigo-500" /> Requests</Link>
                    <Link to="/premium" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 px-3 py-2.5 bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-200 dark:border-indigo-800/30 rounded-xl font-bold text-sm text-indigo-600 dark:text-indigo-400 transition-colors"><Star className="w-5 h-5" /> Premium</Link>
                    {user && (
                      <div className="pt-3 border-t border-slate-200/50 dark:border-slate-700/50 mt-2 space-y-1.5">
                        <h4 className="text-xs font-bold text-slate-400 uppercase px-2">Settings</h4>
                        <div className="flex items-center justify-between px-3 py-2.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
                          <span className="font-bold text-sm">Content Mode</span>
                          <button onClick={() => { setIsMobileMenuOpen(false); setIsParentalModalOpen(true); }} className="flex items-center bg-slate-200 dark:bg-slate-900 rounded-full p-1 border border-slate-300 dark:border-slate-700">
                            <div className={`px-3 py-1.5 rounded-full text-[10px] font-bold transition-all ${!isKidsMode ? 'bg-rose-500 text-white' : 'text-slate-500'}`}>ADULT</div>
                            <div className={`px-3 py-1.5 rounded-full text-[10px] font-bold transition-all ${isKidsMode ? 'bg-emerald-500 text-white' : 'text-slate-500'}`}>KIDS</div>
                          </button>
                        </div>
                        {['admin', 'superadmin', 'owner'].includes(user.role) && (
                          <Link to={user.role !== 'admin' ? '/superadmin' : '/admin'} onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 px-3 py-2.5 hover:bg-slate-100 dark:hover:bg-slate-800/60 rounded-xl font-semibold text-sm transition-colors">
                            <ShieldAlert className="w-5 h-5 text-slate-400" /> Admin Panel
                          </Link>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Drawer Footer */}
                  <div className="p-4 border-t border-slate-200/50 dark:border-slate-700/50 bg-slate-50/50 dark:bg-slate-800/30 shrink-0 flex flex-col gap-3">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-sm text-slate-600 dark:text-slate-300">Theme</span>
                      <div className="flex gap-2">
                        <button onClick={toggleCyberpunk} className={`p-2 shadow-sm rounded-full active:scale-95 ${isCyberpunk ? 'bg-fuchsia-500/20 text-fuchsia-400' : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}><Gamepad2 className="w-5 h-5" /></button>
                        <button onClick={toggleTheme} className="p-2 bg-white dark:bg-slate-700 shadow-sm rounded-full text-slate-600 dark:text-slate-300 active:scale-95">{isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}</button>
                      </div>
                    </div>
                    {user && (
                      <button onClick={() => { setIsMobileMenuOpen(false); handleLogout(); }} className="w-full flex items-center justify-center gap-2 py-3.5 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-xl font-bold text-sm hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors">
                        <LogOut className="w-4 h-4" /> Sign Out
                      </button>
                    )}
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>

          <ParentalGateModal
            isOpen={isParentalModalOpen}
            onClose={() => setIsParentalModalOpen(false)}
            mode={isKidsMode ? 'disable' : 'enable'}
            onSuccess={() => dispatch(toggleKidsMode())}
          />
        </nav>
      <div className="h-24"></div>
      <BottomNavigation onMenuClick={() => setIsMobileMenuOpen(true)} />
    </>
  );
};

export default Navbar;
