import { apiSlice } from '../api/apiSlice';

export const gameApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getGames: builder.query({
      query: () => '/games',
      providesTags: ['Games'],
    }),
    getGameById: builder.query({
      query: (id) => `/games/${id}`,
      providesTags: (result, error, id) => [{ type: 'Games', id }],
    }),
    createGame: builder.mutation({
      query: (data) => ({
        url: '/games',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Games'],
    }),
    updateGame: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/games/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Games', id }, 'Games'],
    }),
    deleteGame: builder.mutation({
      query: (id) => ({
        url: `/games/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Games'],
    }),
  }),
});

export const {
  useGetGamesQuery,
  useGetGameByIdQuery,
  useCreateGameMutation,
  useUpdateGameMutation,
  useDeleteGameMutation,
} = gameApiSlice;
