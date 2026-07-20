import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, CheckCircle, Clock, Info, ShieldAlert, Star, XCircle, Trash2, MessageCircle, FileText } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  useGetNotificationsQuery, 
  useGetUnreadCountQuery, 
  useMarkAsReadMutation, 
  useMarkAllAsReadMutation 
} from '../../features/notification/notificationApiSlice';
import { formatDistanceToNow } from 'date-fns';
import DropdownMenu from '../DropdownMenu';
import { useSocket } from '../../context/SocketContext';
import { useSubscribeToPushMutation } from '../../features/user/userApiSlice';
import { usePermissions } from '../../contexts/PermissionContext';
import toast from 'react-hot-toast';

const PUBLIC_VAPID_KEY = 'BM_qXoG-H3pLd7l561n9yXw0X_6W2R2G-y9-XyYvL8X5LhA8nN9eLq8Z2r5f_7T1D9n6s5F-X5XvHqX2v-L5Q3c';

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

const getIcon = (iconName, type) => {
  const icons = {
    CheckCircle: <CheckCircle className="w-5 h-5 text-emerald-500" />,
    XCircle: <XCircle className="w-5 h-5 text-red-500" />,
    Clock: <Clock className="w-5 h-5 text-blue-500" />,
    ShieldAlert: <ShieldAlert className="w-5 h-5 text-red-500" />,
    Star: <Star className="w-5 h-5 text-amber-500" />,
    MessageCircle: <MessageCircle className="w-5 h-5 text-blue-400" />,
    FileText: <FileText className="w-5 h-5 text-indigo-400" />,
    Bell: <Bell className="w-5 h-5 text-slate-400" />
  };

  if (icons[iconName]) return icons[iconName];

  // Fallbacks by type
  switch (type) {
    case 'SYSTEM': return <Info className="w-5 h-5 text-blue-500" />;
    case 'SECURITY': return <ShieldAlert className="w-5 h-5 text-red-500" />;
    case 'PREMIUM': return <Star className="w-5 h-5 text-amber-500" />;
    case 'MODERATION': return <CheckCircle className="w-5 h-5 text-emerald-500" />;
    default: return <Bell className="w-5 h-5 text-slate-400" />;
  }
};

const NotificationBell = ({ iconClassName }) => {
  const { data: unreadData } = useGetUnreadCountQuery();
  const { data: notificationsData } = useGetNotificationsQuery({ page: 1, limit: 5 });
  const [markAsRead] = useMarkAsReadMutation();
  const [markAllAsRead] = useMarkAllAsReadMutation();
  const navigate = useNavigate();

  const unreadCount = unreadData?.count || 0;
  const notifications = notificationsData?.data || [];

  const [isOpen, setIsOpen] = useState(false);
  const { requestPermission } = usePermissions();
  const dropdownRef = useRef(null);
  const socket = useSocket();
  const { refetch: refetchUnread } = useGetUnreadCountQuery();
  const { refetch: refetchNotifications } = useGetNotificationsQuery({ page: 1, limit: 5 });
  const [subscribeToPush] = useSubscribeToPushMutation();
  const [pushPermission, setPushPermission] = useState(
    typeof Notification !== 'undefined' ? Notification.permission : 'denied'
  );

  useEffect(() => {
    if (!socket) return;
    
    const handleNewNotification = (notification) => {
      refetchUnread();
      refetchNotifications();
      if (notification && notification.title) {
        toast(notification.title, {
          icon: '🔔',
          duration: 4000,
          style: {
            background: '#1e293b',
            color: '#fff',
            border: '1px solid #334155'
          }
        });
      }
    };

    socket.on('newNotification', handleNewNotification);

    return () => {
      socket.off('newNotification', handleNewNotification);
    };
  }, [socket, refetchUnread, refetchNotifications]);

  const handleNotificationClick = async (notification) => {
    if (!notification.isRead) {
      await markAsRead(notification._id);
    }
    setIsOpen(false);
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
    }
  };

  const handleMarkAll = async () => {
    await markAllAsRead();
  };

  const enablePushNotifications = async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      return toast.error('Push notifications are not supported by your browser.');
    }
    try {
      const granted = await requestPermission('notifications');
      if (!granted) {
        toast.error('Notifications permission was denied.');
        return;
      }
      const permission = await Notification.requestPermission();
      setPushPermission(permission);
      
      if (permission === 'granted') {
        const registration = await navigator.serviceWorker.ready;
        let subscription = await registration.pushManager.getSubscription();
        
        if (!subscription) {
          subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(PUBLIC_VAPID_KEY)
          });
        }
        
        await subscribeToPush({ subscription }).unwrap();
        toast.success('Push notifications enabled!');
      } else {
        toast.error('Permission denied for notifications.');
      }
    } catch (err) {
      toast.error('Failed to enable push notifications');
    }
  };

  return (
    <div onClick={() => setIsOpen(true)}>
      <DropdownMenu
        align="right"
        width="w-80 sm:w-96"
        closeOnClickInside={false}
        trigger={
          <div className={`relative p-2 transition-colors rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 ${iconClassName || 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 flex items-center justify-center w-4 h-4 text-[10px] font-bold text-white bg-red-500 border-2 border-[#111827] rounded-full">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </div>
        }
      >
        <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
          <h3 className="font-semibold text-slate-900 dark:text-white">Notifications</h3>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAll}
              className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors font-medium"
            >
              Mark all as read
            </button>
          )}
        </div>

        <div className="max-h-96 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-slate-500 dark:text-slate-400">
              <Bell className="w-8 h-8 mx-auto mb-3 opacity-20" />
              <p>No notifications yet</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
              {notifications.map((notification) => (
                <div
                  key={notification._id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`p-4 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors cursor-pointer flex gap-4 ${
                    !notification.isRead ? 'bg-indigo-50 dark:bg-indigo-500/5' : ''
                  }`}
                >
                  <div className="flex-shrink-0 mt-1">
                    {getIcon(notification.icon, notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className={`text-sm font-medium truncate ${!notification.isRead ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-300'}`}>
                        {notification.title}
                      </p>
                      {!notification.isRead && (
                        <span className="w-2 h-2 bg-indigo-500 rounded-full flex-shrink-0 ml-2"></span>
                      )}
                    </div>
                    <p className="text-sm text-slate-400 line-clamp-2">
                      {notification.message}
                    </p>
                    <p className="text-xs text-slate-500 mt-2">
                      {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-3 border-t border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 flex flex-col gap-2">
          {pushPermission === 'default' && (
            <button
              onClick={(e) => { e.stopPropagation(); enablePushNotifications(); }}
              className="w-full text-xs py-2 bg-indigo-500/20 text-indigo-400 rounded-lg hover:bg-indigo-500/30 transition-colors font-medium flex items-center justify-center gap-2"
            >
              <Bell className="w-3.5 h-3.5" /> Enable Browser Notifications
            </button>
          )}
          <Link
            to="/notifications"
            className="text-sm text-center text-indigo-400 hover:text-indigo-300 font-medium transition-colors py-1"
          >
            View all notifications
          </Link>
        </div>
      </DropdownMenu>
    </div>
  );
};

export default NotificationBell;
