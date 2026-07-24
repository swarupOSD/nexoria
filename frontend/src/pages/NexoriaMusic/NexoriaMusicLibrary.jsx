import React from 'react';
import { Heart, Download, Music, Plus, Search, Play } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useGetPlaylistsQuery } from '../../features/api/nexoriaMusicApiSlice';

const NexoriaMusicLibrary = () => {
  const navigate = useNavigate();
  const { likedTracks, downloadedTracks } = useSelector(state => state.nexoriaMusic);
  const { data: playlistsRes, isLoading } = useGetPlaylistsQuery();
  const playlists = playlistsRes?.data || [];

  return (
    <div className="min-h-full bg-[#0F0F23] text-white p-6 sm:p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Your Library</h1>
        <div className="flex items-center gap-4">
          <button className="w-10 h-10 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors">
            <Search className="w-5 h-5 text-zinc-400" />
          </button>
          <button className="w-10 h-10 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors">
            <Plus className="w-5 h-5 text-zinc-400" />
          </button>
        </div>
      </div>
      
      {/* Filters/Chips */}
      <div className="flex items-center gap-3 mb-8 overflow-x-auto pb-2 scrollbar-hide">
        <button className="px-4 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-sm font-medium whitespace-nowrap transition-colors">Playlists</button>
        <button className="px-4 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-sm font-medium whitespace-nowrap transition-colors">Artists</button>
        <button className="px-4 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-sm font-medium whitespace-nowrap transition-colors">Albums</button>
        <button className="px-4 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-sm font-medium whitespace-nowrap transition-colors">Podcasts & Shows</button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        
        {/* Liked Songs Card */}
        <Link 
          to="/nexoria-music/liked-songs"
          className="bg-white/5 hover:bg-white/10 p-4 rounded-md transition-all group flex flex-col gap-4 cursor-pointer"
        >
          <div className="w-full aspect-square bg-gradient-to-br from-indigo-600 to-indigo-300 rounded shadow-lg flex flex-col items-center justify-center gap-2 relative">
            <Heart className="w-12 h-12 text-white" fill="white" />
            <div className="absolute right-2 bottom-2 w-12 h-12 bg-green-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all shadow-xl">
              <Play className="w-6 h-6 text-black fill-current ml-1" />
            </div>
          </div>
          <div className="flex flex-col">
            <h3 className="font-bold text-white truncate text-base">Liked Songs</h3>
            <span className="text-sm text-zinc-400 font-medium">{likedTracks.length} tracks</span>
          </div>
        </Link>

        {/* Downloaded Tracks Card */}
        <Link 
          to="/nexoria-music/downloaded"
          className="bg-white/5 hover:bg-white/10 p-4 rounded-md transition-all group flex flex-col gap-4 cursor-pointer"
        >
          <div className="w-full aspect-square bg-gradient-to-br from-emerald-600 to-emerald-300 rounded shadow-lg flex flex-col items-center justify-center gap-2 relative">
            <Download className="w-12 h-12 text-white" />
            <div className="absolute right-2 bottom-2 w-12 h-12 bg-green-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all shadow-xl">
              <Play className="w-6 h-6 text-black fill-current ml-1" />
            </div>
          </div>
          <div className="flex flex-col">
            <h3 className="font-bold text-white truncate text-base">Downloaded</h3>
            <span className="text-sm text-zinc-400 font-medium">{downloadedTracks.length} offline tracks</span>
          </div>
        </Link>

        {/* User Playlists */}
        {isLoading ? (
          [1,2,3].map(i => (
             <div key={i} className="bg-white/5 p-4 rounded-md animate-pulse">
                <div className="w-full aspect-square bg-white/10 rounded mb-4"></div>
                <div className="h-4 bg-white/10 w-3/4 rounded mb-2"></div>
                <div className="h-3 bg-white/10 w-1/2 rounded"></div>
             </div>
          ))
        ) : (
          playlists.map(playlist => (
            <Link 
              key={playlist._id}
              to={`/nexoria-music/playlist/${playlist._id}`}
              className="bg-white/5 hover:bg-white/10 p-4 rounded-md transition-all group flex flex-col gap-4 cursor-pointer"
            >
              <div className="w-full aspect-square bg-[#27272A] rounded shadow-lg flex items-center justify-center relative overflow-hidden">
                {playlist.coverImage ? (
                   <img src={playlist.coverImage} alt={playlist.title} className="w-full h-full object-cover" />
                ) : (
                   <Music className="w-12 h-12 text-zinc-500" />
                )}
                <div className="absolute right-2 bottom-2 w-12 h-12 bg-green-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all shadow-xl">
                  <Play className="w-6 h-6 text-black fill-current ml-1" />
                </div>
              </div>
              <div className="flex flex-col">
                <h3 className="font-bold text-white truncate text-base">{playlist.title}</h3>
                <span className="text-sm text-zinc-400 font-medium">By {playlist.creator?.name || 'You'}</span>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
};

export default NexoriaMusicLibrary;
