import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';

/**
 * PremiumAdWrapper
 * Automatically hides ads for premium users.
 * For non-premium users, it will render Google AdSense blocks.
 * 
 * Props:
 * - dataAdSlot: The slot ID provided by Google AdSense
 * - dataAdFormat: 'auto', 'rectangle', 'horizontal', 'vertical' (default 'auto')
 * - className: additional classes for styling the container
 */
const PremiumAdWrapper = ({ dataAdSlot = 'TEST_SLOT_ID', dataAdFormat = 'auto', className = '' }) => {
  const { user } = useSelector((state) => state.auth);

  // Load Google Ads script dynamically if not loaded
  useEffect(() => {
    try {
      if (!user?.isPremium && window && window.adsbygoogle) {
        window.adsbygoogle.push({});
      }
    } catch (e) {
      console.error('AdSense Error:', e);
    }
  }, [user?.isPremium]);

  // If the user has an active premium subscription, render nothing
  if (user?.isPremium) {
    return null;
  }

  return (
    <div className={`w-full overflow-hidden flex justify-center items-center my-4 ${className}`}>
      {/* Test Banner for Development - Will be replaced by real ad in production */}
      <div className="w-full h-auto min-h-[90px] bg-slate-100 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center p-4 relative overflow-hidden">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest absolute top-2 left-3">Advertisement</span>
        
        {/* AdSense ins tag */}
        <ins className="adsbygoogle"
             style={{ display: 'block', minWidth: '300px', minHeight: '90px' }}
             data-ad-client="ca-pub-XXXXXXXXXXXXXXXX" // Replace with real Publisher ID
             data-ad-slot={dataAdSlot}
             data-ad-format={dataAdFormat}
             data-full-width-responsive="true"></ins>
             
        <p className="text-slate-500 text-sm mt-4">Upgrade to <span className="font-bold text-primary">Premium</span> to remove ads.</p>
      </div>
    </div>
  );
};

export default PremiumAdWrapper;
