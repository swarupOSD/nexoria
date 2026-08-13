import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Flame, Trophy, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { useGetPersonalAuraQuery } from '../../features/aura/auraApiSlice';
import { AuraScore } from '../AuraScore';

// ─── Stitch Glass Panel ───────────────────────────────────────────────────────
const GlassPanel = ({ children, className = '', style = {} }) => (
  <div
    className={`relative rounded-xl border border-white/10 backdrop-blur-xl overflow-hidden ${className}`}
    style={{ background: 'rgba(53,53,53,0.06)', ...style }}
  >
    {children}
  </div>
);

// ─── Badge definitions ────────────────────────────────────────────────────────
const BADGE_DEFS = [
  {
    key: 'first_vibe',
    emoji: '🎭',
    label: 'First Vibe',
    desc: 'Cast your very first Vibe vote.',
    accent: '#a855f7',
  },
  {
    key: 'aura_legend',
    emoji: '👑',
    label: 'Aura Legend',
    desc: 'Accumulated 500+ Vibe votes.',
    accent: '#f59e0b',
    glow: '0 0 18px rgba(245,158,11,0.3)',
  },
  {
    key: 'streak_master',
    emoji: '🔥',
    label: 'Streak Master',
    desc: 'Maintained a 7-day login streak.',
    accent: '#f97316',
    glow: '0 0 18px rgba(249,115,22,0.3)',
  },
  {
    key: 'music_lover',
    emoji: '🎧',
    label: 'Music Lover',
    desc: 'Listened to 50+ tracks on Nexoria.',
    accent: '#ec4899',
    glow: '0 0 18px rgba(236,72,153,0.3)',
  },
  {
    key: 'app_tester',
    emoji: '📱',
    label: 'App Tester',
    desc: 'Downloaded 10+ apps from the library.',
    accent: '#3b82f6',
    glow: '0 0 18px rgba(59,130,246,0.3)',
  },
  {
    key: 'social_butterfly',
    emoji: '🦋',
    label: 'Social Butterfly',
    desc: 'Added 5+ items to your Wishlist.',
    accent: '#10b981',
    glow: '0 0 18px rgba(16,185,129,0.3)',
  },
];

