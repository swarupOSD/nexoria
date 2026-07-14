import { Conversation, PrivateMessage } from '../models/PrivateChat.js';
import User from '../models/User.js';

export const registerDirectMessageHandlers = (io, socket) => {
  // Join a personal room to receive DMs
  socket.on('joinDMRoom', () => {
    if (socket.user) {
      socket.join(`dm_${socket.user._id.toString()}`);
    }
  });

  socket.on('sendDirectMessage', async ({ receiverId, text }) => {
    if (!socket.user || !receiverId || !text.trim()) return;

    try {
      // Find or create conversation
      let conversation = await Conversation.findOne({
        participants: { $all: [socket.user._id, receiverId] }
      });

      if (!conversation) {
        conversation = await Conversation.create({
          participants: [socket.user._id, receiverId]
        });
      }

      // Create message
      const message = await PrivateMessage.create({
        conversationId: conversation._id,
        sender: socket.user._id,
        text
      });

      // Update conversation last message
      conversation.lastMessage = message._id;
      await conversation.save();

      // Populate sender info
      const populatedMessage = await PrivateMessage.findById(message._id).populate('sender', 'name username profileImage role isPremium').lean();

      // Emit to receiver's personal room
      io.to(`dm_${receiverId}`).emit('newDirectMessage', populatedMessage);
      
      // Emit to sender's own room (for sync across multiple tabs/devices)
      io.to(`dm_${socket.user._id.toString()}`).emit('newDirectMessage', populatedMessage);
      
    } catch (err) {
      console.error('Error sending DM:', err);
      socket.emit('dmError', { message: 'Failed to send message.' });
    }
  });

  // Get conversations list
  socket.on('getConversations', async () => {
    if (!socket.user) return;
    try {
      const conversations = await Conversation.find({ participants: socket.user._id })
        .populate('participants', 'name username profileImage isPremium auraRank role')
        .populate('lastMessage')
        .sort({ updatedAt: -1 })
        .lean();
        
      socket.emit('conversationsList', conversations);
    } catch (err) {
      console.error('Error fetching conversations:', err);
    }
  });

  // Get messages for a conversation
  socket.on('getConversationMessages', async (receiverId) => {
    if (!socket.user || !receiverId) return;
    try {
      const conversation = await Conversation.findOne({
        participants: { $all: [socket.user._id, receiverId] }
      });

      if (!conversation) {
        return socket.emit('conversationMessages', { receiverId, messages: [] });
      }

      const messages = await PrivateMessage.find({ conversationId: conversation._id })
        .sort({ createdAt: 1 })
        .populate('sender', 'name username profileImage role')
        .lean();

      socket.emit('conversationMessages', { receiverId, messages });
    } catch (err) {
      console.error('Error fetching DM messages:', err);
    }
  });
};
