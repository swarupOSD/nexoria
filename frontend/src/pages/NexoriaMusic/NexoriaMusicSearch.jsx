import React, { useState, useEffect } from 'react';
import { Search as SearchIcon, Play, Pause, Heart, X } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { BACKEND_URL } from '../../features/api/apiSlice';
import { useSearchNexoriaMusicQuery } from '../../features/api/nexoriaMusicApiSlice';
import { playTrack, togglePlayPause, setQueue, toggleLikeTrack } from '../../features/music/nexoriaMusicSlice';
import toast from 'react-hot-toast';

const BROWSE_CATEGORIES = [
  { id: 1, name: "Podcasts", color: "bg-gradient-to-br from-orange-400 to-orange-600", img: "https://images.unsplash.com/photo-1593697972674-84594c798083?q=80&w=100&auto=format&fit=crop" },
  { id: 2, name: "Made For You", color: "bg-gradient-to-br from-indigo-500 to-purple-700", img: "https://images.unsplash.com/photo-1493225457124-a1a2a5370217?q=80&w=100&auto=format&fit=crop" },
  { id: 3, name: "New Releases", color: "bg-gradient-to-br from-pink-500 to-rose-600", img: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=100&auto=format&fit=crop" },
  { id: 4, name: "Pop", color: "bg-gradient-to-br from-emerald-400 to-emerald-600", img: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=100&auto=format&fit=crop" },
  { id: 5, name: "Hip-Hop", color: "bg-gradient-to-br from-amber-400 to-amber-600", img: "https://images.unsplash.com/photo-1602934445884-da0fa1c9d3b3?q=80&w=100&auto=format&fit=crop" },
  { id: 6, name: "Rock", color: "bg-gradient-to-br from-red-500 to-red-700", img: "https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?q=80&w=100&auto=format&fit=crop" },
  { id: 7, name: "Chill", color: "bg-gradient-to-br from-teal-400 to-teal-600", img: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=100&auto=format&fit=crop" },
  { id: 8, name: "Workout", color: "bg-gradient-to-br from-blue-500 to-blue-700", img: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=100&auto=format&fit=crop" },
  { id: 9, name: "Focus", color: "bg-gradient-to-br from-fuchsia-600 to-fuchsia-800", img: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?q=80&w=100&auto=format&fit=crop" },
  { id: 10, name: "Sleep", color: "bg-gradient-to-br from-sky-700 to-sky-900", img: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?q=80&w=100&auto=format&fit=crop" },
  { id: 11, name: "Party", color: "bg-gradient-to-br from-rose-400 to-rose-600", img: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=100&auto=format&fit=crop" },
  { id: 12, name: "Jazz", color: "bg-gradient-to-br from-cyan-600 to-cyan-800", img: "https://images.unsplash.com/photo-1511192336575-5a79af67a629?q=80&w=100&auto=format&fit=crop" },
];

const NexoriaMusicSearch = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialQuery = queryParams.get('q') || '';
  
  const { currentTrack, isPlaying, likedTracks } = useSelector(state => state.nexoriaMusic);
  const [searchTerm, setSearchTerm] = useState(initialQuery);
  const [debouncedTerm, setDebouncedTerm] = useState(initialQuery);
  const initialTab = queryParams.get('tab') || 'all';
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    const tab = queryParams.get('tab');
    if (tab) setActiveTab(tab);
  }, [location.search]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedTerm(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const { data: searchRes, isLoading, isFetching } = useSearchNexoriaMusicQuery(debouncedTerm);
  const results = searchRes?.data || { tracks: [], albums: [], artists: [] };
  const hasResults = results.tracks.length > 0 || results.albums.length > 0 || results.artists.length > 0;

  const handlePlay = (track, trackList) => {
    if (currentTrack?._id === track._id) {
      dispatch(togglePlayPause());
    } else {
      // NexoriaPlayer will automatically detect currentTrack change and play it.
      dispatch(setQueue(trackList));
      dispatch(playTrack(track));
    }
  };

  return (
    <div className="min-h-full bg-[#0F0F23] text-white">
      <div className="px-4 sm:px-6 pt-20 pb-8 max-w-[1920px] mx-auto">
        
        {/* Search Bar */}
        <div className="relative max-w-lg mb-8">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-zinc-400">
            <SearchIcon className="w-6 h-6" />
          </div>
          <input 
            type="text" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="What do you want to listen to?" 
            className="w-full bg-[#242424] hover:bg-[#1E1B4B] focus:bg-[#1E1B4B] text-white placeholder-zinc-400 rounded-full py-3.5 pl-12 pr-12 outline-none border-2 border-transparent focus:border-white transition-all shadow-md font-medium"
            autoFocus
          />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm('')}
              className="absolute inset-y-0 right-4 flex items-center text-zinc-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Loading */}
        {(isLoading || isFetching) && (
          <div className="flex justify-center my-20">
            <div className="w-10 h-10 border-4 border-zinc-500 border-t-white rounded-full animate-spin"></div>
          </div>
        )}

        {/* Empty State / Browse All */}
        {!debouncedTerm && !isLoading && !isFetching && (
          <section>
            <h2 className="text-2xl font-bold mb-6">Browse all</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
              {BROWSE_CATEGORIES.map((cat) => (
                <div 
                  key={cat.id} 
                  className={`${cat.color} rounded-xl p-4 h-40 overflow-hidden relative cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-transform`}
                >
                  <h3 className="font-bold text-lg text-white leading-tight break-words max-w-[75%]">{cat.name}</h3>
                  <img 
                    src={cat.img} 
                    alt={cat.name} 
                    className="w-24 h-24 object-cover absolute -bottom-4 -right-4 rotate-[25deg] rounded shadow-2xl"
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* No Results */}
        {debouncedTerm && !isLoading && !isFetching && !hasResults && (
          <div className="text-center py-32 text-zinc-400">
            <h2 className="text-2xl font-bold text-white mb-4">No results found for "{debouncedTerm}"</h2>
            <p className="font-medium">Please make sure your words are spelled correctly or use less or different keywords.</p>
          </div>
        )}

        {/* Search Results */}
        {debouncedTerm && !isLoading && !isFetching && hasResults && (
          <div className="space-y-10">
            
            {/* Tabs */}
            <div className="flex items-center gap-3 overflow-x-auto pb-2 custom-scrollbar">
              {['all', 'songs', 'artists', 'albums'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-1.5 rounded-full text-sm font-semibold capitalize whitespace-nowrap transition-colors ${activeTab === tab ? 'bg-white text-black' : 'bg-[#242424] text-white hover:bg-[#333]'}`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Top Result & Songs */}
            {(activeTab === 'all' || activeTab === 'songs') && (
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                
                {/* Left: Top Result (Top artist or first track) */}
                {activeTab === 'all' && results.artists.length > 0 && (
                  <div className="lg:col-span-2">
                    <h2 className="text-2xl font-bold mb-4">Top result</h2>
                    <div className="bg-[#1E1B4B] hover:bg-[#1E1B4B] transition-colors p-5 rounded-xl cursor-pointer group relative">
                      <div className="w-[100px] h-[100px] rounded-full overflow-hidden mb-5 shadow-lg">
                        {results.artists[0].image ? (
                          <img src={results.artists[0].image} alt={results.artists[0].name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-[#4338CA] flex items-center justify-center text-4xl font-bold text-zinc-500">
                            {results.artists[0].name[0]}
                          </div>
                        )}
                      </div>
                      <h3 className="text-[32px] font-bold text-white mb-2 truncate leading-none pb-1">{results.artists[0].name}</h3>
                      <div className="flex items-center gap-4">
                        <span className="text-sm font-bold bg-[#0F0F23] px-3 py-1 rounded-full uppercase tracking-widest text-zinc-300">Artist</span>
                      </div>
                      
                      {/* Big Play Button (would play artist top tracks, mocking here) */}
                      <button 
                        className="absolute bottom-5 right-5 bg-green-500 text-black p-3.5 rounded-full opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all shadow-xl hover:scale-105 active:scale-95"
                        onClick={(e) => {
                          e.stopPropagation();
                          const artistTracks = results.tracks.filter(t => t.artist?._id === results.artists[0]._id || t.artist?.name === results.artists[0].name);
                          if (artistTracks.length > 0) {
                            handlePlay(artistTracks[0], artistTracks);
                          } else {
                            toast.error("No songs found for this artist!");
                          }
                        }}
                      >
                        <Play className="w-6 h-6 fill-current ml-1" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Right: Songs list */}
                {results.tracks.length > 0 && (
                  <div className={(activeTab === 'all' && results.artists.length > 0) ? "lg:col-span-3" : "lg:col-span-5"}>
                    <h2 className="text-2xl font-bold mb-4">Songs</h2>
                    <div className="flex flex-col">
                      {results.tracks.slice(0, activeTab === 'all' ? 4 : 20).map((track, idx) => (
                        <div 
                          key={track._id} 
                          className="flex items-center gap-4 p-2 rounded-md hover:bg-white/10 group transition-colors cursor-pointer"
                          onClick={() => handlePlay(track, results.tracks)}
                        >
                          <div className="relative w-10 h-10 bg-[#4338CA] shrink-0">
                            {track.coverImage || track.album?.coverImage || track.artist?.image ? (
                              <img src={track.coverImage || track.album?.coverImage || track.artist?.image} alt={track.title} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full bg-[#4338CA]" />
                            )}
                            <div className="absolute inset-0 bg-[#0F0F23]/50 hidden group-hover:flex items-center justify-center">
                              {currentTrack?._id === track._id && isPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white" />}
                            </div>
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <h4 className={`text-base truncate font-medium ${currentTrack?._id === track._id ? 'text-green-500' : 'text-white'}`}>{track.title}</h4>
                            <p className="text-sm text-zinc-400 truncate">{track.artist?.name || 'Unknown Artist'}</p>
                          </div>

                          <button 
                            className="p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => {
                              e.stopPropagation();
                              dispatch(toggleLikeTrack(track._id));
                            }}
                          >
                            <Heart className={`w-5 h-5 ${likedTracks?.includes(track._id) ? 'fill-green-500 text-green-500' : 'text-zinc-400 hover:text-white'}`} />
                          </button>
                          
                          <span className="text-sm text-zinc-400 w-10 text-right pr-2">3:24</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Albums */}
            {(activeTab === 'all' || activeTab === 'albums') && results.albums.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold mb-6">Albums</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                  {results.albums.map(album => (
                    <div key={album._id} className="bg-[#1E1B4B] hover:bg-[#1E1B4B] p-4 rounded-md cursor-pointer group transition-colors">
                      <div className="w-full aspect-square bg-[#4338CA] rounded-md mb-4 shadow-lg overflow-hidden relative">
                        {album.coverImage && <img src={album.coverImage} alt={album.title} className="w-full h-full object-cover" />}
                        <div className="absolute bottom-2 right-2 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 drop-shadow-xl z-10">
                          <button className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-black hover:scale-105 active:scale-95 hover:bg-green-400">
                             <Play className="w-6 h-6 fill-current ml-1" />
                          </button>
                        </div>
                      </div>
                      <h4 className="font-bold text-base truncate mb-1">{album.title}</h4>
                      <p className="text-sm text-zinc-400 line-clamp-1">{album.artist?.name || 'Unknown Artist'}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Artists */}
            {(activeTab === 'all' || activeTab === 'artists') && results.artists.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold mb-6">Artists</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                  {results.artists.map(artist => (
                    <div key={artist._id} className="bg-[#1E1B4B] hover:bg-[#1E1B4B] p-4 rounded-md cursor-pointer group transition-colors text-center">
                      <div className="w-full aspect-square bg-[#4338CA] rounded-full mb-4 shadow-lg overflow-hidden relative">
                        {artist.image ? (
                          <img src={artist.image} alt={artist.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-zinc-600">{artist.name[0]}</div>
                        )}
                        <div className="absolute bottom-2 right-2 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 drop-shadow-xl z-10">
                          <button className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-black hover:scale-105 active:scale-95 hover:bg-green-400">
                             <Play className="w-6 h-6 fill-current ml-1" />
                          </button>
                        </div>
                      </div>
                      <h4 className="font-bold text-base truncate mb-1">{artist.name}</h4>
                      <p className="text-sm text-zinc-400">Artist</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

          </div>
        )}
      </div>
    </div>
  );
};

export default NexoriaMusicSearch;
