import { useState } from 'react';
import { useSelector } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Lock, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';
import { useUpdatePasswordMutation } from '../features/auth/authApiSlice';

const ChangePassword = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  const [updatePassword, { isLoading }] = useUpdatePasswordMutation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    
    if (newPassword !== confirmPassword) {
      return setErrorMsg('New passwords do not match');
    }

    try {
      const res = await updatePassword({ currentPassword, newPassword }).unwrap();
      setSuccessMsg(res.message || 'Password updated successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setErrorMsg(err?.data?.message || err.error || 'Failed to update password');
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <Helmet>
        <title>Change Password - Premium Apps</title>
      </Helmet>
      
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-3xl rounded-full pointer-events-none"></div>

        <h2 className="text-2xl font-bold mb-6 border-b border-slate-200 dark:border-night-border pb-4 text-slate-800 dark:text-slate-100">
          Change Password
        </h2>

        {errorMsg && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-600 dark:text-red-400 p-3 rounded-lg mb-6 text-sm font-medium">
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="bg-green-500/10 border border-green-500/50 text-green-600 dark:text-green-400 p-3 rounded-lg mb-6 text-sm font-medium flex items-center">
            <CheckCircle2 className="w-5 h-5 mr-2" /> {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 max-w-md">
          <div>
            <label className="block text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">Current Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 w-5 h-5 text-slate-400" />
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                className="premium-input w-full pl-10"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">New Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 w-5 h-5 text-slate-400" />
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                minLength="6"
                className="premium-input w-full pl-10"
                required
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">Confirm New Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 w-5 h-5 text-slate-400" />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                minLength="6"
                className="premium-input w-full pl-10"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="premium-btn w-full mt-2"
          >
            {isLoading ? <><Loader2 className="w-5 h-5 animate-spin" /> Updating...</> : 'Update Password'}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default ChangePassword;
