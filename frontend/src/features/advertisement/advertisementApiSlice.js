import { apiSlice } from '../api/apiSlice';

// NOTE: Endpoints use /api/sponsored-content (safe alias for /api/advertisements)
// to prevent AdBlock/uBlock from blocking these requests.
export const advertisementApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAdvertisements: builder.query({
      query: () => '/sponsored-content',
      providesTags: ['Advertisement'],
    }),
    createAdvertisement: builder.mutation({
      query: (data) => ({
        url: '/sponsored-content',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Advertisement'],
    }),
    updateAdvertisement: builder.mutation({
      query: ({ id, data }) => ({
        url: `/sponsored-content/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Advertisement'],
    }),
    deleteAdvertisement: builder.mutation({
      query: (id) => ({
        url: `/sponsored-content/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Advertisement'],
    }),
    toggleAdvertisement: builder.mutation({
      query: (id) => ({
        url: `/sponsored-content/${id}/toggle`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Advertisement'],
    }),
  }),
});

export const {
  useGetAdvertisementsQuery,
  useCreateAdvertisementMutation,
  useUpdateAdvertisementMutation,
  useDeleteAdvertisementMutation,
  useToggleAdvertisementMutation,
} = advertisementApiSlice;
