import { apiSlice } from '../api/apiSlice';

export const appRequestApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getMyAppRequests: builder.query({
      query: () => '/app-requests/me',
      providesTags: ['AppRequest'],
    }),
    createAppRequest: builder.mutation({
      query: (data) => ({
        url: '/app-requests',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['AppRequest'],
    }),
    getAllAppRequests: builder.query({
      query: () => '/app-requests',
      providesTags: ['AppRequest'],
    }),
    updateAppRequest: builder.mutation({
      query: (data) => ({
        url: `/app-requests/${data.id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['AppRequest'],
    }),
  }),
});

export const {
  useGetMyAppRequestsQuery,
  useCreateAppRequestMutation,
  useGetAllAppRequestsQuery,
  useUpdateAppRequestMutation,
} = appRequestApiSlice;
