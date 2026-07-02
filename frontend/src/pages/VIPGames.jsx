import React from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useGetGamesQuery } from '../features/games/gameApiSlice';
import { Crown, Lock, Star, Play, Coins, ExternalLink } from 'lucide-react';
import { AuraBadge } from '../components/AuraScore';

const VIPGames = () => {
  const { user } = useSelector(state => state.auth);
  const navigate = useNavigate();
  const { data: res, isLoading } = useGetGamesQuery();

  const isVIP = user?.isPremium || user?.role === 'admin' || user?.role === 'superadmin';

  // Filter only premium (VIP) games for the VIP section
  const vipGames = (res?.data || []).filter(game => game.isVip);

  if (isLoading) {
    return (
      <div className="p-8 flex justify-center items-center min-h-[50vh]">
        <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 min-h-screen">
      <div className="mb-12 max-w-4xl relative group">
        <div className="absolute -inset-4 bg-gradient-to-r from-amber-500/20 to-orange-500/20 blur-2xl rounded-3xl opacity-50 group-hover:opacity-100 transition-opacity duration-700"></div>
        <div className="relative">
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight flex items-center gap-3">
            <span className="text-5xl drop-shadow-2xl">👑</span>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-orange-500 drop-shadow-lg">VIP Arcade</span>
          </h1>
          <p className="text-amber-200/70 font-medium text-lg max-w-2xl leading-relaxed">
            Exclusive premium games and modded apps, unlocked instantly for VIP members.
          </p>
        </div>
      </div>

      {!isVIP ? (
        // LOCKED STATE
        <div className="flex flex-col items-center justify-center py-20 px-4">
          <div className="w-32 h-32 mb-8 relative">
            <div className="absolute inset-0 bg-amber-500/20 rounded-full blur-2xl animate-pulse"></div>
            <div className="w-full h-full bg-[#1a1a1f] border border-amber-500/30 rounded-3xl shadow-[0_0_40px_rgba(245,158,11,0.2)] flex items-center justify-center relative z-10">
              <Lock className="w-16 h-16 text-amber-500" />
            </div>
          </div>
          
          <h2 className="text-3xl font-black text-white mb-4 text-center">VIP Access Locked</h2>
          <p className="text-slate-400 text-center max-w-md mb-10 text-lg">
            This section contains ultra-premium games and apps. You need a VIP membership to unlock this arcade.
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
          {vipGames.length === 0 ? (
            <div className="text-center py-20 bg-[#1a1a1f] rounded-2xl border border-white/5">
              <p className="text-slate-500">No VIP games available right now. Check back later!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {vipGames.map((game) => (
                <div
                  key={game._id}
                  className="block group bg-gradient-to-b from-[#1a1a1f] to-slate-900 rounded-2xl overflow-hidden border border-amber-500/20 hover:border-amber-500/50 transition-all hover:shadow-[0_10px_30px_rgba(245,158,11,0.15)] hover:-translate-y-1 relative"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 blur-3xl rounded-full -mr-10 -mt-10 pointer-events-none"></div>
                  
                  {/* Banner / Logo Area */}
                  <div className="relative aspect-video bg-black/50 overflow-hidden border-b border-amber-500/10">
                    {game.banner || game.logo ? (
                      <img
                        src={game.banner || game.logo}
                        alt={game.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-amber-900/40 to-orange-900/40">
                        <span className="text-4xl font-bold text-amber-500/50">{game.title?.charAt(0)}</span>
                      </div>
                    )}
                    
                    {/* Overlay gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1f] via-transparent to-transparent"></div>
                    
                    {/* VIP Badge */}
                    <div className="absolute top-3 left-3 bg-amber-500/90 backdrop-blur-md px-2 py-1 rounded text-[10px] font-black text-black border border-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.5)] flex items-center gap-1">
                      <Crown className="w-3 h-3" /> VIP
                    </div>
                    
                    {game.auraScore > 0 && (
                      <div className="absolute bottom-3 right-3 z-10">
                        <AuraBadge score={game.auraScore} />
                      </div>
                    )}
                    
                    {game.banner && game.logo && (
                      <div className="absolute bottom-3 left-4 w-12 h-12 rounded-xl overflow-hidden border-2 border-[#1a1a1f] shadow-lg bg-black">
                        <img src={game.logo} alt="" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-4 relative z-10">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="text-lg font-bold text-white group-hover:text-amber-400 transition-colors line-clamp-1">
                        {game.title}
                      </h3>
                      <div className="flex items-center gap-1 bg-amber-500/10 px-1.5 py-0.5 rounded shrink-0 border border-amber-500/20">
                        <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                        <span className="text-xs font-bold text-amber-500">{game.rating || '0'}</span>
                      </div>
                    </div>

                    <p className="text-sm text-slate-400 line-clamp-2 mb-5">
                      {game.description || 'Exclusive VIP Game.'}
                    </p>

                    <div className="flex flex-col gap-2 mt-auto">
                      <button 
                        onClick={() => window.open(game.githubLink, '_blank')}
                        className="w-full px-4 py-3 flex justify-center items-center gap-2 text-sm font-bold rounded-xl transition-all bg-gradient-to-r from-amber-500/10 to-orange-500/10 hover:from-amber-500 hover:to-orange-500 text-amber-500 hover:text-white border border-amber-500/30 hover:border-transparent"
                      >
                        Play Now <ExternalLink className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default VIPGames;
