import { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { 
  LayoutDashboard, Users, Shield, Key, Settings, 
  MonitorPlay, Database, Activity, FileWarning, 
  LogOut, ShieldAlert, Moon, Sun, Menu, X, Bell, Gamepad2,
  ChevronRight, ChevronDown, Command, LayoutTemplate, Crown, ShoppingCart, Music, PlusCircle, ListVideo
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useSelector, useDispatch } from 'react-redux';
import { useLogoutMutation, useGetMeQuery } from '../features/auth/authApiSlice';
import { logout as clearCredentials, setCredentials } from '../features/auth/authSlice';
import { motion, AnimatePresence } from 'framer-motion';

const SuperAdminLayout = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { isDarkMode, toggleTheme } = useTheme();
  const [logoutApi] = useLogoutMutation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState({ 'Movies': true });

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
      title: 'Payments & Revenue',
      items: [
        { name: 'Premium Users', icon: <Crown className="w-4 h-4" />, path: '/superadmin/premium-users' },
        { name: 'Premium Requests', icon: <Crown className="w-4 h-4" />, path: '/superadmin/premium-requests' },
        { name: 'App & Game Purchases', icon: <ShoppingCart className="w-4 h-4" />, path: '/superadmin/purchase-requests' },
        { name: 'Coupon Manager', icon: <ShoppingCart className="w-4 h-4" />, path: '/superadmin/coupons' },
        { name: 'Support Center', icon: <ShieldAlert className="w-4 h-4" />, path: '/superadmin/support-center' },
      ]
    },
    {
      title: 'System & Content',
      items: [
        { name: 'Hero Displays', icon: <LayoutTemplate className="w-4 h-4" />, path: '/superadmin/hero-displays' },
        { name: 'System Notices', icon: <LayoutTemplate className="w-4 h-4" />, path: '/superadmin/system-notices' },
        { name: 'SEO Manager', icon: <Settings className="w-4 h-4" />, path: '/superadmin/seo' },
        { name: 'Sponsored Content', icon: <MonitorPlay className="w-4 h-4" />, path: '/superadmin/sponsored-content' },
        { name: 'Site Settings', icon: <Settings className="w-4 h-4" />, path: '/superadmin/settings' },
        { name: 'Footer Management', icon: <LayoutTemplate className="w-4 h-4" />, path: '/superadmin/footer-management' },
        { name: 'Security Logs', icon: <FileWarning className="w-4 h-4" />, path: '/superadmin/security-logs' },
      ]
    }
  ];

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-[#0A0A0A] text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-800 w-64 flex-shrink-0">
      <div className="p-5 flex items-center gap-3">
        <div className="w-8 h-8 rounded bg-gradient-to-tr from-rose-500 to-red-600 flex items-center justify-center text-white shadow-sm">
          <Command className="w-4 h-4" />
        </div>
        <span className="font-bold text-slate-900 dark:text-white tracking-tight">Super Console</span>
        <button className="md:hidden ml-auto" onClick={() => setIsMobileMenuOpen(false)}>
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
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2 rounded-md transition-all text-sm ${
                      isActive 
                        ? 'bg-slate-200/50 dark:bg-white/10 text-slate-900 dark:text-white font-medium' 
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <span className={`${isActive ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>
                      {item.icon}
                    </span>
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3 mb-4 px-2">
          <img src={activeUser?.profileImage || '/default-avatar.png'} alt="Profile" className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 object-cover" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{activeUser?.name}</p>
            <p className="text-xs text-rose-500 font-bold uppercase tracking-wider truncate">Super Admin</p>
          </div>
        </div>
        <button onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-md transition-colors">
          <LogOut className="w-4 h-4" /> Logout
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
        <header className="h-14 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#000000] flex items-center justify-between px-4 lg:px-6 shrink-0 z-10">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsMobileMenuOpen(true)} className="md:hidden p-1.5 -ml-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md">
              <Menu className="w-5 h-5" />
            </button>
            
            {/* Breadcrumbs */}
            <div className="hidden sm:flex items-center text-sm font-medium text-slate-500 dark:text-slate-400">
              <span className="flex items-center text-rose-500 hover:text-rose-600 transition-colors">
                SuperAdmin
              </span>
              <ChevronRight className="w-4 h-4 mx-1 shrink-0" />
              <span className="text-slate-900 dark:text-white capitalize truncate max-w-[120px] sm:max-w-[200px]">
                {location.pathname.split('/').pop().replace('-', ' ') || 'Dashboard'}
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Link to="/superadmin/security-logs" className="relative p-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors">
              <ShieldAlert className="w-4 h-4" />
            </Link>
            <button onClick={toggleTheme} className="p-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors">
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <Link to="/" className="flex items-center gap-2 text-sm font-medium px-3 py-1.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-md hover:opacity-90 transition-opacity ml-2">
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
    </div>
  );
};

export default SuperAdminLayout;
