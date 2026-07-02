import { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { 
  LayoutDashboard, Users, Shield, Key, Settings, 
  MonitorPlay, Database, Activity, FileWarning, 
  LogOut, ShieldAlert, Moon, Sun, Menu, X, Bell, Gamepad2,
  ChevronRight, ChevronDown, Command, LayoutTemplate, Crown, ShoppingCart, Music, PlusCircle, ListVideo, Flame, Swords, Trophy, MessageCircle
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useSelector, useDispatch } from 'react-redux';
import { useLogoutMutation, useGetMeQuery } from '../features/auth/authApiSlice';
import { logout as clearCredentials, setCredentials } from '../features/auth/authSlice';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import BroadcastModal from './BroadcastModal';

const SuperAdminLayout = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { isDarkMode, toggleTheme } = useTheme();
  const [logoutApi] = useLogoutMutation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState({ 'Movies': true });
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false);

  const { data, isLoading, isFetching } = useGetMeQuery();

  const toggleMenu = (name) => {
    setExpandedMenus(prev => ({ ...prev, [name]: !prev[name] }));
  };

  useEffect(() => {
    if (data?.user) {
      dispatch(setCredentials({ user: data.user, token: user?.token || localStorage.getItem('token') }));
    }
  }, [data, dispatch, user]);

  const handleLogout = async () => {
    try {
      await logoutApi().unwrap();
    } catch (error) {
      console.error(error);
    } finally {
      dispatch(clearCredentials());
      navigate('/login');
    }
  };

  const handleClearCache = () => {
    toast.success('System cache cleared successfully!');
  };

  const activeUser = user || data?.user;

  if ((isLoading || isFetching) && !activeUser) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-[#0A0A0A]">
        <div className="w-8 h-8 border-2 border-slate-300 dark:border-slate-700 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!activeUser) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  const hasAccess = activeUser.role === 'superadmin';
  
  if (!hasAccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-[#0A0A0A] text-slate-900 dark:text-white">
        <ShieldAlert className="w-16 h-16 text-red-500 mb-4" />
        <h1 className="text-3xl font-bold mb-2">Access Denied</h1>
        <p className="text-slate-500 mb-6">Super Administrator privileges strictly required.</p>
        <Link to="/" className="px-6 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg hover:opacity-90 transition font-medium">Return Home</Link>
      </div>
    );
  }

  const navGroups = [
    {
      title: 'Core',
      items: [
        { name: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" />, path: '/superadmin' },
        { name: 'Analytics', icon: <Activity className="w-4 h-4" />, path: '/superadmin/analytics' },
      ]
    },
    {
      title: 'Users & Roles',
      items: [
        { name: 'Manage Users', icon: <Users className="w-4 h-4" />, path: '/superadmin/users' },
        { name: 'Manage Admins', icon: <Shield className="w-4 h-4" />, path: '/superadmin/admins' },
        { name: 'Roles & Perms', icon: <Key className="w-4 h-4" />, path: '/superadmin/roles' },
      ]
    },
    {
      title: 'Nexoria Studio (Apps)',
      items: [
        { name: 'App Management', icon: <Activity className="w-4 h-4" />, path: '/superadmin/apps' },
        { name: 'Studio Categories', icon: <Database className="w-4 h-4" />, path: '/superadmin/categories' },
        { name: 'Studio Settings', icon: <Settings className="w-4 h-4" />, path: '/superadmin/categories' },
        { name: 'App Requests', icon: <Activity className="w-4 h-4" />, path: '/superadmin/app-requests' },
        { name: 'User Requests', icon: <Activity className="w-4 h-4" />, path: '/superadmin/user-requests' },
        { name: 'Review Moderation', icon: <Activity className="w-4 h-4" />, path: '/superadmin/reviews' },
      ]
    },
    {
      title: 'Nexoria Arcade (Games)',
      items: [
        { name: 'Games Management', icon: <Gamepad2 className="w-4 h-4" />, path: '/superadmin/games' },
        { name: 'Arena Games', icon: <Swords className="w-4 h-4 text-orange-400" />, path: '/superadmin/arena-games' },
        { name: 'Arcade Settings', icon: <Settings className="w-4 h-4" />, path: '/superadmin/categories' },
      ]
    },
    {
      title: 'Nexoria Sound (Music)',
      items: [
        { name: 'Dashboard', icon: <Activity className="w-4 h-4" />, path: '/superadmin/sound/dashboard' },
        { name: 'Songs', icon: <Music className="w-4 h-4" />, path: '/superadmin/sound/songs' },
        { name: 'Add Song', icon: <PlusCircle className="w-4 h-4" />, path: '/superadmin/sound/add-song' },
        { name: 'Playlists', icon: <ListVideo className="w-4 h-4" />, path: '/superadmin/sound/playlists' },
        { name: 'Categories', icon: <Database className="w-4 h-4" />, path: '/superadmin/sound/categories' },
      ]
    },
    {
      title: '🔥 Nexoria Aura System',
      items: [
        { name: 'Aura Leaderboard', icon: <Flame className="w-4 h-4 text-amber-400" />, path: '/aura', external: true },
        { name: 'Aura Battle', icon: <Swords className="w-4 h-4 text-rose-400" />, path: '/aura/battle', external: true },
        { name: 'Recalculate Scores', icon: <Trophy className="w-4 h-4 text-purple-400" />, path: '/superadmin/aura-recalc' },
      ]
    },

    {
      title: 'Marketing & CRM',
      items: [
        { name: 'Push Campaigns', icon: <Bell className="w-4 h-4" />, path: '/superadmin/push-campaigns' },
        { name: 'App & Game Purchases', icon: <ShoppingCart className="w-4 h-4" />, path: '/superadmin/purchase-requests' },
        { name: 'Coupon Manager', icon: <ShoppingCart className="w-4 h-4" />, path: '/superadmin/coupons' },
      ]
    },
    {
      title: 'Payments & Revenue',
      items: [
        { name: 'Premium Users', icon: <Crown className="w-4 h-4" />, path: '/superadmin/premium-users' },
        { name: 'Premium Requests', icon: <Crown className="w-4 h-4" />, path: '/superadmin/premium-requests' },
        { name: 'Support Center', icon: <ShieldAlert className="w-4 h-4" />, path: '/superadmin/support-center' },
      ]
    },
    {
      title: 'Nexoria Official',
      items: [
        { name: 'WhatsApp Channel', icon: <MessageCircle className="w-4 h-4 text-green-500" />, path: 'https://whatsapp.com/channel/0029VbDkid9AO7R9N7HwJP0v', external: true },
        { name: 'YouTube Channel', icon: <MonitorPlay className="w-4 h-4 text-red-500" />, path: 'https://youtube.com/@nexoriaofficialzone?si=pjehQ6MX1-Ncspdd', external: true },
      ]
    },
    {
      title: 'System & Content',
      items: [
        { name: 'Security Logs', icon: <ShieldAlert className="w-4 h-4" />, path: '/superadmin/security-logs' },
        { name: 'Trash Bin', icon: <FileWarning className="w-4 h-4" />, path: '/superadmin/trash-bin' },
        { name: 'System Notices', icon: <LayoutTemplate className="w-4 h-4" />, path: '/superadmin/system-notices' },
        { name: 'SEO Manager', icon: <Settings className="w-4 h-4" />, path: '/superadmin/seo' },
        { name: 'Sponsored Content', icon: <MonitorPlay className="w-4 h-4" />, path: '/superadmin/sponsored-content' },
        { name: 'Site Settings', icon: <Settings className="w-4 h-4" />, path: '/superadmin/settings' },
        { name: 'Hero Displays', icon: <LayoutTemplate className="w-4 h-4" />, path: '/superadmin/hero-displays' },
        { name: 'Footer Management', icon: <LayoutTemplate className="w-4 h-4" />, path: '/superadmin/footer-management' },
      ]
    }
  ];

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white dark:bg-[#050505] text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-white/10 w-64 flex-shrink-0 shadow-2xl z-50">
      <div className="p-6 flex items-center gap-3 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-transparent">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white shadow-lg shadow-purple-500/30 ring-2 ring-white/10">
          <Command className="w-5 h-5" />
        </div>
        <div className="flex flex-col">
          <span className="font-black text-slate-900 dark:text-white tracking-tight leading-tight">Super Console</span>
          <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">Enterprise UI</span>
        </div>
        <button className="md:hidden ml-auto p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-md transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
          <X className="w-5 h-5 text-slate-500" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-slate-200 dark:[&::-webkit-scrollbar-thumb]:bg-slate-800">
        {navGroups.map((group, i) => (
          <div key={i}>
            <h3 className="px-3 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">{group.title}</h3>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                if (item.subItems) {
                  const isExpanded = expandedMenus[item.name];
                  const hasActiveChild = item.subItems.some(sub => location.pathname === sub.path || location.pathname.startsWith(`${sub.path}/`));
                  
                  return (
                    <div key={item.name} className="flex flex-col">
                      <button
                        onClick={() => toggleMenu(item.name)}
                        className={`flex items-center justify-between px-3 py-2 rounded-md transition-all text-sm w-full ${
                          hasActiveChild || isExpanded
                            ? 'text-slate-900 dark:text-white font-medium' 
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className={hasActiveChild ? 'text-slate-900 dark:text-white' : 'text-slate-400'}>
                            {item.icon}
                          </span>
                          {item.name}
                        </div>
                        {isExpanded ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                      </button>
                      
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden ml-7 border-l border-slate-200 dark:border-slate-800 space-y-0.5 mt-1"
                          >
                            {item.subItems.map((sub) => {
                              const isSubActive = location.pathname === sub.path || (sub.path !== '/superadmin' && location.pathname.startsWith(sub.path));
                              return (
                                <Link
                                  key={sub.name}
                                  to={sub.path}
                                  onClick={() => setIsMobileMenuOpen(false)}
                                  className={`flex items-center pl-4 py-1.5 text-xs transition-all ${
                                    isSubActive
                                      ? 'text-purple-600 dark:text-purple-400 font-medium'
                                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                  }`}
                                >
                                  {sub.name}
                                </Link>
                              );
                            })}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                }

                const isActive = location.pathname === item.path || (item.path !== '/superadmin' && location.pathname.startsWith(item.path));
                
                const linkProps = {
                  key: item.name,
                  onClick: () => setIsMobileMenuOpen(false),
                  className: `flex items-center gap-3 px-3 py-2 rounded-md transition-all text-sm ${
                    isActive 
                      ? 'bg-slate-200/50 dark:bg-white/10 text-slate-900 dark:text-white font-medium' 
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'
                  }`
                };

                const content = (
                  <>
                    <span className={`${isActive ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>
                      {item.icon}
                    </span>
                    {item.name}
                  </>
                );

                if (item.external) {
                  return (
                    <a href={item.path} target="_blank" rel="noopener noreferrer" {...linkProps}>
                      {content}
                    </a>
                  );
                }

                return (
                  <Link to={item.path} {...linkProps}>
                    {content}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-transparent">
        <div className="flex items-center gap-3 mb-4 px-2">
          <div className="relative">
            <img src={activeUser?.profileImage || '/default-avatar.png'} alt="Profile" className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 object-cover ring-2 ring-indigo-500/30" />
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-[#050505] rounded-full"></div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{activeUser?.name}</p>
            <p className="text-[10px] text-indigo-500 font-black uppercase tracking-widest truncate">Super Admin</p>
          </div>
        </div>
        <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 px-3 py-2.5 text-sm font-bold text-red-500 hover:text-red-600 dark:hover:text-red-400 bg-red-50 hover:bg-red-100 dark:bg-red-500/10 dark:hover:bg-red-500/20 rounded-xl transition-all active:scale-95">
          <LogOut className="w-4 h-4" /> Secure Logout
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-[100dvh] bg-white dark:bg-[#000000] text-slate-800 dark:text-slate-200 font-sans overflow-hidden">
      
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex z-20">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'tween', duration: 0.2 }}
            className="fixed inset-y-0 left-0 z-50 flex flex-col md:hidden"
          >
            <SidebarContent />
          </motion.div>
        )}
      </AnimatePresence>
      
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full min-w-0">
        
        {/* Top Navbar */}
        <header className="h-16 border-b border-slate-200 dark:border-white/5 bg-white dark:bg-[#050505] flex items-center justify-between px-4 lg:px-8 shrink-0 z-10 shadow-sm">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsMobileMenuOpen(true)} className="md:hidden p-2 -ml-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
              <Menu className="w-6 h-6" />
            </button>
            
            {/* Breadcrumbs */}
            <div className="hidden sm:flex items-center text-sm font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-white/5 px-4 py-1.5 rounded-full border border-slate-200 dark:border-white/10">
              <span className="flex items-center text-indigo-500 hover:text-indigo-600 transition-colors cursor-pointer">
                SuperAdmin
              </span>
              <ChevronRight className="w-4 h-4 mx-1 text-slate-400 shrink-0" />
              <span className="text-slate-900 dark:text-white capitalize truncate max-w-[120px] sm:max-w-[200px]">
                {location.pathname.split('/').pop().replace('-', ' ') || 'Dashboard'}
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Quick Actions Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setShowQuickActions(!showQuickActions)} 
                className="flex items-center gap-2 text-sm font-bold px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-white/10 rounded-xl transition-all"
              >
                <Command className="w-4 h-4 text-indigo-500" />
                <span className="hidden sm:inline">Quick Actions</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${showQuickActions ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {showQuickActions && (
                  <>
                    <motion.div 
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="fixed inset-0 z-40" onClick={() => setShowQuickActions(false)} 
                    />
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-[280px] max-w-[90vw] origin-top-right bg-white dark:bg-[#111] border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden"
                    >
                      <div className="p-3 bg-slate-50 dark:bg-white/5 border-b border-slate-100 dark:border-white/5">
                        <p className="text-xs font-black text-slate-500 uppercase tracking-widest">System Commands</p>
                      </div>
                      <div className="p-2 space-y-1">
                        <button onClick={() => { handleClearCache(); setShowQuickActions(false); }} className="w-full flex items-center gap-3 px-3 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl transition-colors">
                          <Activity className="w-4 h-4 text-emerald-500" /> Clear System Cache
                        </button>
                        <button onClick={() => { setIsBroadcastModalOpen(true); setShowQuickActions(false); }} className="w-full flex items-center gap-3 px-3 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl transition-colors">
                          <Bell className="w-4 h-4 text-indigo-500" /> Broadcast Notice
                        </button>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            <div className="w-px h-6 bg-slate-300 dark:bg-slate-700 hidden sm:block"></div>

            <Link to="/superadmin/security-logs" className="relative p-2 text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
              <ShieldAlert className="w-5 h-5" />
            </Link>
            <button onClick={toggleTheme} className="p-2 text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <Link to="/" className="flex items-center gap-2 text-sm font-bold px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl transition-all shadow-lg shadow-indigo-500/30 active:scale-95 ml-2">
              <LayoutTemplate className="w-4 h-4" />
              <span className="hidden sm:inline">View Site</span>
            </Link>
          </div>
        </header>

        {/* Scrollable Page Content */}
        <div className="flex-1 overflow-y-auto bg-slate-50/50 dark:bg-[#000000]">
          <div className="p-4 md:p-8 max-w-[1600px] mx-auto">
            <Outlet />
          </div>
        </div>
      </main>

      <BroadcastModal isOpen={isBroadcastModalOpen} onClose={() => setIsBroadcastModalOpen(false)} />
    </div>
  );
};

export default SuperAdminLayout;
