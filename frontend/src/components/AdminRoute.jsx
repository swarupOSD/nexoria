import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useGetMeQuery } from '../features/auth/authApiSlice';

const AdminRoute = ({ children }) => {
  const { user } = useSelector((state) => state.auth);
  const location = useLocation();

  const { data, isLoading, isFetching } = useGetMeQuery(undefined, {
    skip: !!user,
  });

  const activeUser = user || data?.user;

  if (isLoading || isFetching) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0A0A0A]">
        <div className="w-8 h-8 border-2 border-slate-700 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!activeUser) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  const role = activeUser.role;
  const isAdmin = role === 'admin' || role === 'superadmin' || role === 'owner';

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default AdminRoute;
