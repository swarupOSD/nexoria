import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Smile, Minus, Minimize2, Maximize2 } from 'lucide-react';
import { useSelector } from 'react-redux';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';

const PrivateChatWidget = ({ activeChat, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);
  const [socket, setSocket] = useState(null);
  
  const { user } = useSelector((state) => state.auth);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (!activeChat || !user) return;

    // Connect to global socket (or specific DM namespace if configured)
    const newSocket = io(import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000', {
      withCredentials: true,
    });

    setSocket(newSocket);

    newSocket.on('connect', () => {
      newSocket.emit('joinDMRoom');
      newSocket.emit('getConversationMessages', activeChat._id);
    });

    newSocket.on('conversationMessages', (data) => {
      if (data.receiverId === activeChat._id) {
        setMessages(data.messages);
        scrollToBottom();
      }
    });

    newSocket.on('newDirectMessage', (message) => {
      // Check if message belongs to this conversation
      const isSenderMe = message.sender._id === user._id;
      const isSenderActiveChat = message.sender._id === activeChat._id;
      
      // We only append if the message is from us (echo) or from the person we are chatting with
      if (isSenderMe || isSenderActiveChat) {
        setMessages(prev => [...prev, message]);
        scrollToBottom();
      } else {
        // Notification for DM from someone else
        toast(`New message from ${message.sender.name}`, { icon: '💬' });
      }
    });

    newSocket.on('dmError', (err) => {
      toast.error(err.message);
    });

    return () => {
      newSocket.disconnect();
    };
  }, [activeChat, user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isMinimized]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputValue.trim() || !socket) return;

    socket.emit('sendDirectMessage', {
      receiverId: activeChat._id,
      text: inputValue
    });
    
    setInputValue('');
  };

  if (!activeChat) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50, scale: 0.9 }}
        className={`fixed bottom-0 right-10 z-[140] w-[320px] bg-[#0a0d14]/95 backdrop-blur-xl border border-white/10 rounded-t-2xl shadow-2xl flex flex-col transition-all duration-300 ${isMinimized ? 'h-14' : 'h-[400px]'}`}
      >
        {/* Header */}
        <div 
          onClick={() => setIsMinimized(!isMinimized)}
          className="flex items-center justify-between p-3 bg-white/5 border-b border-white/10 rounded-t-2xl cursor-pointer hover:bg-white/10 transition-colors"
        >
          <div className="flex items-center gap-2">
            <div className="relative">
              <img 
                src={activeChat.profileImage.startsWith('http') ? activeChat.profileImage : `${import.meta.env.VITE_BACKEND_URL || ''}/uploads/${activeChat.profileImage}`} 
                alt={activeChat.username}
                className="w-8 h-8 rounded-full object-cover"
              />
              <div className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 rounded-full border border-[#0a0d14]"></div>
            </div>
            <span className="text-white font-medium text-sm" style={{ color: activeChat.chatNameColor || 'white' }}>
              {activeChat.name}
            </span>
          </div>
          <div className="flex gap-1">
            <button className="p-1 text-slate-400 hover:text-white transition-colors">
              {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minus className="w-4 h-4" />}
            </button>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="p-1 text-slate-400 hover:text-white hover:bg-red-500/20 rounded transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Chat Area */}
        {!isMinimized && (
          <>
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-black/20">
              {messages.length === 0 ? (
                <div className="text-center text-slate-500 text-xs mt-10">
                  Say hi to {activeChat.name}!
                </div>
              ) : (
                messages.map((msg, i) => {
                  const isMe = msg.sender._id === user._id;
                  return (
                    <div key={i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[75%] p-3 rounded-2xl text-sm ${isMe ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-tr-sm' : 'bg-white/10 text-slate-200 rounded-tl-sm'}`}>
                        {msg.text}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="p-3 bg-white/5 border-t border-white/10 flex gap-2">
              <input 
                type="text" 
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Message..."
                className="flex-1 bg-black/20 border border-white/10 text-white text-sm rounded-xl px-3 py-2 focus:outline-none focus:border-purple-500/50"
              />
              <button 
                type="submit"
                disabled={!inputValue.trim()}
                className="p-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl transition-colors disabled:opacity-50 shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default PrivateChatWidget;
