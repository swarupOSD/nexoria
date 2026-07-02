import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useGetPremiumRequestsQuery, useApprovePremiumRequestMutation, useRejectPremiumRequestMutation } from '../../features/api/paymentApiSlice';
import { Check, X, Eye, ExternalLink , LayoutTemplate } from 'lucide-react';
import BackButton from '../../components/BackButton';

const AdminPremiumRequests = () => {
  const { data: paymentsRes, isLoading, refetch } = useGetPremiumRequestsQuery();
  const [approvePayment] = useApprovePremiumRequestMutation();
  const [rejectPayment] = useRejectPremiumRequestMutation();

  const [selectedPayment, setSelectedPayment] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const payments = paymentsRes?.data || [];

  const handleApprove = async (id) => {
    if (window.confirm('Approve this payment and activate premium?')) {
      await approvePayment(id);
      refetch();
    }
  };

  const handleReject = async (id) => {
    if (window.confirm('Reject this payment?')) {
      await rejectPayment(id);
      refetch();
    }
  };

  const openModal = (payment) => {
    setSelectedPayment(payment);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <Helmet>
        <title>Premium Requests - Admin</title>
      </Helmet>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="flex items-center gap-3">
          <BackButton fallbackRoute="/superadmin" showText={false} />
          <div>
            <h1 className="text-2xl font-bold dark:text-white flex items-center gap-2">
              <LayoutTemplate className="w-6 h-6 text-primary" />
              Premium Requests
            </h1>
            <p className="text-slate-500 text-sm mt-1">Review and manage manual premium payments.</p>
          </div>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">
                <th className="p-4 font-semibold">User Info</th>
                <th className="p-4 font-semibold">Plan Details</th>
                <th className="p-4 font-semibold">Payment Details</th>
                <th className="p-4 font-semibold">Date</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {isLoading ? (
                <tr><td colSpan="6" className="p-4 text-center">Loading requests...</td></tr>
              ) : payments.map((payment) => (
                <tr key={payment._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <img src={payment.user?.profileImage || '/default.jpg'} alt="Avatar" className="w-10 h-10 rounded-full border border-slate-200 dark:border-slate-700 object-cover" />
                      <div>
                        <div className="font-semibold dark:text-white text-sm">{payment.user?.name}</div>
                        <div className="text-xs text-slate-500">{payment.user?.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="text-sm font-bold dark:text-white">{payment.plan?.name}</div>
                    <div className="text-xs text-slate-500">{payment.plan?.durationDays === 99999 ? 'Lifetime' : `${payment.plan?.durationDays} Days`}</div>
                  </td>
                  <td className="p-4">
                    <div className="text-sm font-bold text-blue-600 dark:text-blue-400">{payment.currency} {payment.amount}</div>
                    <div className="text-xs text-slate-500">{payment.paymentMethod} • {payment.transactionId}</div>
                  </td>
                  <td className="p-4 text-sm text-slate-500">{new Date(payment.createdAt).toLocaleDateString()}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${
                      payment.status === 'Paid' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 
                      payment.status === 'Pending' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                      'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                    }`}>
                      {payment.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openModal(payment)} title="View Proof" className="p-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition">
                        <Eye className="w-4 h-4" />
                      </button>
                      {payment.status === 'Pending' && (
                        <>
                          <button onClick={() => handleApprove(payment._id)} title="Approve" className="p-1.5 bg-green-100 text-green-600 hover:bg-green-200 rounded-lg transition">
                            <Check className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleReject(payment._id)} title="Reject" className="p-1.5 bg-red-100 text-red-600 hover:bg-red-200 rounded-lg transition">
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Proof Modal */}
      <AnimatePresence>
        {isModalOpen && selectedPayment && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="glass-card relative w-full max-w-2xl p-6 shadow-2xl z-10 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold dark:text-white">Payment Proof</h2>
                <button onClick={() => setIsModalOpen(false)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              <div className="mb-4 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-500">Transaction ID</p>
                  <p className="font-mono text-sm dark:text-slate-300">{selectedPayment.transactionId}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Method</p>
                  <p className="text-sm font-semibold dark:text-slate-300">{selectedPayment.paymentMethod}</p>
                </div>
              </div>

              <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex justify-center">
                {selectedPayment.proofImage ? (
                  <img src={selectedPayment.proofImage} alt="Payment Proof" className="max-h-96 object-contain" />
                ) : (
                  <p className="p-10 text-slate-500">No proof image provided.</p>
                )}
              </div>

              <div className="mt-6 flex justify-end gap-3">
                {selectedPayment.proofImage && (
                  <a href={selectedPayment.proofImage} target="_blank" rel="noreferrer" className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg flex items-center gap-2 font-semibold text-sm transition">
                    <ExternalLink className="w-4 h-4" /> Open Original
                  </a>
                )}
                {selectedPayment.status === 'Pending' && (
                  <>
                    <button onClick={() => { handleReject(selectedPayment._id); setIsModalOpen(false); }} className="px-4 py-2 bg-red-100 text-red-600 hover:bg-red-200 rounded-lg font-semibold text-sm transition">Reject</button>
                    <button onClick={() => { handleApprove(selectedPayment._id); setIsModalOpen(false); }} className="px-4 py-2 bg-green-500 text-white hover:bg-green-600 rounded-lg font-semibold text-sm transition shadow-lg shadow-green-500/30">Approve Payment</button>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminPremiumRequests;
