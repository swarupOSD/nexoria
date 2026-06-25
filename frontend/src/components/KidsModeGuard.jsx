import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

const KidsModeGuard = ({ children }) => {
  const { isKidsMode } = useSelector(state => state.auth);
  const location = useLocation();

  if (isKidsMode) {
    const isAllowedPath = 
      location.pathname.startsWith('/moviebox/games') ||
      location.pathname === '/login' ||
      location.pathname === '/register' ||
      location.pathname === '/dashboard' ||
      location.pathname === '/profile' ||
      location.pathname === '/change-password' ||
      location.pathname === '/notifications' ||
      location.pathname === '/activity' ||
      location.pathname === '/superadmin' ||
      location.pathname.startsWith('/superadmin'); // Don't lock out admins by accident if they left it on

    if (!isAllowedPath) {
      return <Navigate to="/moviebox/games" replace />;
    }
  }

  return children;
};

export default KidsModeGuard;
