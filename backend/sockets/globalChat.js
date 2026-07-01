import ChatMessage from '../models/ChatMessage.js';
import User from '../models/User.js';

export const registerGlobalChatHandlers = (io, socket) => {
  socket.on('joinGlobalChat', async () => {
    socket.join('globalChatRoom');
    try {
      // Send last 50 messages
      const history = await ChatMessage.find({ isDeleted: false })
        .sort({ createdAt: -1 })
        .limit(50)
        .populate('sender', 'name username profileImage auraRank badges')
        .lean();
      
      socket.emit('globalChatHistory', history.reverse());
    } catch (err) {
      console.error('Error fetching global chat history:', err);
    }
  });

  socket.on('leaveGlobalChat', () => {
    socket.leave('globalChatRoom');
  });

  socket.on('sendGlobalMessage', async (content) => {
    if (!socket.user) return; // Must be authenticated

    try {
      // Save message to DB
      const newMessage = await ChatMessage.create({
        sender: socket.user._id,
        message: content,
      });

      // Populate sender info before broadcasting
      const populatedMessage = await ChatMessage.findById(newMessage._id)
        .populate('sender', 'name username profileImage auraRank badges')
        .lean();

      // Broadcast to everyone in the room
      io.to('globalChatRoom').emit('newGlobalMessage', populatedMessage);
    } catch (err) {
      console.error('Error sending global message:', err);
      socket.emit('globalChatError', { message: 'Failed to send message.' });
    }
  });
};
