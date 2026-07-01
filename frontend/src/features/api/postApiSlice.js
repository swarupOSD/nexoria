import { apiSlice } from './apiSlice';

export const postApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getPosts: builder.query({
      query: (params) => ({
        url: '/posts',
        params,
      }),
      providesTags: ['Post'],
    }),
    getPostBySlug: builder.query({
      query: (slug) => `/posts/${slug}`,
      providesTags: (result, error, slug) => [{ type: 'Post', id: slug }],
    }),
    addComment: builder.mutation({
      query: ({ postId, data }) => ({
        url: `/posts/${postId}/comments`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Comment'],
    }),
    getComments: builder.query({
      query: (postId) => `/posts/${postId}/comments`,
      providesTags: ['Comment'],
    }),
    getForYouRecommendations: builder.query({
      query: () => '/posts/recommendations',
      providesTags: ['Post'],
    }),
  }),
});

export const {
  useGetPostsQuery,
  useGetPostBySlugQuery,
  useAddCommentMutation,
  useGetCommentsQuery,
  useGetForYouRecommendationsQuery,
} = postApiSlice;
