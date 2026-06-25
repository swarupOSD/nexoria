import React, { useState } from 'react';
import { useGetPremiumRequestsQuery, useApprovePremiumRequestMutation, useRejectPremiumRequestMutation } from '../../features/api/paymentApiSlice';
import { toast } from 'react-hot-toast';
import { Check, X, Eye, FileText, CheckCircle, XCircle, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const PremiumRequests = () => {
  const { data: requestsRes, isLoading } = useGetPremiumRequestsQuery();
  const [approveRequest] = useApprovePremiumRequestMutation();
  const [rejectRequest] = useRejectPremiumRequestMutation();
  
  const [selectedProof, setSelectedProof] = useState(null);

  if (isLoading) return <div className="p-8 text-center"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div></div>;

  const requests = requestsRes?.data || [];

  const handleApprove = async (id) => {
    if (!window.confirm('Are you sure you want to approve this premium request?')) return;
    try {
      await approveRequest(id).unwrap();
      toast.success('Request approved successfully!');
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to approve');
    }
  };

  const handleReject = async (id) => {
    const reason = window.prompt('Enter rejection reason:');
    if (!reason) return;
    try {
      await rejectRequest({ id, reason }).unwrap();
      toast.success('Request rejected.');
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to reject');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Approved': return <span className="flex items-center gap-1 text-xs font-bold text-success bg-success/10 px-2 py-1 rounded-full border border-success/20"><CheckCircle className="w-3 h-3" /> Approved</span>;
      case 'Rejected': return <span className="flex items-center gap-1 text-xs font-bold text-danger bg-danger/10 px-2 py-1 rounded-full border border-danger/20"><XCircle className="w-3 h-3" /> Rejected</span>;
      default: return <span className="flex items-center gap-1 text-xs font-bold text-warning bg-warning/10 px-2 py-1 rounded-full border border-warning/20"><Clock className="w-3 h-3" /> Pending</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-white dark:bg-[#111111] p-6 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Premium Requests</h1>
          <p className="text-sm text-slate-500 mt-1">Manage user premium membership payments.</p>
        </div>
      </div>

      <div className="bg-white dark:bg-[#111111] border border-slate-200 dark:border-white/5 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-black/50 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">
                <th className="p-4 font-semibold">User</th>
                <th className="p-4 font-semibold">Plan</th>
                <th className="p-4 font-semibold">Amount</th>
                <th className="p-4 font-semibold">Transaction ID</th>
                <th className="p-4 font-semibold">Proof</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-white/5 text-sm">
              {requests.map(req => (
                <tr key={req._id} className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <img src={req.user?.profileImage || '/default-avatar.png'} alt="" className="w-8 h-8 rounded-full object-cover" />
                      <div>
                        <p className="font-bold text-slate-800 dark:text-slate-200">{req.user?.name}</p>
                        <p className="text-xs text-slate-500">{req.user?.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-slate-700 dark:text-slate-300 font-medium">
                    {req.plan?.name || 'Unknown Plan'}
                  </td>
                  <td className="p-4 font-bold text-slate-800 dark:text-white">
                    ₹{req.amount}
                  </td>
                  <td className="p-4 font-mono text-xs text-slate-500 dark:text-slate-400">
                    {req.transactionId}
                  </td>
                  <td className="p-4">
                    <button 
                      onClick={() => setSelectedProof(req.proofImage)}
                      className="flex items-center gap-2 text-xs font-semibold bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 px-3 py-1.5 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-500/20 transition"
                    >
                      <Eye className="w-3 h-3" /> View
                    </button>
                  </td>
                  <td className="p-4">
                    {getStatusBadge(req.status)}
                  </td>
                  <td className="p-4 text-right">
                    {req.status === 'Pending' && (
                      <div className="flex justify-end gap-2">
                        <button onClick={() => handleApprove(req._id)} className="p-2 bg-success/10 text-success hover:bg-success hover:text-white rounded-lg transition" title="Approve">
                          <Check className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleReject(req._id)} className="p-2 bg-danger/10 text-danger hover:bg-danger hover:text-white rounded-lg transition" title="Reject">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {requests.length === 0 && (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-slate-500">
                    <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    No premium requests found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {selectedProof && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setSelectedProof(null)}>
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-3xl max-h-[90vh] overflow-hidden rounded-2xl border border-white/10"
              onClick={e => e.stopPropagation()}
            >
              <img src={selectedProof} alt="Payment Proof" className="w-full h-auto max-h-[85vh] object-contain bg-black" />
              <button onClick={() => setSelectedProof(null)} className="absolute top-4 right-4 p-2 bg-black/50 text-white hover:bg-red-500 rounded-full transition">
                <X className="w-5 h-5" />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PremiumRequests;
