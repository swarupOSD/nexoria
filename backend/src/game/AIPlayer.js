import { constants } from '../utils/constants.js';

class AIPlayer {
  constructor(id, name, color) {
    this.id = id;
    this.name = name;
    this.color = color;
    this.isAI = true;
    this.isReady = true;
    this.isConnected = true;
    this.tokens = [];
    this.finishedTokens = 0;
    this.consecutiveSixes = 0;
    this.hasRolledThisTurn = false;
  }

  getBestMove(diceValue, players, board) {
    // Strategy: prioritize killing opponents, then moving tokens, then bringing out new tokens
    
    const availableMoves = this.getAvailableMoves(diceValue);
    if (availableMoves.length === 0) return null;

    // Sort moves by priority
    const scoredMoves = availableMoves.map(move => ({
      ...move,
      score: this.scoreMove(move, players, board)
    }));

    scoredMoves.sort((a, b) => b.score - a.score);
    return scoredMoves[0];
  }

  getAvailableMoves(diceValue) {
    const moves = [];
    
    // Check if can bring out new token (dice = 6)
    if (diceValue === 6) {
      const tokensInBase = this.tokens.filter(t => t.position === -1);
      for (const token of tokensInBase) {
        moves.push({
          tokenId: token.id,
          newPosition: constants.BOARD.START_POSITIONS[this.color],
          isFromBase: true
        });
      }
    }

    // Check moving existing tokens
    for (const token of this.tokens) {
      if (token.isFinished || !token.isActive) continue;
      const newPos = this.calculateNewPosition(token.position, diceValue);
      if (newPos !== null) {
        moves.push({
          tokenId: token.id,
          newPosition: newPos,
          isFromBase: false
        });
      }
    }

    return moves;
  }

  calculateNewPosition(currentPos, diceValue) {
    const homeEntry = constants.BOARD.HOME_ENTRY[this.color];

    if (currentPos === -1) return null;
    
    if (currentPos < 52) {
      const newPos = currentPos + diceValue;
      if (newPos > homeEntry) {
        const stepsInHome = newPos - homeEntry - 1;
        if (stepsInHome < 6) return 52 + stepsInHome;
        if (stepsInHome === 6) return 57;
        return null;
      }
      return newPos;
    }

    if (currentPos >= 52 && currentPos < 57) {
      const newPos = currentPos + diceValue;
      if (newPos === 57) return 57;
      if (newPos > 57) return null;
      return newPos;
    }

    return null;
  }

  scoreMove(move, players, board) {
    let score = 0;

    // Priority 1: Kill opponents (highest priority)
    for (const [id, player] of players) {
      if (player.id === this.id) continue;
      for (const token of player.tokens) {
        if (token.position === move.newPosition && !board.isSafePosition(move.newPosition)) {
          score += 100;
        }
      }
    }

    // Priority 2: Move towards home
    if (move.newPosition >= 52) {
      score += 50 + (57 - move.newPosition) * 10;
    }

    // Priority 3: Move to safe positions
    if (board.isSafePosition(move.newPosition)) {
      score += 30;
    }

    // Priority 4: Move forward (closer to home)
    const homeEntry = constants.BOARD.HOME_ENTRY[this.color];
    const distanceToHome = homeEntry - move.newPosition;
    if (distanceToHome > 0) {
      score += Math.max(0, 52 - distanceToHome) * 0.5;
    }

    // Priority 5: Bring out token from base
    if (move.isFromBase) {
      score += 20;
    }

    return score;
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      color: this.color,
      isReady: this.isReady,
      isConnected: this.isConnected,
      isAI: this.isAI,
      tokens: this.tokens.map(t => ({
        id: t.id,
        position: t.position,
        isActive: t.isActive,
        isFinished: t.isFinished
      })),
      finishedTokens: this.finishedTokens,
      consecutiveSixes: this.consecutiveSixes
    };
  }
}

export default AIPlayer;
