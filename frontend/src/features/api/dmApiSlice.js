import { apiSlice } from './apiSlice';

export const dmApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getDMAnalytics: builder.query({
      query: () => '/dm/admin/analytics',
      providesTags: ['DMAnalytics'],
    }),
    getAdminConversations: builder.query({
      query: ({ page, limit }) => ({
        url: '/dm/admin/conversations',
        params: { page, limit }
      }),
      providesTags: ['DMConversations'],
    }),
    deleteAdminConversation: builder.mutation({
      query: (id) => ({
        url: `/dm/admin/conversations/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['DMConversations', 'DMAnalytics'],
    }),
    restrictUserDMs: builder.mutation({
      query: ({ id, disableDM }) => ({
        url: `/dm/admin/users/${id}/dm-restrict`,
        method: 'PUT',
        body: { disableDM },
      }),
      invalidatesTags: ['DMConversations'],
    }),
  }),
});

export const {
  useGetDMAnalyticsQuery,
  useGetAdminConversationsQuery,
  useDeleteAdminConversationMutation,
  useRestrictUserDMsMutation,
} = dmApiSlice;
