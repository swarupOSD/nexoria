import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import { LayoutDashboard, UserCircle, ShoppingBag, Settings, Loader2, Menu, X, ArrowLeft, Heart, Download, HelpCircle, Gift, Music, Smartphone, Coins } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { useGetMeQuery } from '../features/auth/authApiSlice';
import { useGetMyRequestsQuery } from '../features/api/paymentApiSlice';
import { useGetMyActivityQuery } from '../features/activity/activityApiSlice';
import { useGetUnreadCountQuery } from '../features/notification/notificationApiSlice';
import { setCredentials } from '../features/auth/authSlice';

import OverviewTab from '../components/DashboardTabs/OverviewTab';
import ProfileTab from '../components/DashboardTabs/ProfileTab';
import PurchasesTab from '../components/DashboardTabs/PurchasesTab';
import SettingsTab from '../components/DashboardTabs/SettingsTab';
import WishlistTab from '../components/DashboardTabs/WishlistTab';
import DownloadsTab from '../components/DashboardTabs/DownloadsTab';
import AppRequestsTab from '../components/DashboardTabs/AppRequestsTab';
import RewardsTab from '../components/DashboardTabs/RewardsTab';
import MusicAnalyticsTab from '../components/DashboardTabs/MusicAnalyticsTab';
import AppDownloadTab from '../components/DashboardTabs/AppDownloadTab';
import EarnTab from '../components/DashboardTabs/EarnTab';
import { useNavigate } from 'react-router-dom';

const TABS = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'profile', label: 'Profile', icon: UserCircle },
  { id: 'purchases', label: 'Purchases', icon: ShoppingBag },
  { id: 'wishlist', label: 'Wishlist', icon: Heart },
  { id: 'music', label: 'Music Analytics', icon: Music },
  { id: 'downloads', label: 'Downloads', icon: Download },
  { id: 'earn', label: 'Earn Points', icon: Coins },
  { id: 'requests', label: 'App Requests', icon: HelpCircle },
  { id: 'rewards', label: 'Rewards & Levels', icon: Gift },
  { id: 'app-download', label: 'Nexoria App', icon: Smartphone },
  { id: 'settings', label: 'Settings', icon: Settings },
];

