import { apiSlice } from '../api/apiSlice';

export const moderationApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    approvePost: builder.mutation({
      query: (id) => ({
        url: `/posts/${id}/approve`,
        method: 'PUT',
      }),
      invalidatesTags: ['Post'],
    }),
    rejectPost: builder.mutation({
      query: ({ id, reason }) => ({
        url: `/posts/${id}/reject`,
        method: 'PUT',
        body: { rejectionReason: reason },
      }),
      invalidatesTags: ['Post'],
    }),
    markUnderDevelopment: builder.mutation({
      query: (id) => ({
        url: `/posts/${id}/under-development`,
        method: 'PUT',
      }),
      invalidatesTags: ['Post'],
    }),
    schedulePost: builder.mutation({
      query: ({ id, scheduledPublishDate }) => ({
        url: `/posts/${id}/schedule`,
        method: 'PUT',
        body: { scheduledPublishDate },
      }),
      invalidatesTags: ['Post'],
    }),
  }),
});

export const {
  useApprovePostMutation,
  useRejectPostMutation,
  useMarkUnderDevelopmentMutation,
  useSchedulePostMutation,
} = moderationApiSlice;
