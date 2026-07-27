import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquare, Image, Mic, Smile, Users, TrendingUp, 
  BarChart3, RefreshCw, Camera, Search, X, ChevronLeft,
  ChevronRight, Eye, Play, FileText, Shield, AlertCircle,
  Clock, ArrowLeft
} from 'lucide-react';
import { 
  useGetPrivateChatAnalyticsQuery, 
  useGetAdminConversationsQuery,
  useGetAdminConversationMessagesQuery
} from '../../features/analytics/analyticsApiSlice';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import CountUp from '../../components/CountUp';

const PIE_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];

const API_URL = import.meta.env.VITE_API_URL || '';
const avatarSrc = (img) =>
  img?.startsWith('http') ? img : `${API_URL}/uploads/avatars/${img || 'default.jpg'}`;

// ── Message Bubble Component ─────────────────────────────────────────────────
const MessageBubble = ({ msg }) => {
  const isUnsent = msg.isUnsent;

  const renderContent = () => {
    if (isUnsent) {
      return (
        <span className="italic text-slate-400 text-xs flex items-center gap-1">
          <AlertCircle className="w-3 h-3" /> This message was unsent
        </span>
      );
    }
    switch (msg.type) {
      case 'text':
        return <p className="text-sm dark:text-white text-slate-900 whitespace-pre-wrap break-words">{msg.text}</p>;
      case 'image':
        return (
          <div className="space-y-1">
            {msg.mediaUrl ? (
              <img
                src={msg.mediaUrl}
                alt="Image"
                className="max-w-[200px] rounded-xl object-cover cursor-pointer hover:opacity-90 transition"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            ) : <span className="text-xs text-slate-400 italic">Image (URL missing)</span>}
            {msg.text && <p className="text-xs dark:text-slate-300 mt-1">{msg.text}</p>}
          </div>
        );
      case 'voice':
        return (
          <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-700 px-3 py-2 rounded-xl min-w-[160px]">
            <div className="p-1.5 bg-purple-500 rounded-full">
              <Mic className="w-3 h-3 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-semibold dark:text-white">Voice Message</p>
              {msg.mediaUrl ? (
                <audio controls className="h-6 w-full mt-1" style={{ height: '24px' }}>
                  <source src={msg.mediaUrl} />
                </audio>
              ) : <p className="text-xs text-slate-400">No audio URL</p>}
            </div>
          </div>
        );
      case 'gif':
        return (
          <div>
            {msg.gifData?.url ? (
              <img src={msg.gifData.url} alt={msg.gifData.title || 'GIF'} className="max-w-[200px] rounded-xl" />
            ) : msg.mediaUrl ? (
              <img src={msg.mediaUrl} alt="GIF" className="max-w-[200px] rounded-xl" />
            ) : <span className="text-xs text-slate-400 italic flex items-center gap-1"><Smile className="w-3 h-3" /> GIF (preview unavailable)</span>}
          </div>
        );
      case 'sticker':
        return (
          <div className="flex items-center gap-2">
            <Smile className="w-5 h-5 text-yellow-500" />
            {msg.mediaUrl ? (
              <img src={msg.mediaUrl} alt="Sticker" className="w-16 h-16 object-contain" />
            ) : <span className="text-xs text-slate-400 italic">Sticker</span>}
          </div>
        );
      default:
        return <p className="text-sm dark:text-white">{msg.text || `[${msg.type}]`}</p>;
    }
  };

  const TYPE_BADGES = {
    text: { label: 'TEXT', color: 'bg-slate-500/20 text-slate-400' },
    image: { label: 'IMAGE', color: 'bg-pink-500/20 text-pink-400' },
    voice: { label: 'VOICE', color: 'bg-purple-500/20 text-purple-400' },
    gif: { label: 'GIF', color: 'bg-yellow-500/20 text-yellow-500' },
    sticker: { label: 'STICKER', color: 'bg-blue-500/20 text-blue-400' },
  };
  const badge = TYPE_BADGES[msg.type] || TYPE_BADGES.text;

  return (
    <div className="flex items-start gap-2 py-1.5 px-1 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl transition group">
      <img src={avatarSrc(msg.sender?.profileImage)} className="w-8 h-8 rounded-full object-cover shrink-0 mt-0.5 border border-white/10" alt="" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
          <span className="text-xs font-bold dark:text-white text-slate-800">{msg.sender?.name || 'Unknown'}</span>
          <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${badge.color}`}>{badge.label}</span>
          <span className="text-[10px] text-slate-400">{new Date(msg.createdAt).toLocaleString()}</span>
          {msg.reactions?.length > 0 && (
            <span className="text-xs">{msg.reactions.map(r => r.emoji).join('')}</span>
          )}
        </div>
        {renderContent()}
        {msg.replyTo && (
          <div className="mt-1 pl-2 border-l-2 border-indigo-400/50 text-xs text-slate-400 italic">
            ↩ Reply to: {msg.replyTo?.sender?.name || 'message'}
          </div>
        )}
      </div>
    </div>
  );
};

// ── Conversation Messages Viewer ─────────────────────────────────────────────
const ConversationViewer = ({ conversationId, onBack }) => {
  const [page, setPage] = useState(1);
  const { data: res, isLoading } = useGetAdminConversationMessagesQuery({ conversationId, page, limit: 60 });
  const messages = res?.data || [];
  const conversation = res?.conversation;
  const totalPages = res?.totalPages || 1;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4 p-3 glass-card">
        <button onClick={onBack} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition active:scale-95">
          <ArrowLeft className="w-5 h-5 dark:text-white" />
        </button>
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {conversation?.participants?.map((p, i) => (
            <img key={i} src={avatarSrc(p.profileImage)} className="w-8 h-8 rounded-full object-cover border-2 border-white/20" alt="" style={{ marginLeft: i > 0 ? '-8px' : 0 }} />
          ))}
          <div className="ml-2 min-w-0">
            <p className="text-sm font-bold dark:text-white truncate">
              {conversation?.participants?.map(p => p.name).join(' ↔ ')}
            </p>
            <p className="text-xs text-slate-500 truncate">
              {conversation?.participants?.map(p => p.email).join(', ')}
            </p>
          </div>
        </div>
        <span className="text-xs text-slate-400 shrink-0">{res?.total || 0} messages</span>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mb-3">
          <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition disabled:opacity-30 active:scale-95">
            <ChevronLeft className="w-4 h-4 dark:text-white" />
          </button>
          <span className="text-xs text-slate-500">Page {page} / {totalPages}</span>
          <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition disabled:opacity-30 active:scale-95">
            <ChevronRight className="w-4 h-4 dark:text-white" />
          </button>
        </div>
      )}

      {/* Messages */}
      <div className="glass-card p-3 flex-1 overflow-y-auto custom-scrollbar space-y-1 max-h-[65vh]">
        {isLoading ? (
          <div className="flex items-center justify-center h-40 text-slate-400 text-sm">Loading messages...</div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-slate-400">
            <MessageSquare className="w-10 h-10 mb-2 opacity-30" />
            <p className="text-sm">No messages in this conversation</p>
          </div>
        ) : (
          messages.map(msg => <MessageBubble key={msg._id} msg={msg} />)
        )}
      </div>
    </div>
  );
};

// ── Conversations List ───────────────────────────────────────────────────────
const ConversationsList = ({ onSelect }) => {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const { data: res, isLoading, refetch } = useGetAdminConversationsQuery({ page, limit: 20, search });
  const conversations = res?.data || [];
  const totalPages = res?.totalPages || 1;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by user name or email..."
            className="w-full pl-9 pr-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-sm dark:text-white border border-transparent focus:border-indigo-500 outline-none"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2">
              <X className="w-4 h-4 text-slate-400" />
            </button>
          )}
        </div>
        <button onClick={refetch} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition active:scale-95">
          <RefreshCw className="w-4 h-4 dark:text-white" />
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-10 text-slate-400 text-sm">Loading conversations...</div>
      ) : conversations.length === 0 ? (
        <div className="text-center py-10 glass-card text-slate-400">
          <MessageSquare className="w-10 h-10 mx-auto mb-2 opacity-30" />
          <p className="text-sm">No conversations found</p>
        </div>
      ) : (
        <div className="space-y-2">
          {conversations.map(conv => {
            const participants = conv.participants || [];
            const lastMsg = conv.lastMessage;
            return (
              <motion.button
                key={conv._id}
                onClick={() => onSelect(conv._id)}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full glass-card p-3 flex items-center gap-3 hover:border-indigo-500/40 border border-transparent transition-all text-left active:scale-[0.99] cursor-pointer"
              >
                {/* Avatars */}
                <div className="relative shrink-0 w-12 h-10">
                  {participants.slice(0, 2).map((p, i) => (
                    <img
                      key={p._id}
                      src={avatarSrc(p.profileImage)}
                      className="absolute w-8 h-8 rounded-full object-cover border-2 border-white dark:border-slate-900"
                      style={{ top: i === 0 ? 0 : 'auto', bottom: i === 1 ? 0 : 'auto', left: i === 0 ? 0 : 'auto', right: i === 1 ? 0 : 'auto' }}
                      alt=""
                    />
                  ))}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold dark:text-white truncate">
                    {participants.map(p => p.name).join(' ↔ ')}
                  </p>
                  <p className="text-xs text-slate-500 truncate">
                    {participants.map(p => p.email).join(' • ')}
                  </p>
                  {lastMsg && (
                    <p className="text-xs text-slate-400 mt-0.5 truncate">
                      {lastMsg.isUnsent ? (
                        <span className="italic">Message unsent</span>
                      ) : lastMsg.type === 'text' ? lastMsg.text : (
                        <span className="italic">
                          {lastMsg.type === 'image' ? '📷 Image' : 
                           lastMsg.type === 'voice' ? '🎤 Voice message' :
                           lastMsg.type === 'gif' ? '🎭 GIF' : 
                           lastMsg.type === 'sticker' ? '😄 Sticker' : lastMsg.type}
                        </span>
                      )}
                    </p>
                  )}
                </div>

                <div className="shrink-0 text-right">
                  <p className="text-xs font-bold text-indigo-500">{(conv.messageCount || 0).toLocaleString()} msgs</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{new Date(conv.updatedAt).toLocaleDateString()}</p>
                  <Eye className="w-4 h-4 text-slate-400 mt-1 ml-auto" />
                </div>
              </motion.button>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-2">
          <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-sm disabled:opacity-30 hover:bg-slate-200 dark:hover:bg-slate-700 transition active:scale-95">← Prev</button>
          <span className="text-sm text-slate-500">Page {page} / {totalPages}</span>
          <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-sm disabled:opacity-30 hover:bg-slate-200 dark:hover:bg-slate-700 transition active:scale-95">Next →</button>
        </div>
      )}
    </div>
  );
};

// ── Main Component ───────────────────────────────────────────────────────────
const PrivateChatAnalytics = () => {
  const [days, setDays] = useState(7);
  const [view, setView] = useState('analytics'); // 'analytics' | 'conversations' | 'messages'
  const [selectedConvId, setSelectedConvId] = useState(null);

  const { data: res, isLoading, refetch } = useGetPrivateChatAnalyticsQuery(days);
  const data = res?.data || {};
  const messagesPerDay = data.messagesPerDay || [];
  const topSenders = data.topSenders || [];
  const summary = data.summary || {};

  const pieData = [
    { name: 'Text', value: summary.textCount || 0 },
    { name: 'Image', value: summary.imageCount || 0 },
    { name: 'GIF', value: summary.gifCount || 0 },
    { name: 'Voice', value: summary.voiceCount || 0 },
  ].filter(d => d.value > 0);

  return (
    <div className="space-y-4 md:space-y-5">
      <Helmet><title>Private Chat Monitor - Admin Panel</title></Helmet>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold dark:text-white flex items-center gap-2">
            <Shield className="w-6 h-6 text-indigo-500" /> Private Chat Monitor
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">Full admin surveillance — analytics + actual messages</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex bg-slate-100 dark:bg-slate-800 rounded-xl p-1 gap-1">
            {[
              { id: 'analytics', label: 'Analytics', icon: BarChart3 },
              { id: 'conversations', label: 'Conversations', icon: MessageSquare },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => { setView(tab.id); setSelectedConvId(null); }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition active:scale-95 ${view === tab.id ? 'bg-white dark:bg-slate-700 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
              >
                <tab.icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            ))}
          </div>
          {view === 'analytics' && (
            <>
              <select value={days} onChange={e => setDays(Number(e.target.value))} className="px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-sm dark:text-white border border-transparent focus:border-indigo-500 outline-none">
                <option value={1}>Last 24h</option>
                <option value={7}>Last 7 days</option>
                <option value={30}>Last 30 days</option>
              </select>
              <button onClick={refetch} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition active:scale-95">
                <RefreshCw className="w-4 h-4 dark:text-white" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* ANALYTICS VIEW */}
      {view === 'analytics' && (
        <div className="space-y-4">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Total Conversations', value: data.totalConversations || 0, icon: Users, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
              { label: 'Total Messages', value: data.totalMessages || 0, icon: MessageSquare, color: 'text-blue-500', bg: 'bg-blue-500/10' },
              { label: 'Images Sent', value: summary.imageCount || 0, icon: Camera, color: 'text-pink-500', bg: 'bg-pink-500/10' },
              { label: 'Voice Messages', value: summary.voiceCount || 0, icon: Mic, color: 'text-green-500', bg: 'bg-green-500/10' },
            ].map(s => (
              <div key={s.label} className="glass-card p-3 md:p-4 flex items-center gap-3">
                <div className={`p-2 rounded-lg ${s.bg} shrink-0`}><s.icon className={`w-5 h-5 ${s.color}`} /></div>
                <div>
                  <p className="text-xs text-slate-500 font-medium leading-tight">{s.label}</p>
                  <p className={`text-xl font-black ${s.color}`}>{isLoading ? '...' : <CountUp value={s.value} />}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Mini breakdown */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Text', value: summary.textCount || 0, icon: FileText, color: 'text-slate-400' },
              { label: 'Images', value: summary.imageCount || 0, icon: Camera, color: 'text-pink-400' },
              { label: 'GIFs', value: summary.gifCount || 0, icon: Smile, color: 'text-yellow-400' },
              { label: 'Voice', value: summary.voiceCount || 0, icon: Mic, color: 'text-green-400' },
            ].map(s => (
              <div key={s.label} className="glass-card p-3 flex items-center gap-2">
                <s.icon className={`w-4 h-4 ${s.color} shrink-0`} />
                <div>
                  <p className="text-xs text-slate-500">{s.label}</p>
                  <p className={`text-lg font-black ${s.color}`}>{(s.value || 0).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Chart + Pie */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-2 glass-card p-4">
              <h3 className="text-sm font-bold dark:text-white mb-3 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-indigo-500" /> Messages Per Day
              </h3>
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={messagesPerDay}>
                    <defs>
                      <linearGradient id="chatGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" vertical={false} />
                    <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis stroke="#64748b" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', fontSize: '12px' }} />
                    <Area type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={2} fill="url(#chatGrad)" name="Messages" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-4">
              <h3 className="text-sm font-bold dark:text-white mb-3">Message Types</h3>
              {pieData.length > 0 ? (
                <div className="h-48 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="45%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                        {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                      </Pie>
                      <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', fontSize: '12px' }} />
                      <Legend iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-48 flex items-center justify-center text-slate-400 text-sm">No data</div>
              )}
            </motion.div>
          </div>

          {/* Top Senders */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-4">
            <h3 className="text-sm font-bold dark:text-white mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-purple-500" /> Most Active Users
            </h3>
            <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar pr-1">
              {topSenders.map((s, i) => (
                <div key={i} className="flex items-center gap-3 p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition">
                  <span className="text-xs font-black text-slate-400 w-5">#{i + 1}</span>
                  <img src={avatarSrc(s.user?.profileImage)} className="w-8 h-8 rounded-full object-cover" alt="" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold dark:text-white truncate">{s.user?.name}</p>
                    <p className="text-xs text-slate-500 truncate">{s.user?.email}</p>
                  </div>
                  <p className="text-sm font-bold text-indigo-500">{s.messageCount} msgs</p>
                </div>
              ))}
              {topSenders.length === 0 && <p className="text-slate-500 text-sm text-center py-4">No data for this period</p>}
            </div>
          </motion.div>
        </div>
      )}

      {/* CONVERSATIONS VIEW */}
      {view === 'conversations' && !selectedConvId && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-2 mb-3 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
            <Shield className="w-4 h-4 text-amber-500 shrink-0" />
            <p className="text-xs text-amber-700 dark:text-amber-400">Admin view — all private messages are visible for moderation purposes.</p>
          </div>
          <ConversationsList onSelect={(id) => { setSelectedConvId(id); setView('messages'); }} />
        </motion.div>
      )}

      {/* MESSAGES VIEW */}
      {view === 'messages' && selectedConvId && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <ConversationViewer
            conversationId={selectedConvId}
            onBack={() => { setSelectedConvId(null); setView('conversations'); }}
          />
        </motion.div>
      )}
    </div>
  );
};

export default PrivateChatAnalytics;
