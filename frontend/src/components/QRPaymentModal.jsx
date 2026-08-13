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
        className="bg-surface-container border border-outline-variant/30 rounded-3xl shadow-2xl w-full max-w-4xl relative z-10 overflow-hidden flex flex-col md:flex-row max-h-[90vh]"
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-10 h-10 bg-surface-container-high/50 hover:bg-surface-container-high text-on-surface rounded-full flex items-center justify-center transition-colors border border-outline-variant/30"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left Side: QR Code & Instructions */}
        <div className="w-full md:w-1/2 bg-surface-container-low p-8 md:p-10 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-outline-variant/30 relative">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-primary/5 to-transparent pointer-events-none"></div>
          
          <h3 className="font-display-lg text-headline-sm text-on-surface mb-2 text-center tracking-tight font-bold">Complete Payment</h3>
          <p className="font-body-md text-on-surface-variant mb-8 text-center text-sm">
            Scan the QR code below to pay <strong className="text-primary font-bold">₹{amount}</strong> for {itemName}
          </p>

            <div className="bg-white p-4 rounded-2xl shadow-[0_0_40px_rgba(208,188,255,0.15)] mb-3 relative group border border-outline-variant/20">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/30 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity blur-xl -z-10"></div>
              <img 
                src={qrSrc}
                alt="Payment QR Code" 
                className="w-56 h-56 object-contain rounded-xl"
                onError={(e) => { e.target.src = '/my-qr.jpg'; }}
              />
            </div>

            {/* Plan label below QR */}
            <div className="text-center mb-4">
              <span className="inline-block bg-surface-container-high border border-outline-variant/30 text-on-surface font-label-sm text-[10px] px-4 py-1.5 rounded uppercase tracking-widest shadow-md">
                {getDurationLabel()} — ₹{amount}
              </span>
            </div>

          <div className="text-center mb-6">
            <p className="font-label-sm text-[10px] text-on-surface-variant uppercase tracking-widest mb-1">UPI ID</p>
            <p className="font-body-md text-xl font-bold text-on-surface tracking-wider">{paymentSettings.upiId || 'Not Configured'}</p>
          </div>

          <div className="bg-surface-container/50 border border-outline-variant/30 rounded-xl p-4 w-full">
            <h4 className="font-label-sm text-[10px] font-bold text-primary uppercase tracking-widest mb-2 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" /> Instructions
            </h4>
            <div className="font-body-md text-on-surface-variant text-xs leading-relaxed whitespace-pre-wrap">
              {paymentSettings.paymentInstructions || "Please transfer the exact amount and submit the transaction ID."}
            </div>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="w-full md:w-1/2 p-8 md:p-10 bg-surface-container overflow-y-auto no-scrollbar">
          <h3 className="font-display-lg text-headline-sm text-on-surface mb-6 tracking-tight font-bold">Submit Details</h3>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block font-label-sm text-[10px] text-on-surface-variant uppercase tracking-widest mb-2">
                12-Digit Transaction ID / UTR
              </label>
              <input 
                type="text" 
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                placeholder="e.g. 312345678901"
                className="w-full p-4 bg-surface-container-low border border-outline-variant/30 rounded-xl text-on-surface font-body-md placeholder-on-surface-variant/50 focus:outline-none focus:border-primary/50 transition-colors"
                required
              />
            </div>

            <div>
              <label className="block font-label-sm text-[10px] text-on-surface-variant uppercase tracking-widest mb-2">
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
                <div className={`w-full h-40 border-2 border-dashed rounded-xl flex flex-col items-center justify-center transition-colors ${previewUrl ? 'border-primary/50 bg-primary/5' : 'border-outline-variant/30 bg-surface-container-low group-hover:border-primary/30 group-hover:bg-primary/5'}`}>
                  {previewUrl ? (
                    <div className="relative w-full h-full p-2">
                      <img src={previewUrl} alt="Preview" className="w-full h-full object-contain rounded-lg" />
                      <div className="absolute top-4 right-4 bg-primary text-on-primary rounded-full p-1 shadow-lg">
                        <CheckCircle className="w-5 h-5" />
                      </div>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-on-surface-variant mb-3 group-hover:text-primary transition-colors" />
                      <p className="font-body-md text-sm font-medium text-on-surface">Click or drag image here</p>
                      <p className="font-label-sm text-[10px] text-on-surface-variant uppercase tracking-widest mt-2">PNG, JPG, JPEG up to 5MB</p>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-4">
              <button 
                type="submit" 
                disabled={isSubmitting || !transactionId || !proofImage}
                className="w-full bg-primary text-on-primary py-4 rounded font-label-sm text-label-sm uppercase tracking-widest hover:bg-primary-fixed transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center font-bold"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin"></div>
                    Processing...
                  </span>
                ) : 'Submit Payment Request'}
              </button>
            </div>

            {userCoins !== undefined && amount > 0 && (
              <div className="pt-2 border-t border-outline-variant/30 mt-4">
                <button 
                  type="button" 
                  onClick={() => onCoinPurchase && onCoinPurchase()}
                  disabled={isSubmitting || userCoins < amount}
                  className={`w-full py-4 rounded font-label-sm text-label-sm uppercase tracking-widest flex items-center justify-center gap-2 transition-all font-bold ${
                    userCoins >= amount 
                      ? 'bg-tertiary/10 text-tertiary border border-tertiary/30 hover:bg-tertiary hover:text-on-tertiary' 
                      : 'bg-surface-container text-on-surface-variant border border-outline-variant/30 cursor-not-allowed'
                  }`}
                >
                  <span className="text-lg leading-none">🪙</span>
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
