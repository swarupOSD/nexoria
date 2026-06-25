import { apiSlice } from '../api/apiSlice';

// NOTE: Endpoints use /api/system-notices (safe alias for /api/announcements)
// to prevent AdBlock/uBlock from blocking these requests.
export const announcementApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getActiveAnnouncements: builder.query({
      query: () => '/system-notices',
      providesTags: ['Announcement'],
    }),
    getAllAnnouncements: builder.query({
      query: () => '/system-notices/admin',
      providesTags: ['Announcement'],
    }),
    createAnnouncement: builder.mutation({
      query: (data) => ({
        url: '/system-notices',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Announcement'],
    }),
    updateAnnouncement: builder.mutation({
      query: (data) => ({
        url: `/system-notices/${data.id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Announcement'],
    }),
    deleteAnnouncement: builder.mutation({
      query: (id) => ({
        url: `/system-notices/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Announcement'],
    }),
  }),
});

export const {
  useGetActiveAnnouncementsQuery,
  useGetAllAnnouncementsQuery,
  useCreateAnnouncementMutation,
  useUpdateAnnouncementMutation,
  useDeleteAnnouncementMutation,
} = announcementApiSlice;
