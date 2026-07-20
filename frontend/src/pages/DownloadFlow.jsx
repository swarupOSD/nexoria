import { useParams, Link } from 'react-router-dom';
import { useGetPostBySlugQuery } from '../features/api/postApiSlice';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Download as DownloadIcon, ShieldCheck, Clock } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useGetSettingsQuery } from '../features/settings/settingsApiSlice';
import AdPlacement from '../components/AdPlacement';

const DownloadFlow = () => {
  const { slug } = useParams();
  const { data: postRes, isLoading } = useGetPostBySlugQuery(slug);
  const { data: settingsRes, isLoading: isLoadingSettings } = useGetSettingsQuery();
  
  // Default to 15 seconds, but use settings if available
  const initialTimer = settingsRes?.data?.ads?.timerSeconds ?? 15;
  const [countdown, setCountdown] = useState(initialTimer);
  const [showLinks, setShowLinks] = useState(false);
  const [timerStarted, setTimerStarted] = useState(false);

  useEffect(() => {
    if (settingsRes?.data?.ads?.timerSeconds !== undefined && !timerStarted) {
      setCountdown(settingsRes.data.ads.timerSeconds);
      setTimerStarted(true);
    }
  }, [settingsRes, timerStarted]);

  useEffect(() => {
    let timer;
    if (!isLoading && postRes?.data && countdown > 0 && timerStarted) {
      timer = setInterval(() => setCountdown(prev => prev - 1), 1000);
    } else if (countdown === 0 && timerStarted) {
      setShowLinks(true);
    }
    return () => clearInterval(timer);
  }, [countdown, isLoading, postRes, timerStarted]);

  if (isLoading || isLoadingSettings) return <div className="flex justify-center mt-20"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div></div>;

  const post = postRes?.data;
  if (!post) return <div className="text-center mt-20 text-red-500">Post not found</div>;

  const handleDownload = async (urlIndex = 0) => {
    try {
      // We should ideally hit POST /api/downloads/:postId, but let's just use fetch directly
      const token = localStorage.getItem('token');
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`/api/downloads/${post._id}`, {
        method: 'POST',
        headers
      });
      const data = await res.json();
      
      if (data.success && data.downloadUrls && data.downloadUrls.length > 0) {
        // Redirect to the actual link pasted by the Admin
        window.location.href = data.downloadUrls[urlIndex];
      } else if (post.downloadUrls && post.downloadUrls.length > 0) {
        // Fallback
        window.location.href = post.downloadUrls[urlIndex];
      } else {
        alert('Download link not available.');
      }
    } catch (error) {
      console.error('Download error:', error);
      if (post.downloadUrls && post.downloadUrls.length > 0) {
        window.location.href = post.downloadUrls[urlIndex];
      }
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <Helmet>
        <title>Download {post.title} - ModsApp</title>
      </Helmet>

      <div className="text-center py-12 px-6 bg-white/5 dark:bg-[#0A0A0A]/60 backdrop-blur-3xl rounded-[2.5rem] border border-slate-200/50 dark:border-white/10 shadow-[0_20px_40px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_40px_rgba(59,130,246,0.05)] relative overflow-hidden space-y-6">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-[100px] pointer-events-none"></div>
        
        <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white drop-shadow-md relative z-10">Downloading {post.title}</h1>
        <div className="flex items-center justify-center gap-2 text-emerald-500 font-bold relative z-10">
          <ShieldCheck className="w-5 h-5 drop-shadow-sm" /> Verified Safe to Download
        </div>

        <div className="py-8 relative z-10">
          {!showLinks ? (
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="flex flex-col items-center gap-6">
              <div className="w-32 h-32 rounded-full bg-black/5 dark:bg-white/5 backdrop-blur-md shadow-[0_0_50px_rgba(59,130,246,0.3)] border border-blue-500/30 flex items-center justify-center text-5xl font-black text-blue-500 relative">
                <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-500 animate-spin opacity-50"></div>
                {countdown}
              </div>
              <p className="text-slate-500 dark:text-slate-400 font-medium flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-500" /> Generating secure download links...
              </p>
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-6">Your Links are Ready!</h2>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button onClick={() => handleDownload(0)} className="py-4 px-8 flex items-center justify-center gap-3 font-black text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 rounded-2xl shadow-[0_10px_20px_rgba(59,130,246,0.3)] hover:shadow-[0_15px_30px_rgba(59,130,246,0.5)] hover:-translate-y-1 transition-all duration-300 group">
                  <DownloadIcon className="w-6 h-6 group-hover:animate-bounce drop-shadow-md" /> Primary Server
                </button>
                {post.downloadUrls && post.downloadUrls.length > 1 && (
                  <button onClick={() => handleDownload(1)} className="py-4 px-8 flex items-center justify-center gap-3 font-black text-slate-700 dark:text-white bg-white/5 hover:bg-white/10 border border-slate-200/50 dark:border-white/10 rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-1 hover:border-blue-500/30 transition-all duration-300 group">
                    <DownloadIcon className="w-6 h-6 group-hover:text-blue-500 transition-colors" /> Mirror Link
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </div>

        {/* Ads Section */}
        <div className="w-full">
          <AdPlacement location="Download Flow Top" />
        </div>

        <div className="pt-6 relative z-10">
          <Link to={`/post/${post.slug}`} className="text-blue-500 font-bold hover:text-blue-400 hover:underline flex items-center justify-center gap-2">
            ← Return to App Details
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DownloadFlow;
