import React from 'react';

const GameControls = ({ isMyTurn, canRoll, isRolling, isMoving, onRoll, currentPlayer }) => {
  return (
    <div className="mt-8 flex flex-col items-center">
      {isMyTurn ? (
        <div className="flex flex-col items-center gap-2">
          <p className="text-lg font-bold text-green-600 animate-pulse">It's Your Turn!</p>
          {canRoll ? (
            <button
              onClick={onRoll}
              disabled={isRolling || isMoving}
              className={`px-8 py-3 rounded-full text-white font-bold text-lg shadow-lg transform transition-all ${
                isRolling || isMoving
                  ? 'bg-gray-400 cursor-not-allowed opacity-70'
                  : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:scale-105 active:scale-95'
              }`}
            >
              {isRolling ? 'Rolling...' : 'Roll Dice'}
            </button>
          ) : (
            <p className="text-sm text-gray-500">Select a token to move</p>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2">
          <p className="text-lg font-semibold text-gray-600">
            Waiting for <span className="font-bold text-indigo-600">{currentPlayer?.name}</span>...
          </p>
          <div className="flex gap-1 mt-2">
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      )}
    </div>
  );
};

export default GameControls;
