import { useEffect, useState } from 'react';
import { Flame, Zap, Star } from 'lucide-react';

// Color tier based on score
const getAuraTier = (score) => {
  if (score >= 900) return { label: '999+ AURA', color: '#f59e0b', glow: 'rgba(245,158,11,0.5)', ring: '#f59e0b', icon: <Flame className="w-3 h-3" />, bg: 'from-amber-500/20 to-orange-500/20' };
  if (score >= 700) return { label: 'ELITE', color: '#a855f7', glow: 'rgba(168,85,247,0.4)', ring: '#a855f7', icon: <Zap className="w-3 h-3" />, bg: 'from-purple-500/20 to-violet-500/20' };
  if (score >= 500) return { label: 'PRO', color: '#3b82f6', glow: 'rgba(59,130,246,0.3)', ring: '#3b82f6', icon: <Zap className="w-3 h-3" />, bg: 'from-blue-500/20 to-cyan-500/20' };
  if (score >= 300) return { label: 'RISING', color: '#10b981', glow: 'rgba(16,185,129,0.3)', ring: '#10b981', icon: <Star className="w-3 h-3" />, bg: 'from-emerald-500/20 to-teal-500/20' };
  return { label: 'NEW', color: '#64748b', glow: 'rgba(100,116,139,0.2)', ring: '#64748b', icon: <Star className="w-3 h-3" />, bg: 'from-slate-500/10 to-slate-500/10' };
};

// ─── Full AuraScore Component ─────────────────────────────────────────────────
export const AuraScore = ({ score = 0, size = 'md', animate = true, showLabel = true }) => {
  const [displayScore, setDisplayScore] = useState(0);
  const tier = getAuraTier(score);

  // Animated count-up effect
  useEffect(() => {
    if (!animate) { setDisplayScore(score); return; }
    let start = 0;
    const duration = 1500;
    const step = score / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= score) { setDisplayScore(score); clearInterval(timer); }
      else setDisplayScore(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [score, animate]);

  const sizes = {
    sm: { wrap: 'w-12 h-12', text: 'text-xs', label: 'text-[8px]', stroke: 3, r: 18 },
    md: { wrap: 'w-20 h-20', text: 'text-sm font-bold', label: 'text-[9px]', stroke: 4, r: 30 },
    lg: { wrap: 'w-32 h-32', text: 'text-xl font-black', label: 'text-xs', stroke: 5, r: 48 },
  };
  const s = sizes[size] || sizes.md;
  const circumference = 2 * Math.PI * s.r;
  const progress = Math.min(score / 999, 1);
  const dashOffset = circumference * (1 - progress);

  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className={`relative ${s.wrap} flex items-center justify-center`}
        style={{ filter: score >= 900 ? `drop-shadow(0 0 12px ${tier.glow})` : 'none' }}
      >
        <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox={`0 0 ${(s.r + s.stroke) * 2 + 4} ${(s.r + s.stroke) * 2 + 4}`}>
          {/* Background ring */}
          <circle
            cx={(s.r + s.stroke) + 2} cy={(s.r + s.stroke) + 2} r={s.r}
            fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={s.stroke}
          />
          {/* Progress ring */}
          <circle
            cx={(s.r + s.stroke) + 2} cy={(s.r + s.stroke) + 2} r={s.r}
            fill="none"
            stroke={tier.color}
            strokeWidth={s.stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            style={{ transition: 'stroke-dashoffset 1.5s ease-out' }}
          />
        </svg>

        {/* Score Text */}
        <div className="relative z-10 flex flex-col items-center">
          <span className={`${s.text} leading-none`} style={{ color: tier.color }}>
            {score >= 999 ? '999+' : displayScore}
          </span>
          {showLabel && (
            <span className={`${s.label} uppercase font-bold tracking-wider`} style={{ color: tier.color, opacity: 0.8 }}>
              AURA
            </span>
          )}
        </div>

        {/* Surge pulse ring for 900+ */}
        {score >= 900 && (
          <div
            className="absolute inset-0 rounded-full animate-ping opacity-20"
            style={{ background: `radial-gradient(circle, ${tier.color}, transparent)` }}
          />
        )}
      </div>

      {showLabel && (
        <div
          className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-gradient-to-r ${tier.bg} border`}
          style={{ borderColor: `${tier.color}40`, color: tier.color }}
        >
          {tier.icon} {tier.label}
        </div>
      )}
    </div>
  );
};

// ─── Mini Badge for Cards ─────────────────────────────────────────────────────
export const AuraBadge = ({ score = 0 }) => {
  const tier = getAuraTier(score);
  return (
    <div
      className="flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-black backdrop-blur-sm"
      style={{
        background: `rgba(0,0,0,0.6)`,
        border: `1px solid ${tier.color}60`,
        color: tier.color,
        boxShadow: score >= 700 ? `0 0 8px ${tier.glow}` : 'none',
      }}
    >
      <Flame className="w-2.5 h-2.5" />
      {score >= 999 ? '999+' : score}
    </div>
  );
};

export default AuraScore;
