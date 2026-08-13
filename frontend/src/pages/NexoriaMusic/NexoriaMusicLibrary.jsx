import React from 'react';
import { Heart, Download, Music, Plus, Search, Play } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useGetPlaylistsQuery, useGetPublicPlaylistsQuery } from '../../features/api/nexoriaMusicApiSlice';

const NexoriaMusicLibrary = () => {
  const navigate = useNavigate();
  const { likedTracks, downloadedTracks } = useSelector(state => state.nexoriaMusic);
  const { data: playlistsRes, isLoading } = useGetPlaylistsQuery();
  const playlists = playlistsRes?.data || [];
  
  const { data: publicPlaylistsRes, isLoading: publicLoading } = useGetPublicPlaylistsQuery();
  const publicPlaylists = publicPlaylistsRes?.data || [];

  return (
    <div className="bg-background text-on-surface font-body-md min-h-screen relative p-6 md:p-margin-desktop md:pt-12 pb-32 max-w-[1440px] mx-auto">
      <div className="flex items-center justify-between mb-10">
        <h1 className="font-display-lg text-headline-lg font-bold tracking-tight">Your Library</h1>
        <div className="flex items-center gap-4">
          <button className="w-12 h-12 rounded-full bg-surface-container hover:bg-surface-container-high flex items-center justify-center transition-colors text-on-surface-variant hover:text-on-surface">
            <Search className="w-6 h-6" />
          </button>
          <button className="w-12 h-12 rounded-full bg-surface-container hover:bg-surface-container-high flex items-center justify-center transition-colors text-on-surface-variant hover:text-on-surface">
            <Plus className="w-6 h-6" />
          </button>
        </div>
      </div>
      
      {/* Filters/Chips */}
      <div className="flex items-center gap-3 mb-10 overflow-x-auto pb-4 no-scrollbar">
        <button className="px-6 py-2.5 rounded-full font-label-sm text-sm uppercase tracking-wider whitespace-nowrap transition-all border bg-primary text-on-primary border-primary font-bold shadow-[0_0_15px_rgba(210,187,255,0.3)]">Playlists</button>
        <button className="px-6 py-2.5 rounded-full font-label-sm text-sm uppercase tracking-wider whitespace-nowrap transition-all border bg-surface-container-low text-on-surface-variant border-outline-variant/30 hover:bg-surface-container hover:text-on-surface">Artists</button>
        <button className="px-6 py-2.5 rounded-full font-label-sm text-sm uppercase tracking-wider whitespace-nowrap transition-all border bg-surface-container-low text-on-surface-variant border-outline-variant/30 hover:bg-surface-container hover:text-on-surface">Albums</button>
        <button className="px-6 py-2.5 rounded-full font-label-sm text-sm uppercase tracking-wider whitespace-nowrap transition-all border bg-surface-container-low text-on-surface-variant border-outline-variant/30 hover:bg-surface-container hover:text-on-surface">Podcasts & Shows</button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 xl:gap-8">
        
        {/* Liked Songs Card */}
        <Link 
          to="/nexoria-music/liked-songs"
          className="group cursor-pointer flex flex-col h-full"
        >
          <div className="w-full aspect-square bg-gradient-to-br from-indigo-500 to-indigo-800 rounded-2xl shadow-lg flex flex-col items-center justify-center gap-2 relative mb-4 border border-outline-variant/20 overflow-hidden">
            <Heart className="w-16 h-16 text-white drop-shadow-md" style={{ fontVariationSettings: "'FILL' 1" }} />
            <div className="absolute right-4 bottom-4 w-14 h-14 bg-primary text-on-primary rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300 shadow-[0_10px_20px_rgba(210,187,255,0.3)] hover:scale-110 active:scale-95 glow-primary z-10">
              <Play className="w-6 h-6 fill-current" style={{ fontVariationSettings: "'FILL' 1" }} />
            </div>
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </div>
          <div className="flex flex-col flex-grow">
            <h3 className="font-body-md font-bold text-on-surface text-lg truncate mb-1">Liked Songs</h3>
            <span className="font-label-sm text-sm text-on-surface-variant">{likedTracks.length} tracks</span>
          </div>
        </Link>

        {/* Downloaded Tracks Card */}
        <Link 
          to="/nexoria-music/downloaded"
          className="group cursor-pointer flex flex-col h-full"
        >
          <div className="w-full aspect-square bg-gradient-to-br from-emerald-500 to-emerald-800 rounded-2xl shadow-lg flex flex-col items-center justify-center gap-2 relative mb-4 border border-outline-variant/20 overflow-hidden">
            <Download className="w-16 h-16 text-white drop-shadow-md" />
            <div className="absolute right-4 bottom-4 w-14 h-14 bg-primary text-on-primary rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300 shadow-[0_10px_20px_rgba(210,187,255,0.3)] hover:scale-110 active:scale-95 glow-primary z-10">
              <Play className="w-6 h-6 fill-current" style={{ fontVariationSettings: "'FILL' 1" }} />
            </div>
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </div>
          <div className="flex flex-col flex-grow">
            <h3 className="font-body-md font-bold text-on-surface text-lg truncate mb-1">Downloaded</h3>
            <span className="font-label-sm text-sm text-on-surface-variant">{downloadedTracks.length} offline tracks</span>
          </div>
        </Link>

        {/* User Playlists */}
        {isLoading ? (
          [1,2,3].map(i => (
             <div key={i} className="flex flex-col animate-pulse">
                <div className="w-full aspect-square bg-surface-container rounded-2xl mb-4 border border-outline-variant/10"></div>
                <div className="h-5 bg-surface-container w-3/4 rounded mb-2"></div>
                <div className="h-4 bg-surface-container-high w-1/2 rounded"></div>
             </div>
          ))
        ) : (
          playlists.map(playlist => (
            <Link 
              key={playlist._id}
              to={`/nexoria-music/playlist/${playlist._id}`}
              className="group cursor-pointer flex flex-col h-full"
            >
              <div className="w-full aspect-square bg-surface-container rounded-2xl shadow-lg flex items-center justify-center relative mb-4 overflow-hidden border border-outline-variant/20">
                {playlist.coverImage ? (
                   <img src={playlist.coverImage} alt={playlist.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                   <Music className="w-16 h-16 text-on-surface-variant opacity-50 group-hover:opacity-75 transition-opacity group-hover:scale-110 duration-500" />
                )}
                <div className="absolute right-4 bottom-4 w-14 h-14 bg-primary text-on-primary rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300 shadow-[0_10px_20px_rgba(210,187,255,0.3)] hover:scale-110 active:scale-95 glow-primary z-10">
                  <Play className="w-6 h-6 fill-current" style={{ fontVariationSettings: "'FILL' 1" }} />
                </div>
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>
              <div className="flex flex-col flex-grow">
                <h3 className="font-body-md font-bold text-on-surface text-lg truncate mb-1">{playlist.title}</h3>
                <span className="font-label-sm text-sm text-on-surface-variant">By {playlist.creator?.name || 'You'}</span>
              </div>
            </Link>
          ))
        )}
      </div>

      {/* Public / Featured Playlists */}
      {(!publicLoading && publicPlaylists.length > 0) && (
        <div className="mt-16">
          <h2 className="font-display-lg text-headline-sm font-bold tracking-tight mb-8 text-on-surface">Featured & Trending</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 xl:gap-8">
            {publicPlaylists.map(playlist => (
              <Link 
                key={playlist._id}
                to={`/nexoria-music/playlist/${playlist._id}`}
                className="group cursor-pointer flex flex-col h-full"
              >
                <div className="w-full aspect-square bg-surface-container rounded-2xl shadow-lg flex items-center justify-center relative mb-4 overflow-hidden border border-outline-variant/20">
                  {playlist.coverImage ? (
                    <img src={playlist.coverImage} alt={playlist.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <Music className="w-16 h-16 text-on-surface-variant opacity-50 group-hover:opacity-75 transition-opacity group-hover:scale-110 duration-500" />
                  )}
                  <div className="absolute right-4 bottom-4 w-14 h-14 bg-primary text-on-primary rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300 shadow-[0_10px_20px_rgba(210,187,255,0.3)] hover:scale-110 active:scale-95 glow-primary z-10">
                    <Play className="w-6 h-6 fill-current" style={{ fontVariationSettings: "'FILL' 1" }} />
                  </div>
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
                <div className="flex flex-col flex-grow">
                  <h3 className="font-body-md font-bold text-on-surface text-lg truncate mb-1">{playlist.title}</h3>
                  <p className="font-label-sm text-sm text-on-surface-variant line-clamp-1 text-ellipsis">By Nexoria Music</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default NexoriaMusicLibrary;
