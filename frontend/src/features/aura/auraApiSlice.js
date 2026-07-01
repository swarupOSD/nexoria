import { apiSlice } from '../api/apiSlice';

export const auraApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAuraLeaderboard: builder.query({
      query: (type = 'all') => ({ url: `/aura/leaderboard?type=${type}&limit=20`, method: 'GET' }),
      providesTags: ['Aura'],
    }),
    getItemAura: builder.query({
      query: ({ type, id }) => ({ url: `/aura/${type}/${id}`, method: 'GET' }),
      providesTags: (result, error, { id }) => [{ type: 'Aura', id }],
    }),
    vibeVote: builder.mutation({
      query: ({ type, id }) => ({ url: `/aura/${type}/${id}/vote`, method: 'POST' }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Aura', id }, 'Aura'],
    }),
    getAuraBattle: builder.query({
      query: () => ({ url: '/aura/battle', method: 'GET' }),
      providesTags: ['AuraBattle'],
    }),
    voteAuraBattle: builder.mutation({
      query: (data) => ({ url: '/aura/battle/vote', method: 'POST', body: data }),
      invalidatesTags: ['AuraBattle', 'Aura'],
    }),
    getPersonalAura: builder.query({
      query: () => ({ url: '/aura/me', method: 'GET' }),
      providesTags: ['Aura'],
    }),
  }),
});

export const {
  useGetAuraLeaderboardQuery,
  useGetItemAuraQuery,
  useVibeVoteMutation,
  useGetAuraBattleQuery,
  useVoteAuraBattleMutation,
  useGetPersonalAuraQuery,
} = auraApiSlice;
