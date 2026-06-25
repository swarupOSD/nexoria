import { apiSlice } from '../api/apiSlice';

export const activityApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getMyActivity: builder.query({
      query: (params) => ({
        url: '/activity/me',
        params
      }),
      providesTags: ['Activity'],
    }),
    getAllActivities: builder.query({
      query: (params) => ({
        url: '/activity',
        params
      }),
      providesTags: ['Activity'],
    }),
  }),
});

export const {
  useGetMyActivityQuery,
  useGetAllActivitiesQuery,
} = activityApiSlice;
