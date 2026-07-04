import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { setCredentials, logout } from '../auth/authSlice';

const BACKEND_URL = 'https://nexoria-backend-mt5e.onrender.com/api';
const WEB_BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : (import.meta.env.MODE === 'test' ? 'http://localhost/api' : '/api');

const prepareHeaders = (headers, { getState }) => {
  const token = getState().auth.token;
  if (token) {
    headers.set('authorization', `Bearer ${token}`);
  }
  return headers;
};

// Two separate baseQuery instances: one for web, one for Capacitor (native)
const webBaseQuery = fetchBaseQuery({
  baseUrl: WEB_BASE,
  credentials: 'include',
  prepareHeaders,
});

const nativeBaseQuery = fetchBaseQuery({
  baseUrl: BACKEND_URL,
  credentials: 'include',
  prepareHeaders,
});

// This function is called on EVERY request, so it checks Capacitor status at runtime
const dynamicBaseQuery = (args, api, extraOptions) => {
  const isNative =
    typeof window !== 'undefined' &&
    window.Capacitor != null &&
    typeof window.Capacitor.isNativePlatform === 'function' &&
    window.Capacitor.isNativePlatform();

  return isNative
    ? nativeBaseQuery(args, api, extraOptions)
    : webBaseQuery(args, api, extraOptions);
};

const baseQueryWithReauth = async (args, api, extraOptions) => {
  let result = await dynamicBaseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    // try to get a new token
    const refreshResult = await dynamicBaseQuery(
      { url: '/auth/refresh', method: 'POST' },
      api,
      extraOptions
    );
    if (refreshResult.data) {
      api.dispatch(
        setCredentials({
          user: api.getState().auth.user,
          token: refreshResult.data.accessToken,
        })
      );
      result = await dynamicBaseQuery(args, api, extraOptions);
    } else {
      api.dispatch(logout());
    }
  }
  return result;
};

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    'User', 'Post', 'Category', 'Comment', 'Settings', 'HeroDisplay',
    'Movie', 'MovieCategory', 'MoviePurchase', 'MovieSettings',
    'Plans', 'Payments', 'Analytics', 'Activity', 'Notifications',
    'MovieApproval', 'MovieReview', 'MovieRating', 'MovieReport', 'MovieWatchHistory', 'Games', 'Trash',
    'Aura', 'AuraBattle',
  ],
  refetchOnMountOrArgChange: true,
  endpoints: (builder) => ({}),
});
