import crypto from 'crypto';

// In-memory store for ephemeral rooms. Key: teamCode
const activeRooms = new Map();

// Helper to generate random alphanumeric codes
const generateCode = (length) => crypto.randomBytes(Math.ceil(length / 2)).toString('hex').slice(0, length).toUpperCase();

export const registerPrivateChatHandlers = (io, socket) => {
  // Create a new private room
  socket.on('createPrivateRoom', () => {
    if (!socket.user) return socket.emit('privateChatError', { message: 'Authentication required' });

    // Check if user already owns a room, if so, destroy it first
    for (const [code, room] of activeRooms.entries()) {
      if (room.ownerId === socket.user._id.toString()) {
        io.to(`private_${code}`).emit('roomDestroyed', { message: 'Room was recreated.' });
        activeRooms.delete(code);
      }
    }

    const teamCode = generateCode(6);
    const password = generateCode(8);

    const newRoom = {
      teamCode,
      password,
      ownerId: socket.user._id.toString(),
      ownerSocketId: socket.id,
      createdAt: Date.now(),
      participants: new Map() // socketId -> userInfo
    };

    const userInfo = {
      _id: socket.user._id,
      name: socket.user.name,
      username: socket.user.username,
      profileImage: socket.user.profileImage,
      role: socket.user.role,
      isPremium: socket.user.isPremium,
      auraRank: socket.user.auraRank
    };

    newRoom.participants.set(socket.id, userInfo);
    activeRooms.set(teamCode, newRoom);

    socket.join(`private_${teamCode}`);
    
    socket.emit('privateRoomCreated', {
      teamCode,
      password,
      participants: Array.from(newRoom.participants.values())
    });
  });

  // Join an existing private room
  socket.on('joinPrivateRoom', ({ teamCode, password }) => {
    if (!socket.user) return socket.emit('privateChatError', { message: 'Authentication required' });

    const room = activeRooms.get(teamCode.toUpperCase());
    if (!room) {
      return socket.emit('privateChatError', { message: 'Invalid Team Code or Room has been destroyed.' });
    }

    if (room.password !== password) {
      return socket.emit('privateChatError', { message: 'Incorrect Password.' });
    }

    const userInfo = {
      _id: socket.user._id,
      name: socket.user.name,
      username: socket.user.username,
      profileImage: socket.user.profileImage,
      role: socket.user.role,
      isPremium: socket.user.isPremium,
      auraRank: socket.user.auraRank
    };

    room.participants.set(socket.id, userInfo);
    socket.join(`private_${teamCode}`);

    // Notify others
    io.to(`private_${teamCode}`).emit('userJoinedPrivateRoom', userInfo);

    // Send success to joiner
    socket.emit('privateRoomJoined', {
      teamCode,
      participants: Array.from(room.participants.values())
    });
  });

  // Send a message or image
  socket.on('sendPrivateMessage', ({ teamCode, type, content }) => {
    if (!socket.user) return;
    const room = activeRooms.get(teamCode);
    if (!room || !room.participants.has(socket.id)) return;

    const messageObj = {
      _id: crypto.randomUUID(), // Ephemeral ID
      sender: room.participants.get(socket.id),
      type, // 'text' or 'image'
      content,
      createdAt: Date.now(),
      isEdited: false,
    };

    io.to(`private_${teamCode}`).emit('newPrivateMessage', messageObj);
  });

  // Edit a message
  socket.on('editPrivateMessage', ({ teamCode, messageId, newContent }) => {
    if (!socket.user) return;
    const room = activeRooms.get(teamCode);
    if (!room || !room.participants.has(socket.id)) return;

    // We trust the client for ephemeral edits since we don't store messages server-side
    // The client will verify if the sender matches before rendering edit UI anyway,
    // but here we just broadcast the edit event. The ID check should be strict though.
    io.to(`private_${teamCode}`).emit('privateMessageEdited', { 
      messageId, 
      newContent, 
      senderId: socket.user._id.toString() // Include senderId so clients can verify 
    });
  });

  // Delete a message
  socket.on('deletePrivateMessage', ({ teamCode, messageId }) => {
    if (!socket.user) return;
    const room = activeRooms.get(teamCode);
    if (!room || !room.participants.has(socket.id)) return;

    io.to(`private_${teamCode}`).emit('privateMessageDeleted', { 
      messageId,
      senderId: socket.user._id.toString() 
    });
  });

  // Leave room logic
  const handleLeave = () => {
    for (const [code, room] of activeRooms.entries()) {
      if (room.participants.has(socket.id)) {
        // If the owner leaves or disconnects, destroy the room
        if (room.ownerSocketId === socket.id) {
          io.to(`private_${code}`).emit('roomDestroyed', { message: 'The Owner has left the room. Room destroyed.' });
          
          // Force all sockets to leave the room
          io.in(`private_${code}`).socketsLeave(`private_${code}`);
          activeRooms.delete(code);
        } else {
          // Normal participant leaves
          const userInfo = room.participants.get(socket.id);
          room.participants.delete(socket.id);
          socket.leave(`private_${code}`);
          io.to(`private_${code}`).emit('userLeftPrivateRoom', userInfo);
        }
      }
    }
  };

  socket.on('leavePrivateRoom', handleLeave);
  
  // Also handle disconnect to clean up
  socket.on('disconnect', handleLeave);
};
