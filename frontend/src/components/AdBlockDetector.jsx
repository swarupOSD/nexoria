import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, RefreshCw, Info, Lock } from 'lucide-react';
import { useTrackAdblockMutation } from '../features/analytics/analyticsApiSlice';

const AdBlockDetector = ({ children }) => {
  const [isAdBlockActive, setIsAdBlockActive] = useState(false);
  const [trackAdblock] = useTrackAdblockMutation();
  const detectionRun = useRef(false);

  useEffect(() => {
    if (detectionRun.current) return;
    
    const runChecks = async () => {
      let detected = false;
      let method = '';

      // Check 1: Bait Element
      const bait = document.createElement('div');
      bait.className = 'ad-banner doubleclick-ad adsbox';
      bait.style.height = '10px';
      bait.style.width = '10px';
      bait.style.position = 'absolute';
      bait.style.left = '-9999px';
      document.body.appendChild(bait);
      
      await new Promise(r => setTimeout(r, 100)); // wait for layout

      if (bait.offsetHeight === 0 || window.getComputedStyle(bait).display === 'none') {
        detected = true;
        method = 'bait_element';
      }
      
      if (document.body.contains(bait)) bait.remove();

      // Check 2: Google Ads fetch
      if (!detected) {
        try {
          await fetch('https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js', {
            method: 'HEAD',
            mode: 'no-cors'
          });
        } catch (error) {
          detected = true;
          method = 'google_ads_fetch';
        }
      }

      if (detected) {
        setIsAdBlockActive(true);
        try {
          await trackAdblock({ methodUsed: method, userAgent: navigator.userAgent }).unwrap();
        } catch (e) {
          console.error("Failed to track adblock", e);
        }
      }
      detectionRun.current = true;
    };

    runChecks();
  }, [trackAdblock]);

  if (isAdBlockActive) {
    return (
      <div className="fixed inset-0 z-[9999] bg-slate-900/95 backdrop-blur-xl flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="bg-slate-800 border border-slate-700/50 rounded-3xl p-8 max-w-2xl w-full shadow-2xl relative overflow-hidden"
        >
          {/* Glassmorphism accents */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-yellow-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
          
          <div className="relative z-10 flex flex-col items-center text-center">
            <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
              <ShieldAlert className="w-12 h-12 text-red-500" />
            </div>
            
            <h1 className="text-4xl font-black text-white mb-4 tracking-tight">⚠️ Ad Blocker Detected</h1>
            
            <p className="text-xl text-slate-300 mb-8 max-w-lg leading-relaxed">
              This website relies on advertisements to provide premium apps and services for free.
              <br /><br />
              <span className="font-semibold text-white">Please disable your AdBlocker and refresh the page.</span>
            </p>

            <div className="flex flex-col sm:flex-row gap-4 w-full justify-center mb-10">
              <button 
                onClick={() => window.location.reload()}
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg shadow-red-500/30 transition-all hover:-translate-y-1"
              >
                <RefreshCw className="w-5 h-5" /> Refresh Page
              </button>
            </div>

            <div className="w-full bg-slate-900/50 border border-slate-700/50 rounded-2xl p-6 text-left">
              <div className="flex items-center gap-2 mb-6">
                <Info className="w-5 h-5 text-blue-400" />
                <h3 className="text-lg font-bold text-white">How to Disable AdBlock</h3>
              </div>
              
              <div className="grid md:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <h4 className="font-bold text-blue-400">Chrome</h4>
                  <ol className="text-sm text-slate-400 space-y-2 list-decimal list-inside">
                    <li>Click Extensions</li>
                    <li>Open AdBlock</li>
                    <li>Disable on this site</li>
                    <li>Refresh page</li>
                  </ol>
                </div>
                
                <div className="space-y-3">
                  <h4 className="font-bold text-orange-400">Brave</h4>
                  <ol className="text-sm text-slate-400 space-y-2 list-decimal list-inside">
                    <li>Click Brave Shields</li>
                    <li>Turn off Shields</li>
                    <li>Refresh page</li>
                  </ol>
                </div>

                <div className="space-y-3">
                  <h4 className="font-bold text-emerald-400">DNS AdBlock</h4>
                  <ol className="text-sm text-slate-400 space-y-2 list-decimal list-inside">
                    <li>Disable Private DNS</li>
                    <li>Disable AdGuard/PiHole</li>
                    <li>Refresh page</li>
                  </ol>
                </div>
              </div>
            </div>
            
            <div className="mt-8 flex items-center justify-center gap-2 text-slate-500 text-sm">
              <Lock className="w-4 h-4" /> 
              <span>Premium Users bypass ads and tracking automatically.</span>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return children;
};

export default AdBlockDetector;
