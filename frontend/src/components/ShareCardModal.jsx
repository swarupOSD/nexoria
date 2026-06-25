import React, { useEffect, useRef, useState } from 'react';
import { X, Download, Share2, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const ShareCardModal = ({ isOpen, onClose, song }) => {
  const canvasRef = useRef(null);
  const [imgDataUrl, setImgDataUrl] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (!isOpen || !song) return;

    const generateCard = async () => {
      setIsGenerating(true);
      try {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        
        // Target Instagram Story Dimensions (9:16)
        canvas.width = 1080;
        canvas.height = 1920;

        // Draw Background Gradient
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, '#4c1d95'); // purple-900
        gradient.addColorStop(1, '#0f172a'); // slate-900
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Load and Draw Cover Image
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
          img.src = song.image;
        });

        // Draw Cover Shadow
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowBlur = 50;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 20;

        // Draw Cover Image Centered
        const imgSize = 800;
        const imgX = (canvas.width - imgSize) / 2;
        const imgY = 400;

        // Rounded corners for image
        ctx.save();
        ctx.beginPath();
        ctx.roundRect(imgX, imgY, imgSize, imgSize, 40);
        ctx.clip();
        ctx.drawImage(img, imgX, imgY, imgSize, imgSize);
        ctx.restore();

        // Reset Shadow for text
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;

        // Draw Nexoria Sound Branding
        ctx.fillStyle = '#a855f7'; // purple-400
        ctx.font = 'bold 40px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('NEXORIA SOUND', canvas.width / 2, 180);

        // Draw Song Title
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 80px sans-serif';
        ctx.fillText(song.title, canvas.width / 2, imgY + imgSize + 150);

        // Draw Artist
        ctx.fillStyle = '#94a3b8'; // slate-400
        ctx.font = '50px sans-serif';
        ctx.fillText(song.artist, canvas.width / 2, imgY + imgSize + 230);

        // Draw Playbar Graphic
        ctx.fillStyle = '#334155'; // slate-700
        ctx.fillRect(140, imgY + imgSize + 350, 800, 10);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(140, imgY + imgSize + 350, 400, 10); // 50% progress

        // Generate Data URL
        setImgDataUrl(canvas.toDataURL('image/png'));
      } catch (error) {
        console.error('Failed to generate share card', error);
        toast.error('Could not load image for share card.');
      } finally {
        setIsGenerating(false);
      }
    };

    generateCard();
  }, [isOpen, song]);

  if (!isOpen) return null;

  const handleDownload = () => {
    if (!imgDataUrl) return;
    const a = document.createElement('a');
    a.href = imgDataUrl;
    a.download = `${song.title}-Story.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast.success('Share card downloaded!');
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-800">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Share2 className="w-5 h-5 text-purple-400" /> Share Story
          </h2>
          <button onClick={onClose} className="p-2 bg-slate-800 hover:bg-slate-700 rounded-full text-slate-400 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 flex flex-col items-center">
          {/* Hidden canvas used for drawing */}
          <canvas ref={canvasRef} style={{ display: 'none' }} />

          {isGenerating ? (
            <div className="py-20 flex flex-col items-center">
              <Loader2 className="w-12 h-12 text-purple-500 animate-spin mb-4" />
              <p className="text-slate-400">Generating Card...</p>
            </div>
          ) : imgDataUrl ? (
            <>
              <img 
                src={imgDataUrl} 
                alt="Share Card" 
                className="w-full max-h-[60vh] object-contain rounded-2xl shadow-xl mb-6 border border-white/10"
              />
              <button 
                onClick={handleDownload}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold py-3 px-6 rounded-full transition-all hover:scale-105 shadow-lg shadow-purple-500/30"
              >
                <Download className="w-5 h-5" /> Download for Story
              </button>
            </>
          ) : (
            <p className="text-rose-400 py-10">Failed to generate.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShareCardModal;
