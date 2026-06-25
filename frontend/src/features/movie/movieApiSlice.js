import { apiSlice } from '../api/apiSlice';

export const movieApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getMovies: builder.query({
      query: ({ page = 1, limit = 20, category = '', search = '', sort = 'newest', language = '', genre = '', quality = '', isPremium = '', movieType = '' } = {}) => 
        `/movies?page=${page}&limit=${limit}&category=${category}&search=${search}&sort=${sort}&language=${language}&genre=${genre}&quality=${quality}&isPremium=${isPremium}&movieType=${movieType}`,
      providesTags: ['Movie'],
    }),
    getAdminMovies: builder.query({
      query: ({ page = 1, limit = 20, search = '', status = '', movieType = '' } = {}) => 
        `/movies/admin?page=${page}&limit=${limit}&search=${search}&status=${status}&movieType=${movieType}`,
      providesTags: ['Movie'],
    }),
    getMovieHomeSections: builder.query({
      query: () => '/movies/home-sections',
      providesTags: ['Movie'],
    }),
    getMovieBySlug: builder.query({
      query: (slug) => `/movies/${slug}`,
      providesTags: (result, error, arg) => [{ type: 'Movie', id: arg }],
    }),
    createMovie: builder.mutation({
      query: (data) => ({
        url: '/movies',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Movie'],
    }),
    updateMovie: builder.mutation({
      query: ({ id, data }) => ({
        url: `/movies/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Movie', 'MovieCategory'],
    }),
    deleteMovie: builder.mutation({
      query: (id) => ({
        url: `/movies/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Movie', 'MovieCategory'],
    }),
    incrementMovieDownload: builder.mutation({
      query: (id) => ({
        url: `/movies/${id}/download`,
        method: 'POST',
      }),
      // We don't invalidate here to prevent re-fetching the entire movie details just for a download click
    }),
    incrementMovieWatch: builder.mutation({
      query: (id) => ({
        url: `/movies/${id}/watch`,
        method: 'POST',
      }),
    }),
    getMovieAnalytics: builder.query({
      query: () => '/movies/analytics/dashboard',
      providesTags: ['Movie'],
    }),
    
    // --- User Review Endpoints --- //
    getMovieReviews: builder.query({
      query: ({ id, page = 1, limit = 10 }) => `/movies/${id}/reviews?page=${page}&limit=${limit}`,
      providesTags: (result, error, arg) => [{ type: 'MovieReview', id: arg.id }],
    }),
    addMovieReview: builder.mutation({
      query: ({ id, rating, comment }) => ({
        url: `/movies/${id}/reviews`,
        method: 'POST',
        body: { rating, comment },
      }),
      invalidatesTags: (result, error, arg) => [
        { type: 'MovieReview', id: arg.id },
        { type: 'Movie', id: arg.id }
      ],
    }),
    
    // --- Admin Endpoints --- //
    getMovieApprovalQueue: builder.query({
      query: () => '/movie-admin/approval-queue',
      providesTags: ['MovieApproval'],
    }),
    moderateMovieApproval: builder.mutation({
      query: ({ id, status }) => ({
        url: `/movie-admin/approval-queue/${id}`,
        method: 'PUT',
        body: { status },
      }),
      invalidatesTags: ['MovieApproval', 'Movie'],
    }),
    
    getAdminMovieReviews: builder.query({
      query: ({ page = 1, limit = 20 } = {}) => `/movie-admin/reviews?page=${page}&limit=${limit}`,
      providesTags: ['MovieReview'],
    }),
    moderateMovieReview: builder.mutation({
      query: ({ id, isApproved }) => ({
        url: `/movie-admin/reviews/${id}`,
        method: 'PUT',
        body: { isApproved },
      }),
      invalidatesTags: ['MovieReview'],
    }),
    deleteMovieReview: builder.mutation({
      query: (id) => ({
        url: `/movie-admin/reviews/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['MovieReview'],
    }),
    
    getAdminMovieReports: builder.query({
      query: ({ page = 1, limit = 20 } = {}) => `/movie-admin/reports?page=${page}&limit=${limit}`,
      providesTags: ['MovieReport'],
    }),
    moderateMovieReport: builder.mutation({
      query: ({ id, status }) => ({
        url: `/movie-admin/reports/${id}`,
        method: 'PUT',
        body: { status },
      }),
      invalidatesTags: ['MovieReport'],
    }),
    deleteMovieReport: builder.mutation({
      query: (id) => ({
        url: `/movie-admin/reports/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['MovieReport'],
    }),
    
    getAdminMovieRatings: builder.query({
      query: ({ page = 1, limit = 20, sort = 'top' } = {}) => `/movie-admin/ratings?page=${page}&limit=${limit}&sort=${sort}`,
      providesTags: ['MovieRating'],
    }),
    
    getMovieWatchHistory: builder.query({
      query: ({ page = 1, limit = 20 } = {}) => `/movie-admin/watch-history?page=${page}&limit=${limit}`,
      providesTags: ['MovieWatchHistory'],
    }),
  }),
});

export const {
  useGetMoviesQuery,
  useGetAdminMoviesQuery,
  useGetMovieHomeSectionsQuery,
  useGetMovieBySlugQuery,
  useCreateMovieMutation,
  useUpdateMovieMutation,
  useDeleteMovieMutation,
  useIncrementMovieDownloadMutation,
  useIncrementMovieWatchMutation,
  useGetMovieAnalyticsQuery,
  useGetMovieReviewsQuery,
  useAddMovieReviewMutation,
  
  useGetMovieApprovalQueueQuery,
  useModerateMovieApprovalMutation,
  
  useGetAdminMovieReviewsQuery,
  useModerateMovieReviewMutation,
  useDeleteMovieReviewMutation,
  
  useGetAdminMovieReportsQuery,
  useModerateMovieReportMutation,
  useDeleteMovieReportMutation,
  
  useGetAdminMovieRatingsQuery,
  useGetMovieWatchHistoryQuery,
} = movieApiSlice;
