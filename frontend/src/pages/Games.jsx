import React, { useState, useEffect } from 'react';
import { useGetGamesQuery } from '../features/games/gameApiSlice';
import { useGetMyRequestsQuery, useSubmitPurchaseRequestMutation, useBuyItemWithCoinsMutation } from '../features/api/paymentApiSlice';
import { useSelector, useDispatch } from 'react-redux';
import { setCredentials } from '../features/auth/authSlice';
import { useNavigate } from 'react-router-dom';
import { ExternalLink, Star, Play, Lock, ArrowLeft, Gamepad2 } from 'lucide-react';
import QRPaymentModal from '../components/QRPaymentModal';
import PurchaseErrorBoundary from '../components/ErrorBoundaries/PurchaseErrorBoundary';
import toast from 'react-hot-toast';
import { AuraBadge } from '../components/AuraScore';
import SEO from '../components/SEO';
import { BACKEND_URL } from '../features/api/apiSlice';

const Games = () => {
  const { user, token } = useSelector(state => state.auth);
  const navigate = useNavigate();
  const { data: res, isLoading } = useGetGamesQuery();
  const { data: myRequestsRes, isLoading: isRequestsLoading, refetch } = useGetMyRequestsQuery(undefined, { skip: !user });
  const [submitPurchaseRequest, { isLoading: isSubmittingPurchase }] = useSubmitPurchaseRequestMutation();
  const [buyItemWithCoins, { isLoading: isBuyingWithCoins }] = useBuyItemWithCoinsMutation();
  const dispatch = useDispatch();
  
  const [selectedGame, setSelectedGame] = useState(null);
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [isUploadingProof, setIsUploadingProof] = useState(false);

  const games = res?.data || [];

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handlePurchaseSubmit = async ({ transactionId, proofImage }) => {
    if (!user) {
      toast.error('Please log in to submit your payment.');
      return navigate('/login?redirect=/moviebox/games');
    }
    
    try {
      setIsUploadingProof(true);
      const formData = new FormData();
      formData.append('image', proofImage);
      
      const uploadRes = await fetch(`${BACKEND_URL}/upload/proof`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });
      
      const uploadData = await uploadRes.json();
      if (!uploadData.success) throw new Error(uploadData.message || 'Image upload failed');

      await submitPurchaseRequest({
        gameId: selectedGame._id,
        transactionId,
        amount: selectedGame.price,
        proofImage: uploadData.url
      }).unwrap();
      
      toast.success('Purchase request submitted! Waiting for admin approval.');
      setIsPurchaseModalOpen(false);
      setSelectedGame(null);
    } catch (err) {
      toast.error(err?.data?.message || err.message || 'Purchase submission failed.');
    } finally {
      setIsUploadingProof(false);
    }
  };

  const handleCoinPurchase = async () => {
    if (!user) return;
    try {
      await buyItemWithCoins({ gameId: selectedGame._id }).unwrap();
      
      const updatedUser = { ...user, rewardPoints: user.rewardPoints - selectedGame.price };
      dispatch(setCredentials({ user: updatedUser, accessToken: token }));
      
      toast.success('Successfully purchased using Coins! You can now play.');
      setIsPurchaseModalOpen(false);
      setSelectedGame(null);
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || err.message || 'Coin purchase failed.');
    }
  };

  const handleActionClick = (game) => {
    if (!game.isPaid) return window.open(game.githubLink, '_blank');
    
    const isAdmin = user && ['admin', 'superadmin'].includes(user.role);
    const hasPurchased = myRequestsRes?.data?.purchaseRequests?.some(p => p.game?._id === game._id && p.status === 'Approved');
    const isPending = myRequestsRes?.data?.purchaseRequests?.some(p => p.game?._id === game._id && p.status === 'Pending');

    if (isAdmin || hasPurchased) {
      return window.open(game.githubLink, '_blank');
    }

    if (isPending) {
      return toast.success('Your purchase is pending admin approval.');
    }

    setSelectedGame(game);
    setIsPurchaseModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3 bg-[#0A0A0A]">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest animate-pulse">Loading Arcade...</span>
      </div>
    );
  }

  return (
    <div className="bg-[#0A0A0A] min-h-screen text-white pb-24 md:pb-20 font-jakarta">
      <SEO title="Nexoria Arcade - Premium Games" />

      {/* 📱 MOBILE EXCLUSIVE: STICKY HEADER WITH BACK BUTTON */}
      <div className="md:hidden sticky top-0 z-50 bg-[#0A0A0A]/90 backdrop-blur-3xl border-b border-white/5 pt-4 pb-3 px-4 shadow-2xl mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-all active:scale-95 border border-white/5">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-black text-white leading-tight tracking-tight">Nexoria Arcade</h1>
              <p className="text-[9px] font-bold uppercase tracking-widest text-emerald-400/80">Premium Mobile Games</p>
            </div>
          </div>
          <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
            <Gamepad2 className="w-5 h-5 text-emerald-400" />
          </div>
        </div>
      </div>

      <div className="px-3 md:px-8 max-w-[1600px] mx-auto">
        {/* 💻 DESKTOP EXCLUSIVE: HUGE HERO BANNER */}
        <div className="hidden md:block mb-12 lg:mb-16 max-w-4xl relative group mt-8">
          <div className="absolute -inset-4 bg-gradient-to-r from-green-500/20 to-emerald-500/20 blur-2xl rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
          <div className="relative">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-4 tracking-tight flex items-center gap-4 transform group-hover:translate-x-2 transition-transform duration-500">
              <span className="text-5xl lg:text-6xl drop-shadow-2xl group-hover:rotate-12 transition-transform duration-500">🎮</span>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-emerald-400 drop-shadow-lg">Nexoria Arcade</span>
            </h1>
            <p className="text-slate-300 font-medium text-lg lg:text-xl max-w-2xl leading-relaxed transform group-hover:translate-x-2 transition-transform duration-500 delay-75">
              Level up with premium mobile and kids games, all unlocked and ready to play. 🚀✨
            </p>
          </div>
        </div>

        {games.length === 0 ? (
          <div className="text-center py-20 bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl">
            <p className="text-slate-500 font-medium text-lg">No games available right now. Check back later!</p>
          </div>
        ) : (
          /* MOBILE: 2-COLUMN DENSE GRID | DESKTOP: 3/4-COLUMN GRID */
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6">
            {games.map((game) => {
              const isAdmin = user && ['admin', 'superadmin'].includes(user.role);
              const hasPurchased = myRequestsRes?.data?.purchaseRequests?.some(p => p.game?._id === game._id && p.status === 'Approved');
              const isPending = myRequestsRes?.data?.purchaseRequests?.some(p => p.game?._id === game._id && p.status === 'Pending');
              const canPlay = !game.isPaid || isAdmin || hasPurchased;

              return (
              <div
                key={game._id}
                className="flex flex-col group bg-white/5 dark:bg-[#0A0A0A]/60 backdrop-blur-2xl rounded-2xl md:rounded-3xl overflow-hidden border border-slate-200/50 dark:border-white/10 transition-all hover:shadow-[0_20px_40px_rgba(16,185,129,0.2)] hover:border-emerald-500/50 hover:-translate-y-1 md:hover:-translate-y-2 relative"
              >
                <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/10 to-green-500/10 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-0"></div>
                
                {/* Banner / Logo Area */}
                <div className="relative aspect-video bg-black/20 overflow-hidden shrink-0">
                  {game.banner || game.logo ? (
                    <img
                      src={game.banner || game.logo}
                      alt={game.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-900/40 to-green-900/40">
                      <span className="text-3xl md:text-4xl font-bold text-emerald-500/50">{game.title?.charAt(0)}</span>
                    </div>
                  )}
                  
                  {/* Overlay gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-transparent"></div>
                  
                  {/* Version badge */}
                  {game.version && (
                    <div className="absolute top-2 right-2 md:top-3 md:right-3 bg-black/60 backdrop-blur-md px-1.5 py-0.5 md:px-2 md:py-1 rounded text-[8px] md:text-[10px] font-bold text-slate-300 border border-white/10 uppercase tracking-wider">
                      v{game.version}
                    </div>
                  )}
                  
                  {/* Aura Badge */}
                  {game.auraScore > 0 && (
                    <div className="absolute bottom-2 right-2 md:bottom-3 md:right-3 z-10 scale-75 md:scale-100 origin-bottom-right">
                      <AuraBadge score={game.auraScore} />
                    </div>
                  )}
                  
                  {/* Small Logo if banner exists */}
                  {game.banner && game.logo && (
                    <div className="absolute bottom-2 left-2 md:bottom-3 md:left-4 w-8 h-8 md:w-12 md:h-12 rounded-lg md:rounded-xl overflow-hidden border border-white/10 md:border-2 md:border-[#1a1a1f] shadow-lg bg-black">
                      <img src={game.logo} alt="" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>

                {/* Content Area */}
                <div className="p-2.5 md:p-4 flex flex-col flex-grow relative z-10">
                  <div className="flex items-start justify-between gap-1.5 md:gap-2 mb-1.5 md:mb-2">
                    <h3 className="text-[13px] md:text-lg font-bold text-white group-hover:text-emerald-400 transition-colors line-clamp-1 md:line-clamp-2 leading-tight">
                      {game.title}
                    </h3>
                    <div className="flex items-center gap-1 bg-amber-500/10 px-1 md:px-1.5 py-0.5 rounded shrink-0">
                      <Star className="w-2.5 h-2.5 md:w-3 md:h-3 text-amber-500 fill-amber-500" />
                      <span className="text-[10px] md:text-xs font-bold text-amber-500">{game.rating || '0'}</span>
                    </div>
                  </div>

                  {game.review && (
                    <p className="text-[10px] md:text-xs font-medium text-emerald-400/80 mb-1.5 md:mb-2 line-clamp-1 italic">
                      "{game.review}"
                    </p>
                  )}

                  <p className="text-[11px] md:text-sm text-white/50 line-clamp-2 mb-3 md:mb-4 leading-relaxed flex-grow">
                    {game.description || 'No description available.'}
                  </p>

                  <div className="flex flex-col gap-2 pt-2.5 md:pt-3 border-t border-white/5 mt-auto">
                    {game.videoUrl && (
                      <a 
                        href={game.videoUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="w-full flex items-center justify-center gap-1.5 py-1.5 md:py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-[10px] md:text-xs font-bold rounded-lg transition-colors border border-red-500/20 active:scale-95"
                      >
                        <Play className="w-3 h-3" /> <span className="hidden sm:inline">Watch</span> Trailer
                      </a>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] md:text-xs text-slate-500 flex items-center gap-1">
                        {game.isPaid ? (
                          <span className="text-amber-500 font-bold flex items-center gap-1 uppercase tracking-wider"><Lock className="w-2.5 h-2.5 md:w-3 md:h-3" /> <span className="hidden sm:inline">Premium</span><span className="sm:hidden">Pro</span></span>
                        ) : (
                          <span className="text-emerald-500 font-bold flex items-center gap-1 uppercase tracking-wider">Free</span>
                        )}
                      </span>
                      <button 
                        onClick={() => handleActionClick(game)}
                        disabled={isRequestsLoading}
                        className={`px-3 py-1.5 md:px-4 md:py-2 flex items-center gap-1 md:gap-1.5 text-[10px] md:text-xs font-bold rounded-lg transition-all active:scale-95 ${
                          canPlay 
                            ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_20px_rgba(16,185,129,0.5)]' 
                            : isPending
                              ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20 cursor-wait'
                              : 'bg-white/10 text-white border border-white/10 hover:bg-white/20'
                        }`}
                      >
                        {canPlay ? (
                          <>Play <ExternalLink className="w-3 h-3 hidden sm:block" /></>
                        ) : isPending ? (
                          <>Pending</>
                        ) : (
                          <>Buy</>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )})}
          </div>
        )}
      </div>

      <PurchaseErrorBoundary>
        <QRPaymentModal
          isOpen={isPurchaseModalOpen}
          onClose={() => {
            setIsPurchaseModalOpen(false);
            setSelectedGame(null);
          }}
          amount={selectedGame?.price}
          itemName={selectedGame?.title}
          onSubmit={handlePurchaseSubmit}
          isSubmitting={isSubmittingPurchase || isUploadingProof || isBuyingWithCoins}
          userCoins={user?.rewardPoints}
          onCoinPurchase={handleCoinPurchase}
        />
      </PurchaseErrorBoundary>
    </div>
  );
};

export default Games;
