
class GameEngine {
  constructor() {
    this.BOARD = {
      TOTAL_PATH: 52,
      HOME_COLUMN_LENGTH: 6,
      HOME_POSITION: 57,
      SAFE_POSITIONS: [0, 8, 13, 21, 26, 34, 39, 47],
      START_POSITIONS: {
        RED: 0,
        GREEN: 13,
        YELLOW: 26,
        BLUE: 39
      },
      HOME_ENTRY: {
        RED: 51,
        GREEN: 12,
        YELLOW: 25,
        BLUE: 38
      },
      STAR_POSITIONS: [0, 8, 13, 21, 26, 34, 39, 47] // Give extra turn
    };
  }

  /**
   * Calculate the new position for a token
   * @param {number} currentPos - Current position (-1 for base, 0-51 for path, 52-57 for home)
   * @param {number} diceValue - Dice roll (1-6)
   * @param {string} color - Player color
   * @param {boolean} isFromBase - Whether token is coming from base
   * @returns {number|null} New position or null if invalid
   */
  calculateNewPosition(currentPos, diceValue, color, isFromBase = false) {
    // Token in base
    if (currentPos === -1) {
      if (diceValue === 6) {
        return this.BOARD.START_POSITIONS[color];
      }
      return null;
    }

    // Token already finished
    if (currentPos === this.BOARD.HOME_POSITION) {
      return null;
    }

    const homeEntry = this.BOARD.HOME_ENTRY[color];

    // Token on main path (0-51)
    if (currentPos < this.BOARD.TOTAL_PATH) {
      const newPos = currentPos + diceValue;
      
      // Check if token reaches or passes home entry
      if (newPos > homeEntry) {
        // Calculate steps in home column
        const stepsInHome = newPos - homeEntry - 1;
        
        // If steps exceed home column length, invalid move
        if (stepsInHome >= this.BOARD.HOME_COLUMN_LENGTH) {
          return null;
        }
        
        // Enter home column
        const homeColumnPos = 52 + stepsInHome;
        
        // Check if it's the exact home position
        if (homeColumnPos === this.BOARD.HOME_POSITION) {
          return this.BOARD.HOME_POSITION;
        }
        
        return homeColumnPos;
      }
      
      // Normal move on main path
      return newPos;
    }

    // Token in home column (52-56)
    if (currentPos >= 52 && currentPos < 57) {
      const newPos = currentPos + diceValue;
      
      // Check if reaches exactly home
      if (newPos === this.BOARD.HOME_POSITION) {
        return this.BOARD.HOME_POSITION;
      }
      
      // Can't overshoot home
      if (newPos > this.BOARD.HOME_POSITION) {
        return null;
      }
      
      return newPos;
    }

    return null;
  }

  /**
   * Check if a move is valid
   * @param {Object} player - Player object
   * @param {number} tokenId - Token ID
   * @param {number} diceValue - Dice roll
   * @returns {Object} { valid: boolean, newPosition: number|null, reason: string }
   */
  validateMove(player, tokenId, diceValue) {
    const token = player.tokens[tokenId];
    
    if (!token) {
      return { valid: false, newPosition: null, reason: 'Token not found' };
    }

    // Token already finished
    if (token.isFinished) {
      return { valid: false, newPosition: null, reason: 'Token already home' };
    }

    // Token in base - need dice 6
    if (token.position === -1) {
      if (diceValue === 6) {
        return { 
          valid: true, 
          newPosition: this.BOARD.START_POSITIONS[player.color],
          reason: 'Moving out of base'
        };
      }
      return { valid: false, newPosition: null, reason: 'Need 6 to leave base' };
    }

    // Calculate new position
    const newPosition = this.calculateNewPosition(
      token.position, 
      diceValue, 
      player.color
    );

    if (newPosition === null) {
      return { valid: false, newPosition: null, reason: 'Invalid move' };
    }

    return { valid: true, newPosition, reason: 'Valid move' };
  }

