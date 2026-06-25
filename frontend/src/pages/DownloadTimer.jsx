import { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useTrackDownloadMutation } from '../features/download/downloadApiSlice';
import { toast } from 'react-hot-toast';
import { ShieldCheck, Download, Loader2, ArrowLeft } from 'lucide-react';
import PremiumAdWrapper from '../components/PremiumAdWrapper';

const DownloadTimer = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state;

  const [timeLeft, setTimeLeft] = useState(15); // 15 seconds timer
  const [canDownload, setCanDownload] = useState(false);
  const [trackDownload, { isLoading }] = useTrackDownloadMutation();

  useEffect(() => {
    if (!state?.postId || !state?.linkId) {
      toast.error('Invalid download link!');
      navigate('/');
      return;
    }

    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(prev => prev - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanDownload(true);
    }
  }, [timeLeft, state, navigate]);

  const handleDownload = async () => {
    try {
      const res = await trackDownload({ postId: state.postId, linkId: state.linkId }).unwrap();
      if (res.downloadUrl) {
        window.location.href = res.downloadUrl;
      }
    } catch(err) {
      console.error(err);
      toast.error(err?.data?.message || 'Failed to process download link');
    }
  };

  if (!state) return null;

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
      <PremiumAdWrapper className="mb-8" dataAdSlot="DOWNLOAD_TOP" />
      
      <div className="bg-white dark:bg-[#111] border border-slate-200 dark:border-white/5 rounded-3xl p-8 max-w-xl w-full shadow-2xl text-center relative overflow-hidden">
        <button onClick={() => navigate(-1)} className="absolute top-4 left-4 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition">
          <ArrowLeft className="w-5 h-5 text-slate-500" />
        </button>

        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <ShieldCheck className="w-10 h-10 text-primary" />
        </div>
        
        <h1 className="text-3xl font-black mb-2 dark:text-white">Your Link is Almost Ready</h1>
        <p className="text-slate-500 mb-8 font-medium">Please wait while we securely generate your download link.</p>

        {/* Progress Circle */}
        {!canDownload ? (
          <div className="relative w-40 h-40 mx-auto mb-8 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" className="fill-none stroke-slate-200 dark:stroke-slate-800" strokeWidth="8" />
              <circle 
                cx="50" cy="50" r="45" 
                className="fill-none stroke-primary transition-all duration-1000 ease-linear" 
                strokeWidth="8" 
                strokeDasharray="283" 
                strokeDashoffset={283 - (283 * ((15 - timeLeft) / 15))}
                strokeLinecap="round" 
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-black text-primary">{timeLeft}</span>
              <span className="text-xs text-slate-500 uppercase tracking-wider font-bold">Seconds</span>
            </div>
          </div>
        ) : (
          <div className="mb-8 animate-bounce">
            <button 
              onClick={handleDownload}
              disabled={isLoading}
              className="w-full py-4 px-8 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold text-xl rounded-2xl shadow-xl shadow-green-500/30 flex items-center justify-center gap-3 transition-transform hover:scale-105 active:scale-95 disabled:opacity-50"
            >
              {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Download className="w-6 h-6" />}
              {isLoading ? 'Processing...' : 'Download File Now'}
            </button>
          </div>
        )}
        
        <PremiumAdWrapper className="mt-6" dataAdSlot="DOWNLOAD_BOTTOM" />
      </div>
      
      <PremiumAdWrapper className="mt-8" dataAdSlot="DOWNLOAD_FOOTER" />
    </div>
  );
};

export default DownloadTimer;
