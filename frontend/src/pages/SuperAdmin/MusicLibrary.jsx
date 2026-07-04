import React, { useState, useEffect } from 'react';
import { Search, Plus, Music, Loader2, CheckCircle2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useSearchSaavnQuery, useImportSaavnMutation } from '../../features/api/musicApiSlice';

const MusicLibrary = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [importingId, setImportingId] = useState(null);

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

  const { data: searchResults, isFetching } = useSearchSaavnQuery(debouncedSearch, {
    skip: !debouncedSearch
  });

  const [importSaavn] = useImportSaavnMutation();

  const handleImport = async (song) => {
    try {
      setImportingId(song.saavnId);
      const res = await importSaavn({ saavnId: song.saavnId }).unwrap();
      toast.success(`"${res.data.title}" added to Nexoria!`);
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to import song');
    } finally {
      setImportingId(null);
    }
  };

  const songs = searchResults?.data || [];

  return (
    <div className="p-4 sm:p-8 space-y-8 animate-fade-in max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500 mb-2">
          Global Music Library
        </h1>
        <p className="text-slate-400">Search and import millions of songs directly from JioSaavn for free.</p>
      </div>

      {/* Search Bar */}
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-slate-400 group-focus-within:text-purple-400 transition-colors" />
        </div>
        <input
          type="text"
          placeholder="Search for any song, artist, or album... (e.g. Arijit Singh)"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-4 bg-slate-900/50 border border-slate-700/50 rounded-2xl focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 text-white placeholder-slate-500 transition-all text-lg shadow-inner"
        />
        {isFetching && (
          <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
            <Loader2 className="h-5 w-5 text-purple-400 animate-spin" />
          </div>
        )}
      </div>

      {/* Results State */}
      {!debouncedSearch && (
        <div className="flex flex-col items-center justify-center py-20 text-slate-500 space-y-4">
          <Music className="w-16 h-16 opacity-20" />
          <p className="text-lg">Type at least 3 characters to search</p>
        </div>
      )}

      {debouncedSearch && !isFetching && songs.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-slate-500 space-y-4">
          <Search className="w-16 h-16 opacity-20" />
          <p className="text-lg">No songs found for "{debouncedSearch}"</p>
        </div>
      )}

      {/* Results Grid */}
      {songs.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {songs.map((song) => (
            <div 
              key={song.saavnId} 
              className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-3 flex gap-4 items-center hover:bg-slate-800 transition-all group"
            >
              <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0 shadow-lg">
                <img 
                  src={song.image} 
                  alt={song.title} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-white text-sm truncate group-hover:text-purple-400 transition-colors" title={song.title}>
                  {song.title}
                </h3>
                <p className="text-xs text-slate-400 truncate" title={song.artist}>
                  {song.artist}
                </p>
              </div>

              <button
                onClick={() => handleImport(song)}
                disabled={importingId === song.saavnId}
                className="shrink-0 w-10 h-10 rounded-full bg-purple-500/10 text-purple-400 flex items-center justify-center hover:bg-purple-500 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                title="Add to Nexoria"
              >
                {importingId === song.saavnId ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Plus className="w-5 h-5" />
                )}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MusicLibrary;