  /**
   * Check for kills when a token lands on a position
   * @param {Object} players - All players in the game
   * @param {string} currentPlayerId - Current player ID
   * @param {string} tokenColor - Color of the moving token
   * @param {number} newPosition - Position where token lands
   * @returns {Array} Array of killed tokens [{ playerId, tokenId, color }]
   */
  checkForKills(players, currentPlayerId, tokenColor, newPosition) {
    const killedTokens = [];

    // Don't check kills on safe positions
    if (this.BOARD.SAFE_POSITIONS.includes(newPosition)) {
      return killedTokens;
    }

    // Don't check kills in home column
    if (newPosition >= 52) {
      return killedTokens;
    }

    // Check all other players' tokens
    for (const [playerId, player] of Object.entries(players)) {
      // Skip current player
      if (playerId === currentPlayerId) continue;

      // Skip if player has no active tokens
      if (!player.tokens) continue;

      // Check each token
      for (const token of player.tokens) {
        // Token must be active and not finished
        if (!token.isActive || token.isFinished) continue;
        
        // Token position must match new position
        if (token.position === newPosition) {
          killedTokens.push({
            playerId,
            tokenId: token.id,
            color: player.color,
            token
          });
        }
      }
    }

    return killedTokens;
  }

  /**
   * Check if a player has any valid moves with the given dice value
   * @param {Object} player - Player object
   * @param {number} diceValue - Dice roll
   * @returns {Array} Array of valid moves [{ tokenId, newPosition }]
   */
  getValidMoves(player, diceValue) {
    const validMoves = [];

    for (let i = 0; i < player.tokens.length; i++) {
      const token = player.tokens[i];
      
      // Skip finished tokens
      if (token.isFinished) continue;

      // Check if this token can move
      const result = this.validateMove(player, i, diceValue);
      
      if (result.valid) {
        validMoves.push({
          tokenId: i,
          token,
          newPosition: result.newPosition,
          isFromBase: token.position === -1
        });
      }
    }

    return validMoves;
  }

  /**
   * Process a move: update token position, handle kills, check win condition
   * @param {Object} gameState - Current game state
   * @param {string} playerId - Player making the move
   * @param {number} tokenId - Token to move
   * @param {number} diceValue - Dice roll
   * @returns {Object} Move result
   */
  processMove(gameState, playerId, tokenId, diceValue) {
    const player = gameState.players[playerId];
    if (!player) {
      throw new Error('Player not found');
    }

    const token = player.tokens[tokenId];
    if (!token) {
      throw new Error('Token not found');
    }

    // Validate the move
    const validation = this.validateMove(player, tokenId, diceValue);
    if (!validation.valid) {
      throw new Error(validation.reason);
    }

    const oldPosition = token.position;
    const newPosition = validation.newPosition;

    // Update token position
    token.position = newPosition;
    token.isActive = true;

    // Check if token reached home
    let reachedHome = false;
    if (newPosition === this.BOARD.HOME_POSITION) {
      token.isFinished = true;
      player.finishedTokens++;
      reachedHome = true;
    }

    // Check for kills
    const killedTokens = this.checkForKills(
      gameState.players,
      playerId,
      player.color,
      newPosition
    );

    // Process kills
    const killedTokenDetails = [];
    for (const killed of killedTokens) {
      const victim = gameState.players[killed.playerId];
      if (victim) {
        // Reset token to base
        killed.token.position = -1;
        killed.token.isActive = false;
        killed.token.isFinished = false;
        victim.finishedTokens--;
        killedTokenDetails.push(killed);
      }
    }

    // Check win condition
    let gameWon = false;
    if (player.finishedTokens === 4) {
      gameWon = true;
    }

    return {
      success: true,
      playerId,
      tokenId,
      oldPosition,
      newPosition,
      reachedHome,
      killedTokens: killedTokenDetails,
      gameWon,
      extraTurn: diceValue === 6 || killedTokens.length > 0,
      message: this.getMoveMessage(diceValue, reachedHome, killedTokens.length)
    };
  }

  /**
   * Get human-readable message for the move
   */
  getMoveMessage(diceValue, reachedHome, killCount) {
    let message = `Rolled ${diceValue}`;
    
    if (reachedHome) {
      message += ' and reached home! 🏠';
    }
    
    if (killCount > 0) {
      message += ` and killed ${killCount} token${killCount > 1 ? 's' : ''}! 💥`;
    }
    
    if (diceValue === 6) {
      message += ' Extra turn! 🎲';
    }
    
    if (killCount > 0) {
      message += ' Extra turn for kill! ⭐';
    }
    
    return message;
  }

