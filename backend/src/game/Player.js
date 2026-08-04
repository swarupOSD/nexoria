import Token from './Token.js';

class Player {
  constructor(id, name, color) {
    this.id = id;
    this.name = name;
    this.color = color;
    this.isReady = false;
    this.isConnected = true;
    this.isAI = false;
    this.tokens = this.initializeTokens();
    this.consecutiveSixes = 0;
    this.finishedTokens = 0;
    this.hasRolledThisTurn = false;
  }

  initializeTokens() {
    return Array.from({ length: 4 }, (_, i) => new Token(i, this.color));
  }

  getActiveTokens() {
    return this.tokens.filter(t => t.isActive && !t.isFinished);
  }

  getFinishedTokens() {
    return this.tokens.filter(t => t.isFinished);
  }

  getTokensInBase() {
    return this.tokens.filter(t => t.isInBase());
  }

  getTokenById(tokenId) {
    return this.tokens.find(t => t.id === tokenId);
  }

  canMoveWithDice(diceValue) {
    const activeTokens = this.getActiveTokens();
    
    // If dice is 6, can bring out new token from base
    if (diceValue === 6 && this.getTokensInBase().length > 0) {
      return true;
    }

    // Check if any active token can move
    return activeTokens.some(token => {
      const newPos = this.calculateNewPosition(token.position, diceValue);
      return newPos !== null;
    });
  }

  calculateNewPosition(currentPos, diceValue) {
    // If token is in base
    if (currentPos === -1) return null;

    // If token is on main path
    if (currentPos < 52) {
      const newPos = currentPos + diceValue;
      // Check if it enters home column
      const homeEntry = import("./constants.js").then(m => m.default?.BOARD || m.BOARD).HOME_ENTRY[this.color];
      if (newPos > homeEntry) {
        // Entering home column
        const stepsInHome = newPos - homeEntry - 1;
        if (stepsInHome < 6) {
          return 52 + stepsInHome;
        } else if (stepsInHome === 6) {
          return 57; // HOME
        } else {
          return null; // Can't move past home
        }
      }
      return newPos;
    }

    // If token is in home column (52-56)
    if (currentPos >= 52 && currentPos < 57) {
      const newPos = currentPos + diceValue;
      if (newPos === 57) return 57; // Exact home
      if (newPos > 57) return null; // Can't overshoot
      return newPos;
    }

    return null;
  }

  reset() {
    this.tokens.forEach(token => token.reset());
    this.consecutiveSixes = 0;
    this.finishedTokens = 0;
    this.hasRolledThisTurn = false;
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      color: this.color,
      isReady: this.isReady,
      isConnected: this.isConnected,
      isAI: this.isAI,
      tokens: this.tokens.map(t => t.toJSON()),
      finishedTokens: this.finishedTokens,
      consecutiveSixes: this.consecutiveSixes
    };
  }
}

export default Player;
