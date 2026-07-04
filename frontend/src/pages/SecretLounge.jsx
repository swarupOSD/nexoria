import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, ShieldAlert, LogIn, Plus, AlertTriangle, EyeOff, Hash, KeyRound, ArrowLeft } from 'lucide-react';
import { useSelector } from 'react-redux';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';
import SecretChatRoom from '../components/SecretChatRoom';
import { useNavigate } from 'react-router-dom';

const SecretLounge = () => {
  const { user } = useSelector((state) => state.auth);
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
    <div className="min-h-screen bg-black text-green-500 font-mono flex items-center justify-center p-4 relative overflow-hidden select-none">
      {/* Glitchy Hacker Background */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at center, #00ff00 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
      <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black pointer-events-none"></div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg bg-black/80 backdrop-blur-md border border-green-500/30 rounded-lg shadow-[0_0_30px_rgba(34,197,94,0.15)] overflow-hidden relative z-10"
      >
        {/* Terminal Header */}
        <div className="bg-green-950/40 border-b border-green-500/30 p-3 flex items-center gap-3">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
            <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
          </div>
          <span className="text-green-400 text-xs tracking-widest uppercase">root@nexoria:~/secret-lounge</span>
        </div>

        <div className="p-6 sm:p-8">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-green-500/10 border border-green-500/50 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(34,197,94,0.3)]">
              <EyeOff className="w-10 h-10 text-green-400" />
            </div>
          </div>
          
          <h1 className="text-3xl font-black text-center text-green-400 mb-2 uppercase tracking-widest drop-shadow-[0_0_8px_rgba(34,197,94,0.6)]">
            Secret Lounge
          </h1>
          <p className="text-green-600/80 text-center text-sm mb-8">Zero trace. Ephemeral. Secure.</p>

          {!hasAcceptedTerms ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div className="bg-green-950/30 border border-green-500/30 rounded p-4 space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <ShieldAlert className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                  <p className="text-green-300"><strong>NO TRACE LEFT:</strong> Messages and files sent here are NOT saved in any database. They exist only in your browser's live memory.</p>
                </div>
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
                  <p className="text-green-300"><strong>OWNER CONTROL:</strong> If the room creator leaves or disconnects, the room instantly self-destructs and everyone is kicked out.</p>
                </div>
                <div className="flex items-start gap-3">
                  <Lock className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                  <p className="text-green-300"><strong>MODERATION FREE:</strong> We cannot recover chats from here. Use at your own risk. Respect privacy.</p>
                </div>
              </div>
              
              <button 
                onClick={() => setHasAcceptedTerms(true)}
                className="w-full py-3 bg-green-500/10 hover:bg-green-500/20 border border-green-500 text-green-400 font-bold tracking-widest uppercase transition-all shadow-[0_0_15px_rgba(34,197,94,0.2)] hover:shadow-[0_0_25px_rgba(34,197,94,0.4)]"
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
                    className="w-full flex items-center justify-center gap-3 py-4 bg-green-500/20 hover:bg-green-500/30 border border-green-500 text-green-400 font-bold tracking-widest uppercase transition-all"
                  >
                    <Plus className="w-5 h-5" /> Initialize New Room
                  </button>
                  
                  <div className="relative flex items-center py-2">
                    <div className="flex-grow border-t border-green-900/50"></div>
                    <span className="flex-shrink-0 mx-4 text-green-800 text-xs">OR</span>
                    <div className="flex-grow border-t border-green-900/50"></div>
                  </div>

                  <button 
                    onClick={() => setIsJoining(true)}
                    className="w-full flex items-center justify-center gap-3 py-4 bg-transparent hover:bg-green-950/50 border border-green-700 text-green-600 hover:text-green-400 font-bold tracking-widest uppercase transition-all"
                  >
                    <LogIn className="w-5 h-5" /> Connect to Node
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
                    className="text-green-700 hover:text-green-400 flex items-center gap-1 text-xs uppercase tracking-widest mb-4 transition-colors"
                  >
                    <ArrowLeft className="w-3 h-3" /> Go Back
                  </button>
                  <form onSubmit={handleJoinRoom} className="space-y-4">
                    <div>
                      <label className="block text-xs text-green-600 uppercase tracking-widest mb-1.5">Team Code</label>
                      <div className="relative">
                        <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-700" />
                        <input 
                          type="text" 
                          value={joinCode}
                          onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                          placeholder="e.g. A1B2C3"
                          className="w-full bg-black border border-green-800 focus:border-green-500 text-green-400 p-3 pl-10 outline-none transition-colors uppercase tracking-widest"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-green-600 uppercase tracking-widest mb-1.5">Password</label>
                      <div className="relative">
                        <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-700" />
                        <input 
                          type="password" 
                          value={joinPassword}
                          onChange={(e) => setJoinPassword(e.target.value)}
                          placeholder="Enter 8-char password"
                          className="w-full bg-black border border-green-800 focus:border-green-500 text-green-400 p-3 pl-10 outline-none transition-colors"
                          required
                        />
                      </div>
                    </div>
                    <button 
                      type="submit"
                      className="w-full mt-2 py-4 bg-green-500/20 hover:bg-green-500/30 border border-green-500 text-green-400 font-bold tracking-widest uppercase transition-all"
                    >
                      Authenticate
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
