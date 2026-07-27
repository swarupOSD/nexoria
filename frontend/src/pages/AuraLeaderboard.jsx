import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Zap, Trophy, Star, Swords, ChevronRight, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useGetAuraLeaderboardQuery, useVibeVoteMutation } from '../features/aura/auraApiSlice';
import { useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import { AuraScore } from '../components/AuraScore';
import AuraCard from '../components/AuraCard';
import { triggerAuraStrike } from '../utils/auraStrike';

const TABS = [
  { label: 'All', value: 'all', icon: <Flame className="w-3.5 h-3.5 md:w-4 md:h-4" /> },
  { label: 'Apps', value: 'post', icon: <Zap className="w-3.5 h-3.5 md:w-4 md:h-4" /> },
  { label: 'Games', value: 'game', icon: <Swords className="w-3.5 h-3.5 md:w-4 md:h-4" /> },
  { label: 'Music', value: 'music', icon: <Star className="w-3.5 h-3.5 md:w-4 md:h-4" /> },
];

const RANK_STYLES = [
  { bg: 'from-amber-500/20 to-yellow-500/20', border: 'border-amber-400/40', text: 'text-amber-400', icon: '🥇' },
  { bg: 'from-slate-400/20 to-zinc-400/20', border: 'border-slate-300/40', text: 'text-slate-300', icon: '🥈' },
  { bg: 'from-orange-600/20 to-amber-700/20', border: 'border-orange-500/40', text: 'text-orange-400', icon: '🥉' },
];

export default function AuraLeaderboard() {
  const [activeTab, setActiveTab] = useState('all');
  const [showAuraCard, setShowAuraCard] = useState(false);
  const { data, isLoading, refetch } = useGetAuraLeaderboardQuery(activeTab);
  const [vibeVote] = useVibeVoteMutation();
  const { user } = useSelector((s) => s.auth);
  const navigate = useNavigate();
  
  const items = data?.data || [];
  const clubItems = items.filter((i) => i.score >= 900);
  const normalItems = items.filter((i) => i.score < 900);

  const handleVibeVote = async (item) => {
    if (!user) return toast.error('Login করুন Vibe দিতে!', { id: 'auth_error' });
    try {
      const res = await vibeVote({ type: item.itemType, id: item.itemId }).unwrap();
      if (res.data?.questCompleted) {
        toast.success(res.message, { icon: '🎁', duration: 5000 });
      } else {
        toast.success(res.message || '🔥 Vibe sent!');
      }
      triggerAuraStrike();
    } catch (err) {
      toast.error(err?.data?.message || 'Already vibed today!');
    }
  };

  return (
    <div className="min-h-screen bg-[#080b14] text-white font-jakarta pb-24 md:pb-0">
      <Helmet>
        <title>Aura Leaderboard — Nexoria</title>
        <meta name="description" content="See which apps, games, and songs have the highest Aura Score on Nexoria. Vote, battle, and rise." />
      </Helmet>

      {/* 📱 MOBILE EXCLUSIVE: STICKY HEADER */}
      <div className="md:hidden sticky top-0 z-50 bg-[#080b14]/90 backdrop-blur-3xl border-b border-white/5 pt-4 pb-3 px-4 shadow-2xl flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-all active:scale-95 border border-white/5">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-pink-400 tracking-tight leading-tight">Aura Rankings</h1>
            <p className="text-[9px] font-bold uppercase tracking-widest text-amber-500/80 flex items-center gap-1"><Flame className="w-2.5 h-2.5" /> Live Updates</p>
          </div>
        </div>
        {user && (
          <button 
            onClick={() => setShowAuraCard(true)}
            className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center border border-amber-500/20 active:scale-95 transition-transform"
          >
            <Flame className="w-5 h-5 text-amber-400" />
          </button>
        )}
      </div>

      {/* 📱 MOBILE EXCLUSIVE: SLIM BATTLE BANNER */}
      <div className="md:hidden px-3 mb-4">
        <Link
          to="/aura/battle"
          className="w-full flex items-center justify-between p-3 bg-gradient-to-r from-purple-900/40 to-pink-900/40 border border-purple-500/30 rounded-xl active:scale-[0.98] transition-transform"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
              <Swords className="w-4 h-4 text-pink-400" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-pink-400 uppercase tracking-widest">Live Arena</p>
              <p className="text-sm font-black text-white leading-tight">Enter Aura Battle</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-pink-500" />
        </Link>
      </div>

      {/* 💻 DESKTOP EXCLUSIVE: MASSIVE HERO BANNER */}
      <div className="hidden md:block relative overflow-hidden py-16 px-4 text-center">
        <div className="absolute inset-0 bg-gradient-to-b from-violet-900/30 via-purple-900/10 to-transparent pointer-events-none" />
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full bg-purple-600/10 blur-[100px]" />

        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-black uppercase tracking-widest mb-4">
            <Flame className="w-3.5 h-3.5 animate-pulse" /> LIVE AURA RANKINGS
          </div>
          <h1 className="text-4xl md:text-6xl font-black mb-4 bg-gradient-to-r from-amber-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Aura Leaderboard
          </h1>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            The most hyped apps, games & songs — ranked live by the Nexoria community
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-6">
            <Link
              to="/aura/battle"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-2xl font-bold text-sm transition-all hover:shadow-lg hover:shadow-purple-500/30 active:scale-95"
            >
              <Swords className="w-4 h-4" /> Enter Aura Battle <ChevronRight className="w-4 h-4" />
            </Link>
            
            {user && (
              <button
                onClick={() => setShowAuraCard(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-2xl font-bold text-sm transition-all hover:shadow-lg active:scale-95 text-white"
              >
                <Flame className="w-4 h-4 text-amber-500" /> My Aura Card
              </button>
            )}
          </div>
        </motion.div>
      </div>

      <div className="max-w-4xl mx-auto px-3 md:px-4 pb-16">

        {/* Tabs */}
        <div className="flex items-center gap-1 md:gap-2 mb-6 md:mb-8 bg-white/5 rounded-xl md:rounded-2xl p-1 md:p-1.5 w-full md:w-fit mx-auto overflow-x-auto scrollbar-hide snap-x">
          {TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`snap-start flex-1 md:flex-none flex justify-center items-center gap-1.5 md:gap-2 px-3 md:px-4 py-2 rounded-lg md:rounded-xl text-[11px] md:text-sm font-bold transition-all active:scale-[0.98] ${
                activeTab === tab.value
                  ? 'bg-gradient-to-r from-purple-600 to-violet-600 text-white shadow-lg'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {isLoading && (
          <div className="flex flex-col gap-2 md:gap-3">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-16 md:h-20 rounded-xl md:rounded-2xl bg-white/5 animate-pulse" />
            ))}
          </div>
        )}

        {/* 999+ Club */}
        {clubItems.length > 0 && (
          <div className="mb-6 md:mb-8">
            <div className="flex items-center gap-1.5 md:gap-2 mb-3 md:mb-4 px-1">
              <Flame className="w-4 h-4 md:w-5 md:h-5 text-amber-400 animate-pulse" />
              <h2 className="text-base md:text-lg font-black text-amber-400 uppercase tracking-widest">999+ Aura Club</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
              {clubItems.map((item, idx) => (
                <motion.div
                  key={item._id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  className="relative flex items-center gap-3 md:gap-4 p-3 md:p-4 rounded-xl md:rounded-2xl border bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-amber-400/30 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-amber-400/5 animate-pulse rounded-xl md:rounded-2xl" />
                  <img src={item.image || '/placeholder.png'} alt={item.title} className="w-12 h-12 md:w-14 md:h-14 rounded-lg md:rounded-xl object-cover flex-shrink-0 relative z-10" />
                  <div className="flex-1 min-w-0 relative z-10">
                    <p className="font-black text-amber-300 text-[13px] md:text-base truncate">{item.title}</p>
                    <p className="text-[9px] md:text-xs text-amber-500/70 uppercase font-bold">{item.itemType}</p>
                  </div>
                  <div className="relative z-10 scale-90 md:scale-100 origin-right">
                    <AuraScore score={item.score} size="sm" showLabel={false} />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Main Rankings */}
        <div className="flex flex-col gap-2 md:gap-3">
          <AnimatePresence>
            {normalItems.map((item, idx) => {
              const rankStyle = RANK_STYLES[idx] || {};
              return (
                <motion.div
                  key={item._id || idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.04 }}
                  className={`flex items-center gap-2.5 md:gap-4 p-2.5 md:p-4 rounded-xl md:rounded-2xl border bg-gradient-to-r ${
                    rankStyle.bg || 'from-white/5 to-white/5 md:from-white/[0.03] md:to-white/5'
                  } ${rankStyle.border || 'border-white/10'} hover:border-purple-500/30 transition-all group active:scale-[0.99] md:active:scale-100`}
                >
                  {/* Rank */}
                  <div className="w-6 md:w-8 flex-shrink-0 text-center">
                    {idx < 3 ? (
                      <span className="text-base md:text-xl">{rankStyle.icon}</span>
                    ) : (
                      <span className="text-slate-500 font-black text-xs md:text-sm">#{idx + 1}</span>
                    )}
                  </div>

                  {/* Image */}
                  <img
                    src={item.image || '/placeholder.png'}
                    alt={item.title}
                    className="w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl object-cover flex-shrink-0"
                  />

                  {/* Info */}
                  <div className="flex-1 min-w-0 pr-1 md:pr-0">
                    <p className="font-bold text-white text-[13px] md:text-base truncate leading-tight mb-0.5 md:mb-0">{item.title}</p>
                    <div className="flex items-center gap-1.5 md:gap-2 md:mt-1">
                      <span className="text-[8px] md:text-[10px] uppercase font-bold text-slate-400 md:text-slate-500 bg-white/10 md:bg-white/5 px-1.5 py-0.5 md:px-2 md:py-0.5 rounded-full">
                        {item.itemType}
                      </span>
                      <span className="text-[9px] md:text-[10px] text-slate-500">
                        {item.vibeVotes || 0} vibes
                      </span>
                    </div>
                  </div>

                  {/* Aura Score */}
                  <div className="scale-75 md:scale-100 origin-right mr-1 md:mr-0 shrink-0">
                    <AuraScore score={item.score} size="sm" showLabel={false} />
                  </div>

                  {/* Vibe Vote Button - Always visible on mobile, hover on desktop */}
                  <button
                    onClick={() => handleVibeVote(item)}
                    className="flex items-center justify-center gap-1 px-2.5 py-1.5 md:px-3 md:py-1.5 rounded-lg md:rounded-xl text-[10px] md:text-xs font-bold bg-purple-500/10 md:hover:bg-purple-500/25 border border-purple-500/20 md:hover:border-purple-400/40 text-purple-400 transition-all active:scale-90 md:active:scale-95 opacity-100 md:opacity-0 md:group-hover:opacity-100 shrink-0"
                  >
                    <Flame className="w-3 h-3" /> <span className="hidden sm:inline">Vibe</span>
                  </button>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {!isLoading && items.length === 0 && (
          <div className="text-center py-16 text-slate-500 bg-white/5 rounded-2xl md:rounded-3xl mt-4 border border-white/5">
            <Trophy className="w-10 h-10 md:w-12 md:h-12 mx-auto mb-3 md:mb-4 opacity-30" />
            <p className="font-bold text-sm md:text-base">No aura data yet. Be the first to vibe!</p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showAuraCard && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowAuraCard(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative z-[210] w-full max-w-md"
            >
              <button 
                onClick={() => setShowAuraCard(false)}
                className="absolute -top-12 right-0 p-2 text-white/50 hover:text-white bg-white/10 rounded-full transition-colors active:scale-95"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
              <AuraCard />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      
      <style dangerouslySetInnerHTML={{__html: `
        .scrollbar-hide::-webkit-scrollbar {
            display: none;
        }
        .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
      `}} />
    </div>
  );
}
