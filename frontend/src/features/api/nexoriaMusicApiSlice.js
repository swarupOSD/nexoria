import { apiSlice } from './apiSlice';

export const nexoriaMusicApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // ARTISTS
    getNexoriaArtists: builder.query({
      query: () => '/api/nexoria-music/admin/artists',
      providesTags: ['NexoriaArtist'],
    }),
    createNexoriaArtist: builder.mutation({
      query: (data) => ({
        url: '/api/nexoria-music/admin/artists',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['NexoriaArtist'],
    }),
    updateNexoriaArtist: builder.mutation({
      query: ({ id, data }) => ({
        url: `/api/nexoria-music/admin/artists/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['NexoriaArtist'],
    }),
    deleteNexoriaArtist: builder.mutation({
      query: (id) => ({
        url: `/api/nexoria-music/admin/artists/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['NexoriaArtist'],
    }),

    // GENRES
    getNexoriaGenres: builder.query({
      query: () => '/api/nexoria-music/admin/genres',
      providesTags: ['NexoriaGenre'],
    }),
    createNexoriaGenre: builder.mutation({
      query: (data) => ({
        url: '/api/nexoria-music/admin/genres',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['NexoriaGenre'],
    }),
    updateNexoriaGenre: builder.mutation({
      query: ({ id, data }) => ({
        url: `/api/nexoria-music/admin/genres/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['NexoriaGenre'],
    }),
    deleteNexoriaGenre: builder.mutation({
      query: (id) => ({
        url: `/api/nexoria-music/admin/genres/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['NexoriaGenre'],
    }),

    // ALBUMS
    getNexoriaAlbums: builder.query({
      query: () => '/api/nexoria-music/admin/albums',
      providesTags: ['NexoriaAlbum'],
    }),
    createNexoriaAlbum: builder.mutation({
      query: (data) => ({
        url: '/api/nexoria-music/admin/albums',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['NexoriaAlbum'],
    }),
    updateNexoriaAlbum: builder.mutation({
      query: ({ id, data }) => ({
        url: `/api/nexoria-music/admin/albums/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['NexoriaAlbum'],
    }),
    deleteNexoriaAlbum: builder.mutation({
      query: (id) => ({
        url: `/api/nexoria-music/admin/albums/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['NexoriaAlbum'],
    }),

    // TRACKS
    getNexoriaTracks: builder.query({
      query: () => '/api/nexoria-music/admin/tracks',
      providesTags: ['NexoriaTrack'],
    }),
    createNexoriaTrack: builder.mutation({
      query: (data) => ({
        url: '/api/nexoria-music/admin/tracks',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['NexoriaTrack'],
    }),
    updateNexoriaTrack: builder.mutation({
      query: ({ id, data }) => ({
        url: `/api/nexoria-music/admin/tracks/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['NexoriaTrack'],
    }),
    deleteNexoriaTrack: builder.mutation({
      query: (id) => ({
        url: `/api/nexoria-music/admin/tracks/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['NexoriaTrack'],
    }),

    // CONSUMER: SEARCH
    searchNexoriaMusic: builder.query({
      query: (searchTerm) => `/api/nexoria-music/search?q=${encodeURIComponent(searchTerm)}`,
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
  useGetNexoriaTracksQuery,
  useCreateNexoriaTrackMutation,
  useUpdateNexoriaTrackMutation,
  useDeleteNexoriaTrackMutation,
  useSearchNexoriaMusicQuery,
} = nexoriaMusicApiSlice;
