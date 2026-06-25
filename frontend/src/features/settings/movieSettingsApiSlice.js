import { apiSlice } from '../api/apiSlice';

export const movieSettingsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getMovieSettings: builder.query({
      query: () => '/movie-settings',
      providesTags: ['MovieSettings'],
    }),
    updateMovieSettings: builder.mutation({
      query: (data) => ({
        url: '/movie-settings',
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['MovieSettings'],
    }),
  }),
});

export const {
  useGetMovieSettingsQuery,
  useUpdateMovieSettingsMutation,
} = movieSettingsApiSlice;
