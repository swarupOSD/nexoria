import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, ChevronDown, Trophy, Trash2, Edit2, Check, ShieldAlert, Crown, Smile } from 'lucide-react';
import { useSelector } from 'react-redux';
import EmojiPicker from 'emoji-picker-react';
import { io } from 'socket.io-client';

// Keep socket outside to prevent reconnection on re-renders, but only connect if needed.
let socket;

const GlobalChatBubble = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  
  const { user } = useSelector((state) => state.auth);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // Connect on mount
  useEffect(() => {
    if (!socket) {
      socket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
        withCredentials: true,
      });
    }

    socket.on('connect', () => {
      setIsConnected(true);
      socket.emit('joinGlobalChat');
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on('globalChatHistory', (history) => {
      setMessages(history);
      scrollToBottom();
    });

    socket.on('newGlobalMessage', (message) => {
      setMessages((prev) => [...prev, message]);
      scrollToBottom();
    });

    socket.on('messageEdited', ({ messageId, newContent }) => {
      setMessages((prev) => 
        prev.map(m => m._id === messageId ? { ...m, message: newContent, isEdited: true } : m)
      );
    });

    socket.on('messageDeleted', (messageId) => {
      setMessages((prev) => prev.filter(m => m._id !== messageId));
    });

    socket.on('userSuspended', ({ userId, username }) => {
      import('react-hot-toast').then(({ default: toast }) => {
        toast.success(`${username} has been suspended.`);
      });
    });

    socket.on('globalChatError', ({ message }) => {
      import('react-hot-toast').then(({ default: toast }) => {
        toast.error(message);
      });
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('globalChatHistory');
      socket.off('newGlobalMessage');
      socket.off('messageEdited');
      socket.off('messageDeleted');
      socket.off('userSuspended');
      socket.off('globalChatError');
    };
  }, []);

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputValue.trim() || !user) return;
    
    socket.emit('sendGlobalMessage', inputValue.trim());
    setInputValue('');
  };

  const handleDelete = (id) => {
    socket.emit('deleteGlobalMessage', id);
  };

  const handleSuspend = (userId) => {
    if (window.confirm("Are you sure you want to suspend this user?")) {
      socket.emit('suspendGlobalUser', userId);
    }
  };

  const handleEditSubmit = (id) => {
    if (!editValue.trim()) return;
    socket.emit('editGlobalMessage', { messageId: id, newContent: editValue });
    setEditingId(null);
    setEditValue('');
  };

  const getRankColor = (rank) => {
    switch (rank) {
      case 'Legend': return 'text-amber-400 font-black drop-shadow-[0_0_5px_rgba(251,191,36,0.8)]';
      case 'Elite': return 'text-purple-400 font-bold drop-shadow-[0_0_3px_rgba(192,132,252,0.8)]';
      case 'Pro': return 'text-blue-400 font-semibold';
      case 'Rising': return 'text-emerald-400 font-medium';
      default: return 'text-slate-300';
    }
  };

  const onEmojiClick = (emojiObject) => {
    setInputValue(prev => prev + emojiObject.emoji);
  };

  return (
    <>
      {/* Floating Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => { setIsOpen(true); scrollToBottom(); }}
        className={`fixed bottom-28 right-6 z-[100] w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all ${
          isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100 bg-gradient-to-tr from-purple-600 to-pink-500 hover:shadow-purple-500/50'
        }`}
      >
        <MessageSquare className="w-6 h-6 text-white" />
        <span className="absolute top-0 right-0 w-3 h-3 bg-green-500 border-2 border-slate-900 rounded-full"></span>
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9, transformOrigin: 'bottom left' }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-28 right-6 z-[110] w-full max-w-sm h-[500px] sm:w-[380px] bg-[#0f1219] border border-slate-800 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 bg-slate-900 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-500/20 to-pink-500/20 flex items-center justify-center border border-purple-500/30">
                  <MessageSquare className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">Nexoria Lounge</h3>
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-red-500'}`}></span>
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                      {isConnected ? 'Live Global Chat' : 'Reconnecting...'}
                    </span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-full transition-colors"
              >
                <ChevronDown className="w-5 h-5" />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
              {messages.map((msg, idx) => {
                const isMe = user && msg.sender?._id === user._id;
                const senderRole = isMe ? user.role : msg.sender?.role;
                const senderPremium = isMe ? user.isPremium : msg.sender?.isPremium;
                
                return (
                  <div key={msg._id || idx} className={`flex gap-3 ${isMe ? 'flex-row-reverse' : ''}`}>
                    <img 
                      src={msg.sender?.profileImage || '/default.jpg'} 
                      alt="Avatar" 
                      className="w-8 h-8 rounded-full object-cover shrink-0 mt-1"
                    />
                    <div className={`flex flex-col max-w-[75%] ${isMe ? 'items-end' : 'items-start'}`}>
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className={`text-[11px] ${getRankColor(msg.sender?.auraRank)}`}>
                          {msg.sender?.name || 'User'}
                        </span>
                        {/* VIP Badges */}
                        {senderRole === 'owner' && (
                          <div className="flex gap-1 ml-1">
                            <span className="px-2 py-0.5 rounded-[4px] text-[9px] font-black bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-[0_0_12px_rgba(245,158,11,0.5)] flex items-center gap-1 border border-amber-300/50 relative overflow-hidden group">
                              <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                              <Crown className="w-2.5 h-2.5" /> NEXORIA CREATOR
                            </span>
                            <span className="px-2 py-0.5 rounded-[4px] text-[9px] font-black bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[0_0_12px_rgba(6,182,212,0.5)] flex items-center gap-1 border border-cyan-300/50 relative overflow-hidden group">
                              <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                              <ShieldAlert className="w-2.5 h-2.5" /> SYSTEM ARCHITECT
                            </span>
                          </div>
                        )}
                        {senderRole === 'superadmin' && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center gap-1 shadow-[0_0_8px_rgba(244,63,94,0.3)]">
                            <ShieldAlert className="w-2.5 h-2.5" /> SUPER ADMIN
                          </span>
                        )}
                        {senderRole === 'admin' && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center gap-1">
                            <ShieldAlert className="w-2.5 h-2.5" /> ADMIN
                          </span>
                        )}
                        {senderPremium && senderRole === 'user' && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                            <Crown className="w-2.5 h-2.5" /> PREMIUM
                          </span>
                        )}
                        {msg.sender?.badges?.includes('aura_legend') && (
                          <Trophy className="w-3 h-3 text-amber-400" />
                        )}
                      </div>
                      <div className={`px-4 py-2 text-sm rounded-2xl group relative ${
                        senderRole === 'owner'
                          ? `bg-gradient-to-r from-amber-950 to-slate-900 text-amber-100 border border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.15)] ${isMe ? 'rounded-tr-sm' : 'rounded-tl-sm'}`
                          : senderRole === 'superadmin' || senderRole === 'admin'
                          ? `bg-gradient-to-r from-rose-950 to-rose-900 text-rose-100 border border-rose-500/40 shadow-[0_0_15px_rgba(244,63,94,0.15)] ${isMe ? 'rounded-tr-sm' : 'rounded-tl-sm'}`
                          : senderPremium
                            ? `bg-gradient-to-r from-amber-950 to-orange-950 text-amber-100 border border-amber-500/30 ${isMe ? 'rounded-tr-sm' : 'rounded-tl-sm'}`
                            : isMe 
                              ? 'bg-purple-600 text-white rounded-tr-sm' 
                              : 'bg-slate-800 text-slate-200 border border-slate-700/50 rounded-tl-sm'
                      }`}>
                        {editingId === msg._id ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={editValue}
                              onChange={e => setEditValue(e.target.value)}
                              className="bg-purple-700 text-white outline-none border-b border-white/50 w-full"
                              autoFocus
                              onKeyDown={(e) => e.key === 'Enter' && handleEditSubmit(msg._id)}
                            />
                            <button onClick={() => handleEditSubmit(msg._id)} className="text-white hover:text-green-300"><Check className="w-4 h-4" /></button>
                            <button onClick={() => setEditingId(null)} className="text-white hover:text-red-300"><X className="w-4 h-4" /></button>
                          </div>
                        ) : (
                          <>
                            {msg.message}
                            {msg.isEdited && <span className="text-[10px] opacity-60 ml-2">(edited)</span>}
                            {(isMe || user?.role === 'admin' || user?.role === 'superadmin' || user?.role === 'owner') && (
                              <div className={`absolute top-1/2 -translate-y-1/2 ${isMe ? '-left-20' : '-right-20'} hidden group-hover:flex gap-1`}>
                                {isMe && (
                                  <button onClick={() => { setEditingId(msg._id); setEditValue(msg.message); }} className="p-1.5 bg-slate-800 rounded-full text-slate-400 hover:text-white"><Edit2 className="w-3 h-3" /></button>
                                )}
                                <button onClick={() => handleDelete(msg._id)} className="p-1.5 bg-slate-800 rounded-full text-slate-400 hover:text-red-500" title="Delete Message"><Trash2 className="w-3 h-3" /></button>
                                {!isMe && (user?.role === 'admin' || user?.role === 'superadmin' || user?.role === 'owner') && (msg.sender?.role !== 'superadmin' && msg.sender?.role !== 'owner') && (
                                  <button onClick={() => handleSuspend(msg.sender._id)} className="p-1.5 bg-slate-800 rounded-full text-slate-400 hover:text-orange-500" title="Suspend User"><ShieldAlert className="w-3 h-3" /></button>
                                )}
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            {user ? (
              <div className="relative">
                <form onSubmit={handleSend} className="p-3 bg-slate-900 border-t border-slate-800 flex gap-2">
                  <button 
                    type="button" 
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl transition-colors shrink-0"
                  >
                    <Smile className="w-5 h-5" />
                  </button>
                  <input 
                    type="text" 
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Say something to the world..."
                    className="flex-1 bg-slate-800 border border-slate-700 text-white text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 transition-all placeholder:text-slate-500"
                  />
                  <button 
                    type="submit"
                    disabled={!inputValue.trim()}
                    className="p-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl transition-colors disabled:opacity-50 disabled:hover:bg-purple-600 shrink-0"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </form>
                {showEmojiPicker && (
                  <div className="absolute bottom-[65px] left-2 z-50">
                    <EmojiPicker 
                      onEmojiClick={onEmojiClick} 
                      theme="dark"
                      searchDisabled={true}
                      skinTonesDisabled={true}
                      height={300}
                      width={300}
                    />
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4 bg-slate-900 border-t border-slate-800 text-center">
                <p className="text-xs text-slate-400 font-medium">Login to join the conversation</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default GlobalChatBubble;
