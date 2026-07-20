import CustomSearchBar from '../components/CustomSearchBar';
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGetNotificationsQuery, useMarkAsReadMutation, useMarkAllAsReadMutation, useDeleteNotificationMutation } from '../features/notification/notificationApiSlice';
import { Bell, CheckCircle, Clock, Info, ShieldAlert, Star, XCircle, Trash2, MessageCircle, FileText, Search, Filter, Loader2, X, Download } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { useInView } from 'react-intersection-observer';
import SEO from '../components/SEO';
import { useSocket } from '../context/SocketContext';

const CATEGORIES = [
  { id: 'ALL', label: 'All', types: null },
  { id: 'GENERAL', label: 'General', types: ['SYSTEM', 'COMMENT', 'REPLY', 'RATING'] },
  { id: 'PREMIUM', label: 'Premium', types: ['PREMIUM'] },
  { id: 'PURCHASES', label: 'Purchase Updates', types: ['STORE', 'DOWNLOAD'] },
  { id: 'MEMBERSHIP', label: 'Membership Updates', types: ['PREMIUM'] },
  { id: 'ADMIN', label: 'Admin', types: ['ADMIN', 'MODERATION', 'REPORT', 'SECURITY'] },
];

const getIcon = (iconName, type) => {
  const icons = {
    CheckCircle: <CheckCircle className="w-5 h-5 text-emerald-500" />,
    XCircle: <XCircle className="w-5 h-5 text-red-500" />,
    Clock: <Clock className="w-5 h-5 text-blue-500" />,
    ShieldAlert: <ShieldAlert className="w-5 h-5 text-red-500" />,
    Star: <Star className="w-5 h-5 text-amber-500" />,
    MessageCircle: <MessageCircle className="w-5 h-5 text-blue-400" />,
    FileText: <FileText className="w-5 h-5 text-indigo-400" />,
    Bell: <Bell className="w-5 h-5 text-slate-400" />,
    Download: <Download className="w-5 h-5 text-indigo-500" />
  };
  if (icons[iconName]) return icons[iconName];
  switch (type) {
    case 'SYSTEM': return <Info className="w-5 h-5 text-blue-500" />;
    case 'SECURITY': return <ShieldAlert className="w-5 h-5 text-red-500" />;
    case 'PREMIUM': return <Star className="w-5 h-5 text-amber-500" />;
    case 'MODERATION': return <CheckCircle className="w-5 h-5 text-emerald-500" />;
    case 'STORE': return <Download className="w-5 h-5 text-indigo-500" />;
    default: return <Bell className="w-5 h-5 text-slate-400" />;
  }
};

