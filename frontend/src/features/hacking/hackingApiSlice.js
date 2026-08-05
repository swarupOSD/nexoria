import { apiSlice } from '../api/apiSlice';

export const hackingApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getHackingTools: builder.query({
      query: () => '/hacking',
      providesTags: ['Hacking'],
    }),
    getAdminHackingTools: builder.query({
      query: () => '/hacking/admin',
      providesTags: ['Hacking'],
    }),
    createHackingTool: builder.mutation({
      query: (data) => ({
        url: '/hacking',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Hacking'],
    }),
    updateHackingTool: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/hacking/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Hacking'],
    }),
    deleteHackingTool: builder.mutation({
      query: (id) => ({
        url: `/hacking/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Hacking'],
    }),
  }),
});

export const {
  useGetHackingToolsQuery,
  useGetAdminHackingToolsQuery,
  useCreateHackingToolMutation,
  useUpdateHackingToolMutation,
  useDeleteHackingToolMutation,
} = hackingApiSlice;
