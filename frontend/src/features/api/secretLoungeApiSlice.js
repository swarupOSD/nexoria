import { apiSlice } from './apiSlice';

export const secretLoungeApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAdminSecretRooms: builder.query({
      query: () => '/secret-lounge-admin',
      providesTags: ['SecretRooms'],
    }),
    deleteAdminSecretRoom: builder.mutation({
      query: (teamCode) => ({
        url: `/secret-lounge-admin/${teamCode}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['SecretRooms'],
    }),
  }),
});

export const {
  useGetAdminSecretRoomsQuery,
  useDeleteAdminSecretRoomMutation,
} = secretLoungeApiSlice;
