export const registerVoiceRoomHandlers = (io, socket) => {
  socket.on('joinVoiceRoom', (roomId) => {
    if (!socket.user) return;
    
    // In a real app, check if user is premium
    if (roomId === 'secret-lounge' && !socket.user.isPremium && socket.user.role === 'user') {
      return socket.emit('voiceError', { message: 'Secret Lounge is for Premium users only.' });
    }

    socket.join(roomId);
    
    // Notify others in the room
    socket.to(roomId).emit('userJoinedVoice', {
      userId: socket.user._id,
      name: socket.user.name,
      username: socket.user.username,
      profileImage: socket.user.profileImage,
      role: socket.user.role,
      isPremium: socket.user.isPremium
    });
  });

  socket.on('leaveVoiceRoom', (roomId) => {
    if (!socket.user) return;
    socket.leave(roomId);
    socket.to(roomId).emit('userLeftVoice', { userId: socket.user._id });
  });

  // WebRTC Signaling
  socket.on('webrtc-offer', ({ targetUserId, sdp }) => {
    if (!socket.user) return;
    socket.to(targetUserId.toString()).emit('webrtc-offer', {
      senderId: socket.user._id,
      sdp
    });
  });

  socket.on('webrtc-answer', ({ targetUserId, sdp }) => {
    if (!socket.user) return;
    socket.to(targetUserId.toString()).emit('webrtc-answer', {
      senderId: socket.user._id,
      sdp
    });
  });

  socket.on('webrtc-ice-candidate', ({ targetUserId, candidate }) => {
    if (!socket.user) return;
    socket.to(targetUserId.toString()).emit('webrtc-ice-candidate', {
      senderId: socket.user._id,
      candidate
    });
  });

  socket.on('disconnecting', () => {
    if (socket.user) {
      socket.rooms.forEach(room => {
        if (room !== socket.id && room.startsWith('secret-lounge')) {
          socket.to(room).emit('userLeftVoice', { userId: socket.user._id });
        }
      });
    }
  });
};
