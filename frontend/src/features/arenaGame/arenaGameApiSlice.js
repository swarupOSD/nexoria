import { apiSlice } from '../api/apiSlice';

export const arenaGameApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getActiveArenaGames: builder.query({
      query: () => '/arena-games',
      providesTags: ['ArenaGame'],
    }),
    getAdminArenaGames: builder.query({
      query: () => '/arena-games/admin',
      providesTags: ['ArenaGame'],
    }),
    addArenaGame: builder.mutation({
      query: (data) => ({
        url: '/arena-games',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['ArenaGame'],
    }),
    updateArenaGame: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/arena-games/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['ArenaGame'],
    }),
    deleteArenaGame: builder.mutation({
      query: (id) => ({
        url: `/arena-games/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['ArenaGame'],
    }),
  }),
});

export const {
  useGetActiveArenaGamesQuery,
  useGetAdminArenaGamesQuery,
  useAddArenaGameMutation,
  useUpdateArenaGameMutation,
  useDeleteArenaGameMutation,
} = arenaGameApiSlice;
