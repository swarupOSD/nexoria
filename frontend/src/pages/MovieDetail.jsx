import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { 
  useGetMovieBySlugQuery,
  useIncrementMovieDownloadMutation,
  useIncrementMovieWatchMutation,
  useGetMovieReviewsQuery,
  useAddMovieReviewMutation
} from '../features/movie/movieApiSlice';
import { useGetWatchHistoryQuery, useUpdateWatchHistoryMutation } from '../features/api/watchHistoryApiSlice';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, Download, Star, Clock, Calendar, Globe,
  Film, Users, Loader2, ChevronLeft, Video, MessageSquare
} from 'lucide-react';
import { useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';

const MovieDetail = () => {
  const { slug } = useParams();
  const { user } = useSelector(state => state.auth);
  
  const { data: res, isLoading, isFetching } = useGetMovieBySlugQuery(slug);
  const [incrementDownload] = useIncrementMovieDownloadMutation();
  const [incrementWatch] = useIncrementMovieWatchMutation();
  const [addReview] = useAddMovieReviewMutation();

  const [activeTab, setActiveTab] = useState('watch'); // watch, download, story, cast, reviews
  const [showTrailer, setShowTrailer] = useState(false);
  const [hasWatched, setHasWatched] = useState(false);
  const videoRef = useRef(null);
  const lastSyncTimeRef = useRef(0);

  const movie = res?.data;
  const relatedMovies = res?.related || [];

  const { data: historyRes } = useGetWatchHistoryQuery(undefined, { skip: !user });
  const [updateWatchHistory] = useUpdateWatchHistoryMutation();

  const { data: reviewsRes, isLoading: reviewsLoading } = useGetMovieReviewsQuery({ id: movie?._id }, { skip: !movie?._id });
  const reviews = reviewsRes?.data || [];
  
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  const getEmbedUrl = (url) => {
    if (!url) return '';
    const ytRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(ytRegex);
    if (match && match[1]) {
      return `https://www.youtube.com/embed/${match[1]}?autoplay=1`;
    }
    return url;
  };

  // Simulate registering a "watch" event when component mounts or tab switches to watch
  useEffect(() => {
    if (movie && activeTab === 'watch' && !hasWatched) {
      incrementWatch(movie._id);
      setHasWatched(true);
    }
  }, [movie, activeTab, hasWatched, incrementWatch]);

  // Set initial video progress
  useEffect(() => {
    if (movie && videoRef.current && historyRes?.data) {
      const historyItem = historyRes.data.find(h => h.movie?._id === movie._id);
      if (historyItem && historyItem.progress > 0 && !historyItem.completed) {
        // Only set it once when video metadata is loaded
        const handleLoadedMetadata = () => {
          if (videoRef.current && Math.abs(videoRef.current.currentTime - historyItem.progress) > 5) {
             videoRef.current.currentTime = historyItem.progress;
          }
        };
        videoRef.current.addEventListener('loadedmetadata', handleLoadedMetadata);
        return () => {
          if (videoRef.current) {
            videoRef.current.removeEventListener('loadedmetadata', handleLoadedMetadata);
          }
        };
      }
    }
  }, [movie, historyRes]);

  const handleTimeUpdate = () => {
    if (!videoRef.current || !user || !movie) return;
    
    const currentTime = videoRef.current.currentTime;
    const duration = videoRef.current.duration;
    
    // Sync every 10 seconds
    if (currentTime - lastSyncTimeRef.current >= 10 || (duration - currentTime < 2 && lastSyncTimeRef.current !== duration)) {
      updateWatchHistory({
        movieId: movie._id,
        progress: currentTime,
        duration: duration || 100 // fallback to avoid NaN
      });
      lastSyncTimeRef.current = currentTime;
    }
  };

  const handleDownload = async (link) => {
    try {
      if (link.url) {
        window.open(link.url, '_blank');
        await incrementDownload(movie._id);
      }
    } catch (error) {
      console.error('Download tracking failed', error);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('You must be logged in to review');
      return;
    }
    try {
      await addReview({ id: movie._id, rating, comment }).unwrap();
      toast.success('Review submitted successfully!');
      setComment('');
      setRating(5);
    } catch (err) {
      toast.error(err.data?.message || 'Failed to submit review');
    }
  };

  if (isLoading || isFetching) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] text-purple-500">
        <Loader2 className="w-12 h-12 animate-spin mb-4" />
        <p className="font-medium text-slate-400">Loading movie...</p>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] text-white">
        <Video className="w-16 h-16 text-slate-600 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Movie Not Found</h2>
        <p className="text-slate-500 mb-6">The movie you're looking for doesn't exist or was removed.</p>
        <Link to="/moviebox" className="px-6 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium transition-colors">
          Go Back
        </Link>
      </div>
    );
  }

  const isPremium = movie.appType === 'Premium';
  const hasAccess = !isPremium || (user && user.purchasedMovies?.includes(movie._id)) || (user && user.role === 'superadmin');

  return (
    <div className="pb-20 text-white min-h-screen">
      <Helmet>
        <title>{movie.seoTitle || `${movie.title} - Watch Free`}</title>
        <meta name="description" content={movie.seoDescription || movie.shortDescription} />
      </Helmet>

      {/* Hero Banner Area */}
      <div className="relative w-full h-[50vh] md:h-[70vh] bg-[#111]">
        <img 
          src={movie.bannerImage || movie.posterImage} 
          alt="Banner" 
          className="w-full h-full object-cover object-top opacity-50"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-[#050505]/50 to-transparent" />
        
        {/* Back Button */}
        <Link to="/moviebox" className="absolute top-6 left-6 flex items-center gap-2 text-slate-300 hover:text-white bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 transition-all hover:bg-black/60 z-20">
          <ChevronLeft className="w-4 h-4" /> Back
        </Link>

        {/* Hero Content */}
        <div className="absolute bottom-0 left-0 right-0 p-6 md:px-12 lg:px-24 pb-12 flex flex-col md:flex-row gap-8 items-end max-w-7xl mx-auto w-full">
          {/* Poster */}
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            className="hidden md:block w-48 lg:w-64 shrink-0 rounded-2xl overflow-hidden shadow-2xl shadow-black/50 border border-white/10 z-10"
          >
            <img src={movie.posterImage} alt={movie.title} className="w-full h-auto aspect-[2/3] object-cover" />
          </motion.div>

          {/* Info */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="flex-1 z-10 w-full"
          >
            {movie.originalTitle && <p className="text-purple-400 text-sm font-bold tracking-widest uppercase mb-1">{movie.originalTitle}</p>}
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-white mb-4 leading-tight">
              {movie.title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-3 md:gap-6 text-sm font-medium text-slate-300 mb-6">
              <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-lg backdrop-blur-md border border-white/5">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" /> 
                <span className="text-white font-bold">{movie.imdbRating > 0 ? movie.imdbRating.toFixed(1) : 'NR'}</span> IMDB
              </span>
              <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-purple-400" /> {movie.releaseYear || 'TBA'}</span>
              <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-purple-400" /> {movie.runtime || 'N/A'}</span>
              <span className="flex items-center gap-1.5"><Globe className="w-4 h-4 text-purple-400" /> {movie.country || 'Unknown'}</span>
              {movie.quality?.[0] && <span className="px-2 py-0.5 border border-purple-500/50 text-purple-400 rounded text-xs">{movie.quality[0]}</span>}
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
              {movie.genre?.map(g => (
                <Link key={g} to={`/moviebox/search?genre=${g}`} className="px-3 py-1 bg-white/5 hover:bg-purple-600/20 hover:text-purple-400 border border-white/10 rounded-full text-xs font-medium transition-colors">
                  {g}
                </Link>
              ))}
            </div>

            <div className="flex items-center gap-4">
              <button 
                onClick={() => {
                  setActiveTab('watch');
                  window.scrollBy({ top: 500, behavior: 'smooth' });
                }}
                className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold transition-colors shadow-xl shadow-purple-600/30"
              >
                <Play className="w-5 h-5 fill-white" /> Play Movie
              </button>
              <Link 
                to={`/moviebox/watch-party/${movie.slug}`}
                className="flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold transition-colors shadow-xl shadow-amber-500/30"
              >
                <Users className="w-5 h-5 fill-amber-500 text-white" /> Watch Party
              </Link>
              {movie.trailerUrl && (
                <button 
                  onClick={() => setShowTrailer(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold backdrop-blur-md transition-colors border border-white/10"
                >
                  <Video className="w-5 h-5" /> Trailer
                </button>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 md:px-12 lg:px-24 py-12 flex flex-col lg:flex-row gap-12">
        
        {/* Left Column (Main) */}
        <div className="flex-1 min-w-0">
          
          {/* Tabs */}
          <div className="flex gap-2 overflow-x-auto custom-scrollbar mb-8 border-b border-white/10 pb-4">
            {[
              { id: 'watch', label: 'Watch Stream', icon: Play },
              { id: 'download', label: 'Download', icon: Download },
              { id: 'story', label: 'Story & Info', icon: Film },
              { id: 'cast', label: 'Cast & Crew', icon: Users },
              { id: 'reviews', label: 'Reviews', icon: MessageSquare },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-colors whitespace-nowrap ${
                  activeTab === tab.id 
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20' 
                    : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
                }`}
              >
                <tab.icon className="w-4 h-4" /> {tab.label}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'watch' && (
                <div className="space-y-6">
                  {!hasAccess ? (
                    <div className="bg-[#111] border border-amber-500/20 rounded-2xl p-8 text-center">
                      <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Star className="w-8 h-8 text-amber-500 fill-amber-500" />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2">Premium Movie</h3>
                      <p className="text-slate-400 mb-6">You need to purchase this movie to watch or download it.</p>
                      <button 
                        onClick={() => toast('Purchase flow coming soon!')}
                        className="px-8 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold shadow-lg shadow-amber-500/20 transition-colors"
                      >
                        Buy Now for ${movie.price}
                      </button>
                    </div>
                  ) : (
                    <div className="aspect-video w-full bg-black rounded-2xl overflow-hidden shadow-2xl border border-white/10 relative">
                      {movie.videoFile || movie.videoUrl ? (
                        <video 
                          ref={videoRef}
                          controls 
                          controlsList="nodownload"
                          poster={movie.bannerImage || movie.posterImage}
                          className="w-full h-full"
                          src={movie.videoFile || movie.videoUrl}
                          onTimeUpdate={handleTimeUpdate}
                        >
                          Your browser does not support the video tag.
                        </video>
                      ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#111]">
                          <Video className="w-12 h-12 text-slate-600 mb-4" />
                          <p className="text-slate-500 font-medium">No streaming source available</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'download' && (
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-white">Download Links</h3>
                  {!hasAccess ? (
                     <div className="p-6 bg-[#111] border border-amber-500/20 rounded-xl text-center">
                       <p className="text-amber-500 font-medium">Purchase required to view download links.</p>
                     </div>
                  ) : movie.downloadLinks && movie.downloadLinks.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {movie.downloadLinks.map((link, idx) => link.isActive && (
                        <button
                          key={idx}
                          onClick={() => handleDownload(link)}
                          className="flex items-center justify-between p-4 bg-[#111] hover:bg-white/5 border border-white/10 rounded-xl transition-colors group text-left"
                        >
                          <div>
                            <p className="font-bold text-white group-hover:text-purple-400 transition-colors">{link.label || `Server ${idx + 1}`}</p>
                            <p className="text-xs text-slate-500 mt-1">{movie.fileSize || 'Unknown Size'}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="px-2 py-1 bg-white/10 text-white text-xs font-bold rounded">{link.quality}</span>
                            <div className="w-10 h-10 rounded-full bg-purple-600/10 flex items-center justify-center group-hover:bg-purple-600 transition-colors">
                              <Download className="w-4 h-4 text-purple-500 group-hover:text-white transition-colors" />
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 bg-[#111] rounded-xl text-center border border-white/5">
                      <p className="text-slate-500">No download links available currently.</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'story' && (
                <div className="space-y-8">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-4">Synopsis</h3>
                    <div 
                      className="text-slate-300 leading-relaxed space-y-4"
                      dangerouslySetInnerHTML={{ __html: movie.description }}
                    />
                  </div>
                  
                  {movie.galleryImages && movie.galleryImages.length > 0 && (
                    <div>
                      <h3 className="text-xl font-bold text-white mb-4">Screenshots</h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {movie.galleryImages.map((img, idx) => (
                          <div key={idx} className="aspect-video rounded-lg overflow-hidden bg-[#111] border border-white/5">
                            <img src={img} alt={`Screenshot ${idx+1}`} className="w-full h-full object-cover hover:scale-110 transition-transform duration-500 cursor-pointer" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'cast' && (
                <div className="space-y-8">
                  {movie.director && (
                    <div>
                      <h3 className="text-lg font-bold text-white mb-3 text-purple-400">Director</h3>
                      <p className="text-slate-300 font-medium text-lg">{movie.director}</p>
                    </div>
                  )}
                  {movie.cast && movie.cast.length > 0 && (
                    <div>
                      <h3 className="text-lg font-bold text-white mb-4 text-purple-400">Top Cast</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {movie.cast.map((actor, idx) => (
                          <div key={idx} className="flex items-center gap-3 p-3 bg-[#111] rounded-xl border border-white/5">
                            <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center shrink-0">
                              <Users className="w-5 h-5 text-slate-500" />
                            </div>
                            <span className="font-medium text-slate-300">{actor}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'reviews' && (
                <div className="space-y-8">
                  {/* Review Form */}
                  <div className="bg-[#111] p-6 rounded-2xl border border-white/5">
                    <h3 className="text-xl font-bold text-white mb-4">Leave a Review</h3>
                    <form onSubmit={handleReviewSubmit} className="space-y-4">
                      <div>
                        <label className="block text-slate-400 text-sm mb-2">Rating</label>
                        <div className="flex gap-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setRating(star)}
                              className="focus:outline-none"
                            >
                              <Star 
                                className={`w-8 h-8 transition-colors ${
                                  rating >= star ? 'text-amber-500 fill-amber-500' : 'text-slate-600'
                                }`} 
                              />
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="block text-slate-400 text-sm mb-2">Your Review</label>
                        <textarea
                          rows="4"
                          className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-purple-500 transition-colors"
                          placeholder="What did you think of the movie?"
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                          required
                        />
                      </div>
                      <button 
                        type="submit"
                        className="px-6 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold transition-colors shadow-lg shadow-purple-600/20"
                      >
                        Submit Review
                      </button>
                    </form>
                  </div>

                  {/* Reviews List */}
                  <div>
                    <h3 className="text-xl font-bold text-white mb-6">User Reviews ({reviews.length})</h3>
                    {reviewsLoading ? (
                      <div className="flex justify-center py-8"><Loader2 className="w-8 h-8 animate-spin text-purple-500" /></div>
                    ) : reviews.length === 0 ? (
                      <p className="text-slate-500 text-center py-8 bg-[#111] rounded-2xl border border-white/5">
                        No reviews yet. Be the first to review!
                      </p>
                    ) : (
                      <div className="space-y-4">
                        {reviews.map((rev) => (
                          <div key={rev._id} className="bg-[#111] p-6 rounded-2xl border border-white/5">
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-purple-900/30 flex items-center justify-center text-purple-400 font-bold overflow-hidden">
                                  {rev.user?.profileImage ? (
                                    <img src={rev.user.profileImage} alt={rev.user.name} className="w-full h-full object-cover" />
                                  ) : (
                                    rev.user?.name?.charAt(0) || 'U'
                                  )}
                                </div>
                                <div>
                                  <div className="font-semibold text-slate-200">{rev.user?.name || 'Unknown'}</div>
                                  <div className="text-xs text-slate-500">
                                    {new Date(rev.createdAt).toLocaleDateString()}
                                  </div>
                                </div>
                              </div>
                              <div className="flex gap-1">
                                {[...Array(5)].map((_, i) => (
                                  <Star key={i} className={`w-4 h-4 ${i < rev.rating ? 'text-amber-500 fill-amber-500' : 'text-slate-700'}`} />
                                ))}
                              </div>
                            </div>
                            <p className="text-slate-300 leading-relaxed text-sm">{rev.comment}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Right Column (Sidebar) */}
        <div className="lg:w-80 shrink-0 space-y-8">
          
          {/* Movie Details Card */}
          <div className="bg-[#111] border border-white/5 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-4 border-b border-white/10 pb-2">Movie Info</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-white/5">
                <span className="text-slate-500 text-sm">Status</span>
                <span className="text-white text-sm font-medium">{movie.releaseYear ? 'Released' : 'Coming Soon'}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-white/5">
                <span className="text-slate-500 text-sm">Language</span>
                <span className="text-white text-sm font-medium">{movie.language || 'English'}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-white/5">
                <span className="text-slate-500 text-sm">TMDB Rating</span>
                <span className="text-white text-sm font-medium">{movie.tmdbRating > 0 ? movie.tmdbRating.toFixed(1) : 'NR'}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-white/5">
                <span className="text-slate-500 text-sm">Views</span>
                <span className="text-white text-sm font-medium">{movie.views.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 text-sm">Downloads</span>
                <span className="text-white text-sm font-medium">{movie.downloads.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Related Movies */}
          {relatedMovies.length > 0 && (
            <div>
              <h3 className="text-lg font-bold text-white mb-4">You May Also Like</h3>
              <div className="space-y-4">
                {relatedMovies.map(related => (
                  <Link key={related._id} to={`/moviebox/movie/${related.slug}`} className="flex gap-4 group">
                    <div className="w-16 h-24 shrink-0 rounded-lg overflow-hidden bg-[#111]">
                      <img src={related.posterImage} alt={related.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                    </div>
                    <div className="flex-1 py-1">
                      <h4 className="text-sm font-bold text-white group-hover:text-purple-400 transition-colors line-clamp-2 mb-1">{related.title}</h4>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span className="text-amber-500 flex items-center"><Star className="w-3 h-3 fill-amber-500 mr-0.5" /> {related.imdbRating > 0 ? related.imdbRating.toFixed(1) : 'NR'}</span>
                        <span>{related.releaseYear}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Trailer Modal */}
      <AnimatePresence>
        {showTrailer && movie.trailerUrl && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
          >
            <div className="relative w-full max-w-5xl aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl border border-white/10">
              <button 
                onClick={() => setShowTrailer(false)}
                className="absolute top-4 right-4 z-10 w-10 h-10 bg-black/50 hover:bg-red-500 text-white rounded-full flex items-center justify-center backdrop-blur-md transition-colors"
              >
                ✕
              </button>
              <iframe
                src={getEmbedUrl(movie.trailerUrl)}
                title="Trailer"
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MovieDetail;
