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
    // Music Analytics
    getMusicAnalytics: builder.query({
      query: (days = 7) => `/analytics/music?days=${days}`,
      providesTags: ['Analytics'],
    }),
    // Private Chat Analytics (stats)
    getPrivateChatAnalytics: builder.query({
      query: (days = 7) => `/analytics/private-chat?days=${days}`,
      providesTags: ['Analytics'],
    }),
    // Admin: All Conversations list
    getAdminConversations: builder.query({
      query: ({ page = 1, limit = 20, search = '' } = {}) =>
        `/analytics/private-chat/conversations?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`,
      providesTags: ['AdminConversations'],
    }),
    // Admin: All messages in a specific conversation
    getAdminConversationMessages: builder.query({
      query: ({ conversationId, page = 1, limit = 50 }) =>
        `/analytics/private-chat/conversations/${conversationId}/messages?page=${page}&limit=${limit}`,
      providesTags: (result, error, { conversationId }) => [{ type: 'AdminConvMessages', id: conversationId }],
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
  useGetAdminConversationsQuery,
  useGetAdminConversationMessagesQuery,
} = analyticsApiSlice;
