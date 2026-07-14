import { apiSlice } from '../../app/api/apiSlice';

export const creatorApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAuditLogs: builder.query({
      query: () => '/api/creator/audit',
      providesTags: ['AuditLogs'],
    }),
    updateAuraGodMode: builder.mutation({
      query: ({ userId, data }) => ({
        url: `/api/creator/god-mode/${userId}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['User'],
    }),
    databaseBackup: builder.query({
      query: () => '/api/creator/backup',
    }),
    databaseWipe: builder.mutation({
      query: (collections) => ({
        url: '/api/creator/wipe',
        method: 'DELETE',
        body: { collections },
      }),
    }),
    overrideBranding: builder.mutation({
      query: (data) => ({
        url: '/api/creator/branding',
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Settings'],
    }),
    systemBroadcast: builder.mutation({
      query: (data) => ({
        url: '/api/creator/broadcast',
        method: 'POST',
        body: data,
      }),
    }),
  }),
});

export const {
  useGetAuditLogsQuery,
  useUpdateAuraGodModeMutation,
  useLazyDatabaseBackupQuery,
  useDatabaseWipeMutation,
  useOverrideBrandingMutation,
  useSystemBroadcastMutation
} = creatorApiSlice;
