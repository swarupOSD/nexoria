import { apiSlice } from '../api/apiSlice';

export const ratingApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getRatings: builder.query({
      query: (postId) => (postId ? `/ratings/post/${postId}` : `/ratings`),
      providesTags: ['Rating'],
    }),
    createRating: builder.mutation({
      query: (data) => ({
        url: `/ratings`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Rating'],
    }),
    updateRating: builder.mutation({
      query: ({ id, data }) => ({
        url: `/ratings/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Rating'],
    }),
    moderateRating: builder.mutation({
      query: ({ id, status, rejectionReason }) => ({
        url: `/ratings/${id}/moderate`,
        method: 'PUT',
        body: { status, rejectionReason }
      }),
      invalidatesTags: ['Rating'],
    }),
    deleteRating: builder.mutation({
      query: (id) => ({
        url: `/ratings/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Rating'],
    }),
  }),
});

export const {
  useGetRatingsQuery,
  useCreateRatingMutation,
  useUpdateRatingMutation,
  useDeleteRatingMutation,
  useModerateRatingMutation,
} = ratingApiSlice;
