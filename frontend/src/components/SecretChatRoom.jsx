import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Image as ImageIcon, X, Trash2, Edit2, Check, ShieldAlert, Users, LogOut, Copy, Music, Play, Pause, Info, Phone, Video, Smile, Mic, Square, CheckCheck, Reply, Palette, Loader2, Search, EyeOff, Sparkles, PenTool, BarChart2, ChevronRight, Zap } from 'lucide-react';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import MusicShareModal from './MusicShareModal';
import CallOverlay from './CallOverlay';
import UserActionModal from './UserActionModal';
import { usePermissions } from '../contexts/PermissionContext';

// ── Theme Config ─────────────────────────────────────────────────────────────
const THEMES = {
  default:   { name: 'Instagram', bg: '#000000', accent: '#3797F0', myBubble: 'linear-gradient(135deg, #00B2FF, #006AFF)', theirBubble: '#262626', emoji: '💬' },
  monochrome:{ name: 'Monochrome',bg: '#111111', accent: '#FFFFFF', myBubble: '#FFFFFF', theirBubble: '#262626', emoji: '🖤', textColor: '#000000' },
  cyberpunk: { name: 'Cyberpunk', bg: 'linear-gradient(to bottom, #000000, #1a0033)', accent: '#00FFFF', myBubble: 'linear-gradient(135deg, #FF00FF, #00FFFF)', theirBubble: '#1A1A1A', emoji: '⚡' },
  tie_dye:   { name: 'Tie-Dye',   bg: 'linear-gradient(45deg, #1a0022, #001a44)', accent: '#FF00E5', myBubble: 'linear-gradient(135deg, #FF00E5, #005EFE, #00FF85)', theirBubble: '#262626', emoji: '🌀' },
  love:      { name: 'Love',      bg: 'linear-gradient(to bottom right, #330011, #000000)', accent: '#FF0055', myBubble: 'linear-gradient(135deg, #FF0055, #FF7B00)', theirBubble: '#262626', emoji: '❤️' },
  ocean:     { name: 'Ocean',     bg: 'linear-gradient(to bottom, #001122, #002233)', accent: '#00FFB2', myBubble: 'linear-gradient(135deg, #00FFB2, #00B2FF)', theirBubble: '#262626', emoji: '🌊' },
  lo_fi:     { name: 'Lo-Fi',     bg: 'linear-gradient(to bottom, #221100, #110500)', accent: '#F39C12', myBubble: 'linear-gradient(135deg, #F39C12, #D35400)', theirBubble: '#262626', emoji: '🌇' },
  galaxy:    { name: 'Galaxy',    bg: 'radial-gradient(circle at top right, #2a004d, #000000)', accent: '#8A2BE2', myBubble: 'linear-gradient(135deg, #4B0082, #8A2BE2, #0000FF)', theirBubble: '#262626', emoji: '🌌' },
};

const REACTIONS = ['❤️', '😂', '😮', '😢', '😡', '👍'];
const EMOJIS = ['😀','😂','🥺','😍','🤩','😎','🥳','😊','🤔','😴','😭','😤','🤬','😱','🥴','😇','🫂','❤️','🔥','✨','💯','👀','🎉','🎵','💪','👋','🙏','💀','😈','👑','🌈','🍕','🎮','📱','🚀','⭐','🫂','🤯','🤩','🤤'];
const GIPHY_KEY = import.meta.env.VITE_GIPHY_API_KEY || 'Qco0W0lBeOeaFGKv7DudhCA70LYaFOVf';

const fmtTime = (d) => new Date(d).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

// ── GIF Picker ─────────────────────────────────────────────────────────────
const GifPicker = ({ onSelect, onClose }) => {
  const [q, setQ] = useState('');
  const [gifs, setGifs] = useState([]);
  const [loading, setLoading] = useState(false);

  const search = async (term) => {
    setLoading(true);
    try {
      const url = term
        ? `https://api.giphy.com/v1/gifs/search?q=${encodeURIComponent(term)}&api_key=${GIPHY_KEY}&limit=24`
        : `https://api.giphy.com/v1/gifs/trending?api_key=${GIPHY_KEY}&limit=24`;
      const r = await fetch(url);
      const d = await r.json();
      setGifs(d.data || []);
    } catch (e) { console.error('GIF:', e); }
    finally { setLoading(false); }
  };

  useEffect(() => { search(''); }, []);
  useEffect(() => {
    const t = setTimeout(() => search(q), 500);
    return () => clearTimeout(t);
  }, [q]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
      className="absolute bottom-full mb-2 left-0 w-80 rounded-2xl overflow-hidden shadow-2xl z-50"
      style={{ background: '#0d0d23', border: '1px solid rgba(255,255,255,0.1)' }}
    >
      <div className="p-3 flex items-center gap-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <Search className="w-4 h-4" style={{ color: 'rgba(255,255,255,0.3)' }} />
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search GIFs..." autoFocus
          className="flex-1 bg-transparent text-white text-sm outline-none"
        />
        <button type="button" onClick={onClose} style={{ color: 'rgba(255,255,255,0.3)' }}><X className="w-4 h-4" /></button>
      </div>
      <div className="h-64 overflow-y-auto p-2 grid grid-cols-3 gap-1">
        {loading
          ? <div className="col-span-3 flex items-center justify-center h-full"><Loader2 className="w-6 h-6 animate-spin" style={{ color: '#7c3aed' }} /></div>
          : gifs.map(gif => {
            const mu = gif.images?.fixed_height?.url;
            const pu = gif.images?.fixed_height_small?.url || mu;
            return (
              <button type="button" key={gif.id} onClick={() => onSelect({ id: gif.id, url: mu, preview: pu, title: gif.title })}
                className="rounded-lg overflow-hidden transition-all hover:opacity-80 relative bg-white/5 min-h-[80px]">
                {pu && <img src={pu} alt={gif.title} className="w-full h-full object-cover absolute inset-0" loading="lazy" />}
              </button>
            );
          })}
      </div>
    </motion.div>
  );
};

