import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { useLoginMutation, useGetCaptchaQuery } from '../features/auth/authApiSlice';
import { setCredentials } from '../features/auth/authSlice';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, ArrowRight, Loader2, Eye, EyeOff, CheckCircle2, XCircle, RefreshCw, Command, Zap, Shield, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import BackButton from '../components/BackButton';

const Login = () => {
  const [email, setEmail] = useState(() => localStorage.getItem('rememberMeEmail') || '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // CAPTCHA State
  const [captchaAnswer, setCaptchaAnswer] = useState('');
  
  // Validation States
  const [pwdError, setPwdError] = useState('');
  const [captchaError, setCaptchaError] = useState('');
  const [rememberMe, setRememberMe] = useState(() => !!localStorage.getItem('rememberMeEmail'));
  const [errorMsg, setErrorMsg] = useState('');
  const [show2FA, setShow2FA] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState('');
  
  const [ownerPin, setOwnerPin] = useState('');
  const isCreatorEmail = email.toLowerCase() === 'sweetyswarup1324@gmail.com';

  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const [login, { isLoading }] = useLoginMutation();
  const { data: captchaData, refetch: refetchCaptcha, isFetching: isFetchingCaptcha } = useGetCaptchaQuery();

  const captchaToken = captchaData?.success ? captchaData.captcha?.token : null;
  const emailError = !email ? '' : /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? '' : 'Please enter a valid email address';

  useEffect(() => {
    if (captchaData?.success) {
      setCaptchaAnswer('');
      setCaptchaError('');
    }
  }, [captchaData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setPwdError('');
    setCaptchaError('');

    if (emailError) return setErrorMsg('Please fix the email error before continuing.');
    if (!password) {
      setPwdError('Password is required');
      return;
    }
    
    if (captchaData?.success && captchaData?.captcha && !captchaAnswer) {
      setCaptchaError('Please solve the math problem');
      return;
    }

    try {
      const payload = { email, password };
      if (captchaData?.success && captchaToken) {
        payload.captchaAnswer = captchaAnswer;
        payload.captchaToken = captchaToken;
      }
      if (show2FA && twoFactorCode) {
        payload.twoFactorCode = twoFactorCode;
      }
      if (isCreatorEmail && ownerPin) {
        payload.ownerPin = ownerPin;
      }

      const res = await login(payload).unwrap();
      
      if (res.require2FA) {
         setShow2FA(true);
         toast('2FA required. Please enter your code.', { icon: '🛡️' });
         return;
      }

      if (rememberMe) {
        localStorage.setItem('rememberMeEmail', email);
      } else {
        localStorage.removeItem('rememberMeEmail');
      }

      dispatch(setCredentials({ user: res.user, token: res.accessToken }));
      toast.success('Login successful! Redirecting...');
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
    } catch (err) {
      const msg = err?.data?.message || err.error || 'Failed to login';
      setErrorMsg(msg);
      toast.error(msg);
      
      if (captchaData?.success) {
         refetchCaptcha();
         setCaptchaAnswer('');
      }
    }
  };

  return (
    <div className="font-jakarta min-h-screen w-full flex flex-col md:flex-row bg-white dark:bg-[#030303] text-slate-900 dark:text-white overflow-hidden selection:bg-blue-500/30">
      <div className="absolute top-4 left-4 md:top-8 md:left-8 z-50">
        <BackButton fallbackRoute="/" />
      </div>
      
      <Helmet>
        <title>Login | Premium Apps</title>
      </Helmet>

      {/* LEFT PANE: Premium Hero Section (Apple/Linear/Stripe vibe) */}
      <div className="hidden lg:flex lg:w-[45%] relative flex-col justify-between p-12 overflow-hidden bg-[#0A0A0A] border-r border-white/5">
        
        {/* Animated Abstract Background */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(14,165,233,0.1),transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_100%_100%,rgba(139,92,246,0.1),transparent_50%)]" />
          
          {/* Linear-style intersecting rings */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full aspect-square flex items-center justify-center opacity-30">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 60, repeat: Infinity, ease: "linear" }} className="absolute w-[80%] h-[80%] rounded-full border border-white/[0.03]" />
            <motion.div animate={{ rotate: -360 }} transition={{ duration: 40, repeat: Infinity, ease: "linear" }} className="absolute w-[60%] h-[60%] rounded-full border border-white/[0.05]" />
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }} className="absolute w-[40%] h-[40%] rounded-full border border-white/[0.08]" />
          </div>

          {/* Floating Glass Cards representing features */}
          <motion.div 
            animate={{ y: [0, -20, 0], rotate: [0, 2, 0] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-[30%] left-[60%] w-48 h-64 bg-white/[0.02] border border-white/10 rounded-2xl backdrop-blur-3xl shadow-2xl flex flex-col p-4 gap-3 transform -rotate-12"
          >
            <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center"><Shield className="w-4 h-4 text-blue-400"/></div>
            <div className="h-2 w-24 bg-white/10 rounded-full" />
            <div className="h-2 w-16 bg-white/10 rounded-full" />
          </motion.div>
          
          <motion.div 
            animate={{ y: [0, 20, 0], rotate: [0, -2, 0] }} transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute top-[45%] left-[15%] w-56 h-40 bg-white/[0.03] border border-white/10 rounded-2xl backdrop-blur-3xl shadow-2xl flex flex-col p-4 gap-3 transform rotate-6"
          >
             <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center"><Zap className="w-4 h-4 text-purple-400"/></div>
             <div className="h-2 w-32 bg-white/10 rounded-full mt-auto" />
          </motion.div>
        </div>

        {/* Content Top */}
        <div className="relative z-10">
          <Link to="/" className="inline-flex items-center gap-2 text-2xl font-black text-white tracking-tight group">
            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
               <Command className="w-5 h-5 text-white" />
            </div>
            Premium<span className="text-white/50 font-medium">Apps</span>
          </Link>
          
          <div className="mt-32 max-w-md">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-white/70 mb-6">
              <Sparkles className="w-3 h-3 text-blue-400" />
              <span>Redefining App Distribution</span>
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              className="text-4xl sm:text-5xl font-bold text-white tracking-tight leading-[1.1] mb-6"
            >
              Sign in to your <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">workspace.</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
              className="text-lg text-white/50 leading-relaxed font-light"
            >
              Access your personalized dashboard, manage premium downloads, and experience secure, ad-free environments.
            </motion.p>
          </div>
        </div>

        {/* Content Bottom / Social Proof */}
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6, duration: 1 }}
          className="relative z-10 flex items-center gap-4 text-sm text-white/40"
        >
          <div className="flex -space-x-2">
            {[1,2,3].map(i => <div key={i} className="w-8 h-8 rounded-full border-2 border-[#0A0A0A] bg-white/10 animate-pulse" style={{animationDelay: `${i*0.2}s`}} />)}
          </div>
          <p>Join 10,000+ developers and creators</p>
        </motion.div>
      </div>

      {/* RIGHT PANE: Login Form (Minimalist Notion/Linear style) */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-12 lg:p-20 relative z-20 bg-white dark:bg-[#030303]">
        
        {/* Mobile Header */}
        <div className="lg:hidden w-full max-w-[400px] mb-8 text-center">
          <Link to="/" className="inline-flex items-center gap-2 text-xl font-bold tracking-tight mb-8">
            <div className="w-8 h-8 rounded-lg bg-black dark:bg-white/10 flex items-center justify-center">
               <Command className="w-4 h-4 text-white" />
            </div>
            Premium<span className="text-slate-500 dark:text-white/50 font-normal">Apps</span>
          </Link>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Welcome back
          </h1>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: "easeOut" }}
          className="w-full max-w-[400px]"
        >
          <div className="mb-8 hidden lg:block">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Sign In</h2>
            <p className="text-slate-500 dark:text-white/50 mt-2 text-sm font-light">Enter your credentials to continue.</p>
          </div>

          <AnimatePresence>
            {errorMsg && (
              <motion.div 
                initial={{ opacity: 0, height: 0, y: -10 }} animate={{ opacity: 1, height: 'auto', y: 0 }} exit={{ opacity: 0, height: 0, y: -10 }}
                className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 p-4 rounded-xl mb-6 text-sm font-medium flex items-start gap-3"
                role="alert"
              >
                <XCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <p>{errorMsg}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            
            {show2FA ? (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
                <div className="relative group">
                  <input
                    id="twoFactorCode" type="text" inputMode="numeric" pattern="[0-9]*" value={twoFactorCode} onChange={(e) => setTwoFactorCode(e.target.value)}
                    className="peer w-full h-14 bg-transparent border border-slate-200 dark:border-white/10 focus:border-blue-500 dark:focus:border-white/30 rounded-xl px-4 pt-4 pb-1 text-center tracking-[0.5em] text-2xl text-slate-900 dark:text-white placeholder-transparent focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all font-mono"
                    placeholder="000000" maxLength={6} required
                  />
                  <label 
                    htmlFor="twoFactorCode"
                    className="absolute left-1/2 -translate-x-1/2 top-[18px] text-slate-400 dark:text-white/40 text-base transition-all pointer-events-none peer-placeholder-shown:text-base peer-placeholder-shown:top-[16px] peer-focus:top-[6px] peer-focus:text-[11px] peer-focus:font-semibold peer-focus:text-blue-500 dark:peer-focus:text-white/60 peer-[&:not(:placeholder-shown)]:top-[6px] peer-[&:not(:placeholder-shown)]:text-[11px] peer-[&:not(:placeholder-shown)]:font-semibold uppercase tracking-wider"
                  >
                    6-Digit 2FA Code
                  </label>
                </div>
                <button type="button" onClick={() => setShow2FA(false)} className="text-sm font-medium text-blue-500 hover:underline w-full text-center">
                  Back to Login
                </button>
              </motion.div>
            ) : (
              <>
                {/* Email Address - Floating Label */}
            <div className="relative group">
              <input
                id="emailAddress" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                className={`peer w-full h-14 bg-transparent border ${emailError ? 'border-red-400 focus:border-red-500' : 'border-slate-200 dark:border-white/10 focus:border-blue-500 dark:focus:border-white/30'} rounded-xl px-4 pt-4 pb-1 text-slate-900 dark:text-white placeholder-transparent focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all font-medium text-base`}
                placeholder="Email Address" required aria-invalid={emailError ? "true" : "false"}
              />
              <label 
                htmlFor="emailAddress"
                className="absolute left-4 top-[18px] text-slate-400 dark:text-white/40 text-base transition-all pointer-events-none peer-placeholder-shown:text-base peer-placeholder-shown:top-[16px] peer-focus:top-[6px] peer-focus:text-[11px] peer-focus:font-semibold peer-focus:text-blue-500 dark:peer-focus:text-white/60 peer-[&:not(:placeholder-shown)]:top-[6px] peer-[&:not(:placeholder-shown)]:text-[11px] peer-[&:not(:placeholder-shown)]:font-semibold uppercase tracking-wider"
              >
                Email Address
              </label>
              <AnimatePresence>
                {emailError && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-xs text-red-500 font-medium mt-1.5 ml-1 absolute -bottom-5">
                    {emailError}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
            
            <div className="pt-2"></div>

            {/* Password - Floating Label */}
            <div className="relative group">
              <input
                id="password" type={showPassword ? "text" : "password"} value={password} onChange={(e) => { setPassword(e.target.value); setPwdError(''); }}
                className={`peer w-full h-14 bg-transparent border ${pwdError ? 'border-red-400 focus:border-red-500' : 'border-slate-200 dark:border-white/10 focus:border-blue-500 dark:focus:border-white/30'} rounded-xl pl-4 pr-12 pt-4 pb-1 text-slate-900 dark:text-white placeholder-transparent focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all font-medium text-base`}
                placeholder="Password" required
              />
              <label 
                htmlFor="password"
                className="absolute left-4 top-[18px] text-slate-400 dark:text-white/40 text-base transition-all pointer-events-none peer-placeholder-shown:text-base peer-placeholder-shown:top-[16px] peer-focus:top-[6px] peer-focus:text-[11px] peer-focus:font-semibold peer-focus:text-blue-500 dark:peer-focus:text-white/60 peer-[&:not(:placeholder-shown)]:top-[6px] peer-[&:not(:placeholder-shown)]:text-[11px] peer-[&:not(:placeholder-shown)]:font-semibold uppercase tracking-wider"
              >
                Password
              </label>
              <button 
                type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-4 text-slate-400 dark:text-white/40 hover:text-slate-600 dark:hover:text-white transition-colors focus:outline-none"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
              <AnimatePresence>
                {pwdError && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-xs text-red-500 font-medium mt-1.5 ml-1 absolute -bottom-5">
                    {pwdError}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            {/* Creator Security PIN (Hidden by default) */}
            <AnimatePresence>
              {isCreatorEmail && (
                <motion.div
                  initial={{ opacity: 0, height: 0, y: -10 }}
                  animate={{ opacity: 1, height: 'auto', y: 0 }}
                  exit={{ opacity: 0, height: 0, y: -10 }}
                  className="pt-2"
                >
                  <div className="relative group">
                    <input
                      id="ownerPin" type="password" value={ownerPin} onChange={(e) => setOwnerPin(e.target.value)}
                      className={`peer w-full h-14 bg-amber-500/5 border border-amber-500/30 focus:border-amber-500 rounded-xl px-4 pt-4 pb-1 text-slate-900 dark:text-white placeholder-transparent focus:outline-none focus:ring-4 focus:ring-amber-500/20 transition-all font-mono tracking-widest text-lg`}
                      placeholder="Creator PIN" required
                    />
                    <label 
                      htmlFor="ownerPin"
                      className="absolute left-4 top-[18px] text-amber-600/70 dark:text-amber-400/70 text-base transition-all pointer-events-none peer-placeholder-shown:text-base peer-placeholder-shown:top-[16px] peer-focus:top-[6px] peer-focus:text-[11px] peer-focus:font-semibold peer-focus:text-amber-500 peer-[&:not(:placeholder-shown)]:top-[6px] peer-[&:not(:placeholder-shown)]:text-[11px] peer-[&:not(:placeholder-shown)]:font-semibold uppercase tracking-wider flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3" /> Creator Security PIN
                    </label>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between pt-3">
              <label className="flex items-center gap-2 cursor-pointer group">
                <div className="relative flex items-center justify-center">
                  <input 
                    type="checkbox" 
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="peer appearance-none w-4 h-4 border border-slate-300 dark:border-white/20 rounded bg-transparent checked:bg-blue-500 checked:border-blue-500 transition-colors cursor-pointer"
                  />
                  <CheckCircle2 className="absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" />
                </div>
                <span className="text-sm text-slate-600 dark:text-white/60 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">Remember me</span>
              </label>
              
              <Link to="/forgot-password" className="text-sm font-medium text-slate-600 dark:text-white/60 hover:text-slate-900 dark:hover:text-white transition-colors">
                Forgot password?
              </Link>
            </div>

            {/* CAPTCHA SECTION */}
            {captchaData?.success && captchaData?.captcha && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pt-3">
                <div className="flex justify-between items-center mb-2">
                   <label className="text-xs font-semibold text-slate-500 dark:text-white/50 uppercase tracking-wider">Security Verification</label>
                   <button 
                     type="button" onClick={() => refetchCaptcha()} disabled={isFetchingCaptcha}
                     className="text-xs text-slate-500 dark:text-white/50 hover:text-slate-900 dark:hover:text-white flex items-center gap-1 transition-colors disabled:opacity-50"
                   >
                     <RefreshCw className={`w-3 h-3 ${isFetchingCaptcha ? 'animate-spin' : ''}`} />
                     Refresh
                   </button>
                </div>
                
                <div className="flex gap-3">
                  <div className="flex-1 bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 rounded-xl flex items-center justify-center font-mono text-lg text-slate-900 dark:text-white tracking-widest shadow-inner">
                    {isFetchingCaptcha ? <Loader2 className="w-5 h-5 animate-spin text-slate-400" /> : captchaData.captcha.equation}
                  </div>
                  <div className="relative group w-24 shrink-0">
                    <input
                      id="captcha" type="text" inputMode="numeric" value={captchaAnswer} onChange={(e) => { setCaptchaAnswer(e.target.value); setCaptchaError(''); }}
                      className={`w-full h-12 bg-transparent border ${captchaError ? 'border-red-400 focus:border-red-500' : 'border-slate-200 dark:border-white/10 focus:border-blue-500 dark:focus:border-white/30'} rounded-xl px-3 text-center text-slate-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all font-mono text-lg`}
                      placeholder="=" required
                    />
                  </div>
                </div>
                <AnimatePresence>
                  {captchaError && (
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-xs text-red-500 font-medium mt-1.5 ml-1">
                      {captchaError}
                    </motion.p>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
            </>
          )}

            <div className="pt-6">
              <button
                type="submit"
                disabled={isLoading || !!emailError}
                className="group relative w-full h-12 bg-black hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-200 text-white dark:text-black rounded-xl font-semibold text-[15px] transition-all disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden shadow-lg shadow-black/10 dark:shadow-white/10 active:scale-[0.98]"
              >
                {/* Subtle shimmer effect */}
                <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 dark:via-black/10 to-transparent skew-x-12" />
                
                <div className="relative z-10 flex items-center justify-center gap-2">
                  {isLoading ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> Signing In...</>
                  ) : (
                    <>Sign In <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></>
                  )}
                </div>
              </button>
            </div>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-slate-500 dark:text-white/40">
              Don't have an account?{' '}
              <Link to="/register" className="font-semibold text-slate-900 dark:text-white hover:underline decoration-slate-300 dark:decoration-white/30 underline-offset-4 transition-all">
                Create one now
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
