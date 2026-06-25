import { apiSlice } from '../api/apiSlice';

export const downloadApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    trackDownload: builder.mutation({
      query: ({ postId, linkId }) => ({
        url: `/downloads/${postId}/${linkId}`,
        method: 'POST',
      }),
      invalidatesTags: ['Post'],
    }),
    getDownloadHistory: builder.query({
      query: () => '/downloads/history',
      providesTags: ['Download'],
    }),
  }),
});

export const {
  useTrackDownloadMutation,
  useGetDownloadHistoryQuery,
} = downloadApiSlice;
