import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { setCredentials, logout } from '../auth/authSlice';

const BACKEND_URL = 'https://nexoria-backend-mt5e.onrender.com/api';

const prepareHeaders = (headers, { getState }) => {
  const token = getState().auth.token;
  if (token) {
    headers.set('authorization', `Bearer ${token}`);
  }
  return headers;
};

// Use a SINGLE baseQuery pointing directly to the live backend.
// This completely avoids Capacitor runtime detection and eliminates any risk of falling back to localhost.
const directBaseQuery = fetchBaseQuery({
  baseUrl: BACKEND_URL,
  credentials: 'include',
  prepareHeaders,
});

const baseQueryWithReauth = async (args, api, extraOptions) => {
  let result = await directBaseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    // try to get a new token
    const refreshResult = await directBaseQuery(
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
      result = await directBaseQuery(args, api, extraOptions);
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
    'NexoriaArtist', 'NexoriaGenre', 'NexoriaAlbum', 'NexoriaTrack', 'NexoriaPlaylist', 'NexoriaMusicHistory'
  ],
  refetchOnMountOrArgChange: true,
  endpoints: (builder) => ({}),
});
