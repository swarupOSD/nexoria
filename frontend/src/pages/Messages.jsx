import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageCircle, Send, ArrowLeft, Search, Phone, Video,
  Smile, Gift, Pin, X, Palette, Check, CheckCheck,
  Trash2, Reply, Loader2, Globe
} from 'lucide-react';
import CallOverlay from '../components/CallOverlay';
import { useGetFriendsListQuery } from '../features/api/friendApiSlice';
import toast from 'react-hot-toast';

// â”€â”€ Theme Config â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const THEMES = {
  default:   { name: 'Nexoria',   bg: '#0a0a1a',   accent: '#7c3aed', myBubble: 'linear-gradient(135deg,#7c3aed,#6d28d9)', theirBubble: 'rgba(255,255,255,0.08)', emoji: 'ðŸŒŒ' },
  cherry:    { name: 'Cherry',    bg: '#1a0814',   accent: '#ec4899', myBubble: 'linear-gradient(135deg,#ec4899,#be185d)', theirBubble: 'rgba(236,72,153,0.12)', emoji: 'ðŸŒ¸' },
  galaxy:    { name: 'Galaxy',    bg: '#020817',   accent: '#3b82f6', myBubble: 'linear-gradient(135deg,#3b82f6,#4f46e5)', theirBubble: 'rgba(59,130,246,0.12)', emoji: 'ðŸŒŒ' },
  flame:     { name: 'Flame',     bg: '#1a0500',   accent: '#f97316', myBubble: 'linear-gradient(135deg,#f97316,#dc2626)', theirBubble: 'rgba(249,115,22,0.12)', emoji: 'ðŸ”¥' },
  forest:    { name: 'Forest',    bg: '#031a07',   accent: '#22c55e', myBubble: 'linear-gradient(135deg,#22c55e,#16a34a)', theirBubble: 'rgba(34,197,94,0.12)', emoji: 'ðŸŒ¿' },
  cyberpunk: { name: 'Cyber',     bg: '#000d1a',   accent: '#06b6d4', myBubble: 'linear-gradient(135deg,#06b6d4,#3b82f6)', theirBubble: 'rgba(6,182,212,0.12)', emoji: 'âš¡' },
  ice:       { name: 'Ice',       bg: '#071a2d',   accent: '#38bdf8', myBubble: 'linear-gradient(135deg,#38bdf8,#60a5fa)', theirBubble: 'rgba(56,189,248,0.12)', emoji: 'â„ï¸' },
  pride:     { name: 'Pride',     bg: '#0d0010',   accent: '#a855f7', myBubble: 'linear-gradient(90deg,#ef4444,#eab308,#22c55e,#3b82f6,#a855f7)', theirBubble: 'rgba(255,255,255,0.08)', emoji: 'ðŸŒˆ' },
};

const REACTIONS = ['â¤ï¸', 'ðŸ˜‚', 'ðŸ˜®', 'ðŸ˜¢', 'ðŸ˜¡', 'ðŸ‘'];
const EMOJIS = ['ðŸ˜€','ðŸ˜‚','ðŸ¥¹','ðŸ˜','ðŸ¤©','ðŸ˜Ž','ðŸ¥³','ðŸ˜Š','ðŸ¤”','ðŸ˜','ðŸ˜­','ðŸ˜¤','ðŸ¤¬','ðŸ˜±','ðŸ¥º','ðŸ˜‡','ðŸ«¶','â¤ï¸','ðŸ”¥','âœ¨','ðŸ’¯','ðŸ‘€','ðŸŽ‰','ðŸŽ¶','ðŸ’ª','ðŸ‘‹','ðŸ™','ðŸ’€','ðŸ˜ˆ','ðŸ‘‘','ðŸŒˆ','ðŸ•','ðŸŽ®','ðŸ“±','ðŸš€','â­','ðŸ«‚','ðŸ¤¯','ðŸ¤©','ðŸ¤­'];
const TENOR_KEY = 'AIzaSyBBkjbQQDNrfz-pB5M1-J3JrM7fqPMNE9k';
const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

let socket;

const fmtTime = (d) => new Date(d).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
const fmtDate = (d) => {
  const n = new Date(d), t = new Date(), y = new Date(t);
  y.setDate(y.getDate() - 1);
  if (n.toDateString() === t.toDateString()) return 'Today';
  if (n.toDateString() === y.toDateString()) return 'Yesterday';
  return n.toLocaleDateString([], { month: 'short', day: 'numeric' });
};

