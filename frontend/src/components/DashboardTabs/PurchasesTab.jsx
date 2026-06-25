import { motion } from 'framer-motion';
import { ShoppingCart, CreditCard, Download, CheckCircle, Clock, XCircle, Box } from 'lucide-react';
import { Link } from 'react-router-dom';
import FallbackImage from '../FallbackImage';

const PurchasesTab = ({ purchases, premiumRequests }) => {
  return (
    <div className="space-y-6">
      {/* Purchased Apps */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
        <h3 className="text-xl font-bold dark:text-white mb-6 border-b border-slate-100 dark:border-slate-800 pb-4 flex items-center gap-2">
          <ShoppingCart className="w-5 h-5 text-primary" /> Purchased Apps
        </h3>
        
        {purchases?.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {purchases.map(purchase => (
              <div key={purchase._id} className="p-4 border border-slate-200/50 dark:border-white/10 rounded-xl bg-slate-100/50 dark:bg-slate-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-primary/30 transition group">
                <div className="flex items-center gap-3 w-full">
                  <FallbackImage src={purchase.post?.appLogo || purchase.post?.featuredImage} fallbackType="logo" alt="App Logo" className="w-14 h-14 rounded-xl object-cover shadow-sm group-hover:scale-105 transition" />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm dark:text-white truncate">
                      {purchase.post?.title || <span className="text-red-500 italic">App Deleted</span>}
                    </p>
                    <p className="text-xs text-slate-500 font-mono mt-0.5 truncate">TX: {purchase.transactionId || 'Granted'}</p>
                    <p className="text-xs text-slate-500 mt-1">{new Date(purchase.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex flex-col sm:items-end gap-2 mt-2 sm:mt-0 shrink-0">
                  {purchase.status && (
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full w-max ${
                      purchase.status === 'Approved' ? 'text-green-500 bg-green-500/10' :
                      purchase.status === 'Pending' ? 'text-orange-500 bg-orange-500/10' : 'text-red-500 bg-red-500/10'
                    }`}>
                      {purchase.status}
                    </span>
                  )}
                  {(!purchase.status || purchase.status === 'Approved') && purchase.post && (
                    <Link to={`/post/${purchase.post?.slug}`} className="text-xs font-bold flex items-center justify-center gap-1.5 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition shadow-lg shadow-primary/20 w-full sm:w-auto">
                      <Download className="w-4 h-4" /> Download
                    </Link>
                  )}
                  {(!purchase.status || purchase.status === 'Approved') && !purchase.post && (
                    <button disabled className="text-xs font-bold flex items-center justify-center gap-1.5 bg-slate-300 dark:bg-slate-700 text-slate-500 px-4 py-2 rounded-lg cursor-not-allowed w-full sm:w-auto">
                      <XCircle className="w-4 h-4" /> Unavailable
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-slate-500 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
            <Box className="w-12 h-12 mx-auto text-slate-300 mb-4" />
            <p className="font-medium">You haven't purchased any apps yet.</p>
            <Link to="/categories" className="inline-block mt-4 text-primary font-bold hover:underline">Explore Store</Link>
          </div>
        )}
      </motion.div>

      {/* Premium History */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6">
        <h3 className="text-xl font-bold dark:text-white mb-6 border-b border-slate-100 dark:border-slate-800 pb-4 flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-amber-500" /> Premium Memberships
        </h3>
        
        {premiumRequests?.length > 0 ? (
          <div className="space-y-4">
            {premiumRequests.map(req => (
              <div key={req._id} className="p-4 border border-slate-200/50 dark:border-white/10 rounded-xl bg-slate-100/50 dark:bg-slate-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4 w-full">
                  <div className={`p-3 rounded-xl shrink-0 ${
                    req.status === 'Approved' ? 'bg-green-500/10 text-green-500' :
                    req.status === 'Pending' ? 'bg-orange-500/10 text-orange-500' :
                    'bg-red-500/10 text-red-500'
                  }`}>
                    {req.status === 'Approved' ? <CheckCircle className="w-6 h-6" /> : 
                     req.status === 'Pending' ? <Clock className="w-6 h-6" /> : 
                     <XCircle className="w-6 h-6" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm dark:text-white truncate">{req.plan?.name || 'Premium Plan'}</p>
                    <p className="text-xs text-slate-500 font-mono mt-0.5 truncate">TX: {req.transactionId}</p>
                    <p className="text-xs text-slate-500 mt-1">{new Date(req.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="text-left sm:text-right shrink-0 mt-2 sm:mt-0 flex flex-col items-start sm:items-end gap-2">
                  <p className="font-black text-lg text-primary">₹{req.amount}</p>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                    req.status === 'Approved' ? 'text-green-500 bg-green-500/10' :
                    req.status === 'Pending' ? 'text-orange-500 bg-orange-500/10' : 'text-red-500 bg-red-500/10'
                  }`}>
                    {req.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-slate-500 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
            <CreditCard className="w-12 h-12 mx-auto text-slate-300 mb-4" />
            <p className="font-medium">No premium requests found.</p>
            <Link to="/premium" className="inline-block mt-4 text-amber-500 font-bold hover:underline">View Plans</Link>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default PurchasesTab;
