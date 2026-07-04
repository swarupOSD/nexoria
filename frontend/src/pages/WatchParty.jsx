import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { io } from 'socket.io-client';
import { useSelector } from 'react-redux';
import { useGetMovieBySlugQuery } from '../features/movie/movieApiSlice';
import { Helmet } from 'react-helmet-async';
import { Users, MessageSquare, Send, Play, Pause, AlertCircle, ChevronLeft, Video, Copy } from 'lucide-react';
import { toast } from 'react-hot-toast';

const WatchParty = () => {
  const { slug } = useParams(); // Using slug as roomId for simplicity here
  const navigate = useNavigate();
  const { user } = useSelector(state => state.auth);
  
  const { data: res, isLoading } = useGetMovieBySlugQuery(slug);
  const movie = res?.data;

  const [socket, setSocket] = useState(null);
  const [roomData, setRoomData] = useState({ users: [], isPlaying: false, hostId: null });
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const videoRef = useRef(null);
  const chatEndRef = useRef(null);
  const isHost = roomData.hostId === user?._id;

  // Initialize socket
  useEffect(() => {
    if (!user || !movie) return;

    const newSocket = io(import.meta.env.VITE_API_URL || 'https://nexoria-backend-mt5e.onrender.com', {
      withCredentials: true
    });

    setSocket(newSocket);

    newSocket.on('connect', () => {
      newSocket.emit('join-watch-party', { roomId: `party-${movie._id}`, user });
    });

    newSocket.on('watch-party-update', (data) => {
      setRoomData({
        users: data.users,
        isPlaying: data.isPlaying,
        hostId: data.hostId
      });
      
      // Sync video time if newly joined
      if (videoRef.current && Math.abs(videoRef.current.currentTime - data.videoTime) > 2) {
        videoRef.current.currentTime = data.videoTime;
      }
    });

    newSocket.on('sync-video-client', (data) => {
      if (videoRef.current) {
        if (Math.abs(videoRef.current.currentTime - data.videoTime) > 2) {
          videoRef.current.currentTime = data.videoTime;
        }
        if (data.isPlaying && videoRef.current.paused) {
          videoRef.current.play().catch(e => console.error(e));
        } else if (!data.isPlaying && !videoRef.current.paused) {
          videoRef.current.pause();
        }
      }
    });

    newSocket.on('chat-message', (msg) => {
      setMessages(prev => [...prev, msg]);
    });

    return () => {
      newSocket.emit('leave-watch-party', { roomId: `party-${movie._id}` });
      newSocket.disconnect();
    };
  }, [user, movie]);

  // Auto scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleVideoStateChange = () => {
    if (!socket || !videoRef.current || !isHost) return;

    socket.emit('sync-video', {
      roomId: `party-${movie._id}`,
      videoTime: videoRef.current.currentTime,
      isPlaying: !videoRef.current.paused,
      userId: user._id
    });
  };

  const handleSeek = () => {
    if (!socket || !videoRef.current || !isHost) return;
    
    socket.emit('sync-video', {
      roomId: `party-${movie._id}`,
      videoTime: videoRef.current.currentTime,
      isPlaying: !videoRef.current.paused,
      userId: user._id
    });
  };

  const sendChatMessage = (e) => {
    e.preventDefault();
    if (!chatInput.trim() || !socket) return;

    socket.emit('chat-message', {
      roomId: `party-${movie._id}`,
      message: chatInput,
      user
    });
    setChatInput('');
  };

  const copyInviteLink = () => {
    const link = window.location.href;
    navigator.clipboard.writeText(link);
    toast.success('Invite link copied to clipboard!');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center text-white">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Login Required</h2>
          <p className="text-slate-400 mb-6">You need to be logged in to join a watch party.</p>
          <button onClick={() => navigate('/login')} className="px-6 py-3 bg-purple-600 rounded-xl font-bold">Login Now</button>
        </div>
      </div>
    );
  }

  if (isLoading || !movie) {
    return <div className="min-h-screen bg-[#050505] animate-pulse"></div>;
  }

  return (
    <div className="h-screen bg-[#050505] flex flex-col md:flex-row overflow-hidden text-white font-sans">
      <Helmet>
        <title>Watch Party - {movie.title}</title>
      </Helmet>

      {/* Main Video Area */}
      <div className={`flex-1 flex flex-col relative transition-all duration-300 ${isSidebarOpen ? 'md:mr-80' : ''}`}>
        
        {/* Header */}
        <div className="absolute top-0 left-0 w-full p-4 md:p-6 bg-gradient-to-b from-black/80 to-transparent z-10 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="p-2 bg-black/40 hover:bg-black/60 rounded-full backdrop-blur-md transition-colors border border-white/10">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="font-bold text-lg leading-tight flex items-center gap-2">
                <span className="bg-purple-600 text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-black">LIVE</span>
                Watch Party: {movie.title}
              </h1>
              <p className="text-xs text-slate-400">
                {roomData.users.length} {roomData.users.length === 1 ? 'person' : 'people'} watching
              </p>
            </div>
          </div>
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="md:hidden p-2 bg-purple-600/20 text-purple-400 rounded-lg border border-purple-500/30"
          >
            <MessageSquare className="w-5 h-5" />
          </button>
        </div>

        {/* Video Player */}
        <div className="flex-1 bg-black flex items-center justify-center relative">
          {movie.videoFile || movie.videoUrl ? (
            <video
              ref={videoRef}
              src={movie.videoFile || movie.videoUrl}
              className="w-full h-full max-h-screen object-contain"
              controls={isHost} // Only host gets native controls, others are synced
              onPlay={handleVideoStateChange}
              onPause={handleVideoStateChange}
              onSeeked={handleSeek}
              poster={movie.bannerImage || movie.posterImage}
            />
          ) : (
            <div className="flex flex-col items-center justify-center">
              <Video className="w-16 h-16 text-slate-700 mb-4" />
              <p className="text-slate-500">No video source available.</p>
            </div>
          )}

          {!isHost && (
             <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md border border-white/10 px-4 py-2 rounded-full text-xs font-bold text-amber-400 z-10 flex items-center gap-2 shadow-xl shadow-black/50">
               <AlertCircle className="w-4 h-4" /> You are a viewer. Only the host can play/pause.
             </div>
          )}
        </div>
      </div>

      {/* Sidebar Chat & Users */}
      <div 
        className={`fixed inset-y-0 right-0 w-80 bg-[#0d0d0f] border-l border-white/5 flex flex-col z-20 transition-transform duration-300 transform ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}`}
      >
        <div className="p-4 border-b border-white/5 flex items-center justify-between bg-[#15151a]">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-500" />
            <h2 className="font-bold text-sm">Party Members ({roomData.users.length})</h2>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={copyInviteLink}
              className="p-1.5 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white rounded transition-colors tooltip"
              title="Copy Invite Link"
            >
              <Copy className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setIsSidebarOpen(false)}
              className="md:hidden p-1.5 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white rounded transition-colors"
            >
              <ChevronLeft className="w-4 h-4 rotate-180" />
            </button>
          </div>
        </div>

        {/* Users List (Mini) */}
        <div className="p-4 border-b border-white/5 flex gap-2 overflow-x-auto custom-scrollbar bg-[#0f0f13]">
          {roomData.users.map(u => (
            <div key={u.socketId} className="relative group shrink-0">
              <div className={`w-10 h-10 rounded-full bg-slate-800 border-2 overflow-hidden ${u.isHost ? 'border-amber-500' : 'border-purple-500'}`}>
                {u.avatar ? <img src={u.avatar} alt={u.name} className="w-full h-full object-cover" /> : <span className="flex items-center justify-center h-full font-bold">{u.name?.charAt(0)}</span>}
              </div>
              {u.isHost && (
                <div className="absolute -bottom-1 -right-1 bg-amber-500 w-4 h-4 rounded-full flex items-center justify-center border-2 border-[#0d0d0f]">
                  <StarIcon className="w-2 h-2 text-white fill-white" />
                </div>
              )}
              {/* Tooltip */}
              <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-black text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">
                {u.name} {u.isHost ? '(Host)' : ''}
              </div>
            </div>
          ))}
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
          {messages.map((msg, idx) => (
            <div key={msg.id || idx} className={`flex flex-col ${msg.type === 'system' ? 'items-center my-2' : ''}`}>
              {msg.type === 'system' ? (
                <span className="text-[10px] bg-white/5 px-3 py-1 rounded-full text-slate-400 font-medium">
                  {msg.text}
                </span>
              ) : (
                <div className={`flex items-end gap-2 ${msg.user?._id === user._id ? 'flex-row-reverse' : ''}`}>
                  {msg.user?._id !== user._id && (
                    <div className="w-6 h-6 rounded-full bg-slate-800 overflow-hidden shrink-0 border border-white/10">
                      {msg.user?.avatar ? <img src={msg.user.avatar} className="w-full h-full object-cover"/> : <span className="text-[10px] flex justify-center items-center h-full">{msg.user?.name?.charAt(0)}</span>}
                    </div>
                  )}
                  <div className={`flex flex-col ${msg.user?._id === user._id ? 'items-end' : 'items-start'}`}>
                    {msg.user?._id !== user._id && <span className="text-[10px] text-slate-500 mb-0.5 ml-1">{msg.user?.name}</span>}
                    <div className={`px-4 py-2 rounded-2xl text-sm max-w-[220px] break-words ${
                      msg.user?._id === user._id 
                        ? 'bg-purple-600 text-white rounded-br-none' 
                        : 'bg-[#1a1a20] text-slate-200 rounded-bl-none border border-white/5'
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        {/* Chat Input */}
        <form onSubmit={sendChatMessage} className="p-4 border-t border-white/5 bg-[#15151a]">
          <div className="relative flex items-center">
            <input 
              type="text" 
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Type a message..." 
              className="w-full bg-[#0d0d0f] border border-white/10 rounded-full py-3 pl-4 pr-12 text-sm focus:outline-none focus:border-purple-500 transition-colors"
            />
            <button 
              type="submit"
              disabled={!chatInput.trim()}
              className="absolute right-1.5 w-9 h-9 bg-purple-600 hover:bg-purple-500 disabled:bg-slate-800 text-white rounded-full flex items-center justify-center transition-colors"
            >
              <Send className="w-4 h-4 -ml-0.5" />
            </button>
          </div>
        </form>
      </div>
      
    </div>
  );
};

// Extracted mini StarIcon since it's only used here
const StarIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

export default WatchParty;
