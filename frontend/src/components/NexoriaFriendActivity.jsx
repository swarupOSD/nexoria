import React from 'react';
import { UserPlus, User, Disc3, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MOCK_FRIENDS = [
  {
    id: 1,
    name: 'Alex Johnson',
    avatar: 'https://i.pravatar.cc/150?u=1',
    currentTrack: 'Midnight City',
    artist: 'M83',
    album: 'Hurry Up, We\'re Dreaming',
    isListening: true,
    timeAgo: 'now',
  },
  {
    id: 2,
    name: 'Sarah Williams',
    avatar: 'https://i.pravatar.cc/150?u=2',
    currentTrack: 'Blinding Lights',
    artist: 'The Weeknd',
    album: 'After Hours',
    isListening: true,
    timeAgo: 'now',
  },
  {
    id: 3,
    name: 'John Doe',
    avatar: 'https://i.pravatar.cc/150?u=3',
    currentTrack: 'Bohemian Rhapsody',
    artist: 'Queen',
    album: 'A Night at the Opera',
    isListening: false,
    timeAgo: '2 hrs',
  },
  {
    id: 4,
    name: 'Emily Chen',
    avatar: null,
    currentTrack: 'Levitating',
    artist: 'Dua Lipa',
    album: 'Future Nostalgia',
    isListening: false,
    timeAgo: '4 hrs',
  }
];

const NexoriaFriendActivity = () => {
  const navigate = useNavigate();

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
          {MOCK_FRIENDS.map((friend) => (
            <div key={friend.id} className="flex gap-3 p-2 rounded-md hover:bg-white/5 transition-colors group cursor-pointer">
              {/* Avatar */}
              <div className="relative shrink-0">
                <div className="w-10 h-10 rounded-full bg-[#4338CA] overflow-hidden flex items-center justify-center">
                  {friend.avatar ? (
                    <img src={friend.avatar} alt={friend.name} className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-5 h-5 text-white/50" />
                  )}
                </div>
                {/* Online/Listening indicator */}
                {friend.isListening && (
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#0F0F23] rounded-full flex items-center justify-center">
                    <div className="w-2.5 h-2.5 bg-green-500 rounded-full"></div>
                  </div>
                )}
              </div>

              {/* Details */}
              <div className="flex flex-col min-w-0 flex-1 justify-center">
                <div className="flex items-center justify-between gap-2">
                  <span className={`text-sm truncate font-medium ${friend.isListening ? 'text-white' : 'text-[#94A3B8] group-hover:text-white'}`}>
                    {friend.name}
                  </span>
                  <span className="text-[10px] shrink-0">{friend.timeAgo}</span>
                </div>
                
                <div className="text-xs truncate flex items-center gap-1 mt-0.5">
                  <span className="truncate hover:underline hover:text-white">{friend.currentTrack}</span>
                </div>
                <div className="text-[11px] truncate mt-0.5 flex items-center gap-1">
                  <Disc3 className="w-3 h-3 shrink-0" />
                  <span className="truncate hover:underline hover:text-white">{friend.artist}</span>
                </div>
              </div>
            </div>
          ))}

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
