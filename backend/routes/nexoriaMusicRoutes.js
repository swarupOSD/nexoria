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
  streamTrack
} from '../controllers/nexoriaMusicController.js';
import { protect, authorize } from '../middlewares/auth.js';

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 22 * 1024 * 1024 } // 22MB limit to leave room for headers, Telegram allows 20MB for download
});

// All routes here are currently scoped for admin management.
// Public consumer routes will be added later when building the frontend discovery engine.
// Prefix: /api/nexoria-music

// CONSUMER ROUTES
router.route('/search').get(searchMusic);
router.route('/stream/:fileId').get(streamTrack);

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