// ── Emoji Picker ─────────────────────────────────────────────────────────────
const EmojiPickerComponent = ({ onSelect, onClose }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
    className="absolute bottom-full mb-2 left-0 w-72 rounded-2xl p-3 shadow-2xl z-50"
    style={{ background: '#0d0d23', border: '1px solid rgba(255,255,255,0.1)' }}
  >
    <div className="flex items-center justify-between mb-2">
      <span className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.4)' }}>Emoji</span>
      <button type="button" onClick={onClose} style={{ color: 'rgba(255,255,255,0.3)' }}><X className="w-3 h-3" /></button>
    </div>
    <div className="grid grid-cols-8 gap-1 max-h-48 overflow-y-auto">
      {EMOJIS.map(em => (
        <button type="button" key={em} onClick={() => onSelect(em)}
          className="text-xl rounded-lg p-1 hover:bg-white/10 transition-colors text-white">{em}</button>
      ))}
    </div>
  </motion.div>
);

// ── Reaction Picker ─────────────────────────────────────────────────────────────
const ReactionPicker = ({ onSelect, onClose }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
    className="absolute -top-12 left-1/2 -translate-x-1/2 rounded-full px-3 py-2 flex gap-2 shadow-2xl z-50"
    style={{ background: '#1a1a3a', border: '1px solid rgba(255,255,255,0.1)', whiteSpace: 'nowrap' }}
  >
    {REACTIONS.map(em => (
      <button type="button" key={em} onClick={() => { onSelect(em); onClose(); }}
        className="text-xl hover:scale-125 transition-transform">{em}</button>
    ))}
    <button type="button" onClick={onClose} className="ml-1" style={{ color: 'rgba(255,255,255,0.3)' }}><X className="w-4 h-4" /></button>
  </motion.div>
);

// ── Theme Picker ─────────────────────────────────────────────────────────────
const ThemePicker = ({ currentTheme, onSelect, onClose, customBg, setCustomBg }) => (
  <motion.div
    initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
    className="absolute right-0 top-full mt-1 w-64 rounded-2xl p-4 shadow-2xl z-50"
    style={{ background: '#0d0d23', border: '1px solid rgba(255,255,255,0.1)' }}
  >
    <div className="flex items-center justify-between mb-3">
      <h3 className="text-white font-bold text-sm flex items-center gap-2"><Palette className="w-4 h-4" /> Room Theme</h3>
      <button type="button" onClick={onClose} style={{ color: 'rgba(255,255,255,0.3)' }}><X className="w-4 h-4" /></button>
    </div>
    <div className="mb-4">
      <div className="flex gap-2">
        <input 
          type="text" 
          value={customBg} 
          onChange={(e) => setCustomBg(e.target.value)} 
          placeholder="Custom background URL..."
          className="flex-1 bg-white/5 border border-white/10 rounded-lg p-2 text-xs text-white placeholder:text-white/20"
        />
        <button onClick={() => {}} className="bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold px-3 rounded-lg transition-colors">Apply</button>
      </div>
      <p className="text-[9px] text-white/40 mt-1 pl-1">Paste an image URL and click Apply (Changes instantly).</p>
    </div>
    <div className="grid grid-cols-4 gap-2">
      {Object.entries(THEMES).map(([key, t]) => (
        <button type="button" key={key} onClick={() => onSelect(key)}
          className="flex flex-col items-center gap-1 p-2 rounded-xl transition-all hover:bg-white/5"
          style={{ background: currentTheme === key ? 'rgba(255,255,255,0.1)' : 'transparent' }}>
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm shadow-inner relative" style={{ background: t.myBubble }}>
            {currentTheme === key && <div className="absolute inset-0 rounded-full border-2 border-white pointer-events-none" />}
            {t.emoji}
          </div>
          <span className="text-[10px] font-medium leading-tight text-center" style={{ color: currentTheme === key ? 'white' : 'rgba(255,255,255,0.5)' }}>{t.name}</span>
        </button>
      ))}
    </div>
  </motion.div>
);

