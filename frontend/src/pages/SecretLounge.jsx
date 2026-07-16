import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, ShieldAlert, LogIn, Plus, AlertTriangle, EyeOff, Hash, KeyRound, ArrowLeft } from 'lucide-react';
import { useSelector } from 'react-redux';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';
import SecretChatRoom from '../components/SecretChatRoom';
import { useNavigate } from 'react-router-dom';

const SecretLounge = () => {
  const { user, token } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  
  const [socket, setSocket] = useState(null);
  const [inRoom, setInRoom] = useState(false);
  const [roomData, setRoomData] = useState(null);
  const [joinCode, setJoinCode] = useState('');
  const [joinPassword, setJoinPassword] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [hasAcceptedTerms, setHasAcceptedTerms] = useState(false);

  useEffect(() => {
    if (!user) {
      toast.error('You must be logged in to access the Secret Lounge.');
      navigate('/login');
      return;
    }


    const newSocket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
      withCredentials: true,
      auth: { token }
    });
    setSocket(newSocket);

    newSocket.on('privateRoomCreated', (data) => {
      setRoomData(data);
      setInRoom(true);
      toast.success('Room created successfully. You are the Owner.');
    });

    newSocket.on('privateRoomJoined', (data) => {
      setRoomData(data);
      setInRoom(true);
      toast.success('Joined Private Room successfully.');
    });

    newSocket.on('privateChatError', ({ message }) => {
      toast.error(message);
    });

    newSocket.on('roomDestroyed', ({ message }) => {
      toast.error(message, { duration: 5000, icon: '💥' });
      setInRoom(false);
      setRoomData(null);
    });

    return () => {
      newSocket.emit('leavePrivateRoom');
      newSocket.disconnect();
    };
  }, [user, navigate]);

  const handleCreateRoom = () => {
    if (socket) socket.emit('createPrivateRoom');
  };

  const handleJoinRoom = (e) => {
    e.preventDefault();
    if (!joinCode || !joinPassword) return toast.error('Code and Password required.');
    if (socket) socket.emit('joinPrivateRoom', { teamCode: joinCode, password: joinPassword });
  };

  if (inRoom && roomData) {
    return (
      <SecretChatRoom 
        socket={socket} 
        roomData={roomData} 
        onLeave={() => {
          socket.emit('leavePrivateRoom');
          setInRoom(false);
          setRoomData(null);
        }} 
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#000000] text-gray-100 font-sans flex items-center justify-center p-4 relative overflow-hidden select-none">
      {/* Clean Dark Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#121212] via-black to-black pointer-events-none"></div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg bg-[#000000] border border-gray-800 rounded-3xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] overflow-hidden relative z-10"
      >
        {/* Sleek Header */}
        <div className="border-b border-gray-800 p-4 flex items-center justify-center relative">
          <span className="font-semibold text-sm">Direct Messages</span>
        </div>

        <div className="p-6 sm:p-8">
          <div className="flex justify-center mb-6">
            <div className="w-24 h-24 bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-500 rounded-full p-[2px]">
              <div className="w-full h-full bg-black rounded-full flex items-center justify-center">
                <ShieldAlert className="w-10 h-10 text-white" />
              </div>
            </div>
          </div>
          
          <h1 className="text-2xl font-bold text-center text-white mb-2">
            Secret Lounge
          </h1>
          <p className="text-gray-400 text-center text-sm mb-8">Zero trace. Ephemeral. Secure.</p>

          {!hasAcceptedTerms ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div className="bg-[#121212] border border-gray-800 rounded-2xl p-5 space-y-4 text-sm">
                <div className="flex items-start gap-3">
                  <ShieldAlert className="w-5 h-5 text-pink-500 shrink-0 mt-0.5" />
                  <p className="text-gray-300"><strong className="text-white">No Trace Left:</strong> Messages and files sent here are NOT saved. They exist only in your browser's memory.</p>
                </div>
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
                  <p className="text-gray-300"><strong className="text-white">Owner Control:</strong> If the creator leaves, the room instantly self-destructs.</p>
                </div>
                <div className="flex items-start gap-3">
                  <Lock className="w-5 h-5 text-purple-500 shrink-0 mt-0.5" />
                  <p className="text-gray-300"><strong className="text-white">Moderation Free:</strong> We cannot recover chats. Use at your own risk. Respect privacy.</p>
                </div>
              </div>
              
              <button 
                onClick={() => setHasAcceptedTerms(true)}
                className="w-full py-3.5 bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90 rounded-full text-white font-semibold transition-all"
              >
                I Accept & Enter
              </button>
            </motion.div>
          ) : (
            <AnimatePresence mode="wait">
              {!isJoining ? (
                <motion.div 
                  key="actions"
                  initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <button 
                    onClick={handleCreateRoom}
                    className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#262626] hover:bg-[#363636] rounded-full text-white font-semibold transition-all"
                  >
                    <Plus className="w-5 h-5" /> Initialize New Room
                  </button>
                  
                  <div className="relative flex items-center py-2">
                    <div className="flex-grow border-t border-gray-800"></div>
                    <span className="flex-shrink-0 mx-4 text-gray-500 text-xs font-semibold uppercase">OR</span>
                    <div className="flex-grow border-t border-gray-800"></div>
                  </div>

                  <button 
                    onClick={() => setIsJoining(true)}
                    className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90 rounded-full text-white font-semibold transition-all"
                  >
                    <LogIn className="w-5 h-5" /> Connect to Room
                  </button>
                </motion.div>
              ) : (
                <motion.div 
                  key="join-form"
                  initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                  className="space-y-4"
                >
                  <button 
                    onClick={() => setIsJoining(false)}
                    className="text-gray-400 hover:text-white flex items-center gap-1 text-sm font-medium mb-4 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" /> Go Back
                  </button>
                  <form onSubmit={handleJoinRoom} className="space-y-4">
                    <div>
                      <div className="relative">
                        <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input 
                          type="text" 
                          value={joinCode}
                          onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                          placeholder="Team Code"
                          className="w-full bg-[#121212] border border-gray-800 focus:border-gray-600 rounded-xl text-white p-3.5 pl-11 outline-none transition-colors uppercase tracking-widest text-sm"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <div className="relative">
                        <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input 
                          type="password" 
                          value={joinPassword}
                          onChange={(e) => setJoinPassword(e.target.value)}
                          placeholder="Password"
                          className="w-full bg-[#121212] border border-gray-800 focus:border-gray-600 rounded-xl text-white p-3.5 pl-11 outline-none transition-colors text-sm"
                          required
                        />
                      </div>
                    </div>
                    <button 
                      type="submit"
                      className="w-full mt-2 py-3.5 bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90 rounded-full text-white font-semibold transition-all"
                    >
                      Connect
                    </button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default SecretLounge;
