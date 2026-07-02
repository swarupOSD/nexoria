import { apiSlice } from '../api/apiSlice';

export const campaignApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    launchCampaign: builder.mutation({
      query: (data) => ({
        url: '/campaigns/send',
        method: 'POST',
        body: data,
      }),
    }),
  }),
});

export const { useLaunchCampaignMutation } = campaignApiSlice;