// ── Message Bubble ─────────────────────────────────────────────────────────────
const MsgBubble = ({ msg, isMe, theme, onReact, onUnsend, onReply, showAvatar, playingAudioId, handlePlayMusic, audioRefs, isSamePrev, isSameNext, isLastRead, setLightboxImg }) => {
  const [showRx, setShowRx] = useState(false);
  const [burst, setBurst] = useState(false);
  const tc = THEMES[theme] || THEMES.default;

  if (msg.isUnsent) return (
    <div className={`flex ${isMe ? 'justify-end' : 'justify-start'} mb-1`}>
      <div className="px-4 py-2 rounded-2xl text-sm italic" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.25)' }}>
        Message was unsent
      </div>
    </div>
  );

  const handleDoubleTap = () => {
    onReact(msg._id, '❤️');
    setBurst(true);
    setTimeout(() => setBurst(false), 1200);
  };

  return (
    <motion.div 
      drag="x" 
      dragConstraints={{ left: 0, right: 0 }} 
      dragElastic={0.2}
      onDragEnd={(e, info) => { if (Math.abs(info.offset.x) > 60) onReply(msg); }}
      className={`flex ${isMe ? 'flex-row-reverse' : 'flex-row'} items-end gap-2 mb-0.5 group`}
    >
      {!isMe && showAvatar && (
        <img src={msg.sender?.profileImage?.startsWith('http') ? msg.sender.profileImage : `https://api.dicebear.com/7.x/avataaars/svg?seed=${msg.sender?.name}`}
          alt="" className="w-7 h-7 rounded-full object-cover flex-shrink-0 mb-1" />
      )}
      {!isMe && !showAvatar && <div className="w-7 flex-shrink-0" />}

      <div className="relative max-w-[72%]">
        {msg.replyTo && !msg.replyTo.isUnsent && (
          <div className="mb-1 px-3 py-1.5 rounded-xl text-xs"
            style={{ background: 'rgba(255,255,255,0.05)', borderLeft: `2px solid ${tc.accent}`, color: 'rgba(255,255,255,0.5)', textAlign: isMe ? 'right' : 'left' }}>
            <div className="text-[10px] mb-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>Replying to</div>
            <div className="truncate">{msg.replyTo.content || '📷 Media'}</div>
          </div>
        )}

        <div
          className={`relative px-4 py-2.5 rounded-3xl cursor-pointer ${
            isMe 
              ? `${isSamePrev ? 'rounded-tr-sm' : ''} ${isSameNext ? 'rounded-br-sm' : ''}` 
              : `${isSamePrev ? 'rounded-tl-sm' : ''} ${isSameNext ? 'rounded-bl-sm' : ''}`
          }`}
          style={{
            background: isMe ? tc.myBubble : tc.theirBubble,
            border: isMe ? 'none' : '1px solid rgba(255,255,255,0.05)',
            boxShadow: isMe ? '0 4px 14px rgba(0,0,0,0.15)' : 'none',
            color: isMe && tc.textColor ? tc.textColor : 'white'
          }}
          onContextMenu={e => { e.preventDefault(); setShowRx(true); }}
          onDoubleClick={handleDoubleTap}
        >
          {burst && (
            <div className="absolute inset-0 pointer-events-none flex justify-center items-center z-50">
              {[...Array(6)].map((_, i) => (
                <motion.div key={i} initial={{ scale: 0.5, y: 0, opacity: 1, x: 0 }} animate={{ scale: 1.5, y: -60 - Math.random()*40, x: (Math.random()-0.5)*80, opacity: 0 }} transition={{ duration: 0.8, ease: "easeOut" }} className="absolute text-2xl">❤️</motion.div>
              ))}
            </div>
          )}
          {msg.type === 'gif' && msg.gifData
            ? <div className="rounded-xl overflow-hidden max-w-xs"><img src={msg.gifData.url} alt={msg.gifData.title || 'GIF'} className="w-full max-h-48 object-cover" loading="lazy" /></div>
            : msg.type === 'image' && msg.content
              ? <div className="rounded-xl overflow-hidden max-w-xs" onClick={() => setLightboxImg(msg.content)}><img src={msg.content} alt="Image" className="w-full max-h-64 object-cover" /></div>
              : msg.type === 'music' ? (
                <div className="flex items-center gap-3 min-w-[200px]">
                  <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                    <img src={msg.content.coverImage || '/default-music-cover.jpg'} alt="cover" className="w-full h-full object-cover" />
                    <div 
                      className="absolute inset-0 flex items-center justify-center bg-black/40 cursor-pointer hover:bg-black/60 transition-colors"
                      onClick={() => handlePlayMusic(msg._id)}
                    >
                      {playingAudioId === msg._id ? <Pause className="w-5 h-5 text-white" /> : <Play className="w-5 h-5 text-white ml-1" />}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0 pr-2">
                    <h4 className="text-sm font-semibold text-white truncate">{msg.content.title}</h4>
                    <p className="text-[11px] text-gray-300 truncate">{msg.content.artist}</p>
                  </div>
                  <audio ref={el => audioRefs.current[msg._id] = el} src={msg.content.audioUrl} onEnded={() => handlePlayMusic(null)} preload="none" />
                </div>
              ) : msg.type === 'voice' ? (
                <div className="flex items-center gap-3 min-w-[180px]">
                  <button onClick={() => handlePlayMusic(msg._id)} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition-colors shrink-0">
                    {playingAudioId === msg._id ? <Square className="w-3.5 h-3.5 fill-current" /> : <div className="w-0 h-0 border-t-4 border-b-4 border-l-6 border-transparent border-l-current ml-1"></div>}
                  </button>
                  <div className="flex-1 h-3 w-full rounded-full overflow-hidden flex items-center gap-[2px]">
                    {[...Array(12)].map((_, i) => (
                      <motion.div key={i} animate={playingAudioId === msg._id ? { height: ['20%', '100%', '30%', '80%', '20%'] } : { height: '20%' }} transition={{ duration: 0.5 + Math.random()*0.5, repeat: Infinity, ease: 'easeInOut' }} className="flex-1 bg-white/50 rounded-full" />
                    ))}
                  </div>
                  <button onClick={() => {
                    const audio = audioRefs.current[msg._id];
                    if (audio) {
                      const speeds = [1, 1.5, 2];
                      const currentIdx = speeds.indexOf(audio.playbackRate) || 0;
                      audio.playbackRate = speeds[(currentIdx + 1) % speeds.length];
                      // Force re-render just to show speed is complex without state, but we can just use native playbackRate.
                      toast(`Speed set to ${audio.playbackRate}x`, { icon: '⚡' });
                    }
                  }} className="text-[10px] font-bold bg-white/10 px-2 py-1 rounded-full text-white/80 hover:bg-white/20">1x</button>
                  <audio ref={el => audioRefs.current[msg._id] = el} src={msg.content} onEnded={() => handlePlayMusic(null)} preload="none" />
                </div>
              ) : msg.type === 'poll' ? (
                <div className="min-w-[200px]">
                  <div className="flex items-center gap-2 mb-3">
                    <BarChart2 className="w-4 h-4 text-white/70" />
                    <span className="font-bold text-sm text-white">{msg.pollData?.question || 'Poll'}</span>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    {msg.pollData?.options?.map((opt, i) => (
                      <button key={i} onClick={() => onReply({ ...msg, content: `Voted for: ${opt}` })} className="w-full text-left px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors text-sm text-white flex justify-between items-center border border-white/5">
                        <span>{opt}</span>
                        <div className="w-3 h-3 rounded-full border border-white/30"></div>
                      </button>
                    ))}
                  </div>
                </div>
              ) : <p className="text-[15px] leading-relaxed break-words relative z-10" style={{ color: isMe && tc.textColor ? tc.textColor : 'white' }}>{msg.content}</p>}
          
          {msg.effect === 'confetti' && !isMe && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl">
              {[...Array(10)].map((_, i) => <motion.div key={i} animate={{ y: [0, 100], x: [0, (Math.random()-0.5)*50], opacity: [1, 0] }} transition={{ duration: 1.5, repeat: Infinity }} className="absolute top-0 w-1.5 h-1.5 bg-yellow-400 rounded-sm" style={{ left: `${Math.random()*100}%`, backgroundColor: ['#ff0', '#f0f', '#0ff'][i%3] }} />)}
            </div>
          )}
          {msg.effect === 'laser' && (
            <motion.div animate={{ opacity: [0.2, 0.8, 0.2] }} transition={{ duration: 2, repeat: Infinity }} className="absolute inset-0 rounded-3xl pointer-events-none border border-[#0ff] shadow-[0_0_15px_#0ff]" />
          )}

          <div className={`flex items-center gap-1 mt-1 ${isMe ? 'justify-end' : 'justify-start'}`}>
            <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.4)' }}>{fmtTime(msg.createdAt)}</span>
          </div>
        </div>

        {msg.reactions?.length > 0 && (
          <div className={`flex flex-wrap gap-1 mt-1 ${isMe ? 'justify-end' : 'justify-start'}`}>
            {msg.reactions.map((r, i) => (
              <button type="button" key={i} onClick={() => onReact(msg._id, r.emoji)}
                className="text-xs rounded-full px-2 py-0.5 flex items-center gap-1 transition-colors"
                style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.1)' }}>
                {r.emoji}
              </button>
            ))}
          </div>
        )}

        <AnimatePresence>
          {showRx && <ReactionPicker onSelect={em => onReact(msg._id, em)} onClose={() => setShowRx(false)} />}
        </AnimatePresence>
      </div>

      <div className={`flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ${isMe ? 'flex-row-reverse' : ''}`}>
        <button type="button" onClick={() => setShowRx(true)} className="p-1 rounded-full transition-colors hover:bg-white/10" style={{ color: 'rgba(255,255,255,0.35)' }}><Smile className="w-3.5 h-3.5" /></button>
        <button type="button" onClick={() => onReply(msg)} className="p-1 rounded-full transition-colors hover:bg-white/10" style={{ color: 'rgba(255,255,255,0.35)' }}><Reply className="w-3.5 h-3.5" /></button>
        {isMe && <button type="button" onClick={() => onUnsend(msg._id)} className="p-1 rounded-full transition-colors hover:bg-white/10" style={{ color: 'rgba(255,255,255,0.35)' }}><Trash2 className="w-3.5 h-3.5" /></button>}
      </div>
    </motion.div>
  );
};

