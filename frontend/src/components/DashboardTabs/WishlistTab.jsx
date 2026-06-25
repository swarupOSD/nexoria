import React from 'react';
import { useGetWishlistQuery, useRemoveFromWishlistMutation } from '../../features/user/userApiSlice';
import { motion } from 'framer-motion';
import { Heart, Trash2, Download, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import FallbackImage from '../FallbackImage';
import { toast } from 'react-hot-toast';

const WishlistTab = ({ user }) => {
  const { data: wishlistRes, isLoading } = useGetWishlistQuery(undefined, { skip: !user });
  const [removeFromWishlist, { isLoading: isRemoving }] = useRemoveFromWishlistMutation();

  const handleRemove = async (postId) => {
    try {
      await removeFromWishlist(postId).unwrap();
      toast.success('Removed from wishlist');
    } catch (err) {
      toast.error('Failed to remove from wishlist');
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div></div>;
  }

  const wishlist = wishlistRes?.data || [];

  if (wishlist.length === 0) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-12 text-center">
        <div className="w-20 h-20 bg-rose-50 dark:bg-rose-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <Heart className="w-10 h-10 text-rose-300 dark:text-rose-500/50" />
        </div>
        <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Your wishlist is empty</h3>
        <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-8">
          Save your favorite apps and games here to download them later or keep track of their updates.
        </p>
        <Link to="/categories" className="btn-primary inline-flex">
          Explore Apps
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <Heart className="w-6 h-6 text-rose-500 fill-current" /> My Wishlist
        </h2>
        <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 py-1 px-3 rounded-full text-sm font-semibold">
          {wishlist.length} Items
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {wishlist.map((post) => (
          <motion.div 
            key={post._id}
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="glass-card group hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col"
          >
            <div className="p-5 flex items-start gap-4 flex-1">
              <Link to={`/post/${post.slug}`} className="shrink-0">
                <FallbackImage 
                  src={post.appLogo} 
                  fallbackType="logo" 
                  alt={post.title} 
                  className="w-16 h-16 rounded-xl object-cover shadow-sm group-hover:scale-105 transition-transform" 
                />
              </Link>
              <div className="flex-1 min-w-0">
                <Link to={`/post/${post.slug}`}>
                  <h3 className="font-bold text-slate-800 dark:text-white truncate group-hover:text-primary transition-colors">
                    {post.title}
                  </h3>
                </Link>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  {post.isPremium && (
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-warning/10 text-warning border border-warning/20">
                      Premium
                    </span>
                  )}
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <Star className="w-3 h-3 text-warning fill-warning" /> {post.averageRating?.toFixed(1) || '5.0'}
                  </span>
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <Download className="w-3 h-3" /> {post.downloads || 0}
                  </span>
                </div>
              </div>
            </div>
            <div className="border-t border-slate-100 dark:border-slate-800 p-3 bg-slate-50/50 dark:bg-slate-900/50 flex justify-between items-center">
              <Link to={`/post/${post.slug}`} className="text-sm font-semibold text-primary hover:text-indigo-600 transition-colors">
                View Details
              </Link>
              <button 
                onClick={() => handleRemove(post._id)}
                disabled={isRemoving}
                className="p-2 text-slate-400 hover:text-danger hover:bg-danger/10 rounded-lg transition-colors disabled:opacity-50"
                title="Remove from Wishlist"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default WishlistTab;
