import { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { Swords, Flame, Trophy, RefreshCw, Timer } from 'lucide-react';
import { useGetAuraBattleQuery, useVoteAuraBattleMutation } from '../features/aura/auraApiSlice';
import { useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import { Link } from 'react-router-dom';

const BATTLE_DURATION = 30; // seconds

export default function AuraBattle() {
  const { data, isLoading, refetch } = useGetAuraBattleQuery();
  const [voteAuraBattle] = useVoteAuraBattleMutation();
  const { user } = useSelector((s) => s.auth);

  const [voted, setVoted] = useState(null); // 'item1' | 'item2'
  const [winner, setWinner] = useState(null);
  const [timeLeft, setTimeLeft] = useState(BATTLE_DURATION);
  const [battleCount, setBattleCount] = useState(0);
  const [votes, setVotes] = useState({ item1: 0, item2: 0 });

  const battle = data?.data;

  // Reset on new battle
  useEffect(() => {
    setVoted(null);
    setWinner(null);
    setTimeLeft(BATTLE_DURATION);
    setVotes({ item1: 0, item2: 0 });
  }, [battleCount, data]);

  // Countdown timer
  useEffect(() => {
    if (voted || winner) return;
    if (timeLeft <= 0) {
      // Auto-pick winner randomly if no vote
      const autoWinner = Math.random() > 0.5 ? 'item1' : 'item2';
      setWinner(autoWinner);
      return;
    }
    const timer = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft, voted, winner]);

  const handleVote = async (choice) => {
    if (voted) return;
    if (!user) return toast.error('Login করুন vote দিতে!', { id: 'auth_error' });
    if (!battle) return;

    setVoted(choice);
    setWinner(choice);

    const winnerId = choice === 'item1' ? battle.item1._id : battle.item2._id;
    const loserId = choice === 'item1' ? battle.item2._id : battle.item1._id;

    // Update local vote counts
    setVotes((v) => ({ ...v, [choice]: v[choice] + 1 }));

    try {
      await voteAuraBattle({ winnerId, loserId }).unwrap();
      toast.success('⚡ Vote counted! Winner aura boosted!');
    } catch {
      toast.error('Vote failed. Try again.');
    }
  };

  const nextBattle = () => {
    setBattleCount((c) => c + 1);
    refetch();
  };

  const timerPercent = (timeLeft / BATTLE_DURATION) * 100;
  const timerColor = timeLeft > 15 ? '#a855f7' : timeLeft > 7 ? '#f59e0b' : '#ef4444';

  return (
    <div className="min-h-screen bg-[#080b14] text-white flex flex-col">
      <Helmet>
        <title>Aura Battle — Nexoria</title>
        <meta name="description" content="Vote in real-time Aura Battles. Which app has more aura?" />
      </Helmet>

      {/* Header */}
      <div className="relative overflow-hidden py-12 px-4 text-center">
        <div className="absolute inset-0 bg-gradient-to-b from-rose-900/20 via-purple-900/10 to-transparent pointer-events-none" />
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-[500px] h-[200px] rounded-full bg-rose-600/10 blur-[80px]" />
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-black uppercase tracking-widest mb-4">
            <Swords className="w-3.5 h-3.5" /> AURA BATTLE
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-2 bg-gradient-to-r from-rose-400 via-purple-400 to-amber-400 bg-clip-text text-transparent">
            Battle of the Auras
          </h1>
          <p className="text-slate-400">Pick your side. The winner's aura surges. 🔥</p>
        </motion.div>
      </div>

      {/* Battle Arena */}
      <div className="flex-1 max-w-3xl mx-auto px-4 pb-16 w-full">

        {/* Timer */}
        {!winner && !isLoading && (
          <div className="flex items-center justify-center gap-3 mb-8">
            <Timer className="w-4 h-4" style={{ color: timerColor }} />
            <div className="flex-1 max-w-xs bg-white/10 rounded-full h-2 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-1000"
                style={{ width: `${timerPercent}%`, background: timerColor }}
              />
            </div>
            <span className="text-sm font-black tabular-nums" style={{ color: timerColor }}>
              {timeLeft}s
            </span>
          </div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-2 gap-4">
            {[1, 2].map((i) => (
              <div key={i} className="h-64 rounded-3xl bg-white/5 animate-pulse" />
            ))}
          </div>
        ) : battle ? (
          <div className="relative">
            {/* VS Divider */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-rose-500 to-purple-600 flex items-center justify-center font-black text-sm shadow-lg shadow-purple-500/40">
                VS
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {['item1', 'item2'].map((key) => {
                const item = battle[key];
                const isWinner = winner === key;
                const isLoser = winner && winner !== key;

                return (
                  <motion.button
                    key={key}
                    onClick={() => handleVote(key)}
                    disabled={!!voted}
                    whileTap={{ scale: voted ? 1 : 0.97 }}
                    className={`relative flex flex-col items-center gap-4 p-6 rounded-3xl border transition-all overflow-hidden text-left w-full
                      ${!voted ? 'hover:border-purple-400/50 hover:shadow-lg hover:shadow-purple-500/20 cursor-pointer border-white/10 bg-white/5' : ''}
                      ${isWinner ? 'border-amber-400/60 bg-gradient-to-b from-amber-500/15 to-purple-500/10 shadow-xl shadow-amber-500/20' : ''}
                      ${isLoser ? 'border-white/5 bg-white/3 opacity-50' : ''}
                    `}
                  >
                    {/* Glow on win */}
                    {isWinner && (
                      <div className="absolute inset-0 bg-gradient-to-b from-amber-500/10 to-transparent animate-pulse pointer-events-none" />
                    )}

                    {/* Image */}
                    <div className="relative w-full aspect-square max-h-36 rounded-2xl overflow-hidden">
                      <img
                        src={item.image || '/placeholder.png'}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                      {isWinner && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                          <Trophy className="w-10 h-10 text-amber-400" />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="w-full text-center">
                      <p className="font-black text-white text-sm line-clamp-2 leading-tight">{item.title}</p>
                      <div className="flex items-center justify-center gap-1 mt-2">
                        <Flame className="w-3 h-3 text-amber-400" />
                        <span className="text-amber-400 font-black text-sm">{item.auraScore}</span>
                        <span className="text-slate-500 text-xs">aura</span>
                      </div>
                    </div>

                    {/* Vote count */}
                    {voted && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-xs font-bold text-purple-400"
                      >
                        {votes[key]} vote{votes[key] !== 1 ? 's' : ''}
                      </motion.div>
                    )}

                    {/* Winner badge */}
                    {isWinner && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-black font-black text-xs"
                      >
                        🏆 WINNER! Aura Surging!
                      </motion.div>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="text-center py-16 text-slate-500">
            <Swords className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p>Not enough content for a battle yet!</p>
          </div>
        )}

        {/* Post-battle actions */}
        <AnimatePresence>
          {winner && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-center gap-4 mt-8"
            >
              <button
                onClick={nextBattle}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 rounded-2xl font-bold text-sm transition-all hover:shadow-lg active:scale-95"
              >
                <RefreshCw className="w-4 h-4" /> Next Battle
              </button>
              <Link
                to="/aura"
                className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/15 rounded-2xl font-bold text-sm transition-all"
              >
                <Trophy className="w-4 h-4" /> View Leaderboard
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
