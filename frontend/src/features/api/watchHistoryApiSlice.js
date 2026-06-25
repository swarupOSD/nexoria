import { apiSlice } from './apiSlice';

export const watchHistoryApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getWatchHistory: builder.query({
      query: () => '/watch-history',
      providesTags: ['WatchHistory'],
    }),
    updateWatchHistory: builder.mutation({
      query: (data) => ({
        url: '/watch-history/update',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['WatchHistory'],
      // Optimistic update for silent background sync
      async onQueryStarted({ movieId, progress, duration }, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          watchHistoryApiSlice.util.updateQueryData('getWatchHistory', undefined, (draft) => {
            const existing = draft?.data?.find((item) => item.movie?._id === movieId);
            if (existing) {
              existing.progress = progress;
              existing.duration = duration;
            }
          })
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
    }),
    removeFromWatchHistory: builder.mutation({
      query: (movieId) => ({
        url: `/watch-history/${movieId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['WatchHistory'],
    }),
  }),
});

export const {
  useGetWatchHistoryQuery,
  useUpdateWatchHistoryMutation,
  useRemoveFromWatchHistoryMutation,
} = watchHistoryApiSlice;
