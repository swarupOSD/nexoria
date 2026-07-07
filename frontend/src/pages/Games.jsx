import React, { useState } from 'react';
import { useGetGamesQuery } from '../features/games/gameApiSlice';
import { useGetMyRequestsQuery, useSubmitPurchaseRequestMutation, useBuyItemWithCoinsMutation } from '../features/api/paymentApiSlice';
import { useSelector, useDispatch } from 'react-redux';
import { setCredentials } from '../features/auth/authSlice';
import { useNavigate } from 'react-router-dom';
import { ExternalLink, Star, Play, ShoppingCart, Lock } from 'lucide-react';
import QRPaymentModal from '../components/QRPaymentModal';
import PurchaseErrorBoundary from '../components/ErrorBoundaries/PurchaseErrorBoundary';
import toast from 'react-hot-toast';
import { AuraBadge } from '../components/AuraScore';

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

  const handlePurchaseSubmit = async ({ transactionId, proofImage }) => {
    if (!user) {
      toast.error('Please log in to submit your payment.');
      return navigate('/login?redirect=/moviebox/games');
    }
    
    try {
      setIsUploadingProof(true);
      const formData = new FormData();
      formData.append('image', proofImage);
      
      const uploadRes = await fetch('/api/upload/proof', {
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
      
      // Update local user coin balance (deduct)
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
      <div className="p-8 flex justify-center items-center min-h-[50vh]">
        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8">
      <div className="mb-12 sm:mb-16 max-w-4xl relative group">
        <div className="absolute -inset-4 bg-gradient-to-r from-green-500/20 to-emerald-500/20 blur-2xl rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
        <div className="relative">
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight flex items-center gap-3 transform group-hover:translate-x-2 transition-transform duration-500">
            <span className="text-5xl drop-shadow-2xl group-hover:rotate-12 transition-transform duration-500">🎮</span>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-emerald-400 drop-shadow-lg">Nexoria Arcade</span>
          </h1>
          <p className="text-slate-300 font-medium text-lg max-w-2xl leading-relaxed transform group-hover:translate-x-2 transition-transform duration-500 delay-75">
            Level up with premium mobile and kids games, all unlocked and ready to play. 🚀✨
          </p>
        </div>
      </div>

      {games.length === 0 ? (
        <div className="text-center py-20 bg-[#1a1a1f] rounded-2xl border border-white/5">
          <p className="text-slate-500">No games available right now. Check back later!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {games.map((game) => {
            const isAdmin = user && ['admin', 'superadmin'].includes(user.role);
            const hasPurchased = myRequestsRes?.data?.purchaseRequests?.some(p => p.game?._id === game._id && p.status === 'Approved');
            const isPending = myRequestsRes?.data?.purchaseRequests?.some(p => p.game?._id === game._id && p.status === 'Pending');
            const canPlay = !game.isPaid || isAdmin || hasPurchased;

            return (
            <div
              key={game._id}
              className="block group bg-[#1a1a1f] rounded-2xl overflow-hidden border border-white/5 hover:border-purple-500/30 transition-all hover:shadow-lg hover:shadow-purple-500/10 hover:-translate-y-1"
            >
              {/* Banner / Logo Area */}
              <div className="relative aspect-video bg-black/50 overflow-hidden">
                {game.banner || game.logo ? (
                  <img
                    src={game.banner || game.logo}
                    alt={game.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-900/40 to-blue-900/40">
                    <span className="text-4xl font-bold text-purple-500/50">{game.title?.charAt(0)}</span>
                  </div>
                )}
                
                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1f] via-transparent to-transparent"></div>
                
                {/* Version badge */}
                {game.version && (
                  <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-2 py-1 rounded text-[10px] font-bold text-slate-300 border border-white/10">
                    v{game.version}
                  </div>
                )}
                
                {/* Aura Badge */}
                {game.auraScore > 0 && (
                  <div className="absolute bottom-3 right-3 z-10">
                    <AuraBadge score={game.auraScore} />
                  </div>
                )}
                
                {/* Small Logo if banner exists */}
                {game.banner && game.logo && (
                  <div className="absolute bottom-3 left-4 w-12 h-12 rounded-xl overflow-hidden border-2 border-[#1a1a1f] shadow-lg bg-black">
                    <img src={game.logo} alt="" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="text-lg font-bold text-white group-hover:text-purple-400 transition-colors line-clamp-1">
                    {game.title}
                  </h3>
                  <div className="flex items-center gap-1 bg-amber-500/10 px-1.5 py-0.5 rounded shrink-0">
                    <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                    <span className="text-xs font-bold text-amber-500">{game.rating || '0'}</span>
                  </div>
                </div>

                {game.review && (
                  <p className="text-xs font-medium text-purple-400 mb-2 line-clamp-1">
                    "{game.review}"
                  </p>
                )}

                <p className="text-sm text-slate-400 line-clamp-2 mb-4">
                  {game.description || 'No description available.'}
                </p>

                <div className="flex flex-col gap-2 pt-3 border-t border-white/5 mt-auto">
                  {game.videoUrl && (
                    <a 
                      href={game.videoUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center gap-2 py-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white text-xs font-bold rounded-lg transition-colors border border-red-500/20"
                    >
                      <Play className="w-3 h-3" /> Watch Trailer
                    </a>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      {game.isPaid ? (
                        <span className="text-amber-500 font-bold flex items-center gap-1"><Lock className="w-3 h-3" /> Premium</span>
                      ) : (
                        <span className="text-emerald-500 font-bold flex items-center gap-1">Free</span>
                      )}
                    </span>
                    <button 
                      onClick={() => handleActionClick(game)}
                      disabled={isRequestsLoading}
                      className={`px-4 py-2 flex items-center gap-1.5 text-xs font-bold rounded-lg transition-colors ${
                        canPlay 
                          ? 'bg-purple-600/10 text-purple-400 hover:bg-purple-600 hover:text-white border border-purple-500/20' 
                          : isPending
                            ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20 cursor-wait'
                            : 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white border border-emerald-500/20'
                      }`}
                    >
                      {canPlay ? (
                        <>Play Now <ExternalLink className="w-3 h-3" /></>
                      ) : isPending ? (
                        'Pending Approval'
                      ) : (
                        <><ShoppingCart className="w-3 h-3" /> Buy (₹{game.price})</>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )})}
        </div>
      )}

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
