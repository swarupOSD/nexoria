import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Send, ArrowLeft, Search, User as UserIcon, Phone, Video } from 'lucide-react';
import CallOverlay from '../components/CallOverlay';
import { useGetFriendsListQuery } from '../features/api/friendApiSlice';
import toast from 'react-hot-toast';

let socket;

const Messages = () => {
  const { user, token } = useSelector((state) => state.auth);
  const [searchParams, setSearchParams] = useSearchParams();
  const targetUserId = searchParams.get('user');

  const { data: friendsList, isLoading: loadingFriends } = useGetFriendsListQuery(undefined, {
    skip: !user
  });

  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [activeChat, setActiveChat] = useState(null); // The user object we are chatting with
  const messagesEndRef = useRef(null);

  // Call State
  const [callData, setCallData] = useState(null);
  const [isReceivingCall, setIsReceivingCall] = useState(false);
  const [callerSignal, setCallerSignal] = useState(null);
  const [callerInfo, setCallerInfo] = useState(null);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  useEffect(() => {
    if (!user) return;
    
    if (!socket) {
      socket = io(import.meta.env.VITE_API_URL || '', {
        auth: { token }
      });
    }

    socket.emit('joinDMRoom');
    socket.emit('getConversations');

    const handleConversationsList = (list) => {
      setConversations(list);
    };

    const handleConversationMessages = ({ receiverId, messages: msgs }) => {
      if (activeChat && activeChat._id === receiverId) {
        setMessages(msgs);
        scrollToBottom();
      }
    };

    const handleNewDirectMessage = (msg) => {
      // If message belongs to active chat, append it
      if (
        activeChat && 
        (msg.sender._id === activeChat._id || (msg.sender._id === user._id && msg.conversationId === activeChat.conversationId))
      ) {
        setMessages((prev) => [...prev, msg]);
        scrollToBottom();
      }
      
      // Refresh conversations list
      socket.emit('getConversations');
    };

    const handleIncomingCall = (data) => {
      setIsReceivingCall(true);
      setCallerInfo({ from: data.from, name: data.name });
      setCallerSignal(data.signal);
      setCallData({ type: data.type });
    };

    socket.on('conversationsList', handleConversationsList);
    socket.on('conversationMessages', handleConversationMessages);
    socket.on('newDirectMessage', handleNewDirectMessage);
    socket.on('incomingCall', handleIncomingCall);
    socket.on('dmError', (err) => toast.error(err.message));

    return () => {
      socket.off('conversationsList', handleConversationsList);
      socket.off('conversationMessages', handleConversationMessages);
      socket.off('newDirectMessage', handleNewDirectMessage);
      socket.off('incomingCall', handleIncomingCall);
      socket.off('dmError');
    };
  }, [user, token, activeChat]);

  // When URL param changes or friends load, set active chat
  useEffect(() => {
    if (targetUserId && friendsList) {
      const friend = friendsList.find(f => f._id === targetUserId);
      if (friend) {
        setActiveChat(friend);
        socket?.emit('getConversationMessages', friend._id);
      }
    }
  }, [targetUserId, friendsList]);


  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputValue.trim() || !activeChat) return;

    socket.emit('sendDirectMessage', {
      receiverId: activeChat._id,
      text: inputValue
    });
    setInputValue('');
  };

  const startCall = (type) => {
    if (!activeChat) return;
    setIsReceivingCall(false);
    setCallData({ type });
  };

  if (!user) return <div className="p-10 text-center text-white">Please login to view messages.</div>;

  return (
    <>
    <div className="flex h-[calc(100vh-80px)] mt-20 max-w-6xl mx-auto bg-slate-900 rounded-2xl overflow-hidden border border-slate-800">
      
      {/* Sidebar - Friends & Conversations */}
      <div className={`w-full md:w-80 flex-col border-r border-slate-800 ${activeChat ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 border-b border-slate-800">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <MessageCircle className="text-purple-500" /> Messages
          </h2>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {loadingFriends ? (
            <div className="p-4 text-center text-slate-500">Loading...</div>
          ) : (
            <div className="p-2 space-y-1">
              <div className="text-xs font-bold text-slate-500 uppercase px-2 mb-2 mt-2">Friends</div>
              {friendsList?.length === 0 && <div className="px-2 text-sm text-slate-500">No friends yet. Add friends from global chat!</div>}
              {friendsList?.map(friend => (
                <button
                  key={friend._id}
                  onClick={() => {
                    setSearchParams({ user: friend._id });
                  }}
                  className={`w-full flex items-center gap-3 p-2 rounded-xl transition-colors ${activeChat?._id === friend._id ? 'bg-purple-600/20 text-white' : 'hover:bg-slate-800 text-slate-300'}`}
                >
                  <img src={friend.profileImage?.startsWith('http') ? friend.profileImage : `${import.meta.env.VITE_API_URL || ''}/uploads/avatars/${friend.profileImage || 'default.jpg'}`} className="w-10 h-10 rounded-full object-cover" />
                  <div className="text-left flex-1">
                    <div className="font-semibold">{friend.name}</div>
                    <div className="text-xs text-slate-500">@{friend.username}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className={`flex-1 flex-col bg-slate-900 ${!activeChat ? 'hidden md:flex' : 'flex'}`}>
        {activeChat ? (
          <>
            {/* Header */}
            <div className="p-4 border-b border-slate-800 flex items-center gap-4">
              <button className="md:hidden text-slate-400 hover:text-white" onClick={() => { setActiveChat(null); setSearchParams({}); }}>
                <ArrowLeft className="w-6 h-6" />
              </button>
              <img src={activeChat.profileImage?.startsWith('http') ? activeChat.profileImage : `${import.meta.env.VITE_API_URL || ''}/uploads/avatars/${activeChat.profileImage || 'default.jpg'}`} className="w-10 h-10 rounded-full object-cover" />
              <div>
                <h3 className="font-bold text-white">{activeChat.name}</h3>
                <span className="text-xs text-slate-400">@{activeChat.username}</span>
              </div>
              
              <div className="flex-1" />
              
              <button onClick={() => startCall('audio')} className="p-2.5 text-slate-300 hover:text-green-500 bg-slate-800 hover:bg-slate-700 rounded-full transition-colors hidden md:block">
                <Phone className="w-5 h-5" />
              </button>
              <button onClick={() => startCall('video')} className="p-2.5 text-slate-300 hover:text-blue-500 bg-slate-800 hover:bg-slate-700 rounded-full transition-colors">
                <Video className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg, idx) => {
                const isMe = msg.sender._id === user._id;
                return (
                  <div key={msg._id || idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] rounded-2xl px-4 py-2 text-sm ${isMe ? 'bg-purple-600 text-white rounded-tr-sm' : 'bg-slate-800 text-slate-200 rounded-tl-sm'}`}>
                      {msg.text}
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 bg-slate-800 border-t border-slate-700">
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <input 
                  type="text" 
                  value={inputValue}
                  onChange={e => setInputValue(e.target.value)}
                  placeholder={`Message ${activeChat.name}...`}
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-purple-500"
                />
                <button type="submit" disabled={!inputValue.trim()} className="bg-purple-600 hover:bg-purple-500 text-white p-3 rounded-xl disabled:opacity-50 transition-all">
                  <Send className="w-5 h-5" />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
            <MessageCircle className="w-16 h-16 mb-4 opacity-20" />
            <p>Select a friend to start chatting</p>
          </div>
        )}
      </div>

    </div>
      
      {/* Call Overlay UI */}
      {callData && (
        <CallOverlay 
          socket={socket} 
          user={user} 
          partner={{ socketId: activeChat ? activeChat._id : callerInfo?.from }} 
          roomData={{ teamCode: user._id }} // required prop fallback
          callType={callData.type}
          isReceivingCall={isReceivingCall}
          callerSignal={callerSignal}
          callerInfo={callerInfo}
          onClose={() => {
            setCallData(null);
            setIsReceivingCall(false);
          }}
        />
      )}
    </>
  );
};

export default Messages;
