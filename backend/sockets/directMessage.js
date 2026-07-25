import { Conversation, PrivateMessage } from '../models/PrivateChat.js';
import User from '../models/User.js';

// Helper to populate a message fully
const populateMessage = (msgId) =>
  PrivateMessage.findById(msgId)
    .populate('sender', 'name username profileImage role isPremium auraRank')
    .populate('replyTo', 'text type mediaUrl gifData sender isUnsent')
    .populate('reactions.user', 'name username profileImage')
    .lean();

export const registerDirectMessageHandlers = (io, socket) => {

  // ── Send Direct Message ─────────────────────────────────────────────────
  socket.on('sendDirectMessage', async ({ receiverId, text, type = 'text', mediaUrl, gifData, replyTo }) => {
    if (!socket.user || !receiverId) return;
    if (type === 'text' && !text?.trim()) return;

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

      // Build message data
      const msgData = {
        conversationId: conversation._id,
        sender: socket.user._id,
        type,
        text: text?.trim() || '',
      };
      if (mediaUrl) msgData.mediaUrl = mediaUrl;
      if (gifData) msgData.gifData = gifData;
      if (replyTo) msgData.replyTo = replyTo;

      // Create message
      const message = await PrivateMessage.create(msgData);

      // Update conversation lastMessage + unreadCount for receiver
      const currentUnread = conversation.unreadCount?.get?.(receiverId.toString()) || 0;
      conversation.lastMessage = message._id;
      conversation.updatedAt = new Date();
      if (!conversation.unreadCount) conversation.unreadCount = new Map();
      conversation.unreadCount.set(receiverId.toString(), currentUnread + 1);
      await conversation.save();

      const populatedMessage = await populateMessage(message._id);

      // Emit to both participants' personal rooms
      io.to(receiverId.toString()).emit('newDirectMessage', populatedMessage);
      io.to(socket.user._id.toString()).emit('newDirectMessage', populatedMessage);

      // Also refresh conversations list for receiver
      const receiverConversations = await Conversation.find({ participants: receiverId })
        .populate('participants', 'name username profileImage isPremium auraRank role')
        .populate('lastMessage')
        .sort({ updatedAt: -1 })
        .lean();
      io.to(receiverId.toString()).emit('conversationsList', receiverConversations);

    } catch (err) {
      console.error('Error sending DM:', err);
      socket.emit('dmError', { message: 'Failed to send message.' });
    }
  });

  // ── Get Conversations List ──────────────────────────────────────────────
  socket.on('getConversations', async () => {
    if (!socket.user) return;
    try {
      const conversations = await Conversation.find({ participants: socket.user._id })
        .populate('participants', 'name username profileImage isPremium auraRank role')
        .populate({ path: 'lastMessage', populate: { path: 'sender', select: 'name' } })
        .sort({ updatedAt: -1 })
        .lean();

      socket.emit('conversationsList', conversations);
    } catch (err) {
      console.error('Error fetching conversations:', err);
    }
  });

  // ── Get Messages for Conversation ──────────────────────────────────────
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
        .populate('replyTo', 'text type mediaUrl gifData sender isUnsent')
        .populate('reactions.user', 'name username profileImage')
        .lean();

      // Mark all as read for current user
      await PrivateMessage.updateMany(
        { conversationId: conversation._id, sender: { $ne: socket.user._id }, isRead: false },
        { isRead: true, $addToSet: { seenBy: { user: socket.user._id } } }
      );

      // Reset unread count for this user
      if (conversation.unreadCount) {
        conversation.unreadCount.set(socket.user._id.toString(), 0);
        await conversation.save();
      }

      // Notify sender that messages were seen
      io.to(receiverId.toString()).emit('messagesSeen', {
        conversationId: conversation._id,
        seenBy: socket.user._id
      });

      socket.emit('conversationMessages', { receiverId, messages, theme: conversation.theme || 'default' });
    } catch (err) {
      console.error('Error fetching DM messages:', err);
    }
  });

  // ── Add/Toggle Reaction ─────────────────────────────────────────────────
  socket.on('reactToMessage', async ({ messageId, emoji }) => {
    if (!socket.user || !messageId || !emoji) return;
    try {
      const message = await PrivateMessage.findById(messageId);
      if (!message) return;

      const existingIdx = message.reactions.findIndex(
        r => r.user.toString() === socket.user._id.toString()
      );

      if (existingIdx !== -1) {
        if (message.reactions[existingIdx].emoji === emoji) {
          // Remove reaction if same emoji
          message.reactions.splice(existingIdx, 1);
        } else {
          // Change emoji
          message.reactions[existingIdx].emoji = emoji;
        }
      } else {
        // Add new reaction
        message.reactions.push({ user: socket.user._id, emoji });
      }

      await message.save();
      const updatedMsg = await populateMessage(messageId);

      // Get conversation participants to emit to both
      const conversation = await Conversation.findById(message.conversationId);
      if (conversation) {
        conversation.participants.forEach(pid => {
          io.to(pid.toString()).emit('messageReactionUpdated', {
            messageId,
            reactions: updatedMsg.reactions
          });
        });
      }
    } catch (err) {
      console.error('Error reacting to message:', err);
    }
  });

  // ── Unsend Message ──────────────────────────────────────────────────────
  socket.on('unsendMessage', async ({ messageId }) => {
    if (!socket.user || !messageId) return;
    try {
      const message = await PrivateMessage.findById(messageId);
      if (!message || message.sender.toString() !== socket.user._id.toString()) return;

      message.isUnsent = true;
      message.text = '';
      message.mediaUrl = '';
      message.gifData = undefined;
      await message.save();

      const conversation = await Conversation.findById(message.conversationId);
      if (conversation) {
        conversation.participants.forEach(pid => {
          io.to(pid.toString()).emit('messageUnsent', { messageId, conversationId: message.conversationId });
        });
      }
    } catch (err) {
      console.error('Error unsending message:', err);
    }
  });

  // ── Typing Indicator ────────────────────────────────────────────────────
  socket.on('typingStart', ({ receiverId }) => {
    if (!socket.user || !receiverId) return;
    io.to(receiverId.toString()).emit('userTyping', {
      userId: socket.user._id,
      name: socket.user.name
    });
  });

  socket.on('typingStop', ({ receiverId }) => {
    if (!socket.user || !receiverId) return;
    io.to(receiverId.toString()).emit('userStoppedTyping', {
      userId: socket.user._id
    });
  });

  // ── Set Conversation Theme ──────────────────────────────────────────────
  socket.on('setConversationTheme', async ({ receiverId, theme }) => {
    if (!socket.user || !receiverId) return;
    const VALID_THEMES = ['default', 'cherry', 'galaxy', 'flame', 'forest', 'cyberpunk', 'ice', 'pride'];
    if (!VALID_THEMES.includes(theme)) return;

    try {
      const conversation = await Conversation.findOne({
        participants: { $all: [socket.user._id, receiverId] }
      });
      if (!conversation) return;

      conversation.theme = theme;
      await conversation.save();

      // Notify both participants
      conversation.participants.forEach(pid => {
        io.to(pid.toString()).emit('conversationThemeChanged', {
          conversationId: conversation._id,
          theme
        });
      });
    } catch (err) {
      console.error('Error setting theme:', err);
    }
  });

  // ── Pin/Unpin Conversation ──────────────────────────────────────────────
  socket.on('pinConversation', async ({ conversationId }) => {
    if (!socket.user) return;
    try {
      const conversation = await Conversation.findById(conversationId);
      if (!conversation) return;

      const userId = socket.user._id.toString();
      const isPinned = conversation.pinnedBy.some(id => id.toString() === userId);

      if (isPinned) {
        conversation.pinnedBy = conversation.pinnedBy.filter(id => id.toString() !== userId);
      } else {
        conversation.pinnedBy.push(socket.user._id);
      }
      await conversation.save();

      socket.emit('conversationPinToggled', { conversationId, isPinned: !isPinned });
    } catch (err) {
      console.error('Error pinning conversation:', err);
    }
  });

  // ── Mark Messages as Read ───────────────────────────────────────────────
  socket.on('markMessagesRead', async ({ conversationId, senderId }) => {
    if (!socket.user) return;
    try {
      await PrivateMessage.updateMany(
        { conversationId, sender: senderId, isRead: false },
        { isRead: true, $addToSet: { seenBy: { user: socket.user._id } } }
      );
      io.to(senderId.toString()).emit('messagesSeen', { conversationId, seenBy: socket.user._id });
    } catch (err) {
      console.error('Error marking messages read:', err);
    }
  });
};