// ─── Aura bar chart (stylised, no lib) ───────────────────────────────────────
const BarChart = ({ topVibes = [] }) => {
  if (!topVibes.length) return null;
  const max = Math.max(...topVibes.map((v) => v.score), 1);
  return (
    <div className="space-y-2.5 mt-4">
      {topVibes.slice(0, 5).map((item, i) => (
        <div key={i}>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-white/60 truncate max-w-[70%]">{item.title}</span>
            <span className="font-mono font-bold text-[#e9c349]">{item.score}</span>
          </div>
          <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ background: '#e9c349', boxShadow: '0 0 6px rgba(233,195,73,0.5)' }}
              initial={{ width: 0 }}
              animate={{ width: `${(item.score / max) * 100}%` }}
              transition={{ delay: i * 0.1, duration: 0.8, ease: 'easeOut' }}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

// ─── AuraMasteryTab ───────────────────────────────────────────────────────────
const AuraMasteryTab = ({ user }) => {
  const { data: auraRes, isLoading, isError } = useGetPersonalAuraQuery();
  const aura = auraRes?.data;

  const earnedBadges = BADGE_DEFS.filter((b) => user?.badges?.includes(b.key));
  const lockedBadges = BADGE_DEFS.filter((b) => !user?.badges?.includes(b.key));

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 text-white/30">
        <Loader2 className="w-8 h-8 animate-spin" />
        <p className="text-sm font-mono">Loading your Aura data...</p>
      </div>
    );
  }

  if (isError || !aura) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3 text-white/30">
        <AlertCircle className="w-8 h-8" />
        <p className="text-sm font-mono">Could not load Aura data.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-white">
      {/* ── Header ── */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-3xl font-bold text-white mb-1">Aura & Mastery</h2>
        <p className="text-sm text-white/40">
          Your digital influence across the Nexoria network.
        </p>
      </motion.div>

      {/* ── Bento grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Main Aura card — 8 cols */}
        <motion.div
          className="lg:col-span-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <GlassPanel
            className="p-7 relative overflow-hidden h-full"
            style={{
              boxShadow: '0 0 40px rgba(192,193,255,0.06)',
              borderColor: 'rgba(192,193,255,0.1)',
            }}
          >
            {/* bg icon */}
            <div className="absolute top-4 right-4 opacity-10 pointer-events-none">
              <Flame className="w-24 h-24" style={{ color: aura.color || '#e9c349' }} />
            </div>

            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8 relative z-10">
              <div>
                <p
                  className="text-[11px] uppercase tracking-widest font-mono mb-2"
                  style={{ color: aura.color || '#e9c349' }}
                >
                  Personal Aura Power
                </p>
                <div
                  className="text-6xl md:text-7xl font-black leading-none tracking-tighter"
                  style={{
                    color: aura.color || '#e9c349',
                    textShadow: `0 0 30px ${aura.color || '#e9c349'}50`,
                  }}
                >
                  {aura.personalScore ?? 0}
                </div>
              </div>
              <div className="text-right shrink-0">
                <span
                  className="inline-block px-3 py-1 rounded-full text-[11px] font-mono font-bold uppercase tracking-wider border mb-2"
                  style={{
                    background: `${aura.color || '#e9c349'}12`,
                    borderColor: `${aura.color || '#e9c349'}30`,
                    color: aura.color || '#e9c349',
                  }}
                >
                  {aura.tier || 'Rookie'}
                </span>
                <p className="text-sm text-white/40 font-mono">
                  Voted in:{' '}
                  <span className="text-white font-bold">{aura.votedIn ?? 0}</span>
                </p>
              </div>
            </div>

            {/* Top Contributions bar chart */}
            {aura.topVibes?.length > 0 && (
              <div className="relative z-10">
                <p className="text-[11px] uppercase tracking-widest text-white/30 font-mono mb-1">
                  Top Contributions
                </p>
                <BarChart topVibes={aura.topVibes} />
              </div>
            )}

            {!aura.topVibes?.length && (
              <div className="relative z-10 text-center py-6">
                <p className="text-white/20 text-sm font-mono">
                  Vote on content to grow your Aura score.
                </p>
                <Link
                  to="/aura-battle"
                  className="inline-block mt-3 text-xs font-mono font-bold uppercase tracking-wider px-4 py-2 rounded-lg border transition-colors hover:bg-white/5"
                  style={{ borderColor: `${aura.color || '#e9c349'}40`, color: aura.color || '#e9c349' }}
                >
                  Go to Aura Battle
                </Link>
              </div>
            )}
          </GlassPanel>
        </motion.div>

        {/* Vitals panel — 4 cols */}
        <motion.div
          className="lg:col-span-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <GlassPanel className="p-6 flex flex-col h-full">
            <h3 className="text-base font-semibold text-white mb-6 pb-4 border-b border-white/10">
              Vitals
            </h3>

            <div className="space-y-5 flex-1">
              {[
                { label: 'Aura Tier', value: aura.tier || 'Rookie' },
                { label: 'Votes Cast', value: aura.votedIn ?? 0 },
                { label: 'Badges Earned', value: earnedBadges.length },
                { label: 'Total Contributions', value: aura.topVibes?.length ?? 0 },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <span className="text-sm text-white/40">{item.label}</span>
                  <span className="font-bold text-white text-sm">{item.value}</span>
                </div>
              ))}
            </div>

            <Link
              to="/aura-leaderboard"
              className="mt-6 w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-mono font-bold border border-white/10 text-white/60 hover:text-white hover:bg-white/5 transition-all"
            >
              <Trophy className="w-4 h-4" /> View Leaderboard
            </Link>
          </GlassPanel>
        </motion.div>
      </div>

      {/* ── Aura Visual Card ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <GlassPanel className="p-6">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="shrink-0">
              <AuraScore score={aura.personalScore ?? 0} size="lg" />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h4 className="text-xl font-bold text-white mb-1">{aura.username}'s Aura Card</h4>
              <p className="text-white/40 text-sm mb-4">
                Tier: <span style={{ color: aura.color || '#e9c349' }} className="font-bold">{aura.tier}</span>
                {' · '}Voted in <strong className="text-white">{aura.votedIn ?? 0}</strong> events
              </p>
              <Link
                to="/profile/aura-card"
                className="inline-flex items-center gap-2 text-sm font-mono font-bold px-4 py-2 rounded-lg border border-white/10 text-white/60 hover:text-white hover:bg-white/5 transition-all"
              >
                View Full Aura Card <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </GlassPanel>
      </motion.div>

      {/* ── Achievement Vault ── */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <div className="flex items-end justify-between mb-4 pb-4 border-b border-white/10">
          <h3 className="text-xl font-bold text-white">Achievement Vault</h3>
          <span className="text-xs font-mono text-white/30 uppercase tracking-wider">
            {earnedBadges.length} / {BADGE_DEFS.length} Unlocked
          </span>
        </div>

        {/* Earned badges */}
        {earnedBadges.length > 0 && (
          <>
            <p className="text-[11px] uppercase tracking-widest text-white/20 font-mono mb-3">Earned</p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 mb-6">
              {earnedBadges.map((badge, i) => (
                <motion.div
                  key={badge.key}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.25 + i * 0.05 }}
                >
                  <GlassPanel
                    className="p-5 flex flex-col items-center text-center hover:scale-[1.03] transition-transform"
                    style={{ boxShadow: badge.glow || 'none', cursor: 'default' }}
                  >
                    <div
                      className="w-14 h-14 rounded-full flex items-center justify-center mb-3 border"
                      style={{
                        background: `${badge.accent}12`,
                        borderColor: `${badge.accent}30`,
                        boxShadow: badge.glow || 'none',
                      }}
                    >
                      <span className="text-2xl">{badge.emoji}</span>
                    </div>
                    <h4 className="text-sm font-bold text-white mb-1">{badge.label}</h4>
                    <p
                      className="text-[10px] font-mono leading-snug"
                      style={{ color: 'rgba(255,255,255,0.35)' }}
                    >
                      {badge.desc}
                    </p>
                  </GlassPanel>
                </motion.div>
              ))}
            </div>
          </>
        )}

        {/* Locked badges */}
        {lockedBadges.length > 0 && (
          <>
            <p className="text-[11px] uppercase tracking-widest text-white/20 font-mono mb-3">Locked</p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {lockedBadges.map((badge, i) => (
                <motion.div
                  key={badge.key}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 + i * 0.04 }}
                >
                  <GlassPanel className="p-5 flex flex-col items-center text-center opacity-40">
                    <div className="w-14 h-14 rounded-full flex items-center justify-center mb-3 border border-white/10 bg-white/5">
                      <span className="text-2xl grayscale opacity-60">{badge.emoji}</span>
                    </div>
                    <h4 className="text-sm font-bold text-white/50 mb-1">{badge.label}</h4>
                    <p className="text-[10px] font-mono text-white/25 leading-snug">{badge.desc}</p>
                  </GlassPanel>
                </motion.div>
              ))}
            </div>
          </>
        )}

        {earnedBadges.length === 0 && (
          <div className="flex flex-col items-center py-16 text-center text-white/20">
            <Trophy className="w-10 h-10 mb-3" />
            <p className="text-sm font-mono">No badges earned yet.</p>
            <p className="text-xs mt-1">Keep interacting with Nexoria to unlock achievements.</p>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default AuraMasteryTab;
