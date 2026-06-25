import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Lock, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';
import { useResetPasswordMutation } from '../features/auth/authApiSlice';

const ResetPassword = () => {
  const { resetToken } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  const [resetPassword, { isLoading }] = useResetPasswordMutation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    
    if (password !== confirmPassword) {
      return setErrorMsg('Passwords do not match');
    }

    try {
      const res = await resetPassword({ token: resetToken, data: { password } }).unwrap();
      setSuccessMsg(res.message || 'Password updated successfully');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setErrorMsg(err?.data?.message || err.error || 'Failed to reset password. Token may be invalid or expired.');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-md mx-auto mt-16 glass-card p-8 md:p-10 relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-3xl rounded-full pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-accent/20 blur-3xl rounded-full pointer-events-none"></div>

      <Helmet>
        <title>Reset Password - Premium Apps</title>
      </Helmet>

      <div className="text-center mb-8 relative z-10">
        <h2 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent mb-2">
          New Password
        </h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm">Please enter your new strong password</p>
      </div>
      
      {errorMsg && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-red-500/10 border border-red-500/50 text-red-600 dark:text-red-400 p-3 rounded-lg mb-6 text-sm text-center font-medium">
          {errorMsg}
        </motion.div>
      )}

      {successMsg ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center p-6 text-center space-y-4">
          <CheckCircle2 className="w-16 h-16 text-primary" />
          <h3 className="text-xl font-bold">Password Reset!</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">Your password has been successfully updated.</p>
          <p className="text-xs font-semibold text-primary">Redirecting to login...</p>
        </motion.div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
          <div>
            <label className="block text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">New Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 w-5 h-5 text-slate-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
            {isLoading ? <><Loader2 className="w-5 h-5 animate-spin" /> Updating...</> : <><ArrowRight className="w-5 h-5" /> Reset Password</>}
          </button>
        </form>
      )}

      {!successMsg && (
        <p className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400 relative z-10">
          Remembered your password? <Link to="/login" className="text-primary font-bold hover:underline">Sign In</Link>
        </p>
      )}
    </motion.div>
  );
};

export default ResetPassword;
