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
  const syncedLyrics = lyricsData?.syncedLyrics || [];

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
        <Mic2 className="w-20 h-20 text-[#a7a7a7] mb-6 opacity-50" />
        <h2 className="text-3xl font-bold mb-2">No Lyrics Found</h2>
        <p className="text-[#a7a7a7] max-w-md">We don't have synchronized lyrics for this track yet. Enjoy the music!</p>
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
  const bgColor = currentTrack?.genre?.hexColor || '#450af5';

  return (
    <div 
      className="flex-1 flex flex-col h-full min-h-[calc(100vh-120px)] relative overflow-hidden transition-colors duration-1000"
      style={{
        background: `linear-gradient(to bottom, ${bgColor}80, #121212 80%)`
      }}
    >
      {/* Header */}
      <div className="px-6 py-4 flex items-center sticky top-0 z-20">
        <button 
          onClick={() => navigate(-1)} 
          className="w-10 h-10 rounded-full bg-black/40 flex items-center justify-center hover:bg-black/60 transition-colors text-white backdrop-blur-md"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
      </div>

      {/* Lyrics Container */}
      <div 
        ref={containerRef}
        className="flex-1 overflow-y-auto px-6 md:px-24 pb-48 pt-10 scrollbar-hide"
        style={{ scrollBehavior: 'smooth' }}
      >
        <div className="max-w-4xl mx-auto flex flex-col gap-8 pb-[40vh]">
          {syncedLyrics.map((line, index) => {
            const isActive = index === activeIndex;
            const isPast = index < activeIndex;
            
            return (
              <div 
                key={index}
                ref={isActive ? activeLineRef : null}
                onClick={() => handleLineClick(line.time)}
                className={`group cursor-pointer transition-all duration-300 transform origin-left flex items-start gap-4 ${
                  isActive 
                    ? 'text-white text-4xl md:text-5xl font-black scale-100 opacity-100 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]' 
                    : isPast
                      ? 'text-white/60 text-3xl md:text-4xl font-bold scale-95 opacity-50 hover:opacity-80'
                      : 'text-black/40 text-3xl md:text-4xl font-bold scale-95 hover:text-white/60 transition-colors'
                }`}
              >
                <div className={`mt-2 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ${isActive ? 'text-green-500' : 'text-white'}`}>
                  <Play className="w-6 h-6 fill-current" />
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