const UserDashboard = () => {
  const { user, token } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const { data: meData, isLoading: meLoading, refetch: refetchUser } = useGetMeQuery(undefined, { refetchOnMountOrArgChange: true });
  const { data: requestsRes, isLoading: requestsLoading } = useGetMyRequestsQuery();
  const { data: activityRes, isLoading: activityLoading } = useGetMyActivityQuery({ limit: 10 });
  const { data: unreadRes } = useGetUnreadCountQuery(undefined, { pollingInterval: 60000 });

  useEffect(() => {
    if (meData?.user) {
      dispatch(setCredentials({ user: meData.user, token }));
    }
  }, [meData, dispatch, token]);

  const isLoading = meLoading || requestsLoading || activityLoading;

  if (isLoading && !user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  const premiumRequests = requestsRes?.data?.premiumRequests || [];
  const purchases = requestsRes?.data?.purchases || [];
  const recentActivity = activityRes?.data || [];
  const unreadCount = unreadRes?.count || 0;

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewTab user={user} purchases={purchases} notificationsCount={unreadCount} premiumRequests={premiumRequests} recentActivity={recentActivity} />;
      case 'profile':
        return <ProfileTab user={user} token={token} refetchUser={refetchUser} />;
      case 'purchases':
        return <PurchasesTab purchases={purchases} premiumRequests={premiumRequests} />;
      case 'wishlist':
        return <WishlistTab user={user} />;
      case 'music':
        return <MusicAnalyticsTab />;
      case 'downloads':
        return <DownloadsTab user={user} />;
      case 'earn':
        return <EarnTab />;
      case 'requests':
        return <AppRequestsTab user={user} />;
      case 'rewards':
        return <RewardsTab user={user} />;
      case 'app-download':
        return <AppDownloadTab />;
      case 'settings':
        return <SettingsTab user={user} />;
      default:
        return <OverviewTab user={user} purchases={purchases} notificationsCount={unreadCount} premiumRequests={premiumRequests} recentActivity={recentActivity} />;
    }
  };

  const getThemeClass = (theme) => {
    switch(theme) {
      case 'cyberpunk': return 'bg-gradient-to-br from-[#2b044d] via-[#10194a] to-[#240b36] text-white selection:bg-fuchsia-500/30';
      case 'synthwave': return 'bg-gradient-to-r from-[#fc00ff] to-[#00dbde] text-white selection:bg-cyan-500/30';
      case 'neon': return 'bg-[conic-gradient(at_top_right,_var(--tw-gradient-stops))] from-rose-900 via-purple-900 to-indigo-900 text-white selection:bg-rose-500/30';
      default: return 'bg-[#030303] text-white selection:bg-blue-500/30';
    }
  };

  const themeClass = getThemeClass(user?.profileTheme || 'default');

  return (
    <div className={`font-jakarta min-h-screen pb-12 transition-colors duration-500 ${themeClass} relative overflow-hidden`}>
      
      {/* Global Background Glows if default theme */}
      {(!user?.profileTheme || user?.profileTheme === 'default') && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
           <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-blue-500/10 rounded-full blur-[150px]"></div>
           <div className="absolute bottom-0 left-0 w-[50%] h-[50%] bg-purple-500/10 rounded-full blur-[150px]"></div>
        </div>
      )}
      <Helmet>
        <title>Dashboard - {user?.name}</title>
      </Helmet>

      {/* Top Navigation Bar for Dashboard */}
      <div className="sticky top-0 z-30 bg-white/5 backdrop-blur-3xl border-b border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.3)]">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/')} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-white/70 hover:text-white transition-all hidden sm:block backdrop-blur-md">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-2xl font-black text-white flex items-center gap-2 tracking-tight">
              Dashboard
            </h1>
          </div>
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="lg:hidden p-2 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl text-white transition-colors backdrop-blur-md"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Desktop Sidebar */}
          <div className="hidden lg:block w-72 shrink-0 relative z-10">
            <div className="bg-white/5 backdrop-blur-3xl border border-white/10 p-4 rounded-3xl space-y-2 sticky top-24 shadow-[0_10px_30px_rgba(0,0,0,0.3)]">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl font-bold transition-all duration-300 ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-[0_5px_15px_rgba(59,130,246,0.4)] translate-x-1'
                      : 'text-white/50 hover:text-white hover:bg-white/10 hover:translate-x-1'
                  }`}
                >
                  <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? 'animate-pulse' : ''}`} />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Mobile Sidebar Overlay */}
          <AnimatePresence>
            {isSidebarOpen && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setIsSidebarOpen(false)}
                  className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-md"
                />
                <motion.div
                  initial={{ x: '-100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: '-100%' }}
                  transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
                  className="fixed top-0 left-0 bottom-0 w-72 bg-[#030303]/90 backdrop-blur-3xl z-50 p-6 lg:hidden shadow-[20px_0_40px_rgba(0,0,0,0.5)] border-r border-white/10 overflow-y-auto"
                >
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-black text-white">Menu</h2>
                    <button onClick={() => setIsSidebarOpen(false)} className="p-2 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-colors">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="space-y-2">
                    {TABS.map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => {
                          setActiveTab(tab.id);
                          setIsSidebarOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-4 rounded-2xl font-bold transition-all ${
                          activeTab === tab.id
                            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-[0_5px_15px_rgba(59,130,246,0.4)]'
                            : 'text-white/50 hover:text-white bg-white/5 hover:bg-white/10 border border-transparent hover:border-white/10'
                        }`}
                      >
                        <tab.icon className="w-5 h-5" />
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>

          {/* Content Area */}
          <div className="flex-1 min-w-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {renderContent()}
              </motion.div>
            </AnimatePresence>
          </div>

        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
