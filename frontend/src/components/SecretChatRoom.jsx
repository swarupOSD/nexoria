import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Send, Image as ImageIcon, X, Trash2, Edit2, Check, ShieldAlert, Users, LogOut, Copy, Music, Play, Pause, Info, Phone, Video, Smile, Mic, Square } from 'lucide-react';
import EmojiPicker from 'emoji-picker-react';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import MusicShareModal from './MusicShareModal';
import CallOverlay from './CallOverlay';
import UserActionModal from './UserActionModal';

const SecretChatRoom = ({ socket, roomData, onLeave }) => {
  const { user } = useSelector(state => state.auth);
  const [messages, setMessages] = useState([]);
  const [participants, setParticipants] = useState(roomData.participants || []);
  const [inputValue, setInputValue] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [isMusicModalOpen, setIsMusicModalOpen] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [playingAudioId, setPlayingAudioId] = useState(null);
  
  // Call States
  const [activeCallType, setActiveCallType] = useState(null); // 'video' | 'audio' | null
  const [isReceivingCall, setIsReceivingCall] = useState(false);
  const [callerSignal, setCallerSignal] = useState(null);
  const [callerInfo, setCallerInfo] = useState(null);

  // Voice Recording States
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recordingTimerRef = useRef(null);
  
  // User Action Modal
  const [selectedUserAction, setSelectedUserAction] = useState(null);

  const audioRefs = useRef({});
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const isOwner = roomData.participants?.[0]?._id === user._id; // First participant is always owner in our setup

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!socket) return;

    socket.on('newPrivateMessage', (msg) => {
      setMessages(prev => [...prev, msg]);
    });

    socket.on('privateMessageEdited', ({ messageId, newContent, senderId }) => {
      setMessages(prev => prev.map(m => m._id === messageId ? { ...m, content: newContent, isEdited: true } : m));
    });

    socket.on('privateMessageDeleted', ({ messageId }) => {
      setMessages(prev => prev.filter(m => m._id !== messageId));
    });

    socket.on('userJoinedPrivateRoom', (userInfo) => {
      setParticipants(prev => {
        if (!prev.find(p => p._id === userInfo._id)) return [...prev, userInfo];
        return prev;
      });
      setMessages(prev => [...prev, { _id: Date.now(), type: 'system', content: `[SYSTEM] ${userInfo.username} connected.` }]);
    });

    socket.on('userLeftPrivateRoom', (userInfo) => {
      setParticipants(prev => prev.filter(p => p._id !== userInfo._id));
      setMessages(prev => [...prev, { _id: Date.now(), type: 'system', content: `[SYSTEM] ${userInfo.username} disconnected.` }]);
    });

    socket.on('incomingCall', ({ signal, from, name, type }) => {
      setCallerSignal(signal);
      setCallerInfo({ from, name });
      setActiveCallType(type);
      setIsReceivingCall(true);
    });

    return () => {
      socket.off('newPrivateMessage');
      socket.off('privateMessageEdited');
      socket.off('privateMessageDeleted');
      socket.off('userJoinedPrivateRoom');
      socket.off('userLeftPrivateRoom');
    };
  }, [socket]);

  const handleSendText = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    socket.emit('sendPrivateMessage', { teamCode: roomData.teamCode, type: 'text', content: inputValue.trim() });
    setInputValue('');
  };

  const handleSendImage = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Convert to base64
    const reader = new FileReader();
    reader.onload = (event) => {
      socket.emit('sendPrivateMessage', { teamCode: roomData.teamCode, type: 'image', content: event.target.result });
    };
    reader.readAsDataURL(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSendMusic = (trackData) => {
    socket.emit('sendPrivateMessage', { teamCode: roomData.teamCode, type: 'music', content: trackData });
  };

  const handlePlayMusic = (msgId) => {
    if (playingAudioId && playingAudioId !== msgId) {
      // Pause currently playing audio
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

  const handleEdit = (id) => {
    if (!editValue.trim()) return;
    socket.emit('editPrivateMessage', { teamCode: roomData.teamCode, messageId: id, newContent: editValue.trim() });
    setEditingId(null);
    setEditValue('');
  };

  const handleDelete = (id) => {
    socket.emit('deletePrivateMessage', { teamCode: roomData.teamCode, messageId: id });
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`, { style: { background: '#000', color: '#4ade80', border: '1px solid #22c55e' }});
  };

  const onEmojiClick = (emojiObject) => {
    setInputValue(prev => prev + emojiObject.emoji);
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
          socket.emit('sendPrivateMessage', { teamCode: roomData.teamCode, type: 'voice', content: base64Audio });
        };
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
      toast.error('Microphone permission denied.');
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

  return (
    <div className="min-h-screen bg-[#000000] text-gray-100 font-sans flex flex-col relative overflow-hidden select-none">
      
      {/* IG Style Header */}
      <div className="bg-[#000000] border-b border-gray-900 p-4 flex items-center justify-between z-10 sticky top-0">
        <div className="flex items-center gap-3">
          <div className="relative">
            {/* Show partner's avatar if there is one, else default */}
            {participants.length > 1 ? (
              <img src={participants.find(p => p._id !== user._id)?.profileImage || '/default-avatar.png'} alt="avatar" className="w-10 h-10 rounded-full object-cover" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center">
                <Users className="w-5 h-5 text-gray-400" />
              </div>
            )}
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-black"></div>
          </div>
          <div>
            <h2 className="text-base font-semibold text-white">
              {participants.length > 1 ? participants.find(p => p._id !== user._id)?.name || 'User' : 'Waiting for partner...'}
            </h2>
            <p className="text-xs text-gray-400">
              {participants.length > 1 ? 'Active now' : 'Room Code: ' + roomData.teamCode}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-4 text-gray-300">
          <Phone 
            className="w-5 h-5 md:w-6 md:h-6 cursor-pointer hover:text-white transition-colors" 
            onClick={() => setActiveCallType('audio')}
          />
          <Video 
            className="w-5 h-5 md:w-6 md:h-6 cursor-pointer hover:text-white transition-colors" 
            onClick={() => setActiveCallType('video')}
          />
          
          <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 mx-2">
            <button 
              onClick={() => copyToClipboard(roomData.teamCode, 'Room Code')}
              className="px-2 py-1 bg-[#262626] hover:bg-[#363636] text-[10px] sm:text-xs rounded-md transition-colors font-mono font-medium flex items-center gap-1"
              title="Copy Code"
            >
              C: {roomData.teamCode} <Copy className="w-3 h-3 opacity-50" />
            </button>
            {isOwner && (
              <button 
                onClick={() => copyToClipboard(roomData.password, 'Password')}
                className="px-2 py-1 bg-[#262626] hover:bg-[#363636] text-[10px] sm:text-xs rounded-md transition-colors font-mono font-medium flex items-center gap-1"
                title="Copy Password"
              >
                P: {roomData.password} <Copy className="w-3 h-3 opacity-50" />
              </button>
            )}
          </div>

          <button onClick={onLeave} className="p-2 hover:bg-[#262626] hover:text-red-500 rounded-full transition-colors" title="Leave Chat">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 z-10 scrollbar-hide">
        {messages.map((msg, idx) => {
          if (msg.type === 'system') {
            return (
              <div key={idx} className="flex justify-center my-4">
                <span className="text-[11px] text-gray-500 font-medium">
                  {msg.content.replace('[SYSTEM] ', '')}
                </span>
              </div>
            );
          }

          const isMe = msg.sender._id === user._id;

          return (
            <div key={msg._id} className={`flex gap-2 ${isMe ? 'flex-row-reverse' : ''} group`}>
              {!isMe && (
                <img 
                  src={msg.sender.profileImage || '/default-avatar.png'} 
                  alt="" 
                  onClick={() => setSelectedUserAction(msg.sender)}
                  className="w-8 h-8 rounded-full object-cover self-end mb-1 cursor-pointer hover:opacity-80 transition-opacity" 
                />
              )}
              
              <div className={`flex flex-col max-w-[70%] ${isMe ? 'items-end' : 'items-start'}`}>
                <span className={`text-[10px] text-gray-500 mb-1 ${isMe ? 'mr-1' : 'ml-1'}`}>
                  {msg.sender.name}
                </span>
                
                <div className={`relative px-4 py-2.5 ${
                    isMe 
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl rounded-br-sm' 
                      : 'bg-[#262626] text-white rounded-2xl rounded-bl-sm'
                  }`}>
                  
                  {editingId === msg._id ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={editValue}
                        onChange={e => setEditValue(e.target.value)}
                        className="bg-transparent text-white outline-none w-full text-sm"
                        autoFocus
                        onKeyDown={(e) => e.key === 'Enter' && handleEdit(msg._id)}
                      />
                      <button onClick={() => handleEdit(msg._id)} className="text-white opacity-80 hover:opacity-100"><Check className="w-4 h-4" /></button>
                      <button onClick={() => setEditingId(null)} className="text-white opacity-80 hover:opacity-100"><X className="w-4 h-4" /></button>
                    </div>
                  ) : (
                    <>
                      {msg.type === 'text' ? (
                        <p className="text-[15px] whitespace-pre-wrap break-words">{msg.content}</p>
                      ) : msg.type === 'image' ? (
                        <img src={msg.content} alt="Media" className="max-w-full rounded-xl" />
                      ) : msg.type === 'music' ? (
                        <div className={`flex items-center gap-3 p-1 rounded-xl min-w-[200px] max-w-[280px] ${isMe ? 'bg-white/10' : 'bg-[#121212]'}`}>
                          <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                            <img src={msg.content.coverImage || '/default-music-cover.jpg'} alt="cover" className="w-full h-full object-cover" />
                            <div 
                              className="absolute inset-0 flex items-center justify-center bg-black/40 cursor-pointer hover:bg-black/60 transition-colors"
                              onClick={() => handlePlayMusic(msg._id)}
                            >
                              {playingAudioId === msg._id ? (
                                <Pause className="w-5 h-5 text-white" />
                              ) : (
                                <Play className="w-5 h-5 text-white ml-1" />
                              )}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0 pr-2">
                            <h4 className="text-sm font-semibold text-white truncate">{msg.content.title}</h4>
                            <p className="text-[11px] text-gray-300 truncate">{msg.content.artist}</p>
                          </div>
                          <audio 
                            ref={el => audioRefs.current[msg._id] = el}
                            src={msg.content.audioUrl} 
                            onEnded={() => setPlayingAudioId(null)}
                            preload="none"
                          />
                        </div>
                      ) : msg.type === 'voice' ? (
                        <div className={`flex items-center gap-3 py-1 px-1 rounded-xl min-w-[180px] ${isMe ? 'text-white' : 'text-white'}`}>
                          <button 
                            onClick={() => handlePlayMusic(msg._id)}
                            className={`w-8 h-8 flex items-center justify-center rounded-full transition-colors shrink-0 ${isMe ? 'bg-white/20 hover:bg-white/30' : 'bg-purple-500/20 hover:bg-purple-500/30'}`}
                          >
                            {playingAudioId === msg._id ? <Square className="w-3.5 h-3.5 fill-current" /> : <div className="w-0 h-0 border-t-4 border-b-4 border-l-6 border-transparent border-l-current ml-1"></div>}
                          </button>
                          <div className="flex-1">
                            <div className={`h-1.5 w-full rounded-full overflow-hidden flex items-center ${isMe ? 'bg-white/20' : 'bg-purple-500/20'}`}>
                              <div className={`h-full w-full animate-pulse opacity-70 ${isMe ? 'bg-white' : 'bg-purple-500'}`}></div>
                            </div>
                          </div>
                          <span className="text-[10px] opacity-80 font-mono">Voice</span>
                          <audio 
                            ref={el => audioRefs.current[msg._id] = el}
                            src={msg.content} 
                            onEnded={() => setPlayingAudioId(null)}
                            preload="none"
                          />
                        </div>
                      ) : null}
                      {msg.isEdited && <span className="text-[10px] opacity-60 mt-1 block">(Edited)</span>}
                      
                      {isMe && msg.type === 'text' && (
                        <div className="absolute top-1/2 -translate-y-1/2 -left-14 hidden group-hover:flex gap-2">
                          <button onClick={() => { setEditingId(msg._id); setEditValue(msg.content); }} className="text-gray-400 hover:text-white"><Edit2 className="w-3.5 h-3.5" /></button>
                          <button onClick={() => handleDelete(msg._id)} className="text-gray-400 hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
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
      <div className="p-4 bg-[#000000] border-t border-gray-900 z-10">
        {isRecording ? (
          <div className="flex items-center justify-between max-w-4xl mx-auto bg-[#262626] rounded-full px-4 py-2 border border-purple-500/30">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-red-400 font-mono text-sm font-bold">{formatTime(recordingTime)}</span>
            </div>
            <div className="flex-1 text-center text-xs text-purple-400 font-medium animate-pulse">
              Recording in Secret Lounge...
            </div>
            <button 
              onClick={stopRecording}
              className="p-2.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white rounded-full transition-all shadow-lg shadow-red-500/20 shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <form onSubmit={handleSendText} className="flex items-center gap-2 max-w-4xl mx-auto">
            
            <input 
              type="file" 
              accept="image/*" 
              ref={fileInputRef} 
              onChange={handleSendImage} 
              className="hidden" 
            />
            
            <div className="flex-1 bg-[#262626] rounded-full flex items-center px-2 py-1.5 border border-transparent focus-within:border-gray-600 transition-colors">
              <button 
                type="button" 
                onClick={() => fileInputRef.current?.click()}
                className="p-2 text-white bg-blue-500 rounded-full hover:bg-blue-600 transition-colors shrink-0"
              >
                <ImageIcon className="w-4 h-4" />
              </button>
              <button 
                type="button" 
                onClick={() => setIsMusicModalOpen(true)}
                className="p-2 ml-1 text-white bg-purple-500 rounded-full hover:bg-purple-600 transition-colors shrink-0"
              >
                <Music className="w-4 h-4" />
              </button>
              <button 
                type="button" 
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="p-2 ml-1 text-gray-400 hover:text-white transition-colors shrink-0"
              >
                <Smile className="w-5 h-5" />
              </button>
              
              <input 
                type="text" 
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Message..."
                className="flex-1 bg-transparent text-white px-3 py-2 outline-none text-[15px]"
              />
              
              <button 
                type="button" 
                onClick={startRecording}
                className="p-2 ml-1 text-pink-400 hover:text-pink-300 transition-colors shrink-0"
              >
                <Mic className="w-5 h-5" />
              </button>
            </div>

            {inputValue.trim() ? (
              <button 
                type="submit"
                className="p-3 text-white font-semibold hover:text-gray-300 transition-colors"
              >
                Send
              </button>
            ) : (
              <div className="p-3 text-white cursor-pointer hover:text-gray-300 transition-colors">
                <Send className="w-6 h-6" />
              </div>
            )}
          </form>
        )}
        
        {showEmojiPicker && (
          <div className="absolute bottom-[80px] left-4 z-50">
            <EmojiPicker 
              onEmojiClick={onEmojiClick} 
              theme="dark"
              searchDisabled={true}
              skinTonesDisabled={true}
              height={300}
              width={320}
            />
          </div>
        )}
      </div>
      
      <MusicShareModal 
        isOpen={isMusicModalOpen} 
        onClose={() => setIsMusicModalOpen(false)} 
        onSelect={handleSendMusic} 
      />

      {activeCallType && (
        <CallOverlay
          socket={socket}
          user={user}
          partner={participants.find(p => p._id !== user._id)}
          roomData={roomData}
          callType={activeCallType}
          isReceivingCall={isReceivingCall}
          callerSignal={callerSignal}
          callerInfo={callerInfo}
          onClose={() => {
            setActiveCallType(null);
            setIsReceivingCall(false);
            setCallerSignal(null);
            setCallerInfo(null);
          }}
        />
      )}

      <UserActionModal 
        isOpen={!!selectedUserAction}
        onClose={() => setSelectedUserAction(null)}
        targetUser={selectedUserAction}
      />
    </div>
  );
};

export default SecretChatRoom;
