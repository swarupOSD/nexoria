import { apiSlice } from './apiSlice';

export const planApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getPlans: builder.query({
      query: () => '/plans',
      providesTags: ['Plans'],
    }),
    getAllPlans: builder.query({
      query: () => '/plans/admin',
      providesTags: ['Plans'],
    }),
    createPlan: builder.mutation({
      query: (data) => ({
        url: '/plans',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Plans'],
    }),
    updatePlan: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/plans/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Plans'],
    }),
    deletePlan: builder.mutation({
      query: (id) => ({
        url: `/plans/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Plans'],
    }),
  }),
});

export const {
  useGetPlansQuery,
  useGetAllPlansQuery,
  useCreatePlanMutation,
  useUpdatePlanMutation,
  useDeletePlanMutation
} = planApiSlice;
