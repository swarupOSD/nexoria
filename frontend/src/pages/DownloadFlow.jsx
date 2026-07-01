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

      <div className="text-center py-10 glass-card space-y-4">
        <h1 className="text-3xl font-bold dark:text-white">Downloading {post.title}</h1>
        <div className="flex items-center justify-center gap-2 text-green-600 font-medium">
          <ShieldCheck className="w-5 h-5" /> Verified Safe to Download
        </div>

        <div className="py-8">
          {!showLinks ? (
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="flex flex-col items-center gap-4">
              <div className="w-24 h-24 rounded-full border-4 border-slate-200 dark:border-slate-700 flex items-center justify-center text-4xl font-bold text-blue-500">
                {countdown}
              </div>
              <p className="text-slate-500 flex items-center gap-2">
                <Clock className="w-4 h-4" /> Generating secure download links...
              </p>
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4">Your Links are Ready!</h2>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button onClick={() => handleDownload(0)} className="premium-btn py-3 flex items-center justify-center gap-2 font-bold px-8">
                  <DownloadIcon className="w-5 h-5" /> Primary Server
                </button>
                {post.downloadUrls && post.downloadUrls.length > 1 && (
                  <button onClick={() => handleDownload(1)} className="flex items-center justify-center gap-2 bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-white px-8 py-3 rounded-xl font-bold hover:bg-slate-300 dark:hover:bg-slate-700 transition">
                    <DownloadIcon className="w-5 h-5" /> Mirror Link
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

        <div className="pt-6">
          <Link to={`/post/${post.slug}`} className="text-blue-500 hover:underline">
            ← Return to App Details
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DownloadFlow;
