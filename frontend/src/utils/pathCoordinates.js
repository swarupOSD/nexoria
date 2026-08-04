
/**
 * Complete path mapping for the Ludo board
 * Grid is 15x15 with positions (row, col) from (0,0) to (14,14)
 */

export const PATH_COORDINATES = {
  // Main path positions 0-51 (global track)
  mainPath: [
    // Top row - moving right (positions 0-5)
    { position: 0, row: 1, col: 6 },  // RED start
    { position: 1, row: 1, col: 7 },
    { position: 2, row: 1, col: 8 },
    { position: 3, row: 1, col: 9 },
    { position: 4, row: 1, col: 10 },
    { position: 5, row: 1, col: 11 },
    { position: 6, row: 1, col: 12 },
    
    // Right column - moving down (positions 7-12)
    { position: 7, row: 2, col: 13 },
    { position: 8, row: 3, col: 13 }, // Safe zone
    { position: 9, row: 4, col: 13 },
    { position: 10, row: 5, col: 13 },
    { position: 11, row: 6, col: 13 },
    { position: 12, row: 7, col: 13 },
    { position: 13, row: 8, col: 13 }, // GREEN start
    
    // Bottom row - moving left (positions 14-19)
    { position: 14, row: 9, col: 13 },
    { position: 15, row: 9, col: 12 },
    { position: 16, row: 9, col: 11 },
    { position: 17, row: 9, col: 10 },
    { position: 18, row: 9, col: 9 },
    { position: 19, row: 9, col: 8 },
    { position: 20, row: 9, col: 7 },
    
    // Left column - moving up (positions 21-26)
    { position: 21, row: 9, col: 6 }, // Safe zone
    { position: 22, row: 8, col: 6 },
    { position: 23, row: 7, col: 6 },
    { position: 24, row: 6, col: 6 },
    { position: 25, row: 5, col: 6 },
    { position: 26, row: 4, col: 6 }, // YELLOW start
    
    // Top row inner - moving right (positions 27-32)
    { position: 27, row: 3, col: 6 },
    { position: 28, row: 3, col: 5 },
    { position: 29, row: 3, col: 4 },
    { position: 30, row: 3, col: 3 },
    { position: 31, row: 3, col: 2 },
    { position: 32, row: 3, col: 1 },
    
    // Right column inner - moving down (positions 33-38)
    { position: 33, row: 4, col: 1 },
    { position: 34, row: 5, col: 1 }, // Safe zone
    { position: 35, row: 6, col: 1 },
    { position: 36, row: 7, col: 1 },
    { position: 37, row: 8, col: 1 },
    { position: 38, row: 9, col: 1 },
    { position: 39, row: 10, col: 1 }, // BLUE start
    
    // Bottom row inner - moving left (positions 40-45)
    { position: 40, row: 11, col: 1 },
    { position: 41, row: 11, col: 2 },
    { position: 42, row: 11, col: 3 },
    { position: 43, row: 11, col: 4 },
    { position: 44, row: 11, col: 5 },
    { position: 45, row: 11, col: 6 },
    
    // Left column inner - moving up (positions 46-51)
    { position: 46, row: 11, col: 7 },
    { position: 47, row: 10, col: 7 }, // Safe zone
    { position: 48, row: 9, col: 7 },
    { position: 49, row: 8, col: 7 },
    { position: 50, row: 7, col: 7 },
    { position: 51, row: 6, col: 7 }, // RED home entry
  ],

  // Home columns for each color (positions 52-57)
  homeColumns: {
    RED: [
      { position: 52, row: 2, col: 7 },
      { position: 53, row: 2, col: 8 },
      { position: 54, row: 2, col: 9 },
      { position: 55, row: 2, col: 10 },
      { position: 56, row: 2, col: 11 },
      { position: 57, row: 1, col: 11 }, // Home center
    ],
    GREEN: [
      { position: 52, row: 8, col: 12 },
      { position: 53, row: 9, col: 12 },
      { position: 54, row: 10, col: 12 },
      { position: 55, row: 11, col: 12 },
      { position: 56, row: 12, col: 12 },
      { position: 57, row: 12, col: 11 }, // Home center
    ],
    YELLOW: [
      { position: 52, row: 11, col: 7 },
      { position: 53, row: 11, col: 8 },
      { position: 54, row: 11, col: 9 },
      { position: 55, row: 11, col: 10 },
      { position: 56, row: 11, col: 11 },
      { position: 57, row: 12, col: 11 }, // Home center
    ],
    BLUE: [
      { position: 52, row: 5, col: 2 },
      { position: 53, row: 4, col: 2 },
      { position: 54, row: 3, col: 2 },
      { position: 55, row: 2, col: 2 },
      { position: 56, row: 1, col: 2 },
      { position: 57, row: 1, col: 3 }, // Home center
    ],
  },

  // Base positions for tokens (when in base)
  bases: {
    RED: [
      { row: 2, col: 2 },
      { row: 2, col: 3 },
      { row: 3, col: 2 },
      { row: 3, col: 3 },
    ],
    GREEN: [
      { row: 2, col: 11 },
      { row: 2, col: 12 },
      { row: 3, col: 11 },
      { row: 3, col: 12 },
    ],
    YELLOW: [
      { row: 11, col: 11 },
      { row: 11, col: 12 },
      { row: 12, col: 11 },
      { row: 12, col: 12 },
    ],
    BLUE: [
      { row: 11, col: 2 },
      { row: 11, col: 3 },
      { row: 12, col: 2 },
      { row: 12, col: 3 },
    ],
  },

  // Get position coordinates
  getPositionCoordinates(position, color = null) {
    if (position === -1) return null;
    
    // Check main path
    if (position >= 0 && position < 52) {
      return this.mainPath.find(p => p.position === position);
    }
    
    // Check home columns
    if (position >= 52 && position <= 57 && color) {
      const column = this.homeColumns[color];
      return column.find(p => p.position === position);
    }
    
    return null;
  },

  // Get base position for token index
  getBasePosition(color, tokenIndex) {
    const base = this.bases[color];
    return base[tokenIndex % base.length];
  }
};
