const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'components', 'NexoriaPlayer.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add Dual Audio Refs and State
const refLogic = `
  const audioRef1 = useRef(null);
  const audioRef2 = useRef(null);
  const [activeEngine, setActiveEngine] = useState(1);
  const activeEngineRef = useRef(1);

  // Proxy ref to avoid rewriting all audioRef.current calls
  const audioRef = useRef(null);

  useEffect(() => {
    activeEngineRef.current = activeEngine;
    audioRef.current = activeEngine === 1 ? audioRef1.current : audioRef2.current;
  }, [activeEngine]);
`;

// Replace 'const audioRef = useRef(null);'
content = content.replace('const audioRef = useRef(null);', refLogic);

// Remove the global expose from old place if it exists
content = content.replace(/window\.__nexoriaAudioRef = audioRef;/g, 'window.__nexoriaAudioRef = audioRef1; // Fallback');

// 2. Add Preload Logic
const preloadLogic = `
  // --- DUAL AUDIO PRELOAD LOGIC ---
  useEffect(() => {
    let nextTrackObj = null;
    if (queue.length > 0) {
      let nextIndex = 0;
      if (shuffleMode) nextIndex = Math.floor(Math.random() * queue.length); 
      nextTrackObj = queue[nextIndex];
    } else if (repeatMode === 'all' && history.length > 0) {
      let nextIdx = 0;
      if (shuffleMode) nextIdx = Math.floor(Math.random() * history.length);
      nextTrackObj = history[nextIdx];
    }

    if (nextTrackObj) {
      const baseUrl = BACKEND_URL.endsWith('/api') ? BACKEND_URL.slice(0, -4) : BACKEND_URL;
      let nextSrc = nextTrackObj.telegramFileId 
        ? \`\${baseUrl}/api/nexoria-music/stream/\${nextTrackObj.telegramFileId}\`
        : nextTrackObj.audioUrl || "";
        
      if (blobUrlsRef.current[nextTrackObj._id]) {
        nextSrc = blobUrlsRef.current[nextTrackObj._id];
      }

      const inactiveAudio = activeEngineRef.current === 1 ? audioRef2.current : audioRef1.current;
      if (inactiveAudio && nextSrc && inactiveAudio.dataset.lastSrc !== nextSrc) {
        inactiveAudio.src = nextSrc;
        inactiveAudio.dataset.lastSrc = nextSrc;
        inactiveAudio.load(); // Silently buffer!
      }
    }
  }, [queue, history, shuffleMode, repeatMode, currentTrack, activeEngine]);
  // --------------------------------
`;

// Insert preload logic before the timeUpdate effect
content = content.replace(
  /const maxTimeRef = useRef\(0\);/,
  preloadLogic + '\n  const maxTimeRef = useRef(0);'
);

// 3. Update handleSkipForward to swap engines
const swapLogic = `
      // --- DUAL AUDIO SWAP ---
      const nextEngine = activeEngineRef.current === 1 ? 2 : 1;
      const inactiveRef = nextEngine === 1 ? audioRef1 : audioRef2;
      setActiveEngine(nextEngine);
      audioRef.current = inactiveRef.current; // Force proxy update immediately
      // -----------------------
      
      if (audioRef.current) {
`;

// We have 2 instances of 'if (audioRef.current) {' in handleSkipForward
// Let's replace both with swapLogic
content = content.replace(
  /if \(audioRef\.current\) \{\s+const baseUrl = BACKEND_URL\.endsWith/g,
  swapLogic + '        const baseUrl = BACKEND_URL.endsWith'
);

// 4. Update JSX to render two tags
const dualAudioJsx = `
      {/* Hidden Audio Element 1 */}
      <audio
        id="nexoria-global-audio-1"
        ref={audioRef1}
        autoPlay={activeEngine === 1 ? isPlaying : false}
        playsInline
        crossOrigin="anonymous"
        preload="auto"
        onTimeUpdate={(e) => activeEngineRef.current === 1 && handleTimeUpdate(e)}
        onLoadedMetadata={(e) => activeEngineRef.current === 1 && handleTimeUpdate(e)}
        onCanPlay={() => {
          if (activeEngineRef.current === 1 && isPlaying && audioRef1.current && audioRef1.current.paused) {
            audioRef1.current.play().catch(e => console.log('Playback error 1:', e));
          }
        }}
      />
      
      {/* Hidden Audio Element 2 (For Preloading) */}
      <audio
        id="nexoria-global-audio-2"
        ref={audioRef2}
        autoPlay={activeEngine === 2 ? isPlaying : false}
        playsInline
        crossOrigin="anonymous"
        preload="auto"
        onTimeUpdate={(e) => activeEngineRef.current === 2 && handleTimeUpdate(e)}
        onLoadedMetadata={(e) => activeEngineRef.current === 2 && handleTimeUpdate(e)}
        onCanPlay={() => {
          if (activeEngineRef.current === 2 && isPlaying && audioRef2.current && audioRef2.current.paused) {
            audioRef2.current.play().catch(e => console.log('Playback error 2:', e));
          }
        }}
      />
`;

// regex to find the old audio element
content = content.replace(
  /<audio\s+id="nexoria-global-audio"[\s\S]*?onError=\{\(e\) => \{[\s\S]*?\}\}\s+\/>/m,
  dualAudioJsx
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('NexoriaPlayer.jsx successfully patched for Dual-Audio Engine!');
