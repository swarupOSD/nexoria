import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, Music, Heart, Flame } from 'lucide-react';
import CountUp from './CountUp';

const WrappedModal = ({ isOpen, onClose, data }) => {
  const [slide, setSlide] = useState(0);

  useEffect(() => {
    if (!isOpen) {
      setSlide(0);
    }
  }, [isOpen]);

  if (!isOpen || !data) return null;

  const nextSlide = () => {
    if (slide < 3) setSlide(slide + 1);
    else onClose();
  };

  const prevSlide = () => {
    if (slide > 0) setSlide(slide - 1);
  };

  const slides = [
    // Slide 0: Intro & Total Minutes
    <motion.div
      key="slide0"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.1 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center h-full text-center p-8 bg-gradient-to-br from-indigo-900 to-purple-900"
    >
      <Music className="w-16 h-16 text-purple-300 mb-6 animate-bounce" />
      <h2 className="text-3xl sm:text-5xl font-black text-white mb-4">This year, you didn't just listen.</h2>
      <p className="text-xl text-purple-200 mb-8">You lived inside the music.</p>
      
      <div className="bg-white/10 backdrop-blur-md p-8 rounded-3xl border border-white/20 shadow-2xl">
        <p className="text-lg text-slate-300 uppercase tracking-widest font-bold mb-2">Total Listening Time</p>
        <div className="text-6xl sm:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-500">
          <CountUp end={data.totalMinutes || 0} duration={2} />
        </div>
        <p className="text-xl text-white mt-2">Minutes</p>
      </div>
    </motion.div>,

    // Slide 1: Total Streams
    <motion.div
      key="slide1"
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center h-full text-center p-8 bg-gradient-to-bl from-rose-900 to-pink-900"
    >
      <Play className="w-16 h-16 text-pink-300 mb-6" />
      <h2 className="text-3xl sm:text-5xl font-black text-white mb-8">You hit play... a lot.</h2>
      
      <div className="bg-white/10 backdrop-blur-md p-8 rounded-3xl border border-white/20 shadow-2xl">
        <div className="text-7xl sm:text-9xl font-black text-white drop-shadow-2xl">
          <CountUp end={data.totalStreams || 0} duration={2} />
        </div>
        <p className="text-2xl text-pink-200 mt-4 font-bold tracking-wide uppercase">Total Streams</p>
      </div>
    </motion.div>,

    // Slide 2: Top Song
    <motion.div
      key="slide2"
      initial={{ opacity: 0, y: 100 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -100 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center h-full text-center p-8 bg-gradient-to-br from-blue-900 to-indigo-900"
    >
      <Flame className="w-16 h-16 text-orange-400 mb-6" />
      <h2 className="text-3xl sm:text-5xl font-black text-white mb-8">One song ruled them all.</h2>
      
      {data.topSongs && data.topSongs.length > 0 ? (
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-purple-500 rounded-3xl blur-xl opacity-50 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="relative bg-slate-900 p-6 rounded-3xl border border-white/10 flex flex-col items-center">
            <img src={data.topSongs[0].image} alt="Top Song" className="w-48 h-48 sm:w-64 sm:h-64 rounded-2xl object-cover mb-6 shadow-2xl" />
            <h3 className="text-3xl font-bold text-white mb-2">{data.topSongs[0].title}</h3>
            <p className="text-xl text-slate-400">{data.topSongs[0].artist}</p>
            <p className="mt-4 text-sm font-bold text-indigo-400 uppercase tracking-widest bg-indigo-900/50 px-4 py-2 rounded-full">
              Played {data.topSongs[0].listenCount} times
            </p>
          </div>
        </div>
      ) : (
        <p className="text-2xl text-white">Not enough data to find your top song yet!</p>
      )}
    </motion.div>,

    // Slide 3: Summary / Top 5
    <motion.div
      key="slide3"
      initial={{ opacity: 0, scale: 1.1 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col h-full p-6 sm:p-12 bg-slate-900 overflow-y-auto"
    >
      <div className="max-w-md mx-auto w-full pt-10 pb-20">
        <h2 className="text-4xl font-black text-white mb-2">Your 2026 Wrapped</h2>
        <p className="text-slate-400 mb-8">A look back at your unique sound.</p>

        <div className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 rounded-3xl p-6 border border-white/10 shadow-2xl mb-8">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><Flame className="text-orange-500"/> Top Tracks</h3>
          <div className="space-y-4">
            {data.topSongs?.map((song, i) => (
              <div key={song._id} className="flex items-center gap-4">
                <span className="text-xl font-black text-slate-500 w-6">{i + 1}</span>
                <img src={song.image} alt={song.title} className="w-12 h-12 rounded-lg object-cover shadow-md" />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-white truncate">{song.title}</p>
                  <p className="text-sm text-slate-400 truncate">{song.artist}</p>
                </div>
              </div>
            ))}
            {(!data.topSongs || data.topSongs.length === 0) && <p className="text-slate-400">Keep listening to generate your top tracks!</p>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/5 rounded-3xl p-6 border border-white/10 text-center">
            <p className="text-sm text-slate-400 font-bold uppercase tracking-wider mb-2">Minutes</p>
            <p className="text-3xl font-black text-white">{data.totalMinutes || 0}</p>
          </div>
          <div className="bg-white/5 rounded-3xl p-6 border border-white/10 text-center">
            <p className="text-sm text-slate-400 font-bold uppercase tracking-wider mb-2">Streams</p>
            <p className="text-3xl font-black text-white">{data.totalStreams || 0}</p>
          </div>
        </div>
      </div>
    </motion.div>
  ];

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black">
      {/* Progress Bars */}
      <div className="absolute top-4 left-4 right-12 z-[310] flex gap-2">
        {slides.map((_, i) => (
          <div key={i} className="h-1 flex-1 bg-white/20 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-white"
              initial={{ width: i < slide ? '100%' : '0%' }}
              animate={{ width: i === slide ? '100%' : i < slide ? '100%' : '0%' }}
              transition={{ duration: i === slide ? 5 : 0.2, ease: 'linear' }}
              onAnimationComplete={() => {
                if (i === slide && i < 3) nextSlide();
              }}
            />
          </div>
        ))}
      </div>

      <button onClick={onClose} className="absolute top-2 right-2 z-[310] p-2 text-white/50 hover:text-white transition-colors">
        <X className="w-8 h-8" />
      </button>

      {/* Tap Zones for Navigation */}
      <div className="absolute inset-y-0 left-0 w-1/3 z-[305] cursor-pointer" onClick={prevSlide} />
      <div className="absolute inset-y-0 right-0 w-2/3 z-[305] cursor-pointer" onClick={nextSlide} />

      <AnimatePresence mode="wait">
        {slides[slide]}
      </AnimatePresence>
    </div>
  );
};

export default WrappedModal;
