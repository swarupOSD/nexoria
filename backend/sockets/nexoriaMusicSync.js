import logger from '../middlewares/logger.js';
import User from '../models/User.js';

// Memory cache for active listening states
const activeMusicStates = new Map();

export const registerNexoriaMusicSyncHandlers = (io, socket) => {
  if (!socket.user) return; // Only authenticated users can sync

  // Listen for state update from a master device
  socket.on('nexoria_music_state_update', async (statePayload) => {
    try {
      // Broadcast this state to ALL OTHER sockets connected by this user
      socket.to(socket.user._id.toString()).emit('nexoria_music_remote_sync', statePayload);
      
      // Update the active state in memory for friends to fetch
      if (statePayload.currentTrack) {
        const friendActivityPayload = {
          userId: socket.user._id,
          name: socket.user.name,
          avatar: socket.user.profileImage,
          currentTrack: statePayload.currentTrack.title || statePayload.currentTrack.name,
          artist: statePayload.currentTrack.artist?.name || 'Unknown Artist',
          album: statePayload.currentTrack.album?.title || 'Single',
          isListening: statePayload.isPlaying,
          updatedAt: Date.now()
        };
        activeMusicStates.set(socket.user._id.toString(), friendActivityPayload);

        // Fetch user's friends to broadcast
        const userWithFriends = await User.findById(socket.user._id).select('friends');
        if (userWithFriends && userWithFriends.friends) {
          userWithFriends.friends.forEach(friendId => {
            // Broadcast to the friend's personal room
            socket.to(friendId.toString()).emit('friend_music_update', friendActivityPayload);
          });
        }
      }
    } catch (err) {
      logger.error(`Music Sync Error: ${err.message}`);
    }
  });

  // Fetch initial friend activity on load
  socket.on('request_friend_activity', async () => {
    try {
      const user = await User.findById(socket.user._id).select('friends').populate('friends', '_id name profileImage');
      if (!user || !user.friends) {
        return socket.emit('initial_friend_activity', []);
      }
      
      const friendActivities = [];
      user.friends.forEach(friend => {
        const state = activeMusicStates.get(friend._id.toString());
        if (state) {
          friendActivities.push(state);
        } else {
          friendActivities.push({
            userId: friend._id,
            name: friend.name,
            avatar: friend.profileImage,
            currentTrack: '',
            artist: '',
            album: '',
            isListening: false,
            updatedAt: null
          });
        }
      });
      
      socket.emit('initial_friend_activity', friendActivities);
    } catch (err) {
      logger.error(`Friend Activity Fetch Error: ${err.message}`);
    }
  });
};
