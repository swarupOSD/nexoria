import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Smile, Minus, Minimize2, Maximize2 } from 'lucide-react';
import { useSelector } from 'react-redux';
import { io } from 'socket.io-client';
import { useSocket } from '../context/SocketContext';
import toast from 'react-hot-toast';

const THEMES = {
  default:   { bg: '#0a0d14',   myBubble: 'linear-gradient(135deg,#7c3aed,#6d28d9)', accent: '#7c3aed' },
  cherry:    { bg: '#1a0814',   myBubble: 'linear-gradient(135deg,#ec4899,#be185d)', accent: '#ec4899' },
  galaxy:    { bg: '#020817',   myBubble: 'linear-gradient(135deg,#3b82f6,#4f46e5)', accent: '#3b82f6' },
  flame:     { bg: '#1a0500',   myBubble: 'linear-gradient(135deg,#f97316,#dc2626)', accent: '#f97316' },
  forest:    { bg: '#031a07',   myBubble: 'linear-gradient(135deg,#22c55e,#16a34a)', accent: '#22c55e' },
  cyberpunk: { bg: '#000d1a',   myBubble: 'linear-gradient(135deg,#06b6d4,#3b82f6)', accent: '#06b6d4' },
  ice:       { bg: '#071a2d',   myBubble: 'linear-gradient(135deg,#38bdf8,#60a5fa)', accent: '#38bdf8' },
  pride:     { bg: '#0d0010',   myBubble: 'linear-gradient(90deg,#ef4444,#eab308,#22c55e,#3b82f6,#a855f7)', accent: '#a855f7' },
};

const PrivateChatWidget = ({ activeChat, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);
  const [theme, setTheme] = useState('default');
  
  const { user } = useSelector((state) => state.auth);
  const messagesEndRef = useRef(null);
  const socket = useSocket();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (!activeChat || !user || !socket) return;

    // We no longer emit joinDMRoom because the global socket automatically joins the user's ID room.
    socket.emit('getConversationMessages', activeChat._id);

    const handleConversationMessages = (data) => {
      if (data.receiverId === activeChat._id) {
        setMessages(data.messages);
        setTheme(data.theme || 'default');
        scrollToBottom();
      }
    };

    const handleNewDirectMessage = (message) => {
      const isSenderMe = message.sender._id === user._id;
      const isSenderActiveChat = message.sender._id === activeChat._id;
      
      if (isSenderMe || isSenderActiveChat) {
        setMessages(prev => [...prev, message]);
        scrollToBottom();
      }
      // Toast notifications for other DMs are handled globally in Navbar or SocketContext
    };

    const handleThemeChange = (data) => {
      if (data.conversationId) { // Check if this chat matches
        // It's a bit tricky to check conversationId since we don't store it natively in the widget,
        // but if we receive it while chatting, we can just update if it matches activeChat somehow.
        // Or simply accept any theme change sent while we are active, because it's for us.
        setTheme(data.theme || 'default');
      }
    };

    const handleDmError = (err) => {
      toast.error(err.message);
    };

    socket.on('conversationMessages', handleConversationMessages);
    socket.on('newDirectMessage', handleNewDirectMessage);
    socket.on('dmError', handleDmError);
    socket.on('conversationThemeChanged', handleThemeChange);

    return () => {
      socket.off('conversationMessages', handleConversationMessages);
      socket.off('newDirectMessage', handleNewDirectMessage);
      socket.off('dmError', handleDmError);
      socket.off('conversationThemeChanged', handleThemeChange);
    };
  }, [activeChat, user, socket]);

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

  const activeTheme = THEMES[theme] || THEMES.default;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50, scale: 0.9 }}
        style={{ backgroundColor: `${activeTheme.bg}F2` }} // F2 for 95% opacity
        className={`fixed bottom-0 right-10 z-[140] w-[320px] backdrop-blur-xl border border-white/10 rounded-t-2xl shadow-2xl flex flex-col transition-all duration-300 ${isMinimized ? 'h-14' : 'h-[400px]'}`}
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
                      <div 
                        className={`max-w-[75%] p-3 rounded-2xl text-sm ${isMe ? 'text-white rounded-tr-sm' : 'bg-white/10 text-slate-200 rounded-tl-sm'}`}
                        style={isMe ? { background: activeTheme.myBubble } : {}}
                      >
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
                style={{ backgroundColor: activeTheme.accent }}
                className="p-2 text-white rounded-xl transition-colors disabled:opacity-50 shrink-0 hover:brightness-110"
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
