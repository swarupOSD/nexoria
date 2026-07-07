import { apiSlice } from './apiSlice';

export const userModerationApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    banUser: builder.mutation({
      query: ({ id, reason, days }) => ({
        url: `/users/${id}/ban`,
        method: 'PUT',
        body: { reason, days },
      }),
      invalidatesTags: ['User', 'Users', 'Analytics'],
    }),
    unbanUser: builder.mutation({
      query: (id) => ({
        url: `/users/${id}/unban`,
        method: 'PUT',
      }),
      invalidatesTags: ['User', 'Users', 'Analytics'],
    }),
    suspendUser: builder.mutation({
      query: ({ id, reason, days }) => ({
        url: `/users/${id}/suspend`,
        method: 'PUT',
        body: { reason, days },
      }),
      invalidatesTags: ['User', 'Users', 'Analytics'],
    }),
    restoreUser: builder.mutation({
      query: (id) => ({
        url: `/users/${id}/restore`,
        method: 'PUT',
      }),
      invalidatesTags: ['User', 'Users', 'Analytics'],
    }),
    warnUser: builder.mutation({
      query: ({ id, reason }) => ({
        url: `/users/${id}/warn`,
        method: 'PUT',
        body: { reason },
      }),
      invalidatesTags: ['User', 'Users', 'Analytics'],
    }),
    addAdminNote: builder.mutation({
      query: ({ id, note }) => ({
        url: `/users/${id}/note`,
        method: 'POST',
        body: { note },
      }),
      invalidatesTags: ['UserNotes'],
    }),
    getAdminNotes: builder.query({
      query: (id) => ({
        url: `/users/${id}/notes`,
        method: 'GET',
      }),
      providesTags: ['UserNotes'],
    }),
    updateRestrictions: builder.mutation({
      query: ({ id, restrictions }) => ({
        url: `/users/${id}/restrictions`,
        method: 'PUT',
        body: { restrictions },
      }),
      invalidatesTags: ['User', 'Users'],
    }),
    sendDirectMessage: builder.mutation({
      query: (data) => ({
        url: `/notifications/send`,
        method: 'POST',
        body: data,
      }),
    }),
  }),
});

export const {
  useBanUserMutation,
  useUnbanUserMutation,
  useSuspendUserMutation,
  useRestoreUserMutation,
  useWarnUserMutation,
  useAddAdminNoteMutation,
  useGetAdminNotesQuery,
  useUpdateRestrictionsMutation,
  useSendDirectMessageMutation
} = userModerationApiSlice;
