import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star, Trash2, CheckCircle, XCircle, MessageSquare, Loader2 , LayoutTemplate } from 'lucide-react';
import toast from 'react-hot-toast';
import BackButton from '../../components/BackButton';

const ReviewModeration = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReviews = async () => {
    try {
      const res = await fetch('/api/reviews/admin/all', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      if (data.success) {
        setReviews(data.data);
      }
    } catch (error) {
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleModerate = async (id, isApproved) => {
    try {
      const res = await fetch(`/api/reviews/${id}/moderate`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ isApproved })
      });
      const data = await res.json();
      if (data.success) {
        setReviews(reviews.map(r => r._id === id ? { ...r, isApproved } : r));
        toast.success(isApproved ? 'Review Approved' : 'Review Hidden');
      }
    } catch (err) {
      toast.error('Error moderating review');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Permanently delete this review?')) return;
    try {
      const res = await fetch(`/api/reviews/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        setReviews(reviews.filter(r => r._id !== id));
        toast.success('Deleted');
      }
    } catch (err) {
      toast.error('Error deleting review');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-purple-500" /> Review Moderation
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
            Approve, hide, or delete user app reviews.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 animate-spin text-purple-500" /></div>
      ) : (
        <div className="bg-white dark:bg-[#0A0A0A] border border-slate-200 dark:border-white/10 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-white/5 border-b border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="p-4 font-medium w-1/4">User</th>
                  <th className="p-4 font-medium w-1/4">App</th>
                  <th className="p-4 font-medium w-1/4">Review</th>
                  <th className="p-4 font-medium w-[10%]">Status</th>
                  <th className="p-4 font-medium text-right w-[15%]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-white/10">
                {reviews.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="p-8 text-center text-slate-500 dark:text-slate-400">
                      No reviews found.
                    </td>
                  </tr>
                ) : reviews.map(review => (
                  <tr key={review._id} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.02]">
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900 dark:text-white">{review.user?.name || 'Unknown'}</span>
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">{review.user?.email}</div>
                    </td>
                    <td className="p-4 text-slate-700 dark:text-slate-300 font-medium">
                      {review.post?.title || 'Deleted App'}
                    </td>
                    <td className="p-4 text-slate-700 dark:text-slate-300">
                      <div className="flex items-center gap-1 mb-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-3 h-3 ${i < review.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-300 dark:text-slate-700'}`} />
                        ))}
                      </div>
                      <p className="line-clamp-2 text-xs">{review.comment}</p>
                    </td>
                    <td className="p-4">
                      {review.isApproved ? (
                        <span className="px-2.5 py-1 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 rounded-full text-xs font-semibold">
                          Approved
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 rounded-full text-xs font-semibold">
                          Hidden
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {review.isApproved ? (
                          <button onClick={() => handleModerate(review._id, false)} className="p-1.5 text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-500/10 rounded-md" title="Hide">
                            <XCircle className="w-4 h-4" />
                          </button>
                        ) : (
                          <button onClick={() => handleModerate(review._id, true)} className="p-1.5 text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-md" title="Approve">
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        <button onClick={() => handleDelete(review._id)} className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-md" title="Delete">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewModeration;