// â”€â”€ GIF Picker â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const GifPicker = ({ onSelect, onClose }) => {
  const [q, setQ] = useState('');
  const [gifs, setGifs] = useState([]);
  const [loading, setLoading] = useState(false);

  const search = async (term) => {
    setLoading(true);
    try {
      const url = term
        ? `https://tenor.googleapis.com/v2/search?q=${encodeURIComponent(term)}&key=${TENOR_KEY}&limit=24&media_filter=gif`
        : `https://tenor.googleapis.com/v2/featured?key=${TENOR_KEY}&limit=24&media_filter=gif`;
      const r = await fetch(url);
      const d = await r.json();
      setGifs(d.results || []);
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
          style={{ color: 'white' }}
        />
        <button onClick={onClose} style={{ color: 'rgba(255,255,255,0.3)' }}><X className="w-4 h-4" /></button>
      </div>
      <div className="h-64 overflow-y-auto p-2 grid grid-cols-3 gap-1">
        {loading
          ? <div className="col-span-3 flex items-center justify-center h-full"><Loader2 className="w-6 h-6 animate-spin" style={{ color: '#7c3aed' }} /></div>
          : gifs.map(gif => {
            const mu = gif.media_formats?.gif?.url || gif.url;
            const pu = gif.media_formats?.tinygif?.url || mu;
            return (
              <button key={gif.id} onClick={() => onSelect({ id: gif.id, url: mu, preview: pu, title: gif.title })}
                className="rounded-lg overflow-hidden transition-all hover:opacity-80">
                <img src={pu} alt={gif.title} className="w-full h-20 object-cover" loading="lazy" />
              </button>
            );
          })}
      </div>
    </motion.div>
  );
};

// â”€â”€ Emoji Picker â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const EmojiPicker = ({ onSelect, onClose }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
    className="absolute bottom-full mb-2 left-0 w-72 rounded-2xl p-3 shadow-2xl z-50"
    style={{ background: '#0d0d23', border: '1px solid rgba(255,255,255,0.1)' }}
  >
    <div className="flex items-center justify-between mb-2">
      <span className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.4)' }}>Emoji</span>
      <button onClick={onClose} style={{ color: 'rgba(255,255,255,0.3)' }}><X className="w-3 h-3" /></button>
    </div>
    <div className="grid grid-cols-8 gap-1 max-h-48 overflow-y-auto">
      {EMOJIS.map(em => (
        <button key={em} onClick={() => onSelect(em)}
          className="text-xl rounded-lg p-1 hover:bg-white/10 transition-colors">{em}</button>
      ))}
    </div>
  </motion.div>
);

// â”€â”€ Reaction Picker â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const ReactionPicker = ({ onSelect, onClose }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
    className="absolute -top-12 left-1/2 -translate-x-1/2 rounded-full px-3 py-2 flex gap-2 shadow-2xl z-50"
    style={{ background: '#1a1a3a', border: '1px solid rgba(255,255,255,0.1)', whiteSpace: 'nowrap' }}
  >
    {REACTIONS.map(em => (
      <button key={em} onClick={() => { onSelect(em); onClose(); }}
        className="text-xl hover:scale-125 transition-transform">{em}</button>
    ))}
    <button onClick={onClose} className="ml-1" style={{ color: 'rgba(255,255,255,0.3)' }}><X className="w-4 h-4" /></button>
  </motion.div>
);

// â”€â”€ Theme Picker â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const ThemePicker = ({ currentTheme, onSelect, onClose }) => (
  <motion.div
    initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
    className="absolute right-0 top-full mt-1 w-64 rounded-2xl p-4 shadow-2xl z-50"
    style={{ background: '#0d0d23', border: '1px solid rgba(255,255,255,0.1)' }}
  >
    <div className="flex items-center justify-between mb-3">
      <h3 className="text-white font-bold text-sm flex items-center gap-2"><Palette className="w-4 h-4" /> Chat Theme</h3>
      <button onClick={onClose} style={{ color: 'rgba(255,255,255,0.3)' }}><X className="w-4 h-4" /></button>
    </div>
    <div className="grid grid-cols-4 gap-2">
      {Object.entries(THEMES).map(([key, t]) => (
        <button key={key} onClick={() => onSelect(key)}
          className="flex flex-col items-center gap-1 p-2 rounded-xl transition-all"
          style={{ background: currentTheme === key ? 'rgba(255,255,255,0.15)' : 'transparent', outline: currentTheme === key ? '2px solid white' : 'none' }}>
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm" style={{ background: t.accent }}>{t.emoji}</div>
          <span className="text-[10px] leading-tight text-center" style={{ color: 'rgba(255,255,255,0.5)' }}>{t.name}</span>
        </button>
      ))}
    </div>
  </motion.div>
);

