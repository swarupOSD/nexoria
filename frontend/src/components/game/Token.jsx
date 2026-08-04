import React from 'react';
import { motion } from 'framer-motion';
import { COLOR_HEX, COLOR_LIGHT } from '../../utils/constants';

const Token = ({ 
  color, 
  size = 'md', 
  isActive = true, 
  isFinished = false,
  isSelected = false,
  isClickable = false,
  onClick,
  className = '',
  glowEffect = false,
  animation = 'bounce'
}) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
    xl: 'w-12 h-12'
  };

  const getTokenStyles = () => {
    const baseColor = COLOR_HEX[color];
    const lightColor = COLOR_LIGHT[color];
    
    if (isFinished) {
      return {
        background: `radial-gradient(circle at 30% 30%, ${lightColor}, ${baseColor})`,
        borderColor: baseColor,
        opacity: 0.7
      };
    }
    
    if (!isActive) {
      return {
        background: `radial-gradient(circle at 30% 30%, ${lightColor}, ${baseColor})`,
        borderColor: baseColor,
        opacity: 0.4
      };
    }
    
    return {
      background: `radial-gradient(circle at 30% 30%, ${lightColor}, ${baseColor})`,
      borderColor: baseColor
    };
  };

  const tokenVariants = {
    idle: {
      scale: 1,
      y: 0,
      boxShadow: '0 4px 6px -1px rgba(0,0,0,0.2)'
    },
    selected: {
      scale: 1.15,
      y: -5,
      boxShadow: '0 20px 25px -5px rgba(0,0,0,0.3)',
      transition: { duration: 0.2 }
    },
    bounce: {
      y: [0, -10, 0],
      transition: { 
        duration: 0.6,
        repeat: Infinity,
        repeatType: "reverse",
        ease: "easeInOut"
      }
    },
    pulse: {
      scale: [1, 1.05, 1],
      transition: {
        duration: 1,
        repeat: Infinity,
        ease: "easeInOut"
      }
    },
    glow: {
      boxShadow: [
        '0 0 20px 5px rgba(255,255,255,0.3)',
        '0 0 40px 15px rgba(255,255,255,0.1)',
        '0 0 20px 5px rgba(255,255,255,0.3)'
      ],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  const getAnimation = () => {
    if (isSelected) return 'selected';
    if (isFinished) return 'idle';
    if (!isActive) return 'idle';
    if (glowEffect) return 'glow';
    return animation;
  };

  const styles = getTokenStyles();

  return (
    <motion.div
      className={`
        relative rounded-full border-2 cursor-pointer
        ${sizeClasses[size]} 
        ${className}
        ${isClickable ? 'hover:scale-110 transition-transform' : ''}
        ${isActive && !isFinished ? 'shadow-lg' : 'shadow-md'}
      `}
      style={styles}
      variants={tokenVariants}
      initial="idle"
      animate={getAnimation()}
      whileHover={isClickable && isActive && !isFinished ? { scale: 1.1 } : {}}
      whileTap={isClickable && isActive ? { scale: 0.95 } : {}}
      onClick={() => isClickable && isActive && !isFinished && onClick && onClick()}
    >
      {/* Token highlight */}
      <div className="absolute inset-0 rounded-full bg-white/20" />
      
      {/* Inner glow effect */}
      <div className="absolute inset-0 rounded-full" 
        style={{
          background: 'radial-gradient(circle at 40% 35%, rgba(255,255,255,0.4) 0%, transparent 70%)'
        }}
      />

      {/* Star/icon for home column tokens */}
      {isActive && !isFinished && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-1/2 h-1/2 bg-white/20 rounded-full" />
        </div>
      )}

      {/* Home indicator */}
      {isFinished && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-bold text-white drop-shadow-md">⭐</span>
        </div>
      )}

      {/* Selection ring */}
      {isSelected && (
        <motion.div
          className="absolute -inset-1 rounded-full border-2 border-yellow-400"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [1, 0.5, 1]
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      )}
    </motion.div>
  );
};

export default Token;
