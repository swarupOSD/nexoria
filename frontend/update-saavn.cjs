const fs = require('fs');

function updateSearch() {
  let content = fs.readFileSync('src/pages/NexoriaMusic/NexoriaMusicSearch.jsx', 'utf8');

  // Replace imports
  content = content.replace(
    /import \{ useSearchNexoriaMusicQuery \} from '\.\.\/\.\.\/features\/api\/nexoriaMusicApiSlice';/,
    "import { useSearchSaavnPublicQuery, useLazyGetSaavnSongDetailsQuery } from '../../features/api/musicApiSlice';"
  );

  // Replace query hook
  content = content.replace(
    /const \{ data: searchRes, isLoading, isFetching \} = useSearchNexoriaMusicQuery\(debouncedTerm\);/,
    `const { data: searchRes, isLoading, isFetching } = useSearchSaavnPublicQuery(debouncedTerm, { skip: !debouncedTerm });
  const [getSongDetails] = useLazyGetSaavnSongDetailsQuery();`
  );

  // Replace results logic
  content = content.replace(
    /const results = searchRes\?\.data \|\| \{ tracks: \[\], albums: \[\], artists: \[\] \};\n  const hasResults = results\.tracks\.length > 0 \|\| results\.albums\.length > 0 \|\| results\.artists\.length > 0;/,
    `const results = searchRes?.data || [];
  const hasResults = results.length > 0;
  
  // Map JioSaavn results to NexoriaTrack format
  const mappedTracks = results.map(song => ({
    _id: song.saavnId,
    saavnId: song.saavnId,
    title: song.title,
    artist: { name: song.artist },
    coverImage: song.image,
    duration: 0 // Will be updated on play
  }));`
  );

  // Replace handlePlay logic
  content = content.replace(
    /const handlePlay = \(track, trackList\) => \{[\s\S]*?dispatch\(playTrack\(track\)\);\n    \}\n  \};/,
    `const handlePlay = async (track, trackList) => {
    if (currentTrack?._id === track._id) {
      dispatch(togglePlayPause());
    } else {
      // Synchronously unlock audio for iOS Safari background playback
      if (window.__nexoriaAudioRef?.current) {
        window.__nexoriaAudioRef.current.play().catch(() => {});
      }
      
      try {
        toast.loading('Fetching high-quality stream...', { id: 'saavn-fetch' });
        // Fetch 320kbps decrypted stream URL
        const res = await getSongDetails(track.saavnId).unwrap();
        toast.dismiss('saavn-fetch');
        
        const fullTrack = {
          _id: res.data.saavnId,
          saavnId: res.data.saavnId,
          title: res.data.title,
          artist: { name: res.data.artist },
          coverImage: res.data.image,
          audioUrl: res.data.audioUrl,
          duration: res.data.duration
        };
        
        // Update the queue list to have full metadata if needed, but for now just pass the mapped list
        dispatch(setQueue(trackList || []));
        dispatch(playTrack(fullTrack));
      } catch (err) {
        toast.dismiss('saavn-fetch');
        toast.error('Failed to load stream');
      }
    }
  };`
  );

  // Replace the UI mapping map function
  content = content.replace(
    /\{results\.tracks\.slice\(0, 5\)\.map\(\(track, index\) => \(/g,
    '{mappedTracks.map((track, index) => ('
  );

  // Replace trackPlay onClick to pass mappedTracks
  content = content.replace(
    /onClick=\{\(\) => handlePlay\(track, results\.tracks\)\}/g,
    'onClick={() => handlePlay(track, mappedTracks)}'
  );

  // Remove Artists section
  content = content.replace(
    /\{results\.artists\.length > 0 && \([\s\S]*?<\/div>\n              \)\}\n            <\/div>\n          <\/section>\n        \)\}/,
    ''
  );

  // Remove Albums section
  content = content.replace(
    /\{results\.albums\.length > 0 && \([\s\S]*?<\/div>\n              \)\}\n            <\/div>\n          <\/section>\n        \)\}/,
    ''
  );

  // Remove Tracks section Title
  content = content.replace(
    /<h2 className="text-2xl font-bold mb-4">Top Songs<\/h2>/,
    '<h2 className="text-2xl font-bold mb-4">Top Results (JioSaavn)</h2>'
  );

  fs.writeFileSync('src/pages/NexoriaMusic/NexoriaMusicSearch.jsx', content);
}

updateSearch();
