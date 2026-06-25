import { apiSlice } from './apiSlice';

export const paymentApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getPremiumPlans: builder.query({
      query: () => '/payments/plans',
      providesTags: ['Plans'],
    }),
    submitPremiumRequest: builder.mutation({
      query: (data) => ({
        url: '/payments/premium',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Payments', 'Activity', 'Notifications'],
    }),
    submitPurchaseRequest: builder.mutation({
      query: (data) => ({
        url: '/payments/purchase',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Payments', 'Activity', 'Notifications'],
    }),
    buyItemWithCoins: builder.mutation({
      query: (data) => ({
        url: '/payments/buy-with-coins',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Payments', 'Activity', 'Notifications', 'User'],
    }),
    getMyRequests: builder.query({
      query: () => '/payments/my',
      providesTags: ['Payments'],
    }),
    getPremiumRequests: builder.query({
      query: () => '/payments/premium',
      providesTags: ['Payments'],
    }),
    getPurchaseRequests: builder.query({
      query: () => '/payments/purchase',
      providesTags: ['Payments'],
    }),
    approvePremiumRequest: builder.mutation({
      query: (id) => ({
        url: `/payments/premium/${id}/approve`,
        method: 'PUT',
      }),
      invalidatesTags: ['Payments', 'User', 'Analytics'],
    }),
    rejectPremiumRequest: builder.mutation({
      query: ({id, reason}) => ({
        url: `/payments/premium/${id}/reject`,
        method: 'PUT',
        body: { reason }
      }),
      invalidatesTags: ['Payments', 'Analytics'],
    }),
    approvePurchaseRequest: builder.mutation({
      query: (id) => ({
        url: `/payments/purchase/${id}/approve`,
        method: 'PUT',
      }),
      invalidatesTags: ['Payments', 'Analytics'],
    }),
    rejectPurchaseRequest: builder.mutation({
      query: ({id, reason}) => ({
        url: `/payments/purchase/${id}/reject`,
        method: 'PUT',
        body: { reason }
      }),
      invalidatesTags: ['Payments', 'Analytics'],
    }),
  }),
});

export const {
  useGetPremiumPlansQuery,
  useSubmitPremiumRequestMutation,
  useSubmitPurchaseRequestMutation,
  useBuyItemWithCoinsMutation,
  useGetMyRequestsQuery,
  useGetPremiumRequestsQuery,
  useGetPurchaseRequestsQuery,
  useApprovePremiumRequestMutation,
  useRejectPremiumRequestMutation,
  useApprovePurchaseRequestMutation,
  useRejectPurchaseRequestMutation,
} = paymentApiSlice;
