import { Crown, ShieldCheck, Star } from 'lucide-react';

const UserBadge = ({ role }) => {
  if (role === 'owner') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-gradient-to-r from-amber-500/20 to-cyan-500/20 text-amber-500 dark:text-amber-400 text-[10px] font-extrabold uppercase tracking-widest border border-amber-500/30 shadow-[0_0_10px_rgba(245,158,11,0.2)]" title="Platform Creator">
        <Crown className="w-3 h-3 text-cyan-400" /> Nexoria Creator
      </span>
    );
  }

  if (role === 'superadmin' || role === 'admin') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-500 text-[10px] font-bold uppercase tracking-wider border border-rose-500/20" title="Administrator">
        <ShieldCheck className="w-3 h-3" /> Admin
      </span>
    );
  }

  if (role === 'premium_user') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-warning/10 text-warning text-[10px] font-bold uppercase tracking-wider border border-warning/20" title="Premium Subscriber">
        <Crown className="w-3 h-3" /> Elite
      </span>
    );
  }

  // Regular user gets a "Newbie" or "Pro" badge (let's say Pro for default logged in user)
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-500 text-[10px] font-bold uppercase tracking-wider border border-blue-500/20" title="Verified Member">
      <Star className="w-3 h-3" /> Pro
    </span>
  );
};

export default UserBadge;
