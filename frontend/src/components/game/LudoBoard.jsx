import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import Token from './Token';
import { 
  COLOR_HEX, 
  COLOR_LIGHT, 
  COLOR_DARK,
  BOARD_CONFIG 
} from '../../utils/constants';

const LudoBoard = ({ 
  gameState, 
  onTokenClick, 
  selectedToken,
  isMyTurn,
  players 
}) => {
  const gridSize = BOARD_CONFIG.GRID_SIZE;

  // Generate board cells
  const renderBoard = () => {
    const board = [];
    
    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
        const cell = getCellType(row, col);
        board.push(
          <BoardCell
            key={`${row}-${col}`}
            row={row}
            col={col}
            cellType={cell}
            gameState={gameState}
            onTokenClick={onTokenClick}
            selectedToken={selectedToken}
            isMyTurn={isMyTurn}
            players={players}
          />
        );
      }
    }
    
    return board;
  };

  const getCellType = (row, col) => {
    const center = 7;
    const size = 6;
    
    // Center home
    if (row >= center - 1 && row <= center + 1 && 
        col >= center - 1 && col <= center + 1) {
      return 'HOME';
    }
    
    // Home columns
    if (row >= 2 && row <= 6 && col >= 2 && col <= 6) {
      if (row === 2 && col >= 2 && col <= 6) return 'RED_BASE';
      if (row === 6 && col >= 2 && col <= 6) return 'GREEN_BASE';
      if (row >= 2 && row <= 6 && col === 2) return 'BLUE_BASE';
      if (row >= 2 && row <= 6 && col === 6) return 'YELLOW_BASE';
    }
    
    // Path
    if (isOnPath(row, col)) {
      return 'PATH';
    }
    
    return 'EMPTY';
  };

  const isOnPath = (row, col) => {
    // Main path
    if (row === 0 && col >= 1 && col <= 5) return true;
    if (row === 1 && col >= 1 && col <= 5) return true;
    if (col === 6 && row >= 1 && row <= 5) return true;
    if (row === 6 && col >= 1 && col <= 5) return true;
    if (col === 0 && row >= 1 && row <= 5) return true;
    if (row === 7 && col >= 1 && col <= 5) return true;
    if (col === 7 && row >= 1 && row <= 5) return true;
    if (row === 8 && col >= 1 && col <= 5) return true;
    if (col === 8 && row >= 1 && row <= 5) return true;
    if (row === 1 && col >= 8 && col <= 13) return true;
    if (col === 13 && row >= 1 && row <= 5) return true;
    if (row === 6 && col >= 8 && col <= 13) return true;
    if (col === 14 && row >= 1 && row <= 5) return true;
    if (row === 8 && col >= 8 && col <= 13) return true;
    
    return false;
  };

  const BoardCell = ({ row, col, cellType, gameState, onTokenClick, selectedToken, isMyTurn, players }) => {
    // Render cell based on type
    const renderCellContent = () => {
      switch(cellType) {
        case 'HOME':
          return renderHome();
        case 'RED_BASE':
          return renderBase('RED', row, col);
        case 'GREEN_BASE':
          return renderBase('GREEN', row, col);
        case 'YELLOW_BASE':
          return renderBase('YELLOW', row, col);
        case 'BLUE_BASE':
          return renderBase('BLUE', row, col);
        case 'PATH':
          return renderPathCell(row, col);
        default:
          return null;
      }
    };

    const getCellColor = () => {
      if (cellType === 'HOME') return 'bg-yellow-400';
      if (cellType.includes('BASE')) {
        const color = cellType.split('_')[0];
        return `bg-${color.toLowerCase()}-100`;
      }
      if (cellType === 'PATH') {
        // Check if it's a safe position
        const position = getPositionFromCoords(row, col);
        if (BOARD_CONFIG.SAFE_POSITIONS.includes(position)) {
          return 'bg-green-100';
        }
        return 'bg-gray-100';
      }
      return 'bg-transparent';
    };

    return (
      <div
        className={`
          relative w-8 h-8 border border-gray-300/50
          ${getCellColor()}
          transition-all duration-200
          hover:bg-opacity-80
        `}
      >
        {renderCellContent()}
      </div>
    );
  };

  const renderHome = () => {
    return (
      <div className="w-full h-full flex items-center justify-center bg-yellow-400/50 rounded-full">
        <div className="w-4 h-4 bg-yellow-500 rounded-full animate-pulse" />
      </div>
    );
  };

  const renderBase = (color, row, col) => {
    const basePositions = {
      RED: [[0, 0], [0, 1], [1, 0], [1, 1]],
      GREEN: [[0, 0], [0, 1], [1, 0], [1, 1]],
      YELLOW: [[0, 0], [0, 1], [1, 0], [1, 1]],
      BLUE: [[0, 0], [0, 1], [1, 0], [1, 1]]
    };

    // Get the player for this color
    const player = Object.values(players || {}).find(p => p.color === color);
    if (!player) return null;

    // Position tokens within the base
    const baseIndex = (row % 2) * 2 + (col % 2);
    const token = player.tokens[baseIndex];

    if (!token || token.isActive || token.isFinished) return null;

    return (
      <div className="absolute inset-0 flex items-center justify-center">
        <Token
          color={color}
          size="sm"
          isActive={false}
          isFinished={false}
        />
      </div>
    );
  };

  const renderPathCell = (row, col) => {
    const position = getPositionFromCoords(row, col);
    if (position === -1) return null;

    // Check if any token is on this position
    const tokens = getAllTokensOnPosition(position);
    
    return (
      <div className="absolute inset-0 flex items-center justify-center">
        {tokens.map((token, index) => (
          <Token
            key={`${token.playerId}-${token.id}`}
            color={token.color}
            size={tokens.length > 1 ? 'sm' : 'md'}
            isActive={true}
            isFinished={false}
            isSelected={selectedToken === token.id}
            isClickable={isMyTurn}
            onClick={() => onTokenClick(token.id)}
            className="absolute"
            style={{
              transform: `translate(${(index - (tokens.length - 1) / 2) * 10}px, ${(index - (tokens.length - 1) / 2) * 10}px)`
            }}
          />
        ))}
      </div>
    );
  };

  const getPositionFromCoords = (row, col) => {
    // Calculate the path position from grid coordinates
    // This is a simplified version - you'll need the full mapping
    // For now, return -1 for non-path cells
    return -1;
  };

  const getAllTokensOnPosition = (position) => {
    const tokens = [];
    Object.entries(players || {}).forEach(([playerId, player]) => {
      player.tokens.forEach(token => {
        if (token.position === position && token.isActive && !token.isFinished) {
          tokens.push({
            ...token,
            color: player.color,
            playerId
          });
        }
      });
    });
    return tokens;
  };

  return (
    <motion.div
      className="relative max-w-[600px] w-full aspect-square bg-white rounded-2xl shadow-2xl overflow-hidden"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="grid grid-cols-15 grid-rows-15 gap-0 w-full h-full">
        {renderBoard()}
      </div>
    </motion.div>
  );
};

export default LudoBoard;
