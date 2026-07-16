import ChatMessage from '../models/ChatMessage.js';
import User from '../models/User.js';
import { hasBadWords, handleViolation } from '../utils/autoModerator.js';
import { getBotUser, generateBotResponse } from '../utils/aiBot.js';
import fs from 'fs';
import path from 'path';

export const registerGlobalChatHandlers = (io, socket) => {
  socket.on('joinGlobalChat', async () => {
    socket.join('globalChatRoom');
    try {
      // Send last 50 messages (including soft deleted for tombstones)
      const history = await ChatMessage.find({})
        .sort({ createdAt: -1 })
        .limit(50)
        .populate('sender', 'name username profileImage auraRank badges role isPremium chatNameColor profileBorder')
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
        .populate('sender', 'name username profileImage auraRank badges role isPremium chatNameColor profileBorder')
        .lean();

      // Broadcast to everyone in the room
      io.to('globalChatRoom').emit('newGlobalMessage', populatedMessage);

      // --- AI Bot Integration ---
      const lowerContent = content.toLowerCase();
      if (lowerContent.includes('@bot') || lowerContent.includes('@nexoria')) {
        // Trigger AI Bot in background
        setTimeout(async () => {
          try {
            const botUser = await getBotUser();
            
            // Show typing indicator? (Optional, but let's just send message directly for now)
            const botResponse = await generateBotResponse(content);
            
            const botMessage = await ChatMessage.create({
              sender: botUser._id,
              message: botResponse,
            });

            const populatedBotMsg = await ChatMessage.findById(botMessage._id)
              .populate('sender', 'name username profileImage auraRank badges role isPremium chatNameColor profileBorder')
              .lean();

            io.to('globalChatRoom').emit('newGlobalMessage', populatedBotMsg);
          } catch (err) {
            console.error('AI Bot Error in chat:', err);
          }
        }, 1500); // Slight delay to seem human
      }
    } catch (err) {
      console.error('Error sending global message:', err);
      socket.emit('globalChatError', { message: 'Failed to send message.' });
    }
  });

  socket.on('sendGlobalVoiceMessage', async (audioBase64) => {
    if (!socket.user) return;
    
    try {
      const currentUser = await User.findById(socket.user._id).select('status restrictions role isPremium');
      if (!currentUser || currentUser.status === 'suspended' || currentUser.status === 'banned' || currentUser.restrictions?.disableCommenting) {
        return socket.emit('globalChatError', { message: 'You are suspended from the chat.' });
      }

      // Role check: Only Premium, Admin, Superadmin, Owner can send voice
      if (currentUser.role === 'user' && !currentUser.isPremium) {
        return socket.emit('globalChatError', { message: 'Voice messaging is restricted to Premium users.' });
      }

      // Convert base64 to file and save
      const base64Data = audioBase64.replace(/^data:audio\/\w+;base64,/, "");
      const buffer = Buffer.from(base64Data, 'base64');
      const filename = `voice_${Date.now()}_${socket.user._id}.webm`;
      const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'voice');
      
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      
      const filePath = path.join(uploadDir, filename);
      fs.writeFileSync(filePath, buffer);
      
      const audioUrl = `/uploads/voice/${filename}`;

      // Save to DB
      const newMessage = await ChatMessage.create({
        sender: socket.user._id,
        type: 'voice',
        audioUrl: audioUrl,
        message: '' // optional
      });

      const populatedMessage = await ChatMessage.findById(newMessage._id)
        .populate('sender', 'name username profileImage auraRank badges role isPremium chatNameColor profileBorder')
        .lean();

      io.to('globalChatRoom').emit('newGlobalMessage', populatedMessage);
    } catch (err) {
      console.error('Error sending global voice message:', err);
      socket.emit('globalChatError', { message: 'Failed to send voice message.' });
    }
  });

  socket.on('deleteGlobalMessage', async (messageId) => {
    if (!socket.user) return;
    try {
      const message = await ChatMessage.findById(messageId).populate('sender');
      const isOwner = socket.user.role === 'owner';
      const isAdmin = socket.user.role === 'admin' || socket.user.role === 'superadmin' || isOwner;
      
      if (!message || (message.sender._id.toString() !== socket.user._id.toString() && !isAdmin)) {
        return socket.emit('globalChatError', { message: 'Not authorized to delete this message' });
      }
      if (!isOwner && isAdmin && message.sender.role === 'owner') return; // Protect owner messages

      // Soft delete: clear content, set isDeleted and deletedByRole
      message.isDeleted = true;
      message.deletedByRole = socket.user.role;
      message.message = '';
      if (message.audioUrl) {
        message.audioUrl = ''; // Optionally delete the file from disk here too
      }
      await message.save();

      io.to('globalChatRoom').emit('messageDeleted', { 
        messageId, 
        deletedByRole: socket.user.role 
      });
    } catch (err) {
      console.error('Error deleting message:', err);
    }
  });

  socket.on('suspendGlobalUser', async (userId) => {
    if (!socket.user) return;
    const isOwner = socket.user.role === 'owner';
    const isAdmin = socket.user.role === 'admin' || socket.user.role === 'superadmin' || isOwner;
    if (!isAdmin) return;
    
    try {
      const targetUser = await User.findById(userId);
      if (!targetUser || (targetUser.role === 'owner' && !isOwner)) return; // No one can suspend owner
      
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
