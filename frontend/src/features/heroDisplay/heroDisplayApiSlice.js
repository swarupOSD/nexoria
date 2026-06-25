import { apiSlice } from '../api/apiSlice';

export const heroDisplayApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getHeroDisplays: builder.query({
      query: () => '/hero-displays',
      providesTags: ['HeroDisplay'],
    }),
    getAdminHeroDisplays: builder.query({
      query: () => '/hero-displays/admin',
      providesTags: ['HeroDisplay'],
    }),
    createHeroDisplay: builder.mutation({
      query: (data) => ({
        url: '/hero-displays',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['HeroDisplay'],
    }),
    updateHeroDisplay: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/hero-displays/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['HeroDisplay'],
    }),
    deleteHeroDisplay: builder.mutation({
      query: (id) => ({
        url: `/hero-displays/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['HeroDisplay'],
    }),
  }),
});

export const { 
  useGetHeroDisplaysQuery,
  useGetAdminHeroDisplaysQuery,
  useCreateHeroDisplayMutation,
  useUpdateHeroDisplayMutation,
  useDeleteHeroDisplayMutation
} = heroDisplayApiSlice;
