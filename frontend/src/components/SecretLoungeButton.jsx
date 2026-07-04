import React from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const SecretLoungeButton = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Don't show if already on the secret lounge page
  if (location.pathname === '/secret-lounge') return null;

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => navigate('/secret-lounge')}
      className="fixed bottom-6 right-6 z-[100] w-14 h-14 bg-black border border-green-500 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(34,197,94,0.3)] hover:shadow-[0_0_30px_rgba(34,197,94,0.6)] hover:bg-green-950 transition-all group"
      title="Enter Secret Lounge"
    >
      <ShieldAlert className="w-6 h-6 text-green-500 group-hover:text-green-400" />
      <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full animate-ping"></span>
      <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 border border-black rounded-full"></span>
    </motion.button>
  );
};

export default SecretLoungeButton;
