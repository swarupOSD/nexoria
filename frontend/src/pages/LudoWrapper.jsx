import React, { useState, useEffect } from 'react';
import { useSocket } from '../context/SocketContext';
import { useSelector } from 'react-redux';
import GameRoom from '../components/game/GameRoom';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

const LudoWrapper = () => {
  const socket = useSocket();
  const { user } = useSelector((state) => state.auth);
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [joined, setJoined] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!socket || !roomId || !user) return;

    // Join the game
    socket.emit('joinGame', {
      roomId,
      playerName: user.name,
      // Color will be auto-assigned by backend if undefined
    });

    const handleJoinSuccess = () => {
      setJoined(true);
    };

    const handleError = (err) => {
      setError(err.message);
    };

    socket.on('joinSuccess', handleJoinSuccess);
    socket.on('error', handleError);

    return () => {
      socket.off('joinSuccess', handleJoinSuccess);
      socket.off('error', handleError);
      socket.emit('leaveGame');
    };
  }, [socket, roomId, user]);

  if (error) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex flex-col items-center justify-center text-white p-4">
        <div className="bg-red-500/10 border border-red-500/50 p-6 rounded-xl max-w-md w-full text-center backdrop-blur-md">
          <h2 className="text-2xl font-bold text-red-400 mb-4">Error Joining Game</h2>
          <p className="mb-6">{error}</p>
          <button
            onClick={() => navigate('/snehashis-games')}
            className="px-6 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors flex items-center justify-center mx-auto gap-2"
          >
            <ArrowLeft size={18} /> Back to Games
          </button>
        </div>
      </div>
    );
  }

  if (!joined) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-purple-300 font-medium animate-pulse">Joining Game Room...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F172A] text-white">
      <div className="absolute top-4 left-4 z-50">
        <button
          onClick={() => navigate('/snehashis-games')}
          className="p-2 bg-black/40 hover:bg-black/60 rounded-full backdrop-blur-md transition-colors border border-white/10 text-white flex items-center justify-center group"
          title="Leave Game"
        >
          <ArrowLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
        </button>
      </div>
      <GameRoom socket={socket} roomId={roomId} playerName={user?.name || 'Guest'} onLeave={() => navigate('/snehashis-games')} />
    </div>
  );
};

export default LudoWrapper;
