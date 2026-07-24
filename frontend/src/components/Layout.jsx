import { Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useGetSettingsQuery } from '../features/settings/settingsApiSlice';
import Navbar from './Navbar';
import Footer from './Footer';
import NoticeCenter from './NoticeCenter';
import AdBlockDetector from './AdBlockDetector';
import GlobalAds from './GlobalAds';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, Link } from 'react-router-dom';
import { useEffect } from 'react';
import { useSocket } from '../context/SocketContext';
import { toast } from 'react-hot-toast';

const Layout = () => {
  const { data: settingsRes, isLoading } = useGetSettingsQuery();
  const { user } = useSelector(state => state.auth);
  
  const settings = settingsRes?.data || {};
  const isMaintenanceMode = settings.maintenanceMode === true;
  const isAdmin = user && (user.role === 'admin' || user.role === 'superadmin');
  const isPremiumUser = user && user.isPremium === true && user.premiumStatus === 'Active';
  const shouldBypassAdblock = isAdmin || isPremiumUser;
  const location = useLocation();
  const socket = useSocket();

  useEffect(() => {
    if (socket) {
      socket.on('newAppRelease', (data) => {
        toast((t) => (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <img src={data.appLogo || '/default.png'} alt="App Logo" className="w-10 h-10 rounded-lg object-cover" />
              <div>
                <p className="font-bold text-sm text-slate-800 dark:text-white">{data.title}</p>
                <p className="text-xs text-slate-500">{data.message}</p>
              </div>
            </div>
            <div className="flex justify-end mt-1">
              <Link 
                to={`/post/${data.slug}`} 
                onClick={() => toast.dismiss(t.id)}
                className="text-xs bg-primary hover:bg-accent text-white px-3 py-1.5 rounded transition"
              >
                View App
              </Link>
            </div>
          </div>
        ), { duration: 6000, position: 'bottom-left' });
      });

      return () => {
        socket.off('newAppRelease');
      };
    }
  }, [socket]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0F172A] relative overflow-hidden text-white font-sans">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0F172A] via-[#1e1a3b] to-[#0F172A] opacity-80" />
        <div className="flex flex-col items-center gap-6 relative z-10 p-8 md:p-12 rounded-[2rem] bg-black/20 border border-white/5 backdrop-blur-3xl shadow-2xl">
          <div className="relative w-24 h-24">
            <div className="absolute inset-0 rounded-full border-4 border-white/10" />
            <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
            <div className="absolute inset-0 rounded-full border-4 border-accent border-b-transparent animate-[spin_2s_linear_infinite_reverse] opacity-70" />
            <div className="absolute inset-4 rounded-full bg-primary/20 animate-pulse" />
          </div>
          <div className="text-center space-y-3">
            <h2 className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent animate-pulse tracking-tight">Nexoria</h2>
            <p className="text-slate-400 font-medium text-sm max-w-[250px] leading-relaxed">
              Waking up server...<br/>
              <span className="text-xs opacity-70">This may take up to 50 seconds if the server was asleep.</span>
            </p>
          </div>
        </div>
      </div>
    );
  }

  const publicAuthRoutes = ['/login', '/register', '/forgot-password', '/resetpassword', '/forgotpassword'];
  const isAuthRoute = publicAuthRoutes.some(route => location.pathname.startsWith(route));

  if (isMaintenanceMode && !isAdmin && !isAuthRoute) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0F172A] relative overflow-hidden text-white font-sans">
        {/* Animated Stars Background */}
        <div className="absolute inset-0 z-0">
          {[...Array(50)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute bg-white rounded-full opacity-30"
              style={{
                width: Math.random() * 3 + 'px',
                height: Math.random() * 3 + 'px',
                top: Math.random() * 100 + '%',
                left: Math.random() * 100 + '%',
              }}
              animate={{
                y: [0, -20, 0],
                opacity: [0.2, 0.8, 0.2]
              }}
              transition={{
                duration: Math.random() * 3 + 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          ))}
        </div>

        {/* Floating Astronaut/Planet Elements */}
        <motion.div
          animate={{ y: [-20, 20, -20], rotate: [0, 5, -5, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 right-1/4 w-32 h-32 rounded-full bg-gradient-to-tr from-primary to-accent opacity-20 blur-2xl z-0"
        />
        <motion.div
          animate={{ y: [20, -20, 20], rotate: [0, -10, 10, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-1/4 left-1/4 w-48 h-48 rounded-full bg-gradient-to-tr from-secondary to-accent opacity-20 blur-3xl z-0"
        />

        <div className="relative z-10 text-center max-w-2xl px-6">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            {/* Glowing Icon */}
            <div className="mb-8 relative inline-block">
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="w-24 h-24 rounded-full border-t-2 border-l-2 border-primary border-opacity-50 absolute -inset-2"
              />
              <img src={settings.logo || '/logo.png'} alt="Logo" className="w-20 h-20 object-contain drop-shadow-[0_0_15px_rgba(99,102,241,0.5)]" />
            </div>

            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary via-secondary to-accent">
              System Offline
            </h1>
            
            <p className="text-xl md:text-2xl text-indigo-200 mb-8 font-light">
              We are currently in <strong className="text-white font-bold">AntiGravity</strong> mode.
            </p>

            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-2xl inline-block text-left">
              <h3 className="text-indigo-300 font-semibold mb-2 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                Under Maintenance
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed max-w-md">
                {settings.siteName || 'Our platform'} is undergoing scheduled core upgrades to improve your experience. We will be back online shortly. Thank you for your patience.
              </p>
            </div>
            
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 1 }}
              className="mt-12 text-slate-500 text-sm tracking-widest uppercase"
            >
              Estimated Return: 1 Hour
            </motion.div>
          </motion.div>
        </div>
      </div>
    );
  }

  const content = (
    <div className="min-h-dvh flex flex-col bg-transparent transition-colors duration-300">
      <Navbar />
      <NoticeCenter />
      <AnimatePresence mode="wait">
        <motion.main 
          key={location.pathname}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="flex-grow container mx-auto px-4 pt-8 pb-24 lg:pb-8 max-w-[1400px]"
        >
          <Outlet />
        </motion.main>
      </AnimatePresence>
      <Footer />
      <GlobalAds />
    </div>
  );

  if (shouldBypassAdblock) {
    return content;
  }

  return (
    <AdBlockDetector>
      {content}
    </AdBlockDetector>
  );
};

export default Layout;
