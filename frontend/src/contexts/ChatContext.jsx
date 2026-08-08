import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { soundManager } from '../utils/SoundManager';

const ChatContext = createContext(null);

export const ChatProvider = ({ socket, children }) => {
  const [messages, setMessages] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState({});
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!socket) return;

    // Receive chat message
    socket.on('chatMessage', (data) => {
      setMessages(prev => [...prev, {
        ...data,
        timestamp: new Date(data.timestamp)
      }]);
      
      // Play notification sound for other messages
      if (data.senderId !== socket.id) {
        soundManager.play('turnChange', { volume: 0.2 });
      }
      
      setUnreadCount(prev => prev + 1);
    });

    // User typing
    socket.on('userTyping', ({ userId, isTyping }) => {
      setTypingUsers(prev => ({
        ...prev,
        [userId]: isTyping
      }));
    });

    // User joined/left
    socket.on('userJoinedChat', ({ userId, userName }) => {
      setMessages(prev => [...prev, {
        senderId: 'system',
        senderName: 'System',
        message: `${userName} joined the game`,
        isSystem: true,
        timestamp: new Date()
      }]);
    });

    socket.on('userLeftChat', ({ userId, userName }) => {
      setMessages(prev => [...prev, {
        senderId: 'system',
        senderName: 'System',
        message: `${userName} left the game`,
        isSystem: true,
        timestamp: new Date()
      }]);
    });

    return () => {
      socket.off('chatMessage');
      socket.off('userTyping');
      socket.off('userJoinedChat');
      socket.off('userLeftChat');
    };
  }, [socket]);

  const sendMessage = (message) => {
    if (!socket || !message.trim()) return;
    
    socket.emit('chatMessage', { message: message.trim() });
  };

  const sendTyping = (isTyping) => {
    if (!socket) return;
    socket.emit('typing', { isTyping });
  };

  const markAsRead = () => {
    setUnreadCount(0);
  };

  const clearMessages = () => {
    setMessages([]);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const value = {
    messages,
    unreadCount,
    typingUsers,
    isTyping,
    sendMessage,
    sendTyping,
    markAsRead,
    clearMessages,
    messagesEndRef,
    scrollToBottom
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
