import { useParams, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useGetPostBySlugQuery, useGetRelatedPostsQuery } from '../features/post/postApiSlice';
import { useGetWishlistQuery, useAddToWishlistMutation, useRemoveFromWishlistMutation } from '../features/user/userApiSlice';
import BackButton from '../components/BackButton';
import { useGetCommentsQuery, useCreateCommentMutation, useReplyCommentMutation } from '../features/comment/commentApiSlice';
import { useGetRatingsQuery, useCreateRatingMutation } from '../features/rating/ratingApiSlice';
import { useGetPostReviewsQuery, useCreateReviewMutation, useDeleteReviewMutation } from '../features/review/reviewApiSlice';
import { useTrackDownloadMutation } from '../features/download/downloadApiSlice';
import { useCreateReportMutation } from '../features/report/reportApiSlice';
import { useSelector } from 'react-redux';
import { Download, Star, Clock, Info, ShieldAlert, Crown, ShoppingCart, Heart } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdPlacement from '../components/AdPlacement';
import UserBadge from '../components/UserBadge';
import EmojiReactions from '../components/EmojiReactions';
import ShareFAB from '../components/ShareFAB';
import HeroDisplay from '../components/HeroDisplay';
import SEO from '../components/SEO';
import QRPaymentModal from '../components/QRPaymentModal';
import PurchaseErrorBoundary from '../components/ErrorBoundaries/PurchaseErrorBoundary';
import { useSubmitPurchaseRequestMutation, useGetMyRequestsQuery } from '../features/api/paymentApiSlice';
import { useGetItemAuraQuery, useVibeVoteMutation } from '../features/aura/auraApiSlice';
import AuraScore from '../components/AuraScore';
import { Flame } from 'lucide-react';
import { triggerAuraStrike } from '../utils/auraStrike';

