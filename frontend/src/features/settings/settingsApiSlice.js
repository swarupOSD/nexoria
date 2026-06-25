import { apiSlice } from '../api/apiSlice';

export const settingsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getSettings: builder.query({
      query: () => '/settings',
      providesTags: ['Settings'],
    }),
    updateSettings: builder.mutation({
      query: (data) => ({
        url: '/settings',
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Settings'],
    }),
  }),
});

export const {
  useGetSettingsQuery,
  useUpdateSettingsMutation,
} = settingsApiSlice;
