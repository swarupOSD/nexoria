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
    <div className="font-jakarta min-h-screen w-full flex items-center justify-center p-6 sm:p-12 bg-[#030303] text-white overflow-hidden relative selection:bg-blue-500/30">
      
      {/* Background Gradients */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-blue-500/20 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-purple-500/20 rounded-full blur-[120px]"></div>
        
        {/* Animated Rings for visual interest */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[800px] aspect-square flex items-center justify-center opacity-30">
          <motion.div animate={{ rotate: -360 }} transition={{ duration: 60, repeat: Infinity, ease: "linear" }} className="absolute w-[100%] h-[100%] rounded-full border border-white/[0.03]" />
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 40, repeat: Infinity, ease: "linear" }} className="absolute w-[80%] h-[80%] rounded-full border border-white/[0.05]" />
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-[420px] relative z-10 bg-white/5 backdrop-blur-3xl border border-white/10 p-8 sm:p-10 rounded-[2.5rem] shadow-[0_20px_40px_rgba(0,0,0,0.5)]"
      >

      <Helmet>
        <title>Reset Password - Premium Apps</title>
      </Helmet>

      <div className="text-center mb-8 relative z-10">
        <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-6 shadow-inner backdrop-blur-md">
          <Lock className="w-8 h-8 text-blue-400" />
        </div>
        <h2 className="text-3xl font-black text-white tracking-tight mb-2">
          New Password
        </h2>
        <p className="text-white/50 text-sm font-medium">Please enter your new strong password.</p>
      </div>
      
      {errorMsg && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl mb-6 text-sm text-center font-medium backdrop-blur-md">
          {errorMsg}
        </motion.div>
      )}

      {successMsg ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center p-6 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center">
             <CheckCircle2 className="w-8 h-8 text-emerald-400" />
          </div>
          <h3 className="text-xl font-black text-white">Password Reset!</h3>
          <p className="text-sm text-white/60 font-medium">Your password has been successfully updated.</p>
          <p className="text-xs font-bold text-blue-400">Redirecting to login...</p>
        </motion.div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
          <div className="relative group">
            <input
              id="newPassword" type="password" value={password} onChange={(e) => setPassword(e.target.value)} minLength="6"
              className="peer w-full h-14 bg-black/40 border border-white/10 focus:border-blue-500/50 rounded-2xl px-4 pt-4 pb-1 text-white placeholder-transparent focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all font-medium text-base shadow-inner backdrop-blur-sm"
              placeholder="New Password" required
            />
            <label 
              htmlFor="newPassword"
              className="absolute left-4 top-[18px] text-white/40 text-base transition-all pointer-events-none peer-placeholder-shown:text-base peer-placeholder-shown:top-[16px] peer-focus:top-[6px] peer-focus:text-[11px] peer-focus:font-bold peer-focus:text-blue-400 peer-[&:not(:placeholder-shown)]:top-[6px] peer-[&:not(:placeholder-shown)]:text-[11px] peer-[&:not(:placeholder-shown)]:font-bold uppercase tracking-wider"
            >
              New Password
            </label>
          </div>
          
          <div className="relative group">
            <input
              id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} minLength="6"
              className="peer w-full h-14 bg-black/40 border border-white/10 focus:border-blue-500/50 rounded-2xl px-4 pt-4 pb-1 text-white placeholder-transparent focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all font-medium text-base shadow-inner backdrop-blur-sm"
              placeholder="Confirm Password" required
            />
            <label 
              htmlFor="confirmPassword"
              className="absolute left-4 top-[18px] text-white/40 text-base transition-all pointer-events-none peer-placeholder-shown:text-base peer-placeholder-shown:top-[16px] peer-focus:top-[6px] peer-focus:text-[11px] peer-focus:font-bold peer-focus:text-blue-400 peer-[&:not(:placeholder-shown)]:top-[6px] peer-[&:not(:placeholder-shown)]:text-[11px] peer-[&:not(:placeholder-shown)]:font-bold uppercase tracking-wider"
            >
              Confirm Password
            </label>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="group relative w-full h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-2xl font-black text-[15px] transition-all disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden shadow-[0_10px_20px_rgba(59,130,246,0.3)] hover:shadow-[0_15px_30px_rgba(59,130,246,0.5)] active:scale-[0.98]"
          >
            <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12" />
            <div className="relative z-10 flex items-center justify-center gap-2 text-lg">
              {isLoading ? <><Loader2 className="w-5 h-5 animate-spin" /> Updating...</> : <>Reset Password <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></>}
            </div>
          </button>
        </form>
      )}

      {!successMsg && (
        <div className="mt-8 text-center relative z-10">
          <p className="text-sm font-medium text-white/50">
            Remembered your password?{' '}
            <Link to="/login" className="font-bold text-white hover:text-blue-400 hover:underline decoration-blue-500/30 underline-offset-4 transition-all">
              Sign In
            </Link>
          </p>
        </div>
      )}
    </motion.div>
    </div>
  );
};

export default ResetPassword;
