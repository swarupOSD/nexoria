import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Send, Image as ImageIcon, X, Trash2, Edit2, Check, ShieldAlert, Users, LogOut, Copy } from 'lucide-react';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';

const SecretChatRoom = ({ socket, roomData, onLeave }) => {
  const { user } = useSelector(state => state.auth);
  const [messages, setMessages] = useState([]);
  const [participants, setParticipants] = useState(roomData.participants || []);
  const [inputValue, setInputValue] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState('');
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

  return (
    <div className="min-h-screen bg-black text-green-500 font-mono flex flex-col relative overflow-hidden select-none">
      {/* Glitch Background */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at center, #00ff00 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
      
      {/* Header */}
      <div className="bg-black border-b border-green-900/50 p-4 flex flex-col md:flex-row items-center justify-between gap-4 z-10 shadow-[0_4px_30px_rgba(34,197,94,0.1)]">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-green-950 border border-green-500/30 flex items-center justify-center relative">
            <ShieldAlert className="w-6 h-6 text-green-500" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping"></div>
          </div>
          <div>
            <h2 className="text-xl font-black text-green-400 tracking-widest uppercase">Encrypted Node</h2>
            <div className="flex items-center gap-3 text-xs mt-1">
              <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {participants.length} Active</span>
              <span className="text-green-800">|</span>
              <span className="text-red-400 animate-pulse">Zero Trace Active</span>
            </div>
          </div>
        </div>

        {/* Credentials (Only visible to owner, or both can see code) */}
        <div className="flex items-center gap-3 bg-green-950/30 p-2 border border-green-900/50">
          <div className="text-right">
            <div className="flex items-center gap-2 cursor-pointer group" onClick={() => copyToClipboard(roomData.teamCode, 'Team Code')}>
              <span className="text-xs text-green-600 uppercase">Code:</span>
              <span className="font-bold text-green-400 tracking-widest">{roomData.teamCode}</span>
              <Copy className="w-3 h-3 text-green-700 group-hover:text-green-400" />
            </div>
            {isOwner && (
              <div className="flex items-center gap-2 cursor-pointer group mt-1" onClick={() => copyToClipboard(roomData.password, 'Password')}>
                <span className="text-xs text-green-600 uppercase">Pass:</span>
                <span className="font-bold text-green-400 tracking-widest">{roomData.password}</span>
                <Copy className="w-3 h-3 text-green-700 group-hover:text-green-400" />
              </div>
            )}
          </div>
          <button 
            onClick={onLeave}
            className="ml-2 p-2 bg-red-950/30 hover:bg-red-900/50 border border-red-900/50 text-red-500 transition-colors flex flex-col items-center justify-center gap-1"
            title={isOwner ? "Destroy Room" : "Disconnect"}
          >
            <LogOut className="w-4 h-4" />
            <span className="text-[9px] uppercase tracking-wider">{isOwner ? 'Destroy' : 'Leave'}</span>
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 z-10 scrollbar-thin scrollbar-thumb-green-900 scrollbar-track-transparent">
        {messages.map((msg, idx) => {
          if (msg.type === 'system') {
            return (
              <div key={idx} className="flex justify-center my-2">
                <span className="text-[10px] text-green-700 tracking-widest uppercase bg-green-950/20 px-3 py-1 border border-green-900/30">
                  {msg.content}
                </span>
              </div>
            );
          }

          const isMe = msg.sender._id === user._id;
          const isMsgOwner = roomData.participants?.[0]?._id === msg.sender._id;

          return (
            <div key={msg._id} className={`flex gap-3 ${isMe ? 'flex-row-reverse' : ''} group`}>
              <div className="relative">
                <img src={msg.sender.profileImage} alt="" className="w-10 h-10 border border-green-800 object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all" />
                {isMsgOwner && <div className="absolute -bottom-1 -right-1 bg-red-600 text-white text-[8px] px-1 font-bold">ROOT</div>}
              </div>
              
              <div className={`flex flex-col max-w-[75%] ${isMe ? 'items-end' : 'items-start'}`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs text-green-600 font-bold">{msg.sender.username}</span>
                </div>
                
                <div className={`relative p-3 border ${isMe ? 'bg-green-950/40 border-green-700 text-green-100' : 'bg-black border-green-900 text-green-400'}`}>
                  {/* Edges styling for hacker vibe */}
                  <div className="absolute -top-[1px] -left-[1px] w-2 h-2 border-t border-l border-green-400"></div>
                  <div className="absolute -bottom-[1px] -right-[1px] w-2 h-2 border-b border-r border-green-400"></div>
                  
                  {editingId === msg._id ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={editValue}
                        onChange={e => setEditValue(e.target.value)}
                        className="bg-black text-green-400 outline-none border-b border-green-700 w-full font-mono text-sm"
                        autoFocus
                        onKeyDown={(e) => e.key === 'Enter' && handleEdit(msg._id)}
                      />
                      <button onClick={() => handleEdit(msg._id)} className="text-green-500 hover:text-green-300"><Check className="w-4 h-4" /></button>
                      <button onClick={() => setEditingId(null)} className="text-red-500 hover:text-red-300"><X className="w-4 h-4" /></button>
                    </div>
                  ) : (
                    <>
                      {msg.type === 'text' ? (
                        <p className="text-sm whitespace-pre-wrap font-mono break-words">{msg.content}</p>
                      ) : (
                        <img src={msg.content} alt="Encrypted Media" className="max-w-full rounded border border-green-900/50 opacity-80 hover:opacity-100 transition-opacity" />
                      )}
                      {msg.isEdited && <span className="text-[9px] text-green-700 ml-2 uppercase">(Edited)</span>}
                      
                      {isMe && msg.type === 'text' && (
                        <div className="absolute top-1/2 -translate-y-1/2 -left-16 hidden group-hover:flex gap-1 bg-black p-1 border border-green-900">
                          <button onClick={() => { setEditingId(msg._id); setEditValue(msg.content); }} className="p-1 text-green-700 hover:text-green-400"><Edit2 className="w-3 h-3" /></button>
                          <button onClick={() => handleDelete(msg._id)} className="p-1 text-green-700 hover:text-red-500"><Trash2 className="w-3 h-3" /></button>
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
      <form onSubmit={handleSendText} className="bg-black border-t border-green-900/50 p-4 z-10 flex gap-3">
        <input 
          type="file" 
          accept="image/*" 
          ref={fileInputRef} 
          onChange={handleSendImage} 
          className="hidden" 
        />
        <button 
          type="button" 
          onClick={() => fileInputRef.current?.click()}
          className="p-3 bg-green-950/30 border border-green-900 hover:bg-green-900/50 text-green-500 transition-colors"
          title="Send Encrypted Image"
        >
          <ImageIcon className="w-5 h-5" />
        </button>
        <div className="flex-1 relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-green-700 font-bold">$</span>
          <input 
            type="text" 
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Encrypt message..."
            className="w-full bg-black border border-green-900 focus:border-green-500 text-green-400 p-3 pl-8 outline-none font-mono transition-colors"
          />
        </div>
        <button 
          type="submit"
          className="px-6 bg-green-600 hover:bg-green-500 text-black font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};

export default SecretChatRoom;
