import { apiSlice } from '../api/apiSlice';

export const reviewApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getPostReviews: builder.query({
      query: (postId) => `/reviews/post/${postId}`,
      providesTags: (result, error, id) => [{ type: 'Review', id }],
    }),
    createReview: builder.mutation({
      query: (data) => ({
        url: '/reviews',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (result, error, arg) => [{ type: 'Review', id: arg.postId }],
    }),
    updateReview: builder.mutation({
      query: (data) => ({
        url: `/reviews/${data.id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, arg) => [{ type: 'Review', id: arg.postId }],
    }),
    deleteReview: builder.mutation({
      query: (id) => ({
        url: `/reviews/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Review'],
    }),
    getAdminReviews: builder.query({
      query: () => '/reviews/admin/all',
      providesTags: ['Review'],
    }),
    moderateReview: builder.mutation({
      query: ({ id, isApproved }) => ({
        url: `/reviews/${id}/moderate`,
        method: 'PUT',
        body: { isApproved },
      }),
      invalidatesTags: ['Review'],
    }),
  }),
});

export const {
  useGetPostReviewsQuery,
  useCreateReviewMutation,
  useUpdateReviewMutation,
  useDeleteReviewMutation,
  useGetAdminReviewsQuery,
  useModerateReviewMutation,
} = reviewApiSlice;
