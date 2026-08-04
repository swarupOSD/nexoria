
/**
 * Handle all edge cases in the game
 */
export class EdgeCaseHandler {
  /**
   * Check if player has valid moves with any token
   */
  static hasValidMoves(player, diceValue) {
    // If player has no active tokens, they can't move
    const activeTokens = player.tokens.filter(t => t.isActive && !t.isFinished);
    if (activeTokens.length === 0) {
      // Only can move if dice is 6 (to bring out new token)
      return diceValue === 6 && player.tokens.some(t => t.position === -1);
    }

    // Check each token
    return player.tokens.some((token, index) => {
      if (token.isFinished) return false;
      
      // Token in base needs dice 6
      if (token.position === -1) {
        return diceValue === 6;
      }
      
      // Calculate if token can move
      const homeEntry = {
        RED: 51, GREEN: 12, YELLOW: 25, BLUE: 38
      }[player.color];
      
      // If token is on path and would overshoot home
      if (token.position < 52) {
        const newPos = token.position + diceValue;
        if (newPos > homeEntry) {
          const stepsInHome = newPos - homeEntry - 1;
          return stepsInHome < 6;
        }
        return true;
      }
      
      // Token in home column
      if (token.position >= 52 && token.position < 57) {
        const newPos = token.position + diceValue;
        return newPos <= 57;
      }
      
      return false;
    });
  }

  /**
   * Handle three consecutive sixes
   */
  static handleThreeSixes(player) {
    if (player.consecutiveSixes >= 3) {
      player.consecutiveSixes = 0;
      return {
        penalized: true,
        message: 'Three sixes in a row! Turn lost! ❌',
        nextAction: 'PASS_TURN'
      };
    }
    return {
      penalized: false,
      nextAction: 'CONTINUE'
    };
  }

  /**
   * Handle overshooting home
   */
  static handleHomeOvershoot(currentPos, diceValue, color) {
    const homeEntry = {
      RED: 51, GREEN: 12, YELLOW: 25, BLUE: 38
    }[color];

    // If token is on main path
    if (currentPos < 52) {
      const newPos = currentPos + diceValue;
      if (newPos > homeEntry) {
        const stepsInHome = newPos - homeEntry - 1;
        if (stepsInHome >= 6) {
          return {
            valid: false,
            message: 'Would overshoot home',
            canMove: false
          };
        }
        return {
          valid: true,
          newPosition: 52 + stepsInHome,
          message: 'Entering home column'
        };
      }
      return {
        valid: true,
        newPosition: newPos,
        message: 'Moving on path'
      };
    }

    // Token in home column
    if (currentPos >= 52 && currentPos < 57) {
      const newPos = currentPos + diceValue;
      if (newPos > 57) {
        return {
          valid: false,
          message: 'Would overshoot home',
          canMove: false
        };
      }
      return {
        valid: true,
        newPosition: newPos,
        message: newPos === 57 ? 'Reached home! 🏠' : 'Moving in home column'
      };
    }

    return { valid: false, message: 'Invalid position' };
  }

  /**
   * Handle auto-skip turns
   */
  static autoSkipTurn(player, diceValue) {
    const hasValidMoves = this.hasValidMoves(player, diceValue);
    
    if (!hasValidMoves) {
      return {
        skipped: true,
        reason: 'No valid moves available',
        message: 'No valid moves. Turn passed.'
      };
    }
    
    return {
      skipped: false,
      message: 'Valid moves available'
    };
  }

  /**
   * Validate dice roll special cases
   */
  static validateDiceRoll(player, diceValue) {
    const issues = [];

    // Check for invalid dice value
    if (diceValue < 1 || diceValue > 6) {
      issues.push('Invalid dice value');
    }

    // Check consecutive sixes
    if (diceValue === 6) {
      player.consecutiveSixes = (player.consecutiveSixes || 0) + 1;
      
      if (player.consecutiveSixes >= 3) {
        const result = this.handleThreeSixes(player);
        issues.push(result.message);
        return { valid: false, issues, result };
      }
    } else {
      player.consecutiveSixes = 0;
    }

    // Check for valid moves
    const skipResult = this.autoSkipTurn(player, diceValue);
    if (skipResult.skipped) {
      issues.push(skipResult.message);
      return { valid: false, issues, skipResult };
    }

    return { 
      valid: true, 
      issues: [], 
      consecutiveSixes: player.consecutiveSixes 
    };
  }

  /**
   * Handle game end conditions
   */
  static checkGameEndConditions(gameState) {
    const { players, status } = gameState;

    // Check if any player has all 4 tokens home
    for (const [playerId, player] of Object.entries(players)) {
      if (player.finishedTokens === 4) {
        return {
          gameEnded: true,
          winner: playerId,
          reason: 'All tokens reached home! 🏆'
        };
      }
    }

    // Check if all players are stuck (no valid moves possible)
    let allStuck = true;
    for (const player of Object.values(players)) {
      // If player has any active tokens, they might have moves
      if (player.tokens.some(t => t.isActive && !t.isFinished)) {
        allStuck = false;
        break;
      }
    }

    if (allStuck && status === 'ACTIVE') {
      // Determine winner by most tokens home
      let maxTokens = -1;
      let winner = null;
      for (const [playerId, player] of Object.entries(players)) {
        if (player.finishedTokens > maxTokens) {
          maxTokens = player.finishedTokens;
          winner = playerId;
        }
      }
      return {
        gameEnded: true,
        winner,
        reason: 'Game stuck - winner by most tokens home!'
      };
    }

    return { gameEnded: false };
  }
}
