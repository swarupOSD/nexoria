import React, { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useGetAdvertisementsQuery } from '../features/advertisement/advertisementApiSlice';

const AdPlacement = ({ location, className = '' }) => {
  const { user } = useSelector(state => state.auth);
  const containerRef = useRef(null);
  
  const isAdmin = user && (user.role === 'admin' || user.role === 'superadmin');
  const isPremiumUser = user && user.isPremium;
  
  const { data: adsResponse, isLoading } = useGetAdvertisementsQuery(undefined, { skip: isAdmin || isPremiumUser });
  
  if (isAdmin || isPremiumUser) return null;
  if (isLoading || !adsResponse?.data) return null;

  // Find enabled ads for this specific location
  const ads = adsResponse.data.filter(ad => ad.location === location && ad.enabled);
  
  if (ads.length === 0) return null; // Don't show anything if no ads configured

  useEffect(() => {
    if (containerRef.current) {
      // Find all script tags within our injected HTML and execute them
      const scripts = containerRef.current.querySelectorAll('script');
      scripts.forEach(oldScript => {
        // If we already processed this script, skip it
        if (oldScript.dataset.processed) return;
        
        const newScript = document.createElement('script');
        Array.from(oldScript.attributes).forEach(attr => newScript.setAttribute(attr.name, attr.value));
        newScript.appendChild(document.createTextNode(oldScript.innerHTML));
        oldScript.parentNode.replaceChild(newScript, oldScript);
        newScript.dataset.processed = "true";
      });
    }
  });

  return (
    <div className={`w-full overflow-hidden flex flex-col justify-center items-center my-4 gap-4 ${className}`} ref={containerRef}>
      {ads.map((ad, idx) => (
        <div key={ad._id || idx} className="w-full flex justify-center">
          <div dangerouslySetInnerHTML={{ __html: ad.adCode }} />
        </div>
      ))}
      <p className="text-slate-500 text-[10px] mt-1 opacity-50 uppercase">Advertisement</p>
    </div>
  );
};

export default AdPlacement;
