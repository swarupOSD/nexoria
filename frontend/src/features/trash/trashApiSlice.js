import { apiSlice } from '../api/apiSlice';

export const trashApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getTrashItems: builder.query({
      query: (params) => ({
        url: '/admin/trash',
        params
      }),
      providesTags: ['Trash']
    }),
    restoreTrashItem: builder.mutation({
      query: ({ type, id }) => ({
        url: `/admin/trash/${type}/${id}/restore`,
        method: 'PUT'
      }),
      invalidatesTags: ['Trash', 'Post', 'Movie', 'User']
    }),
    deleteTrashItem: builder.mutation({
      query: ({ type, id }) => ({
        url: `/admin/trash/${type}/${id}`,
        method: 'DELETE'
      }),
      invalidatesTags: ['Trash']
    }),
    emptyTrash: builder.mutation({
      query: () => ({
        url: `/admin/trash/empty/all`,
        method: 'DELETE'
      }),
      invalidatesTags: ['Trash']
    })
  })
});

export const {
  useGetTrashItemsQuery,
  useRestoreTrashItemMutation,
  useDeleteTrashItemMutation,
  useEmptyTrashMutation
} = trashApiSlice;
