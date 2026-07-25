import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, FastForward, Rewind, CheckCircle, Save, X, Mic2, FileText, Settings, SkipBack } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUpdateNexoriaTrackLyricsMutation, useGetTrackLyricsQuery } from '../../../features/api/nexoriaMusicApiSlice';
import toast from 'react-hot-toast';

const NexoriaLyricsStudio = ({ isOpen, onClose, track }) => {
  const [step, setStep] = useState(1); // 1: Paste Text, 2: Sync Mode
  const [plainLyrics, setPlainLyrics] = useState('');
  const [lines, setLines] = useState([]); // { text: string, time: number | null }
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef(null);
  
  const [updateLyrics, { isLoading: isSaving }] = useUpdateNexoriaTrackLyricsMutation();
  const { data: lyricsData } = useGetTrackLyricsQuery(track?._id, { skip: !track || !isOpen });

  useEffect(() => {
    if (isOpen && track) {
      setStep(1);
      setCurrentLineIndex(0);
      setIsPlaying(false);
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
      }
      
      if (lyricsData?.data?.plainText) {
        setPlainLyrics(lyricsData.data.plainText);
      } else {
        setPlainLyrics('');
      }
    }
  }, [isOpen, track, lyricsData]);

  const handleStartSync = () => {
    const rawLines = plainLyrics.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    if (rawLines.length === 0) {
      toast.error('Please paste some lyrics first!');
      return;
    }
    
    // Check if it already has time tags to preserve them if needed, but for now we assume fresh sync
    const initialLines = rawLines.map(line => {
      // Basic check to see if it's already an LRC line like [00:12.34] Hello
      const match = line.match(/^\[(\d{2}):(\d{2}\.\d{2,3})\]\s*(.*)$/);
      if (match) {
        const mins = parseInt(match[1]);
        const secs = parseFloat(match[2]);
        return { text: match[3], time: (mins * 60) + secs };
      }
      return { text: line, time: null };
    });
    
    setLines(initialLines);
    setStep(2);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const syncCurrentLine = () => {
    if (currentLineIndex >= lines.length || !audioRef.current) return;
    
    setLines(prev => {
      const newLines = [...prev];
      newLines[currentLineIndex] = {
        ...newLines[currentLineIndex],
        time: audioRef.current.currentTime
      };
      return newLines;
    });
    
    setCurrentLineIndex(prev => prev + 1);
  };

  // Keyboard shortcut (Spacebar to sync)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen || step !== 2) return;
      
      if (e.code === 'Space' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
        e.preventDefault();
        syncCurrentLine();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, step, currentLineIndex, lines]);

  const resetSync = () => {
    setLines(prev => prev.map(l => ({ ...l, time: null })));
    setCurrentLineIndex(0);
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const undoLastSync = () => {
    if (currentLineIndex === 0) return;
    const newIdx = currentLineIndex - 1;
    setLines(prev => {
      const newLines = [...prev];
      newLines[newIdx] = { ...newLines[newIdx], time: null };
      return newLines;
    });
    setCurrentLineIndex(newIdx);
    
    // Optionally rewind audio slightly to right before the undone line
    if (audioRef.current && newIdx > 0 && lines[newIdx - 1].time) {
      audioRef.current.currentTime = lines[newIdx - 1].time;
    } else if (audioRef.current) {
      audioRef.current.currentTime = 0;
    }
  };

  const handleSave = async () => {
    try {
      // Build synced lyrics array for the backend
      const syncedLyrics = lines
        .filter(l => l.time !== null)
        .map(l => ({
          time: l.time,
          text: l.text
        }));

      // Create raw .lrc string
      const lrcRaw = syncedLyrics.map(line => {
        const m = Math.floor(line.time / 60).toString().padStart(2, '0');
        const s = (line.time % 60).toFixed(2).padStart(5, '0');
        return `[${m}:${s}] ${line.text}`;
      }).join('\n');

      await updateLyrics({
        trackId: track._id,
        data: {
          syncedLyrics,
          plainText: plainLyrics || lrcRaw
        }
      }).unwrap();
      
      toast.success('Lyrics synced and saved successfully!');
      onClose();
    } catch (error) {
      toast.error('Failed to save lyrics');
    }
  };

  const formatTime = (time) => {
    if (time === null || isNaN(time)) return '--:--';
    const m = Math.floor(time / 60).toString().padStart(2, '0');
    const s = Math.floor(time % 60).toString().padStart(2, '0');
    const ms = Math.floor((time % 1) * 100).toString().padStart(2, '0');
    return `${m}:${s}.${ms}`;
  };

  if (!isOpen || !track) return null;

  const audioSrc = track.audioUrl || (track.telegramFileId ? `/api/nexoria-music/stream/${track.telegramFileId}` : null);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="bg-[#121212] border border-white/10 rounded-2xl w-full max-w-5xl h-[85vh] flex flex-col shadow-[0_0_50px_rgba(30,215,96,0.15)] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/5 bg-gradient-to-r from-[#181818] to-[#121212]">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-zinc-800 shrink-0 overflow-hidden shadow-md">
                {track.coverImage || track.album?.coverImage || track.artist?.image ? (
                  <img src={track.coverImage || track.album?.coverImage || track.artist?.image} alt="cover" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-zinc-800"><Music className="w-5 h-5 text-zinc-500" /></div>
                )}
              </div>
              <div>
                <h2 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
                  Lyrics Studio 
                  <span className="bg-[#1ed760]/20 text-[#1ed760] text-[10px] px-2 py-0.5 rounded-full uppercase tracking-widest border border-[#1ed760]/30">Pro</span>
                </h2>
                <p className="text-[#b3b3b3] text-sm mt-0.5 truncate max-w-md">{track.title} • {track.artist?.name}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 text-[#b3b3b3] hover:text-white transition-colors rounded-full hover:bg-white/10">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="flex-1 overflow-hidden flex">
            {step === 1 ? (
              // Step 1: Paste Plain Text
              <div className="flex-1 p-8 flex flex-col gap-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-full bg-[#1ed760]/20 flex items-center justify-center text-[#1ed760] font-bold">1</div>
                  <h3 className="text-xl font-bold">Paste Plain Text Lyrics</h3>
                </div>
                <p className="text-[#b3b3b3] text-sm">Copy lyrics from Google or any lyrics site and paste them below. Make sure there is one line per sentence.</p>
                <textarea 
                  value={plainLyrics}
                  onChange={(e) => setPlainLyrics(e.target.value)}
                  className="flex-1 w-full bg-[#181818] border border-white/10 rounded-xl p-6 text-white text-lg focus:outline-none focus:border-[#1ed760]/50 focus:ring-1 focus:ring-[#1ed760]/50 transition-all custom-scrollbar resize-none leading-relaxed"
                  placeholder="Just paste the raw text here..."
                />
                <div className="flex justify-end mt-2">
                  <button 
                    onClick={handleStartSync}
                    className="px-8 py-3 bg-[#1ed760] hover:bg-[#1fdf64] text-black rounded-full font-bold transition-transform hover:scale-105 active:scale-95 flex items-center gap-2"
                  >
                    <Mic2 className="w-5 h-5" /> Start Syncing
                  </button>
                </div>
              </div>
            ) : (
              // Step 2: Sync Mode
              <div className="flex-1 flex flex-col lg:flex-row h-full">
                
                {/* Left Side: Audio Player & Controls */}
                <div className="w-full lg:w-1/3 bg-[#181818] border-r border-white/5 p-6 flex flex-col gap-8 h-full overflow-y-auto custom-scrollbar">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#1ed760]/20 flex items-center justify-center text-[#1ed760] font-bold">2</div>
                    <h3 className="text-xl font-bold">Sync Mode</h3>
                  </div>
                  
                  <div className="bg-[#282828] rounded-xl p-6 flex flex-col items-center gap-4 border border-white/5 shadow-inner text-center">
                     <p className="text-[#b3b3b3] text-sm leading-relaxed">
                       Press the <strong className="text-white">Play</strong> button. Every time the singer sings the highlighted line, press <strong className="text-white">Spacebar</strong> or click the sync button.
                     </p>
                     
                     <div className="w-full mt-2">
                       <audio 
                         ref={audioRef} 
                         src={audioSrc}
                         onTimeUpdate={handleTimeUpdate}
                         onEnded={() => setIsPlaying(false)}
                       />
                       
                       <div className="flex items-center justify-between mb-2">
                         <span className="text-xs text-[#b3b3b3] font-medium">{formatTime(currentTime)}</span>
                         <span className="text-xs text-[#b3b3b3] font-medium">{formatTime(audioRef.current?.duration || 0)}</span>
                       </div>
                       
                       {/* Progress Bar (Visual Only) */}
                       <div className="w-full h-2 bg-black/50 rounded-full overflow-hidden">
                         <div 
                           className="h-full bg-[#1ed760]" 
                           style={{ width: `${(currentTime / (audioRef.current?.duration || 1)) * 100}%` }}
                         />
                       </div>
                     </div>
                     
                     {/* Playback Controls */}
                     <div className="flex items-center gap-6 mt-4">
                       <button onClick={() => { if(audioRef.current) audioRef.current.currentTime -= 5; }} className="text-[#b3b3b3] hover:text-white transition-colors">
                         <Rewind className="w-6 h-6" />
                       </button>
                       <button 
                         onClick={togglePlay}
                         className="w-14 h-14 bg-white text-black rounded-full flex items-center justify-center hover:scale-105 transition-transform"
                       >
                         {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
                       </button>
                       <button onClick={() => { if(audioRef.current) audioRef.current.currentTime += 5; }} className="text-[#b3b3b3] hover:text-white transition-colors">
                         <FastForward className="w-6 h-6" />
                       </button>
                     </div>
                  </div>
                  
                  <div className="flex flex-col gap-3">
                    <button 
                      onClick={syncCurrentLine}
                      disabled={currentLineIndex >= lines.length}
                      className="w-full py-4 bg-[#1ed760] hover:bg-[#1fdf64] text-black font-black text-lg rounded-xl shadow-[0_0_20px_rgba(30,215,96,0.3)] transition-transform hover:scale-102 active:scale-95 disabled:opacity-50 disabled:hover:scale-100 flex justify-center items-center gap-2"
                    >
                      <CheckCircle className="w-6 h-6" /> SYNC (SPACEBAR)
                    </button>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <button 
                        onClick={undoLastSync}
                        disabled={currentLineIndex === 0}
                        className="py-3 bg-[#282828] hover:bg-[#333] text-white font-bold rounded-xl transition-colors flex justify-center items-center gap-2 text-sm disabled:opacity-50 border border-white/5"
                      >
                        <SkipBack className="w-4 h-4" /> Undo Last
                      </button>
                      <button 
                        onClick={resetSync}
                        className="py-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 font-bold rounded-xl transition-colors flex justify-center items-center gap-2 text-sm border border-red-500/20"
                      >
                        Reset All
                      </button>
                    </div>
                  </div>
                  
                  <div className="mt-auto pt-6">
                     <button 
                        onClick={handleSave}
                        disabled={isSaving}
                        className="w-full py-3 bg-white hover:bg-gray-200 text-black font-bold rounded-xl transition-transform hover:scale-102 active:scale-95 flex justify-center items-center gap-2"
                      >
                        {isSaving ? <span className="animate-spin text-xl">◌</span> : <Save className="w-5 h-5" />} Save Lyrics
                      </button>
                  </div>
                </div>
                
                {/* Right Side: Lyrics List */}
                <div className="w-full lg:w-2/3 p-8 h-full overflow-y-auto custom-scrollbar relative">
                   <div className="space-y-4 pb-32">
                     {lines.map((line, idx) => {
                       const isCurrent = idx === currentLineIndex;
                       const isDone = idx < currentLineIndex;
                       
                       return (
                         <div 
                           key={idx} 
                           className={`p-4 rounded-xl transition-all duration-300 flex items-center justify-between gap-4 border
                             ${isCurrent ? 'bg-[#1ed760]/10 border-[#1ed760]/30 scale-105 shadow-[0_0_15px_rgba(30,215,96,0.1)]' : ''}
                             ${isDone ? 'bg-[#181818] border-white/5 opacity-60' : ''}
                             ${!isCurrent && !isDone ? 'bg-transparent border-transparent opacity-40' : ''}
                           `}
                         >
                           <p className={`text-xl font-bold ${isCurrent ? 'text-white' : 'text-[#b3b3b3]'} leading-tight`}>
                             {line.text}
                           </p>
                           {line.time !== null && (
                             <div className="bg-black/50 px-3 py-1.5 rounded-md border border-white/10 shrink-0">
                               <span className="text-sm font-mono text-[#1ed760] font-bold">{formatTime(line.time)}</span>
                             </div>
                           )}
                           {isCurrent && (
                             <div className="w-3 h-3 rounded-full bg-[#1ed760] animate-pulse shrink-0" />
                           )}
                         </div>
                       );
                     })}
                     
                     {currentLineIndex >= lines.length && (
                       <div className="p-8 text-center bg-[#181818] border border-white/5 rounded-xl">
                         <CheckCircle className="w-12 h-12 text-[#1ed760] mx-auto mb-3" />
                         <h3 className="text-xl font-bold text-white">All lines synced!</h3>
                         <p className="text-[#b3b3b3] text-sm mt-1">You can now save the lyrics.</p>
                       </div>
                     )}
                   </div>
                </div>
                
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default NexoriaLyricsStudio;
