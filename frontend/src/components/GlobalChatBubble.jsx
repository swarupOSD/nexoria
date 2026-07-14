import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, ChevronDown, Trophy, Trash2, Edit2, Check, ShieldAlert, Crown, Smile, Mic, Lock, Square } from 'lucide-react';
import { useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import EmojiPicker from 'emoji-picker-react';
import { io } from 'socket.io-client';
import UserActionModal from './UserActionModal';

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
  const [selectedUserAction, setSelectedUserAction] = useState(null);
  
  // Voice Recording States
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recordingTimerRef = useRef(null);
  const audioRefs = useRef({}); // Store references to audio elements for playback control
  const [playingAudioId, setPlayingAudioId] = useState(null);

  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const location = useLocation();
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

    socket.on('messageDeleted', ({ messageId, deletedByRole }) => {
      setMessages((prev) => prev.map(m => m._id === messageId ? { ...m, isDeleted: true, deletedByRole, message: '', audioUrl: '' } : m));
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

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          const base64Audio = reader.result;
          socket.emit('sendGlobalVoiceMessage', base64Audio);
        };
        // Cleanup stream
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordingTime(0);
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime(prev => {
          if (prev >= 60) {
            stopRecording();
            return 60;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (err) {
      import('react-hot-toast').then(({ default: toast }) => toast.error('Microphone permission denied.'));
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(recordingTimerRef.current);
    }
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handlePlayVoice = (msgId) => {
    if (playingAudioId && playingAudioId !== msgId) {
      audioRefs.current[playingAudioId]?.pause();
    }
    const audioEl = audioRefs.current[msgId];
    if (audioEl) {
      if (playingAudioId === msgId) {
        audioEl.pause();
        setPlayingAudioId(null);
      } else {
        audioEl.play();
        setPlayingAudioId(msgId);
      }
    }
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

  // Hide global chat completely on voice lounge page to prevent overlapping
  if (location.pathname.includes('/voice-lounge')) {
    return null;
  }

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
            className="fixed bottom-28 right-6 z-[110] w-[calc(100%-3rem)] max-w-sm h-[550px] sm:w-[400px] bg-black/40 backdrop-blur-3xl border border-white/10 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden ring-1 ring-white/10 before:absolute before:inset-0 before:bg-gradient-to-br before:from-purple-500/10 before:to-pink-500/10 before:-z-10"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 bg-white/5 border-b border-white/10 backdrop-blur-md relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-500/20 to-pink-500/20 flex items-center justify-center border border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.2)]">
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
                      src={msg.sender?.profileImage?.startsWith('http') ? msg.sender.profileImage : `${import.meta.env.VITE_API_URL || ''}/uploads/avatars/${msg.sender?.profileImage || 'default.jpg'}`}
                      alt="Avatar" 
                      onClick={() => !isMe && setSelectedUserAction(msg.sender)}
                      className={`w-8 h-8 rounded-full object-cover shrink-0 mt-1 cursor-pointer transition-transform hover:scale-110 ${
                        msg.sender?.profileBorder === 'fire' ? 'ring-2 ring-orange-500 shadow-[0_0_10px_orange]' :
                        msg.sender?.profileBorder === 'neon' ? 'ring-2 ring-cyan-400 shadow-[0_0_15px_cyan]' :
                        msg.sender?.profileBorder === 'holographic' ? 'ring-2 ring-fuchsia-500 shadow-[0_0_10px_fuchsia]' :
                        msg.sender?.profileBorder === 'gold' ? 'ring-2 ring-yellow-400 shadow-[0_0_10px_yellow]' : ''
                      }`}
                    />
                    <div className={`flex flex-col max-w-[75%] ${isMe ? 'items-end' : 'items-start'}`}>
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <span 
                          className={`text-[11px] font-bold tracking-wide ${!msg.sender?.chatNameColor ? getRankColor(msg.sender?.auraRank) : ''}`}
                          style={msg.sender?.chatNameColor ? { color: msg.sender.chatNameColor, textShadow: `0 0 8px ${msg.sender.chatNameColor}60` } : {}}
                        >
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
                      <div className={`px-4 py-2.5 text-sm rounded-2xl group relative backdrop-blur-md shadow-lg ${
                        msg.isDeleted
                          ? (msg.deletedByRole === 'owner' 
                              ? `bg-rose-950/40 border border-rose-500/30 shadow-[0_0_15px_rgba(225,29,72,0.2)] ${isMe ? 'rounded-tr-sm' : 'rounded-tl-sm'}`
                              : 'bg-white/5 border border-white/10 text-slate-400')
                          : senderRole === 'owner'
                          ? `bg-gradient-to-r from-amber-500/20 to-orange-600/20 text-amber-100 border border-amber-500/30 shadow-[0_0_20px_rgba(245,158,11,0.15)] ${isMe ? 'rounded-tr-sm' : 'rounded-tl-sm'}`
                          : senderRole === 'superadmin' || senderRole === 'admin'
                          ? `bg-gradient-to-r from-rose-500/20 to-rose-700/20 text-rose-100 border border-rose-500/30 shadow-[0_0_20px_rgba(244,63,94,0.15)] ${isMe ? 'rounded-tr-sm' : 'rounded-tl-sm'}`
                          : senderPremium
                            ? `bg-gradient-to-r from-amber-500/10 to-orange-500/10 text-amber-100 border border-amber-500/20 ${isMe ? 'rounded-tr-sm' : 'rounded-tl-sm'}`
                            : isMe 
                              ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-tr-sm border border-white/10 shadow-purple-500/20' 
                              : 'bg-white/10 text-slate-200 border border-white/5 rounded-tl-sm shadow-black/20'
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
                            {msg.isDeleted ? (
                              msg.deletedByRole === 'owner' ? (
                                <span className="text-red-500 font-black italic text-[11px] tracking-wider flex items-center gap-1.5 drop-shadow-[0_0_5px_rgba(239,68,68,0.5)]">
                                  🚫 DELETED BY NEXORIA CREATOR SYSTEM ARCHITECT
                                </span>
                              ) : (
                                <span className="italic text-[11px] flex items-center gap-1.5 opacity-80">
                                  <ShieldAlert className="w-3.5 h-3.5" /> 
                                  This message was deleted by {msg.deletedByRole === 'superadmin' ? 'Super Admin' : msg.deletedByRole === 'admin' ? 'Admin' : 'User'}
                                </span>
                              )
                            ) : msg.type === 'voice' ? (
                              <div className="flex items-center gap-3 py-1 px-1 rounded-xl min-w-[180px]">
                                <button 
                                  onClick={() => handlePlayVoice(msg._id)}
                                  className="w-8 h-8 flex items-center justify-center bg-white/20 hover:bg-white/30 rounded-full transition-colors shrink-0 backdrop-blur-md"
                                >
                                  {playingAudioId === msg._id ? <Square className="w-3.5 h-3.5 fill-current" /> : <div className="w-0 h-0 border-t-4 border-b-4 border-l-6 border-transparent border-l-white ml-1"></div>}
                                </button>
                                <div className="flex-1">
                                  <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden flex items-center shadow-inner">
                                    <div className="h-full bg-white/80 w-full animate-pulse"></div>
                                  </div>
                                </div>
                                <span className="text-[10px] opacity-80 font-mono tracking-widest">Voice</span>
                                <audio 
                                  ref={el => audioRefs.current[msg._id] = el}
                                  src={msg.audioUrl?.startsWith('http') ? msg.audioUrl : `${import.meta.env.VITE_API_URL || ''}${msg.audioUrl}`} 
                                  onEnded={() => setPlayingAudioId(null)}
                                  preload="none"
                                />
                              </div>
                            ) : msg.message?.includes('deleted by NEXORIA CREATOR SYSTEM ARCHITECT') ? (
                              <span className="text-red-500 font-bold italic text-xs tracking-wider opacity-90 flex items-center gap-1.5 drop-shadow-[0_0_5px_rgba(239,68,68,0.5)]">
                                <ShieldAlert className="w-3.5 h-3.5"/> {msg.message}
                              </span>
                            ) : (
                              <span className="break-words font-medium">{msg.message}</span>
                            )}
                            
                            {msg.isEdited && !msg.isDeleted && !msg.message?.includes('deleted by NEXORIA CREATOR SYSTEM ARCHITECT') && <span className="text-[10px] opacity-60 ml-2">(edited)</span>}
                            
                            {!msg.isDeleted && (isMe || user?.role === 'admin' || user?.role === 'superadmin' || user?.role === 'owner') && (
                              <div className={`absolute top-1/2 -translate-y-1/2 ${isMe ? '-left-20' : '-right-20'} hidden group-hover:flex gap-1 bg-black/40 backdrop-blur-md rounded-full p-1 border border-white/10 shadow-xl z-10`}>
                                {isMe && !msg.message?.includes('deleted by NEXORIA CREATOR SYSTEM ARCHITECT') && (
                                  <button onClick={() => { setEditingId(msg._id); setEditValue(msg.message); }} className="p-1.5 bg-white/5 rounded-full text-slate-300 hover:text-white hover:bg-white/20 transition-all"><Edit2 className="w-3 h-3" /></button>
                                )}
                                <button onClick={() => handleDelete(msg._id)} className="p-1.5 bg-white/5 rounded-full text-slate-300 hover:text-red-400 hover:bg-white/20 transition-all" title="Delete Message"><Trash2 className="w-3 h-3" /></button>
                                {!isMe && (
                                  (user?.role === 'owner' && msg.sender?.role !== 'owner') ||
                                  ((user?.role === 'admin' || user?.role === 'superadmin') && msg.sender?.role !== 'owner' && msg.sender?.role !== 'superadmin')
                                ) && (
                                  <button onClick={() => handleSuspend(msg.sender._id)} className="p-1.5 bg-white/5 rounded-full text-slate-300 hover:text-orange-400 hover:bg-white/20 transition-all" title="Suspend User"><ShieldAlert className="w-3 h-3" /></button>
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
                {isRecording ? (
                  <div className="p-3 bg-white/5 border-t border-white/10 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 px-4 py-2 bg-red-500/10 rounded-full border border-red-500/20">
                      <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse"></div>
                      <span className="text-red-400 font-mono text-sm font-bold">{formatTime(recordingTime)}</span>
                    </div>
                    <div className="flex-1 text-center text-xs text-slate-400 font-medium animate-pulse">
                      Recording Voice Message...
                    </div>
                    <button 
                      onClick={stopRecording}
                      className="p-2.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white rounded-xl transition-all shadow-lg shadow-red-500/20 shrink-0"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSend} className="p-3 bg-white/5 border-t border-white/10 flex gap-2">
                    <button 
                      type="button" 
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      className="p-2.5 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white rounded-xl transition-colors shrink-0"
                    >
                      <Smile className="w-5 h-5" />
                    </button>
                    <input 
                      type="text" 
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder="Say something to the world..."
                      className="flex-1 bg-black/40 border border-white/10 text-white text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all placeholder:text-slate-500 backdrop-blur-md"
                    />
                    
                    {/* Voice Message Button */}
                    {(user.role === 'user' && !user.isPremium) ? (
                      <button 
                        type="button"
                        onClick={() => navigate('/premium')}
                        className="p-2.5 bg-slate-800 text-slate-500 rounded-xl relative group shrink-0"
                        title="Premium Feature"
                      >
                        <Mic className="w-5 h-5" />
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-slate-700 rounded-full flex items-center justify-center">
                          <Lock className="w-2 h-2 text-amber-500" />
                        </div>
                      </button>
                    ) : (
                      <button 
                        type="button"
                        onClick={startRecording}
                        className="p-2.5 bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 hover:text-purple-300 rounded-xl transition-colors shrink-0"
                        title="Record Voice Message"
                      >
                        <Mic className="w-5 h-5" />
                      </button>
                    )}

                    <button 
                      type="submit"
                      disabled={!inputValue.trim()}
                      className="p-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-xl transition-all disabled:opacity-50 disabled:grayscale shrink-0 shadow-lg shadow-purple-500/20"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </form>
                )}
                {showEmojiPicker && !isRecording && (
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
      <UserActionModal 
        isOpen={!!selectedUserAction}
        onClose={() => setSelectedUserAction(null)}
        targetUser={selectedUserAction}
      />
    </>
  );
};

export default GlobalChatBubble;
