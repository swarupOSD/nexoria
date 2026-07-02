import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useGetGamesQuery } from '../features/games/gameApiSlice';
import { useGetPostsQuery } from '../features/post/postApiSlice';
import { useGetSongsQuery } from '../features/api/musicApiSlice';
import { useGetMoviesQuery } from '../features/movie/movieApiSlice';
import { Crown, Lock, Star, Play, Coins, ExternalLink, Gamepad2, Smartphone, Music, Clapperboard } from 'lucide-react';
import { AuraBadge } from '../components/AuraScore';

const VIPLounge = () => {
  const { user } = useSelector(state => state.auth);
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('games');

  // Queries
  const { data: gamesRes, isLoading: isLoadingGames } = useGetGamesQuery();
  const { data: postsRes, isLoading: isLoadingPosts } = useGetPostsQuery({ limit: 100 });
  const { data: songsRes, isLoading: isLoadingSongs } = useGetSongsQuery();
  const { data: moviesRes, isLoading: isLoadingMovies } = useGetMoviesQuery({ limit: 100 });

  const isVIP = user?.isPremium || user?.role === 'admin' || user?.role === 'superadmin';

  // Filter VIP Items
  const vipGames = (gamesRes?.data || []).filter(item => item.isVip);
  const vipApps = (postsRes?.data?.posts || []).filter(item => item.isVip);
  const vipSongs = (songsRes?.data || songsRes || []).filter(item => item.isVip);
  const vipMovies = (moviesRes?.data?.movies || []).filter(item => item.isVip);

  const tabs = [
    { id: 'games', label: 'VIP Games', icon: <Gamepad2 className="w-5 h-5" />, count: vipGames.length },
    { id: 'apps', label: 'VIP Apps', icon: <Smartphone className="w-5 h-5" />, count: vipApps.length },
    { id: 'music', label: 'VIP Music', icon: <Music className="w-5 h-5" />, count: vipSongs.length },
    { id: 'movies', label: 'VIP Movies', icon: <Clapperboard className="w-5 h-5" />, count: vipMovies.length },
  ];

  const renderContent = () => {
    if (activeTab === 'games') {
      if (isLoadingGames) return <Loader />;
      if (vipGames.length === 0) return <EmptyState label="VIP Games" />;
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {vipGames.map((game) => (
            <GameCard key={game._id} item={game} />
          ))}
        </div>
      );
    }
    if (activeTab === 'apps') {
      if (isLoadingPosts) return <Loader />;
      if (vipApps.length === 0) return <EmptyState label="VIP Apps" />;
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {vipApps.map((app) => (
            <AppCard key={app._id} item={app} navigate={navigate} />
          ))}
        </div>
      );
    }
    if (activeTab === 'music') {
      if (isLoadingSongs) return <Loader />;
      if (vipSongs.length === 0) return <EmptyState label="VIP Music" />;
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {vipSongs.map((song) => (
            <SongCard key={song._id} item={song} navigate={navigate} />
          ))}
        </div>
      );
    }
    if (activeTab === 'movies') {
      if (isLoadingMovies) return <Loader />;
      if (vipMovies.length === 0) return <EmptyState label="VIP Movies" />;
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {vipMovies.map((movie) => (
            <MovieCard key={movie._id} item={movie} navigate={navigate} />
          ))}
        </div>
      );
    }
  };

  return (
    <div className="p-4 sm:p-8 min-h-screen">
      <div className="mb-12 max-w-4xl relative group">
        <div className="absolute -inset-4 bg-gradient-to-r from-amber-500/20 to-orange-500/20 md:blur-2xl rounded-3xl opacity-50 group-hover:opacity-100 transition-opacity duration-700"></div>
        <div className="relative">
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight flex items-center gap-3">
            <span className="text-5xl drop-shadow-2xl">👑</span>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-orange-500 drop-shadow-lg">Global VIP Lounge</span>
          </h1>
          <p className="text-amber-200/70 font-medium text-lg max-w-2xl leading-relaxed">
            Exclusive premium content. Unlocked instantly for VIP members.
          </p>
        </div>
      </div>

      {!isVIP ? (
        // LOCKED STATE
        <div className="flex flex-col items-center justify-center py-20 px-4">
          <div className="w-32 h-32 mb-8 relative">
            <div className="absolute inset-0 bg-amber-500/20 rounded-full md:blur-2xl blur-xl animate-pulse"></div>
            <div className="w-full h-full bg-[#1a1a1f] border border-amber-500/30 rounded-3xl shadow-[0_0_40px_rgba(245,158,11,0.2)] flex items-center justify-center relative z-10">
              <Lock className="w-16 h-16 text-amber-500" />
            </div>
          </div>
          
          <h2 className="text-3xl font-black text-white mb-4 text-center">VIP Lounge Locked</h2>
          <p className="text-slate-400 text-center max-w-md mb-10 text-lg">
            This section contains ultra-premium games, apps, music and movies. You need a VIP membership to unlock the lounge.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
            <button 
              onClick={() => navigate('/premium')}
              className="flex-1 py-4 px-6 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-bold rounded-xl shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 transition-all hover:-translate-y-1"
            >
              <Crown className="w-5 h-5" /> Get Premium
            </button>
            <button 
              onClick={() => navigate('/profile', { state: { tab: 'earn' } })}
              className="flex-1 py-4 px-6 bg-[#1a1a1f] hover:bg-slate-800 text-amber-400 border border-amber-500/30 font-bold rounded-xl flex items-center justify-center gap-2 transition-all hover:-translate-y-1"
            >
              <Coins className="w-5 h-5" /> Earn Aura
            </button>
          </div>
        </div>
      ) : (
        // VIP UNLOCKED STATE
        <>
          {/* TABS */}
          <div className="flex flex-wrap gap-3 mb-8">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-5 py-3 rounded-xl font-bold flex items-center gap-2 transition-all border ${
                  activeTab === tab.id 
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 border-amber-400 text-white shadow-[0_0_20px_rgba(245,158,11,0.3)]'
                    : 'bg-[#1a1a1f] border-white/10 text-slate-400 hover:border-amber-500/30 hover:text-amber-400'
                }`}
              >
                {tab.icon}
                {tab.label}
                <span className={`px-2 py-0.5 rounded-full text-xs ml-2 ${activeTab === tab.id ? 'bg-black/20 text-white' : 'bg-white/10 text-slate-400'}`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
          
          {/* CONTENT */}
          {renderContent()}
        </>
      )}
    </div>
  );
};

// Sub-components
const Loader = () => (
  <div className="p-8 flex justify-center items-center min-h-[50vh]">
    <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
  </div>
);

const EmptyState = ({ label }) => (
  <div className="text-center py-20 bg-[#1a1a1f] rounded-2xl border border-white/5">
    <p className="text-slate-500">No {label} available right now. Check back later!</p>
  </div>
);

const GameCard = ({ item }) => (
  <div className="block group bg-gradient-to-b from-[#1a1a1f] to-slate-900 rounded-2xl overflow-hidden border border-amber-500/20 hover:border-amber-500/50 transition-all hover:shadow-[0_10px_30px_rgba(245,158,11,0.15)] hover:-translate-y-1 relative">
    <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 md:blur-3xl blur-xl rounded-full -mr-10 -mt-10 pointer-events-none"></div>
    <div className="relative aspect-video bg-black/50 overflow-hidden border-b border-amber-500/10">
      {item.banner || item.logo ? (
        <img src={item.banner || item.logo} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-amber-900/40 to-orange-900/40">
          <span className="text-4xl font-bold text-amber-500/50">{item.title?.charAt(0)}</span>
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1f] via-transparent to-transparent"></div>
      <div className="absolute top-3 left-3 bg-amber-500/90 md:backdrop-blur-md px-2 py-1 rounded text-[10px] font-black text-black border border-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.5)] flex items-center gap-1">
        <Crown className="w-3 h-3" /> VIP Game
      </div>
      {item.banner && item.logo && (
        <div className="absolute bottom-3 left-4 w-12 h-12 rounded-xl overflow-hidden border-2 border-[#1a1a1f] shadow-lg bg-black">
          <img src={item.logo} alt="" className="w-full h-full object-cover" />
        </div>
      )}
    </div>
    <div className="p-4 relative z-10">
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="text-lg font-bold text-white group-hover:text-amber-400 transition-colors line-clamp-1">{item.title}</h3>
        <div className="flex items-center gap-1 bg-amber-500/10 px-1.5 py-0.5 rounded shrink-0 border border-amber-500/20">
          <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
          <span className="text-xs font-bold text-amber-500">{item.rating || '0'}</span>
        </div>
      </div>
      <p className="text-sm text-slate-400 line-clamp-2 mb-5">{item.description || 'Exclusive VIP Game.'}</p>
      <button onClick={() => window.open(item.githubLink, '_blank')} className="w-full px-4 py-3 flex justify-center items-center gap-2 text-sm font-bold rounded-xl transition-all bg-gradient-to-r from-amber-500/10 to-orange-500/10 hover:from-amber-500 hover:to-orange-500 text-amber-500 hover:text-white border border-amber-500/30 hover:border-transparent">
        Play Now <ExternalLink className="w-4 h-4" />
      </button>
    </div>
  </div>
);

const AppCard = ({ item, navigate }) => (
  <div className="block group bg-gradient-to-b from-[#1a1a1f] to-slate-900 rounded-2xl overflow-hidden border border-amber-500/20 hover:border-amber-500/50 transition-all hover:shadow-[0_10px_30px_rgba(245,158,11,0.15)] hover:-translate-y-1 relative">
    <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 md:blur-3xl blur-xl rounded-full -mr-10 -mt-10 pointer-events-none"></div>
    <div className="relative aspect-video bg-black/50 overflow-hidden border-b border-amber-500/10">
      <img src={item.featuredImage} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1f] via-transparent to-transparent"></div>
      <div className="absolute top-3 left-3 bg-amber-500/90 md:backdrop-blur-md px-2 py-1 rounded text-[10px] font-black text-black border border-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.5)] flex items-center gap-1">
        <Crown className="w-3 h-3" /> VIP App
      </div>
    </div>
    <div className="p-4 relative z-10">
      <h3 className="text-lg font-bold text-white group-hover:text-amber-400 transition-colors line-clamp-1 mb-2">{item.title}</h3>
      <button onClick={() => navigate(`/post/${item.slug}`)} className="w-full px-4 py-3 flex justify-center items-center gap-2 text-sm font-bold rounded-xl transition-all bg-gradient-to-r from-amber-500/10 to-orange-500/10 hover:from-amber-500 hover:to-orange-500 text-amber-500 hover:text-white border border-amber-500/30 hover:border-transparent">
        View App <ExternalLink className="w-4 h-4" />
      </button>
    </div>
  </div>
);

const SongCard = ({ item, navigate }) => (
  <div className="block group bg-gradient-to-b from-[#1a1a1f] to-slate-900 rounded-2xl overflow-hidden border border-amber-500/20 hover:border-amber-500/50 transition-all hover:shadow-[0_10px_30px_rgba(245,158,11,0.15)] hover:-translate-y-1 relative p-4 flex gap-4">
    <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 relative">
      <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
        <Play className="w-8 h-8 text-white fill-white" />
      </div>
    </div>
    <div className="flex-1 min-w-0 flex flex-col justify-center">
      <h3 className="text-lg font-bold text-white group-hover:text-amber-400 transition-colors truncate">{item.title}</h3>
      <p className="text-sm text-slate-400 truncate">{item.artist}</p>
      <div className="mt-2 inline-flex items-center gap-1 bg-amber-500/10 px-2 py-0.5 rounded text-[10px] font-black text-amber-500 border border-amber-500/20">
        <Crown className="w-3 h-3" /> VIP Track
      </div>
    </div>
  </div>
);

const MovieCard = ({ item, navigate }) => (
  <div className="block group bg-gradient-to-b from-[#1a1a1f] to-slate-900 rounded-2xl overflow-hidden border border-amber-500/20 hover:border-amber-500/50 transition-all hover:shadow-[0_10px_30px_rgba(245,158,11,0.15)] hover:-translate-y-1 relative">
    <div className="relative aspect-[2/3] bg-black/50 overflow-hidden">
      <img src={item.posterImage} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1f] via-[#1a1a1f]/20 to-transparent"></div>
      <div className="absolute top-3 left-3 bg-amber-500/90 md:backdrop-blur-md px-2 py-1 rounded text-[10px] font-black text-black border border-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.5)] flex items-center gap-1">
        <Crown className="w-3 h-3" /> VIP Movie
      </div>
      <div className="absolute bottom-4 left-4 right-4">
        <h3 className="text-lg font-bold text-white group-hover:text-amber-400 transition-colors line-clamp-1 mb-1">{item.title}</h3>
        <p className="text-xs text-slate-400 mb-3">{item.releaseYear} • {item.quality?.[0] || 'HD'}</p>
        <button onClick={() => navigate(`/moviebox/movie/${item.slug}`)} className="w-full py-2 flex justify-center items-center gap-2 text-xs font-bold rounded-lg transition-all bg-amber-500 hover:bg-amber-400 text-black shadow-lg shadow-amber-500/25">
          Watch Now
        </button>
      </div>
    </div>
  </div>
);

export default VIPLounge;
