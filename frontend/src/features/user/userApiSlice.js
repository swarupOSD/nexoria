import { apiSlice } from '../api/apiSlice';

export const userApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getUsers: builder.query({
      query: () => '/users',
      providesTags: ['User'],
    }),
    getUserDetails: builder.query({
      query: (id) => `/users/${id}`,
      providesTags: (result, error, id) => [{ type: 'User', id }],
    }),
    updateUser: builder.mutation({
      query: (data) => ({
        url: `/users/${data.id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['User'],
    }),
    deleteUser: builder.mutation({
      query: (id) => ({
        url: `/users/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['User'],
    }),
    managePremium: builder.mutation({
      query: (data) => ({
        url: `/users/${data.id}/premium`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['User'],
    }),
    assignPremium: builder.mutation({
      query: (data) => ({
        url: `/users/premium/assign`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['User'],
    }),
    revokePremium: builder.mutation({
      query: (data) => ({
        url: `/users/premium/revoke`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['User'],
    }),
    getPremiumHistory: builder.query({
      query: (userId) => `/users/premium/history/${userId}`,
      providesTags: ['User'],
    }),
    getWishlist: builder.query({
      query: () => '/users/me/wishlist',
      providesTags: ['Wishlist'],
    }),
    addToWishlist: builder.mutation({
      query: (data) => ({
        url: '/users/me/wishlist',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Wishlist'],
    }),
    removeFromWishlist: builder.mutation({
      query: (postId) => ({
        url: `/users/me/wishlist/${postId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Wishlist'],
    }),
    subscribeToPush: builder.mutation({
      query: (data) => ({
        url: '/users/push-subscribe',
        method: 'POST',
        body: data,
      })
    }),
    updateFCMToken: builder.mutation({
      query: (data) => ({
        url: '/users/fcm-token',
        method: 'POST',
        body: data,
      })
    }),
    updateTheme: builder.mutation({
      query: (data) => ({
        url: '/users/theme',
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['User'],
    }),
  }),
});

export const {
  useGetUsersQuery,
  useGetUserDetailsQuery,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useManagePremiumMutation,
  useAssignPremiumMutation,
  useRevokePremiumMutation,
  useGetPremiumHistoryQuery,
  useGetWishlistQuery,
  useAddToWishlistMutation,
  useRemoveFromWishlistMutation,
  useSubscribeToPushMutation,
  useUpdateFCMTokenMutation,
  useUpdateThemeMutation,
} = userApiSlice;
