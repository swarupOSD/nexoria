import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LudoBoard from './LudoBoard';
import Dice from './Dice';
import PlayerInfo from './PlayerInfo';
import GameControls from './GameControls';
import { useLudoGame } from '../../hooks/useLudoGame';
import { COLOR_HEX } from '../../utils/constants';

const GameRoom = ({ socket, roomId, playerName, onLeave }) => {
  const {
    gameState,
    players,
    currentTurn,
    diceValue,
    isRolling,
    isMoving,
    selectedToken,
    canRoll,
    winner,
    toastMessage,
    isMyTurn,
    playerId,
    rollDice,
    moveToken,
    toggleReady,
    leaveGame
  } = useLudoGame(socket);

  const [selectedColor, setSelectedColor] = useState(null);
  const [showGameOver, setShowGameOver] = useState(false);

  useEffect(() => {
    // Join the room
    if (socket && roomId && playerName) {
      socket.emit('joinGame', { roomId, playerName, color: selectedColor });
    }
  }, [socket, roomId, playerName, selectedColor]);

  useEffect(() => {
    if (winner) {
      setShowGameOver(true);
    }
  }, [winner]);

  const handleLeave = () => {
    leaveGame();
    onLeave();
  };

  const isGameActive = gameState?.status === 'ACTIVE';
  const isGameFinished = gameState?.status === 'FINISHED';
  const isWaiting = gameState?.status === 'WAITING';

  const currentPlayer = players?.[currentTurn];
  const myPlayer = players?.[playerId];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6 bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">🎲 Ludo Game</h1>
            <p className="text-sm text-gray-600">Room: {roomId}</p>
          </div>
          <button
            onClick={handleLeave}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Leave Game
          </button>
        </div>

        {/* Main Game Area */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Panel - Players */}
          <div className="lg:col-span-1 space-y-4">
            <h3 className="text-lg font-semibold text-gray-700">Players</h3>
            {Object.values(players || {}).map((player) => (
              <PlayerInfo
                key={player.id}
                player={player}
                isCurrentTurn={currentTurn === player.id}
                isMyPlayer={player.id === playerId}
                isReady={player.isReady}
              />
            ))}
            
            {/* Game Status */}
            {!isGameActive && !isGameFinished && (
              <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200">
                <p className="text-sm text-yellow-800">
                  {isWaiting ? 'Waiting for players to ready up...' : 'Preparing game...'}
                </p>
                {myPlayer && !myPlayer.isReady && (
                  <button
                    onClick={toggleReady}
                    className="mt-2 w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                  >
                    Ready Up
                  </button>
                )}
                {myPlayer?.isReady && (
                  <p className="mt-2 text-sm text-green-600">✅ You are ready!</p>
                )}
              </div>
            )}
          </div>

          {/* Center - Board */}
          <div className="lg:col-span-2 flex flex-col items-center">
            <LudoBoard
              gameState={gameState}
              players={players}
              onTokenClick={moveToken}
              selectedToken={selectedToken}
              isMyTurn={isMyTurn && isGameActive}
            />
            
            {/* Game Controls */}
            {isGameActive && (
              <GameControls
                isMyTurn={isMyTurn}
                canRoll={canRoll}
                isRolling={isRolling}
                isMoving={isMoving}
                onRoll={rollDice}
                currentPlayer={currentPlayer}
              />
            )}
          </div>

          {/* Right Panel - Dice & Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Dice */}
            <div className="bg-white rounded-2xl p-6 shadow-lg flex flex-col items-center">
              <h3 className="text-sm font-semibold text-gray-600 mb-4">🎯 Dice</h3>
              <Dice
                value={diceValue}
                isRolling={isRolling}
                onRoll={rollDice}
                disabled={!isMyTurn || !canRoll || !isGameActive || isMoving}
              />
              
              {/* Turn Indicator */}
              {isGameActive && currentPlayer && (
                <div className="mt-4 text-center">
                  <p className="text-sm text-gray-600">Current Turn</p>
                  <p 
                    className="text-lg font-bold"
                    style={{ color: COLOR_HEX[currentPlayer.color] }}
                  >
                    {currentPlayer.name} {currentPlayer.isAI && '🤖'}
                  </p>
                </div>
              )}
            </div>

            {/* Game Info */}
            <div className="bg-white rounded-2xl p-4 shadow-lg">
              <h4 className="text-sm font-semibold text-gray-600 mb-2">Game Info</h4>
              <div className="space-y-1 text-sm">
                <p>Status: <span className="font-medium">{gameState?.status || 'Loading...'}</span></p>
                <p>Turn: <span className="font-medium">{gameState?.turnNumber || 0}</span></p>
                {winner && (
                  <p className="text-lg font-bold text-green-600">
                    🏆 {players[winner]?.name} Wins!
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Toast Messages */}
        <AnimatePresence>
          {toastMessage && (
            <motion.div
              className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
            >
              <div className="bg-gray-900 text-white px-6 py-3 rounded-2xl shadow-2xl">
                <p className="text-center">{toastMessage}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Game Over Modal */}
        <AnimatePresence>
          {showGameOver && winner && (
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="bg-white rounded-3xl p-8 max-w-md w-full text-center"
                initial={{ scale: 0.8, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.8, y: 20 }}
              >
                <div className="text-6xl mb-4">🏆</div>
                <h2 className="text-3xl font-bold text-gray-800 mb-2">
                  {players[winner]?.name} Wins!
                </h2>
                <p className="text-gray-600 mb-6">Congratulations! 🎉</p>
                <button
                  onClick={handleLeave}
                  className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors"
                >
                  Back to Lobby
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default GameRoom;
