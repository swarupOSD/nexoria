const fs = require('fs');

let content = fs.readFileSync('src/components/NexoriaPlayer.jsx', 'utf8');

// Add saavnUrlsRef
content = content.replace(
  /const blobUrlsRef = useRef\(\{\}\);/,
  `const blobUrlsRef = useRef({});
  const saavnUrlsRef = useRef({});`
);

// Add Saavn Pre-resolver inside the resolveBlobs effect
content = content.replace(
  /resolveBlobs\(\);\n  \}, \[currentTrack\?\._id, queue, downloadedTracks\]\);/,
  `resolveBlobs();
    
    // PRE-RESOLVE JIOSAAVN URLS
    const resolveSaavnUrls = async () => {
      const tracksToResolve = [];
      if (queue.length > 0) tracksToResolve.push(...queue.slice(0, 3));
      if (history.length > 0) tracksToResolve.push(history[history.length - 1]);
      
      for (const track of tracksToResolve) {
        if (track.saavnId && !track.audioUrl && !saavnUrlsRef.current[track._id]) {
          try {
            const baseUrl = BACKEND_URL.endsWith('/api') ? BACKEND_URL.slice(0, -4) : BACKEND_URL;
            const res = await fetch(\`\${baseUrl}/api/music/saavn/song/\${track.saavnId}\`);
            const data = await res.json();
            if (data.success && data.data.audioUrl) {
              saavnUrlsRef.current[track._id] = data.data.audioUrl;
            }
          } catch(e) {
            console.log('Failed to pre-resolve Saavn URL', e);
          }
        }
      }
    };
    resolveSaavnUrls();
  }, [currentTrack?._id, queue, history, downloadedTracks]);`
);

// Update networkSrc derivation in useEffect
content = content.replace(
  /const networkSrc = currentTrack\?\.telegramFileId \n      \? `\$\{baseUrl\}\/api\/nexoria-music\/stream\/\$\{currentTrack\.telegramFileId\}`\n      : currentTrack\?\.audioUrl \|\| "";/,
  `let networkSrc = currentTrack?.telegramFileId 
      ? \`\${baseUrl}/api/nexoria-music/stream/\${currentTrack.telegramFileId}\`
      : currentTrack?.audioUrl || "";
      
    if (currentTrack?.saavnId && saavnUrlsRef.current[currentTrack._id]) {
      networkSrc = saavnUrlsRef.current[currentTrack._id];
    }`
);

// We should safely replace networkSrc with regex
content = content.replace(/const networkSrc = currentTrack\?\.telegramFileId[\s\S]*?: currentTrack\?\.audioUrl \|\| "";/, 
  `let networkSrc = currentTrack?.telegramFileId 
      ? \`\${baseUrl}/api/nexoria-music/stream/\${currentTrack.telegramFileId}\`
      : currentTrack?.audioUrl || "";
      
    if (currentTrack?.saavnId && saavnUrlsRef.current[currentTrack._id]) {
      networkSrc = saavnUrlsRef.current[currentTrack._id];
    }`
);

// Update handleSkipForward to check saavnUrlsRef
content = content.replace(
  /if \(blobUrlsRef\.current\[nextTrack\._id\]\) \{\n          nextSrc = blobUrlsRef\.current\[nextTrack\._id\];\n        \}/g,
  `if (blobUrlsRef.current[nextTrack._id]) {
          nextSrc = blobUrlsRef.current[nextTrack._id];
        } else if (nextTrack.saavnId && saavnUrlsRef.current[nextTrack._id]) {
          nextSrc = saavnUrlsRef.current[nextTrack._id];
        }`
);

fs.writeFileSync('src/components/NexoriaPlayer.jsx', content);
