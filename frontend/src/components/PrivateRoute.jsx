import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useGetMeQuery } from '../features/auth/authApiSlice';
import { useEffect } from 'react';
import { setCredentials } from '../features/auth/authSlice';

const PrivateRoute = () => {
  const { user, token } = useSelector((state) => state.auth);
  const location = useLocation();
  const dispatch = useDispatch();

  const { data, isLoading, isFetching } = useGetMeQuery(undefined, {
    skip: !!user, // Skip if we already have the user in Redux
  });

  useEffect(() => {
    if (data?.user) {
      dispatch(setCredentials({ user: data.user, token: token || localStorage.getItem('token') }));
    }
  }, [data, dispatch, token]);

  const activeUser = user || data?.user;

  if ((isLoading || isFetching) && !activeUser) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-[#0A0A0A]">
        <div className="w-8 h-8 border-2 border-slate-300 dark:border-slate-700 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  return activeUser ? <Outlet /> : <Navigate to="/login" replace state={{ from: location }} />;
};

export default PrivateRoute;
