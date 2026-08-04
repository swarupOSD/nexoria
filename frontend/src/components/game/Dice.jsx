import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Dice = ({ value, isRolling, onRoll, disabled }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [dots, setDots] = useState([]);

  useEffect(() => {
    // Generate dot positions based on dice value
    const dotPatterns = {
      1: [[0, 0]],
      2: [[-1, -1], [1, 1]],
      3: [[-1, -1], [0, 0], [1, 1]],
      4: [[-1, -1], [-1, 1], [1, -1], [1, 1]],
      5: [[-1, -1], [-1, 1], [0, 0], [1, -1], [1, 1]],
      6: [[-1, -1], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 1]]
    };
    setDots(dotPatterns[value] || []);
  }, [value]);

  const diceVariants = {
    idle: { rotateX: 0, rotateY: 0, scale: 1 },
    rolling: {
      rotateX: [0, 720, 1440],
      rotateY: [0, 360, 720],
      scale: [1, 1.2, 1],
      transition: { duration: 1.5, ease: "easeOut" }
    },
    hover: { scale: 1.05, boxShadow: "0 20px 30px -10px rgba(0,0,0,0.3)" }
  };

  const getDotColor = () => {
    if (value >= 1 && value <= 6) {
      const colors = ['#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899'];
      return colors[value - 1];
    }
    return '#6B7280';
  };

  return (
    <motion.div
      className="relative flex flex-col items-center"
      initial="idle"
      animate={isRolling ? "rolling" : "idle"}
      variants={diceVariants}
      whileHover={!disabled && !isRolling ? "hover" : "idle"}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <motion.div
        className={`
          relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl 
          bg-white shadow-xl cursor-pointer
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          transition-colors duration-300
        `}
        style={{
          boxShadow: isHovered && !disabled && !isRolling
            ? '0 25px 40px -10px rgba(0,0,0,0.4)'
            : '0 10px 20px -5px rgba(0,0,0,0.2)'
        }}
        onClick={() => !disabled && !isRolling && onRoll()}
      >
        {/* Dice dots */}
        <div className="absolute inset-0 p-4">
          {dots.map((dot, index) => (
            <motion.div
              key={index}
              className="absolute w-3 h-3 sm:w-4 sm:h-4 rounded-full"
              style={{
                top: `calc(50% + ${dot[0] * 30}%)`,
                left: `calc(50% + ${dot[1] * 30}%)`,
                transform: 'translate(-50%, -50%)',
                backgroundColor: getDotColor()
              }}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: index * 0.05 }}
            />
          ))}
        </div>

        {/* 3D effect overlay */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/20 to-transparent pointer-events-none" />
        <div className="absolute inset-0 rounded-2xl border-2 border-gray-200/50 pointer-events-none" />
      </motion.div>

      {/* Roll button text */}
      {!isRolling && !disabled && (
        <motion.span
          className="mt-3 text-sm font-semibold text-gray-600"
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Click to Roll
        </motion.span>
      )}

      {/* Rolling animation text */}
      {isRolling && (
        <motion.span
          className="mt-3 text-sm font-semibold text-indigo-600"
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 0.5, repeat: Infinity }}
        >
          Rolling...
        </motion.span>
      )}

      {/* Value display */}
      <AnimatePresence>
        {!isRolling && value && (
          <motion.div
            className="mt-2 px-3 py-1 bg-gray-100 rounded-full text-xs font-bold text-gray-700"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
          >
            {value}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Dice;
