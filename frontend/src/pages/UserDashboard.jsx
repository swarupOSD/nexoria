import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  UserCircle,
  ShoppingBag,
  Settings,
  Loader2,
  X,
  Heart,
  Download,
  HelpCircle,
  Music,
  Flame,
  Menu,
  ArrowLeft,
  Zap,
} from 'lucide-react';

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
import MusicAnalyticsTab from '../components/DashboardTabs/MusicAnalyticsTab';
import SupportTicketTab from '../components/DashboardTabs/SupportTicketTab';
import AuraMasteryTab from '../components/DashboardTabs/AuraMasteryTab';
import FallbackImage from '../components/FallbackImage';

// ─── Sidebar Tabs ─────────────────────────────────────────────────────────────
const TABS = [
  { id: 'overview',   label: 'Overview',        icon: LayoutDashboard },
  { id: 'profile',    label: 'Profile',          icon: UserCircle },
  { id: 'aura',       label: 'Aura & Mastery',   icon: Flame },
  { id: 'purchases',  label: 'Purchases',        icon: ShoppingBag },
  { id: 'wishlist',   label: 'Wishlist',         icon: Heart },
  { id: 'music',      label: 'Music Analytics',  icon: Music },
  { id: 'downloads',  label: 'Downloads',        icon: Download },
  { id: 'requests',   label: 'App Requests',     icon: HelpCircle },
  { id: 'support',    label: 'Support Tickets',  icon: HelpCircle },
  { id: 'settings',   label: 'Settings',         icon: Settings },
];

