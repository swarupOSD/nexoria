import { useState, useEffect } from 'react';
import { Gift, Coins, AlertCircle, RefreshCw } from 'lucide-react';
import { useGetSettingsQuery } from '../../../features/settings/settingsApiSlice';
import { useSelector } from 'react-redux';

const EarnTab = () => {
  const { data: settingsRes, isLoading } = useGetSettingsQuery();
  const user = useSelector((state) => state.auth.user);
  const [iframeUrl, setIframeUrl] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (settingsRes?.data?.offerwallSettings?.enabled && settingsRes?.data?.offerwallSettings?.offerwallUrl) {
      const baseUrl = settingsRes.data.offerwallSettings.offerwallUrl;
      // Append subid correctly based on whether URL already has query params
      const separator = baseUrl.includes('?') ? '&' : '?';
      setIframeUrl(`${baseUrl}${separator}subid=${user?._id || ''}`);
    } else {
      setIframeUrl('');
    }
  }, [settingsRes, user]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const isEnabled = settingsRes?.data?.offerwallSettings?.enabled;

  if (!isEnabled) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Gift className="w-20 h-20 text-slate-700 mb-6" />
        <h2 className="text-2xl font-black text-white mb-2">Offers Currently Unavailable</h2>
        <p className="text-slate-400 max-w-md">
          There are no offers available at the moment. Please check back later to earn more Reward Points!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="bg-gradient-to-r from-primary/10 to-transparent p-6 rounded-2xl border border-primary/20">
        <h2 className="text-2xl font-black text-white flex items-center gap-3 mb-2">
          <Coins className="w-7 h-7 text-amber-500" />
          Earn Free Aura / Points
        </h2>
        <p className="text-slate-300">
          Complete simple tasks like downloading an app or taking a survey below. Your points will be automatically credited to your account!
        </p>
        
        <div className="flex items-center gap-2 mt-4 p-3 bg-[#111] rounded-xl text-xs text-amber-200 border border-amber-500/20">
          <AlertCircle className="w-4 h-4 shrink-0 text-amber-500" />
          <p>Please wait 5-10 minutes after completing a task for the points to appear in your balance. Do not close the window while a task is in progress.</p>
        </div>
      </div>

      {/* Offerwall Iframe */}
      <div className="bg-[#111] rounded-2xl border border-slate-200 dark:border-night-border overflow-hidden relative min-h-[600px] w-full shadow-2xl">
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#111] z-10">
            <RefreshCw className="w-10 h-10 text-primary animate-spin mb-4" />
            <p className="text-slate-400 font-medium">Loading Offers...</p>
          </div>
        )}
        
        {iframeUrl ? (
          <iframe 
            src={iframeUrl} 
            className="w-full h-[800px] border-none"
            title="Offerwall"
            onLoad={() => setLoading(false)}
            sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
          ></iframe>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#111]">
            <p className="text-slate-400 font-medium">Invalid Offerwall Configuration</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EarnTab;
