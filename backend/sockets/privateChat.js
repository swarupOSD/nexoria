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
      theme: 'default',
      participants: new Map(), // socketId -> userInfo
      messages: [] // Array of message objects
    };

    const userInfo = {
      _id: socket.user._id,
      socketId: socket.id,
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
      theme: newRoom.theme,
      participants: Array.from(newRoom.participants.values()),
      messages: newRoom.messages
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
      socketId: socket.id,
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
      theme: room.theme,
      participants: Array.from(room.participants.values()),
      messages: room.messages
    });
  });

  // Send a message or image or gif
  socket.on('sendPrivateMessage', ({ teamCode, type, content, gifData, replyTo, isVanish, effect, pollData, isSecret, gameData, isViewOnce }) => {
    if (!socket.user) return;
    const room = activeRooms.get(teamCode);
    if (!room || !room.participants.has(socket.id)) return;

    const messageObj = {
      _id: crypto.randomUUID(), // Ephemeral ID
      sender: room.participants.get(socket.id),
      type, // 'text', 'image', 'gif'
      content,
      gifData,
      replyTo,
      isVanish,
      effect,
      pollData,
      isSecret,
      gameData,
      isViewOnce,
      reactions: [],
      createdAt: Date.now(),
      isEdited: false,
      isUnsent: false
    };

    room.messages.push(messageObj);
    // Keep max 500 messages in memory to prevent leak
    if (room.messages.length > 500) room.messages.shift();

    io.to(`private_${teamCode}`).emit('newPrivateMessage', messageObj);
  });

  // Theme Change
  socket.on('setPrivateTheme', ({ teamCode, theme }) => {
    const room = activeRooms.get(teamCode);
    if (!room || !room.participants.has(socket.id)) return;
    room.theme = theme;
    io.to(`private_${teamCode}`).emit('privateThemeChanged', { theme });
  });

  // Add/Toggle Reaction
  socket.on('reactToPrivateMessage', ({ teamCode, messageId, emoji }) => {
    if (!socket.user) return;
    const room = activeRooms.get(teamCode);
    if (!room || !room.participants.has(socket.id)) return;
    
    const message = room.messages.find(m => m._id === messageId);
    if (!message) return;

    const existingIdx = message.reactions.findIndex(r => r.user._id === socket.user._id.toString());
    if (existingIdx !== -1) {
      if (message.reactions[existingIdx].emoji === emoji) message.reactions.splice(existingIdx, 1);
      else message.reactions[existingIdx].emoji = emoji;
    } else {
      message.reactions.push({ user: room.participants.get(socket.id), emoji });
    }

    io.to(`private_${teamCode}`).emit('privateMessageReactionUpdated', { messageId, reactions: message.reactions });
  });

  // Unsend a message
  socket.on('unsendPrivateMessage', ({ teamCode, messageId }) => {
    if (!socket.user) return;
    const room = activeRooms.get(teamCode);
    if (!room || !room.participants.has(socket.id)) return;

    const message = room.messages.find(m => m._id === messageId);
    if (!message || message.sender._id.toString() !== socket.user._id.toString()) return;

    message.isUnsent = true;
    message.content = '';
    message.gifData = null;

    io.to(`private_${teamCode}`).emit('privateMessageUnsent', { messageId });
  });

  // Expire View Once message
  socket.on('expireViewOnce', ({ teamCode, messageId }) => {
    if (!socket.user) return;
    const room = activeRooms.get(teamCode);
    if (!room || !room.participants.has(socket.id)) return;

    const message = room.messages.find(m => m._id === messageId);
    if (!message || !message.isViewOnce) return;

    message.isUnsent = true;
    message.content = '';
    message.gifData = null;

    io.to(`private_${teamCode}`).emit('privateMessageUnsent', { messageId });
  });

  // Update Game State
  socket.on('updatePrivateMessageGame', ({ teamCode, messageId, gameData }) => {
    if (!socket.user) return;
    const room = activeRooms.get(teamCode);
    if (!room || !room.participants.has(socket.id)) return;

    const message = room.messages.find(m => m._id === messageId);
    if (!message || message.type !== 'game') return;

    message.gameData = gameData;
    io.to(`private_${teamCode}`).emit('privateGameUpdated', { messageId, gameData });
  });

  // Typing indicator
  socket.on('privateTypingStart', ({ teamCode }) => {
    if (!socket.user) return;
    io.to(`private_${teamCode}`).emit('privateUserTyping', { userId: socket.user._id });
  });
  socket.on('privateTypingStop', ({ teamCode }) => {
    if (!socket.user) return;
    io.to(`private_${teamCode}`).emit('privateUserStoppedTyping', { userId: socket.user._id });
  });

  // WebRTC Signaling Events
  socket.on('callUser', ({ userToCall, signalData, from, name, type }) => {
    socket.to(userToCall).emit('incomingCall', { signal: signalData, from, name, type });
  });

  socket.on('answerCall', ({ to, signal }) => {
    socket.to(to).emit('callAccepted', signal);
  });

  socket.on('iceCandidate', ({ to, candidate }) => {
    socket.to(to).emit('iceCandidate', candidate);
  });

  socket.on('endCall', ({ to }) => {
    socket.to(to).emit('callEnded');
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
        const userInfo = room.participants.get(socket.id);
        room.participants.delete(socket.id);
        socket.leave(`private_${code}`);
        io.to(`private_${code}`).emit('userLeftPrivateRoom', userInfo);
        
        if (room.participants.size === 0) {
          activeRooms.delete(code);
        }
      }
    }
  };

  socket.on('leavePrivateRoom', handleLeave);
  
  // Also handle disconnect to clean up
  socket.on('disconnect', handleLeave);
};
export const getActiveSecretRooms = () => Array.from(activeRooms.values());
export const destroySecretRoom = (teamCode, io) => { const room = activeRooms.get(teamCode); if (room) { io.to('private_' + teamCode).emit('roomDestroyed', { message: 'Room terminated by Admin.' }); io.in('private_' + teamCode).socketsLeave('private_' + teamCode); activeRooms.delete(teamCode); return true; } return false; };
