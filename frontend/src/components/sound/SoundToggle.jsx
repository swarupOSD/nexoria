import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { soundManager } from '../../utils/SoundManager';

const SoundToggle = ({ className = '' }) => {
  const [isEnabled, setIsEnabled] = useState(true);
  const [volume, setVolume] = useState(0.5);
  const [showVolume, setShowVolume] = useState(false);

  useEffect(() => {
    soundManager.initialize();
    setIsEnabled(soundManager.enabled);
  }, []);

  const toggleSound = () => {
    const newState = soundManager.toggle();
    setIsEnabled(newState);
    if (newState) {
      soundManager.play('diceRoll', { volume: 0.5 });
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    soundManager.setVolume(newVolume);
    // Test sound
    soundManager.play('diceRoll', { volume: newVolume });
  };

  return (
    <div className={`relative ${className}`}>
      <motion.button
        className={`
          relative p-2 rounded-full transition-all duration-300
          ${isEnabled ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-400 hover:bg-gray-500'}
          text-white shadow-lg
        `}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={toggleSound}
        onMouseEnter={() => setShowVolume(true)}
        onMouseLeave={() => setShowVolume(false)}
      >
        <span className="text-xl">
          {isEnabled ? '🔊' : '🔇'}
        </span>
      </motion.button>

      {/* Volume slider */}
      <motion.div
        className={`
          absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2
          bg-white rounded-lg shadow-xl p-3
          ${showVolume ? 'block' : 'hidden'}
        `}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: showVolume ? 1 : 0, y: showVolume ? 0 : 10 }}
        transition={{ duration: 0.2 }}
      >
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={handleVolumeChange}
          className="w-24 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, #4F46E5 0%, #4F46E5 ${volume * 100}%, #D1D5DB ${volume * 100}%, #D1D5DB 100%)`
          }}
        />
        <div className="text-xs text-center mt-1 text-gray-600">
          {Math.round(volume * 100)}%
        </div>
      </motion.div>
    </div>
  );
};

export default SoundToggle;