  /**
   * Handle turn logic including consecutive sixes
   * @param {Object} player - Current player
   * @param {number} diceValue - Rolled value
   * @param {number} consecutiveSixes - Current count of consecutive sixes
   * @returns {Object} Turn result
   */
  processTurn(player, diceValue, consecutiveSixes) {
    let newConsecutiveSixes = consecutiveSixes;
    let turnLost = false;
    let extraTurn = false;

    // Check for consecutive sixes
    if (diceValue === 6) {
      newConsecutiveSixes++;
      
      // Three consecutive sixes = lose turn
      if (newConsecutiveSixes >= 3) {
        turnLost = true;
        newConsecutiveSixes = 0;
        return {
          turnLost: true,
          extraTurn: false,
          consecutiveSixes: newConsecutiveSixes,
          message: 'Three sixes in a row! Turn lost! ❌'
        };
      }
    } else {
      newConsecutiveSixes = 0;
    }

    // Check if player has any valid moves
    const validMoves = this.getValidMoves(player, diceValue);
    
    if (validMoves.length === 0) {
      // No valid moves - pass turn
      return {
        turnLost: true,
        extraTurn: false,
        consecutiveSixes: newConsecutiveSixes,
        message: 'No valid moves. Turn passed.',
        validMoves: []
      };
    }

    // Player can move
    extraTurn = diceValue === 6;

    return {
      turnLost: false,
      extraTurn,
      consecutiveSixes: newConsecutiveSixes,
      message: extraTurn ? 'Rolled 6! Extra turn! 🎲' : 'Valid moves available',
      validMoves
    };
  }

  /**
   * Determine the next player turn
   * @param {Object} players - All players
   * @param {string} currentPlayerId - Current player ID
   * @param {boolean} keepTurn - Whether the same player keeps turn
   * @returns {string} Next player ID
   */
  getNextTurn(players, currentPlayerId, keepTurn = false) {
    if (keepTurn) {
      return currentPlayerId;
    }

    const playerIds = Object.keys(players);
    const currentIndex = playerIds.indexOf(currentPlayerId);
    let nextIndex = (currentIndex + 1) % playerIds.length;
    
    // Find next active player (not AI that might be disconnected, etc.)
    let attempts = 0;
    while (attempts < playerIds.length) {
      const nextPlayerId = playerIds[nextIndex];
      const nextPlayer = players[nextPlayerId];
      
      // Skip if player is disconnected or has no tokens left
      if (nextPlayer && (nextPlayer.isConnected || nextPlayer.isAI)) {
        // Check if player has any tokens that can move (if game is active)
        const hasTokens = nextPlayer.tokens.some(t => !t.isFinished);
        if (hasTokens) {
          return nextPlayerId;
        }
      }
      
      nextIndex = (nextIndex + 1) % playerIds.length;
      attempts++;
    }
    
    // Fallback to current player
    return currentPlayerId;
  }

  /**
   * Check if the game is finished
   * @param {Object} players - All players
   * @returns {string|null} Winner ID or null
   */
  checkGameWinner(players) {
    for (const [playerId, player] of Object.entries(players)) {
      if (player.finishedTokens === 4) {
        return playerId;
      }
    }
    return null;
  }

  /**
   * Handle all edge cases for a move
   */
  handleEdgeCases(gameState, playerId, tokenId, diceValue) {
    const issues = [];

    // Check if dice value is valid
    if (diceValue < 1 || diceValue > 6) {
      issues.push('Invalid dice value');
    }

    // Check if player exists
    const player = gameState.players[playerId];
    if (!player) {
      issues.push('Player not found');
      return issues;
    }

    // Check if token exists
    const token = player.tokens[tokenId];
    if (!token) {
      issues.push('Token not found');
      return issues;
    }

    // Check if token is finished
    if (token.isFinished) {
      issues.push('Token already finished');
    }

    // Check if game is active
    if (gameState.status !== 'ACTIVE') {
      issues.push('Game is not active');
    }

    // Check if it's the player's turn
    if (gameState.currentTurn !== playerId) {
      issues.push('Not your turn');
    }

    // Check for three sixes (handled in processTurn)
    if (player.consecutiveSixes >= 3) {
      issues.push('Three consecutive sixes - turn lost');
    }

    return issues;
  }
}

export default GameEngine;
