import { apiSlice } from '../api/apiSlice';

export const commentApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getComments: builder.query({
      query: (postId) => (postId ? `/comments/post/${postId}` : `/comments`),
      providesTags: ['Comment'],
    }),
    createComment: builder.mutation({
      query: (data) => ({
        url: `/comments`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Comment'],
    }),
    replyComment: builder.mutation({
      query: ({ commentId, data }) => ({
        url: `/comments/${commentId}/reply`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Comment'],
    }),
    moderateComment: builder.mutation({
      query: ({ id, status, rejectionReason }) => ({
        url: `/comments/${id}/moderate`,
        method: 'PUT',
        body: { status, rejectionReason }
      }),
      invalidatesTags: ['Comment'],
    }),
    deleteComment: builder.mutation({
      query: (id) => ({
        url: `/comments/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Comment'],
    }),
  }),
});

export const {
  useGetCommentsQuery,
  useCreateCommentMutation,
  useReplyCommentMutation,
  useModerateCommentMutation,
  useDeleteCommentMutation,
} = commentApiSlice;
