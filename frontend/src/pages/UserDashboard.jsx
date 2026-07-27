import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import { LayoutDashboard, UserCircle, ShoppingBag, Settings, Loader2, ArrowLeft, Heart, Download, HelpCircle, Gift, Music, Smartphone, Coins } from 'lucide-react';
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

  const tabContentVariants = {
    hidden: { opacity: 0, y: 10 },
    enter: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
    exit: { opacity: 0, y: -10, transition: { duration: 0.2, ease: 'easeIn' } }
  };

  return (
    <div className={`font-jakarta min-h-screen pb-20 transition-colors duration-500 ${themeClass} relative overflow-x-hidden`}>
      
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

      {/* Sleek App Header */}
      <div className="sticky top-0 z-40 bg-black/40 backdrop-blur-3xl border-b border-white/5 shadow-2xl">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/')} className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-all backdrop-blur-md active:scale-95">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <img src={user?.profileImage || '/default-avatar.png'} alt={user?.name} className="w-8 h-8 rounded-full border border-white/10 object-cover" />
              <div>
                <h1 className="text-base font-black text-white leading-tight">Dashboard</h1>
                <p className="text-[10px] text-white/50 uppercase tracking-wider">{user?.name}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Horizontal Scrollable Tabs */}
        <div className="max-w-4xl mx-auto px-2 pb-2">
          <div className="flex overflow-x-auto gap-2 pb-2 pt-1 scrollbar-hide px-2">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm whitespace-nowrap transition-all active:scale-95 ${
                  activeTab === tab.id
                    ? 'bg-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.4)]'
                    : 'bg-white/5 hover:bg-white/10 text-white/60 hover:text-white border border-white/5'
                }`}
              >
                <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? '' : 'opacity-70'}`} />
                {tab.label}
                {tab.id === 'overview' && unreadCount > 0 && (
                  <span className="ml-1 w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            variants={tabContentVariants}
            initial="hidden"
            animate="enter"
            exit="exit"
            className="w-full h-full"
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default UserDashboard;