const renderContentWithEmbeds = (htmlContent) => {
  if (!htmlContent) return '';
  
  let processed = htmlContent;

  // Recursively unescape HTML if it was saved as text entities (e.g. &amp;lt;p&amp;gt; or &lt;p&gt;)
  const txt = document.createElement('textarea');
  let prevStr = '';
  let iterations = 0;
  while (processed !== prevStr && iterations < 5) {
    prevStr = processed;
    if (processed.includes('&lt;') || processed.includes('&amp;')) {
      txt.innerHTML = processed;
      processed = txt.value;
    } else {
      break;
    }
    iterations++;
  }

  // Style Tiptap's native youtube embeds (adds Tailwind classes to the wrapper and sets width/height on iframe)
  processed = processed.replace(/<div data-youtube-video([^>]*)>/gi, '<div data-youtube-video class="aspect-video w-full my-6 rounded-xl overflow-hidden shadow-lg border border-slate-200 dark:border-white/10" $1>');
  processed = processed.replace(/(<div data-youtube-video[\s\S]*?<iframe[^>]*)(width="[^"]*")([^>]*>)/gi, '$1width="100%"$3');
  processed = processed.replace(/(<div data-youtube-video[\s\S]*?<iframe[^>]*)(height="[^"]*")([^>]*>)/gi, '$1height="100%"$3');

  // YouTube Regex (handles plain text and already linked URLs)
  // Protects existing iframes by capturing them and returning them untouched.
  // eslint-disable-next-line no-useless-escape
  const ytRegex = /(<iframe[^>]*>[\s\S]*?<\/iframe>)|(?:<a[^>]*href="[^"]*")?\s*(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})\s*(?:<\/a>)?/gi;
  processed = processed.replace(ytRegex, (match, existingIframe, videoId) => {
    if (existingIframe) return existingIframe;
    return `<div class="aspect-video w-full my-6 rounded-xl overflow-hidden shadow-lg border border-slate-200 dark:border-white/10">
              <iframe width="100%" height="100%" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
            </div>`;
  });

  // Instagram Regex
  const igRegex = /(<iframe[^>]*>[\s\S]*?<\/iframe>)|(?:<a[^>]*href="[^"]*")?\s*(?:https?:\/\/)?(?:www\.)?instagram\.com\/(?:p|reel)\/([a-zA-Z0-9_-]+)\/?\s*(?:<\/a>)?/gi;
  processed = processed.replace(igRegex, (match, existingIframe, postId) => {
    if (existingIframe) return existingIframe;
    return `<div class="w-full max-w-sm mx-auto my-6 rounded-xl overflow-hidden shadow-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <iframe width="100%" height="480" src="https://www.instagram.com/p/${postId}/embed" frameborder="0" scrolling="no" allowtransparency="true"></iframe>
            </div>`;
  });

  // Make remaining plain URLs clickable (avoiding href/src attributes or already in a tag)
  // eslint-disable-next-line no-useless-escape
  const urlRegex = /(?<!href=["']|src=["']|>)(https?:\/\/[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}(?:\/[^\s<]*)?)(?![^<]*>|[^>]*<\/a>)/gi;
  processed = processed.replace(urlRegex, (match) => {
    return `<a href="${match}" target="_blank" rel="noopener noreferrer" class="text-blue-500 hover:text-blue-600 dark:hover:text-blue-400 hover:underline break-all">${match}</a>`;
  });

  return processed;
};

const SinglePost = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { data: postRes, isLoading, isError } = useGetPostBySlugQuery(slug);
  const { user, token } = useSelector(state => state.auth);
  const { data: commentsRes } = useGetCommentsQuery(postRes?.data?._id, { skip: !postRes?.data?._id });
  const { data: ratingsRes } = useGetRatingsQuery(postRes?.data?._id, { skip: !postRes?.data?._id });
  const { data: relatedRes } = useGetRelatedPostsQuery(postRes?.data?._id, { skip: !postRes?.data?._id });
  const [createReport] = useCreateReportMutation();
  
  const [commentText, setCommentText] = useState('');
  const [rating, setRating] = useState(5);
  const [replyText, setReplyText] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);

  const { data: reviewsRes } = useGetPostReviewsQuery(postRes?.data?._id, { skip: !postRes?.data?._id });
  const [createReview, { isLoading: isCreatingReview }] = useCreateReviewMutation();
  const [deleteReview] = useDeleteReviewMutation();

  const [createComment] = useCreateCommentMutation();
  const [createRating] = useCreateRatingMutation();
  const [replyComment] = useReplyCommentMutation();
  const [trackDownload, { isLoading: isDownloading }] = useTrackDownloadMutation();
  const [submitPurchaseRequest, { isLoading: isSubmittingPurchase }] = useSubmitPurchaseRequestMutation();
  const { data: myRequestsRes, isLoading: isRequestsLoading } = useGetMyRequestsQuery(undefined, { skip: !user });
  
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [isUploadingProof, setIsUploadingProof] = useState(false);

  const { data: auraRes } = useGetItemAuraQuery({ type: 'post', id: postRes?.data?._id }, { skip: !postRes?.data?._id });
  const [vibeVote, { isLoading: isVibeVoting }] = useVibeVoteMutation();

  const { data: wishlistRes } = useGetWishlistQuery(undefined, { skip: !user });
  const [addToWishlist, { isLoading: isAddingWishlist }] = useAddToWishlistMutation();
  const [removeFromWishlist, { isLoading: isRemovingWishlist }] = useRemoveFromWishlistMutation();

  if (isLoading) return <div className="flex justify-center mt-20"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div></div>;
  if (isError || !postRes?.data) return <div className="text-center mt-20 text-red-500">Post not found</div>;

  const post = postRes.data;
  const comments = commentsRes?.data || [];
  const ratings = ratingsRes?.data || [];
  const relatedPosts = relatedRes?.data || [];
  const reviews = reviewsRes?.data || [];
  const aura = auraRes?.data;

  const isWishlisted = wishlistRes?.data?.some(item => item._id === post?._id || item === post?._id);

  const handleWishlistToggle = async () => {
    if (!user) return toast.error('Please login to use the wishlist.');
    try {
      if (isWishlisted) {
        await removeFromWishlist(post._id).unwrap();
        toast.success('Removed from wishlist');
      } else {
        await addToWishlist({ postId: post._id }).unwrap();
        toast.success('Added to wishlist');
      }
    } catch (err) {
      toast.error(err?.data?.message || 'Error updating wishlist');
    }
  };

  const handleVibeVote = async () => {
    if (!user) return toast.error('You must be logged in to Vibe Vote!', { id: 'auth_error' });
    try {
      const res = await vibeVote({ type: 'post', id: post._id }).unwrap();
      if (res.data?.questCompleted) {
        toast.success(res.message, { icon: '🎁', duration: 5000 });
      } else {
        toast.success('🔥 Vibe Vote cast successfully!');
      }
      triggerAuraStrike();
    } catch (err) {
      toast.error(err?.data?.message || 'You have already vibed today!');
    }
  };

  const handleReportLink = async (linkId) => {
    if (!user) return toast.error('You must be logged in to report links.');
    const description = window.prompt("Please describe the issue with this link:");
    if (!description) return;
    try {
      await createReport({ post: post._id, reason: 'Broken Download Link', description, downloadLink: linkId }).unwrap();
      toast.success('Link report submitted successfully. Thank you!');
    } catch (err) {
      toast.error(err?.data?.message || 'Error reporting link');
    }
  };

  const handleReportApp = async () => {
    if (!user) return toast.error('You must be logged in to report apps.');
    const reasons = [
      'Fake App',
      'Wrong Version',
      'Malware Suspicion',
      'Other'
    ];
    const reasonText = reasons.join('\n');
    const reasonInput = window.prompt(`Please enter the reason for reporting:\n${reasonText}`);
    
    if (!reasonInput || !reasons.find(r => r.toLowerCase() === reasonInput.toLowerCase())) {
      return toast.error('Invalid reason or cancelled.');
    }

    const description = window.prompt("Please describe the issue in detail:");
    if (!description) return;

    try {
      const validReason = reasons.find(r => r.toLowerCase() === reasonInput.toLowerCase());
      await createReport({ post: post._id, reason: validReason, description }).unwrap();
      toast.success('App report submitted successfully. Thank you!');
    } catch (err) {
      toast.error(err?.data?.message || 'Error reporting app');
    }
  };
  // Check Under Development status
  if (post.status === 'Under Development') {
    const canView = user && ['admin', 'superadmin'].includes(user.role);
    if (!canView) {
      return (
        <div>
          <div className="absolute top-0 left-0 w-full h-1 bg-slate-200/50 dark:bg-slate-800/55">
            <div className="h-full bg-warning transition-all duration-1000" style={{ width: `${post.developmentProgress || 0}%` }}></div>
          </div>
          <Clock className="w-20 h-20 text-warning mb-6 drop-shadow-lg animate-pulse" />
          <h2 className="text-4xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-warning to-amber-600">Under Development</h2>
          <p className="text-lg text-slate-600 dark:text-slate-300 font-medium mb-6">This app is currently being prepared and tested by our developer team. It will be available very soon!</p>
          
          <div className="flex flex-wrap items-center justify-center gap-6 bg-white/30 dark:bg-slate-950/40 border border-slate-200/40 dark:border-white/5 p-6 rounded-2xl w-full">
            <div className="text-center">
              <p className="text-sm text-slate-500 dark:text-slate-400 font-semibold mb-1 uppercase tracking-wider">Progress</p>
              <p className="text-3xl font-bold text-warning">{post.developmentProgress || 0}%</p>
            </div>
            <div className="w-px h-12 bg-slate-300/50 dark:bg-slate-700/55 hidden sm:block"></div>
            <div className="text-center">
              <p className="text-sm text-slate-500 dark:text-slate-400 font-semibold mb-1 uppercase tracking-wider">Expected Release</p>
              <p className="text-xl font-bold text-slate-800 dark:text-white">
                {post.expectedReleaseDate ? new Date(post.expectedReleaseDate).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : 'To Be Announced'}
              </p>
            </div>
          </div>
        </div>
      );
    }
  }

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user) return toast.error('You must be logged in to leave a review.');
    try {
      await createReview({ postId: post._id, rating, comment: commentText }).unwrap();
      setCommentText('');
      setRating(5);
      toast.success('Review submitted successfully!');
    } catch (err) {
      toast.error(err?.data?.message || 'Error submitting review');
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (window.confirm('Are you sure you want to delete your review?')) {
      try {
        await deleteReview(reviewId).unwrap();
        toast.success('Review deleted');
      } catch (err) {
        toast.error(err?.data?.message || 'Error deleting review');
      }
    }
  };

  const handleReplySubmit = async (e, parentId) => {
    e.preventDefault();
    if (!user) return toast.error('You must be logged in to reply.');
    try {
      await replyComment({ commentId: parentId, data: { content: replyText } }).unwrap();
      setReplyText('');
      setReplyingTo(null);
      toast.success('Reply submitted for moderation');
    } catch (err) {
      toast.error(err?.data?.message || 'Error submitting reply');
    }
  };

  const handleDownloadClick = async (e, link) => {
    e.preventDefault();
    
    if (post.appType === 'Premium Subscription') {
      const isPremiumUser = user && ['premium_user', 'admin', 'superadmin'].includes(user.role);
      if (!isPremiumUser) {
        toast.error('Upgrade to Premium Membership to download this app.');
        return; // Alternatively, navigate to /premium
      }
    }

    if (post.appType === 'One-Time Purchase' || post.appType === 'Paid') {
      const isPremiumUser = user && ['admin', 'superadmin'].includes(user.role);
      const hasPurchased = myRequestsRes?.data?.purchases?.some(p => p.post?._id === post._id);
      if (!isPremiumUser && !hasPurchased) {
        setIsPurchaseModalOpen(true);
        return;
      }
    }

    if (link.type === 'premium') {
      const isPremiumUser = user && ['premium_user', 'admin', 'superadmin'].includes(user.role);
      if (!isPremiumUser) {
        return toast.error('Upgrade to Premium Membership to access high-speed downloads.');
      }
    }

    // Premium users bypass timer
    const isPremiumUser = user && ['premium_user', 'admin', 'superadmin'].includes(user.role);
    
    if (isPremiumUser) {
      try {
        const res = await trackDownload({ postId: post._id, linkId: link._id }).unwrap();
        if (res.downloadUrl) {
          window.open(res.downloadUrl, '_blank');
        }
      } catch(err) {
        console.error(err);
        toast.error(err?.data?.message || 'Failed to process download link');
      }
    } else {
      // Non-premium users go to timer page
      navigate('/download-timer', { state: { postId: post._id, linkId: link._id } });
    }
  };

  const handlePurchaseSubmit = async ({ transactionId, proofImage }) => {
    if (!user) {
      toast.error('Please log in to purchase this app.');
      return;
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
      
      if (!uploadRes.ok) {
        throw new Error('Image upload failed. Server returned status: ' + uploadRes.status);
      }
      
      const uploadData = await uploadRes.json();
      
      if (!uploadData.success) {
        throw new Error(uploadData.message || 'Image upload failed');
      }

      await submitPurchaseRequest({
        postId: post._id,
        transactionId,
        amount: post.discountPrice || post.price,
        proofImage: uploadData.url
      }).unwrap();
      
      toast.success('Purchase request submitted! Waiting for admin approval.');
      setIsPurchaseModalOpen(false);
    } catch (err) {
      console.error('Purchase Error:', err);
      toast.error(err?.data?.message || err.message || 'Purchase submission failed.');
    } finally {
      setIsUploadingProof(false);
    }
  };

  // Sort and filter active links
  const activeLinks = (post.downloadLinks || [])
    .filter(link => link.isActive)
    .sort((a, b) => a.priority - b.priority);

  const primaryLinks = activeLinks.filter(l => l.type === 'primary');
  const mirrorLinks = activeLinks.filter(l => l.type === 'mirror');
  const premiumLinks = activeLinks.filter(l => l.type === 'premium');

  return (
    <div>
      {/* Universal Back Button */}
      <div className="mb-4">
        <BackButton fallbackRoute="/" />
      </div>
      
      <SEO 
        title={post.seoTitle || post.title}
        description={post.seoDescription || post.description}
        keywords={post.tags ? post.tags.join(', ') : ''}
        image={post.appLogo || post.featuredImage}
        type="article"
      />

      {/* Header Section */}
      <div className="bg-[#111] rounded-2xl border border-white/5 p-6 flex flex-col md:flex-row gap-6 items-center md:items-start">
        <img src={post.appLogo} alt={post.title} className="w-32 h-32 rounded-3xl shadow-lg object-cover bg-[#1a1a1a] border border-white/10 p-1 shrink-0" />
        <div className="flex-1 text-center md:text-left space-y-2">
          <h1 className="text-3xl font-extrabold text-white">{post.title}</h1>
          <p className="text-primary dark:text-accent font-semibold">{post.publisher}</p>
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1"><Star className="w-4 h-4 text-warning fill-current" /> {(post.averageRating || 5).toFixed(1)} ({post.totalVotes || 0} reviews)</span>
            <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {new Date(post.createdAt || post.updateDate).toLocaleDateString()}</span>
            <span className="flex items-center gap-1"><Info className="w-4 h-4" /> v{post.version}</span>
          </div>
        </div>
        <div className="flex flex-col gap-3 min-w-[200px] items-stretch">
          <p className="text-center text-xs text-slate-500 dark:text-slate-400 mb-2 font-medium">✅ Verified &amp; Safe &bull; {post.downloads || 0} Downloads</p>
          
          <button 
            onClick={handleWishlistToggle}
            disabled={isAddingWishlist || isRemovingWishlist}
            className={`flex items-center justify-center gap-2 py-2 px-4 rounded-xl transition text-sm font-semibold border ${
              isWishlisted 
                ? 'bg-rose-50 text-rose-500 border-rose-200 hover:bg-rose-100 dark:bg-rose-500/10 dark:border-rose-500/20' 
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 hover:dark:bg-slate-700'
            }`}
          >
            <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
            {isWishlisted ? 'Wishlisted' : 'Add to Wishlist'}
          </button>

          <PurchaseErrorBoundary>
          
          {primaryLinks.map((link) => {
             const hasPurchased = myRequestsRes?.data?.purchases?.some(p => p.post?._id === post._id);
             const isAdmin = user && ['admin', 'superadmin'].includes(user.role);

             // Always show 'Download' for primary links regardless of link.label
             let btnText = 'Download';
             let btnIcon = <Download className="w-4 h-4" />;
             
             if (post.appType === 'Premium Subscription' || post.appType === 'Premium') {
               btnText = 'Premium Only';
               btnIcon = <Star className="w-4 h-4" />;
             } else if ((post.appType === 'One-Time Purchase' || post.appType === 'Paid') && !hasPurchased && !isAdmin) {
               btnText = `Get for ₹${post.discountPrice || post.price}`;
               btnIcon = <ShoppingCart className="w-4 h-4" />;
             }

             return (
               <div key={link._id} className="flex gap-2">
                 <button
                   onClick={(e) => handleDownloadClick(e, link)}
                   disabled={isDownloading || isRequestsLoading}
                   className="flex-1 flex items-center justify-center gap-2 py-3 px-5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 shadow-lg shadow-violet-500/30 hover:shadow-violet-500/50 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group"
                 >
                   <Download className="w-4 h-4 group-hover:animate-bounce" /> {btnText}
                 </button>
                 <button onClick={() => handleReportLink(link._id)} className="px-3 bg-danger/10 text-danger hover:bg-danger/20 rounded-xl transition border border-danger/10" title="Report Broken Link">
                   <ShieldAlert className="w-4 h-4" />
                 </button>
               </div>
             );
          })}
          
          {premiumLinks.map((link) => {
             const isPremiumUser = user && ['premium_user', 'admin', 'superadmin'].includes(user.role);
             return (
               <div key={link._id} className="flex gap-2">
                  <button onClick={(e) => handleDownloadClick(e, link)} disabled={isDownloading} className={`group flex-1 flex items-center justify-center gap-2 py-3 px-5 rounded-xl font-bold transition-all duration-200 text-sm border-2 hover:-translate-y-0.5 active:translate-y-0 ${isPremiumUser ? 'bg-gradient-to-r from-amber-500 to-yellow-500 border-yellow-400/20 text-white hover:shadow-glow shadow-lg shadow-yellow-500/20 hover:shadow-yellow-500/40' : 'bg-slate-200/50 dark:bg-slate-800/50 border-slate-300/30 dark:border-white/5 text-slate-500 hover:border-yellow-500/50'}`}>
                    <Download className="w-4 h-4 group-hover:animate-bounce" /> Download
                  </button>
                 {isPremiumUser && (
                   <button onClick={() => handleReportLink(link._id)} className="px-3 bg-danger/10 text-danger hover:bg-danger/20 rounded-xl transition border border-danger/10" title="Report Broken Link">
                     <ShieldAlert className="w-4 h-4" />
                   </button>
                 )}
               </div>
             );
          })}

          {mirrorLinks.length > 0 && (
             <div className="mt-2 flex flex-col gap-2">
               {mirrorLinks.map(link => (
                 <div key={link._id} className="flex gap-2">
                   <button onClick={(e) => handleDownloadClick(e, link)} disabled={isDownloading} className="flex-1 flex items-center justify-center gap-2 bg-slate-100 dark:bg-slate-800/50 hover:bg-primary hover:text-white dark:hover:bg-primary text-slate-700 dark:text-slate-200 dark:hover:text-white py-2 px-4 rounded-xl font-bold transition-all text-xs border border-slate-200/50 dark:border-white/5">
                     <Download className="w-3 h-3" /> {link.label || 'Mirror'}
                   </button>
                   <button onClick={() => handleReportLink(link._id)} className="px-2 bg-danger/10 text-danger hover:bg-danger/20 rounded-xl transition border border-danger/10" title="Report Broken Link">
                     <ShieldAlert className="w-3 h-3" />
                   </button>
                 </div>
               ))}
            </div>
          )}

          {activeLinks.length === 0 && (
            <div className="text-center text-sm text-red-500 font-bold p-3 bg-red-500/10 rounded-xl border border-red-500/20">
              No download links available.
            </div>
          )}
          </PurchaseErrorBoundary>
          <AdPlacement location="DownloadSection" className="mt-2" />
        </div>
      </div>

      {/* Content & Mod Info */}
      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          <div className="bg-[#111] rounded-2xl border border-white/5 p-6">
            <h2 className="text-xl font-bold mb-4 border-l-4 border-primary pl-3">Description</h2>
            <div className="prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: renderContentWithEmbeds(post.content) }}></div>
          </div>
          
          {post.galleryImages && post.galleryImages.length > 0 && (
            <div className="bg-[#111] rounded-2xl border border-white/5 p-6">
              <h2 className="text-xl font-bold mb-4 border-l-4 border-accent pl-3">App Screenshots</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {post.galleryImages.map((img, idx) => (
                  <a key={idx} href={img} target="_blank" rel="noreferrer" className="block overflow-hidden rounded-xl">
                    <img src={img} fallbackType="generic" alt={`${post.title} screenshot ${idx + 1}`} className="w-full h-auto object-cover hover:scale-105 transition duration-300" />
                  </a>
                ))}
              </div>
            </div>
          )}

          <AdPlacement location="BetweenContent" />

          {/* Reactions Section */}
          <EmojiReactions postId={post._id} />

          {/* Reviews Section */}
          <div className="bg-[#111] rounded-2xl border border-white/5 p-6 space-y-6">
            <h2 className="text-xl font-bold border-l-4 border-primary pl-3">User Reviews</h2>
            
            <div className="bg-white/30 dark:bg-slate-950/40 border border-slate-200/40 dark:border-white/5 p-5 rounded-2xl shadow-sm">
              <form onSubmit={handleReviewSubmit} className="space-y-4">
                <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">Write a Review</h3>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-500 font-medium">Rating:</span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star 
                        key={star} 
                        className={`w-6 h-6 cursor-pointer transition-colors ${star <= rating ? 'text-warning fill-warning' : 'text-slate-300 dark:text-slate-600'}`} 
                        onClick={() => setRating(star)} 
                      />
                    ))}
                  </div>
                </div>
                <textarea 
                  value={commentText} onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Share your experience with this app..."
                  className="premium-input w-full" required
                  rows="3"
                ></textarea>
                <button type="submit" disabled={isCreatingReview} className="px-6 py-2 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white font-bold rounded-xl transition text-sm shadow-md disabled:opacity-50">
                  {isCreatingReview ? 'Submitting...' : 'Submit Review'}
                </button>
              </form>
            </div>

            <div className="space-y-4 mt-8">
              {reviews.length === 0 ? (
                <p className="text-slate-500 text-sm italic">No reviews yet. Be the first to review!</p>
              ) : (
                reviews.map((review) => (
                  <div key={review._id} className="bg-white/30 dark:bg-slate-950/40 border border-slate-200/40 dark:border-white/5 p-5 rounded-2xl flex flex-col gap-3">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <img src={review.user?.profileImage} fallbackType="avatar" className="w-10 h-10 rounded-full object-cover" />
                        <div>
                          <span className="font-semibold flex items-center gap-2 text-slate-850 dark:text-white flex-wrap">
                            {review.user?.name || 'Anonymous'}
                            {review.user && <UserBadge role={review.user.role} />}
                            {review.user?.auraRank && review.user.auraRank !== 'Rookie' && (
                              <span className={`text-[9px] px-1.5 py-0.5 rounded font-black tracking-widest uppercase text-white shadow-sm ${
                                review.user.auraRank === 'Legend' ? 'bg-gradient-to-r from-red-600 to-amber-600' :
                                review.user.auraRank === 'Elite' ? 'bg-gradient-to-r from-purple-600 to-pink-600' :
                                review.user.auraRank === 'Pro' ? 'bg-gradient-to-r from-blue-600 to-cyan-500' :
                                review.user.auraRank === 'Rising' ? 'bg-gradient-to-r from-emerald-500 to-teal-400' :
                                'bg-slate-500'
                              }`}>
                                {review.user.auraRank}
                              </span>
                            )}
                          </span>
                          <span className="text-xs text-slate-500">{new Date(review.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star key={star} className={`w-4 h-4 ${star <= review.rating ? 'text-warning fill-warning' : 'text-slate-300 dark:text-slate-600'}`} />
                        ))}
                      </div>
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">{review.comment}</p>
                    {user && (user._id === review.user?._id || user.role === 'admin' || user.role === 'superadmin') && (
                      <div className="flex justify-end gap-2 mt-2">
                        <button onClick={() => handleDeleteReview(review._id)} className="text-xs text-danger hover:underline">Delete</button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <HeroDisplay position="Sidebar" />
          
          {/* Aura Widget */}
          <div className="bg-[#111] rounded-2xl border border-white/5 p-6 flex flex-col items-center justify-center text-center relative overflow-hidden group hover:border-amber-500/30 transition-colors">
             <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-amber-500/20 transition-colors duration-500"></div>
             <h3 className="font-black text-lg text-white uppercase tracking-widest mb-1 flex items-center gap-2">
                <Flame className="w-5 h-5 text-amber-500" /> Nexoria Aura
             </h3>
             <p className="text-xs text-slate-400 mb-6 z-10">Real-time hype score based on community engagement.</p>
             
             <div className="z-10 bg-black/40 p-4 rounded-[2rem] border border-white/5 mb-4">
               <AuraScore score={aura?.score || post.auraScore || 0} size="lg" />
             </div>
             
             <button
               onClick={handleVibeVote}
               disabled={isVibeVoting}
               className="z-10 mt-2 flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-bold tracking-wide shadow-lg shadow-amber-500/20 active:scale-95 transition-all disabled:opacity-50"
             >
               <Flame className="w-4 h-4" /> {isVibeVoting ? 'Voting...' : 'Vibe Vote +1'}
             </button>
             <p className="text-[10px] text-slate-500 mt-2 z-10">You can vote once every 24 hours.</p>
          </div>

          <AdPlacement location="Sidebar" />
          <div className="bg-[#111] rounded-2xl border border-white/5 p-6">
            <div className="flex justify-between items-center mb-4 border-b border-slate-200/50 dark:border-white/10 pb-2">
              <h3 className="font-bold text-lg text-slate-800 dark:text-white">App Information</h3>
              <button onClick={handleReportApp} className="text-danger hover:text-red-600 transition" title="Report App">
                <ShieldAlert className="w-5 h-5" />
              </button>
            </div>
            <ul className="space-y-3 text-sm">
              <li className="flex justify-between"><span className="text-slate-500 dark:text-slate-400">Package Name</span> <span className="font-medium truncate max-w-[150px] text-slate-800 dark:text-slate-200" title={post.packageName}>{post.packageName || 'Unknown'}</span></li>
              <li className="flex justify-between"><span className="text-slate-500 dark:text-slate-400">Platform</span> <span className="font-medium text-slate-800 dark:text-slate-200">{post.platform}</span></li>
              <li className="flex justify-between"><span className="text-slate-500 dark:text-slate-400">Price</span> <span className="font-medium text-success">{post.price}</span></li>
              <li className="flex justify-between"><span className="text-slate-500 dark:text-slate-400">Category</span> <span className="font-medium text-slate-800 dark:text-slate-200">{post.category?.name || 'Uncategorized'}</span></li>
              {post.subCategory && <li className="flex justify-between"><span className="text-slate-500 dark:text-slate-400">Subcategory</span> <span className="font-medium text-slate-800 dark:text-slate-200">{post.subCategory.name}</span></li>}
              <li className="flex justify-between"><span className="text-slate-500 dark:text-slate-400">Requirements</span> <span className="font-medium text-slate-800 dark:text-slate-200">{post.requirements}</span></li>
              <li className="flex justify-between"><span className="text-slate-500 dark:text-slate-400">Size</span> <span className="font-medium text-slate-800 dark:text-slate-200">{post.size}</span></li>
            </ul>
          </div>

          {post.changelog && (
            <div className="bg-[#111] rounded-2xl border border-white/5 p-6 border-l-4 border-primary bg-gradient-to-r from-primary/5 to-transparent">
              <h3 className="font-bold text-lg mb-4 text-primary">What's New in v{post.version}</h3>
              <p className="text-sm text-slate-800 dark:text-slate-300 whitespace-pre-wrap">{post.changelog}</p>
            </div>
          )}

          {post.versions && post.versions.length > 0 && (
            <div className="bg-[#111] rounded-2xl border border-white/5 p-6 border border-slate-200/50 dark:border-white/10">
              <h3 className="font-bold text-lg mb-4 border-b border-slate-200/50 dark:border-white/10 pb-2">Version History</h3>
              <div className="space-y-4">
                {post.versions.map((ver, idx) => (
                  <div key={idx} className="border-l-2 border-primary pl-4 py-1.5">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-sm dark:text-white">v{ver.version}</h4>
                      <span className="text-xs text-slate-500">{new Date(ver.date).toLocaleDateString()}</span>
                    </div>
                    {ver.changelog && <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 whitespace-pre-wrap">{ver.changelog}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {post.modFeatures && post.modFeatures.length > 0 && (
            <div className="bg-[#111] rounded-2xl border border-white/5 p-6 border-l-4 border-accent bg-gradient-to-r from-accent/5 to-transparent">
              <h3 className="font-bold text-lg mb-4 text-accent">MOD Features</h3>
              <ul className="list-disc pl-5 space-y-2 text-sm text-slate-800 dark:text-slate-300">
                {post.modFeatures.map((info, idx) => (
                  <li key={idx}>{info}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Related Posts */}
          {relatedPosts.length > 0 && (
            <div className="bg-[#111] rounded-2xl border border-white/5 p-6 border border-slate-200/50 dark:border-white/10">
              <h3 className="font-bold text-lg mb-4 border-b border-slate-200/50 dark:border-white/10 pb-2">Related Apps</h3>
              <div className="space-y-4">
                {relatedPosts.map(rel => (
                  <Link to={`/post/${rel.slug}`} key={rel._id} className="flex gap-3 group">
                    <img src={rel.appLogo} fallbackType="logo" className="w-12 h-12 rounded-xl object-cover bg-white dark:bg-slate-900 p-0.5 border border-slate-200/50 dark:border-white/5" />
                    <div>
                      <h4 className="text-sm font-bold group-hover:text-primary truncate">{rel.title}</h4>
                      <p className="text-xs text-slate-500">{rel.categoryObj?.name || 'App'}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      {(post.appType === 'One-Time Purchase' || post.appType === 'Paid') && (
        <PurchaseErrorBoundary>
          <QRPaymentModal
            isOpen={isPurchaseModalOpen}
            onClose={() => setIsPurchaseModalOpen(false)}
            amount={post.discountPrice || post.price}
            itemName={post.title}
            onSubmit={handlePurchaseSubmit}
            isSubmitting={isSubmittingPurchase || isUploadingProof}
          />
        </PurchaseErrorBoundary>
      )}
      
      {post && <ShareFAB url={window.location.href} title={post.title} />}
    </div>
  );
};

export default SinglePost;

