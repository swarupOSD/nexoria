import { apiSlice } from './apiSlice';

export const recommendationApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getMovieRecommendations: builder.query({
      query: () => '/recommendations/movies',
      providesTags: ['Recommendation'],
    }),
    getMusicRecommendations: builder.query({
      query: () => '/recommendations/music',
      providesTags: ['Recommendation'],
    }),
  }),
});

export const {
  useGetMovieRecommendationsQuery,
  useGetMusicRecommendationsQuery,
} = recommendationApiSlice;
