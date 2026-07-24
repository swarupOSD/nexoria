import React, { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Share2 } from 'lucide-react';
import html2canvas from 'html2canvas';
import toast from 'react-hot-toast';

const NexoriaMusicShareModal = ({ isOpen, onClose, track }) => {
  const cardRef = useRef(null);
  const [isExporting, setIsExporting] = useState(false);

  if (!isOpen || !track) return null;

  const handleDownload = async () => {
    if (!cardRef.current) return;
    setIsExporting(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        useCORS: true,
        scale: 3, // High resolution
        backgroundColor: null,
      });
      
      const link = document.createElement('a');
      link.download = `nexoria-share-${track.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      toast.success('Share card downloaded!');
    } catch (error) {
      console.error('Error generating share card:', error);
      toast.error('Failed to generate image');
    } finally {
      setIsExporting(false);
    }
  };

  const coverImage = track.coverImage || track.album?.coverImage || track.artist?.image;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[10000] flex flex-col items-center justify-center p-4 sm:p-8"
        >
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
            onClick={onClose}
          />
          
          <div className="relative z-10 w-full max-w-sm flex flex-col items-center">
            {/* Close Button */}
            <button 
              onClick={onClose}
              className="absolute -top-12 right-0 p-2 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* The Share Card (What gets exported) */}
            <div 
              ref={cardRef}
              className="w-full aspect-[9/16] rounded-3xl overflow-hidden relative shadow-2xl flex flex-col items-center justify-center p-8 bg-gradient-to-br from-indigo-900 via-purple-900 to-[#0F0F23]"
            >
              {/* Decorative background blur based on album art (simulated with CSS) */}
              {coverImage && (
                <>
                  <div 
                    className="absolute inset-0 opacity-40 blur-[80px] scale-150 transform mix-blend-screen"
                    style={{ 
                      backgroundImage: `url(${coverImage})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }}
                  />
                  <div className="absolute inset-0 bg-black/40" />
                </>
              )}

              {/* Card Content */}
              <div className="relative z-10 w-full flex flex-col items-center">
                <div className="w-full aspect-square rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] mb-8 border border-white/10">
                  {coverImage ? (
                    <img src={coverImage} alt={track.title} className="w-full h-full object-cover" crossOrigin="anonymous" />
                  ) : (
                    <div className="w-full h-full bg-[#4338CA]" />
                  )}
                </div>

                <div className="w-full bg-black/30 backdrop-blur-md border border-white/10 p-5 rounded-2xl">
                  <h2 className="text-2xl font-bold text-white mb-1 truncate">{track.title}</h2>
                  <p className="text-lg text-white/80 font-medium truncate mb-4">{track.artist?.name || 'Unknown Artist'}</p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg">
                        <Share2 className="w-3 h-3 text-white" />
                      </div>
                      <span className="text-sm font-bold text-white tracking-widest uppercase opacity-90">Nexoria</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions (Not exported) */}
            <div className="flex items-center gap-4 mt-8 w-full">
              <button 
                onClick={handleDownload}
                disabled={isExporting}
                className="flex-1 bg-white text-black font-bold py-3.5 px-6 rounded-full flex items-center justify-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)] disabled:opacity-70 disabled:hover:scale-100"
              >
                {isExporting ? (
                  <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                ) : (
                  <>
                    <Download className="w-5 h-5" />
                    Download Story
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default NexoriaMusicShareModal;
