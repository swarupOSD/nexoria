import logger from '../middlewares/logger.js';

export const registerNexoriaMusicSyncHandlers = (io, socket) => {
  if (!socket.user) return; // Only authenticated users can sync

  // Listen for state update from a master device
  socket.on('nexoria_music_state_update', (statePayload) => {
    try {
      // statePayload should contain { currentTrack, isPlaying, progress, queue }
      // Broadcast this state to ALL OTHER sockets connected by this user
      // socket.user._id.toString() is the room they joined on connection
      socket.to(socket.user._id.toString()).emit('nexoria_music_remote_sync', statePayload);
    } catch (err) {
      logger.error(`Music Sync Error: ${err.message}`);
    }
  });
};
