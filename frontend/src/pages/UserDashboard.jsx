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
      case 'cyberpunk': return 'bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] dark:from-[#000000] dark:via-[#1a0b2e] dark:to-[#000000] text-white';
      case 'synthwave': return 'bg-gradient-to-br from-[#2a0845] to-[#6441A5] dark:from-[#110122] dark:to-[#311155] text-white';
      case 'neon': return 'bg-slate-900 dark:bg-black bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/40 via-slate-900 to-black text-white';
      default: return 'bg-slate-50 dark:bg-[#030303] text-slate-900 dark:text-white';
    }
  };

  const themeClass = getThemeClass(user?.profileTheme || 'default');

  return (
    <div className={`min-h-screen pb-12 transition-colors duration-500 ${themeClass}`}>
      <Helmet>
        <title>Dashboard - {user?.name}</title>
      </Helmet>

      {/* Top Navigation Bar for Dashboard */}
      <div className="sticky top-0 z-30 bg-white/80 dark:bg-[#0A0A0A]/80 backdrop-blur-3xl border-b border-black/5 dark:border-white/5 shadow-[0_4px_30px_rgba(0,0,0,0.05)]">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/')} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition hidden sm:block">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-2">
              <span className="bg-gradient-to-r from-primary to-indigo-500 text-transparent bg-clip-text">Dashboard</span>
            </h1>
          </div>
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="lg:hidden p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-300"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Desktop Sidebar */}
          <div className="hidden lg:block w-64 shrink-0">
            <div className="glass-card p-4 space-y-2 sticky top-24">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-primary text-white shadow-lg shadow-primary/20'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <tab.icon className="w-5 h-5" />
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
                  className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
                />
                <motion.div
                  initial={{ x: '-100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: '-100%' }}
                  transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
                  className="fixed top-0 left-0 bottom-0 w-72 bg-white dark:bg-slate-900 z-50 p-6 lg:hidden shadow-2xl border-r border-slate-200 dark:border-slate-800 overflow-y-auto"
                >
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-xl font-black text-slate-800 dark:text-white">Menu</h2>
                    <button onClick={() => setIsSidebarOpen(false)} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500">
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
                        className={`w-full flex items-center gap-3 px-4 py-4 rounded-xl font-bold transition-all ${
                          activeTab === tab.id
                            ? 'bg-primary text-white'
                            : 'text-slate-500 hover:text-slate-900 dark:hover:text-white bg-slate-50 dark:bg-slate-800/50'
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
