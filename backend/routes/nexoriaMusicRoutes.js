import express from 'express';
import multer from 'multer';
import {
  createArtist,
  getArtistsAdmin,
  updateArtist,
  deleteArtist,
  createGenre,
  getGenresAdmin,
  updateGenre,
  deleteGenre,
  createAlbum,
  getAlbumsAdmin,
  updateAlbum,
  deleteAlbum,
  createTrack,
  getTracksAdmin,
  updateTrack,
  deleteTrack,
  searchMusic,
  uploadTrackAudio,
  streamTrack,
  logPlay,
  getRecentlyPlayed,
  getRecommendations,
  getAnalytics,
  getDeepAnalytics,
  toggleFavorite,
  getFavorites,
  getDiscoverWeekly,
  getReleaseRadar,
  getDailyMix,
  createPlaylist,
  getUserPlaylists,
  getPlaylistDetails,
  addTrackToPlaylist,
  removeTrackFromPlaylist,
  deletePlaylist,
  getAllTracksConsumer,
  getArtistDetailsConsumer,
  getAlbumDetailsConsumer
} from '../controllers/nexoriaMusicController.js';
import { protect, authorize } from '../middlewares/auth.js';

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 52 * 1024 * 1024 } // 52MB limit (Telegram allows 50MB for upload via bot API)
});

// All routes here are currently scoped for admin management.
// Public consumer routes will be added later when building the frontend discovery engine.
// Prefix: /api/nexoria-music

// CONSUMER ROUTES
router.route('/search').get(searchMusic);
router.route('/stream/:fileId').get(streamTrack);
router.route('/all-tracks').get(getAllTracksConsumer);
router.route('/artists/:id').get(getArtistDetailsConsumer);
router.route('/albums/:id').get(getAlbumDetailsConsumer);

// PLAYLISTS
router.route('/playlists')
  .post(protect, createPlaylist)
  .get(protect, getUserPlaylists);
router.route('/playlists/:id')
  .get(protect, getPlaylistDetails)
  .delete(protect, deletePlaylist);
router.route('/playlists/:id/tracks')
  .post(protect, addTrackToPlaylist);
router.route('/playlists/:id/tracks/:trackId')
  .delete(protect, removeTrackFromPlaylist);

// Algorithm & History Routes (Protected/Optional)
router.route('/log-play').post(protect, logPlay);
router.route('/recently-played').get(protect, getRecentlyPlayed);
router.route('/recommendations').get(protect, getRecommendations);
router.route('/analytics').get(protect, authorize('admin', 'superadmin'), getAnalytics);
router.route('/deep-analytics').get(protect, authorize('admin', 'superadmin'), getDeepAnalytics);

router.route('/favorites').get(protect, getFavorites);
router.route('/favorites/toggle').post(protect, toggleFavorite);
router.route('/discover-weekly').get(protect, getDiscoverWeekly);
router.route('/release-radar').get(protect, getReleaseRadar);
router.route('/daily-mix').get(protect, getDailyMix);

router.route('/artists').get(getArtistsAdmin);
router.route('/genres').get(getGenresAdmin);
router.route('/albums').get(getAlbumsAdmin);
router.route('/tracks').get(getTracksAdmin);

// ADMIN ROUTES
router.route('/admin/artists')
  .post(protect, authorize('admin', 'superadmin'), createArtist)
  .get(protect, authorize('admin', 'superadmin'), getArtistsAdmin);

router.route('/admin/artists/:id')
  .put(protect, authorize('admin', 'superadmin'), updateArtist)
  .delete(protect, authorize('admin', 'superadmin'), deleteArtist);

// GENRES
router.route('/admin/genres')
  .post(protect, authorize('admin', 'superadmin'), createGenre)
  .get(protect, authorize('admin', 'superadmin'), getGenresAdmin);

router.route('/admin/genres/:id')
  .put(protect, authorize('admin', 'superadmin'), updateGenre)
  .delete(protect, authorize('admin', 'superadmin'), deleteGenre);

// ALBUMS
router.route('/admin/albums')
  .post(protect, authorize('admin', 'superadmin'), createAlbum)
  .get(protect, authorize('admin', 'superadmin'), getAlbumsAdmin);

router.route('/admin/albums/:id')
  .put(protect, authorize('admin', 'superadmin'), updateAlbum)
  .delete(protect, authorize('admin', 'superadmin'), deleteAlbum);

// TRACKS
router.route('/admin/tracks/upload')
  .post(protect, authorize('admin', 'superadmin'), upload.single('audio'), uploadTrackAudio);

router.route('/admin/tracks')
  .post(protect, authorize('admin', 'superadmin'), createTrack)
  .get(protect, authorize('admin', 'superadmin'), getTracksAdmin);

router.route('/admin/tracks/:id')
  .put(protect, authorize('admin', 'superadmin'), updateTrack)
  .delete(protect, authorize('admin', 'superadmin'), deleteTrack);

export default router;
