import { apiSlice } from "../api/apiSlice";

export const creatorApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAuditLogs: builder.query({
      query: () => '/creator/audit',
      providesTags: ['AuditLogs'],
    }),
    updateAuraGodMode: builder.mutation({
      query: ({ userId, data }) => ({
        url: `/creator/god-mode/${userId}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['User'],
    }),
    databaseBackup: builder.query({
      query: () => '/creator/backup',
    }),
    databaseWipe: builder.mutation({
      query: (collections) => ({
        url: '/creator/wipe',
        method: 'DELETE',
        body: { collections },
      }),
    }),
    overrideBranding: builder.mutation({
      query: (data) => ({
        url: '/creator/branding',
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Settings'],
    }),
    systemBroadcast: builder.mutation({
      query: (data) => ({
        url: '/creator/broadcast',
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