// ─── Stitch Sidebar Nav Item ──────────────────────────────────────────────────
const NavItem = ({ tab, active, onClick }) => (
  <button
    onClick={() => onClick(tab.id)}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-sm transition-all duration-200 active:scale-[0.98] text-left ${
      active
        ? 'text-[#e9c349] bg-white/5 border-r-2 border-[#e9c349] font-bold'
        : 'text-white/40 hover:bg-white/5 hover:text-white/80 border-r-2 border-transparent'
    }`}
  >
    <tab.icon className={`w-4 h-4 shrink-0 ${active ? 'text-[#e9c349]' : ''}`} />
    <span>{tab.label}</span>
  </button>
);

// ─── UserDashboard ────────────────────────────────────────────────────────────
const UserDashboard = () => {
  const { user, token } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const { data: meData, isLoading: meLoading, refetch: refetchUser } = useGetMeQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });
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
      <div className="flex items-center justify-center min-h-screen bg-[#131313]">
        <div className="flex flex-col items-center gap-3 text-white/30">
          <Loader2 className="w-8 h-8 animate-spin" />
          <p className="text-sm font-mono">Loading Dashboard...</p>
        </div>
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
        return (
          <OverviewTab
            user={user}
            purchases={purchases}
            notificationsCount={unreadCount}
            premiumRequests={premiumRequests}
            recentActivity={recentActivity}
          />
        );
      case 'profile':
        return <ProfileTab user={user} token={token} refetchUser={refetchUser} />;
      case 'aura':
        return <AuraMasteryTab user={user} />;
      case 'purchases':
        return <PurchasesTab purchases={purchases} premiumRequests={premiumRequests} />;
      case 'wishlist':
        return <WishlistTab user={user} />;
      case 'music':
        return <MusicAnalyticsTab />;
      case 'downloads':
        return <DownloadsTab user={user} />;
      case 'requests':
        return <AppRequestsTab user={user} />;
      case 'support':
        return <SupportTicketTab />;
      case 'settings':
        return <SettingsTab user={user} />;
      default:
        return (
          <OverviewTab
            user={user}
            purchases={purchases}
            notificationsCount={unreadCount}
            premiumRequests={premiumRequests}
            recentActivity={recentActivity}
          />
        );
    }
  };

  const SidebarContent = ({ onTabClick }) => (
    <div className="flex flex-col h-full">
      {/* Brand */}
      <div className="mb-10 px-2">
        <div className="flex items-center gap-3 mb-1">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
            style={{ background: '#e9c349', color: '#3c2f00' }}
          >
            <Zap className="w-4 h-4" />
          </div>
          <span className="text-xl font-bold text-white tracking-tight">Nexoria</span>
        </div>
        <p className="text-[11px] font-mono text-white/20 uppercase tracking-widest pl-12">
          Elite Identity
        </p>
      </div>

      {/* User mini profile */}
      <div
        className="mx-2 mb-6 p-3 rounded-xl border border-white/5 flex items-center gap-3"
        style={{ background: 'rgba(255,255,255,0.03)' }}
      >
        <FallbackImage
          src={user?.profileImage}
          fallbackType="avatar"
          alt={user?.name}
          className="w-8 h-8 rounded-full object-cover border border-white/10 shrink-0"
        />
        <div className="min-w-0">
          <p className="text-sm font-semibold text-white truncate leading-none mb-0.5">{user?.name || 'User'}</p>
          <p className="text-[11px] font-mono text-white/30 truncate">@{user?.username || 'username'}</p>
        </div>
      </div>

      {/* Nav tabs */}
      <nav className="flex-1 flex flex-col gap-1 overflow-y-auto">
        {TABS.map((tab) => (
          <NavItem
            key={tab.id}
            tab={tab}
            active={activeTab === tab.id}
            onClick={(id) => {
              onTabClick(id);
              setIsSidebarOpen(false);
            }}
          />
        ))}
      </nav>

      {/* Bottom CTA */}
      <div className="mt-auto pt-6 px-2">
        <button
          onClick={() => navigate('/')}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-mono text-white/40 border border-white/10 hover:bg-white/5 hover:text-white/70 transition-all"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Nexoria
        </button>
      </div>
    </div>
  );

  return (
    <div
      className="min-h-screen flex relative overflow-x-hidden"
      style={{ background: '#131313', color: '#e5e2e1' }}
    >
      {/* Ambient background glows */}
      <div
        className="fixed pointer-events-none z-0"
        style={{
          width: '50vw',
          height: '50vw',
          top: '-20%',
          left: '-10%',
          background: 'radial-gradient(circle, rgba(192,193,255,0.025) 0%, transparent 70%)',
        }}
      />
      <div
        className="fixed pointer-events-none z-0"
        style={{
          width: '60vw',
          height: '60vw',
          bottom: '-20%',
          right: '-10%',
          background: 'radial-gradient(circle, rgba(233,195,73,0.015) 0%, transparent 70%)',
        }}
      />

      <Helmet>
        <title>Dashboard — {user?.name || 'Nexoria'}</title>
      </Helmet>

      {/* ── Desktop Sidebar ── */}
      <aside
        className="hidden md:flex flex-col fixed left-0 top-0 h-screen w-64 z-40 py-6 px-4 border-r border-white/5"
        style={{ background: 'rgba(19,19,19,0.8)', backdropFilter: 'blur(24px)' }}
      >
        <SidebarContent onTabClick={setActiveTab} />
      </aside>

      {/* ── Mobile Sidebar Overlay ── */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-black/70 z-40 md:hidden backdrop-blur-sm"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', bounce: 0, duration: 0.35 }}
              className="fixed top-0 left-0 bottom-0 w-[280px] z-50 md:hidden py-6 px-4 border-r border-white/5"
              style={{ background: 'rgba(13,13,13,0.97)', backdropFilter: 'blur(32px)' }}
            >
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="absolute top-4 right-4 p-2 rounded-xl bg-white/5 text-white/40 hover:text-white hover:bg-white/10 transition"
              >
                <X className="w-4 h-4" />
              </button>
              <SidebarContent onTabClick={setActiveTab} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ── Main Content ── */}
      <div className="flex-1 md:pl-64 flex flex-col min-h-screen relative z-10">
        {/* Top bar — mobile only */}
        <header
          className="md:hidden sticky top-0 z-30 h-14 flex items-center justify-between px-4 border-b border-white/5"
          style={{ background: 'rgba(19,19,19,0.9)', backdropFilter: 'blur(20px)' }}
        >
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/')}
              className="p-2 rounded-xl text-white/40 hover:text-white hover:bg-white/5 transition"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <span className="text-base font-bold text-white">Dashboard</span>
          </div>
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 rounded-xl text-white/40 hover:text-white hover:bg-white/5 transition"
          >
            <Menu className="w-5 h-5" />
          </button>
        </header>

        {/* Page content */}
        <main className="flex-1 px-4 md:px-8 py-8 max-w-[1280px] w-full mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default UserDashboard;