// ── Main Component ─────────────────────────────────────────────────────────────
const SecretChatRoom = ({ socket, roomData, onLeave }) => {
  const { user } = useSelector(state => state.auth);
  const { requestPermission } = usePermissions();
  
  const [messages, setMessages] = useState(roomData.messages || []);
  const [participants, setParticipants] = useState(roomData.participants || []);
  const [inputValue, setInputValue] = useState('');
  const [activeTheme, setActiveTheme] = useState(roomData.theme || 'default');
  
  const [replyTo, setReplyTo] = useState(null);
  const [showGif, setShowGif] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const [showTheme, setShowTheme] = useState(false);
  
  const [isPartnerTyping, setIsPartnerTyping] = useState(false);
  
  const [isMusicModalOpen, setIsMusicModalOpen] = useState(false);
  const [playingAudioId, setPlayingAudioId] = useState(null);
  const [lightboxImg, setLightboxImg] = useState(null);
  
  const [activeCallType, setActiveCallType] = useState(null);
  const [isReceivingCall, setIsReceivingCall] = useState(false);
  const [callerSignal, setCallerSignal] = useState(null);
  const [callerInfo, setCallerInfo] = useState(null);

  // Next-Gen Features
  const [vanishMode, setVanishMode] = useState(false);
  const [selectedEffect, setSelectedEffect] = useState('');
  const [customBg, setCustomBg] = useState('');
  const [showDraw, setShowDraw] = useState(false);
  const [showPoll, setShowPoll] = useState(false);
  const [smartReplies, setSmartReplies] = useState([]);
  
  const vanishTimersRef = useRef(new Set());

  // Voice Recording States
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recordingTimerRef = useRef(null);
  
  const [selectedUserAction, setSelectedUserAction] = useState(null);

  const audioRefs = useRef({});
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const typingRef = useRef(null);
  const isTypingRef = useRef(false);

  const isOwner = roomData.ownerId === user._id.toString();
  const tc = THEMES[activeTheme] || THEMES.default;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => { scrollToBottom(); }, [messages, isPartnerTyping]);

  useEffect(() => {
    if (!messages.length) return;
    const lastMsg = messages[messages.length - 1];
    
    // Smart Replies
    if (lastMsg.type === 'text' && lastMsg.sender && lastMsg.sender._id !== user._id) {
      const text = lastMsg.content.toLowerCase();
      if (text.includes('?')) setSmartReplies(['Yes', 'No', 'Maybe', "I don't know"]);
      else if (text.includes('hi') || text.includes('hello')) setSmartReplies(['Hey!', 'Hi there!', "What's up?"]);
      else if (text.includes('lol') || text.includes('haha')) setSmartReplies(['😂', 'Lmao', 'So funny']);
      else if (text.includes('bye')) setSmartReplies(['Goodbye!', 'See ya!', 'Take care']);
      else setSmartReplies(['Okay', 'Cool', 'Got it', '👍']);
    } else {
      setSmartReplies([]);
    }

    // Vanish Mode Timers
    messages.forEach(msg => {
      if (msg.isVanish && !msg.isUnsent && !vanishTimersRef.current.has(msg._id)) {
        vanishTimersRef.current.add(msg._id);
        setTimeout(() => {
          handleUnsend(msg._id);
        }, 10000);
      }
    });
  }, [messages]);

  useEffect(() => {
    if (!socket) return;

    socket.on('newPrivateMessage', (msg) => {
      setMessages(prev => [...prev, msg]);
    });

    socket.on('privateMessageEdited', ({ messageId, newContent }) => {
      setMessages(prev => prev.map(m => m._id === messageId ? { ...m, content: newContent, isEdited: true } : m));
    });

    socket.on('privateMessageReactionUpdated', ({ messageId, reactions }) => {
      setMessages(prev => prev.map(m => m._id === messageId ? { ...m, reactions } : m));
    });

    socket.on('privateMessageUnsent', ({ messageId }) => {
      setMessages(prev => prev.map(m => m._id === messageId ? { ...m, isUnsent: true, content: '' } : m));
    });

    socket.on('privateThemeChanged', ({ theme }) => {
      setActiveTheme(theme);
    });

    socket.on('privateUserTyping', ({ userId }) => {
      if (userId !== user._id) setIsPartnerTyping(true);
    });

    socket.on('privateUserStoppedTyping', ({ userId }) => {
      if (userId !== user._id) setIsPartnerTyping(false);
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
      socket.off('privateMessageReactionUpdated');
      socket.off('privateMessageUnsent');
      socket.off('privateThemeChanged');
      socket.off('privateUserTyping');
      socket.off('privateUserStoppedTyping');
      socket.off('userJoinedPrivateRoom');
      socket.off('userLeftPrivateRoom');
      socket.off('incomingCall');
    };
  }, [socket, user._id]);

  const handleInput = (e) => {
    setInputValue(e.target.value);
    if (!isTypingRef.current) {
      isTypingRef.current = true;
      socket.emit('privateTypingStart', { teamCode: roomData.teamCode });
    }
    clearTimeout(typingRef.current);
    typingRef.current = setTimeout(() => {
      isTypingRef.current = false;
      socket.emit('privateTypingStop', { teamCode: roomData.teamCode });
    }, 2000);
  };

  const handleSendText = (e) => {
    e?.preventDefault();
    if (!inputValue.trim()) return;
    socket.emit('sendPrivateMessage', { teamCode: roomData.teamCode, type: 'text', content: inputValue, replyTo, isVanish: vanishMode, effect: selectedEffect });
    setInputValue('');
    setReplyTo(null);
    setSelectedEffect('');
    scrollToBottom();
  };

  const handleSendSmartReply = (reply) => {
    socket.emit('sendPrivateMessage', { teamCode: roomData.teamCode, type: 'text', content: reply, replyTo: null, isVanish: vanishMode, effect: '' });
    setSmartReplies([]);
    scrollToBottom();
  };

  const handleSendImage = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      socket.emit('sendPrivateMessage', { teamCode: roomData.teamCode, type: 'image', content: event.target.result, replyTo });
      setReplyTo(null);
    };
    reader.readAsDataURL(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSendGif = (gif) => {
    socket.emit('sendPrivateMessage', { teamCode: roomData.teamCode, type: 'gif', content: '', gifData: gif, replyTo });
    setReplyTo(null);
    setShowGif(false);
  };

  const handleSendMusic = (trackData) => {
    socket.emit('sendPrivateMessage', { teamCode: roomData.teamCode, type: 'music', content: trackData, replyTo, isVanish: vanishMode, effect: selectedEffect });
    setReplyTo(null);
    setSelectedEffect('');
    setIsMusicModalOpen(false);
  };

  const handleReact = (msgId, emoji) => {
    socket.emit('reactToPrivateMessage', { teamCode: roomData.teamCode, messageId: msgId, emoji });
  };

  const handleUnsend = (msgId) => {
    socket.emit('unsendPrivateMessage', { teamCode: roomData.teamCode, messageId: msgId });
  };

  const handleChangeTheme = (theme) => {
    socket.emit('setPrivateTheme', { teamCode: roomData.teamCode, theme });
    setShowTheme(false);
  };

  const handlePlayMusic = (msgId) => {
    if (playingAudioId && playingAudioId !== msgId && audioRefs.current[playingAudioId]) {
      audioRefs.current[playingAudioId].pause();
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

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied!`, { style: { background: '#1a1a1a', color: '#4ade80', border: '1px solid #22c55e' }});
  };

  const startRecording = async () => {
    try {
      const granted = await requestPermission('microphone');
      if (!granted) { toast.error('Microphone permission denied.'); return; }
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
          socket.emit('sendPrivateMessage', { teamCode: roomData.teamCode, type: 'voice', content: reader.result, isVanish: vanishMode, replyTo });
          setReplyTo(null);
        };
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordingTime(0);
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime(prev => {
          if (prev >= 60) { stopRecording(); return 60; }
          return prev + 1;
        });
      }, 1000);
    } catch (err) { toast.error('Microphone access failed.'); }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(recordingTimerRef.current);
    }
  };

  const formatTime = (secs) => `${Math.floor(secs / 60)}:${(secs % 60).toString().padStart(2, '0')}`;

  const handleCall = (type) => {
    if (participants.length <= 1) return toast.error('You need a partner to make a call!');
    setActiveCallType(type);
  };

  return (
    <div className="min-h-screen flex flex-col font-sans transition-colors duration-500 overflow-hidden" style={{ background: tc.bg }}>
      {/* ── IG Style Header ── */}
      <div className="flex items-center justify-between px-4 py-3 border-b z-20 shadow-sm" style={{ background: 'rgba(0,0,0,0.2)', borderColor: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)' }}>
        <div className="flex items-center gap-3">
          <div className="relative">
            {participants.length > 1 ? (
              <div className="flex -space-x-2">
                {participants.filter(p => p._id !== user._id).slice(0, 3).map(p => (
                  <img key={p._id} src={p.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${p.name}`} alt="" className="w-10 h-10 rounded-full border-2 border-black object-cover" />
                ))}
              </div>
            ) : (
              <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border-2 border-black">
                <Users className="w-5 h-5 text-white/50" />
              </div>
            )}
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-black" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              {participants.length > 1 ? 'Secret Lounge Chat' : 'Waiting for partners...'}
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-white/10">{participants.length} Active</span>
            </h2>
            <div className="flex items-center gap-2 mt-0.5">
              <button onClick={() => copyToClipboard(roomData.teamCode, 'Room Code')} className="text-[10px] font-mono bg-black/40 hover:bg-black/60 px-2 rounded flex items-center gap-1 text-white/70 transition-colors">
                Code: {roomData.teamCode} <Copy className="w-2.5 h-2.5" />
              </button>
              {isOwner && (
                <button onClick={() => copyToClipboard(roomData.password, 'Password')} className="text-[10px] font-mono bg-black/40 hover:bg-black/60 px-2 rounded flex items-center gap-1 text-white/70 transition-colors">
                  Pass: {roomData.password} <Copy className="w-2.5 h-2.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 relative">
          <button onClick={() => setVanishMode(!vanishMode)} className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${vanishMode ? 'bg-purple-600 text-white shadow-[0_0_15px_rgba(147,51,234,0.5)]' : 'hover:bg-white/10 text-white'}`} title="Vanish Mode">
            <EyeOff className="w-5 h-5" />
          </button>
          <button onClick={() => handleCall('audio')} className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/10 text-white transition-colors"><Phone className="w-5 h-5" /></button>
          <button onClick={() => handleCall('video')} className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/10 text-white transition-colors"><Video className="w-5 h-5" /></button>
          <button onClick={() => setShowTheme(!showTheme)} className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/10 text-white transition-colors relative">
            <Palette className="w-5 h-5" />
            <div className="absolute top-2 right-2 w-2 h-2 rounded-full" style={{ background: tc.accent }}></div>
          </button>
          <button onClick={onLeave} className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-red-500/20 text-red-500 transition-colors"><LogOut className="w-5 h-5" /></button>
          
          <AnimatePresence>{showTheme && <ThemePicker currentTheme={activeTheme} onSelect={handleChangeTheme} onClose={() => setShowTheme(false)} customBg={customBg} setCustomBg={setCustomBg} />}</AnimatePresence>
        </div>
      </div>

      {/* ── Messages Area ── */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 z-10 scrollbar-hide flex flex-col">
        {messages.map((msg, idx) => {
          if (msg.type === 'system') {
            return (
              <div key={idx} className="flex justify-center my-4">
                <span className="px-3 py-1 bg-white/5 rounded-full text-[10px] text-white/40 font-medium">
                  {msg.content.replace('[SYSTEM] ', '')}
                </span>
              </div>
            );
          }
          
          const isMe = msg.sender._id === user._id;
          
          const prevMsg = messages[idx - 1];
          const nextMsg = messages[idx + 1];
          const isSamePrev = prevMsg && prevMsg.sender._id === msg.sender._id && prevMsg.type !== 'system';
          const isSameNext = nextMsg && nextMsg.sender._id === msg.sender._id && nextMsg.type !== 'system';
          
          const showAvatar = !isSameNext;
          const isLastRead = isMe && idx === messages.length - 1 && participants.length > 1;

          return (
          <React.Fragment key={msg._id}>
            <MsgBubble 
              msg={msg} 
              isMe={isMe} 
              theme={activeTheme} 
              showAvatar={showAvatar}
              isSamePrev={isSamePrev}
              isSameNext={isSameNext}
              isLastRead={isLastRead}
              onReact={handleReact} 
              onUnsend={handleUnsend} 
              onReply={setReplyTo} 
              playingAudioId={playingAudioId}
              handlePlayMusic={handlePlayMusic}
              audioRefs={audioRefs}
              setLightboxImg={setLightboxImg}
            />
            {isLastRead && (
              <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="flex justify-end gap-1 mb-2 pr-1">
                {participants.filter(p => p._id !== user._id).slice(0, 3).map(p => (
                  <img key={p._id} src={p.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${p.name}`} alt="" className="w-3.5 h-3.5 rounded-full object-cover" title={`Seen by ${p.name}`} />
                ))}
              </motion.div>
            )}
          </React.Fragment>
          );
        })}
        {isPartnerTyping && (
          <div className="flex justify-start mb-1 items-end gap-2">
            <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center border border-white/5 overflow-hidden flex-shrink-0">
              <span className="text-[10px]">💬</span>
            </div>
            <div className="px-4 py-3 rounded-2xl rounded-tl-sm flex gap-1 items-center" style={{ background: tc.theirBubble }}>
              <motion.div animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} className="w-1.5 h-1.5 bg-white/50 rounded-full" />
              <motion.div animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} className="w-1.5 h-1.5 bg-white/50 rounded-full" />
              <motion.div animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} className="w-1.5 h-1.5 bg-white/50 rounded-full" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* ── Input Area ── */}
      <div className="p-3 z-20 pb-6" style={{ background: vanishMode ? 'rgba(0,0,0,0.9)' : 'rgba(0,0,0,0.7)', backdropFilter: 'blur(20px)', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        
        {/* Smart Replies */}
        <AnimatePresence>
          {smartReplies.length > 0 && !inputValue && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="max-w-4xl mx-auto flex gap-2 mb-3 overflow-x-auto scrollbar-hide px-2">
              <Sparkles className="w-4 h-4 text-purple-400 flex-shrink-0 mt-1" />
              {smartReplies.map((reply, i) => (
                <button key={i} onClick={() => handleSendSmartReply(reply)} className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs rounded-full whitespace-nowrap transition-colors border border-white/5">
                  {reply}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {replyTo && (
            <motion.div initial={{ opacity: 0, y: 10, height: 0 }} animate={{ opacity: 1, y: 0, height: 'auto' }} exit={{ opacity: 0, y: 10, height: 0 }}
              className="max-w-4xl mx-auto px-4 py-2 mb-2 rounded-xl flex items-center justify-between"
              style={{ background: 'rgba(255,255,255,0.05)', borderLeft: `3px solid ${tc.accent}` }}>
              <div>
                <span className="text-[10px] font-bold" style={{ color: tc.accent }}>Replying to {replyTo.sender?.name || 'Someone'}</span>
                <p className="text-xs text-white/70 truncate max-w-sm">{replyTo.content || '📷 Media'}</p>
              </div>
              <button type="button" onClick={() => setReplyTo(null)} className="text-white/40 hover:text-white"><X className="w-4 h-4" /></button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="max-w-4xl mx-auto flex items-center gap-2 relative">
          <input type="file" accept="image/*" ref={fileInputRef} onChange={handleSendImage} className="hidden" />
          
          <div className="relative">
            <button type="button" onClick={() => setShowEmoji(!showEmoji)} className="w-10 h-10 rounded-full flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-colors">
              <Smile className="w-5 h-5" />
            </button>
            <AnimatePresence>{showEmoji && <EmojiPickerComponent onSelect={em => { setInputValue(prev => prev + em); setShowEmoji(false); }} onClose={() => setShowEmoji(false)} />}</AnimatePresence>
          </div>

          <div className="relative flex-1">
            <form onSubmit={handleSendText} className="flex items-center bg-[#262626] rounded-full px-4 border border-transparent focus-within:border-white/20 transition-all">
              <input
                type="text"
                value={inputValue}
                onChange={handleInput}
                placeholder="Message..."
                className="flex-1 bg-transparent text-white py-3 outline-none text-[15px] placeholder-white/40"
              />
              {inputValue.trim() || selectedEffect ? (
                <div className="flex items-center gap-2">
                  {!inputValue.trim() && selectedEffect ? (
                    <button type="submit" className="text-white font-bold text-sm ml-2" style={{ color: tc.accent }}>Send Effect</button>
                  ) : null}
                  <button type="button" onContextMenu={(e) => { e.preventDefault(); setSelectedEffect(prev => prev === 'confetti' ? 'laser' : 'confetti'); }} onClick={handleSendText} className="text-white font-bold text-sm ml-2" style={{ color: tc.accent }}>Send</button>
                </div>
              ) : (
                <div className="flex items-center gap-1 ml-2">
                  <div className="relative">
                    <button type="button" onClick={() => setShowGif(!showGif)} className="p-2 text-white/50 hover:text-white transition-colors"><div className="text-[10px] font-black border-2 border-current rounded px-1 tracking-tighter">GIF</div></button>
                    <AnimatePresence>{showGif && <GifPicker onSelect={handleSendGif} onClose={() => setShowGif(false)} />}</AnimatePresence>
                  </div>
                  <button type="button" onClick={() => setIsMusicModalOpen(true)} className="p-2 text-white/50 hover:text-white transition-colors"><Music className="w-5 h-5" /></button>
                  <button type="button" onClick={() => fileInputRef.current?.click()} className="p-2 text-white/50 hover:text-white transition-colors"><ImageIcon className="w-5 h-5" /></button>
                  <button type="button" onClick={() => setShowDraw(true)} className="p-2 text-white/50 hover:text-white transition-colors"><PenTool className="w-5 h-5" /></button>
                  <button type="button" onClick={() => setShowPoll(true)} className="p-2 text-white/50 hover:text-white transition-colors"><BarChart2 className="w-5 h-5" /></button>
                </div>
              )}
            </form>
          </div>

          {!inputValue.trim() && (
            <button type="button" onClick={isRecording ? stopRecording : startRecording} className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${isRecording ? 'bg-red-500 text-white animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.5)]' : 'bg-[#262626] text-white/80 hover:bg-[#363636]'}`}>
              <Mic className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      <MusicShareModal isOpen={isMusicModalOpen} onClose={() => setIsMusicModalOpen(false)} onSelect={handleSendMusic} />
      
      {activeCallType && (
        <CallOverlay 
          socket={socket} 
          callType={activeCallType}
          isReceiving={isReceivingCall}
          callerSignal={callerSignal}
          callerInfo={callerInfo}
          onClose={() => { setActiveCallType(null); setIsReceivingCall(false); }} 
        />
      )}
      
      {selectedUserAction && (
        <UserActionModal user={selectedUserAction} onClose={() => setSelectedUserAction(null)} />
      )}

      <AnimatePresence>
        {lightboxImg && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md cursor-pointer"
            onClick={() => setLightboxImg(null)}
          >
            <button className="absolute top-4 right-4 text-white/50 hover:text-white bg-black/50 p-2 rounded-full"><X className="w-6 h-6" /></button>
            <motion.img 
              initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              src={lightboxImg} alt="Fullscreen" className="max-w-full max-h-full rounded-2xl object-contain shadow-2xl" 
            />
          </motion.div>
        )}
      </AnimatePresence>
      
      <AnimatePresence>
        {showDraw && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
            <div className="bg-[#1a1a3a] p-4 rounded-3xl w-full max-w-sm border border-white/10 flex flex-col gap-4">
              <div className="flex justify-between items-center"><h3 className="text-white font-bold">Doodle</h3><button onClick={() => setShowDraw(false)} className="text-white/50 hover:text-white"><X className="w-5 h-5"/></button></div>
              <div className="bg-white rounded-xl h-64 relative overflow-hidden" 
                onPointerMove={e => {
                  if (e.buttons !== 1) return;
                  const rect = e.currentTarget.getBoundingClientRect();
                  const dot = document.createElement('div');
                  dot.className = 'absolute w-3 h-3 bg-black rounded-full pointer-events-none';
                  dot.style.left = `${e.clientX - rect.left - 6}px`;
                  dot.style.top = `${e.clientY - rect.top - 6}px`;
                  e.currentTarget.appendChild(dot);
                }}
              ></div>
              <button onClick={(e) => {
                // Mock sending canvas
                socket.emit('sendPrivateMessage', { teamCode: roomData.teamCode, type: 'text', content: '🖍️ Sent a doodle!', isVanish: vanishMode, effect: selectedEffect });
                setShowDraw(false);
              }} className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 rounded-xl transition-colors">Send Doodle</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showPoll && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
            <div className="bg-[#1a1a3a] p-4 rounded-3xl w-full max-w-sm border border-white/10 flex flex-col gap-3">
              <div className="flex justify-between items-center"><h3 className="text-white font-bold flex items-center gap-2"><BarChart2 className="w-5 h-5"/> Create Poll</h3><button onClick={() => setShowPoll(false)} className="text-white/50 hover:text-white"><X className="w-5 h-5"/></button></div>
              <input type="text" id="pollQ" placeholder="Ask a question..." className="w-full bg-black/50 text-white px-4 py-3 rounded-xl outline-none border border-white/10" />
              <input type="text" id="pollO1" placeholder="Option 1" className="w-full bg-black/30 text-white px-4 py-2 rounded-xl outline-none border border-white/5" />
              <input type="text" id="pollO2" placeholder="Option 2" className="w-full bg-black/30 text-white px-4 py-2 rounded-xl outline-none border border-white/5" />
              <button onClick={() => {
                const q = document.getElementById('pollQ').value;
                const o1 = document.getElementById('pollO1').value;
                const o2 = document.getElementById('pollO2').value;
                if (!q || !o1 || !o2) return toast.error('Fill in question and options');
                socket.emit('sendPrivateMessage', { teamCode: roomData.teamCode, type: 'poll', pollData: { question: q, options: [o1, o2] }, isVanish: vanishMode });
                setShowPoll(false);
              }} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl mt-2 transition-colors">Send Poll</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default SecretChatRoom;
