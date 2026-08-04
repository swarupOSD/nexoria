export const constants = {

  COLORS: ['RED', 'GREEN', 'YELLOW', 'BLUE'],
  
  BOARD: {
    TOTAL_PATH: 52,
    HOME_COLUMN_LENGTH: 6,
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
    SAFE_POSITIONS: [0, 8, 13, 21, 26, 34, 39, 47],
    // Star positions that give extra turn
    STAR_POSITIONS: [0, 8, 13, 21, 26, 34, 39, 47]
  },
  
  TOKEN: {
    BASE: -1,
    HOME: 57 // Center home position
  },
  
  GAME: {
    MAX_PLAYERS: 4,
    MIN_PLAYERS: 2,
    MAX_CONSECUTIVE_SIXES: 3,
    DICE_MAX: 6,
    DICE_MIN: 1
  },
  
  EVENTS: {
    // Client events
    JOIN_GAME: 'joinGame',
    LEAVE_GAME: 'leaveGame',
    TOGGLE_READY: 'toggleReady',
    ROLL_DICE: 'rollDice',
    MOVE_TOKEN: 'moveToken',
    
    // Server events
    GAME_STATE: 'gameState',
    DICE_ROLLED: 'diceRolled',
    TOKEN_MOVED: 'tokenMoved',
    TOKEN_KILLED: 'tokenKilled',
    TURN_CHANGED: 'turnChanged',
    PLAYER_READY: 'playerReady',
    GAME_STARTED: 'gameStarted',
    GAME_FINISHED: 'gameFinished',
    ERROR: 'error'
  }
};
