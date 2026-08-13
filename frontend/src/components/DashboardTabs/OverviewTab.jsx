import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { ArrowRight, Download, Bell, ShoppingBag, Shield, Zap, Crown, Star, Lock } from 'lucide-react';
import FallbackImage from '../FallbackImage';

// ─── Stitch Glass Panel ───────────────────────────────────────────────────────
const GlassPanel = ({ children, className = '', hover = false }) => (
  <div
    className={`relative rounded-xl border border-white/10 backdrop-blur-xl overflow-hidden ${
      hover ? 'hover:bg-white/[0.04] transition-colors cursor-default' : ''
    } ${className}`}
    style={{ background: 'rgba(53,53,53,0.06)' }}
  >
    {children}
  </div>
);

// ─── Stat Card ────────────────────────────────────────────────────────────────
const StatCard = ({ icon, label, value, sub, accent = '#e9c349', delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
  >
    <GlassPanel hover className="p-5 flex flex-col justify-between gap-3 h-full">
      <div className="flex items-start justify-between">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center"
          style={{ background: `${accent}15`, color: accent }}
        >
          {icon}
        </div>
        {sub && (
          <span className="text-[11px] font-mono text-white/40 uppercase tracking-wider">
            {sub}
          </span>
        )}
      </div>
      <div>
        <p className="text-[11px] uppercase tracking-widest text-white/40 font-mono mb-1">{label}</p>
        <h3 className="text-2xl font-bold text-white leading-none">{value}</h3>
      </div>
    </GlassPanel>
  </motion.div>
);

// ─── Activity Icon ────────────────────────────────────────────────────────────
const activityIcon = (type) => {
  const map = {
    VOTE: '⚡',
    REVIEW: '⭐',
    DOWNLOAD: '📥',
    LOGIN: '🔑',
    PURCHASE: '🛒',
    WISHLIST: '❤️',
  };
  return map[type?.toUpperCase()] || '🔔';
};

// ─── OverviewTab ──────────────────────────────────────────────────────────────
const OverviewTab = ({ user, purchases, notificationsCount, premiumRequests, recentActivity }) => {
  const profileCompletion = (() => {
    let s = 0;
    if (user?.name) s += 20;
    if (user?.username) s += 20;
    if (user?.bio) s += 20;
    if (user?.profileImage && user?.profileImage !== 'default.jpg') s += 20;
    if (user?.coverBanner) s += 20;
    return s;
  })();

  const joinedDate = user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : '—';
  const premiumExpiry = user?.isPremium
    ? user?.premiumEndDate
      ? new Date(user.premiumEndDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
      : 'Lifetime'
    : null;

  return (
    <div className="space-y-6 text-white">
      {/* ── Profile Hero ── */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <GlassPanel className="overflow-hidden">
          {/* Cover */}
          <div className="h-40 md:h-56 w-full relative">
            {user?.coverBanner ? (
              <img src={user.coverBanner} alt="Cover" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460]" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[#131313] via-transparent to-transparent" />
          </div>

          {/* Profile Info */}
          <div className="px-5 md:px-8 pb-6 relative -mt-14 md:-mt-16 flex flex-col md:flex-row md:items-end gap-4">
            {/* Avatar */}
            <div className="relative shrink-0">
              <FallbackImage
                src={user?.profileImage}
                fallbackType="avatar"
                alt={user?.name}
                className="w-28 h-28 md:w-36 md:h-36 rounded-full border-4 object-cover"
                style={{ borderColor: '#131313' }}
              />
              {user?.isPremium && (
                <div
                  className="absolute bottom-1 right-1 w-8 h-8 rounded-full flex items-center justify-center border-2"
                  style={{ background: 'linear-gradient(135deg,#f59e0b,#d97706)', borderColor: '#131313' }}
                >
                  <Crown className="w-4 h-4 text-white" />
                </div>
              )}
            </div>

            {/* Text */}
            <div className="flex-1 pb-1">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h2 className="text-2xl md:text-3xl font-bold text-white leading-none">
                  {user?.name || 'User'}
                </h2>
                {user?.isPremium && (
                  <span
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-bold uppercase tracking-wider border"
                    style={{ background: 'rgba(233,195,73,0.1)', borderColor: 'rgba(233,195,73,0.3)', color: '#e9c349' }}
                  >
                    <Star className="w-3 h-3" />
                    {user?.role === 'superadmin' ? 'Lifetime Admin' : 'Premium'}
                  </span>
                )}
                {user?.role === 'superadmin' && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-bold uppercase tracking-wider border border-rose-500/30 bg-rose-500/10 text-rose-400">
                    <Shield className="w-3 h-3" /> Superadmin
                  </span>
                )}
              </div>

              <p className="text-white/40 text-sm font-mono mb-4">@{user?.username || 'username'}</p>

              {user?.bio && (
                <p className="text-white/60 text-sm max-w-lg leading-relaxed mb-4">{user.bio}</p>
              )}

              {/* XP / Profile Completion bar */}
              <div className="max-w-xs">
                <div className="flex justify-between text-[11px] font-mono text-white/40 mb-1.5 uppercase tracking-wider">
                  <span>Profile Completion</span>
                  <span>{profileCompletion}%</span>
                </div>
                <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-1000"
                    style={{
                      width: `${profileCompletion}%`,
                      background: '#e9c349',
                      boxShadow: '0 0 8px rgba(233,195,73,0.5)',
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Account meta */}
            <div className="flex gap-6 pb-1 text-white/40 text-xs font-mono uppercase tracking-wider">
              <div className="text-center">
                <div className="text-white font-bold text-sm mb-0.5">{joinedDate}</div>
                <div>Joined</div>
              </div>
              <div className="text-center">
                <div className="text-white font-bold text-sm mb-0.5">{user?.status?.toUpperCase() || '—'}</div>
                <div>Status</div>
              </div>
            </div>
          </div>
        </GlassPanel>
      </motion.div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={<ShoppingBag className="w-5 h-5" />}
          label="Purchased Apps"
          value={purchases?.length ?? 0}
          accent="#c0c1ff"
          delay={0.05}
        />
        <StatCard
          icon={<Bell className="w-5 h-5" />}
          label="Unread Alerts"
          value={notificationsCount ?? 0}
          accent="#c9c6c5"
          delay={0.1}
        />
        <StatCard
          icon={<Star className="w-5 h-5" />}
          label="Premium"
          value={user?.isPremium ? 'Active' : 'Free'}
          sub={user?.isPremium ? premiumExpiry || undefined : undefined}
          accent="#e9c349"
          delay={0.15}
        />
        <StatCard
          icon={<Download className="w-5 h-5" />}
          label="Premium Requests"
          value={premiumRequests?.length ?? 0}
          accent="#86efac"
          delay={0.2}
        />
      </div>

      {/* ── Two-column content ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <motion.div
          className="lg:col-span-2"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-semibold text-white">Recent Activity</h3>
            <Link
              to="/activity"
              className="text-xs font-mono text-white/40 hover:text-white/70 flex items-center gap-1 transition-colors"
            >
              View All <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <GlassPanel className="divide-y divide-white/5">
            {recentActivity?.length > 0 ? (
              recentActivity.slice(0, 6).map((item, i) => (
                <div
                  key={item._id || i}
                  className="flex items-start gap-4 px-5 py-4 hover:bg-white/[0.03] transition-colors"
                >
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 text-xl"
                    style={{ background: 'rgba(255,255,255,0.05)' }}
                  >
                    {activityIcon(item.actionType)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white/90 truncate">{item.description || item.actionType}</p>
                    <p className="text-[11px] font-mono text-white/30 mt-0.5 uppercase tracking-wider">
                      {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-14 text-center">
                <Zap className="w-8 h-8 text-white/10 mb-3" />
                <p className="text-white/30 text-sm font-mono">No activity recorded yet</p>
              </div>
            )}
          </GlassPanel>
        </motion.div>

        {/* Right Column: Premium card + Security */}
        <motion.div
          className="flex flex-col gap-4"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {/* Premium Status */}
          <GlassPanel className="p-5 relative overflow-hidden">
            <div
              className="absolute -right-10 -top-10 w-40 h-40 rounded-full blur-3xl pointer-events-none"
              style={{ background: 'rgba(233,195,73,0.12)' }}
            />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-5">
                <div
                  className="p-2 rounded-lg border"
                  style={{ background: 'rgba(233,195,73,0.1)', borderColor: 'rgba(233,195,73,0.2)' }}
                >
                  <Star className="w-6 h-6" style={{ color: '#e9c349' }} />
                </div>
                <span
                  className={`px-2.5 py-1 rounded-full text-[11px] font-mono font-bold uppercase tracking-wider border ${
                    user?.isPremium
                      ? 'bg-green-500/10 border-green-500/20 text-green-400'
                      : 'bg-white/5 border-white/10 text-white/30'
                  }`}
                >
                  {user?.isPremium ? 'Active' : 'Inactive'}
                </span>
              </div>
              <h4 className="text-xl font-bold text-white mb-1">
                {user?.isPremium ? 'Elite Member' : 'Free Tier'}
              </h4>
              <p className="text-xs text-white/40 font-mono mb-5">
                {user?.isPremium ? `Expires: ${premiumExpiry || 'Lifetime'}` : 'Upgrade to unlock all features'}
              </p>
              <div className="h-px w-full bg-white/10 mb-5" />
              <Link
                to="/premium"
                className="w-full block text-center py-2.5 rounded-lg text-sm font-bold transition-all active:scale-95"
                style={{
                  background: user?.isPremium ? 'rgba(255,255,255,0.07)' : '#e9c349',
                  color: user?.isPremium ? '#e5e2e1' : '#3c2f00',
                  boxShadow: user?.isPremium ? 'none' : '0 0 18px rgba(233,195,73,0.15)',
                }}
              >
                {user?.isPremium ? 'Manage Subscription' : 'Upgrade to Premium'}
              </Link>
            </div>
          </GlassPanel>

          {/* Account Security */}
          <GlassPanel className="p-5">
            <div className="flex items-start gap-3">
              <div
                className="p-2 rounded-lg border shrink-0"
                style={{ background: 'rgba(192,193,255,0.08)', borderColor: 'rgba(192,193,255,0.15)', color: '#c0c1ff' }}
              >
                {user?.twoFactorEnabled ? <Shield className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
              </div>
              <div>
                <h5 className="text-sm font-semibold text-white mb-1">
                  {user?.twoFactorEnabled ? 'Account Secured' : 'Security Tip'}
                </h5>
                <p className="text-xs text-white/40 leading-relaxed">
                  {user?.twoFactorEnabled
                    ? '2FA is enabled. Your identity is protected by Nexoria Shield.'
                    : 'Enable Two-Factor Authentication in Settings to secure your account.'}
                </p>
              </div>
            </div>
          </GlassPanel>

          {/* Quick Actions */}
          <GlassPanel className="p-5">
            <h5 className="text-xs font-mono uppercase tracking-widest text-white/30 mb-3">Quick Links</h5>
            <div className="flex flex-col gap-2">
              <Link
                to="/categories"
                className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-white/60 hover:text-white hover:bg-white/5 transition-all"
              >
                <Download className="w-4 h-4" /> Browse Apps
              </Link>
              <Link
                to="/aura-leaderboard"
                className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-white/60 hover:text-white hover:bg-white/5 transition-all"
              >
                <Zap className="w-4 h-4" /> Aura Leaderboard
              </Link>
              <Link
                to="/notifications"
                className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-white/60 hover:text-white hover:bg-white/5 transition-all"
              >
                <Bell className="w-4 h-4" /> Notifications
                {notificationsCount > 0 && (
                  <span
                    className="ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                    style={{ background: '#e9c349', color: '#3c2f00' }}
                  >
                    {notificationsCount}
                  </span>
                )}
              </Link>
            </div>
          </GlassPanel>
        </motion.div>
      </div>
    </div>
  );
};

export default OverviewTab;
