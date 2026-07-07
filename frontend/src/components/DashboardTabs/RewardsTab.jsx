import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Gift, Copy, CheckCircle2, TrendingUp, Trophy, Star, Shield, Award, Users, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { apiSlice } from '../../features/api/apiSlice';

const RewardsTab = ({ user }) => {
  const [copied, setCopied] = useState(false);
  const [activities, setActivities] = useState([]);
  const [loadingActivities, setLoadingActivities] = useState(true);
  const [couponCode, setCouponCode] = useState('');
  const [redeeming, setRedeeming] = useState(false);

  const referralLink = `${window.location.origin}/register?ref=${user?.referralCode || ''}`;

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const res = await fetch('/api/users/me/activity', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        const data = await res.json();
        if (data.success) {
          setActivities(data.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingActivities(false);
      }
    };
    fetchActivities();
  }, []);

  const copyToClipboard = () => {
    if (!user?.referralCode) return;
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    toast.success('Referral link copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRedeem = async (e) => {
    e.preventDefault();
    if (!couponCode) return toast.error('Please enter a coupon code');
    setRedeeming(true);
    try {
      const res = await fetch('/api/coupons/redeem', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ code: couponCode })
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message);
        setCouponCode('');
        // We could fetch activities again here
      } else {
        toast.error(data.message || 'Failed to redeem coupon');
      }
    } catch (err) {
      toast.error('An error occurred');
    } finally {
      setRedeeming(false);
    }
  };

  const nextLevelXp = user?.level * 1000 || 1000;
  const xpProgress = ((user?.xp || 0) / nextLevelXp) * 100;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Gift className="w-6 h-6 text-emerald-500" /> Rewards & Loyalty
          </h2>
          <p className="text-sm text-slate-500 dark:text-white/50 mt-1">Manage your referrals, level up, and earn points.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Level Card */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-[#0A0A0A] border border-slate-200 dark:border-white/10 rounded-2xl p-6 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Trophy className="w-24 h-24" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <Star className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-white/50">Current Level</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">Level {user?.level || 1}</p>
              </div>
            </div>
            <div className="mt-6">
              <div className="flex justify-between text-xs mb-2 text-slate-600 dark:text-white/60">
                <span>{user?.xp || 0} XP</span>
                <span>{nextLevelXp} XP</span>
              </div>
              <div className="h-2 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }} animate={{ width: `${xpProgress}%` }} transition={{ duration: 1, ease: 'easeOut' }}
                  className="h-full bg-blue-500 rounded-full"
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Points Card */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-white dark:bg-[#0A0A0A] border border-slate-200 dark:border-white/10 rounded-2xl p-6 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Award className="w-24 h-24" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                <Shield className="w-5 h-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-white/50">Reward Points</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{user?.rewardPoints || 0}</p>
              </div>
            </div>
            <p className="mt-6 text-sm text-slate-500 dark:text-white/50">
              Redeem points for premium days or exclusive app requests.
            </p>
            <button className="mt-3 text-sm font-medium text-emerald-500 hover:text-emerald-400 flex items-center gap-1 transition-colors">
              Redeem Store <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>

        {/* Referrals Card */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-white dark:bg-[#0A0A0A] border border-slate-200 dark:border-white/10 rounded-2xl p-6 relative overflow-hidden"
        >
           <div className="absolute top-0 right-0 p-4 opacity-10">
            <Users className="w-24 h-24" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                <Users className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-white/50">Total Referrals</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{user?.referralCount || 0}</p>
              </div>
            </div>
            <p className="mt-6 text-sm text-slate-500 dark:text-white/50">
              Earn 50 Points for every friend who joins via your link.
            </p>
          </div>
        </motion.div>
      </div>

      {/* Referral Link Section */}
      <div className="bg-white dark:bg-[#0A0A0A] border border-slate-200 dark:border-white/10 rounded-2xl p-6">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Your Referral Link</h3>
        <p className="text-sm text-slate-500 dark:text-white/50 mb-4">Share this link to earn points and XP when friends register.</p>
        
        {user?.referralCode ? (
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm font-medium text-slate-700 dark:text-white/80 overflow-hidden text-ellipsis whitespace-nowrap">
              {referralLink}
            </div>
            <button 
              onClick={copyToClipboard}
              className="flex-shrink-0 bg-blue-500 hover:bg-blue-600 text-white px-5 py-3 rounded-xl font-medium transition-colors flex items-center gap-2"
            >
              {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
        ) : (
          <div className="text-sm text-amber-500 bg-amber-500/10 p-4 rounded-xl border border-amber-500/20">
            Referral code not generated. Please re-login or contact support.
          </div>
        )}
      </div>

      {/* Coupon Redemption */}
      <div className="bg-white dark:bg-[#0A0A0A] border border-slate-200 dark:border-white/10 rounded-2xl p-6">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
          <Gift className="w-5 h-5 text-indigo-500" /> Redeem Coupon
        </h3>
        <p className="text-sm text-slate-500 dark:text-white/50 mb-4">Enter a promo code or gift card to receive Premium days or Points.</p>
        
        <form onSubmit={handleRedeem} className="flex flex-col sm:flex-row items-center gap-3">
          <div className="flex-1 w-full relative">
            <input 
              type="text" 
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              placeholder="ENTER-PROMO-CODE"
              className="w-full h-12 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 text-sm font-bold tracking-widest text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 transition-colors uppercase placeholder:font-normal placeholder:tracking-normal"
            />
          </div>
          <button 
            type="submit"
            disabled={redeeming || !couponCode}
            className="w-full sm:w-auto h-12 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 rounded-xl font-bold transition-colors"
          >
            {redeeming ? 'Redeeming...' : 'Redeem'}
          </button>
        </form>
      </div>

      {/* Activity Timeline */}
      <div className="bg-white dark:bg-[#0A0A0A] border border-slate-200 dark:border-white/10 rounded-2xl p-6">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-slate-400" /> Activity Timeline
        </h3>
        
        {loadingActivities ? (
          <div className="flex justify-center py-8">
             <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : activities.length === 0 ? (
          <div className="text-center py-8 text-slate-500 dark:text-white/40 text-sm">
            No recent activity to show. Complete actions to earn XP and Points!
          </div>
        ) : (
          <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 dark:before:via-white/10 before:to-transparent">
            {activities.map((activity, index) => (
              <div key={activity._id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white dark:border-[#0A0A0A] bg-blue-500 text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                  <Star className="w-4 h-4" />
                </div>
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.02]">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm">{activity.actionType}</h4>
                    <span className="text-xs font-medium text-slate-500 dark:text-white/40">
                      {new Date(activity.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-white/60">{activity.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RewardsTab;
