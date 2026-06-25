import { Helmet } from 'react-helmet-async';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Star, Trash2 } from 'lucide-react';
import { useState } from 'react';

import { useGetRatingsQuery, useDeleteRatingMutation, useModerateRatingMutation } from '../../features/rating/ratingApiSlice';

const AdminRatings = () => {
  const { data: ratingsRes, isLoading } = useGetRatingsQuery();
  const [deleteRating] = useDeleteRatingMutation();
  const [moderateRating] = useModerateRatingMutation();
  const [statusFilter, setStatusFilter] = useState('');

  const allRatings = ratingsRes?.data || [];
  const ratings = statusFilter ? allRatings.filter(r => r.status === statusFilter) : allRatings;

  const handleModerate = async (id, status) => {
    try {
      await moderateRating({ id, status }).unwrap();
    } catch (err) {
      toast.error(`Failed to mark as ${status}`);
    }
  };

  const handleDelete = async (id) => {
    if(window.confirm('Delete this rating?')) {
      try {
        await deleteRating(id).unwrap();
      } catch(err) {
        toast.error('Failed to delete rating');
      }
    }
  };

  return (
    <div className="space-y-6">
      <Helmet>
        <title>Manage Ratings - Admin Panel</title>
      </Helmet>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-wide">Ratings Management</h1>
          <p className="text-slate-400 text-sm mt-1">Review user ratings and moderate suspicious voting activity.</p>
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-5 py-2.5 bg-[#111827] border border-slate-700/50 rounded-xl focus:outline-none focus:border-blue-500/50 transition-all text-sm w-full sm:w-auto text-slate-300 shadow-lg cursor-pointer"
        >
          <option value="">All Statuses</option>
          <option value="Pending">Pending</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
        </select>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#111827] border border-slate-800/80 rounded-2xl overflow-hidden shadow-lg shadow-black/20"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-[#0B0F19]/50 text-xs font-bold text-slate-400 uppercase tracking-wider">
                <th className="p-5 pl-6">User</th>
                <th className="p-5">Post</th>
                <th className="p-5">Rating</th>
                <th className="p-5">Status</th>
                <th className="p-5">Date</th>
                <th className="p-5 pr-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {isLoading && <tr><td colSpan="5" className="p-10 text-center text-slate-400">Loading...</td></tr>}
              {!isLoading && ratings.map((rating) => (
                <tr key={rating._id} className="hover:bg-slate-800/30 transition-colors group">
                  <td className="p-5 pl-6 font-bold text-white text-sm">{rating.user?.name || rating.name}</td>
                  <td className="p-5 text-sm font-bold text-indigo-400 hover:text-indigo-300 cursor-pointer transition-colors truncate max-w-[150px]">{rating.post?.title || 'Unknown Post'}</td>
                  <td className="p-5">
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, index) => (
                        <Star 
                          key={index} 
                          className={`w-4 h-4 ${index < rating.rating ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_5px_rgba(251,191,36,0.5)]' : 'text-slate-700'}`} 
                        />
                      ))}
                    </div>
                  </td>
                  <td className="p-5">
                    <span className={`flex items-center justify-center w-max px-3 py-1 rounded-full text-xs font-bold border ${
                      rating.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                      rating.status === 'Rejected' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                      'bg-amber-500/10 text-amber-400 border-amber-500/20'
                    }`}>
                      {rating.status}
                    </span>
                  </td>
                  <td className="p-5 text-sm text-slate-500">{new Date(rating.createdAt).toLocaleString()}</td>
                  <td className="p-5 pr-6 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                      {rating.status !== 'Approved' && (
                        <button onClick={() => handleModerate(rating._id, 'Approved')} title="Approve" className="p-2 bg-[#0B0F19] hover:bg-emerald-500/20 text-emerald-400 border border-slate-800 hover:border-emerald-500/50 rounded-lg transition-all">
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      )}
                      {rating.status !== 'Rejected' && (
                        <button onClick={() => handleModerate(rating._id, 'Rejected')} title="Reject" className="p-2 bg-[#0B0F19] hover:bg-orange-500/20 text-orange-400 border border-slate-800 hover:border-orange-500/50 rounded-lg transition-all">
                          <XCircle className="w-4 h-4" />
                        </button>
                      )}
                      <button onClick={() => handleDelete(rating._id)} title="Delete Rating" className="p-2 bg-[#0B0F19] hover:bg-rose-500/20 text-rose-400 border border-slate-800 hover:border-rose-500/50 rounded-lg transition-all">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminRatings;
