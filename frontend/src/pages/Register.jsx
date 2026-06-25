import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useRegisterMutation } from '../features/auth/authApiSlice';
import { setCredentials } from '../features/auth/authSlice';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mail, Lock, User, ArrowRight, Loader2, Eye, EyeOff, 
  CheckCircle2, XCircle, Command, Shield, Zap, Sparkles, Star
} from 'lucide-react';
import toast from 'react-hot-toast';
import BackButton from '../components/BackButton';

const avatars = [
  'https://i.pravatar.cc/100?img=1',
  'https://i.pravatar.cc/100?img=2',
  'https://i.pravatar.cc/100?img=3',
  'https://i.pravatar.cc/100?img=4',
];

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [emailError, setEmailError] = useState('');
  const [pwdStrength, setPwdStrength] = useState(0);
  const [pwdRequirements, setPwdRequirements] = useState({
    length: false,
    upper: false,
    lower: false,
    number: false,
    special: false
  });
  
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [searchParams] = useSearchParams();
  const referralCode = searchParams.get('ref') || '';

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [register, { isLoading }] = useRegisterMutation();

  useEffect(() => {
    if (!email) {
      setEmailError('');
      return;
    }
    const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!isValid) setEmailError('Please enter a valid email address');
    else setEmailError('');
  }, [email]);

  useEffect(() => {
    const reqs = {
      length: password.length >= 8,
      upper: /[A-Z]/.test(password),
      lower: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[^A-Za-z0-9]/.test(password)
    };
    setPwdRequirements(reqs);
    
    let strength = 0;
    if (password.length > 0) strength += 1;
    if (reqs.length && (reqs.upper || reqs.lower) && reqs.number) strength = 2;
    if (reqs.length && reqs.upper && reqs.lower && reqs.number && reqs.special) strength = 3;
    if (password.length >= 12 && reqs.upper && reqs.lower && reqs.number && reqs.special) strength = 4;
    
    setPwdStrength(strength);
  }, [password]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (emailError) return setErrorMsg('Please fix the email error before continuing.');
    if (pwdStrength < 2) return setErrorMsg('Please choose a stronger password.');
    if (password !== confirmPassword) return setErrorMsg('Passwords do not match.');

    try {
      const res = await register({ name, email, password, referralCode }).unwrap();
      dispatch(setCredentials({ user: res.user, token: res.accessToken }));
      setSuccessMsg('Account created successfully! Redirecting...');
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (err) {
      setErrorMsg(err?.data?.message || err.error || 'Failed to register');
    }
  };

  const strengthLabels = ['Too Weak', 'Weak', 'Medium', 'Strong', 'Very Strong'];
  const strengthColors = ['bg-slate-200 dark:bg-white/10', 'bg-red-500', 'bg-amber-500', 'bg-emerald-500', 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.8)]'];
  
  return (
    <div className="font-jakarta min-h-screen w-full flex flex-col md:flex-row bg-white dark:bg-[#030303] text-slate-900 dark:text-white overflow-hidden selection:bg-blue-500/30">
      <div className="absolute top-4 left-4 md:top-8 md:left-8 z-50">
        <BackButton fallbackRoute="/" />
      </div>
      
      <Helmet>
        <title>Create Account | Premium Apps</title>
      </Helmet>

      {/* LEFT PANE: Premium Hero Section */}
      <div className="hidden lg:flex lg:w-[45%] relative flex-col justify-between p-12 overflow-hidden bg-[#0A0A0A] border-r border-white/5">
        
        {/* Animated Abstract Background */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_100%_0%,rgba(16,185,129,0.1),transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_0%_100%,rgba(59,130,246,0.1),transparent_50%)]" />
          
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full aspect-square flex items-center justify-center opacity-30">
            <motion.div animate={{ rotate: -360 }} transition={{ duration: 60, repeat: Infinity, ease: "linear" }} className="absolute w-[90%] h-[90%] rounded-full border border-white/[0.03] border-dashed" />
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 45, repeat: Infinity, ease: "linear" }} className="absolute w-[70%] h-[70%] rounded-full border border-white/[0.05]" />
            <motion.div animate={{ rotate: -360 }} transition={{ duration: 25, repeat: Infinity, ease: "linear" }} className="absolute w-[50%] h-[50%] rounded-full border border-white/[0.08]" />
          </div>

          <motion.div 
            animate={{ y: [0, -25, 0], rotate: [0, -3, 0] }} transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-[20%] left-[10%] w-64 h-48 bg-white/[0.02] border border-white/10 rounded-2xl backdrop-blur-3xl shadow-2xl flex flex-col p-4 gap-3 transform rotate-6"
          >
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center"><Shield className="w-4 h-4 text-emerald-400"/></div>
            <div className="h-2 w-3/4 bg-white/10 rounded-full mt-auto" />
            <div className="h-2 w-1/2 bg-white/10 rounded-full" />
          </motion.div>
          
          <motion.div 
            animate={{ y: [0, 20, 0], rotate: [0, 3, 0] }} transition={{ duration: 11, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
            className="absolute top-[50%] left-[55%] w-48 h-56 bg-white/[0.03] border border-white/10 rounded-2xl backdrop-blur-3xl shadow-2xl flex flex-col p-4 gap-3 transform -rotate-12"
          >
             <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center"><Zap className="w-4 h-4 text-blue-400"/></div>
             <div className="h-2 w-full bg-white/10 rounded-full" />
             <div className="h-2 w-2/3 bg-white/10 rounded-full" />
          </motion.div>
        </div>

        <div className="relative z-10">
          <Link to="/" className="inline-flex items-center gap-2 text-2xl font-black text-white tracking-tight group">
            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
               <Command className="w-5 h-5 text-white" />
            </div>
            Premium<span className="text-white/50 font-medium">Apps</span>
          </Link>
          
          <div className="mt-32 max-w-md">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-white/70 mb-6">
              <Sparkles className="w-3 h-3 text-emerald-400" />
              <span>Free Forever</span>
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              className="text-4xl sm:text-5xl font-bold text-white tracking-tight leading-[1.1] mb-6"
            >
              Start building your <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-400">collection.</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
              className="text-lg text-white/50 leading-relaxed font-light"
            >
              Unlock access to thousands of fully unlocked, ad-free applications and games. 
              Join a community of premium users today.
            </motion.p>
          </div>
        </div>

        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6, duration: 1 }}
          className="relative z-10 flex flex-col gap-3"
        >
          <div className="flex items-center gap-4">
            <div className="flex -space-x-3">
              {avatars.map((src, i) => (
                <img key={i} src={src} alt="User" className="w-10 h-10 rounded-full border-2 border-[#0A0A0A] object-cover shadow-sm" />
              ))}
              <div className="w-10 h-10 rounded-full border-2 border-[#0A0A0A] bg-white/5 flex items-center justify-center text-xs font-bold text-white shadow-sm">
                +10k
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1 text-emerald-400/80">
            {[...Array(5)].map((_, i) => <Star key={i} className="w-3 h-3 fill-current" />)}
            <span className="ml-2 text-xs text-white/40 font-medium">Loved by thousands globally</span>
          </div>
        </motion.div>
      </div>

      {/* RIGHT PANE: Registration Form */}
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
            Create account
          </h1>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: "easeOut" }}
          className="w-full max-w-[400px]"
        >
          <div className="mb-8 hidden lg:block">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Create Account</h2>
            <p className="text-slate-500 dark:text-white/50 mt-2 text-sm font-light">Set up your premium profile in seconds.</p>
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

            {successMsg && (
              <motion.div 
                initial={{ opacity: 0, height: 0, y: -10 }} animate={{ opacity: 1, height: 'auto', y: 0 }} exit={{ opacity: 0, height: 0, y: -10 }}
                className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400 p-4 rounded-xl mb-6 text-sm font-medium flex items-start gap-3"
                role="status"
              >
                <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
                <p>{successMsg}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            
            {/* Full Name */}
            <div className="relative group">
              <input
                id="fullName" type="text" value={name} onChange={(e) => setName(e.target.value)}
                className="peer w-full h-14 bg-transparent border border-slate-200 dark:border-white/10 focus:border-blue-500 dark:focus:border-white/30 rounded-xl px-4 pt-4 pb-1 text-slate-900 dark:text-white placeholder-transparent focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all font-medium text-base"
                placeholder="Full Name" required
              />
              <label 
                htmlFor="fullName"
                className="absolute left-4 top-[18px] text-slate-400 dark:text-white/40 text-base transition-all pointer-events-none peer-placeholder-shown:text-base peer-placeholder-shown:top-[16px] peer-focus:top-[6px] peer-focus:text-[11px] peer-focus:font-semibold peer-focus:text-blue-500 dark:peer-focus:text-white/60 peer-[&:not(:placeholder-shown)]:top-[6px] peer-[&:not(:placeholder-shown)]:text-[11px] peer-[&:not(:placeholder-shown)]:font-semibold uppercase tracking-wider"
              >
                Full Name
              </label>
            </div>

            {/* Email Address */}
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
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-xs text-red-500 font-medium mt-1 ml-1 absolute -bottom-5">
                    {emailError}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
            
            <div className="pt-1"></div>

            {/* Password */}
            <div className="relative group">
              <input
                id="password" type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)}
                className="peer w-full h-14 bg-transparent border border-slate-200 dark:border-white/10 focus:border-blue-500 dark:focus:border-white/30 rounded-xl pl-4 pr-12 pt-4 pb-1 text-slate-900 dark:text-white placeholder-transparent focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all font-medium text-base"
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
            </div>

            {/* Password Strength Meter */}
            <AnimatePresence>
              {password.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                  className="space-y-3 overflow-hidden"
                >
                  <div className="flex gap-1 h-1 w-full mt-2">
                    {[1, 2, 3, 4].map((level) => (
                      <div 
                        key={level} 
                        className={`h-full flex-1 rounded-full transition-all duration-500 ${
                          pwdStrength >= level ? strengthColors[pwdStrength] : 'bg-slate-200 dark:bg-white/5'
                        }`}
                      />
                    ))}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-[10px] sm:text-xs font-medium text-slate-500 dark:text-white/40">
                    <div className={`flex items-center gap-1.5 transition-colors ${pwdRequirements.length ? 'text-emerald-500 dark:text-emerald-400' : ''}`}>
                      <CheckCircle2 className="w-3 h-3" /> 8+ Characters
                    </div>
                    <div className={`flex items-center gap-1.5 transition-colors ${pwdRequirements.upper ? 'text-emerald-500 dark:text-emerald-400' : ''}`}>
                      <CheckCircle2 className="w-3 h-3" /> Uppercase
                    </div>
                    <div className={`flex items-center gap-1.5 transition-colors ${pwdRequirements.number ? 'text-emerald-500 dark:text-emerald-400' : ''}`}>
                      <CheckCircle2 className="w-3 h-3" /> One Number
                    </div>
                    <div className={`flex items-center gap-1.5 transition-colors ${pwdRequirements.special ? 'text-emerald-500 dark:text-emerald-400' : ''}`}>
                      <CheckCircle2 className="w-3 h-3" /> Special Char
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Confirm Password */}
            <div className="relative group pt-1">
              <input
                id="confirmPassword" type={showConfirmPassword ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                className={`peer w-full h-14 bg-transparent border ${confirmPassword && confirmPassword !== password ? 'border-amber-400 focus:border-amber-500' : 'border-slate-200 dark:border-white/10 focus:border-blue-500 dark:focus:border-white/30'} rounded-xl pl-4 pr-12 pt-4 pb-1 text-slate-900 dark:text-white placeholder-transparent focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all font-medium text-base`}
                placeholder="Confirm Password" required
              />
              <label 
                htmlFor="confirmPassword"
                className="absolute left-4 top-[18px] text-slate-400 dark:text-white/40 text-base transition-all pointer-events-none peer-placeholder-shown:text-base peer-placeholder-shown:top-[16px] peer-focus:top-[6px] peer-focus:text-[11px] peer-focus:font-semibold peer-focus:text-blue-500 dark:peer-focus:text-white/60 peer-[&:not(:placeholder-shown)]:top-[6px] peer-[&:not(:placeholder-shown)]:text-[11px] peer-[&:not(:placeholder-shown)]:font-semibold uppercase tracking-wider"
              >
                Confirm Password
              </label>
              <button 
                type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-4 text-slate-400 dark:text-white/40 hover:text-slate-600 dark:hover:text-white transition-colors focus:outline-none"
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
              
              <AnimatePresence>
                {confirmPassword && confirmPassword !== password && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-xs text-amber-500 font-medium mt-1 ml-1 absolute -bottom-5">
                    Passwords do not match
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
            
            <div className="pt-4">
              <button
                type="submit"
                disabled={isLoading || !!emailError || (confirmPassword !== password && confirmPassword.length > 0) || pwdStrength < 2}
                className="group relative w-full h-12 bg-black hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-200 text-white dark:text-black rounded-xl font-semibold text-[15px] transition-all disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden shadow-lg shadow-black/10 dark:shadow-white/10 active:scale-[0.98]"
              >
                <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 dark:via-black/10 to-transparent skew-x-12" />
                
                <div className="relative z-10 flex items-center justify-center gap-2">
                  {isLoading ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> Creating...</>
                  ) : (
                    <>Create Account <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></>
                  )}
                </div>
              </button>
            </div>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-slate-500 dark:text-white/40">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-slate-900 dark:text-white hover:underline decoration-slate-300 dark:decoration-white/30 underline-offset-4 transition-all">
                Sign In
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;
