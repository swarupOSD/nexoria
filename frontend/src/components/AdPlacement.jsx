import React, { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useGetAdvertisementsQuery } from '../features/advertisement/advertisementApiSlice';
import { useGetSettingsQuery } from '../features/settings/settingsApiSlice';

const IframeAd = ({ adCode, idx }) => {
  const iframeRef = useRef(null);

  useEffect(() => {
    if (iframeRef.current) {
      const doc = iframeRef.current.contentDocument || iframeRef.current.contentWindow?.document;
      if (doc) {
        doc.open();
        doc.write(`
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <style>body { margin: 0; padding: 0; display: flex; justify-content: center; align-items: center; background: transparent; overflow: hidden; }</style>
          </head>
          <body>
            ${adCode}
          </body>
          </html>
        `);
        doc.close();
      }
    }
  }, [adCode]);

  return (
    <iframe
      ref={iframeRef}
      title={`Ad-${idx}`}
      sandbox="allow-scripts allow-popups allow-popups-to-escape-sandbox allow-same-origin"
      scrolling="no"
      frameBorder="0"
      className="w-full border-none overflow-hidden"
      style={{ minHeight: '120px' }}
    />
  );
};

const AdPlacement = ({ location, className = '' }) => {
  const { user } = useSelector(state => state.auth);
  const containerRef = useRef(null);
  
  const isAdmin = user && (user.role === 'admin' || user.role === 'superadmin');
  const isPremiumUser = user && user.isPremium;
  
  const { data: adsResponse, isLoading: isLoadingAds } = useGetAdvertisementsQuery(undefined, { skip: isAdmin || isPremiumUser });
  const { data: settingsRes, isLoading: isLoadingSettings } = useGetSettingsQuery();
  
  useEffect(() => {
    if (!isAdmin && !isPremiumUser && !isLoadingAds && !isLoadingSettings && adsResponse?.data) {
      const adsEnabled = settingsRes?.data?.ads?.enabled !== false;
      const ads = adsResponse.data.filter(ad => ad.location === location && ad.enabled);
      
      if (adsEnabled && ads.length > 0 && containerRef.current) {
        const scripts = containerRef.current.querySelectorAll('script');
        scripts.forEach(oldScript => {
          if (oldScript.dataset.processed) return;
          
          const newScript = document.createElement('script');
          Array.from(oldScript.attributes).forEach(attr => newScript.setAttribute(attr.name, attr.value));
          newScript.appendChild(document.createTextNode(oldScript.innerHTML));
          oldScript.parentNode.replaceChild(newScript, oldScript);
          newScript.dataset.processed = "true";
        });
      }
    }
  });

  if (isAdmin || isPremiumUser) return null;
  if (isLoadingAds || isLoadingSettings || !adsResponse?.data) return null;

  // Check global ad settings
  const adsEnabled = settingsRes?.data?.ads?.enabled !== false;
  if (!adsEnabled) return null;

  // Find enabled ads for this specific location
  const ads = adsResponse.data.filter(ad => ad.location === location && ad.enabled);
  
  if (ads.length === 0) return null; // Don't show anything if no ads configured

  return (
    <div className={`w-full overflow-hidden flex flex-col justify-center items-center my-4 gap-4 ${className}`} ref={containerRef}>
      {ads.map((ad, idx) => {
        // Auto-detect legacy scripts (like Adsterra) that use document.write
        const isLegacyScript = ad.adCode?.includes('invoke.js') || ad.adCode?.includes('atOptions') || ad.adCode?.includes('document.write');
        
        // If it's AdSense or popunders are explicitly enabled, render natively
        // BUT force iframe if we detect a legacy document.write script
        const shouldRenderNatively = (ad.network === 'AdSense' || ad.enablePopunder || !ad.network) && !isLegacyScript;
        
        return (
          <div key={ad._id || idx} className="w-full flex justify-center overflow-hidden relative">
            {shouldRenderNatively ? (
              <div dangerouslySetInnerHTML={{ __html: ad.adCode }} className="w-full flex justify-center" />
            ) : (
              <IframeAd adCode={ad.adCode} idx={idx} />
            )}
          </div>
        );
      })}
      <p className="text-slate-500 text-[10px] mt-1 opacity-50 uppercase">Advertisement</p>
    </div>
  );
};

export default AdPlacement;
