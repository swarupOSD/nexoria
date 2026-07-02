import { useEffect } from 'react';
import { useSelector } from 'react-redux';

const AdsterraManager = () => {
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    // Determine if the user should see ads
    // Ads are hidden if the user is a Premium User, Admin, or Super Admin
    const isPremium = user?.isPremium;
    const isElevatedRole = user?.role === 'admin' || user?.role === 'super_admin';
    const shouldShowAds = !isPremium && !isElevatedRole;

    if (!shouldShowAds) {
      return; // Do not inject scripts for VIPs
    }

    // Function to inject script
    const injectScript = (src) => {
      // Check if already injected
      if (document.querySelector(`script[src="${src}"]`)) return;
      
      const script = document.createElement('script');
      script.src = src;
      script.type = 'text/javascript';
      script.async = true;
      document.body.appendChild(script);
    };

    // Inject Social Bar
    injectScript('https://pl29888773.effectivecpmnetwork.com/fc/8d/c6/fc8dc6504d8be077f23f749403068f27.js');
    
    // Inject Popunder
    injectScript('https://pl29888774.effectivecpmnetwork.com/b9/96/07/b99607f0b109eb24d58724db4e89fcb2.js');

    return () => {
      // Cleanup scripts when component unmounts (optional, but good practice if needed)
      // Adsterra scripts often pollute global scope, so full cleanup is hard, 
      // but we remove the DOM elements at least.
      const scripts = document.querySelectorAll('script[src*="effectivecpmnetwork.com"]');
      scripts.forEach(s => s.remove());
    };
  }, [user]);

  return null; // This component doesn't render any UI
};

export default AdsterraManager;
