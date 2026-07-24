import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGetTrackLyricsQuery } from '../../features/api/nexoriaMusicApiSlice';
import { useSelector, useDispatch } from 'react-redux';
import { ArrowLeft, Mic2, Play } from 'lucide-react';
import { togglePlayPause } from '../../features/music/nexoriaMusicSlice';

const NexoriaMusicLyrics = () => {
  const { trackId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentTrack, isPlaying } = useSelector((state) => state.nexoriaMusic);
  
  const { data, isLoading, isError } = useGetTrackLyricsQuery(trackId);
  const lyricsData = data?.data;
  let syncedLyrics = lyricsData?.syncedLyrics || [];

  // Inject DEMO lyrics if the track doesn't have any in the database
  if (syncedLyrics.length === 0 && currentTrack) {
    syncedLyrics = [
      { time: 0, text: "(Instrumental Intro) - DEMO LYRICS" },
      { time: 5, text: "Pal bhar thahar jaao" },
      { time: 10, text: "Dil ye sambhal jaaye" },
      { time: 15, text: "Kaise tumhe roka karun" },
      { time: 20, text: "Meri taraf aata har gham phisal jaaye" },
      { time: 27, text: "Aankhon mein tum ko bharun" },
      { time: 33, text: "Bin bole baatein tumse karun" },
      { time: 39, text: "Agar tum saath ho..." },
      { time: 44, text: "(Instrumental Break)" },
      { time: 50, text: "Behti rehti nahar, nadiya si teri duniya mein" },
      { time: 56, text: "Meri duniya hai teri chaahaton mein" },
      { time: 62, text: "Main dhal jaati hoon teri aadaton mein" },
      { time: 68, text: "Agar tum saath ho..." }
    ];
  }

  const [currentTime, setCurrentTime] = useState(0);
  const containerRef = useRef(null);
  const activeLineRef = useRef(null);

  // Poll for audio current time
  useEffect(() => {
    let animationFrameId;
    const updateTime = () => {
      const audioEl = document.getElementById('nexoria-global-audio');
      if (audioEl) {
        setCurrentTime(audioEl.currentTime);
      }
      animationFrameId = requestAnimationFrame(updateTime);
    };
    updateTime();
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  // Find active line index
  let activeIndex = -1;
  for (let i = 0; i < syncedLyrics.length; i++) {
    if (currentTime >= syncedLyrics[i].time) {
      activeIndex = i;
    } else {
      break;
    }
  }

  // Auto-scroll to active line
  useEffect(() => {
    if (activeLineRef.current && containerRef.current) {
      const container = containerRef.current;
      const activeEl = activeLineRef.current;
      
      const scrollPosition = activeEl.offsetTop - (container.clientHeight / 2) + (activeEl.clientHeight / 2);
      
      container.scrollTo({
        top: Math.max(0, scrollPosition),
        behavior: 'smooth'
      });
    }
  }, [activeIndex]);

  const handleLineClick = (time) => {
    const audioEl = document.getElementById('nexoria-global-audio');
    if (audioEl) {
      audioEl.currentTime = time;
      if (!isPlaying) {
        audioEl.play().catch(console.error);
        dispatch(togglePlayPause());
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center h-full min-h-[600px]">
        <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (isError || !lyricsData || syncedLyrics.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center h-full min-h-[600px] text-center px-4">
        <Mic2 className="w-20 h-20 text-[#94A3B8] mb-6 opacity-50" />
        <h2 className="text-3xl font-bold mb-2">No Lyrics Found</h2>
        <p className="text-[#94A3B8] max-w-md">We don't have synchronized lyrics for this track yet. Enjoy the music!</p>
        <button 
          onClick={() => navigate(-1)}
          className="mt-8 px-8 py-3 bg-white text-black font-bold rounded-full hover:scale-105 transition-transform"
        >
          Go Back
        </button>
      </div>
    );
  }

  // Get background color from track genre or cover (we'll just use a vibrant gradient for now)
  const bgColor = currentTrack?.genre?.hexColor || '#8b5cf6'; // Violet as fallback

  return (
    <div 
      className="flex-1 flex flex-col h-full min-h-[calc(100vh-120px)] relative overflow-hidden transition-colors duration-1000"
      style={{
        background: `radial-gradient(circle at 50% 0%, ${bgColor}90 0%, #0F0F23 70%)`
      }}
    >
      {/* Animated glow orb behind lyrics */}
      <div 
        className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full opacity-30 mix-blend-screen pointer-events-none blur-[120px]"
        style={{ backgroundColor: bgColor }}
      />

      {/* Header */}
      <div className="px-6 py-4 flex items-center sticky top-0 z-20">
        <button 
          onClick={() => navigate(-1)} 
          className="w-10 h-10 rounded-full bg-black/20 flex items-center justify-center hover:bg-black/40 transition-colors text-white backdrop-blur-xl border border-white/10"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
      </div>

      {/* Lyrics Container */}
      <div 
        ref={containerRef}
        className="flex-1 overflow-y-auto px-6 md:px-24 pb-48 pt-20 scrollbar-hide relative z-10"
        style={{ scrollBehavior: 'smooth' }}
      >
        <div className="max-w-5xl mx-auto flex flex-col gap-10 pb-[40vh]">
          {syncedLyrics.map((line, index) => {
            const isActive = index === activeIndex;
            const isPast = index < activeIndex;
            
            return (
              <div 
                key={index}
                ref={isActive ? activeLineRef : null}
                onClick={() => handleLineClick(line.time)}
                className={`group cursor-pointer transition-all duration-500 transform origin-left flex items-start gap-4 ${
                  isActive 
                    ? 'text-white text-5xl md:text-7xl font-black scale-100 opacity-100 drop-shadow-[0_0_30px_rgba(255,255,255,0.4)] tracking-tight' 
                    : isPast
                      ? 'text-white/40 text-4xl md:text-5xl font-bold scale-95 opacity-50 hover:text-white/80 hover:opacity-100'
                      : 'text-white/20 text-4xl md:text-5xl font-bold scale-95 hover:text-white/60 transition-colors'
                }`}
              >
                <div className={`mt-3 md:mt-5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ${isActive ? 'text-green-500 drop-shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'text-white/60'}`}>
                  <Play className="w-8 h-8 fill-current" />
                </div>
                <span>{line.text}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default NexoriaMusicLyrics;
