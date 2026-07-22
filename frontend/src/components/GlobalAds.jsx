import React, { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useGetSettingsQuery } from '../features/settings/settingsApiSlice';

const GlobalAds = () => {
  const { user } = useSelector(state => state.auth);
  const { data: settingsRes, isLoading } = useGetSettingsQuery();
  const scriptInjectedRef = useRef(false);

  const isAdmin = user && (user.role === 'admin' || user.role === 'superadmin');
  const isPremiumUser = user && user.isPremium;

  useEffect(() => {
    if (isLoading || !settingsRes?.data || scriptInjectedRef.current) return;
    
    // Check if ads are globally enabled
    if (settingsRes.data.ads?.enabled === false) return;

    const socialBarScriptCode = settingsRes.data.ads?.socialBarScript;
    if (!socialBarScriptCode) return;

    // Extract script tags and inject them
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = socialBarScriptCode;
    const scripts = tempDiv.getElementsByTagName('script');

    for (let i = 0; i < scripts.length; i++) {
      const oldScript = scripts[i];
      const newScript = document.createElement('script');
      
      Array.from(oldScript.attributes).forEach(attr => newScript.setAttribute(attr.name, attr.value));
      if (oldScript.innerHTML) {
        newScript.appendChild(document.createTextNode(oldScript.innerHTML));
      }
      
      document.body.appendChild(newScript);
    }
    
    scriptInjectedRef.current = true;

  }, [settingsRes, isLoading, isAdmin, isPremiumUser]);

  return null;
};

export default GlobalAds;
