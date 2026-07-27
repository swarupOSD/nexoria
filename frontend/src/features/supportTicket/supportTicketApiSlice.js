import { apiSlice } from '../api/apiSlice';

export const supportTicketApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // User
    createSupportTicket: builder.mutation({
      query: (data) => ({
        url: '/support-tickets',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['SupportTickets'],
    }),
    getMyTickets: builder.query({
      query: () => '/support-tickets/my',
      providesTags: ['SupportTickets'],
    }),
    // Admin
    getAllTickets: builder.query({
      query: ({ page = 1, limit = 20, status, type, priority } = {}) => {
        const params = new URLSearchParams({ page, limit });
        if (status) params.append('status', status);
        if (type) params.append('type', type);
        if (priority) params.append('priority', priority);
        return `/support-tickets/admin?${params.toString()}`;
      },
      providesTags: ['SupportTickets'],
    }),
    resolveTicket: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/support-tickets/admin/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['SupportTickets'],
    }),
    deleteTicket: builder.mutation({
      query: (id) => ({
        url: `/support-tickets/admin/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['SupportTickets'],
    }),
  }),
});

export const {
  useCreateSupportTicketMutation,
  useGetMyTicketsQuery,
  useGetAllTicketsQuery,
  useResolveTicketMutation,
  useDeleteTicketMutation,
} = supportTicketApiSlice;
