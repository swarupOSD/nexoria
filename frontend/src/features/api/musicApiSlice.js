import { apiSlice } from './apiSlice';

export const musicApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getSongs: builder.query({
      query: (params) => ({
        url: '/music/songs',
        params
      }),
      providesTags: ['Music']
    }),
    getPlaylists: builder.query({
      query: (params) => ({
        url: '/music/playlists',
        params
      }),
      providesTags: ['Playlist']
    }),
    getPlaylist: builder.query({
      query: (id) => `/music/playlists/${id}`,
      providesTags: (result, error, id) => [{ type: 'Playlist', id }]
    }),
    getUserPlaylists: builder.query({
      query: () => '/music/user-playlists',
      providesTags: ['Playlist']
    }),
    createUserPlaylist: builder.mutation({
      query: (data) => ({
        url: '/music/user-playlists',
        method: 'POST',
        body: data
      }),
      invalidatesTags: ['Playlist']
    }),
    updateUserPlaylist: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/music/user-playlists/${id}`,
        method: 'PUT',
        body: data
      }),
      invalidatesTags: ['Playlist']
    }),
    deleteUserPlaylist: builder.mutation({
      query: (id) => ({
        url: `/music/user-playlists/${id}`,
        method: 'DELETE'
      }),
      invalidatesTags: ['Playlist']
    }),
    toggleSongInUserPlaylist: builder.mutation({
      query: ({ playlistId, songId, action }) => ({
        url: `/music/user-playlists/${playlistId}/songs/${songId}`,
        method: 'PUT',
        body: { action }
      }),
      invalidatesTags: ['Playlist']
    }),
    trackPlay: builder.mutation({
      query: (id) => ({
        url: `/music/songs/${id}/play`,
        method: 'POST'
      }),
      invalidatesTags: ['Music']
    }),
    toggleFavorite: builder.mutation({
      query: (id) => ({
        url: `/music/favorites/${id}`,
        method: 'POST'
      }),
      invalidatesTags: ['Music', 'MusicFavorite']
    }),
    getUserFavorites: builder.query({
      query: () => '/music/favorites',
      providesTags: ['MusicFavorite']
    }),
    getMusicAnalytics: builder.query({
      query: () => '/music/admin/analytics',
      providesTags: ['Music', 'Playlist']
    }),
    recordListenHistory: builder.mutation({
      query: ({ id, listenTime }) => ({
        url: `/music/history/${id}`,
        method: 'POST',
        body: { listenTime }
      })
    }),
    getUserMusicAnalytics: builder.query({
      query: () => '/music/analytics/user',
      providesTags: ['MusicHistory', 'MusicFavorite']
    }),
    getAllSongsAdmin: builder.query({
      query: () => '/music/admin/songs',
      providesTags: ['Music']
    }),
    createSong: builder.mutation({
      query: (data) => ({
        url: '/music/admin/songs',
        method: 'POST',
        body: data
      }),
      invalidatesTags: ['Music']
    }),
    updateSong: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/music/admin/songs/${id}`,
        method: 'PUT',
        body: data
      }),
      invalidatesTags: ['Music']
    }),
    deleteSong: builder.mutation({
      query: (id) => ({
        url: `/music/admin/songs/${id}`,
        method: 'DELETE'
      }),
      invalidatesTags: ['Music']
    }),
    getAllPlaylistsAdmin: builder.query({
      query: () => '/music/admin/playlists',
      providesTags: ['Playlist']
    }),
    createPlaylist: builder.mutation({
      query: (data) => ({
        url: '/music/admin/playlists',
        method: 'POST',
        body: data
      }),
      invalidatesTags: ['Playlist']
    }),
    updatePlaylist: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/music/admin/playlists/${id}`,
        method: 'PUT',
        body: data
      }),
      invalidatesTags: ['Playlist']
    }),
    deletePlaylist: builder.mutation({
      query: (id) => ({
        url: `/music/admin/playlists/${id}`,
        method: 'DELETE'
      }),
      invalidatesTags: ['Playlist']
    }),
    toggleSongInPlaylist: builder.mutation({
      query: ({ playlistId, songId, action }) => ({
        url: `/music/admin/playlists/${playlistId}/songs/${songId}`,
        method: 'PUT',
        body: { action }
      }),
      invalidatesTags: ['Playlist']
    }),
    scrapeMusic: builder.mutation({
      query: (data) => ({
        url: '/admin/scraper/music',
        method: 'POST',
        body: data
      })
    }),
    searchSaavnPublic: builder.query({
      query: (query) => `/music/saavn/search?query=${query}`
    }),
    getSaavnSongDetails: builder.query({
      query: (id) => `/music/saavn/song/${id}`
    })
  })
});

export const {
  useGetSongsQuery,
  useGetPlaylistsQuery,
  useGetPlaylistQuery,
  useTrackPlayMutation,
  useToggleFavoriteMutation,
  useGetUserFavoritesQuery,
  useGetMusicAnalyticsQuery,
  useGetAllSongsAdminQuery,
  useCreateSongMutation,
  useUpdateSongMutation,
  useDeleteSongMutation,
  useGetAllPlaylistsAdminQuery,
  useCreatePlaylistMutation,
  useUpdatePlaylistMutation,
  useDeletePlaylistMutation,
  useToggleSongInPlaylistMutation,
  useRecordListenHistoryMutation,
  useGetUserMusicAnalyticsQuery,
  useGetUserPlaylistsQuery,
  useCreateUserPlaylistMutation,
  useUpdateUserPlaylistMutation,
  useDeleteUserPlaylistMutation,
  useToggleSongInUserPlaylistMutation,
  useScrapeMusicMutation,
  useSearchSaavnPublicQuery,
  useLazyGetSaavnSongDetailsQuery
} = musicApiSlice;
