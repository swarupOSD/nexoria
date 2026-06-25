import React, { useState, useEffect } from 'react';
import { Image as ImageIcon, User } from 'lucide-react';

const FallbackImage = ({ 
  src, 
  alt = 'Image', 
  className = '', 
  fallbackSrc = null, 
  fallbackType = 'generic', // 'generic', 'avatar', 'logo'
  ...props 
}) => {
  const [imgSrc, setImgSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    // Cache bust by appending timestamp if it's our own uploads, otherwise just set it
    // Wait, let's just set the src. Cache busting can be done by the parent if needed.
    setImgSrc(src);
    setHasError(false);
  }, [src]);

  const handleError = () => {
    if (!hasError) {
      if (fallbackSrc) {
        setImgSrc(fallbackSrc);
      }
      setHasError(true);
    }
  };

  if (hasError && !fallbackSrc) {
    // Render a generic fallback based on type
    if (fallbackType === 'avatar') {
      return (
        <div className={`flex items-center justify-center bg-slate-200 dark:bg-slate-800 text-slate-400 ${className}`} {...props}>
          <User className="w-2/3 h-2/3 opacity-60" />
        </div>
      );
    }
    
    return (
      <div className={`flex items-center justify-center bg-slate-200 dark:bg-slate-800 text-slate-400 ${className}`} {...props}>
        <ImageIcon className="w-1/2 h-1/2 opacity-50" />
      </div>
    );
  }

  return (
    <img 
      src={imgSrc || (fallbackType === 'avatar' ? '/default-avatar.png' : '')} 
      alt={alt} 
      onError={handleError}
      className={className}
      {...props}
      // Add loading lazy for performance
      loading="lazy"
    />
  );
};

export default FallbackImage;
