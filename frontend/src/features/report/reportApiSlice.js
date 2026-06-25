import { apiSlice } from '../api/apiSlice';

export const reportApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getReports: builder.query({
      query: () => '/reports',
      providesTags: ['Report'],
    }),
    createReport: builder.mutation({
      query: (data) => ({
        url: '/reports',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Report'],
    }),
    resolveReport: builder.mutation({
      query: (id) => ({
        url: `/reports/${id}/resolve`,
        method: 'PUT',
      }),
      invalidatesTags: ['Report'],
    }),
    rejectReport: builder.mutation({
      query: (id) => ({
        url: `/reports/${id}/reject`,
        method: 'PUT',
      }),
      invalidatesTags: ['Report'],
    }),
    deleteReport: builder.mutation({
      query: (id) => ({
        url: `/reports/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Report'],
    }),
  }),
});

export const {
  useGetReportsQuery,
  useCreateReportMutation,
  useResolveReportMutation,
  useRejectReportMutation,
  useDeleteReportMutation,
} = reportApiSlice;