// â”€â”€ Message Bubble â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const MsgBubble = ({ msg, isMe, theme, onReact, onUnsend, onReply, showAvatar }) => {
  const [showRx, setShowRx] = useState(false);
  const tc = THEMES[theme] || THEMES.default;

  if (msg.isUnsent) return (
    <div className={`flex ${isMe ? 'justify-end' : 'justify-start'} mb-1`}>
      <div className="px-4 py-2 rounded-2xl text-sm italic" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.25)' }}>
        Message was unsent
      </div>
    </div>
  );

  return (
    <div className={`flex ${isMe ? 'flex-row-reverse' : 'flex-row'} items-end gap-2 mb-1 group`}>
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
            <div className="truncate">{msg.replyTo.text || 'ðŸ“· Media'}</div>
          </div>
        )}

        <div
          className={`relative px-4 py-2.5 rounded-2xl cursor-pointer ${isMe ? 'rounded-tr-sm' : 'rounded-tl-sm'}`}
          style={{
            background: isMe ? tc.myBubble : tc.theirBubble,
            border: isMe ? 'none' : '1px solid rgba(255,255,255,0.1)',
            color: 'white'
          }}
          onContextMenu={e => { e.preventDefault(); setShowRx(true); }}
          onDoubleClick={() => setShowRx(true)}
        >
          {msg.type === 'gif' && msg.gifData
            ? <div className="rounded-xl overflow-hidden max-w-xs"><img src={msg.gifData.url} alt={msg.gifData.title || 'GIF'} className="w-full max-h-48 object-cover" loading="lazy" /></div>
            : msg.type === 'image' && msg.mediaUrl
              ? <div className="rounded-xl overflow-hidden max-w-xs"><img src={msg.mediaUrl} alt="Image" className="w-full max-h-64 object-cover" /></div>
              : <p className="text-sm leading-relaxed break-words">{msg.text}</p>}
          <div className={`flex items-center gap-1 mt-1 ${isMe ? 'justify-end' : 'justify-start'}`}>
            <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.4)' }}>{fmtTime(msg.createdAt)}</span>
            {isMe && (msg.isRead
              ? <CheckCheck className="w-3 h-3" style={{ color: tc.accent, opacity: 0.8 }} />
              : <Check className="w-3 h-3" style={{ color: 'rgba(255,255,255,0.3)' }} />)}
          </div>
        </div>

        {msg.reactions?.length > 0 && (
          <div className={`flex flex-wrap gap-1 mt-1 ${isMe ? 'justify-end' : 'justify-start'}`}>
            {msg.reactions.map((r, i) => (
              <button key={i} onClick={() => onReact(msg._id, r.emoji)}
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
        <button onClick={() => setShowRx(true)} className="p-1 rounded-full transition-colors hover:bg-white/10" style={{ color: 'rgba(255,255,255,0.35)' }}><Smile className="w-3.5 h-3.5" /></button>
        <button onClick={() => onReply(msg)} className="p-1 rounded-full transition-colors hover:bg-white/10" style={{ color: 'rgba(255,255,255,0.35)' }}><Reply className="w-3.5 h-3.5" /></button>
        {isMe && <button onClick={() => onUnsend(msg._id)} className="p-1 rounded-full transition-colors hover:bg-white/10" style={{ color: 'rgba(255,255,255,0.35)' }}><Trash2 className="w-3.5 h-3.5" /></button>}
      </div>
    </div>
  );
};

// â”€â”€ Conversation List Item â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const ConvItem = ({ conv, partner, isActive, isOnline, unread, onClick, themeAccent }) => {
  const lm = conv?.lastMessage;
  return (
    <button onClick={onClick}
      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl transition-all text-left"
      style={{ background: isActive ? 'rgba(255,255,255,0.1)' : 'transparent' }}>
      <div className="relative flex-shrink-0">
        <img src={partner?.profileImage?.startsWith('http') ? partner.profileImage : `https://api.dicebear.com/7.x/avataaars/svg?seed=${partner?.name}`}
          alt="" className="w-11 h-11 rounded-full object-cover" />
        {isOnline && <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-black" />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-sm text-white truncate">{partner?.name}</span>
          {lm && <span className="text-[10px] flex-shrink-0 ml-1" style={{ color: 'rgba(255,255,255,0.3)' }}>{fmtTime(lm.createdAt)}</span>}
        </div>
        <div className="flex items-center justify-between">
          <p className="text-xs truncate" style={{ color: 'rgba(255,255,255,0.35)' }}>
            {lm?.isUnsent ? 'Message was unsent' : lm?.type === 'gif' ? 'ðŸŽžï¸ GIF' : lm?.type === 'image' ? 'ðŸ“· Photo' : lm?.text || `Say hi to ${partner?.name}!`}
          </p>
          {unread > 0 && (
            <span className="flex-shrink-0 ml-1 w-5 h-5 rounded-full text-white text-[10px] font-bold flex items-center justify-center"
              style={{ background: themeAccent }}>
              {unread > 9 ? '9+' : unread}
            </span>
          )}
        </div>
      </div>
    </button>
  );
};

// â”€â”€ Main Component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const Messages = () => {
  const { user, token } = useSelector(s => s.auth);
  const [searchParams, setSearchParams] = useSearchParams();
  const targetUserId = searchParams.get('user');
  const { data: friendsRes, isLoading: loadingFriends } = useGetFriendsListQuery(undefined, { skip: !user });
  const friendsList = friendsRes?.data || [];

  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [activeChat, setActiveChat] = useState(null);
  const [activeTheme, setActiveTheme] = useState('default');
  const [searchQuery, setSearchQuery] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [showGif, setShowGif] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const [showTheme, setShowTheme] = useState(false);
  const [isPartnerTyping, setIsPartnerTyping] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [callData, setCallData] = useState(null);
  const [isReceivingCall, setIsReceivingCall] = useState(false);
  const [callerInfo, setCallerInfo] = useState(null);
  const [callerSignal, setCallerSignal] = useState(null);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const typingRef = useRef(null);
  const isTypingRef = useRef(false);
  const tc = THEMES[activeTheme] || THEMES.default;

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    if (!user || !token) return;
    const base = BACKEND_URL.endsWith('/api') ? BACKEND_URL.slice(0, -4) : BACKEND_URL;
    socket = io(base, { auth: { token }, transports: ['websocket'] });

    socket.on('connect', () => socket.emit('getConversations'));
    socket.on('conversationsList', convs => setConversations(convs));
    socket.on('conversationMessages', ({ messages: msgs, theme }) => {
      setMessages(msgs);
      if (theme) setActiveTheme(theme);
      setTimeout(scrollToBottom, 100);
    });
    socket.on('newDirectMessage', msg => {
      setMessages(prev => prev.find(m => m._id === msg._id) ? prev : [...prev, msg]);
      scrollToBottom();
      socket.emit('getConversations');
    });
    socket.on('messageReactionUpdated', ({ messageId, reactions }) =>
      setMessages(prev => prev.map(m => m._id === messageId ? { ...m, reactions } : m)));
    socket.on('messageUnsent', ({ messageId }) =>
      setMessages(prev => prev.map(m => m._id === messageId ? { ...m, isUnsent: true, text: '' } : m)));
    socket.on('messagesSeen', () => setMessages(prev => prev.map(m => ({ ...m, isRead: true }))));
    socket.on('userTyping', ({ userId }) => { if (activeChat?._id === userId) setIsPartnerTyping(true); });
    socket.on('userStoppedTyping', ({ userId }) => { if (activeChat?._id === userId) setIsPartnerTyping(false); });
    socket.on('conversationThemeChanged', ({ theme }) => setActiveTheme(theme));
    socket.on('incomingCall', data => {
      setIsReceivingCall(true);
      setCallerInfo({ from: data.from, name: data.name });
      setCallerSignal(data.signal);
      setCallData({ type: data.type });
    });
    socket.on('onlineStats', ({ onlineUserIds }) => setOnlineUsers(onlineUserIds || []));
    socket.on('dmError', err => toast.error(err.message));

    return () => socket.disconnect();
  }, [user, token]);

  useEffect(() => { setIsPartnerTyping(false); }, [activeChat?._id]);

  useEffect(() => {
    if (targetUserId && friendsList) {
      const friend = friendsList.find(f => f._id === targetUserId);
      if (friend) {
        setActiveChat(friend);
        socket?.emit('getConversationMessages', friend._id);
      }
    }
  }, [targetUserId, friendsList]);

  const handleSend = (e) => {
    e?.preventDefault();
    if (!inputValue.trim() || !activeChat) return;
    socket.emit('sendDirectMessage', {
      receiverId: activeChat._id, text: inputValue.trim(), type: 'text', replyTo: replyTo?._id || null
    });
    setInputValue('');
    setReplyTo(null);
    if (isTypingRef.current) { isTypingRef.current = false; socket.emit('typingStop', { receiverId: activeChat._id }); }
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
    if (!isTypingRef.current && activeChat) {
      isTypingRef.current = true;
      socket.emit('typingStart', { receiverId: activeChat._id });
    }
    clearTimeout(typingRef.current);
    typingRef.current = setTimeout(() => {
      if (isTypingRef.current) {
        isTypingRef.current = false;
        socket?.emit('typingStop', { receiverId: activeChat?._id });
      }
    }, 2000);
  };

  const handleReact = (messageId, emoji) => socket.emit('reactToMessage', { messageId, emoji });
  const handleUnsend = (id) => { if (window.confirm('Unsend this message?')) socket.emit('unsendMessage', { messageId: id }); };
  const handleTheme = (theme) => {
    setActiveTheme(theme);
    if (activeChat) socket.emit('setConversationTheme', { receiverId: activeChat._id, theme });
    setShowTheme(false);
  };

  const isOnline = (uid) => onlineUsers.includes(uid?.toString());
  const filteredFriends = friendsList?.filter(f =>
    f.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.username?.toLowerCase().includes(searchQuery.toLowerCase())) || [];

  const groupedMsgs = messages.reduce((g, m) => {
    const k = fmtDate(m.createdAt);
    if (!g[k]) g[k] = [];
    g[k].push(m);
    return g;
  }, {});

  if (!user) return (
    <div style={{ minHeight: '100vh', background: '#0a0a1a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
      Please login to view messages.
    </div>
  );

  return (
    <>
      <div style={{ display: 'flex', height: '100vh', background: `linear-gradient(135deg, ${tc.bg} 0%, #0a0a1a 100%)`, overflow: 'hidden' }}>
        {/* Sidebar */}
        <div style={{
          display: activeChat ? 'none' : 'flex',
          width: '320px', flexShrink: 0, flexDirection: 'column',
          background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(20px)',
          borderRight: '1px solid rgba(255,255,255,0.05)'
        }}
          className="md:flex"
        >
          <div style={{ padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{ width: 32, height: 32, borderRadius: 12, background: tc.accent + '33', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <MessageCircle style={{ width: 16, height: 16, color: tc.accent }} />
              </div>
              <h1 style={{ fontSize: 20, fontWeight: 900, color: 'white', margin: 0 }}>Messages</h1>
            </div>
            <div style={{ position: 'relative' }}>
              <Search style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: 'rgba(255,255,255,0.3)' }} />
              <input
                value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search friends..."
                style={{
                  width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 12, paddingLeft: 36, paddingRight: 16, paddingTop: 8, paddingBottom: 8,
                  color: 'white', fontSize: 14, outline: 'none', boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: 8 }}>
            <div style={{ padding: '8px 8px 4px', fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Friends ({filteredFriends.length})
            </div>
            {loadingFriends
              ? <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 80 }}><Loader2 className="animate-spin" style={{ width: 20, height: 20, color: 'rgba(255,255,255,0.2)' }} /></div>
              : filteredFriends.length === 0
                ? <div style={{ padding: '32px 16px', textAlign: 'center', color: 'rgba(255,255,255,0.25)', fontSize: 14 }}>No friends yet.<br /><span style={{ fontSize: 12 }}>Add friends from Global Chat!</span></div>
                : filteredFriends.map(friend => {
                  const conv = conversations.find(c => c.participants?.some(p => p._id === friend._id));
                  const unread = conv?.unreadCount?.[user?._id] || 0;
                  return (
                    <ConvItem key={friend._id} conv={conv} partner={friend}
                      isActive={activeChat?._id === friend._id}
                      isOnline={isOnline(friend._id)}
                      unread={unread}
                      onClick={() => { setActiveChat(friend); setSearchParams({ user: friend._id }); }}
                      themeAccent={tc.accent}
                    />
                  );
                })}
          </div>
        </div>

        {/* Chat Area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, visibility: !activeChat ? 'hidden' : 'visible' }}
          className="md:flex md:visible">
          {activeChat ? (
            <>
              {/* Header */}
              <div style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
                <button
                  style={{ padding: 8, borderRadius: 12, background: 'rgba(255,255,255,0)', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.6)', display: 'flex' }}
                  className="md:hidden"
                  onClick={() => { setActiveChat(null); setSearchParams({}); }}
                >
                  <ArrowLeft style={{ width: 20, height: 20 }} />
                </button>
                <div style={{ position: 'relative' }}>
                  <img src={activeChat.profileImage?.startsWith('http') ? activeChat.profileImage : `https://api.dicebear.com/7.x/avataaars/svg?seed=${activeChat.name}`}
                    alt="" style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }} />
                  {isOnline(activeChat._id) && <div style={{ position: 'absolute', bottom: 0, right: 0, width: 12, height: 12, background: '#22c55e', borderRadius: '50%', border: '2px solid black' }} />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3 style={{ fontWeight: 700, color: 'white', margin: 0, fontSize: 15, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{activeChat.name}</h3>
                  <p style={{ fontSize: 12, margin: 0, color: isOnline(activeChat._id) ? '#22c55e' : 'rgba(255,255,255,0.35)' }}>
                    {isPartnerTyping
                      ? <span style={{ color: tc.accent }}>typing...</span>
                      : isOnline(activeChat._id) ? 'â— Online' : `@${activeChat.username}`}
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <div style={{ position: 'relative' }}>
                    <button onClick={() => setShowTheme(!showTheme)}
                      style={{ padding: 8, borderRadius: 12, background: 'rgba(255,255,255,0.05)', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.5)', display: 'flex' }}>
                      <Palette style={{ width: 20, height: 20 }} />
                    </button>
                    <AnimatePresence>
                      {showTheme && <ThemePicker currentTheme={activeTheme} onSelect={handleTheme} onClose={() => setShowTheme(false)} />}
                    </AnimatePresence>
                  </div>
                  <button onClick={() => setCallData({ type: 'audio' })}
                    style={{ padding: 8, borderRadius: 12, background: 'rgba(255,255,255,0.05)', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.5)', display: 'flex' }}>
                    <Phone style={{ width: 20, height: 20 }} />
                  </button>
                  <button onClick={() => setCallData({ type: 'video' })}
                    style={{ padding: 8, borderRadius: 12, background: 'rgba(255,255,255,0.05)', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.5)', display: 'flex' }}>
                    <Video style={{ width: 20, height: 20 }} />
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: 4 }}>
                {Object.entries(groupedMsgs).map(([dk, dayMsgs]) => (
                  <div key={dk}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '16px 0' }}>
                      <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.05)' }} />
                      <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', fontWeight: 500, padding: '2px 12px', background: 'rgba(255,255,255,0.05)', borderRadius: 999 }}>{dk}</span>
                      <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.05)' }} />
                    </div>
                    {dayMsgs.map((msg, idx) => {
                      const isMe = msg.sender?._id === user?._id || msg.sender === user?._id;
                      const showAvatar = !isMe && (idx === 0 || dayMsgs[idx - 1]?.sender?._id !== msg.sender?._id);
                      return <MsgBubble key={msg._id || idx} msg={msg} isMe={isMe} theme={activeTheme} onReact={handleReact} onUnsend={handleUnsend} onReply={setReplyTo} showAvatar={showAvatar} />;
                    })}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Reply Preview */}
              <AnimatePresence>
                {replyTo && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                    style={{ padding: '8px 16px', background: 'rgba(255,255,255,0.03)', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 2, alignSelf: 'stretch', borderRadius: 999, background: tc.accent }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 2, color: tc.accent }}>Replying to</div>
                      <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{replyTo.text || 'ðŸ“· Media'}</div>
                    </div>
                    <button onClick={() => setReplyTo(null)} style={{ color: 'rgba(255,255,255,0.25)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex' }}><X style={{ width: 16, height: 16 }} /></button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Input Bar */}
              <div style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(20px)', borderTop: '1px solid rgba(255,255,255,0.05)', padding: 12, flexShrink: 0 }}>
                <form onSubmit={handleSend} style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <div style={{ position: 'relative' }}>
                      <button type="button" onClick={() => { setShowEmoji(!showEmoji); setShowGif(false); }}
                        style={{ padding: 10, borderRadius: 12, background: 'rgba(255,255,255,0.05)', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.5)', display: 'flex' }}>
                        <Smile style={{ width: 20, height: 20 }} />
                      </button>
                      <AnimatePresence>
                        {showEmoji && <EmojiPicker onSelect={em => { setInputValue(v => v + em); setShowEmoji(false); inputRef.current?.focus(); }} onClose={() => setShowEmoji(false)} />}
                      </AnimatePresence>
                    </div>
                    <div style={{ position: 'relative' }}>
                      <button type="button" onClick={() => { setShowGif(!showGif); setShowEmoji(false); }}
                        style={{ padding: 10, borderRadius: 12, background: 'rgba(255,255,255,0.05)', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.5)', display: 'flex' }}>
                        <Gift style={{ width: 20, height: 20 }} />
                      </button>
                      <AnimatePresence>
                        {showGif && <GifPicker
                          onSelect={gd => { socket.emit('sendDirectMessage', { receiverId: activeChat._id, text: '', type: 'gif', gifData: gd }); setShowGif(false); }}
                          onClose={() => setShowGif(false)}
                        />}
                      </AnimatePresence>
                    </div>
                  </div>

                  <div style={{ flex: 1, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: '10px 16px' }}>
                    <textarea
                      ref={inputRef} value={inputValue} onChange={handleInputChange}
                      onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                      placeholder={`Message ${activeChat.name}...`} rows={1}
                      style={{ width: '100%', background: 'transparent', border: 'none', color: 'white', fontSize: 14, outline: 'none', resize: 'none', maxHeight: 128, fontFamily: 'inherit' }}
                    />
                  </div>

                  <motion.button type="submit" disabled={!inputValue.trim()} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    style={{
                      padding: 12, borderRadius: 16, border: 'none', cursor: inputValue.trim() ? 'pointer' : 'not-allowed',
                      background: inputValue.trim() ? tc.myBubble : 'rgba(255,255,255,0.05)',
                      color: 'white', display: 'flex', flexShrink: 0, opacity: inputValue.trim() ? 1 : 0.35
                    }}>
                    <Send style={{ width: 20, height: 20 }} />
                  </motion.button>
                </form>
              </div>
            </>
          ) : (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 32 }}>
              <motion.div animate={{ y: [0, -8, 0] }} transition={{ repeat: Infinity, duration: 3 }}
                style={{ width: 96, height: 96, borderRadius: 28, background: tc.accent + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
                <MessageCircle style={{ width: 48, height: 48, color: tc.accent }} />
              </motion.div>
              <h2 style={{ fontSize: 24, fontWeight: 900, color: 'white', margin: '0 0 8px' }}>Your Messages</h2>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, maxWidth: 280, margin: 0 }}>Select a friend from the sidebar to start chatting privately.</p>
              <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 8, color: 'rgba(255,255,255,0.15)', fontSize: 12 }}>
                <Globe style={{ width: 12, height: 12 }} /><span>Private conversations</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {callData && (
        <CallOverlay socket={socket} user={user}
          partner={{ socketId: activeChat ? activeChat._id : callerInfo?.from }}
          roomData={{ teamCode: user._id }} callType={callData.type}
          isReceivingCall={isReceivingCall} callerSignal={callerSignal} callerInfo={callerInfo}
          onClose={() => { setCallData(null); setIsReceivingCall(false); }}
        />
      )}
    </>
  );
};

export default Messages;