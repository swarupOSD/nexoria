import ChatMessage from '../models/ChatMessage.js';
import User from '../models/User.js';
import { hasBadWords, handleViolation } from '../utils/autoModerator.js';

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
      // Check if user is suspended or banned
      const currentUser = await User.findById(socket.user._id).select('status restrictions');
      if (!currentUser || currentUser.status === 'suspended' || currentUser.status === 'banned' || currentUser.restrictions?.disableCommenting) {
        return socket.emit('globalChatError', { message: 'You are suspended from the chat.' });
      }

      // AI Auto-Moderator Check
      if (hasBadWords(content)) {
        const modResult = await handleViolation(socket.user._id);
        const actionMsg = modResult.actionTaken === 'MUTED' 
          ? 'You have been muted for 24 hours.' 
          : `Strike ${modResult.strikes}/3.`;
        
        return socket.emit('globalChatError', { 
          message: `Your message was blocked for inappropriate language. ${actionMsg}` 
        });
      }

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
      const isAdmin = socket.user.role === 'admin' || socket.user.role === 'superadmin';
      
      if (!message || (message.sender.toString() !== socket.user._id.toString() && !isAdmin)) return;
      
      message.isDeleted = true;
      await message.save();
      
      io.to('globalChatRoom').emit('messageDeleted', messageId);
    } catch (err) {
      console.error('Error deleting message:', err);
    }
  });

  socket.on('suspendGlobalUser', async (userId) => {
    if (!socket.user) return;
    const isAdmin = socket.user.role === 'admin' || socket.user.role === 'superadmin';
    if (!isAdmin) return;
    
    try {
      const targetUser = await User.findById(userId);
      if (!targetUser) return;
      
      // Prevent suspending other admins/superadmins
      if (targetUser.role === 'superadmin' || (targetUser.role === 'admin' && socket.user.role !== 'superadmin')) {
        return socket.emit('globalChatError', { message: 'Cannot suspend this user.' });
      }

      targetUser.status = 'suspended';
      targetUser.suspendedReason = 'Suspended via Global Chat by ' + socket.user.username;
      targetUser.suspendedBy = socket.user._id;
      await targetUser.save();
      
      io.to('globalChatRoom').emit('userSuspended', { userId, username: targetUser.username });
    } catch (err) {
      console.error('Error suspending user:', err);
    }
  });

  socket.on('editGlobalMessage', async ({ messageId, newContent }) => {
    if (!socket.user || !newContent.trim()) return;
    try {
      const message = await ChatMessage.findById(messageId);
      if (!message || message.sender.toString() !== socket.user._id.toString()) return;
      
      // AI Auto-Moderator Check
      if (hasBadWords(newContent)) {
        const modResult = await handleViolation(socket.user._id);
        const actionMsg = modResult.actionTaken === 'MUTED' 
          ? 'You have been muted for 24 hours.' 
          : `Strike ${modResult.strikes}/3.`;
        
        return socket.emit('globalChatError', { 
          message: `Your edited message was blocked for inappropriate language. ${actionMsg}` 
        });
      }

      message.message = newContent.trim();
      message.isEdited = true;
      await message.save();
      
      io.to('globalChatRoom').emit('messageEdited', { messageId, newContent: message.message });
    } catch (err) {
      console.error('Error editing message:', err);
    }
  });
};
