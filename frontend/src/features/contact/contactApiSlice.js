import { apiSlice } from '../api/apiSlice';

export const contactApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getContactMessages: builder.query({
      query: ({ search = '', status = '', priority = '', category = '' } = {}) => 
        `/contact?search=${search}&status=${status}&priority=${priority}&category=${category}`,
      providesTags: ['Contact'],
    }),
    getMyContactMessages: builder.query({
      query: () => '/contact/my-tickets',
      providesTags: ['Contact'],
    }),
    getContactAnalytics: builder.query({
      query: () => '/contact/analytics',
      providesTags: ['Contact'],
    }),
    createContactMessage: builder.mutation({
      query: (data) => ({
        url: '/contact',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Contact'],
    }),
    replyContactMessage: builder.mutation({
      query: ({ id, data }) => ({
        url: `/contact/${id}/reply`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Contact'],
    }),
    updateContactStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `/contact/${id}/status`,
        method: 'PUT',
        body: { status },
      }),
      invalidatesTags: ['Contact'],
    }),
    updateContactPriority: builder.mutation({
      query: ({ id, priority }) => ({
        url: `/contact/${id}/priority`,
        method: 'PUT',
        body: { priority },
      }),
      invalidatesTags: ['Contact'],
    }),
    resolveContactMessage: builder.mutation({
      query: (id) => ({
        url: `/contact/${id}/resolve`,
        method: 'PUT',
      }),
      invalidatesTags: ['Contact'],
    }),
    deleteContactMessage: builder.mutation({
      query: (id) => ({
        url: `/contact/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Contact'],
    }),
  }),
});

export const {
  useGetContactMessagesQuery,
  useGetMyContactMessagesQuery,
  useGetContactAnalyticsQuery,
  useCreateContactMessageMutation,
  useReplyContactMessageMutation,
  useUpdateContactStatusMutation,
  useUpdateContactPriorityMutation,
  useResolveContactMessageMutation,
  useDeleteContactMessageMutation,
} = contactApiSlice;
