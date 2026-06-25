import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, CheckCircle, ShieldCheck } from 'lucide-react';
import { useGetSettingsQuery } from '../features/settings/settingsApiSlice';

const QRPaymentModal = ({ isOpen, onClose, amount, itemName, planDuration, onSubmit, isSubmitting, userCoins, onCoinPurchase }) => {
  const { data: settingsRes } = useGetSettingsQuery();
  const paymentSettings = settingsRes?.data?.paymentSettings || {};
  
  const [transactionId, setTransactionId] = useState('');
  const [proofImage, setProofImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const upiId = paymentSettings.upiId || 'snehashisroy106@oksbi';
  const upiLink = `upi://pay?pa=${upiId}&pn=PremiumApps&am=${amount}&cu=INR&tn=${encodeURIComponent(itemName || 'Premium')}`;
  const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=224x224&data=${encodeURIComponent(upiLink)}&bgcolor=ffffff&color=000000&margin=10`;

  // Reset state when opened
  useEffect(() => {
    if (isOpen) {
      setTransactionId('');
      setProofImage(null);
      setPreviewUrl(null);
    }
  }, [isOpen]);

  // Derive a friendly duration label from planDuration prop or itemName
  const getDurationLabel = () => {
    if (planDuration) return planDuration;
    const lower = (itemName || '').toLowerCase();
    if (lower.includes('week')) return 'Weekly';
    if (lower.includes('3 month') || lower.includes('3month')) return '3 Months';
    if (lower.includes('year')) return 'Yearly';
    if (lower.includes('month')) return 'Monthly';
    return itemName || '';
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProofImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!transactionId || !proofImage) return;
    onSubmit({ transactionId, proofImage });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 sm:px-0">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/80 backdrop-blur-md" 
        onClick={onClose}
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="bg-[#111] border border-white/10 rounded-3xl shadow-2xl w-full max-w-4xl relative z-10 overflow-hidden flex flex-col md:flex-row max-h-[90vh]"
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-10 h-10 bg-black/50 hover:bg-black text-white rounded-full flex items-center justify-center transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left Side: QR Code & Instructions */}
        <div className="w-full md:w-1/2 bg-[#0A0A0A] p-8 md:p-10 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-white/5 relative">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-purple-500/10 to-transparent pointer-events-none"></div>
          
          <h3 className="text-2xl font-bold text-white mb-2 text-center">Complete Payment</h3>
          <p className="text-slate-400 mb-8 text-center text-sm">
            Scan the QR code below to pay <strong className="text-white">₹{amount}</strong> for {itemName}
          </p>

            <div className="bg-white p-4 rounded-2xl shadow-[0_0_40px_rgba(168,85,247,0.3)] mb-3 relative group">
              <div className="absolute inset-0 bg-gradient-to-tr from-purple-500 to-orange-500 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity blur-xl -z-10"></div>
              <img 
                src={qrSrc}
                alt="Payment QR Code" 
                className="w-56 h-56 object-contain rounded-xl"
                onError={(e) => { e.target.src = '/my-qr.jpg'; }}
              />
            </div>

            {/* Plan label below QR */}
            <div className="text-center mb-4">
              <span className="inline-block bg-gradient-to-r from-purple-600 to-orange-500 text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-widest shadow-md">
                {getDurationLabel()} — ₹{amount}
              </span>
            </div>

          <div className="text-center mb-6">
            <p className="text-slate-400 text-sm mb-1">UPI ID</p>
            <p className="text-xl font-bold text-white tracking-wider">{paymentSettings.upiId || 'Not Configured'}</p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-4 w-full">
            <h4 className="text-sm font-bold text-purple-400 mb-2 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" /> Instructions
            </h4>
            <div className="text-slate-300 text-xs leading-relaxed whitespace-pre-wrap">
              {paymentSettings.paymentInstructions || "Please transfer the exact amount and submit the transaction ID."}
            </div>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="w-full md:w-1/2 p-8 md:p-10 bg-[#111] overflow-y-auto custom-scrollbar">
          <h3 className="text-xl font-bold text-white mb-6">Submit Details</h3>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                12-Digit Transaction ID / UTR
              </label>
              <input 
                type="text" 
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                placeholder="e.g. 312345678901"
                className="w-full p-4 bg-black/50 border border-white/10 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Payment Screenshot
              </label>
              
              <div className="relative group">
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={handleImageChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  required
                />
                <div className={`w-full h-40 border-2 border-dashed rounded-xl flex flex-col items-center justify-center transition-colors ${previewUrl ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-white/20 bg-black/30 group-hover:border-purple-500/50 group-hover:bg-purple-500/5'}`}>
                  {previewUrl ? (
                    <div className="relative w-full h-full p-2">
                      <img src={previewUrl} alt="Preview" className="w-full h-full object-contain rounded-lg" />
                      <div className="absolute top-4 right-4 bg-emerald-500 text-white rounded-full p-1 shadow-lg">
                        <CheckCircle className="w-5 h-5" />
                      </div>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-slate-400 mb-3 group-hover:text-purple-400 transition-colors" />
                      <p className="text-sm font-medium text-slate-300">Click or drag image here</p>
                      <p className="text-xs text-slate-500 mt-1">PNG, JPG, JPEG up to 5MB</p>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-4">
              <button 
                type="submit" 
                disabled={isSubmitting || !transactionId || !proofImage}
                className="w-full bg-gradient-to-r from-purple-600 to-orange-500 text-white py-4 rounded-xl font-bold hover:from-purple-500 hover:to-orange-400 transition-all shadow-lg shadow-purple-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Processing...
                  </span>
                ) : 'Submit Payment Request'}
              </button>
            </div>

            {userCoins !== undefined && amount > 0 && (
              <div className="pt-2 border-t border-white/10 mt-4">
                <button 
                  type="button" 
                  onClick={() => onCoinPurchase && onCoinPurchase()}
                  disabled={isSubmitting || userCoins < amount}
                  className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                    userCoins >= amount 
                      ? 'bg-amber-500/20 text-amber-500 border border-amber-500/30 hover:bg-amber-500 hover:text-white' 
                      : 'bg-white/5 text-slate-500 border border-white/5 cursor-not-allowed'
                  }`}
                >
                  <span className="text-xl">🪙</span>
                  {userCoins >= amount ? `Pay with Coins (${amount} Coins)` : `Not enough Coins (${userCoins}/${amount})`}
                </button>
              </div>
            )}
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default QRPaymentModal;
