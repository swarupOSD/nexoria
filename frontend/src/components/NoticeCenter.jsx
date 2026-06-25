import React, { useState, useEffect } from 'react';
import { useGetActiveAnnouncementsQuery } from '../features/announcement/announcementApiSlice';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Info, AlertTriangle, CheckCircle, AlertOctagon } from 'lucide-react';
import { Link } from 'react-router-dom';

const NoticeCenter = () => {
  const { data: response, isLoading } = useGetActiveAnnouncementsQuery(undefined, {
    pollingInterval: 60000,
  });
  const [visible, setVisible] = useState([]);

  useEffect(() => {
    if (response?.data) {
      const dismissed = JSON.parse(localStorage.getItem('dismissedNotices') || '[]');
      setVisible(response.data.filter(a => !dismissed.includes(a._id)));
    }
  }, [response]);

  const dismiss = (id) => {
    const dismissed = JSON.parse(localStorage.getItem('dismissedNotices') || '[]');
    dismissed.push(id);
    localStorage.setItem('dismissedNotices', JSON.stringify(dismissed));
    setVisible(prev => prev.filter(a => a._id !== id));
  };

  const getStyle = (type) => {
    switch (type) {
      case 'warning': return 'bg-amber-500 text-white';
      case 'success': return 'bg-emerald-500 text-white';
      case 'error':   return 'bg-rose-500 text-white';
      default:        return 'bg-blue-500 text-white';
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'warning': return <AlertTriangle className="w-4 h-4 shrink-0" />;
      case 'success': return <CheckCircle className="w-4 h-4 shrink-0" />;
      case 'error':   return <AlertOctagon className="w-4 h-4 shrink-0" />;
      default:        return <Info className="w-4 h-4 shrink-0" />;
    }
  };

  if (isLoading || visible.length === 0) return null;

  return (
    <div className="flex flex-col">
      <AnimatePresence>
        {visible.map((item) => (
          <motion.div
            key={item._id}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className={`${getStyle(item.type)} overflow-hidden`}
          >
            <div className="container mx-auto px-4 py-2.5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2.5 min-w-0">
                {getIcon(item.type)}
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 min-w-0">
                  <span className="font-bold text-sm truncate">{item.title}</span>
                  <span className="text-sm opacity-90 truncate hidden sm:block">—</span>
                  <span className="text-sm opacity-90 truncate">{item.content}</span>
                  {item.link && (
                    <Link to={item.link} className="text-xs font-bold underline underline-offset-2 hover:opacity-80 transition-opacity whitespace-nowrap ml-0 sm:ml-1">
                      {item.linkText || 'Learn More'} →
                    </Link>
                  )}
                </div>
              </div>
              <button
                onClick={() => dismiss(item._id)}
                className="shrink-0 p-1 hover:bg-black/10 rounded-full transition-colors"
                aria-label="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default NoticeCenter;
