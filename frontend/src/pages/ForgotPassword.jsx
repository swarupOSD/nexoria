import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Mail, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';
import { useForgotPasswordMutation } from '../features/auth/authApiSlice';
import BackButton from '../components/BackButton';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await forgotPassword({ email }).unwrap();
      setSuccessMsg(res.data || 'Password reset link sent to your email.');
    } catch (err) {
      setErrorMsg(err?.data?.message || err.error || 'Failed to send reset email');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-[#0F172A] relative overflow-hidden transition-colors duration-300">
      
      {/* Universal Back Button */}
      <div className="absolute top-4 left-4 md:top-8 md:left-8 z-50">
        <BackButton fallbackRoute="/login" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full mx-auto mt-16 glass-card p-8 md:p-10 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-3xl rounded-full pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-accent/20 blur-3xl rounded-full pointer-events-none"></div>

        <Helmet>
          <title>Forgot Password - Premium Apps</title>
        </Helmet>

        <div className="text-center mb-8 relative z-10">
          <h2 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent mb-2">
            Reset Password
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Enter your email to receive a password reset link</p>
        </div>
        
        {errorMsg && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-red-500/10 border border-red-500/50 text-red-600 dark:text-red-400 p-3 rounded-lg mb-6 text-sm text-center font-medium">
            {errorMsg}
          </motion.div>
        )}

        {successMsg ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center p-6 text-center space-y-4">
            <CheckCircle2 className="w-16 h-16 text-green-500" />
            <h3 className="text-xl font-bold">Email Sent!</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">Please check your inbox and follow the instructions to reset your password.</p>
            <Link to="/login" className="mt-4 px-6 py-2 bg-slate-100 dark:bg-slate-800 rounded-full text-sm font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
              Return to Login
            </Link>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
            <div>
              <label className="block text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 w-5 h-5 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
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
              {isLoading ? <><Loader2 className="w-5 h-5 animate-spin" /> Sending...</> : <><ArrowRight className="w-5 h-5" /> Send Reset Link</>}
            </button>
          </form>
        )}

        {!successMsg && (
          <p className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400 relative z-10">
            Remember your password? <Link to="/login" className="text-primary font-bold hover:underline">Sign In</Link>
          </p>
        )}
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
