import CustomSearchBar from '../../components/CustomSearchBar';
import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { 
  useGetAllMoviePurchaseRequestsQuery, 
  useUpdateMoviePurchaseRequestStatusMutation 
} from '../../features/movie/moviePurchaseApiSlice';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import BackButton from '../../components/BackButton';
import { 
  CheckCircle, XCircle, Search, Eye, Filter, Loader2, X, Crown
, LayoutTemplate } from 'lucide-react';

const MoviePremiumRequests = () => {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const { data: requestsRes, isLoading, isFetching } = useGetAllMoviePurchaseRequestsQuery({
    page,
    limit: 10,
    status: statusFilter,
    search
  });

  const [updateStatus, { isLoading: isUpdating }] = useUpdateMoviePurchaseRequestStatusMutation();

  const requests = requestsRes?.data || [];
  const pagination = requestsRes?.pagination || {};

  const handleStatusUpdate = async (id, status) => {
    if (status === 'Rejected' && !rejectionReason.trim()) {
      return toast.error('Please provide a rejection reason');
    }

    try {
      await updateStatus({ id, status, rejectionReason }).unwrap();
      toast.success(`Request ${status} successfully`);
      setSelectedRequest(null);
      setRejectionReason('');
    } catch (error) {
      toast.error(error.data?.message || `Failed to update request`);
    }
  };

  return (
    <div className="p-6">
      <Helmet>
        <title>Premium Movie Requests | Super Admin</title>
      </Helmet>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Crown className="w-6 h-6 text-amber-500" />
            Premium Movie Requests
          </h1>
          <p className="text-slate-500">Manage user purchase requests for premium movies.</p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white dark:bg-[#111] p-4 rounded-xl border border-slate-200 dark:border-white/5 mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <CustomSearchBar value={search} placeholder="Search by User or Transaction ID..." name="text"  onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="relative min-w-[150px]">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg focus:outline-none focus:border-purple-500 text-sm appearance-none"
          >
            <option value="">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-white dark:bg-[#111] rounded-xl border border-slate-200 dark:border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-white/5 border-b border-slate-200 dark:border-white/5">
                <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">User</th>
                <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Movie</th>
                <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Amount</th>
                <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Transaction ID</th>
                <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-white/5">
              {isLoading || isFetching ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-purple-500" />
                  </td>
                </tr>
              ) : requests.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-slate-500">No requests found.</td>
                </tr>
              ) : (
                requests.map((request) => (
                  <tr key={request._id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img src={request.user?.profileImage || '/default-avatar.png'} alt="User" className="w-8 h-8 rounded-full object-cover" />
                        <div>
                          <p className="text-sm font-medium text-slate-900 dark:text-white">{request.user?.name}</p>
                          <p className="text-xs text-slate-500">{request.user?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img src={request.movie?.posterImage} alt="Movie" className="w-8 h-12 rounded object-cover" />
                        <p className="text-sm font-medium text-slate-900 dark:text-white line-clamp-2">{request.movie?.title}</p>
                      </div>
                    </td>
                    <td className="p-4 text-sm font-bold text-slate-900 dark:text-white">${request.amount}</td>
                    <td className="p-4 text-sm font-mono text-slate-500">{request.transactionId}</td>
                    <td className="p-4 text-sm text-slate-500">{format(new Date(request.createdAt), 'MMM dd, yyyy HH:mm')}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                        request.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-500' :
                        request.status === 'Rejected' ? 'bg-red-500/10 text-red-500' :
                        'bg-amber-500/10 text-amber-500'
                      }`}>
                        {request.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <button 
                        onClick={() => setSelectedRequest(request)}
                        className="p-2 text-slate-400 hover:text-purple-500 hover:bg-purple-500/10 rounded-lg transition-colors"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="p-4 border-t border-slate-200 dark:border-white/5 flex justify-between items-center">
            <button
              disabled={page === 1}
              onClick={() => setPage(prev => prev - 1)}
              className="px-4 py-2 text-sm bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 rounded disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-sm text-slate-500">Page {page} of {pagination.totalPages}</span>
            <button
              disabled={page === pagination.totalPages}
              onClick={() => setPage(prev => prev + 1)}
              className="px-4 py-2 text-sm bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Review Modal */}
      <AnimatePresence>
        {selectedRequest && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-[#1A1A1A] w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="flex justify-between items-center p-6 border-b border-slate-200 dark:border-white/5">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Review Purchase Request</h3>
                <button onClick={() => setSelectedRequest(null)} className="text-slate-400 hover:text-white">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6 max-h-[70vh] overflow-y-auto">
                <div className="grid grid-cols-2 gap-6 mb-6">
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">User</p>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">{selectedRequest.user?.name}</p>
                    <p className="text-xs text-slate-500">{selectedRequest.user?.email}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Movie</p>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">{selectedRequest.movie?.title}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Amount Paid</p>
                    <p className="text-sm font-bold text-emerald-500">${selectedRequest.amount}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Transaction ID</p>
                    <p className="text-sm font-mono text-slate-900 dark:text-white">{selectedRequest.transactionId}</p>
                  </div>
                </div>

                <div className="mb-6">
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Payment Proof</p>
                  <a href={selectedRequest.proofImage} target="_blank" rel="noreferrer">
                    <img 
                      src={selectedRequest.proofImage} 
                      alt="Proof" 
                      className="w-full max-h-[400px] object-contain bg-slate-100 dark:bg-black rounded-lg border border-slate-200 dark:border-white/10" 
                    />
                  </a>
                </div>

                {selectedRequest.status === 'Pending' && (
                  <div className="mt-6 border-t border-slate-200 dark:border-white/5 pt-6">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Rejection Reason (Optional for Approval)</label>
                    <textarea
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="Required if rejecting..."
                      className="w-full p-3 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg focus:outline-none focus:border-purple-500 text-sm mb-4 min-h-[100px]"
                    />

                    <div className="flex gap-4">
                      <button
                        onClick={() => handleStatusUpdate(selectedRequest._id, 'Approved')}
                        disabled={isUpdating}
                        className="flex-1 flex justify-center items-center gap-2 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold transition-colors disabled:opacity-50"
                      >
                        <CheckCircle className="w-5 h-5" />
                        {isUpdating ? 'Processing...' : 'Approve Purchase'}
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(selectedRequest._id, 'Rejected')}
                        disabled={isUpdating}
                        className="flex-1 flex justify-center items-center gap-2 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl font-bold transition-colors disabled:opacity-50"
                      >
                        <XCircle className="w-5 h-5" />
                        Reject Request
                      </button>
                    </div>
                  </div>
                )}
                
                {selectedRequest.status !== 'Pending' && (
                   <div className="mt-6 p-4 rounded-lg bg-slate-50 dark:bg-white/5">
                      <p className="text-sm text-slate-500">This request has already been processed and is marked as <span className="font-bold">{selectedRequest.status}</span>.</p>
                      {selectedRequest.rejectionReason && (
                        <p className="text-sm text-red-400 mt-2">Reason: {selectedRequest.rejectionReason}</p>
                      )}
                   </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MoviePremiumRequests;
