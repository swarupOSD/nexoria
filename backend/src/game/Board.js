class Board {
  constructor() {
    this.safePositions = import("../utils/constants.js").then(m => m.default?.BOARD || m.BOARD).SAFE_POSITIONS;
    this.totalPath = 52;
    this.homeColumnLength = 6;
  }

  isSafePosition(position) {
    return this.safePositions.includes(position);
  }

  isValidPosition(position) {
    return position >= -1 && position <= 57;
  }

  getPositionType(position) {
    if (position === -1) return 'BASE';
    if (position === 57) return 'HOME';
    if (position >= 52 && position < 57) return 'HOME_COLUMN';
    if (position >= 0 && position < 52) return 'PATH';
    return 'INVALID';
  }

  canKill(attackerPos, defenderPos, defenderColor) {
    // Can't kill if positions don't match
    if (attackerPos !== defenderPos) return false;
    
    // Can't kill if position is safe
    if (this.isSafePosition(attackerPos)) return false;
    
    // Can't kill in home column
    if (defenderPos >= 52) return false;
    
    return true;
  }
}

export default Board;