const Notifications = () => {
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState(CATEGORIES[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  const { ref, inView } = useInView({ threshold: 0 });

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1); // reset page on search
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const { data: response, isLoading, isFetching, refetch } = useGetNotificationsQuery({
    page,
    limit: 20,
    types: activeTab.types,
    search: debouncedSearch,
  }, {
    pollingInterval: 30000, // Refresh every 30 seconds
  });

  const socket = useSocket();

  useEffect(() => {
    if (!socket) return;
    
    const handleNewNotification = () => {
      refetch();
    };

    socket.on('newNotification', handleNewNotification);

    return () => {
      socket.off('newNotification', handleNewNotification);
    };
  }, [socket, refetch]);

  const [markAsRead] = useMarkAsReadMutation();
  const [markAllAsRead] = useMarkAllAsReadMutation();
  const [deleteNotification] = useDeleteNotificationMutation();
  const navigate = useNavigate();

  const notifications = response?.data || [];
  const pagination = response?.pagination || { pages: 1 };
  const hasMore = page < pagination.pages;

  useEffect(() => {
    if (inView && hasMore && !isFetching) {
      setPage((prev) => prev + 1);
    }
  }, [inView, hasMore, isFetching]);

  const handleNotificationClick = async (notification) => {
    if (!notification.isRead) {
      await markAsRead(notification._id);
    }
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    await deleteNotification(id);
  };

  const handleTabChange = (category) => {
    setActiveTab(category);
    setPage(1);
    setIsMobileFiltersOpen(false);
  };

  return (
    <div className="font-jakarta bg-[#030303] min-h-screen text-white pt-24 pb-12 transition-colors duration-500 relative overflow-hidden selection:bg-blue-500/30">
      <SEO title="Notifications - Premium Apps" description="View your notifications." />

      {/* Background Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/20 rounded-full blur-[150px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/20 rounded-full blur-[150px]"></div>
        
        {/* Animated Rings for visual interest */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[800px] aspect-square flex items-center justify-center opacity-20">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 60, repeat: Infinity, ease: "linear" }} className="absolute w-[100%] h-[100%] rounded-full border border-white/[0.03]" />
          <motion.div animate={{ rotate: -360 }} transition={{ duration: 40, repeat: Infinity, ease: "linear" }} className="absolute w-[80%] h-[80%] rounded-full border border-white/[0.05]" />
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-5xl relative z-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 bg-white/5 backdrop-blur-3xl border border-white/10 p-8 rounded-[2.5rem] shadow-[0_20px_40px_rgba(0,0,0,0.5)]">
          <div>
            <h1 className="text-3xl font-black text-white mb-2 flex items-center gap-3 tracking-tight">
              <div className="p-3 bg-white/5 rounded-2xl shadow-inner border border-white/5"><Bell className="w-8 h-8 text-blue-400" /></div> Notifications
            </h1>
            <p className="text-white/60 font-medium">Stay updated with your account activity.</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileFiltersOpen(true)}
              className="md:hidden p-3 bg-white/5 rounded-xl border border-white/10 text-white shadow-inner"
            >
              <Filter className="w-5 h-5" />
            </button>
            <button
              onClick={() => markAllAsRead()}
              className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-2xl transition-colors font-bold flex items-center gap-2 shadow-inner"
            >
              <CheckCircle className="w-5 h-5 text-emerald-400" /> Mark all as read
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-5xl flex flex-col md:flex-row gap-6 relative z-10">
        {/* Desktop Sidebar Filters */}
        <div className="hidden md:block w-64 flex-shrink-0 space-y-2">
          <div className="bg-white/5 backdrop-blur-3xl border border-white/10 p-6 rounded-[2.5rem] shadow-[0_20px_40px_rgba(0,0,0,0.5)] space-y-2 sticky top-24">
            <h3 className="text-[11px] font-black text-blue-400 uppercase tracking-wider mb-6 px-3">Categories</h3>
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleTabChange(cat)}
                className={`w-full text-left px-5 py-3.5 rounded-2xl font-bold transition-all duration-300 shadow-inner ${
                  activeTab.id === cat.id
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-[0_5px_15px_rgba(59,130,246,0.4)] border border-blue-500/50'
                    : 'text-white/60 bg-black/20 hover:bg-white/10 hover:text-white border border-transparent hover:border-white/10'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Mobile Bottom Sheet Filters */}
        <AnimatePresence>
          {isMobileFiltersOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm"
                onClick={() => setIsMobileFiltersOpen(false)}
              />
              <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
                className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 rounded-t-3xl z-50 p-6 md:hidden shadow-2xl border-t border-slate-200 dark:border-slate-800"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white">Filter By Category</h3>
                  <button onClick={() => setIsMobileFiltersOpen(false)} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="space-y-2">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => handleTabChange(cat)}
                      className={`w-full text-left px-4 py-3 rounded-xl font-medium transition-all ${
                        activeTab.id === cat.id
                          ? 'bg-primary text-white'
                          : 'bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <div className="flex-1 space-y-6">
          <div className="relative group">
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search notifications..."
              className="peer w-full h-14 bg-black/40 border border-white/10 focus:border-blue-500/50 rounded-2xl pl-12 pr-4 text-white placeholder-white/40 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all font-medium text-base shadow-inner backdrop-blur-sm"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 peer-focus:text-blue-400 transition-colors" />
          </div>

          <div className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] overflow-hidden min-h-[50vh] shadow-[0_20px_40px_rgba(0,0,0,0.5)]">
            {isLoading && page === 1 ? (
              <div className="p-12 flex justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
              </div>
            ) : notifications.length === 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-16 text-center flex flex-col items-center justify-center">
                <div className="w-24 h-24 bg-white/5 border border-white/10 rounded-[2rem] flex items-center justify-center mb-6 shadow-inner">
                  <Bell className="w-10 h-10 text-white/30" />
                </div>
                <h3 className="text-2xl font-black text-white mb-2 tracking-tight">You're all caught up!</h3>
                <p className="text-white/50 font-medium">No notifications found in this category.</p>
              </motion.div>
            ) : (
              <div className="divide-y divide-white/5">
                <AnimatePresence initial={false}>
                  {notifications.map((notification) => (
                    <motion.div
                      key={notification._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      whileHover={{ scale: 1.01 }}
                      onClick={() => handleNotificationClick(notification)}
                      className={`p-6 flex gap-5 transition-all cursor-pointer group relative ${
                        !notification.isRead ? 'bg-gradient-to-r from-blue-500/10 to-transparent border-l-4 border-blue-500' : 'hover:bg-white/5 border-l-4 border-transparent'
                      }`}
                    >
                      <div className={`flex-shrink-0 mt-1 w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner border border-white/5 ${!notification.isRead ? 'bg-white/10' : 'bg-black/20'}`}>
                        {getIcon(notification.icon, notification.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0 pr-10">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-2">
                          <h4 className={`text-base md:text-lg font-black truncate tracking-tight ${!notification.isRead ? 'text-white' : 'text-white/70'}`}>
                            {notification.title}
                          </h4>
                          <span className="text-xs font-bold text-white/40 whitespace-nowrap flex items-center gap-1.5 bg-black/40 px-3 py-1 rounded-lg">
                            <Clock className="w-3.5 h-3.5" />
                            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                          </span>
                        </div>
                        <p className={`text-[15px] leading-relaxed ${!notification.isRead ? 'text-white/80 font-medium' : 'text-white/50'}`}>
                          {notification.message}
                        </p>
                      </div>

                      <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center">
                        {!notification.isRead && (
                          <span className="w-3 h-3 bg-blue-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.8)] group-hover:opacity-0 transition-opacity"></span>
                        )}
                        <button
                          onClick={(e) => handleDelete(e, notification._id)}
                          className="absolute right-0 p-3 text-white/30 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all rounded-xl hover:bg-red-500/20 backdrop-blur-md"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                
                {/* Infinite Scroll trigger */}
                <div ref={ref} className="h-10 flex items-center justify-center">
                  {isFetching && page > 1 && <Loader2 className="w-5 h-5 animate-spin text-primary" />}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notifications;
