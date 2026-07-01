import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Zap, Trophy, Star, Swords, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useGetAuraLeaderboardQuery, useVibeVoteMutation } from '../features/aura/auraApiSlice';
import { useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import { AuraScore } from '../components/AuraScore';
import AuraCard from '../components/AuraCard';
import WrappedModal from '../components/WrappedModal';
import { triggerAuraStrike } from '../utils/auraStrike';

const TABS = [
  { label: 'All', value: 'all', icon: <Flame className="w-4 h-4" /> },
  { label: 'Apps', value: 'post', icon: <Zap className="w-4 h-4" /> },
  { label: 'Games', value: 'game', icon: <Swords className="w-4 h-4" /> },
  { label: 'Music', value: 'music', icon: <Star className="w-4 h-4" /> },
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
    <div className="min-h-screen bg-[#080b14] text-white">
      <Helmet>
        <title>Aura Leaderboard — Nexoria</title>
        <meta name="description" content="See which apps, games, and songs have the highest Aura Score on Nexoria. Vote, battle, and rise." />
      </Helmet>

      {/* Hero Banner */}
      <div className="relative overflow-hidden py-16 px-4 text-center">
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

      <div className="max-w-4xl mx-auto px-4 pb-16">

        {/* Tabs */}
        <div className="flex items-center gap-2 mb-8 bg-white/5 rounded-2xl p-1.5 w-fit mx-auto overflow-x-auto max-w-full scrollbar-hide">
          {TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                activeTab === tab.value
                  ? 'bg-gradient-to-r from-purple-600 to-violet-600 text-white shadow-lg'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {isLoading && (
          <div className="flex flex-col gap-3">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-20 rounded-2xl bg-white/5 animate-pulse" />
            ))}
          </div>
        )}

        {/* 999+ Club */}
        {clubItems.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Flame className="w-5 h-5 text-amber-400 animate-pulse" />
              <h2 className="text-lg font-black text-amber-400 uppercase tracking-widest">999+ Aura Club</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {clubItems.map((item, idx) => (
                <motion.div
                  key={item._id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  className="relative flex items-center gap-4 p-4 rounded-2xl border bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-amber-400/30 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-amber-400/5 animate-pulse rounded-2xl" />
                  <img src={item.image || '/placeholder.png'} alt={item.title} className="w-14 h-14 rounded-xl object-cover flex-shrink-0 relative z-10" />
                  <div className="flex-1 min-w-0 relative z-10">
                    <p className="font-black text-amber-300 truncate">{item.title}</p>
                    <p className="text-xs text-amber-500/70 uppercase font-bold">{item.itemType}</p>
                  </div>
                  <div className="relative z-10">
                    <AuraScore score={item.score} size="sm" showLabel={false} />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Main Rankings */}
        <div className="flex flex-col gap-3">
          <AnimatePresence>
            {normalItems.map((item, idx) => {
              const rankStyle = RANK_STYLES[idx] || {};
              return (
                <motion.div
                  key={item._id || idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.04 }}
                  className={`flex items-center gap-4 p-4 rounded-2xl border bg-gradient-to-r ${
                    rankStyle.bg || 'from-white/3 to-white/5'
                  } ${rankStyle.border || 'border-white/10'} hover:border-purple-500/30 transition-all group`}
                >
                  {/* Rank */}
                  <div className="w-8 flex-shrink-0 text-center">
                    {idx < 3 ? (
                      <span className="text-xl">{rankStyle.icon}</span>
                    ) : (
                      <span className="text-slate-500 font-black text-sm">#{idx + 1}</span>
                    )}
                  </div>

                  {/* Image */}
                  <img
                    src={item.image || '/placeholder.png'}
                    alt={item.title}
                    className="w-12 h-12 rounded-xl object-cover flex-shrink-0"
                  />

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-white truncate">{item.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] uppercase font-bold text-slate-500 bg-white/5 px-2 py-0.5 rounded-full">
                        {item.itemType}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {item.vibeVotes || 0} vibes
                      </span>
                    </div>
                  </div>

                  {/* Aura Score */}
                  <AuraScore score={item.score} size="sm" showLabel={false} />

                  {/* Vibe Vote Button */}
                  <button
                    onClick={() => handleVibeVote(item)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-purple-500/10 hover:bg-purple-500/25 border border-purple-500/20 hover:border-purple-400/40 text-purple-400 transition-all active:scale-95 opacity-0 group-hover:opacity-100"
                  >
                    <Flame className="w-3 h-3" /> Vibe
                  </button>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {!isLoading && items.length === 0 && (
          <div className="text-center py-16 text-slate-500">
            <Trophy className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p className="font-bold">No aura data yet. Be the first to vibe!</p>
          </div>
        )}
      </div>

      <WrappedModal isOpen={showAuraCard} onClose={() => setShowAuraCard(false)} title="Your Personal Aura" maxWidth="max-w-md">
        <AuraCard />
      </WrappedModal>
    </div>
  );
}
