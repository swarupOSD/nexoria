import { apiSlice } from './apiSlice';

export const nexoriaMusicApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // ARTISTS
    getNexoriaArtists: builder.query({
      query: () => '/nexoria-music/artists',
      providesTags: ['NexoriaArtist'],
    }),
    createNexoriaArtist: builder.mutation({
      query: (data) => ({
        url: '/nexoria-music/admin/artists',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['NexoriaArtist'],
    }),
    updateNexoriaArtist: builder.mutation({
      query: ({ id, data }) => ({
        url: `/nexoria-music/admin/artists/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['NexoriaArtist'],
    }),
    deleteNexoriaArtist: builder.mutation({
      query: (id) => ({
        url: `/nexoria-music/admin/artists/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['NexoriaArtist'],
    }),

    // GENRES
    getNexoriaGenres: builder.query({
      query: () => '/nexoria-music/genres',
      providesTags: ['NexoriaGenre'],
    }),
    createNexoriaGenre: builder.mutation({
      query: (data) => ({
        url: '/nexoria-music/admin/genres',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['NexoriaGenre'],
    }),
    updateNexoriaGenre: builder.mutation({
      query: ({ id, data }) => ({
        url: `/nexoria-music/admin/genres/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['NexoriaGenre'],
    }),
    deleteNexoriaGenre: builder.mutation({
      query: (id) => ({
        url: `/nexoria-music/admin/genres/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['NexoriaGenre'],
    }),

    // ALBUMS
    getNexoriaAlbums: builder.query({
      query: () => '/nexoria-music/albums',
      providesTags: ['NexoriaAlbum'],
    }),
    createNexoriaAlbum: builder.mutation({
      query: (data) => ({
        url: '/nexoria-music/admin/albums',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['NexoriaAlbum'],
    }),
    updateNexoriaAlbum: builder.mutation({
      query: ({ id, data }) => ({
        url: `/nexoria-music/admin/albums/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['NexoriaAlbum'],
    }),
    deleteNexoriaAlbum: builder.mutation({
      query: (id) => ({
        url: `/nexoria-music/admin/albums/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['NexoriaAlbum'],
    }),

    // TRACKS
    uploadNexoriaTrackAudio: builder.mutation({
      query: (formData) => ({
        url: '/nexoria-music/admin/tracks/upload',
        method: 'POST',
        body: formData,
      }),
    }),
    getNexoriaTracks: builder.query({
      query: () => '/nexoria-music/tracks',
      providesTags: ['NexoriaTrack'],
    }),
    createNexoriaTrack: builder.mutation({
      query: (data) => ({
        url: '/nexoria-music/admin/tracks',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['NexoriaTrack'],
    }),
    updateNexoriaTrack: builder.mutation({
      query: ({ id, data }) => ({
        url: `/nexoria-music/admin/tracks/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['NexoriaTrack'],
    }),
    deleteNexoriaTrack: builder.mutation({
      query: (id) => ({
        url: `/nexoria-music/admin/tracks/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['NexoriaTrack'],
    }),

    // CONSUMER: SEARCH
    searchNexoriaMusic: builder.query({
      query: (searchTerm) => `/nexoria-music/search?q=${encodeURIComponent(searchTerm)}`,
    }),
  }),
});

export const {
  useGetNexoriaArtistsQuery,
  useCreateNexoriaArtistMutation,
  useUpdateNexoriaArtistMutation,
  useDeleteNexoriaArtistMutation,
  useGetNexoriaGenresQuery,
  useCreateNexoriaGenreMutation,
  useUpdateNexoriaGenreMutation,
  useDeleteNexoriaGenreMutation,
  useGetNexoriaAlbumsQuery,
  useCreateNexoriaAlbumMutation,
  useUpdateNexoriaAlbumMutation,
  useDeleteNexoriaAlbumMutation,
  useUploadNexoriaTrackAudioMutation,
  useGetNexoriaTracksQuery,
  useCreateNexoriaTrackMutation,
  useUpdateNexoriaTrackMutation,
  useDeleteNexoriaTrackMutation,
  useSearchNexoriaMusicQuery,
} = nexoriaMusicApiSlice;
