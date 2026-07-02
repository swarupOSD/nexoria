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
        .populate('sender', 'name username profileImage auraRank badges role isPremium')
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
        .populate('sender', 'name username profileImage auraRank badges role isPremium')
        .lean();

      // Broadcast to everyone in the room
      io.to('globalChatRoom').emit('newGlobalMessage', populatedMessage);
    } catch (err) {
      console.error('Error sending global message:', err);
      socket.emit('globalChatError', { message: 'Failed to send message.' });
    }
  });

  socket.on('deleteGlobalMessage', async (messageId) => {
    if (!socket.user) return;
    try {
      const message = await ChatMessage.findById(messageId);
      if (!message || message.sender.toString() !== socket.user._id.toString()) return;
      
      message.isDeleted = true;
      await message.save();
      
      io.to('globalChatRoom').emit('messageDeleted', messageId);
    } catch (err) {
      console.error('Error deleting message:', err);
    }
  });

  socket.on('editGlobalMessage', async ({ messageId, newContent }) => {
    if (!socket.user || !newContent.trim()) return;
    try {
      const message = await ChatMessage.findById(messageId);
      if (!message || message.sender.toString() !== socket.user._id.toString()) return;
      
      message.message = newContent.trim();
      message.isEdited = true;
      await message.save();
      
      io.to('globalChatRoom').emit('messageEdited', { messageId, newContent: message.message });
    } catch (err) {
      console.error('Error editing message:', err);
    }
  });
};
