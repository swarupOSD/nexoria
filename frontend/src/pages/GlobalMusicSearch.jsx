import React, { useState, useEffect } from 'react';
import { Search, Music, Loader2, PlayCircle, Heart } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import { useSearchSaavnPublicQuery, useLazyGetSaavnSongDetailsQuery, useSearchYouTubePublicQuery } from '../features/api/musicApiSlice';
import { playSong } from '../features/music/musicSlice';
import SEO from '../components/SEO';

const GlobalMusicSearch = () => {
  const dispatch = useDispatch();
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [playingId, setPlayingId] = useState(null);
  const [searchSource, setSearchSource] = useState('saavn'); // 'saavn' or 'youtube'

  const { currentSong, isPlaying } = useSelector(state => state.music);
  const [getSongDetails] = useLazyGetSaavnSongDetailsQuery();

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm.trim().length >= 3) {
        setDebouncedSearch(searchTerm);
      } else {
        setDebouncedSearch('');
      }
    }, 600);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const { data: searchResults, isFetching: isFetchingSaavn } = useSearchSaavnPublicQuery(debouncedSearch, {
    skip: !debouncedSearch || searchSource !== 'saavn'
  });

  const { data: ytResults, isFetching: isFetchingYt } = useSearchYouTubePublicQuery(debouncedSearch, {
    skip: !debouncedSearch || searchSource !== 'youtube'
  });
  
  const isFetching = isFetchingSaavn || isFetchingYt;

  const handlePlaySong = async (songMetadata) => {
    if (searchSource === 'youtube') {
      const playableSong = {
        _id: songMetadata.youtubeId,
        title: songMetadata.title,
        artist: songMetadata.artist,
        image: songMetadata.image,
        audioUrl: songMetadata.audioUrl,
        isYoutube: true,
        duration: songMetadata.duration
      };
      dispatch(playSong(playableSong));
      return;
    }

    try {
      setPlayingId(songMetadata.saavnId);
      
      // Fetch full details (includes decrypted audio URL)
      const res = await getSongDetails(songMetadata.saavnId).unwrap();
      const details = res.data;

      // Construct a song object that GlobalMusicPlayer expects
      const playableSong = {
        _id: details.saavnId, // Use saavnId as temporary _id
        title: details.title,
        artist: details.artist,
        image: details.image,
        audioUrl: details.audioUrl,
        isYoutube: false,
        duration: details.duration
      };

      dispatch(playSong(playableSong));
    } catch (error) {
      toast.error('Failed to load song stream');
    } finally {
      setPlayingId(null);
    }
  };

  const songs = searchSource === 'saavn' ? (searchResults?.data || []) : (ytResults?.data || []);

  return (
    <div className="min-h-screen bg-[#050505] text-white pt-24 pb-32">
      <SEO 
        title="Global Search - Nexoria Sound" 
        description="Search and play millions of songs instantly" 
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-10 animate-fade-in">
        {/* Header */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 font-medium text-sm mb-2">
            <Music className="w-4 h-4" />
            Nexoria Sound Network
          </div>
          <h1 className="text-4xl sm:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-rose-500 leading-tight">
            Search The World
          </h1>
          <p className="text-slate-400 text-lg">
            Find and play any song, artist, or album instantly. Completely free, forever.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative group max-w-3xl mx-auto">
          <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
            <Search className="h-6 w-6 text-slate-400 group-focus-within:text-purple-400 transition-colors" />
          </div>
          <input
            type="text"
            placeholder="What do you want to listen to?"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-16 pr-6 py-5 bg-slate-900/80 border border-slate-700/50 rounded-full focus:outline-none focus:border-purple-500/50 focus:ring-4 focus:ring-purple-500/20 text-white placeholder-slate-500 transition-all text-xl shadow-2xl backdrop-blur-xl"
          />
          {isFetching && (
            <div className="absolute inset-y-0 right-0 pr-6 flex items-center pointer-events-none">
              <Loader2 className="h-6 w-6 text-purple-400 animate-spin" />
            </div>
          )}

          <div className="flex justify-center mt-8 relative z-10">
            <div className="relative inline-flex items-center p-1.5 bg-slate-900/80 border border-white/10 rounded-full backdrop-blur-xl shadow-2xl overflow-hidden">
              <div 
                className={`absolute inset-y-1.5 rounded-full transition-all duration-400 ease-spring ${
                  searchSource === 'saavn' 
                    ? 'left-1.5 w-[120px] bg-gradient-to-r from-purple-500 to-pink-500 shadow-[0_0_20px_rgba(168,85,247,0.4)]' 
                    : 'left-[125px] w-[150px] bg-gradient-to-r from-red-500 to-rose-500 shadow-[0_0_20px_rgba(239,68,68,0.4)]'
                }`}
              ></div>
              
              <button
                onClick={() => setSearchSource('saavn')}
                className={`relative z-10 w-[120px] py-2.5 rounded-full font-bold text-sm tracking-wide transition-colors duration-300 flex items-center justify-center gap-2 ${
                  searchSource === 'saavn' ? 'text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Music className="w-4 h-4" />
                JioSaavn
              </button>
              <button
                onClick={() => setSearchSource('youtube')}
                className={`relative z-10 w-[150px] py-2.5 rounded-full font-bold text-sm tracking-wide transition-colors duration-300 flex items-center justify-center gap-2 ${
                  searchSource === 'youtube' ? 'text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <PlayCircle className="w-4 h-4" />
                YouTube
              </button>
            </div>
          </div>
        </div>

        {/* Empty State */}
        {!debouncedSearch && (
          <div className="flex flex-col items-center justify-center py-20 text-slate-500 space-y-6">
            <div className="relative">
              <div className="absolute inset-0 bg-purple-500/20 blur-3xl rounded-full" />
              <Search className="w-24 h-24 opacity-20 relative z-10" />
            </div>
            <p className="text-xl font-medium">Type to start searching...</p>
          </div>
        )}

        {/* No Results */}
        {debouncedSearch && !isFetching && songs.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-slate-500 space-y-4">
            <Search className="w-16 h-16 opacity-20" />
            <p className="text-xl">No songs found for "{debouncedSearch}"</p>
          </div>
        )}

        {/* Results Grid */}
        {songs.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white px-2">Top Results</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {songs.map((song) => {
                const songId = song.saavnId || song.youtubeId;
                const isThisPlaying = currentSong?._id === songId && isPlaying;
                const isLoading = playingId === songId;

                return (
                  <div 
                    key={songId} 
                    className="group bg-slate-900/40 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 flex gap-4 items-center transition-all cursor-pointer backdrop-blur-sm"
                    onClick={() => !isLoading && handlePlaySong(song)}
                  >
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0 shadow-lg bg-slate-800">
                      <img 
                        src={song.image} 
                        alt={song.title} 
                        className={`w-full h-full object-cover transition-transform duration-500 ${isThisPlaying ? 'scale-110' : 'group-hover:scale-110'}`}
                      />
                      <div className={`absolute inset-0 flex items-center justify-center bg-black/40 transition-opacity ${isThisPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                        {isLoading ? (
                          <Loader2 className="w-8 h-8 text-white animate-spin" />
                        ) : isThisPlaying ? (
                          <div className="w-8 h-8 flex items-center justify-center gap-1">
                            <div className="w-1.5 h-4 bg-purple-500 animate-pulse rounded-full"></div>
                            <div className="w-1.5 h-6 bg-purple-500 animate-pulse delay-75 rounded-full"></div>
                            <div className="w-1.5 h-4 bg-purple-500 animate-pulse delay-150 rounded-full"></div>
                          </div>
                        ) : (
                          <PlayCircle className="w-8 h-8 text-white shadow-lg" />
                        )}
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className={`font-bold text-sm truncate transition-colors ${isThisPlaying ? 'text-purple-400' : 'text-white group-hover:text-purple-400'}`} title={song.title}>
                        {song.title}
                      </h3>
                      <p className="text-xs text-slate-400 truncate mt-1" title={song.artist}>
                        {song.artist}
                      </p>
                    </div>

                    <button className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-slate-700/50 rounded-full text-slate-400 hover:text-pink-500">
                      <Heart className="w-5 h-5" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GlobalMusicSearch;
