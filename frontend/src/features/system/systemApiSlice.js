import { apiSlice } from '../api/apiSlice';

export const systemApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getSecurityLogs: builder.query({
      query: () => '/system/security-logs',
      providesTags: ['SecurityLogs'],
    }),
    clearSecurityLogs: builder.mutation({
      query: () => ({
        url: '/system/security-logs',
        method: 'DELETE',
      }),
      invalidatesTags: ['SecurityLogs'],
    }),
  }),
});

export const {
  useGetSecurityLogsQuery,
  useClearSecurityLogsMutation,
} = systemApiSlice;
