import express from 'express';
import * as musicController from '../controllers/musicController.js';
import * as playlistController from '../controllers/playlistController.js';
import { protect, authorize } from '../middlewares/auth.js';

const superAdmin = authorize('superadmin');

const router = express.Router();

// Public Music Routes
router.get('/songs', musicController.getSongs);
router.post('/songs/:id/play', musicController.trackPlay);

// Public Playlist Routes
router.get('/playlists', playlistController.getPlaylists);
router.get('/playlists/:id', playlistController.getPlaylist);

// User Protected Routes (Favorites & History)
router.post('/favorites/:id', protect, musicController.toggleFavorite);
router.get('/favorites', protect, musicController.getUserFavorites);
router.post('/history/:id', protect, musicController.recordListenHistory);
router.get('/analytics/user', protect, musicController.getUserMusicAnalytics);

// User Protected Routes (Playlists)
router.post('/user-playlists', protect, playlistController.createUserPlaylist);
router.get('/user-playlists', protect, playlistController.getUserPlaylists);
router.put('/user-playlists/:id', protect, playlistController.updateUserPlaylist);
router.delete('/user-playlists/:id', protect, playlistController.deleteUserPlaylist);
router.put('/user-playlists/:playlistId/songs/:songId', protect, playlistController.toggleSongInUserPlaylist);

// Admin Routes for Analytics
router.get('/admin/analytics', protect, superAdmin, musicController.getAnalytics);

// Admin Routes for Music
router.get('/admin/songs', protect, superAdmin, musicController.getAllSongsAdmin);
router.post('/admin/songs', protect, superAdmin, musicController.createSong);
router.put('/admin/songs/:id', protect, superAdmin, musicController.updateSong);
router.delete('/admin/songs/:id', protect, superAdmin, musicController.deleteSong);

// Admin Routes for Playlists
router.get('/admin/playlists', protect, superAdmin, playlistController.getAllPlaylistsAdmin);
router.post('/admin/playlists', protect, superAdmin, playlistController.createPlaylist);
router.put('/admin/playlists/:id', protect, superAdmin, playlistController.updatePlaylist);
router.delete('/admin/playlists/:id', protect, superAdmin, playlistController.deletePlaylist);
router.put('/admin/playlists/:playlistId/songs/:songId', protect, superAdmin, playlistController.toggleSongInPlaylist);

export default router;
