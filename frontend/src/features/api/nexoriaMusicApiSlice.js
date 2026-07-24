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
      query: () => '/nexoria-music/all-tracks',
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
    updateNexoriaTrackLyrics: builder.mutation({
      query: ({ trackId, data }) => ({
        url: `/nexoria-music/admin/tracks/${trackId}/lyrics`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['NexoriaTrack'],
    }),

    // CONSUMER: SEARCH & ALL TRACKS
    searchNexoriaMusic: builder.query({
      query: (searchTerm) => `/nexoria-music/search?q=${encodeURIComponent(searchTerm)}`,
    }),
    getAllTracksConsumer: builder.query({
      query: () => '/nexoria-music/all-tracks',
      providesTags: ['NexoriaMusicTracks'],
    }),
    getArtistDetails: builder.query({
      query: (id) => `/nexoria-music/artists/${id}`,
      providesTags: (result, error, id) => [{ type: 'NexoriaMusicArtists', id }],
    }),
    getAlbumDetails: builder.query({
      query: (id) => `/nexoria-music/albums/${id}`,
      providesTags: ['NexoriaAlbums', 'NexoriaTracks']
    }),
    getTrackLyrics: builder.query({
      query: (trackId) => `/nexoria-music/tracks/${trackId}/lyrics`,
      providesTags: ['NexoriaTracks']
    }),

    // PLAYLISTS
    getPlaylists: builder.query({
      query: () => '/nexoria-music/playlists',
      providesTags: ['NexoriaPlaylist'],
    }),
    getPlaylistDetails: builder.query({
      query: (id) => `/nexoria-music/playlists/${id}`,
      providesTags: (result, error, id) => [{ type: 'NexoriaPlaylist', id }],
    }),
    createPlaylist: builder.mutation({
      query: (data) => ({
        url: '/nexoria-music/playlists',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['NexoriaPlaylist'],
    }),
    addTrackToPlaylist: builder.mutation({
      query: ({ playlistId, trackId }) => ({
        url: `/nexoria-music/playlists/${playlistId}/tracks`,
        method: 'POST',
        body: { trackId },
      }),
      invalidatesTags: (result, error, { playlistId }) => [{ type: 'NexoriaPlaylist', id: playlistId }],
    }),
    removeTrackFromPlaylist: builder.mutation({
      query: ({ playlistId, trackId }) => ({
        url: `/nexoria-music/playlists/${playlistId}/tracks/${trackId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, { playlistId }) => [{ type: 'NexoriaPlaylist', id: playlistId }],
    }),
    deletePlaylist: builder.mutation({
      query: (id) => ({
        url: `/nexoria-music/playlists/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['NexoriaPlaylist'],
    }),

    // ALGORITHM & HISTORY
    logPlay: builder.mutation({
      query: (data) => ({
        url: '/nexoria-music/log-play',
        method: 'POST',
        body: data,
      }),
    }),
    getMusicRecentlyPlayed: builder.query({
      query: () => '/nexoria-music/recently-played',
    }),
    getMusicRecommendations: builder.query({
      query: () => '/nexoria-music/recommendations',
    }),
    getNexoriaMusicAnalytics: builder.query({
      query: () => '/nexoria-music/analytics',
      providesTags: ['NexoriaMusicAnalytics']
    }),
    getDeepAnalytics: builder.query({
      query: () => '/nexoria-music/deep-analytics',
      providesTags: ['NexoriaMusicAnalytics']
    }),
    getFavorites: builder.query({
      query: (type) => `/nexoria-music/favorites${type ? `?type=${type}` : ''}`,
      providesTags: ['NexoriaFavorite'],
    }),
    toggleFavorite: builder.mutation({
      query: (data) => ({
        url: '/nexoria-music/favorites/toggle',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['NexoriaFavorite'],
    }),
    getDiscoverWeekly: builder.query({
      query: () => '/nexoria-music/discover-weekly',
    }),
    getReleaseRadar: builder.query({
      query: () => '/nexoria-music/release-radar',
    }),
    getDailyMix: builder.query({
      query: () => '/nexoria-music/daily-mix',
    }),
    togglePlaylistCollaborative: builder.mutation({
      query: (playlistId) => ({
        url: `/nexoria-music/playlists/${playlistId}/collaborative`,
        method: 'POST',
      }),
      invalidatesTags: ['NexoriaPlaylist'],
    }),
    getUserProfile: builder.query({
      query: (id) => `/nexoria-music/users/${id}`,
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
  useUpdateNexoriaTrackLyricsMutation,
  useSearchNexoriaMusicQuery,
  useLogPlayMutation,
  useGetMusicRecentlyPlayedQuery,
  useGetMusicRecommendationsQuery,
  useLazyGetMusicRecommendationsQuery,
  useGetNexoriaMusicAnalyticsQuery,
  useGetDeepAnalyticsQuery,
  useGetFavoritesQuery,
  useToggleFavoriteMutation,
  useGetDiscoverWeeklyQuery,
  useGetReleaseRadarQuery,
  useGetDailyMixQuery,
  useGetAllTracksConsumerQuery,
  useGetPlaylistsQuery,
  useGetPlaylistDetailsQuery,
  useCreatePlaylistMutation,
  useAddTrackToPlaylistMutation,
  useRemoveTrackFromPlaylistMutation,
  useDeletePlaylistMutation,
  useTogglePlaylistCollaborativeMutation,
  useGetArtistDetailsQuery,
  useGetAlbumDetailsQuery,
  useGetTrackLyricsQuery,
  useGetUserProfileQuery
} = nexoriaMusicApiSlice;
