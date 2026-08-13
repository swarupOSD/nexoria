import React, { useState, useEffect } from 'react';
import { useGetGamesQuery } from '../features/games/gameApiSlice';
import { useGetMyRequestsQuery, useSubmitPurchaseRequestMutation, useBuyItemWithCoinsMutation } from '../features/api/paymentApiSlice';
import { useSelector, useDispatch } from 'react-redux';
import { setCredentials } from '../features/auth/authSlice';
import { useNavigate } from 'react-router-dom';
import { ExternalLink, Star, Play, Lock, ArrowLeft, Gamepad2, Info, ArrowRight } from 'lucide-react';
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
  
  // Details Modal State
  const [detailGame, setDetailGame] = useState(null);

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
  
  const getPlayStatus = (game) => {
    const isAdmin = user && ['admin', 'superadmin'].includes(user.role);
    const hasPurchased = myRequestsRes?.data?.purchaseRequests?.some(p => p.game?._id === game._id && p.status === 'Approved');
    const isPending = myRequestsRes?.data?.purchaseRequests?.some(p => p.game?._id === game._id && p.status === 'Pending');
    const canPlay = !game.isPaid || isAdmin || hasPurchased;
    return { canPlay, isPending };
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3 bg-background">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
        <span className="font-label-sm text-[10px] text-primary uppercase tracking-widest animate-pulse">Loading Nexoria Games...</span>
      </div>
    );
  }

  const featuredGame = games.length > 0 ? games[0] : null;
  const trendingGames = games.slice(1, 5);
  const otherGames = games.slice(5);

  return (
    <div className="bg-background min-h-screen text-on-surface font-body-md overflow-x-hidden selection:bg-primary-container selection:text-on-primary-container">
      <SEO title="Nexoria Games - Premium Experience" />

      {/* 📱 MOBILE EXCLUSIVE: STICKY HEADER WITH BACK BUTTON */}
      <div className="md:hidden sticky top-0 z-50 bg-background/90 backdrop-blur-3xl border-b border-outline-variant/30 pt-4 pb-3 px-4 shadow-2xl mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="p-2 rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface transition-all active:scale-95 border border-outline-variant/30">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="font-display-lg text-xl text-on-surface leading-tight tracking-tight">Nexoria Games</h1>
              <p className="font-label-sm text-[9px] uppercase tracking-widest text-primary">Premium Catalog</p>
            </div>
          </div>
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 cursor-pointer" onClick={() => navigate('/nexoria-arena')}>
            <Gamepad2 className="w-5 h-5 text-primary" />
          </div>
        </div>
      </div>

      {games.length === 0 ? (
        <div className="text-center py-20 bg-surface-container/50 backdrop-blur-xl rounded-3xl border border-outline-variant/30 shadow-2xl max-w-4xl mx-auto mt-12 px-4">
          <p className="font-body-md text-on-surface-variant text-lg">No games available right now. Check back later!</p>
        </div>
      ) : (
        <>
          {/* HERO SECTION */}
          {featuredGame && (
            <header className="relative w-full h-[600px] md:h-[800px] flex items-end pb-16 md:pb-32 px-4 md:px-margin-desktop">
              <div className="absolute inset-0 z-0">
                <div 
                  className="absolute inset-0 bg-cover bg-center" 
                  style={{ backgroundImage: `url(${featuredGame.banner || featuredGame.logo || '/default-hero.jpg'})` }}
                ></div>
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent"></div>
              </div>
              
              <div className="relative z-10 w-full max-w-container-max mx-auto flex flex-col md:flex-row justify-between items-end gap-gutter">
                <div className="max-w-2xl">
                  {featuredGame.version && (
                    <span className="font-label-sm text-label-sm text-tertiary uppercase tracking-widest mb-4 block px-3 py-1 border border-tertiary/30 bg-tertiary/10 rounded backdrop-blur-md w-max">
                      v{featuredGame.version} Release
                    </span>
                  )}
                  <h1 className="font-display-lg text-4xl md:text-display-lg text-on-surface mb-4 md:mb-6 drop-shadow-2xl">
                    {featuredGame.title}
                  </h1>
                  <p className="font-body-md text-on-surface-variant mb-6 md:mb-8 max-w-xl text-sm md:text-lg opacity-90 line-clamp-3">
                    {featuredGame.description || 'Experience the ultimate gameplay.'}
                  </p>
                  <div className="flex flex-wrap gap-4">
                    {(() => {
                      const { canPlay, isPending } = getPlayStatus(featuredGame);
                      return (
                        <button 
                          onClick={() => handleActionClick(featuredGame)}
                          disabled={isRequestsLoading || isPending}
                          className="relative overflow-hidden bg-primary text-on-primary font-label-sm text-label-sm uppercase tracking-widest px-8 py-4 rounded flex items-center gap-2 hover:bg-primary-fixed transition-colors shadow-[0_0_20px_rgba(208,188,255,0.2)] font-bold active:scale-95"
                        >
                          <Play className="w-5 h-5 fill-current" />
                          {canPlay ? 'Play Now' : isPending ? 'Pending' : `Buy ₹${featuredGame.price}`}
                        </button>
                      );
                    })()}
                    <button 
                      onClick={() => setDetailGame(featuredGame)}
                      className="bg-surface-container/50 backdrop-blur-md border border-outline-variant/30 font-label-sm text-label-sm uppercase tracking-widest px-8 py-4 rounded text-on-surface flex items-center gap-2 hover:bg-surface-container transition-colors active:scale-95"
                    >
                      <Info className="w-5 h-5" />
                      Details
                    </button>
                  </div>
                </div>
                
                {/* Desktop Quick Stats */}
                <div className="hidden lg:flex flex-col gap-4 text-right">
                  {featuredGame.auraScore > 0 && (
                    <div className="bg-surface-container/50 backdrop-blur-md border border-outline-variant/30 p-4 rounded-lg flex items-center justify-end gap-3">
                      <div className="text-right">
                        <span className="font-label-sm text-[10px] text-on-surface-variant uppercase tracking-widest block">Aura Rank</span>
                        <span className="font-headline-lg text-2xl text-on-surface">{featuredGame.auraScore}</span>
                      </div>
                      <Star className="w-8 h-8 text-secondary fill-secondary" />
                    </div>
                  )}
                  <div className="bg-surface-container/50 backdrop-blur-md border border-outline-variant/30 p-4 rounded-lg flex items-center justify-end gap-3">
                    <div className="text-right">
                      <span className="font-label-sm text-[10px] text-on-surface-variant uppercase tracking-widest block">User Rating</span>
                      <span className="font-headline-lg text-2xl text-tertiary">{featuredGame.rating || 'N/A'}</span>
                    </div>
                    <Star className="w-8 h-8 text-tertiary fill-tertiary" />
                  </div>
                </div>
              </div>
            </header>
          )}

          <main className="w-full max-w-container-max mx-auto px-4 md:px-margin-desktop py-12 md:py-24 space-y-24">
            
            {/* NEXORIA ARENA HIGHLIGHT */}
            <section className="relative w-full rounded-2xl overflow-hidden border border-primary/20 bg-surface-container-lowest">
              <div className="absolute inset-0 z-0 opacity-20">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-transparent to-transparent"></div>
              </div>
              <div className="relative z-10 p-8 md:p-16 flex flex-col md:flex-row items-center justify-between gap-8 bg-gradient-to-r from-background via-background/60 to-transparent">
                <div className="max-w-xl">
                  <h2 className="font-display-lg text-3xl md:text-5xl text-on-surface mb-4">NEXORIA <span className="text-primary font-light italic">ARENA</span></h2>
                  <p className="font-body-md text-on-surface-variant text-sm md:text-lg mb-8">
                    The ultimate proving ground. Compete in live multiplayer matches, climb the global leaderboards, and test your skills.
                  </p>
                  <button 
                    onClick={() => navigate('/nexoria-arena')}
                    className="bg-surface-container border border-primary/30 text-primary hover:border-primary font-label-sm text-label-sm uppercase tracking-widest px-8 py-4 rounded flex items-center gap-2 transition-all duration-300 hover:shadow-[0_0_20px_rgba(208,188,255,0.2)] active:scale-95 w-max"
                  >
                    Enter The Arena
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
                <div className="hidden md:flex w-32 h-32 md:w-48 md:h-48 rounded-full border border-primary/20 bg-primary/5 items-center justify-center backdrop-blur-md shadow-[0_0_50px_rgba(208,188,255,0.1)] shrink-0">
                  <Gamepad2 className="w-16 h-16 md:w-24 md:h-24 text-primary font-light" />
                </div>
              </div>
            </section>

            {/* TRENDING GAMES (BENTO) */}
            {trendingGames.length > 0 && (
              <section>
                <div className="flex justify-between items-end mb-8 border-b border-outline-variant/30 pb-4">
                  <h2 className="font-display-lg text-2xl md:text-headline-lg text-on-surface">Trending</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-12 gap-unit auto-rows-[250px]">
                  {trendingGames.map((game, i) => {
                    const { canPlay, isPending } = getPlayStatus(game);
                    const isLarge = i === 0;
                    return (
                      <div 
                        key={game._id}
                        onClick={() => setDetailGame(game)}
                        className={`${isLarge ? 'md:col-span-8 md:row-span-2' : 'md:col-span-4'} bg-surface-container/30 backdrop-blur-3xl border border-outline-variant/20 rounded-xl relative overflow-hidden group cursor-pointer transition-all duration-400 hover:border-outline-variant/50 hover:-translate-y-1 hover:shadow-[0_0_40px_rgba(208,188,255,0.1)]`}
                      >
                        <div 
                          className="absolute inset-0 bg-cover bg-center opacity-50 group-hover:opacity-70 transition-opacity duration-500 group-hover:scale-105 transform" 
                          style={{ backgroundImage: `url(${game.banner || game.logo || '/default-game.jpg'})` }}
                        ></div>
                        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent"></div>
                        <div className="absolute bottom-0 left-0 p-6 md:p-8 w-full">
                          <div className="flex items-center gap-2 mb-3">
                            <span className="px-2 py-1 bg-surface-container/50 text-on-surface font-label-sm text-[10px] uppercase tracking-widest rounded border border-outline-variant/30 backdrop-blur-sm">
                              {game.isPaid ? 'Premium' : 'Free'}
                            </span>
                            {game.rating && (
                              <span className="px-2 py-1 bg-tertiary/10 text-tertiary font-label-sm text-[10px] uppercase tracking-widest rounded border border-tertiary/20 backdrop-blur-sm flex items-center gap-1">
                                <Star className="w-3 h-3 fill-current" /> {game.rating}
                              </span>
                            )}
                          </div>
                          <h3 className={`font-display-lg ${isLarge ? 'text-3xl md:text-4xl' : 'text-2xl'} text-on-surface mb-2`}>{game.title}</h3>
                          {isLarge && (
                            <p className="font-body-md text-on-surface-variant max-w-md hidden md:block line-clamp-2">
                              {game.description}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* ALL GAMES GRID */}
            {otherGames.length > 0 && (
              <section>
                <div className="flex justify-between items-end mb-8 border-b border-outline-variant/30 pb-4">
                  <h2 className="font-display-lg text-2xl md:text-headline-lg text-on-surface">More Experiences</h2>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                  {otherGames.map((game) => {
                    const { canPlay, isPending } = getPlayStatus(game);
                    return (
                      <div 
                        key={game._id}
                        onClick={() => setDetailGame(game)}
                        className="bg-surface-container/30 backdrop-blur-xl rounded-xl overflow-hidden border border-outline-variant/20 group cursor-pointer transition-all duration-400 hover:border-outline-variant/50 hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(208,188,255,0.05)] flex flex-col"
                      >
                        <div className="aspect-[4/3] w-full bg-surface-container relative overflow-hidden">
                          <img 
                            src={game.banner || game.logo} 
                            alt={game.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            onError={(e) => { e.target.src = 'https://via.placeholder.com/400x300?text=Game'; }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent opacity-80"></div>
                          {game.auraScore > 0 && (
                            <div className="absolute bottom-2 right-2 scale-75 origin-bottom-right">
                              <AuraBadge score={game.auraScore} />
                            </div>
                          )}
                          <div className="absolute top-2 right-2 bg-background/60 backdrop-blur-md px-2 py-1 rounded text-[8px] font-bold text-on-surface-variant border border-outline-variant/30 uppercase tracking-widest">
                            {game.isPaid ? 'Premium' : 'Free'}
                          </div>
                        </div>
                        <div className="p-4 flex flex-col flex-1">
                          <h3 className="font-display-lg text-lg text-on-surface truncate mb-1">{game.title}</h3>
                          <p className="font-body-md text-xs text-on-surface-variant line-clamp-2 mb-4 flex-1">
                            {game.description}
                          </p>
                          <div className="flex items-center justify-between mt-auto border-t border-outline-variant/20 pt-3">
                            <span className="font-label-sm text-[10px] text-tertiary flex items-center gap-1 uppercase tracking-widest">
                              <Star className="w-3 h-3 fill-current" /> {game.rating || 'N/A'}
                            </span>
                            <span className="font-label-sm text-xs text-primary font-bold">
                              {canPlay ? 'PLAY' : isPending ? 'PENDING' : 'VIEW'}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}
          </main>
        </>
      )}

      {/* GAME DETAIL MODAL */}
      <PurchaseErrorBoundary>
        {detailGame && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" onClick={() => setDetailGame(null)}></div>
            <div className="bg-surface-container border border-outline-variant/30 rounded-2xl w-full max-w-4xl relative z-10 overflow-hidden flex flex-col max-h-[90vh]">
              
              <div className="relative h-48 md:h-64 shrink-0">
                <div 
                  className="absolute inset-0 bg-cover bg-center" 
                  style={{ backgroundImage: `url(${detailGame.banner || detailGame.logo || '/default-hero.jpg'})` }}
                ></div>
                <div className="absolute inset-0 bg-gradient-to-t from-surface-container to-transparent"></div>
                <button 
                  onClick={() => setDetailGame(null)}
                  className="absolute top-4 right-4 z-20 p-2 bg-surface-container-high/50 hover:bg-surface-container-high text-on-surface rounded-full backdrop-blur-md transition-colors border border-outline-variant/30"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 md:p-8 flex flex-col flex-1 overflow-y-auto no-scrollbar relative -mt-20">
                <div className="flex items-end gap-4 md:gap-6 mb-6">
                  {detailGame.logo && (
                    <div className="w-24 h-24 md:w-32 md:h-32 rounded-xl overflow-hidden border border-outline-variant/30 shadow-2xl bg-surface-container-low shrink-0 relative z-10">
                      <img src={detailGame.logo} alt="Logo" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="flex-1 relative z-10 mb-2">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-1 bg-surface-container-high text-on-surface font-label-sm text-[10px] uppercase tracking-widest rounded border border-outline-variant/30">
                        {detailGame.isPaid ? 'Premium' : 'Free'}
                      </span>
                      {detailGame.version && (
                        <span className="font-label-sm text-[10px] text-on-surface-variant uppercase tracking-widest">v{detailGame.version}</span>
                      )}
                    </div>
                    <h2 className="font-display-lg text-3xl md:text-4xl text-on-surface">{detailGame.title}</h2>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="md:col-span-2 space-y-6">
                    <div>
                      <h3 className="font-label-sm text-xs text-primary uppercase tracking-widest mb-2">About Game</h3>
                      <p className="font-body-md text-on-surface-variant text-sm md:text-base leading-relaxed">
                        {detailGame.description || 'No description provided.'}
                      </p>
                    </div>
                    
                    {detailGame.review && (
                      <div className="p-4 bg-surface-container-low border border-outline-variant/20 rounded-xl border-l-2 border-l-tertiary">
                        <p className="font-body-md text-on-surface italic text-sm">"{detailGame.review}"</p>
                        <p className="font-label-sm text-[10px] text-on-surface-variant uppercase tracking-widest mt-2">— Editor's Note</p>
                      </div>
                    )}

                    {detailGame.videoUrl && (
                      <div>
                        <a 
                          href={detailGame.videoUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 bg-surface-container-high hover:bg-surface-bright text-on-surface border border-outline-variant/30 rounded font-label-sm text-xs uppercase tracking-widest transition-colors active:scale-95"
                        >
                          <Play className="w-4 h-4" /> Watch Trailer
                        </a>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-4">
                    <div className="p-4 bg-surface-container-low border border-outline-variant/20 rounded-xl">
                      <h3 className="font-label-sm text-[10px] text-on-surface-variant uppercase tracking-widest mb-3">Stats</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="font-body-md text-sm text-on-surface-variant">Rating</span>
                          <span className="font-body-md text-sm text-tertiary font-bold flex items-center gap-1"><Star className="w-3 h-3 fill-current" /> {detailGame.rating || 'N/A'}</span>
                        </div>
                        {detailGame.auraScore > 0 && (
                          <div className="flex justify-between items-center">
                            <span className="font-body-md text-sm text-on-surface-variant">Aura Rank</span>
                            <AuraBadge score={detailGame.auraScore} />
                          </div>
                        )}
                        <div className="flex justify-between items-center">
                          <span className="font-body-md text-sm text-on-surface-variant">Price</span>
                          <span className="font-body-md text-sm text-on-surface font-bold">
                            {detailGame.isPaid ? `₹${detailGame.price}` : 'Free'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2">
                      {(() => {
                        const { canPlay, isPending } = getPlayStatus(detailGame);
                        return (
                          <button 
                            onClick={() => {
                              handleActionClick(detailGame);
                            }}
                            disabled={isRequestsLoading || isPending}
                            className="w-full bg-primary text-on-primary py-4 rounded font-label-sm text-xs uppercase tracking-widest hover:bg-primary-fixed transition-colors disabled:opacity-50 flex items-center justify-center gap-2 font-bold active:scale-95 shadow-[0_0_20px_rgba(208,188,255,0.15)]"
                          >
                            {canPlay ? (
                              <><Play className="w-4 h-4 fill-current" /> Play Now</>
                            ) : isPending ? (
                              'Purchase Pending'
                            ) : (
                              `Buy for ₹${detailGame.price}`
                            )}
                          </button>
                        );
                      })()}
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}
      </PurchaseErrorBoundary>

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
