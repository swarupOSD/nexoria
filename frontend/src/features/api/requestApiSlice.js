import { apiSlice } from './apiSlice';

export const requestApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getRequests: builder.query({
      query: (params) => ({
        url: '/requests',
        params,
      }),
      providesTags: ['Requests'],
    }),
    createRequest: builder.mutation({
      query: (data) => ({
        url: '/requests',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Requests'],
    }),
    toggleUpvote: builder.mutation({
      query: (id) => ({
        url: `/requests/${id}/upvote`,
        method: 'PUT',
      }),
      invalidatesTags: ['Requests'],
    }),
    updateRequestStatus: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/requests/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Requests'],
    }),
    deleteRequest: builder.mutation({
      query: (id) => ({
        url: `/requests/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Requests'],
    }),
  }),
});

export const {
  useGetRequestsQuery,
  useCreateRequestMutation,
  useToggleUpvoteMutation,
  useUpdateRequestStatusMutation,
  useDeleteRequestMutation,
} = requestApiSlice;
