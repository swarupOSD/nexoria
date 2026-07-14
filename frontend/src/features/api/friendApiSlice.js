import { apiSlice } from './apiSlice';

export const friendApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getFriendsList: builder.query({
      query: () => '/friends/list',
      providesTags: ['Friends'],
    }),
    getFriendRequests: builder.query({
      query: () => '/friends/requests',
      providesTags: ['FriendRequests'],
    }),
    sendFriendRequest: builder.mutation({
      query: (data) => ({
        url: '/friends/request',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['FriendRequests'],
    }),
    respondToFriendRequest: builder.mutation({
      query: (data) => ({
        url: '/friends/respond',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['FriendRequests', 'Friends'],
    }),
  }),
});

export const {
  useGetFriendsListQuery,
  useGetFriendRequestsQuery,
  useSendFriendRequestMutation,
  useRespondToFriendRequestMutation,
} = friendApiSlice;
