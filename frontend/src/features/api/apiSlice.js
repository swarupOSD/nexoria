import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { setCredentials, logout } from '../auth/authSlice';

const baseQuery = fetchBaseQuery({ 
  baseUrl: import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : (import.meta.env.MODE === 'test' ? 'http://localhost/api' : '/api'),
  credentials: 'include',
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth.token;
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    return headers;
  }
});

const baseQueryWithReauth = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    // try to get a new token
    const refreshResult = await baseQuery({ url: '/auth/refresh', method: 'POST' }, api, extraOptions);
    if (refreshResult.data) {
      // store the new token
      api.dispatch(setCredentials({ user: api.getState().auth.user, token: refreshResult.data.accessToken }));
      // retry the initial query
      result = await baseQuery(args, api, extraOptions);
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
    'MovieApproval', 'MovieReview', 'MovieRating', 'MovieReport', 'MovieWatchHistory', 'Games'
  ],
  refetchOnMountOrArgChange: true,
  endpoints: (builder) => ({}),
});
