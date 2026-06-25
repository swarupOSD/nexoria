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
    <div className="container mx-auto px-4 py-8 max-w-5xl min-h-screen">
      <SEO title="Notifications - Premium Apps" description="View your notifications." />

      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white mb-2 flex items-center gap-3">
            <Bell className="w-8 h-8 text-primary" /> Notifications
          </h1>
          <p className="text-slate-500 dark:text-slate-400">Stay updated with your account activity.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileFiltersOpen(true)}
            className="md:hidden p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-300"
          >
            <Filter className="w-5 h-5" />
          </button>
          <button
            onClick={() => markAllAsRead()}
            className="px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg transition-colors text-sm font-bold flex items-center gap-2"
          >
            <CheckCircle className="w-4 h-4" /> Mark all as read
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Desktop Sidebar Filters */}
        <div className="hidden md:block w-64 flex-shrink-0 space-y-2">
          <div className="glass-card p-4 space-y-1 sticky top-24">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 px-3">Categories</h3>
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleTabChange(cat)}
                className={`w-full text-left px-4 py-2.5 rounded-xl font-medium transition-all duration-200 ${
                  activeTab.id === cat.id
                    ? 'bg-primary text-white shadow-lg shadow-primary/20'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white'
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
        <div className="flex-1 space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <CustomSearchBar value={searchQuery} placeholder="Search notifications..." name="text"  onChange={(e) => setSearchQuery(e.target.value)} />
          </div>

          <div className="glass-card rounded-2xl overflow-hidden min-h-[50vh]">
            {isLoading && page === 1 ? (
              <div className="p-12 flex justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : notifications.length === 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-16 text-center flex flex-col items-center justify-center">
                <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
                  <Bell className="w-10 h-10 text-slate-400" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">You're all caught up!</h3>
                <p className="text-slate-500 dark:text-slate-400">No notifications found in this category.</p>
              </motion.div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
                <AnimatePresence initial={false}>
                  {notifications.map((notification) => (
                    <motion.div
                      key={notification._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      whileHover={{ scale: 1.01 }}
                      onClick={() => handleNotificationClick(notification)}
                      className={`p-5 flex gap-4 transition-all cursor-pointer group relative ${
                        !notification.isRead ? 'bg-primary/5 hover:bg-primary/10' : 'hover:bg-slate-50 dark:hover:bg-slate-800/30'
                      }`}
                    >
                      <div className={`flex-shrink-0 mt-1 w-10 h-10 rounded-full flex items-center justify-center shadow-sm ${!notification.isRead ? 'bg-white dark:bg-slate-800 shadow-primary/20' : 'bg-slate-100 dark:bg-slate-800'}`}>
                        {getIcon(notification.icon, notification.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0 pr-10">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-1.5">
                          <h4 className={`text-sm md:text-base font-bold truncate ${!notification.isRead ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'}`}>
                            {notification.title}
                          </h4>
                          <span className="text-xs font-medium text-slate-400 whitespace-nowrap flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                          </span>
                        </div>
                        <p className={`text-sm ${!notification.isRead ? 'text-slate-700 dark:text-slate-300 font-medium' : 'text-slate-500 dark:text-slate-400'}`}>
                          {notification.message}
                        </p>
                      </div>

                      <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center">
                        {!notification.isRead && (
                          <span className="w-2.5 h-2.5 bg-primary rounded-full shadow-lg shadow-primary/50 group-hover:opacity-0 transition-opacity"></span>
                        )}
                        <button
                          onClick={(e) => handleDelete(e, notification._id)}
                          className="absolute right-0 p-2 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all rounded-full hover:bg-red-50 dark:hover:bg-red-500/10"
                        >
                          <Trash2 className="w-4 h-4" />
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
