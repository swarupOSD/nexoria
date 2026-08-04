export const COLORS = ['RED', 'GREEN', 'YELLOW', 'BLUE'];
export const COLOR_HEX = {
  RED: '#DC2626',
  GREEN: '#16A34A',
  YELLOW: '#F59E0B',
  BLUE: '#2563EB'
};
export const COLOR_LIGHT = {
  RED: '#FEE2E2',
  GREEN: '#DCFCE7',
  YELLOW: '#FEF3C7',
  BLUE: '#DBEAFE'
};
export const COLOR_DARK = {
  RED: '#991B1B',
  GREEN: '#166534',
  YELLOW: '#92400E',
  BLUE: '#1E3A8A'
};

export const BOARD_CONFIG = {
  GRID_SIZE: 15,
  CELL_SIZE: 40,
  PATH_POSITIONS: {
    RED: { start: 0, homeEntry: 51 },
    GREEN: { start: 13, homeEntry: 12 },
    YELLOW: { start: 26, homeEntry: 25 },
    BLUE: { start: 39, homeEntry: 38 }
  },
  SAFE_POSITIONS: [0, 8, 13, 21, 26, 34, 39, 47],
  HOME_COLUMN_LENGTH: 6
};

export const EVENTS = {
  JOIN_GAME: 'joinGame',
  LEAVE_GAME: 'leaveGame',
  TOGGLE_READY: 'toggleReady',
  ROLL_DICE: 'rollDice',
  MOVE_TOKEN: 'moveToken',
  
  GAME_STATE: 'gameState',
  DICE_ROLLED: 'diceRolled',
  TOKEN_MOVED: 'tokenMoved',
  TOKEN_KILLED: 'tokenKilled',
  TURN_CHANGED: 'turnChanged',
  PLAYER_READY: 'playerReady',
  GAME_STARTED: 'gameStarted',
  GAME_FINISHED: 'gameFinished',
  ERROR: 'error'
};

export const TOAST_MESSAGES = {
  JOIN_SUCCESS: 'Successfully joined the game!',
  JOIN_ERROR: 'Failed to join the game.',
  GAME_STARTED: 'The game has started! Good luck!',
  TURN_CHANGED: 'It is now your turn.',
  SIX_ROLLED: 'You rolled a 6! You get an extra turn.',
  TOKEN_KILLED: 'Oh no! Your token was sent back to base.',
  KILL_REWARD: 'You killed an opponent! You get an extra turn.',
  TOKEN_HOME: 'A token reached home!',
  GAME_WON: 'Congratulations! You won the game!',
  GAME_LOST: 'Game over. Better luck next time.',
};
