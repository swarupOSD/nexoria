import React from 'react';
import { motion } from 'framer-motion';
import { DownloadCloud, Zap, ShieldCheck, HardDrive, CheckCircle2 } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import AdPlacement from '../components/AdPlacement';

const VideoDownloader = () => {
  const features = [
    { icon: <Zap className="w-6 h-6 text-yellow-400" />, title: 'Lightning Fast', desc: 'Optimized CDN servers for maximum download speeds.' },
    { icon: <ShieldCheck className="w-6 h-6 text-emerald-400" />, title: '100% Safe', desc: 'No malware, no popup ads, completely secure.' },
    { icon: <HardDrive className="w-6 h-6 text-blue-400" />, title: 'High Quality', desc: 'Download in 4K, 8K, or crystal clear 320kbps MP3.' },
    { icon: <DownloadCloud className="w-6 h-6 text-primary" />, title: 'Unlimited', desc: 'No daily limits or credit systems. Download endlessly.' },
  ];

  return (
    <div className="min-h-screen pt-24 pb-20 relative overflow-hidden flex flex-col">
      <Helmet>
        <title>Free Video Downloader | Nexoria</title>
        <meta name="description" content="Download YouTube videos and music in ultra-high quality for free. No limits, no credits, just lightning fast downloads." />
      </Helmet>

      {/* Animated Background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[2px] bg-gradient-to-r from-transparent via-primary/20 to-transparent rotate-45" />
      </div>

      <div className="container mx-auto px-4 z-10 flex-1 flex flex-col">
        {/* Hero Section */}
        <div className="text-center max-w-4xl mx-auto mb-12 mt-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary font-bold text-sm mb-6 shadow-[0_0_15px_rgba(var(--color-primary),0.3)]"
          >
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
            </span>
            Nexoria Pro Tools
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl lg:text-7xl font-black mb-6 tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-400 dark:from-white dark:via-slate-200 dark:to-slate-500 drop-shadow-lg"
          >
            Ultimate <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Media Downloader</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg md:text-xl text-slate-600 dark:text-slate-300 mb-8 max-w-2xl mx-auto font-medium"
          >
            Download your favorite videos and music instantly. No hidden fees, no credit limits. Just pure, unadulterated high-speed downloading.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap justify-center gap-4 mb-12"
          >
            <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800/50 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700">
              <CheckCircle2 className="w-4 h-4 text-primary" />
              <span className="text-sm font-bold text-slate-700 dark:text-slate-300">YouTube Supported</span>
            </div>
            <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800/50 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700">
              <CheckCircle2 className="w-4 h-4 text-primary" />
              <span className="text-sm font-bold text-slate-700 dark:text-slate-300">4K / 8K Video</span>
            </div>
            <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800/50 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700">
              <CheckCircle2 className="w-4 h-4 text-primary" />
              <span className="text-sm font-bold text-slate-700 dark:text-slate-300">320kbps MP3</span>
            </div>
          </motion.div>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {features.map((feature, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + (idx * 0.1) }}
              className="bg-white/50 dark:bg-[#111]/50 backdrop-blur-xl border border-slate-200 dark:border-white/10 p-6 rounded-2xl shadow-xl hover:shadow-primary/10 transition-all hover:-translate-y-1"
            >
              <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center mb-4">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{feature.title}</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">{feature.desc}</p>
            </motion.div>
          ))}
        </div>

        <AdPlacement location="YTDownloaderTop" />

        {/* Downloader App Container */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6 }}
          className="w-full flex-1 min-h-[700px] bg-black rounded-3xl border border-slate-200 dark:border-slate-700 shadow-2xl shadow-primary/20 overflow-hidden relative group"
        >
          {/* Cyberpunk Accent Lines */}
          <div className="absolute top-0 left-10 w-20 h-1 bg-primary z-10 shadow-[0_0_10px_var(--color-primary)]"></div>
          <div className="absolute bottom-0 right-10 w-32 h-1 bg-accent z-10 shadow-[0_0_10px_var(--color-accent)]"></div>
          <div className="absolute top-10 right-0 w-1 h-20 bg-indigo-500 z-10 shadow-[0_0_10px_indigo]"></div>
          
          <iframe
            src="https://yt-downloader-jm3g.onrender.com"
            title="Nexoria Free Video Downloader"
            width="100%"
            height="100%"
            frameBorder="0"
            className="w-full h-full min-h-[700px] absolute inset-0"
            allowFullScreen
          ></iframe>
        </motion.div>

        <AdPlacement location="YTDownloaderBottom" />

        {/* Disclaimer */}
        <p className="text-center text-xs text-slate-500 mt-8 font-medium max-w-3xl mx-auto">
          By using this service, you agree to not download copyrighted materials without permission. This tool is for personal use only.
        </p>
      </div>
    </div>
  );
};

export default VideoDownloader;
