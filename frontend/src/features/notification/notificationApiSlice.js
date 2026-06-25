import { apiSlice } from '../api/apiSlice';

export const notificationApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getNotifications: builder.query({
      query: (params) => ({
        url: '/notifications',
        params: { ...params, types: params.types?.join(',') } // format array to string
      }),
      // Support infinite scrolling
      serializeQueryArgs: ({ endpointName, queryArgs }) => {
        return `${endpointName}-${queryArgs.types?.join(',') || 'all'}-${queryArgs.search || ''}`;
      },
      merge: (currentCache, newItems, { arg }) => {
        if (arg.page === 1) {
          return newItems;
        }
        currentCache.data.push(...newItems.data);
        currentCache.pagination = newItems.pagination;
      },
      forceRefetch({ currentArg, previousArg }) {
        return currentArg?.page !== previousArg?.page || currentArg?.types !== previousArg?.types || currentArg?.search !== previousArg?.search;
      },
      providesTags: ['Notification'],
    }),
    getUnreadCount: builder.query({
      query: () => '/notifications/unread',
      providesTags: ['Notification'],
    }),
    markAsRead: builder.mutation({
      query: (id) => ({
        url: `/notifications/${id}/read`,
        method: 'PUT',
      }),
      invalidatesTags: ['Notification'],
    }),
    markAllAsRead: builder.mutation({
      query: () => ({
        url: '/notifications/read-all',
        method: 'PUT',
      }),
      invalidatesTags: ['Notification'],
    }),
    deleteNotification: builder.mutation({
      query: (id) => ({
        url: `/notifications/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Notification'],
    }),
  }),
});

export const {
  useGetNotificationsQuery,
  useGetUnreadCountQuery,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
  useDeleteNotificationMutation,
} = notificationApiSlice;
