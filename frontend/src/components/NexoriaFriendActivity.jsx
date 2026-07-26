import React, { useState, useEffect } from 'react';
import { UserPlus, User, Disc3, Settings, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import { useSelector } from 'react-redux';
import { formatDistanceToNow } from 'date-fns';

const NexoriaFriendActivity = () => {
  const navigate = useNavigate();
  const socket = useSocket();
  const { user } = useSelector(state => state.auth);
  
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!socket || !user) return;

    // Request initial state on mount
    socket.emit('request_friend_activity');

    // Handle initial state load
    const handleInitialActivity = (data) => {
      setFriends(data);
      setLoading(false);
    };

    // Handle real-time updates
    const handleFriendUpdate = (updatedFriend) => {
      setFriends(prev => {
        const exists = prev.find(f => f.userId === updatedFriend.userId);
        if (exists) {
          return prev.map(f => f.userId === updatedFriend.userId ? { ...f, ...updatedFriend } : f);
        }
        return [updatedFriend, ...prev];
      });
    };

    socket.on('initial_friend_activity', handleInitialActivity);
    socket.on('friend_music_update', handleFriendUpdate);

    return () => {
      socket.off('initial_friend_activity', handleInitialActivity);
      socket.off('friend_music_update', handleFriendUpdate);
    };
  }, [socket, user]);

  return (
    <div className="flex flex-col h-full bg-[#0F0F23] p-2 pl-0 text-[#94A3B8]">
      <div className="bg-[#0F0F23] rounded-lg h-full flex flex-col pt-4">
        {/* Header */}
        <div className="flex items-center justify-between px-4 pb-4">
          <h2 className="text-white font-bold tracking-wide">Friend Activity</h2>
          <div className="flex items-center gap-2">
            <button className="hover:text-white transition-colors p-1" title="Add Friends">
              <UserPlus className="w-4 h-4" />
            </button>
            <button className="hover:text-white transition-colors p-1 hidden lg:block" title="Settings">
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Info Text */}
        <div className="px-4 pb-4 text-xs font-medium leading-relaxed border-b border-white/10">
          Let friends and followers on Nexoria see what you're listening to. 
        </div>

        {/* Friends List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar px-2 py-2">
          {loading ? (
             <div className="flex justify-center items-center h-20">
               <Loader2 className="w-5 h-5 animate-spin text-[#1ed760]" />
             </div>
          ) : friends.length === 0 ? (
             <div className="p-4 text-center text-xs opacity-70">
               You don't have any friends yet, or none of them are online.
             </div>
          ) : (
            friends.map((friend) => (
              <div key={friend.userId} className="flex gap-3 p-2 rounded-md hover:bg-white/5 transition-colors group cursor-pointer">
                {/* Avatar */}
                <div className="relative shrink-0">
                  <div className="w-10 h-10 rounded-full bg-[#4338CA] overflow-hidden flex items-center justify-center">
                    {friend.avatar && !friend.avatar.includes('default.jpg') ? (
                      <img src={friend.avatar} alt={friend.name} className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-5 h-5 text-white/50" />
                    )}
                  </div>
                  {/* Online/Listening indicator */}
                  {friend.isListening && (
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#0F0F23] rounded-full flex items-center justify-center">
                      <div className="w-2.5 h-2.5 bg-[#1ed760] rounded-full shadow-[0_0_8px_rgba(30,215,96,0.8)]"></div>
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="flex flex-col min-w-0 flex-1 justify-center">
                  <div className="flex items-center justify-between gap-2">
                    <span className={`text-sm truncate font-medium ${friend.isListening ? 'text-white' : 'text-[#94A3B8] group-hover:text-white'}`}>
                      {friend.name}
                    </span>
                    <span className="text-[10px] shrink-0 opacity-70">
                      {friend.isListening ? 'now' : friend.updatedAt ? formatDistanceToNow(new Date(friend.updatedAt)) : ''}
                    </span>
                  </div>
                  
                  {friend.isListening || friend.currentTrack ? (
                    <>
                      <div className="text-xs truncate flex items-center gap-1 mt-0.5">
                        <span className="truncate hover:underline hover:text-white">{friend.currentTrack}</span>
                      </div>
                      <div className="text-[11px] truncate mt-0.5 flex items-center gap-1">
                        <Disc3 className="w-3 h-3 shrink-0" />
                        <span className="truncate hover:underline hover:text-white">{friend.artist}</span>
                      </div>
                    </>
                  ) : (
                    <div className="text-xs mt-1 italic opacity-50 truncate">Not listening to anything</div>
                  )}
                </div>
              </div>
            ))
          )}

          {/* Find Friends Button */}
          <div className="px-2 mt-6">
            <button className="w-full py-3 rounded-full border border-white/30 text-white font-bold text-sm hover:scale-105 hover:border-white transition-all active:scale-95">
              Find friends
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NexoriaFriendActivity;
