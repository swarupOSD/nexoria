import { apiSlice } from '../api/apiSlice';

export const moviePurchaseApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    submitMoviePurchaseRequest: builder.mutation({
      query: (data) => ({
        url: '/movie-purchases',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['MoviePurchase'],
    }),
    getMyMoviePurchaseRequests: builder.query({
      query: () => '/movie-purchases/my-requests',
      providesTags: ['MoviePurchase'],
    }),
    getAllMoviePurchaseRequests: builder.query({
      query: ({ page = 1, limit = 20, search = '', status = '' } = {}) => 
        `/movie-purchases?page=${page}&limit=${limit}&search=${search}&status=${status}`,
      providesTags: ['MoviePurchase'],
    }),
    updateMoviePurchaseRequestStatus: builder.mutation({
      query: ({ id, status, rejectionReason }) => ({
        url: `/movie-purchases/${id}`,
        method: 'PUT',
        body: { status, rejectionReason },
      }),
      invalidatesTags: ['MoviePurchase'],
    }),
  }),
});

export const {
  useSubmitMoviePurchaseRequestMutation,
  useGetMyMoviePurchaseRequestsQuery,
  useGetAllMoviePurchaseRequestsQuery,
  useUpdateMoviePurchaseRequestStatusMutation,
} = moviePurchaseApiSlice;
