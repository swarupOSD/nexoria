import { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { 
  LayoutDashboard, FileText, Folder, MessageSquare, 
  Settings, LogOut, ShieldAlert, User, Moon, Sun, 
  Menu, X, Star, Download, Bell, Activity, AlertOctagon, Mail, 
  ChevronRight, Command, LayoutTemplate
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useSelector, useDispatch } from 'react-redux';
import { useLogoutMutation, useGetMeQuery } from '../features/auth/authApiSlice';
import { logout as clearCredentials, setCredentials } from '../features/auth/authSlice';
import { motion, AnimatePresence } from 'framer-motion';

const AdminLayout = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { isDarkMode, toggleTheme } = useTheme();
  const [logoutApi] = useLogoutMutation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const { data, isLoading, isFetching } = useGetMeQuery();

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

  const hasAccess = activeUser.role === 'admin' || activeUser.role === 'superadmin';
  
  if (!hasAccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-[#0A0A0A] text-slate-900 dark:text-white">
        <ShieldAlert className="w-16 h-16 text-red-500 mb-4" />
        <h1 className="text-3xl font-bold mb-2">Access Denied</h1>
        <p className="text-slate-500 mb-6">Administrator privileges required.</p>
        <Link to="/" className="px-6 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg hover:opacity-90 transition font-medium">Return Home</Link>
      </div>
    );
  }

  const navGroups = [
    {
      title: 'Overview',
      items: [
        { name: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" />, path: '/admin' },
        { name: 'Live Monitor', icon: <Activity className="w-4 h-4" />, path: '/admin/live-monitor' },
      ]
    },
    {
      title: 'Content',
      items: [
        { name: 'Posts', icon: <FileText className="w-4 h-4" />, path: '/admin/posts' },
        { name: 'Categories', icon: <Folder className="w-4 h-4" />, path: '/admin/categories' },
        { name: 'Downloads', icon: <Download className="w-4 h-4" />, path: '/admin/downloads' },
        { name: 'Nexoria Music', icon: <Activity className="w-4 h-4" />, path: '/admin/nexoria-music' },
      ]
    },
    {
      title: 'Engagement',
      items: [
        { name: 'Comments', icon: <MessageSquare className="w-4 h-4" />, path: '/admin/comments' },
        { name: 'Ratings', icon: <Star className="w-4 h-4" />, path: '/admin/ratings' },
        { name: 'Contact', icon: <Mail className="w-4 h-4" />, path: '/admin/contact' },
      ]
    },
    {
      title: 'Management',
      items: [
        { name: 'Users', icon: <User className="w-4 h-4" />, path: '/admin/users' },
        { name: 'Moderation', icon: <ShieldAlert className="w-4 h-4" />, path: '/admin/moderation' },
        { name: 'Reports', icon: <AlertOctagon className="w-4 h-4" />, path: '/admin/reports' },
      ]
    },
    {
      title: 'System',
      items: [
        { name: 'Activity Logs', icon: <Activity className="w-4 h-4" />, path: '/admin/activity-logs' },
        { name: 'Settings', icon: <Settings className="w-4 h-4" />, path: '/admin/settings' },
      ]
    }
  ];

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-[#080312]/95 backdrop-blur-xl text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-white/5 w-64 flex-shrink-0">
      <div className="p-5 flex items-center gap-3">
        <div className="w-8 h-8 rounded bg-slate-900 dark:bg-white flex items-center justify-center text-white dark:text-slate-900 shadow-sm">
          <Command className="w-4 h-4" />
        </div>
        <span className="font-bold text-slate-900 dark:text-white tracking-tight">Admin Console</span>
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
                const isActive = location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path));
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
            <p className="text-xs text-slate-500 truncate">{activeUser?.email}</p>
          </div>
        </div>
        <button onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-md transition-colors">
          <LogOut className="w-4 h-4" /> Logout
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-white dark:bg-[#080312] text-slate-800 dark:text-slate-200 font-sans overflow-hidden relative">
      
      {/* Gen-Z Mesh Gradient Glowing Background (Dark Mode Only) */}
      <div className="hidden dark:block fixed top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-purple-600/10 blur-[120px] pointer-events-none mix-blend-screen z-0" />
      <div className="hidden dark:block fixed bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-pink-600/5 blur-[120px] pointer-events-none mix-blend-screen z-0" />
      <div className="hidden dark:block fixed top-[40%] left-[60%] w-[30%] h-[30%] rounded-full bg-indigo-500/5 blur-[100px] pointer-events-none mix-blend-screen z-0" />

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
        
        {/* Top Navbar (Vercel Style) */}
        <header className="h-14 border-b border-slate-200 dark:border-white/5 bg-white/80 dark:bg-[#080312]/60 backdrop-blur-xl flex items-center justify-between px-4 lg:px-6 shrink-0 z-10">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsMobileMenuOpen(true)} className="md:hidden p-1.5 -ml-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md">
              <Menu className="w-5 h-5" />
            </button>
            
            {/* Breadcrumbs */}
            <div className="hidden sm:flex items-center text-sm font-medium text-slate-500 dark:text-slate-400">
              <span className="flex items-center hover:text-slate-900 dark:hover:text-white cursor-pointer transition-colors">
                {activeUser.role === 'superadmin' ? 'SuperAdmin' : 'Admin'}
              </span>
              <ChevronRight className="w-4 h-4 mx-1" />
              <span className="text-slate-900 dark:text-white capitalize">
                {location.pathname.split('/').pop().replace('-', ' ') || 'Dashboard'}
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Link to="/admin/live-monitor" className="relative p-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
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
        <div className="flex-1 overflow-y-auto bg-slate-50/50 dark:bg-transparent relative">
          <div className="p-4 md:p-8 max-w-[1600px] mx-auto">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
