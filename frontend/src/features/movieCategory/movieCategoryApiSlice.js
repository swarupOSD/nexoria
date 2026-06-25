import { apiSlice } from '../api/apiSlice';

export const movieCategoryApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getMovieCategories: builder.query({
      query: () => '/movie-categories',
      providesTags: ['MovieCategory'],
    }),
    getAdminMovieCategories: builder.query({
      query: () => '/movie-categories/admin',
      providesTags: ['MovieCategory'],
    }),
    createMovieCategory: builder.mutation({
      query: (data) => ({
        url: '/movie-categories',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['MovieCategory'],
    }),
    updateMovieCategory: builder.mutation({
      query: ({ id, data }) => ({
        url: `/movie-categories/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['MovieCategory'],
    }),
    deleteMovieCategory: builder.mutation({
      query: (id) => ({
        url: `/movie-categories/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['MovieCategory'],
    }),
  }),
});

export const {
  useGetMovieCategoriesQuery,
  useGetAdminMovieCategoriesQuery,
  useCreateMovieCategoryMutation,
  useUpdateMovieCategoryMutation,
  useDeleteMovieCategoryMutation,
} = movieCategoryApiSlice;
