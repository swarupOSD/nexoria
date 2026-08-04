export const generateBoardPaths = () => {
  // Generate the board path coordinates based on the Ludo board layout
  const paths = [];
  const gridSize = 15;
  
  // Define path coordinates for the main track
  // This is a simplified version - you can expand with exact coordinates
  for (let i = 0; i < 52; i++) {
    let x, y;
    // Calculate position on the board grid
    // Top row (going right)
    if (i < 6) {
      x = 1 + i;
      y = 0;
    }
    // Right column (going down)
    else if (i < 12) {
      x = 6;
      y = 1 + (i - 6);
    }
    // Bottom row (going left)
    else if (i < 18) {
      x = 5 - (i - 12);
      y = 6;
    }
    // Left column (going up)
    else if (i < 24) {
      x = 0;
      y = 5 - (i - 18);
    }
    // Top row (going right) - second layer
    else if (i < 30) {
      x = 1 + (i - 24);
      y = 1;
    }
    // Right column (going down) - second layer
    else if (i < 36) {
      x = 8;
      y = 1 + (i - 30);
    }
    // Bottom row (going left) - second layer
    else if (i < 42) {
      x = 7 - (i - 36);
      y = 8;
    }
    // Left column (going up) - second layer
    else if (i < 48) {
      x = 1;
      y = 7 - (i - 42);
    }
    // Final stretch
    else {
      x = 1 + (i - 48);
      y = 2;
    }
    
    paths.push({ x, y, position: i });
  }
  
  return paths;
};

export const getHomeColumnPath = (color) => {
  // Generate home column coordinates for each color
  const homePaths = {
    RED: [],
    GREEN: [],
    YELLOW: [],
    BLUE: []
  };
  
  // Red home column (top-left)
  for (let i = 0; i < 6; i++) {
    homePaths.RED.push({ x: 2 + i, y: 2, position: 52 + i });
  }
  
  // Green home column (top-right)
  for (let i = 0; i < 6; i++) {
    homePaths.GREEN.push({ x: 7, y: 2 + i, position: 52 + i });
  }
  
  // Yellow home column (bottom-right)
  for (let i = 0; i < 6; i++) {
    homePaths.YELLOW.push({ x: 5 - i, y: 7, position: 52 + i });
  }
  
  // Blue home column (bottom-left)
  for (let i = 0; i < 6; i++) {
    homePaths.BLUE.push({ x: 2, y: 5 - i, position: 52 + i });
  }
  
  return homePaths[color];
};

export const getTokenStartingPosition = (color) => {
  const startPositions = {
    RED: { x: 2, y: 2 },
    GREEN: { x: 2, y: 6 },
    YELLOW: { x: 6, y: 6 },
    BLUE: { x: 6, y: 2 }
  };
  return startPositions[color];
};

export const getBasePositions = (color) => {
  // Return the 4 base positions for a color
  const baseOffsets = {
    RED: [{ x: 1, y: 1 }, { x: 2, y: 1 }, { x: 1, y: 2 }, { x: 2, y: 2 }],
    GREEN: [{ x: 1, y: 6 }, { x: 2, y: 6 }, { x: 1, y: 7 }, { x: 2, y: 7 }],
    YELLOW: [{ x: 6, y: 6 }, { x: 7, y: 6 }, { x: 6, y: 7 }, { x: 7, y: 7 }],
    BLUE: [{ x: 6, y: 1 }, { x: 7, y: 1 }, { x: 6, y: 2 }, { x: 7, y: 2 }]
  };
  return baseOffsets[color];
};
