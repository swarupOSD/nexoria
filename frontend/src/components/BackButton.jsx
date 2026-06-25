import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { motion } from 'framer-motion';

const BackButton = ({ fallbackRoute = '/', customLabel = 'Back', showText = true, className = '' }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleBack = () => {
    // If there is history (key !== 'default') navigate back, else use fallback
    if (window.history.length > 2) {
      navigate(-1);
    } else {
      // Determine fallback based on current path if fallbackRoute is not explicitly provided
      let route = fallbackRoute;
      if (location.pathname.startsWith('/superadmin')) {
        route = '/superadmin';
      } else if (location.pathname.startsWith('/admin')) {
        route = '/admin';
      } else if (location.pathname.startsWith('/dashboard') || location.pathname.startsWith('/profile') || location.pathname.startsWith('/settings')) {
        route = '/';
      }
      navigate(route);
    }
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05, x: -4 }}
      whileTap={{ scale: 0.95 }}
      onClick={handleBack}
      aria-label="Go Back"
      className={`group flex items-center justify-center gap-2 px-3 py-2 rounded-full 
      bg-white/10 dark:bg-[#1E293B]/50 backdrop-blur-md border border-white/20 dark:border-slate-700/50
      shadow-sm hover:shadow-md hover:bg-white/20 dark:hover:bg-[#1E293B]/80
      text-slate-700 dark:text-slate-200 transition-all duration-300 z-40 ${className}`}
    >
      <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform duration-300" />
      {showText && <span className="font-medium pr-1 text-sm">{customLabel}</span>}
    </motion.button>
  );
};

export default BackButton;
