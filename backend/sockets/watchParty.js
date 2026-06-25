import logger from '../middlewares/logger.js';

// In-memory store for watch party rooms
// Format: roomId -> { hostId, videoTime, isPlaying, users: [{ socketId, userId, name, avatar }] }
const watchParties = new Map();

export const registerWatchPartyHandlers = (io, socket) => {
  
  socket.on('join-watch-party', ({ roomId, user }) => {
    socket.join(roomId);
    
    // Initialize room if it doesn't exist
    if (!watchParties.has(roomId)) {
      watchParties.set(roomId, {
        hostId: user._id, // First person to join becomes the host
        videoTime: 0,
        isPlaying: false,
        users: []
      });
    }

    const room = watchParties.get(roomId);
    
    // Add user to the room's user list if not already present by socketId
    const existingUser = room.users.find(u => u.socketId === socket.id);
    if (!existingUser) {
      room.users.push({
        socketId: socket.id,
        userId: user._id,
        name: user.name,
        avatar: user.profileImage,
        isHost: room.hostId === user._id
      });
    }

    logger.info(`User ${user.name} joined watch party ${roomId}`);

    // Broadcast updated room state to everyone in the room
    io.to(roomId).emit('watch-party-update', {
      users: room.users,
      videoTime: room.videoTime,
      isPlaying: room.isPlaying,
      hostId: room.hostId
    });

    // Send a system message to chat
    io.to(roomId).emit('chat-message', {
      id: Date.now().toString(),
      type: 'system',
      text: `${user.name} joined the watch party`,
      timestamp: new Date()
    });
  });

  socket.on('sync-video', ({ roomId, videoTime, isPlaying, userId }) => {
    const room = watchParties.get(roomId);
    if (!room) return;

    // Only host can sync video globally
    if (room.hostId === userId) {
      room.videoTime = videoTime;
      room.isPlaying = isPlaying;
      
      // Broadcast to everyone else in the room
      socket.to(roomId).emit('sync-video-client', { videoTime, isPlaying });
    }
  });

  socket.on('chat-message', ({ roomId, message, user }) => {
    // Broadcast message to everyone including sender
    io.to(roomId).emit('chat-message', {
      id: Date.now().toString() + Math.random().toString(),
      type: 'user',
      text: message,
      user: {
        _id: user._id,
        name: user.name,
        avatar: user.profileImage
      },
      timestamp: new Date()
    });
  });

  socket.on('leave-watch-party', ({ roomId }) => {
    handleLeaveRoom(io, socket, roomId);
  });

  socket.on('disconnecting', () => {
    // When a socket disconnects, remove them from all watch party rooms they are in
    for (const room of socket.rooms) {
      if (room.startsWith('party-')) {
        handleLeaveRoom(io, socket, room);
      }
    }
  });
};

function handleLeaveRoom(io, socket, roomId) {
  const room = watchParties.get(roomId);
  if (!room) return;

  const userIndex = room.users.findIndex(u => u.socketId === socket.id);
  if (userIndex !== -1) {
    const user = room.users[userIndex];
    room.users.splice(userIndex, 1);

    socket.leave(roomId);
    logger.info(`User ${user.name} left watch party ${roomId}`);

    io.to(roomId).emit('chat-message', {
      id: Date.now().toString(),
      type: 'system',
      text: `${user.name} left the watch party`,
      timestamp: new Date()
    });

    // If room is empty, delete it
    if (room.users.length === 0) {
      watchParties.delete(roomId);
    } else {
      // If host left, assign new host to the first available user
      if (room.hostId === user.userId) {
        room.hostId = room.users[0].userId;
        room.users[0].isHost = true;
        
        io.to(roomId).emit('chat-message', {
          id: Date.now().toString(),
          type: 'system',
          text: `${room.users[0].name} is now the host`,
          timestamp: new Date()
        });
      }
      
      // Broadcast updated room state
      io.to(roomId).emit('watch-party-update', {
        users: room.users,
        videoTime: room.videoTime,
        isPlaying: room.isPlaying,
        hostId: room.hostId
      });
    }
  }
}
