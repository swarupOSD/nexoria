import React from 'react';
import { motion } from 'framer-motion';
import { COLOR_HEX, COLOR_LIGHT } from '../../utils/constants';

const PlayerInfo = ({ player, isCurrentTurn, isMyPlayer, isReady }) => {
  const colorHex = COLOR_HEX[player.color];
  const colorLight = COLOR_LIGHT[player.color];

  const finishedTokens = player.tokens?.filter(t => t.isFinished).length || 0;
  const activeTokens = player.tokens?.filter(t => t.isActive && !t.isFinished).length || 0;

  return (
    <motion.div
      className={`
        relative p-4 rounded-xl border-2 transition-all duration-300
        ${isCurrentTurn ? 'shadow-lg border-opacity-100' : 'border-opacity-30'}
        ${isMyPlayer ? 'bg-blue-50 border-blue-300' : 'bg-white border-gray-200'}
      `}
      style={{
        borderColor: isCurrentTurn ? colorHex : undefined,
        boxShadow: isCurrentTurn ? `0 0 20px ${colorHex}40` : undefined
      }}
      animate={isCurrentTurn ? {
        scale: [1, 1.02, 1],
        transition: { duration: 1, repeat: Infinity }
      } : {}}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Color circle */}
          <div 
            className="w-4 h-4 rounded-full border-2 border-gray-300"
            style={{ backgroundColor: colorHex }}
          />
          
          <div>
            <p className="font-semibold text-gray-800">
              {player.name}
              {player.isAI && ' 🤖'}
            </p>
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <span>Tokens: {activeTokens} active</span>
              <span>•</span>
              <span>⭐ {finishedTokens}/4 home</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end">
          {/* Ready status */}
          {isReady && !player.isAI && (
            <span className="text-xs text-green-600 font-medium">✅ Ready</span>
          )}
          
          {/* Turn indicator */}
          {isCurrentTurn && (
            <motion.div
              className="text-xs font-bold px-2 py-1 rounded-full"
              style={{ 
                backgroundColor: colorLight,
                color: colorHex
              }}
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 0.5, repeat: Infinity }}
            >
              👑 Turn
            </motion.div>
          )}
          
          {isMyPlayer && !player.isAI && (
            <span className="text-xs text-blue-600 font-medium">(You)</span>
          )}
        </div>
      </div>

      {/* Token progress bar */}
      <div className="mt-2 w-full h-1 bg-gray-200 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: colorHex }}
          initial={{ width: 0 }}
          animate={{ width: `${(finishedTokens / 4) * 100}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
    </motion.div>
  );
};

export default PlayerInfo;
