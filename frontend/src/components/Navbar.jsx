import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Search, Menu, Moon, Sun, X, ChevronDown, User as UserIcon, 
  LogOut, Key, ShieldAlert, Mic, MicOff, History, TrendingUp, XCircle, Music,
  Compass, Smartphone, Star, ArrowUpRight, LayoutGrid, MonitorPlay, Gamepad2, Dices, Crown
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

const Navbar = () => {
  const { isDarkMode, toggleTheme, isCyberpunk, toggleCyberpunk } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isParentalModalOpen, setIsParentalModalOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  
  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      window.deferredPrompt = e;
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    // Check if it was caught globally before React mounted
    if (window.deferredPrompt) {
      setDeferredPrompt(window.deferredPrompt);
    }
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallApp = async () => {
    // Determine if the user is on Android
    const isAndroid = /Android/i.test(navigator.userAgent);

    if (isAndroid) {
      // Direct APK download for Android users via nightly.link (no GitHub login needed)
      toast.success('Downloading Nexoria Android App...');
      // nightly.link provides the latest GitHub Actions APK without login
      window.open('https://nightly.link/swarupOSD/nexoria/workflows/build-android.yml/main/Nexoria-App-Debug.zip', '_blank');
      setTimeout(() => {
        toast('📦 A ZIP file will download. Open it and install the APK inside!', { duration: 6000, icon: '📱' });
      }, 2000);
      return;
    }

    const prompt = window.deferredPrompt || deferredPrompt;
    if (prompt) {
      prompt.prompt();
      const { outcome } = await prompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        window.deferredPrompt = null;
      }
    } else {
      toast('You can also install the app by clicking the icon in your browser address bar!', { icon: '💡' });
    }
  };
  
  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchSuggest, setShowSearchSuggest] = useState(false);
  const [isListening, setIsListening] = useState(false);
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

  // Scroll effect
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Mobile menu behaviors: ESC key, route change, body scroll lock
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleEsc = (e) => { if (e.key === 'Escape') setIsMobileMenuOpen(false); };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => { document.body.style.overflow = 'auto'; };
  }, [isMobileMenuOpen]);

  // Load search history
  useEffect(() => {
    const history = JSON.parse(localStorage.getItem('searchHistory') || '[]');
    setSearchHistory(history);
  }, []);

  // Click outside search
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSearchSuggest(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await logoutApiCall().unwrap();
    } catch (err) {} 
    finally {
      dispatch(logout());
      navigate('/');
    }
  };

  const executeSearch = (query) => {
    if (!query.trim()) return;
    
    // Save history
    let history = JSON.parse(localStorage.getItem('searchHistory') || '[]');
    history = [query, ...history.filter(h => h !== query)].slice(0, 5);
    localStorage.setItem('searchHistory', JSON.stringify(history));
    setSearchHistory(history);
    
    setSearchQuery('');
    setShowSearchSuggest(false);
    navigate(`/search?q=${encodeURIComponent(query)}`);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    executeSearch(searchQuery);
  };

  const removeHistoryItem = (e, item) => {
    e.stopPropagation();
    const newHistory = searchHistory.filter(h => h !== item);
    localStorage.setItem('searchHistory', JSON.stringify(newHistory));
    setSearchHistory(newHistory);
  };

  const [voiceLang, setVoiceLang] = useState('en-US');

  // Web Speech API
  const startVoiceSearch = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
    } catch (err) {
      toast.error('Microphone permission denied. Please allow microphone access in your browser settings.');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error('Voice search is not supported in your browser.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = voiceLang;

      recognition.onstart = () => {
        setIsListening(true);
        setShowSearchSuggest(true);
      };

      recognition.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        
        const currentTranscript = finalTranscript || interimTranscript;
        if (currentTranscript) {
          setSearchQuery(currentTranscript);
        }

        if (finalTranscript) {
          setIsListening(false);
          recognition.stop();
          setTimeout(() => {
            executeSearch(finalTranscript);
          }, 800);
        }
      };

      recognition.onerror = (event) => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (e) {
      toast.error('Could not start voice recognition.');
      setIsListening(false);
    }
  };

  const handleSurpriseMe = async () => {
    try {
      const res = await fetch('/api/posts?limit=50');
      const data = await res.json();
      const apps = data?.data?.posts || [];
      if (apps.length > 0) {
        const randomApp = apps[Math.floor(Math.random() * apps.length)];
        navigate(`/post/${randomApp.slug}`);
        toast.success('Surprise! 🎲');
      } else {
        toast.error('No apps available to surprise you right now!');
      }
    } catch (err) {
      toast.error('Could not fetch apps for surprise.');
    }
  };

  return (
    <>
      <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${scrolled ? 'backdrop-blur-2xl bg-white/80 dark:bg-[#0A0A0A]/80 border-b border-black/5 dark:border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.05)] py-2 sm:py-3' : 'bg-gradient-to-b from-black/50 to-transparent sm:bg-transparent py-3 sm:py-5'}`}>
        <div className="container mx-auto px-4 flex items-center justify-between">
          
          {/* Logo */}
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="relative">
                <Logo src={settings.logo} />
              </div>
              <span className="font-heading text-xl md:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent tracking-tight drop-shadow-sm">
                {settings?.siteName || 'Nexoria'}
              </span>
            </Link>
          </div>

          {/* Desktop Links & Advanced Search */}
          <div className="hidden lg:flex items-center gap-3 xl:gap-5 flex-1 justify-center px-2 xl:px-4 whitespace-nowrap">
            <Link to="/" className={`text-sm font-bold transition-colors ${location.pathname === '/' ? 'text-primary' : 'text-slate-700 dark:text-slate-300 hover:text-primary'}`}>
              Home
            </Link>
            <Link to="/requests" className={`text-sm font-bold transition-colors flex items-center gap-1 ${location.pathname === '/requests' ? 'text-primary' : 'text-slate-700 dark:text-slate-300 hover:text-primary'}`}>
              Requests
            </Link>
            
            {/* Categories Dropdown */}
            <DropdownMenu 
              align="left" 
              width="w-[500px]"
              closeOnClickInside={true}
              trigger={
                <button className="flex items-center gap-1 text-sm font-bold text-slate-700 dark:text-slate-300 hover:text-primary transition-colors">
                  <LayoutGrid className="w-4 h-4" /> Categories <ChevronDown className="w-3 h-3" />
                </button>
              }
            >
              <div className="grid grid-cols-3 gap-3 p-4 glass shadow-2xl rounded-3xl">
                {categories.slice(0, 9).map(cat => (
                  <Link key={cat._id} to={`/category/${cat.slug}`} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold overflow-hidden">
                      {cat.image && cat.image !== 'default-category.jpg' ? (
                        <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                      ) : (
                        cat.name.charAt(0)
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-sm text-slate-900 dark:text-white">{cat.name}</p>
                      <p className="text-[10px] text-slate-500">{cat.appCount || 0} Apps</p>
                    </div>
                  </Link>
                ))}
                <Link to="/category/apps" className="col-span-3 text-center py-2 text-primary font-bold hover:underline text-sm">
                  View All Categories
                </Link>
              </div>
            </DropdownMenu>
            
            <Link to="/apps" className={`text-sm font-bold transition-colors ${location.pathname === '/apps' ? 'text-indigo-500' : 'text-slate-700 dark:text-slate-300 hover:text-indigo-500'}`}>
              Apps
            </Link>
            
            <Link to="/moviebox/games" className={`text-sm font-bold transition-colors ${location.pathname === '/moviebox/games' ? 'text-blue-500' : 'text-slate-700 dark:text-slate-300 hover:text-blue-500'}`}>
              Games
            </Link>
            <Link to="/sound" className={`text-sm font-bold transition-colors ${location.pathname.startsWith('/sound') ? 'text-purple-500' : 'text-slate-700 dark:text-slate-300 hover:text-purple-500'}`}>
              Music
            </Link>

            <Link to="/nexoria-arena" className={`text-sm font-bold flex items-center gap-1 transition-colors ${location.pathname === '/nexoria-arena' ? 'text-red-500' : 'text-slate-700 dark:text-slate-300 hover:text-red-500'}`}>
              🎮 Arena
            </Link>

            <Link to="/aura" className={`text-sm font-bold flex items-center gap-1 transition-colors ${location.pathname.startsWith('/aura') ? 'text-amber-500' : 'text-slate-700 dark:text-slate-300 hover:text-amber-500'}`}>
              🔥 Aura
            </Link>

            <Link to="/premium" className={`text-sm font-bold transition-colors ${location.pathname === '/premium' ? 'text-accent' : 'text-slate-700 dark:text-slate-300 hover:text-accent'}`}>
              Premium 💎
            </Link>
            <Link to="/vip-lounge" className={`text-sm font-bold transition-colors ${location.pathname === '/vip-lounge' ? 'text-amber-500' : 'text-slate-700 dark:text-slate-300 hover:text-amber-500'}`}>
              VIP 👑
            </Link>

            {/* Advanced Search Bar */}
            <div className="relative w-full max-w-[200px] xl:max-w-xs transition-all duration-300 focus-within:max-w-[250px] xl:focus-within:max-w-sm" ref={searchRef}>
              <form onSubmit={handleSearchSubmit} className="relative flex items-center justify-center">
                <CustomSearchBar 
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowSearchSuggest(true);
                  }}
                  onFocus={() => setShowSearchSuggest(true)}
                  placeholder="Search..."
                />
                <div className="relative ml-2 flex items-center gap-1 bg-white dark:bg-[#1A1A1A] p-1 rounded-lg backdrop-blur-md shadow-sm border border-slate-200/50 dark:border-white/10 z-10">
                  <select 
                    value={voiceLang}
                    onChange={(e) => setVoiceLang(e.target.value)}
                    className="bg-transparent text-xs font-bold text-slate-500 dark:text-slate-400 focus:outline-none cursor-pointer hover:text-primary transition-colors appearance-none pr-1"
                  >
                    <option value="en-US">ENG</option>
                    <option value="bn-BD">BAN</option>
                    <option value="hi-IN">HIN</option>
                  </select>
                  <div className="w-px h-4 bg-slate-300 dark:bg-slate-700 mx-1"></div>
                  <button 
                    type="button" 
                    onClick={isListening ? null : startVoiceSearch}
                    className={`p-1.5 rounded-full transition-colors ${isListening ? 'bg-red-500 text-white animate-pulse shadow-lg shadow-red-500/30' : 'text-slate-500 hover:text-primary hover:bg-primary/10'}`}
                  >
                    {isListening ? <Mic className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </button>
                </div>
              </form>

              {/* Search Suggestions Dropdown */}
              <AnimatePresence>
                {showSearchSuggest && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden overflow-y-auto max-h-[400px]"
                  >
                    {isListening && (
                      <div className="p-4 text-center border-b border-slate-100 dark:border-slate-800 bg-red-50 dark:bg-red-900/20">
                        <Mic className="w-6 h-6 text-red-500 mx-auto mb-2 animate-bounce" />
                        <p className="text-sm font-bold text-red-600 dark:text-red-400">Listening... Speak now</p>
                      </div>
                    )}

                    {searchQuery.length >= 2 ? (
                      <div className="p-2">
                        <h4 className="text-xs font-bold text-slate-400 uppercase px-3 py-2">Results</h4>
                        {isSearching ? (
                           <div className="p-4 text-center"><div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div></div>
                        ) : searchSuggestions.length > 0 ? (
                          searchSuggestions.map(app => (
                            <div key={app._id} onClick={() => executeSearch(app.title)} className="flex items-center gap-3 p-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl cursor-pointer transition-colors group">
                              <img src={app.appLogo} alt={app.title} className="w-10 h-10 rounded-lg shadow-sm" />
                              <div className="flex-1">
                                <h5 className="text-sm font-bold group-hover:text-primary truncate">{app.title}</h5>
                                <p className="text-[10px] text-slate-500">{app.categoryObj?.name}</p>
                              </div>
                              <ArrowUpRight className="w-4 h-4 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                          ))
                        ) : (
                          <div className="p-4 text-center text-sm text-slate-500">No results found</div>
                        )}
                      </div>
                    ) : (
                      <>
                        {/* Search History */}
                        {searchHistory.length > 0 && (
                          <div className="p-2 border-b border-slate-100 dark:border-slate-800">
                            <h4 className="text-xs font-bold text-slate-400 uppercase px-3 py-2 flex items-center gap-2"><History className="w-3 h-3"/> Recent Searches</h4>
                            {searchHistory.map((item, i) => (
                              <div key={i} className="flex items-center justify-between px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg cursor-pointer group" onClick={() => executeSearch(item)}>
                                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{item}</span>
                                <button onClick={(e) => removeHistoryItem(e, item)} className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><XCircle className="w-4 h-4"/></button>
                              </div>
                            ))}
                            <Link to="/profile" className="flex items-center gap-2 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                              <UserIcon className="w-4 h-4 text-slate-500" />
                              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Profile</span>
                            </Link>

                            {(deferredPrompt || /Android/i.test(navigator.userAgent)) && (
                              <button onClick={handleInstallApp} className="flex items-center gap-2 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors w-full text-left">
                                <Smartphone className="w-4 h-4 text-primary" />
                                <span className="text-sm font-bold text-primary">Install App</span>
                              </button>
                            )}

                            <button onClick={handleLogout} className="flex items-center gap-2 p-2 w-full text-left hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors text-red-500"><XCircle className="w-4 h-4"/></button>
                          </div>
                        )}
                        {/* Trending Searches */}
                        <div className="p-2">
                          <h4 className="text-xs font-bold text-slate-400 uppercase px-3 py-2 flex items-center gap-2"><TrendingUp className="w-3 h-3"/> Trending Now</h4>
                          <div className="flex flex-wrap gap-2 px-3 pb-2">
                            {trendingSearches.map(app => (
                              <span key={app._id} onClick={() => executeSearch(app.title)} className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-primary hover:text-white dark:hover:bg-primary dark:hover:text-white text-xs font-medium rounded-full cursor-pointer transition-colors border border-slate-200 dark:border-slate-700">
                                {app.title}
                              </span>
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

          {/* Right Side Tools */}
          <div className="hidden lg:flex items-center gap-3">
            <button
              onClick={() => setIsParentalModalOpen(true)}
              className="flex items-center bg-slate-200 dark:bg-slate-800 rounded-full p-1 shadow-inner border border-slate-300 dark:border-slate-700 transition-colors cursor-pointer group"
              title="Change Content Mode"
            >
              <div className={`px-3 py-1.5 rounded-full flex items-center gap-1.5 text-[10px] sm:text-xs font-bold transition-all duration-300 ${!isKidsMode ? 'bg-rose-500 text-white shadow-md shadow-rose-500/30' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white'}`}>
                🔞 ADULT
              </div>
              <div className={`px-3 py-1.5 rounded-full flex items-center gap-1.5 text-[10px] sm:text-xs font-bold transition-all duration-300 ${isKidsMode ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white'}`}>
                🧸 KIDS
              </div>
            </button>

            <button onClick={toggleCyberpunk} className={`p-2.5 rounded-full transition-all duration-300 ${isCyberpunk ? 'bg-fuchsia-500/20 text-fuchsia-400 shadow-[0_0_15px_rgba(255,0,255,0.5)]' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'}`} title="Toggle Cyberpunk Mode">
              <Gamepad2 className="w-5 h-5" />
            </button>

            <button onClick={handleSurpriseMe} className="p-2.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors hover:rotate-180 duration-500" title="Surprise Me!">
              <Dices className="w-5 h-5 text-indigo-500" />
            </button>

            <button onClick={toggleTheme} className="p-2.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors">
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            
            {user && (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-full" title="Reward Points">
                  <span className="text-amber-500 text-sm">🪙</span>
                  <span className="font-bold text-amber-600 dark:text-amber-500 text-sm">{user.rewardPoints || 0}</span>
                </div>
                {user.currentStreak > 0 && (
                  <div className="flex items-center gap-1 bg-orange-500/10 border border-orange-500/20 px-2.5 py-1.5 rounded-full" title="Daily Streak">
                    <span className="text-orange-500 text-sm">🔥</span>
                    <span className="font-bold text-orange-600 dark:text-orange-500 text-sm">{user.currentStreak}</span>
                  </div>
                )}
              </div>
            )}
            
            {user && <NotificationBell iconClassName={scrolled ? 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800' : 'text-white hover:bg-white/20'} />}

            {user ? (
              <DropdownMenu 
                align="right"
                width="w-64"
                trigger={
                  <button className="flex items-center gap-2 bg-white/80 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 pl-2 pr-4 py-1.5 rounded-full transition-all shadow-sm">
                    <FallbackImage src={user.profileImage} fallbackType="avatar" alt="avatar" className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-700 object-cover" />
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-200 truncate max-w-[100px]">{user.name.split(' ')[0]}</span>
                  </button>
                }
              >
                <div className="p-4 text-center border-b border-slate-100 dark:border-slate-800 mb-2">
                  <FallbackImage src={user.profileImage} fallbackType="avatar" className="w-16 h-16 rounded-full mx-auto mb-2 border-2 border-primary object-cover" alt="Profile" />
                  <p className="font-bold text-slate-900 dark:text-white">{user.name}</p>
                  <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">{user.role}</p>
                </div>
                <Link to="/dashboard" className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors mx-2 mb-1">
                  <UserIcon className="w-4 h-4 text-primary" /> Profile Dashboard
                </Link>
                {['admin', 'superadmin'].includes(user.role) && (
                  <Link to={user.role === 'superadmin' ? '/superadmin' : '/admin'} className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors mx-2 mb-1">
                    <ShieldAlert className="w-4 h-4 text-accent" /> Admin Panel
                  </Link>
                )}
                <button onClick={handleInstallApp} className="w-[calc(100%-16px)] flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-primary hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors mx-2 mb-1 text-left">
                  <Smartphone className="w-4 h-4 text-primary" /> Install App
                </button>
                <button onClick={handleLogout} className="w-[calc(100%-16px)] flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors mx-2 mb-2">
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="px-5 py-2.5 text-sm font-semibold text-slate-700 dark:text-white/70 hover:text-slate-900 dark:hover:text-white transition-colors">Log in</Link>
                <Link to="/register" className="px-5 py-2.5 text-sm font-semibold bg-black hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-200 text-white dark:text-black rounded-full transition-all shadow-lg active:scale-95">Sign Up</Link>
              </div>
            )}
          </div>

          {/* Mobile Right Icons & Menu */}
          <div className="flex items-center gap-1 sm:gap-2 lg:hidden">
            <button onClick={() => setIsMobileMenuOpen(true)} className={`p-2 rounded-full transition-colors ${scrolled ? 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800' : 'text-white hover:bg-white/20'}`}>
              <Search className="w-5 h-5" />
            </button>
            {user && (
              <NotificationBell iconClassName={scrolled ? 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800' : 'text-white hover:bg-white/20'} />
            )}
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

        {/* Premium Mobile Drawer */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <>
              {/* Backdrop */}
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }} 
                onClick={() => setIsMobileMenuOpen(false)} 
                className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] lg:hidden"
              />
              
              {/* Drawer */}
              <motion.div 
                initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="fixed top-0 bottom-0 left-0 h-[100dvh] w-[85%] max-w-[320px] bg-white/95 dark:bg-[#0A0A0A]/95 backdrop-blur-3xl border-r border-slate-200/50 dark:border-white/10 z-[101] lg:hidden flex flex-col shadow-2xl"
              >
                {/* Drawer Header & Profile */}
                <div className="p-6 border-b border-slate-200/50 dark:border-slate-700/50 bg-slate-50/50 dark:bg-slate-800/30 shrink-0">
                  <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-2">
                      <Logo src={settings?.logo} />
                      <span className="font-heading text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent tracking-tight">
                        {settings?.siteName || 'Nexoria'}
                      </span>
                    </div>
                    <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 bg-slate-200/50 dark:bg-slate-700/50 rounded-full text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  
                  {user ? (
                    <div className="flex items-center gap-4 group">
                      <FallbackImage src={user.profileImage} fallbackType="avatar" className="w-14 h-14 rounded-2xl border-2 border-primary/50 object-cover shadow-lg" alt="Profile" />
                      <div>
                        <p className="font-bold text-lg text-slate-900 dark:text-white line-clamp-1">{user.name}</p>
                        <p className="text-xs text-primary font-bold uppercase tracking-wider">{user.role}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3">
                      <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">Join our community</p>
                      <div className="flex gap-3">
                        <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="flex-1 py-2.5 bg-white dark:bg-slate-800 rounded-xl font-bold text-center text-sm shadow-sm border border-slate-200 dark:border-slate-700">Login</Link>
                        <Link to="/register" onClick={() => setIsMobileMenuOpen(false)} className="flex-1 py-2.5 bg-primary text-white rounded-xl font-bold text-center text-sm shadow-lg shadow-primary/30">Sign Up</Link>
                      </div>
                    </div>
                  )}
                </div>

                {/* Drawer Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 [&::-webkit-scrollbar]:hidden">
                  <form onSubmit={handleSearchSubmit} className="relative flex justify-center mt-2">
                    <CustomSearchBar 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search apps, games..."
                    />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 z-20">
                      <select 
                        value={voiceLang}
                        onChange={(e) => setVoiceLang(e.target.value)}
                        className="bg-transparent text-[10px] font-bold text-slate-500 dark:text-slate-400 focus:outline-none cursor-pointer appearance-none"
                      >
                        <option value="en-US">EN</option>
                        <option value="bn-BD">BN</option>
                        <option value="hi-IN">HI</option>
                      </select>
                      <button type="button" onClick={startVoiceSearch} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-primary transition-colors">
                        <Mic className="w-4 h-4"/>
                      </button>
                    </div>
                  </form>

                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 px-2">Navigation</h4>
                    <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 bg-slate-50 dark:bg-slate-800/40 hover:bg-primary/10 dark:hover:bg-primary/20 rounded-2xl font-bold text-sm text-slate-700 dark:text-slate-200 transition-colors">
                      <Compass className="w-5 h-5 text-primary" /> Home
                    </Link>
                    <Link to="/apps" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 bg-slate-50 dark:bg-slate-800/40 hover:bg-primary/10 dark:hover:bg-primary/20 rounded-2xl font-bold text-sm text-slate-700 dark:text-slate-200 transition-colors">
                      <Smartphone className="w-5 h-5 text-indigo-500" /> Apps
                    </Link>
                    <Link to="/categories" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 bg-slate-50 dark:bg-slate-800/40 hover:bg-primary/10 dark:hover:bg-primary/20 rounded-2xl font-bold text-sm text-slate-700 dark:text-slate-200 transition-colors">
                      <LayoutGrid className="w-5 h-5 text-blue-500" /> Categories
                    </Link>
                    <Link to="/moviebox/games" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 bg-slate-50 dark:bg-slate-800/40 hover:bg-primary/10 dark:hover:bg-primary/20 rounded-2xl font-bold text-sm text-slate-700 dark:text-slate-200 transition-colors">
                      <Gamepad2 className="w-5 h-5 text-blue-500" /> Games
                    </Link>
                    <Link to="/sound" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 bg-slate-50 dark:bg-slate-800/40 hover:bg-primary/10 dark:hover:bg-primary/20 rounded-2xl font-bold text-sm text-slate-700 dark:text-slate-200 transition-colors">
                      <Music className="w-5 h-5 text-purple-500" /> Nexoria Music
                    </Link>
                    <Link to="/nexoria-arena" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 bg-slate-50 dark:bg-slate-800/40 hover:bg-primary/10 dark:hover:bg-primary/20 rounded-2xl font-bold text-sm text-slate-700 dark:text-slate-200 transition-colors">
                      <Gamepad2 className="w-5 h-5 text-red-500" /> Arena
                    </Link>
                    <Link to="/aura" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-amber-500/10 to-orange-500/10 hover:from-amber-500/20 hover:to-orange-500/20 border border-amber-500/20 rounded-2xl font-bold text-sm text-amber-600 dark:text-amber-400 transition-colors">
                      🔥 Aura Leaderboard
                    </Link>
                    <Link to="/requests" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 bg-slate-50 dark:bg-slate-800/40 hover:bg-primary/10 dark:hover:bg-primary/20 rounded-2xl font-bold text-sm text-slate-700 dark:text-slate-200 transition-colors">
                      <Compass className="w-5 h-5 text-indigo-500" /> Requests
                    </Link>
                    <Link to="/premium" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-indigo-400/10 to-purple-500/10 hover:from-indigo-400/20 hover:to-purple-500/20 border border-indigo-400/20 rounded-2xl font-bold text-sm text-indigo-600 dark:text-indigo-400 transition-colors">
                      <Star className="w-5 h-5" /> Premium 💎
                    </Link>
                    <Link to="/vip-lounge" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-amber-400/10 to-orange-500/10 hover:from-amber-400/20 hover:to-orange-500/20 border border-amber-400/20 rounded-2xl font-bold text-sm text-amber-600 dark:text-amber-400 transition-colors">
                      <Crown className="w-5 h-5" /> VIP Lounge 👑
                    </Link>
                  </div>

                  {user && (
                    <div className="space-y-2 pt-4 border-t border-slate-200/50 dark:border-slate-700/50">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 px-2">Account & Settings</h4>
                      
                      <div className="flex items-center justify-between px-4 py-3 bg-slate-50 dark:bg-slate-800/40 rounded-2xl mb-2">
                        <span className="font-bold text-sm text-slate-700 dark:text-slate-200">Content Mode</span>
                        <button
                          onClick={() => {
                            setIsMobileMenuOpen(false);
                            setIsParentalModalOpen(true);
                          }}
                          className="flex items-center bg-slate-200 dark:bg-slate-900 rounded-full p-1 shadow-inner border border-slate-300 dark:border-slate-700 transition-colors"
                        >
                          <div className={`px-3 py-1.5 rounded-full flex items-center gap-1.5 text-[10px] font-bold transition-all duration-300 ${!isKidsMode ? 'bg-rose-500 text-white shadow-md shadow-rose-500/30' : 'text-slate-500 dark:text-slate-400'}`}>
                            🔞 ADULT
                          </div>
                          <div className={`px-3 py-1.5 rounded-full flex items-center gap-1.5 text-[10px] font-bold transition-all duration-300 ${isKidsMode ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30' : 'text-slate-500 dark:text-slate-400'}`}>
                            🧸 KIDS
                          </div>
                        </button>
                      </div>

                      <Link to="/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 hover:bg-slate-100 dark:hover:bg-slate-800/60 rounded-2xl font-semibold text-sm text-slate-600 dark:text-slate-300 transition-colors">
                        <UserIcon className="w-5 h-5 text-slate-400" /> My Dashboard
                      </Link>
                      {['admin', 'superadmin'].includes(user.role) && (
                        <Link to={user.role === 'superadmin' ? '/superadmin' : '/admin'} onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 hover:bg-slate-100 dark:hover:bg-slate-800/60 rounded-2xl font-semibold text-sm text-slate-600 dark:text-slate-300 transition-colors">
                          <ShieldAlert className="w-5 h-5 text-slate-400" /> Admin Panel
                        </Link>
                      )}
                    </div>
                  )}
                </div>

                {/* Drawer Footer */}
                <div className="p-6 border-t border-slate-200/50 dark:border-slate-700/50 bg-slate-50/50 dark:bg-slate-800/30 shrink-0 mt-auto flex flex-col gap-4">
                  <div className="flex justify-between items-center px-2">
                    <span className="font-bold text-sm text-slate-600 dark:text-slate-300">Theme</span>
                    <div className="flex gap-2">
                      <button onClick={toggleCyberpunk} className={`p-2 shadow-sm rounded-full transition-transform active:scale-95 ${isCyberpunk ? 'bg-fuchsia-500/20 text-fuchsia-400' : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>
                        <Gamepad2 className="w-5 h-5" />
                      </button>
                      <button onClick={() => { setIsMobileMenuOpen(false); handleSurpriseMe(); }} className="p-2 shadow-sm rounded-full transition-transform active:scale-95 bg-white dark:bg-slate-700 text-indigo-500 dark:text-indigo-400">
                        <Dices className="w-5 h-5" />
                      </button>
                      <button onClick={toggleTheme} className="p-2 bg-white dark:bg-slate-700 shadow-sm rounded-full text-slate-600 dark:text-slate-300 transition-transform active:scale-95">
                        {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                  {user && (
                    <button onClick={() => { setIsMobileMenuOpen(false); handleLogout(); }} className="w-full flex items-center justify-center gap-2 py-3.5 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-2xl font-bold text-sm transition-colors hover:bg-red-100 dark:hover:bg-red-900/40">
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
      {/* Spacer to prevent content overlap */}
      <div className="h-24"></div>
    </>
  );
};

export default Navbar;
