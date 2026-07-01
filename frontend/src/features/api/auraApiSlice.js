import { apiSlice } from './apiSlice';

export const auraApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    recalculateAura: builder.mutation({
      query: () => ({
        url: '/aura/recalculate',
        method: 'POST',
      }),
      invalidatesTags: ['Post', 'User', 'Aura'],
    }),
  }),
});

export const { useRecalculateAuraMutation } = auraApiSlice;
