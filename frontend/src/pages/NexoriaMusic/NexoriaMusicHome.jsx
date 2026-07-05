import React from 'react';
import { motion } from 'framer-motion';
import { Play, Heart, Search, Library, Compass, MoreVertical } from 'lucide-react';
import { useGetNexoriaAlbumsQuery, useGetNexoriaArtistsQuery, useGetNexoriaTracksQuery } from '../../features/api/nexoriaMusicApiSlice';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { playTrack } from '../../features/music/nexoriaMusicSlice';

const NexoriaMusicHome = () => {
  const dispatch = useDispatch();
  const { data: albumsRes, isLoading: loadingAlbums } = useGetNexoriaAlbumsQuery();
  const { data: artistsRes, isLoading: loadingArtists } = useGetNexoriaArtistsQuery();
  const { data: tracksRes, isLoading: loadingTracks } = useGetNexoriaTracksQuery();

  const albums = albumsRes?.data || [];
  const artists = artistsRes?.data || [];
  const tracks = tracksRes?.data || [];

  return (
    <div className="min-h-screen bg-[#080312] text-white pb-32 relative overflow-hidden">
      {/* Gen-Z Mesh Gradient Glowing Background */}
      <div className="fixed top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-purple-600/20 blur-[120px] pointer-events-none mix-blend-screen" />
      <div className="fixed bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-pink-600/10 blur-[120px] pointer-events-none mix-blend-screen" />
      <div className="fixed top-[40%] left-[60%] w-[30%] h-[30%] rounded-full bg-indigo-500/10 blur-[100px] pointer-events-none mix-blend-screen" />

      {/* Dynamic Header/Nav */}
      <header className="sticky top-0 z-50 bg-[#080312]/50 backdrop-blur-3xl border-b border-white/5 px-4 lg:px-8 py-5 flex items-center justify-between">
        <h1 className="text-2xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-fuchsia-500 via-purple-500 to-indigo-500 drop-shadow-[0_0_15px_rgba(168,85,247,0.4)]">
          NEXORIA MUSIC
        </h1>
        <div className="flex items-center gap-6 text-slate-400 font-medium">
          <Link to="/nexoria-music" className="text-white hover:text-white transition-colors flex items-center gap-2">
            <Compass className="w-5 h-5" /> <span className="hidden md:inline">Discover</span>
          </Link>
          <Link to="/nexoria-music/search" className="hover:text-white transition-colors flex items-center gap-2">
            <Search className="w-5 h-5" /> <span className="hidden md:inline">Search</span>
          </Link>
          <Link to="/nexoria-music/library" className="hover:text-white transition-colors flex items-center gap-2">
            <Library className="w-5 h-5" /> <span className="hidden md:inline">Library</span>
          </Link>
        </div>
      </header>

      <main className="px-4 lg:px-8 py-8 space-y-12 max-w-[1600px] mx-auto">
        
        {/* Featured Banner / Hero */}
        <section className="relative h-[300px] md:h-[420px] rounded-[2rem] overflow-hidden group shadow-[0_20px_50px_-15px_rgba(168,85,247,0.3)] border border-white/10">
          <div className="absolute inset-0 bg-gradient-to-r from-violet-900/90 via-purple-900/60 to-fuchsia-900/80 z-10 mix-blend-overlay" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#080312] via-[#080312]/40 to-transparent z-10" />
          <img 
            src="https://images.unsplash.com/photo-1493225457124-a1a2a5370217?auto=format&fit=crop&q=80&w=2564" 
            alt="Featured" 
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute bottom-0 left-0 right-0 p-8 z-20">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase mb-4 inline-block">
                Exclusive Release
              </span>
              <h2 className="text-4xl md:text-6xl font-black mb-2">Midnight Echoes</h2>
              <p className="text-slate-300 text-lg md:text-xl max-w-2xl mb-6">Experience the new immersive audio journey crafted for the night.</p>
              <div className="flex items-center gap-4">
                <button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white shadow-lg shadow-purple-500/25 px-8 py-3.5 rounded-full font-bold flex items-center gap-2 hover:scale-105 transition-all active:scale-95">
                  <Play className="w-5 h-5 fill-current" /> Play Now
                </button>
                <button className="bg-white/10 hover:bg-white/20 backdrop-blur-xl border border-white/10 p-3.5 rounded-full transition-all hover:scale-110 active:scale-95 text-white hover:text-pink-400">
                  <Heart className="w-6 h-6" />
                </button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* New Releases (Albums) */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold">New Releases</h3>
            <button className="text-sm font-medium text-purple-400 hover:text-purple-300">View All</button>
          </div>
          {loadingAlbums ? (
            <div className="flex gap-6 overflow-hidden">
              {[1, 2, 3, 4, 5].map(i => <div key={i} className="w-48 h-64 bg-white/5 rounded-2xl animate-pulse shrink-0" />)}
            </div>
          ) : (
            <div className="flex gap-6 overflow-x-auto hide-scrollbar pb-4 snap-x">
              {albums.slice(0, 10).map(album => (
                <div key={album._id} className="w-40 md:w-48 shrink-0 snap-start group cursor-pointer">
                  <div className="relative aspect-square rounded-[1.5rem] overflow-hidden mb-3 shadow-xl ring-1 ring-white/10 group-hover:ring-purple-500/50 group-hover:shadow-purple-500/20 transition-all duration-300">
                    {album.coverImage ? (
                      <img src={album.coverImage} alt={album.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                        <span className="text-slate-500">No Image</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                      <button className="bg-purple-500 text-white p-4 rounded-full transform translate-y-4 group-hover:translate-y-0 transition-all shadow-xl shadow-purple-500/50 hover:scale-110 hover:bg-purple-400">
                        <Play className="w-6 h-6 fill-current" />
                      </button>
                    </div>
                  </div>
                  <h4 className="font-semibold text-white truncate text-base">{album.title}</h4>
                  <p className="text-slate-400 text-sm truncate">{album.artist?.name || 'Unknown'}</p>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Top Tracks */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold">Trending Tracks</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-2">
            {loadingTracks ? (
              [1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-16 bg-white/5 rounded-xl animate-pulse" />)
            ) : (
              tracks.slice(0, 9).map((track, idx) => (
                <div key={track._id} className="flex items-center gap-4 p-2.5 rounded-2xl hover:bg-white/[0.03] border border-transparent hover:border-white/5 group transition-all duration-300 cursor-pointer">
                  <span className="text-slate-500 font-medium w-4 text-right group-hover:hidden">{idx + 1}</span>
                  <button 
                    className="hidden group-hover:flex w-4 items-center justify-center text-white"
                    onClick={(e) => {
                      e.stopPropagation();
                      dispatch(playTrack(track));
                    }}
                  >
                    <Play className="w-4 h-4 fill-current" />
                  </button>
                  <div className="w-12 h-12 rounded-lg bg-slate-800 flex-shrink-0 overflow-hidden shadow-md">
                    {track.album?.coverImage ? (
                      <img src={track.album.coverImage} alt={track.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-purple-500/20 to-blue-500/20" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-white truncate group-hover:text-purple-400 transition-colors text-sm">{track.title}</h4>
                    <p className="text-slate-400 text-xs truncate">{track.artist?.name || 'Unknown'}</p>
                  </div>
                  <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="text-slate-400 hover:text-white"><Heart className="w-4 h-4" /></button>
                    <button className="text-slate-400 hover:text-white"><MoreVertical className="w-4 h-4" /></button>
                  </div>
                  <span className="text-xs font-medium text-slate-500 w-10 text-right group-hover:opacity-0">
                    {Math.floor(track.duration / 60)}:{(track.duration % 60).toString().padStart(2, '0')}
                  </span>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Top Artists */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold">Featured Artists</h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {loadingArtists ? (
              [1, 2, 3, 4, 5, 6].map(i => <div key={i} className="aspect-square rounded-full bg-white/5 animate-pulse" />)
            ) : (
              artists.slice(0, 6).map(artist => (
                <div key={artist._id} className="flex flex-col items-center gap-3 group cursor-pointer">
                  <div className="w-32 h-32 rounded-full overflow-hidden relative shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)] ring-2 ring-white/5 group-hover:ring-purple-500 group-hover:shadow-purple-500/30 transition-all duration-500">
                    {artist.image ? (
                      <img src={artist.image} alt={artist.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full bg-slate-800 flex items-center justify-center text-3xl font-bold text-slate-500">
                        {artist.name[0]}
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                      <Play className="w-8 h-8 text-white fill-current transform scale-75 group-hover:scale-100 transition-transform" />
                    </div>
                  </div>
                  <h4 className="font-semibold text-white truncate text-center w-full">{artist.name}</h4>
                  <p className="text-xs text-slate-400 bg-white/5 px-2 py-1 rounded-full uppercase tracking-wider font-bold">Artist</p>
                </div>
              ))
            )}
          </div>
        </section>

      </main>
    </div>
  );
};

export default NexoriaMusicHome;
