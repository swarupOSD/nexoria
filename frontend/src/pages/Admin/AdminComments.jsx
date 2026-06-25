import { Helmet } from 'react-helmet-async';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Trash2, MessageSquare } from 'lucide-react';
import { useState } from 'react';

import { useGetCommentsQuery, useModerateCommentMutation, useDeleteCommentMutation } from '../../features/comment/commentApiSlice';

const AdminComments = () => {
  const { data: commentsRes, isLoading, isError } = useGetCommentsQuery();
  const [moderateComment] = useModerateCommentMutation();
  const [deleteComment] = useDeleteCommentMutation();
  const [statusFilter, setStatusFilter] = useState('');

  const allComments = commentsRes?.data || [];
  const comments = statusFilter ? allComments.filter(c => c.status === statusFilter) : allComments;

  const handleModerate = async (id, status) => {
    try {
      await moderateComment({ id, status }).unwrap();
    } catch (err) {
      toast.error(`Failed to mark as ${status}`);
    }
  };

  const handleDelete = async (id) => {
    if(window.confirm('Delete this comment?')) {
      try {
        await deleteComment(id).unwrap();
      } catch (err) {
        toast.error('Failed to delete');
      }
    }
  };

  return (
    <div className="space-y-6">
      <Helmet>
        <title>Manage Comments - Admin Panel</title>
      </Helmet>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-wide">Comments Moderation</h1>
          <p className="text-slate-400 text-sm mt-1">Approve, reject, or delete user comments on your posts.</p>
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
                <th className="p-5">Comment</th>
                <th className="p-5">On Post</th>
                <th className="p-5">Status</th>
                <th className="p-5 pr-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {isLoading && <tr><td colSpan="5" className="p-10 text-center text-slate-400">Loading...</td></tr>}
              {!isLoading && comments.map((comment) => (
                <tr key={comment._id} className="hover:bg-slate-800/30 transition-colors group">
                  <td className="p-5 pl-6">
                    <div className="font-bold text-white text-sm mb-0.5">{comment.user?.name || comment.name}</div>
                    <div className="text-xs text-slate-500">{comment.user?.email || comment.email}</div>
                  </td>
                  <td className="p-5 max-w-xs">
                    <div className="flex gap-3">
                      <MessageSquare className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm text-slate-300 font-medium truncate" title={comment.content}>{comment.content}</p>
                        <span className="text-xs text-slate-500 mt-1 block">{new Date(comment.createdAt).toLocaleString()}</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-5 text-sm font-bold text-indigo-400 hover:text-indigo-300 cursor-pointer transition-colors truncate max-w-[150px]">{comment.post?.title || 'Unknown Post'}</td>
                  <td className="p-5">
                    <span className={`flex items-center justify-center w-max px-3 py-1 rounded-full text-xs font-bold border ${
                      comment.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                      comment.status === 'Rejected' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                      'bg-amber-500/10 text-amber-400 border-amber-500/20'
                    }`}>
                      {comment.status}
                    </span>
                  </td>
                  <td className="p-5 pr-6 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                      {comment.status !== 'Approved' && (
                        <button onClick={() => handleModerate(comment._id, 'Approved')} title="Approve" className="p-2 bg-[#0B0F19] hover:bg-emerald-500/20 text-emerald-400 border border-slate-800 hover:border-emerald-500/50 rounded-lg transition-all">
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      )}
                      {comment.status !== 'Rejected' && (
                        <button onClick={() => handleModerate(comment._id, 'Rejected')} title="Reject" className="p-2 bg-[#0B0F19] hover:bg-orange-500/20 text-orange-400 border border-slate-800 hover:border-orange-500/50 rounded-lg transition-all">
                          <XCircle className="w-4 h-4" />
                        </button>
                      )}
                      <button onClick={() => handleDelete(comment._id)} title="Delete" className="p-2 bg-[#0B0F19] hover:bg-rose-500/20 text-rose-400 border border-slate-800 hover:border-rose-500/50 rounded-lg transition-all">
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

export default AdminComments;
