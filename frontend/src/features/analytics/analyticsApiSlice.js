import { apiSlice } from '../api/apiSlice';

export const analyticsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getDashboardAnalytics: builder.query({
      query: () => '/analytics/dashboard',
      providesTags: ['Analytics'],
    }),
    getAdminAnalytics: builder.query({
      query: () => '/analytics/admin',
      providesTags: ['Analytics'],
    }),
    getSuperAdminAnalytics: builder.query({
      query: () => '/analytics/superadmin',
      providesTags: ['Analytics'],
    }),
    getModuleAnalytics: builder.query({
      query: (module) => `/analytics/superadmin/module/${module}`,
      providesTags: ['Analytics'],
    }),
    trackAdblock: builder.mutation({
      query: (data) => ({
        url: '/analytics/adblock',
        method: 'POST',
        body: data,
      }),
    }),
    getAdblockAnalytics: builder.query({
      query: () => '/analytics/adblock',
      providesTags: ['Analytics'],
    }),
    // NEW: Music Analytics
    getMusicAnalytics: builder.query({
      query: (days = 7) => `/analytics/music?days=${days}`,
      providesTags: ['Analytics'],
    }),
    // NEW: Private Chat Analytics
    getPrivateChatAnalytics: builder.query({
      query: (days = 7) => `/analytics/private-chat?days=${days}`,
      providesTags: ['Analytics'],
    }),
  }),
});

export const {
  useGetDashboardAnalyticsQuery,
  useGetAdminAnalyticsQuery,
  useGetSuperAdminAnalyticsQuery,
  useGetModuleAnalyticsQuery,
  useTrackAdblockMutation,
  useGetAdblockAnalyticsQuery,
  useGetMusicAnalyticsQuery,
  useGetPrivateChatAnalyticsQuery,
} = analyticsApiSlice;
