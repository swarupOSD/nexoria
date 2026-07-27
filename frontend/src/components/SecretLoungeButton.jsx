import React from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const SecretLoungeButton = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Don't show if already on the incognito lounge page
  if (location.pathname === '/secret-lounge') return null;

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => navigate('/secret-lounge')}
      className="fixed bottom-24 sm:bottom-6 right-4 sm:right-6 z-[999] w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-gray-900 to-black rounded-full shadow-[0_0_20px_rgba(34,197,94,0.3)] border border-green-500/30 flex items-center justify-center text-green-500 hover:text-green-400 hover:border-green-400 transition-all group overflow-hidden"
      title="Enter Incognito Lounge"
    >
      <ShieldAlert className="w-6 h-6 text-green-500 group-hover:text-green-400" />
      <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full animate-ping"></span>
      <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 border border-black rounded-full"></span>
    </motion.button>
  );
};

export default SecretLoungeButton;
