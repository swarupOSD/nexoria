import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import FallbackImage from './FallbackImage';

const Logo = ({ src, alt = "Website Logo", className = "" }) => {
  const [imgSrc, setImgSrc] = useState(src);

  useEffect(() => {
    setImgSrc(src);
  }, [src]);

  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <AnimatePresence mode="wait">
        <motion.div
          key={imgSrc || 'empty'}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="w-full h-full flex items-center"
        >
          {imgSrc ? (
            <FallbackImage 
              src={imgSrc} 
              alt={alt} 
              fallbackType="logo" 
              className="w-auto h-auto max-w-[200px] max-h-[36px] md:max-h-[48px] object-contain" 
            />
          ) : (
            <span className="text-white font-black text-xl leading-none relative z-10 w-[36px] h-[36px] md:h-[48px] flex items-center justify-center">M</span>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default Logo;
