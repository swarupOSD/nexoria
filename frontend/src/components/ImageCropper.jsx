import { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import getCroppedImg from '../utils/cropImage';
import { X, Check, ZoomIn, ZoomOut, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ImageCropper = ({ imageSrc, onCropCompleteAction, onCancel, aspectRatio = 1, shape = 'round' }) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleSave = async () => {
    if (!croppedAreaPixels) return;
    try {
      setIsProcessing(true);
      const croppedImageBase64 = await getCroppedImg(
        imageSrc,
        croppedAreaPixels,
        rotation
      );
      onCropCompleteAction(croppedImageBase64);
    } catch (e) {
      console.error(e);
      setIsProcessing(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      >
        <motion.div 
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800">
            <h3 className="font-bold text-slate-800 dark:text-white">Adjust Image</h3>
            <button onClick={onCancel} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cropper Container */}
          <div className="relative w-full h-[400px] bg-slate-900">
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              rotation={rotation}
              aspect={aspectRatio}
              cropShape={shape}
              showGrid={false}
              onCropChange={setCrop}
              onCropComplete={onCropComplete}
              onZoomChange={setZoom}
            />
          </div>

          {/* Controls */}
          <div className="p-6 space-y-6">
            <div className="flex items-center gap-4">
              <ZoomOut className="w-5 h-5 text-slate-400" />
              <input
                type="range"
                value={zoom}
                min={1}
                max={3}
                step={0.1}
                aria-labelledby="Zoom"
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary"
              />
              <ZoomIn className="w-5 h-5 text-slate-400" />
            </div>

            <div className="flex gap-3">
              <button
                onClick={onCancel}
                className="flex-1 py-3 px-4 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isProcessing}
                className="flex-1 py-3 px-4 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-primary/30 disabled:opacity-70"
              >
                {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
                {isProcessing ? 'Processing...' : 'Apply Image'}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ImageCropper;
