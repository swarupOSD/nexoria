import React, { useEffect, useRef, useState } from 'react';
import { X, Mic2 } from 'lucide-react';
import { useSelector } from 'react-redux';

// Parses LRC string into array of objects { time: number (seconds), text: string }
const parseLrc = (lrcString) => {
  if (!lrcString) return [];
  const lines = lrcString.split('\n');
  const parsed = [];
  const timeRegex = /\[(\d{2}):(\d{2}\.\d{2,3})\]/;

  lines.forEach(line => {
    const match = timeRegex.exec(line);
    if (match) {
      const minutes = parseInt(match[1], 10);
      const seconds = parseFloat(match[2]);
      const text = line.replace(timeRegex, '').trim();
      parsed.push({
        time: minutes * 60 + seconds,
        text: text || '♪' // Fallback for instrumental breaks
      });
    }
  });

  return parsed.sort((a, b) => a.time - b.time);
};

const LyricsModal = ({ isOpen, onClose, playedSeconds }) => {
  const { currentSong } = useSelector(state => state.music);
  const [lyrics, setLyrics] = useState([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const lyricsContainerRef = useRef(null);
  const activeLineRef = useRef(null);

  useEffect(() => {
    if (currentSong?.lyrics) {
      if (currentSong.lyricsType === 'LRC') {
        setLyrics(parseLrc(currentSong.lyrics));
      } else {
        // Plain text: split by lines
        setLyrics(currentSong.lyrics.split('\n').map((text, i) => ({ time: -1, text })));
      }
    } else {
      setLyrics([]);
    }
  }, [currentSong]);

  useEffect(() => {
    if (currentSong?.lyricsType === 'LRC' && lyrics.length > 0) {
      // Find the active lyric line based on playedSeconds
      // Find the LAST lyric line whose time is <= playedSeconds
      let newActiveIndex = -1;
      for (let i = 0; i < lyrics.length; i++) {
        if (playedSeconds >= lyrics[i].time - 0.3) { // 0.3s offset for better sync feel
          newActiveIndex = i;
        } else {
          break; // Since it's sorted, we can break early
        }
      }
      
      if (newActiveIndex !== activeIndex) {
        setActiveIndex(newActiveIndex);
      }
    }
  }, [playedSeconds, lyrics, currentSong, activeIndex]);

  useEffect(() => {
    // Auto-scroll to active line
    if (activeIndex !== -1 && activeLineRef.current && lyricsContainerRef.current) {
      activeLineRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  }, [activeIndex]);

  if (!isOpen) return null;

  const isLrc = currentSong?.lyricsType === 'LRC';

  return (
    <div className="fixed inset-0 z-[110] bg-black/90 backdrop-blur-3xl flex flex-col items-center justify-center animate-fade-in">
      {/* Background blur from album cover */}
      {currentSong && (
        <div 
          className="absolute inset-0 opacity-20 bg-cover bg-center blur-[100px] pointer-events-none scale-110"
          style={{ backgroundImage: `url(${currentSong.image})` }}
        />
      )}

      {/* Header */}
      <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-start z-10 bg-gradient-to-b from-black/50 to-transparent">
        <div className="flex items-center gap-4">
          <img 
            src={currentSong?.image} 
            alt="Album Art" 
            className="w-16 h-16 rounded-lg shadow-2xl"
          />
          <div>
            <h2 className="text-2xl font-black text-white truncate max-w-xs sm:max-w-md">{currentSong?.title}</h2>
            <p className="text-slate-400 font-medium">{currentSong?.artist}</p>
          </div>
        </div>
        <button 
          onClick={onClose}
          className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors backdrop-blur-md"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Lyrics Container */}
      <div 
        ref={lyricsContainerRef}
        className="w-full max-w-3xl h-[60vh] mt-20 overflow-y-auto no-scrollbar px-6 pb-40 flex flex-col z-10"
        style={{ scrollBehavior: 'smooth' }}
      >
        {lyrics.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-500">
            <Mic2 className="w-16 h-16 mb-4 opacity-50" />
            <p className="text-xl font-medium text-center">Lyrics not available for this track.</p>
          </div>
        ) : (
          <div className="space-y-6 pt-[20vh]">
            {lyrics.map((line, index) => {
              const isActive = index === activeIndex;
              const isPast = index < activeIndex;

              return (
                <p
                  key={index}
                  ref={isActive ? activeLineRef : null}
                  className={`text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight transition-all duration-500 ease-out cursor-default text-center
                    ${!isLrc 
                      ? 'text-white/80 hover:text-white' // Plain text styling
                      : isActive 
                        ? 'text-white scale-105 drop-shadow-2xl' 
                        : isPast 
                          ? 'text-white/40 blur-[1px]' 
                          : 'text-white/20'
                    }
                  `}
                >
                  {line.text}
                </p>
              );
            })}
          </div>
        )}
      </div>

      {/* Bottom fade out */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-black to-transparent pointer-events-none z-10" />
    </div>
  );
};

export default LyricsModal;
