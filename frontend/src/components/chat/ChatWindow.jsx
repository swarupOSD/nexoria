import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChat } from '../../contexts/ChatContext';
import { COLORS, COLOR_HEX } from '../../utils/constants';

const ChatWindow = ({ playerId, players, isOpen, onToggle }) => {
  const {
    messages,
    unreadCount,
    typingUsers,
    sendMessage,
    sendTyping,
    markAsRead,
    messagesEndRef
  } = useChat();

  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef(null);
  const inputRef = useRef(null);

  const handleSend = () => {
    if (message.trim()) {
      sendMessage(message);
      setMessage('');
      setIsTyping(false);
      sendTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTyping = (e) => {
    const value = e.target.value;
    setMessage(value);
    
    if (value.trim() && !isTyping) {
      setIsTyping(true);
      sendTyping(true);
    } else if (!value.trim() && isTyping) {
      setIsTyping(false);
      sendTyping(false);
    }

    // Clear typing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new typing timeout (stop typing after 2 seconds of inactivity)
    if (value.trim()) {
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
        sendTyping(false);
      }, 2000);
    }
  };

  // Mark messages as read when chat is opened
  useEffect(() => {
    if (isOpen) {
      markAsRead();
    }
  }, [isOpen, markAsRead]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const getSenderColor = (senderId) => {
    if (senderId === 'system') return '#6B7280';
    const player = Object.values(players || {}).find(p => p.id === senderId);
    return player ? COLOR_HEX[player.color] : '#6B7280';
  };

  const getSenderName = (senderId) => {
    if (senderId === 'system') return 'System';
    const player = Object.values(players || {}).find(p => p.id === senderId);
    return player ? player.name : 'Unknown';
  };

  const formatTime = (date) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed bottom-20 right-4 w-80 sm:w-96 h-96 bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden z-40"
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          transition={{ duration: 0.2 }}
        >
          {/* Chat Header */}
          <div className="flex items-center justify-between p-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
            <h3 className="font-semibold">💬 Chat</h3>
            <button
              onClick={onToggle}
              className="hover:bg-white/20 rounded-full p-1 transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-gray-50">
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                No messages yet. Say hello! 👋
              </div>
            ) : (
              messages.map((msg, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex flex-col ${
                    msg.senderId === playerId ? 'items-end' : 'items-start'
                  }`}
                >
                  {msg.isSystem ? (
                    <div className="text-center text-xs text-gray-500 w-full">
                      <span className="bg-gray-200 px-2 py-1 rounded-full">
                        {msg.message}
                      </span>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-2 text-xs text-gray-500 mb-0.5">
                        <span 
                          className="font-medium"
                          style={{ color: getSenderColor(msg.senderId) }}
                        >
                          {msg.senderName}
                        </span>
                        <span>{formatTime(msg.timestamp)}</span>
                      </div>
                      <div
                        className={`max-w-[80%] p-2 rounded-lg ${
                          msg.senderId === playerId
                            ? 'bg-indigo-500 text-white rounded-br-none'
                            : 'bg-white text-gray-800 rounded-bl-none shadow-sm'
                        }`}
                      >
                        <p className="text-sm break-words">{msg.message}</p>
                      </div>
                    </>
                  )}
                </motion.div>
              ))
            )}
            
            {/* Typing indicator */}
            {Object.entries(typingUsers).map(([userId, isTyping]) => {
              if (!isTyping || userId === playerId) return null;
              const userName = getSenderName(userId);
              return (
                <motion.div
                  key={userId}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-xs text-gray-400 italic"
                >
                  {userName} is typing...
                </motion.div>
              );
            })}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-2 border-t border-gray-200 bg-white">
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={message}
                onChange={handleTyping}
                onKeyPress={handleKeyPress}
                placeholder="Type a message..."
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                maxLength={200}
              />
              <button
                onClick={handleSend}
                disabled={!message.trim()}
                className={`px-4 py-2 rounded-lg text-white font-medium transition-colors ${
                  message.trim()
                    ? 'bg-indigo-500 hover:bg-indigo-600'
                    : 'bg-gray-300 cursor-not-allowed'
                }`}
              >
                Send
              </button>
            </div>
            <div className="text-xs text-gray-400 mt-1 text-right">
              {message.length}/200
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// src/components/chat/ChatToggle.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { useChat } from '../../contexts/ChatContext';

const ChatToggle = ({ isOpen, onClick }) => {
  const { unreadCount } = useChat();

  return (
    <motion.button
      className={`
        fixed bottom-4 right-4 z-30 p-3 rounded-full shadow-lg
        ${isOpen ? 'bg-gray-700' : 'bg-indigo-500 hover:bg-indigo-600'}
        text-white transition-colors duration-200
      `}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
    >
      <span className="text-xl">💬</span>
      {unreadCount > 0 && !isOpen && (
        <motion.span
          className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
        >
          {unreadCount > 9 ? '9+' : unreadCount}
        </motion.span>
      )}
    </motion.button>
  );
};

export { ChatWindow, ChatToggle };
