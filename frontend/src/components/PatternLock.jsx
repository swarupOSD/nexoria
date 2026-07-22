import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const GRID_SIZE = 3;

const PatternLock = ({ 
  onComplete, 
  error = false,
  success = false,
  size = 300,
  className = ""
}) => {
  const [pattern, setPattern] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPoint, setCurrentPoint] = useState(null);
  const [forceRender, setForceRender] = useState(0); // For forcing dot updates
  
  const containerRef = useRef(null);
  const dotsRef = useRef([]);

  // Create an array of 9 dots
  const dots = Array.from({ length: GRID_SIZE * GRID_SIZE }, (_, i) => i);

  const [dotCenters, setDotCenters] = useState({});

  // Update layout when window resizes
  useEffect(() => {
    const handleResize = () => setForceRender(r => r + 1);
    window.addEventListener('resize', handleResize);
    // Initial measure
    const timer = setTimeout(() => setForceRender(r => r + 1), 100);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    const newCenters = {};
    dots.forEach(dotIndex => {
      const dot = dotsRef.current[dotIndex];
      if (dot) {
        const rect = dot.getBoundingClientRect();
        newCenters[dotIndex] = {
          x: rect.left - containerRect.left + rect.width / 2,
          y: rect.top - containerRect.top + rect.height / 2
        };
      }
    });
    setDotCenters(newCenters);
  }, [forceRender, dots]);

  const handlePointerDown = (e, index) => {
    // Only start if not already drawing and not showing an error/success animation
    if (error || success) return;
    
    e.preventDefault();
    setIsDrawing(true);
    setPattern([index]);
    
    // Provide haptic feedback if available
    if (navigator.vibrate) navigator.vibrate(10);
  };

  const handlePointerMove = (e) => {
    if (!isDrawing) return;
    e.preventDefault();

    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    if (!containerRef.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    setCurrentPoint({
      x: clientX - containerRect.left,
      y: clientY - containerRect.top
    });

    // Check if we hover over a dot
    // On touch devices, elementFromPoint is needed because touchmove target is always the starting element
    const element = document.elementFromPoint(clientX, clientY);
    if (element && element.dataset.dotId !== undefined) {
      const dotIndex = parseInt(element.dataset.dotId, 10);
      
      if (!pattern.includes(dotIndex)) {
        // Add to pattern
        setPattern(prev => {
          const newPattern = [...prev, dotIndex];
          if (navigator.vibrate) navigator.vibrate(10);
          return newPattern;
        });
      }
    }
  };

  const handlePointerUp = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    setCurrentPoint(null);
    
    if (pattern.length >= 4) {
      onComplete(pattern.join(''));
    } else {
      // If pattern is too short, auto clear after a tiny delay, or pass empty string to trigger error
      onComplete(pattern.length > 0 ? 'TOO_SHORT' : '');
    }
  };

  // Auto clear pattern when error/success state is reset from parent
  useEffect(() => {
    if (!error && !success && !isDrawing) {
      setPattern([]);
    }
  }, [error, success, isDrawing]);

  // Handle global touch move to prevent scrolling while drawing
  useEffect(() => {
    const handleTouchMove = (e) => {
      if (isDrawing) {
        e.preventDefault();
      }
    };

    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    return () => {
      document.removeEventListener('touchmove', handleTouchMove);
    };
  }, [isDrawing]);

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <motion.div
        animate={error ? { x: [-10, 10, -10, 10, 0] } : {}}
        transition={{ duration: 0.4 }}
        ref={containerRef}
        className="relative select-none touch-none"
        style={{ width: size, height: size }}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onTouchMove={handlePointerMove}
        onTouchEnd={handlePointerUp}
        onTouchCancel={handlePointerUp}
      >
        {/* Lines SVG Overlay */}
        <svg className="absolute inset-0 pointer-events-none z-0" style={{ width: '100%', height: '100%' }}>
          {/* Static lines for locked pattern */}
          {pattern.map((dotIndex, i) => {
            if (i === 0) return null;
            const prevDot = dotCenters[pattern[i - 1]];
            const currDot = dotCenters[dotIndex];
            
            if (!prevDot || !currDot) return null;

            return (
              <line
                key={`line-${i}`}
                x1={prevDot.x}
                y1={prevDot.y}
                x2={currDot.x}
                y2={currDot.y}
                stroke={error ? '#ef4444' : success ? '#10b981' : '#8b5cf6'}
                strokeWidth="6"
                strokeLinecap="round"
                opacity={error || success ? 0.8 : 0.5}
              />
            );
          })}
          
          {/* Dynamic line to pointer cursor */}
          {isDrawing && currentPoint && pattern.length > 0 && (
            <line
              x1={dotCenters[pattern[pattern.length - 1]]?.x || 0}
              y1={dotCenters[pattern[pattern.length - 1]]?.y || 0}
              x2={currentPoint.x}
              y2={currentPoint.y}
              stroke="#8b5cf6"
              strokeWidth="6"
              strokeLinecap="round"
              opacity={0.4}
            />
          )}
        </svg>

        {/* Dots Grid */}
        <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 gap-8 p-4 z-10">
          {dots.map((dotIndex) => {
            const isSelected = pattern.includes(dotIndex);
            return (
              <div
                key={dotIndex}
                className="flex items-center justify-center w-full h-full relative"
              >
                {/* Visual Dot */}
                <div
                  ref={el => dotsRef.current[dotIndex] = el}
                  className={`
                    rounded-full transition-all duration-200 pointer-events-none
                    ${isSelected 
                      ? error 
                        ? 'bg-red-500 w-4 h-4 shadow-[0_0_15px_rgba(239,68,68,0.8)]' 
                        : success
                          ? 'bg-emerald-500 w-4 h-4 shadow-[0_0_15px_rgba(16,185,129,0.8)]'
                          : 'bg-purple-500 w-4 h-4 shadow-[0_0_15px_rgba(139,92,246,0.8)]'
                      : 'bg-slate-300 dark:bg-white/20 w-2.5 h-2.5'
                    }
                  `}
                >
                  {/* Outer glow ring for selected state */}
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 2.5, opacity: 0.2 }}
                      className={`absolute inset-0 rounded-full m-auto ${
                        error ? 'bg-red-500' : success ? 'bg-emerald-500' : 'bg-purple-500'
                      }`}
                      style={{ width: '100%', height: '100%' }}
                    />
                  )}
                </div>
                
                {/* Hit Area (Invisible, much larger) */}
                <div 
                  className="absolute inset-[-15px] rounded-full cursor-pointer touch-none"
                  data-dot-id={dotIndex}
                  onPointerDown={(e) => handlePointerDown(e, dotIndex)}
                  onTouchStart={(e) => handlePointerDown(e, dotIndex)}
                  onPointerEnter={(e) => {
                    // Mouse fallback for hovering
                    if (isDrawing && e.pointerType === 'mouse') {
                      if (!pattern.includes(dotIndex)) {
                        setPattern(prev => [...prev, dotIndex]);
                      }
                    }
                  }}
                />
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
};

export default PatternLock;
