import { apiSlice } from '../api/apiSlice';

export const postApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getPosts: builder.query({
      query: (params) => {
        let url = '/posts';
        if (params) {
          const queryString = new URLSearchParams(params).toString();
          url = `/posts?${queryString}`;
        }
        return { url, method: 'GET' };
      },
      providesTags: ['Post'],
      keepUnusedDataFor: 120, // Keep data cached for 2 minutes to prevent flashes
    }),
    getPostBySlug: builder.query({
      query: (slug) => ({
        url: `/posts/${slug}`,
        method: 'GET',
      }),
      providesTags: (result, error, arg) => [{ type: 'Post', id: arg }],
    }),
    getPostById: builder.query({
      query: (id) => ({
        url: `/posts/id/${id}`,
        method: 'GET',
      }),
      providesTags: (result, error, arg) => [{ type: 'Post', id: arg }],
    }),
    getRecommendations: builder.query({
      query: () => '/posts/recommendations',
      providesTags: ['Post'],
    }),
    createPost: builder.mutation({
      query: (data) => ({
        url: '/posts',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Post'],
    }),
    updatePost: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/posts/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Post'],
    }),
    deletePost: builder.mutation({
      query: (id) => ({
        url: `/posts/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Post'],
    }),
    searchPosts: builder.query({
      query: (q) => ({
        url: `/posts/search?q=${q}`,
        method: 'GET',
      }),
    }),
    getRelatedPosts: builder.query({
      query: (id) => ({
        url: `/posts/related/${id}`,
        method: 'GET',
      }),
    }),
    getForYouRecommendations: builder.query({
      query: () => ({
        url: '/posts/recommendations',
        method: 'GET',
      }),
      providesTags: ['Post'],
    }),
    getAdminPosts: builder.query({
      query: (params) => {
        let url = '/posts/admin/all';
        if (params) {
          const queryString = new URLSearchParams(params).toString();
          url = `${url}?${queryString}`;
        }
        return { url, method: 'GET' };
      },
      providesTags: ['Post'],
    }),
    moderatePost: builder.mutation({
      query: ({ id, status, rejectionReason }) => ({
        url: `/posts/${id}/moderate`,
        method: 'PUT',
        body: { status, rejectionReason },
      }),
      invalidatesTags: ['Post'],
    }),
    addDownloadLink: builder.mutation({
      query: ({ id, data }) => ({
        url: `/posts/${id}/download-links`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Post'],
    }),
    updateDownloadLink: builder.mutation({
      query: ({ id, linkId, data }) => ({
        url: `/posts/${id}/download-links/${linkId}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Post'],
    }),
    deleteDownloadLink: builder.mutation({
      query: ({ id, linkId }) => ({
        url: `/posts/${id}/download-links/${linkId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Post'],
    }),
    toggleDownloadLink: builder.mutation({
      query: ({ id, linkId }) => ({
        url: `/posts/${id}/download-links/${linkId}/toggle`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Post'],
    }),
    updateLinkPriority: builder.mutation({
      query: ({ id, linkId, priority }) => ({
        url: `/posts/${id}/download-links/${linkId}/priority`,
        method: 'PATCH',
        body: { priority },
      }),
      invalidatesTags: ['Post'],
    }),
    scrapePlayStore: builder.mutation({
      query: (data) => ({
        url: '/admin/scraper/playstore',
        method: 'POST',
        body: data,
      }),
    }),
  }),
});

export const {
  useGetPostsQuery,
  useGetPostBySlugQuery,
  useGetPostByIdQuery,
  useGetRecommendationsQuery,
  useCreatePostMutation,
  useUpdatePostMutation,
  useDeletePostMutation,
  useSearchPostsQuery,
  useGetRelatedPostsQuery,
  useGetForYouRecommendationsQuery,
  useGetAdminPostsQuery,
  useModeratePostMutation,
  useAddDownloadLinkMutation,
  useUpdateDownloadLinkMutation,
  useDeleteDownloadLinkMutation,
  useToggleDownloadLinkMutation,
  useUpdateLinkPriorityMutation,
  useScrapePlayStoreMutation,
} = postApiSlice;
