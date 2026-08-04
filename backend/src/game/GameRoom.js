import Player from './Player.js';
import Board from './Board.js';
import AIPlayer from './AIPlayer.js';
import { constants } from '../utils/constants.js';
const { EVENTS, GAME, COLORS } = constants;
import EventEmitter from 'events';

class GameRoom extends EventEmitter {
  constructor(roomId, io) {
    super();
    this.roomId = roomId;
    this.io = io;
    this.board = new Board();
    this.players = new Map();
    this.spectators = new Set();
    this.currentTurn = null;
    this.turnNumber = 0;
    this.status = 'WAITING'; // WAITING, READY, STARTING, ACTIVE, FINISHED
    this.diceValue = null;
    this.winner = null;
    this.lastAction = null;
    this.turnTimer = null;
    this.aiTimer = null;
    this.isProcessingMove = false;
  }

  // Player Management
  addPlayer(socketId, name, color) {
    if (this.players.size >= GAME.MAX_PLAYERS) {
      throw new Error('Game room is full');
    }

    if (this.players.has(socketId)) {
      throw new Error('Player already in room');
    }

    // Auto-assign color if not specified or taken
    if (!color || this.isColorTaken(color)) {
      color = this.getAvailableColor();
    }

    const player = new Player(socketId, name, color);
    this.players.set(socketId, player);

    this.broadcastGameState();
    return player;
  }

  removePlayer(socketId) {
    const player = this.players.get(socketId);
    if (!player) return;

    // If game is active, replace with AI
    if (this.status === 'ACTIVE' || this.status === 'STARTING') {
      this.replaceWithAI(socketId);
    } else {
      this.players.delete(socketId);
    }

    this.broadcastGameState();
  }

  replaceWithAI(socketId) {
    const player = this.players.get(socketId);
    if (!player) return;

    const aiPlayer = new AIPlayer(
      socketId + '_ai',
      `AI ${player.name}`,
      player.color
    );
    aiPlayer.isAI = true;
    aiPlayer.isReady = true;
    aiPlayer.tokens = player.tokens; // Keep tokens state
    aiPlayer.finishedTokens = player.finishedTokens;
    aiPlayer.consecutiveSixes = player.consecutiveSixes;

    this.players.set(socketId + '_ai', aiPlayer);
    this.players.delete(socketId);

    // If it was this player's turn, trigger AI move
    if (this.currentTurn === socketId) {
      this.currentTurn = aiPlayer.id;
      this.scheduleAIMove();
    }

    this.broadcastGameState();
  }

  isColorTaken(color) {
    return Array.from(this.players.values()).some(p => p.color === color);
  }

  getAvailableColor() {
    const takenColors = Array.from(this.players.values()).map(p => p.color);
    return COLORS.find(c => !takenColors.includes(c));
  }

  // Ready System
  toggleReady(socketId) {
    const player = this.players.get(socketId);
    if (!player) throw new Error('Player not found');

    if (this.status !== 'WAITING') {
      throw new Error('Game already started');
    }

    player.isReady = !player.isReady;
    this.broadcastGameState();

    // Check if all players are ready and we have minimum players
    if (this.canStartGame()) {
      this.startGame();
    }

    return player.isReady;
  }

  canStartGame() {
    const players = Array.from(this.players.values());
    const readyPlayers = players.filter(p => p.isReady);
    return players.length >= GAME.MIN_PLAYERS && 
           readyPlayers.length === players.length &&
           this.status === 'WAITING';
  }

  // Game Flow
  startGame() {
    this.status = 'STARTING';
    this.broadcastGameState();

    // Fill remaining slots with AI
    while (this.players.size < GAME.MAX_PLAYERS) {
      const color = this.getAvailableColor();
      if (color) {
        const aiId = `ai_${Date.now()}_${this.players.size}`;
        const aiPlayer = new AIPlayer(aiId, `AI ${this.players.size + 1}`, color);
        aiPlayer.isAI = true;
        aiPlayer.isReady = true;
        this.players.set(aiId, aiPlayer);
      }
    }

    // Set initial turn (first player to roll 6)
    this.status = 'ACTIVE';
    this.currentTurn = this.determineFirstPlayer();
    this.turnNumber = 1;

    this.broadcastGameState();
    this.emit(EVENTS.GAME_STARTED, { roomId: this.roomId });

    // Start AI turn if applicable
    this.handleAITurn();
  }

  determineFirstPlayer() {
    // Simple: first ready player
    const players = Array.from(this.players.values());
    return players.find(p => p.isReady)?.id || players[0]?.id;
  }

  // Dice Logic
  rollDice(socketId) {
    if (this.isProcessingMove) {
      throw new Error('Processing previous move');
    }

    if (this.status !== 'ACTIVE') {
      throw new Error('Game not active');
    }

    if (this.currentTurn !== socketId) {
      throw new Error('Not your turn');
    }

    const player = this.players.get(socketId);
    if (!player) throw new Error('Player not found');

    if (player.hasRolledThisTurn) {
      throw new Error('Already rolled this turn');
    }

    // Roll dice
    const diceValue = Math.floor(Math.random() * GAME.DICE_MAX) + 1;
    this.diceValue = diceValue;
    player.hasRolledThisTurn = true;

    // Check consecutive sixes
    if (diceValue === 6) {
      player.consecutiveSixes++;
      if (player.consecutiveSixes >= GAME.MAX_CONSECUTIVE_SIXES) {
        // Penalty: lose turn
        this.diceValue = null;
        player.consecutiveSixes = 0;
        this.emitToAll(EVENTS.DICE_ROLLED, { playerId: socketId, value: diceValue, invalid: true });
        this.endTurn();
        return;
      }
    } else {
      player.consecutiveSixes = 0;
    }

    // Check if player can move
    const canMove = player.canMoveWithDice(diceValue);
    this.emitToAll(EVENTS.DICE_ROLLED, {
      playerId: socketId,
      value: diceValue,
      canMove,
      consecutiveSixes: player.consecutiveSixes
    });

    if (!canMove) {
      // No valid moves - end turn
      this.diceValue = null;
      this.endTurn();
    } else {
      // Wait for player to select token
      this.broadcastGameState();
    }

    return { diceValue, canMove };
  }

  // Token Movement
  moveToken(socketId, tokenId) {
    if (this.isProcessingMove) {
      throw new Error('Processing previous move');
    }

    if (this.status !== 'ACTIVE') {
      throw new Error('Game not active');
    }

    if (this.currentTurn !== socketId) {
      throw new Error('Not your turn');
    }

    const player = this.players.get(socketId);
    if (!player) throw new Error('Player not found');

    if (!player.hasRolledThisTurn || this.diceValue === null) {
      throw new Error('Roll dice first');
    }

    const token = player.getTokenById(tokenId);
    if (!token) throw new Error('Token not found');

    const diceValue = this.diceValue;
    let newPosition = player.calculateNewPosition(token.position, diceValue);

    if (newPosition === null) {
      throw new Error('Invalid move');
    }

    this.isProcessingMove = true;

    // Handle token coming out of base
    if (token.isInBase() && diceValue === 6) {
      newPosition = import("../utils/constants.js").then(m => m.default?.BOARD || m.BOARD).START_POSITIONS[player.color];
      token.isActive = true;
    }

    // Check for kills
    const killedPlayer = this.checkForKills(player, token, newPosition);

    // Move token
    const oldPosition = token.position;
    token.position = newPosition;

    // Check if token reached home
    if (newPosition === 57) {
      token.isFinished = true;
      player.finishedTokens++;
      this.emitToAll(EVENTS.TOKEN_MOVED, {
        playerId: socketId,
        tokenId: token.id,
        from: oldPosition,
        to: newPosition,
        isHome: true
      });

      // Check win condition
      if (player.finishedTokens === 4) {
        this.endGame(socketId);
        return;
      }
    } else {
      this.emitToAll(EVENTS.TOKEN_MOVED, {
        playerId: socketId,
        tokenId: token.id,
        from: oldPosition,
        to: newPosition,
        killed: !!killedPlayer
      });
    }

    // Handle kill reward
    if (killedPlayer) {
      this.emitToAll(EVENTS.TOKEN_KILLED, {
        killerId: socketId,
        victimId: killedPlayer.id,
        victimColor: killedPlayer.color
      });
      // Extra turn for killing
      this.resetTurnState(socketId, true);
      this.broadcastGameState();
      this.isProcessingMove = false;
      this.handleAITurn();
      return;
    }

    // Check for extra turn (roll 6)
    const extraTurn = diceValue === 6;
    this.resetTurnState(socketId, extraTurn);

    this.broadcastGameState();
    this.isProcessingMove = false;

    if (!extraTurn) {
      this.endTurn();
    } else {
      this.emitToAll(EVENTS.TURN_CHANGED, {
        playerId: socketId,
        extraTurn: true
      });
    }

    this.handleAITurn();
  }

  checkForKills(player, token, newPosition) {
    if (this.board.isSafePosition(newPosition)) return null;
    if (newPosition >= 52) return null; // Home column is safe

    // Check all other players' tokens
    for (const [pid, otherPlayer] of this.players) {
      if (pid === player.id) continue;
      
      for (const otherToken of otherPlayer.tokens) {
        if (otherToken.isFinished || !otherToken.isActive) continue;
        if (otherToken.position === newPosition) {
          // Kill this token
          otherToken.reset();
          otherPlayer.finishedTokens--;
          return otherPlayer;
        }
      }
    }
    return null;
  }

  resetTurnState(playerId, keepTurn = false) {
    const player = this.players.get(playerId);
    if (player) {
      player.hasRolledThisTurn = false;
      this.diceValue = null;
    }
    if (!keepTurn) {
      this.currentTurn = playerId;
    }
  }

  endTurn() {
    this.diceValue = null;
    const players = Array.from(this.players.values());
    const currentIndex = players.findIndex(p => p.id === this.currentTurn);
    const nextIndex = (currentIndex + 1) % players.length;
    
    // Find next active player
    let nextPlayer = null;
    let attempts = 0;
    while (attempts < players.length) {
      const candidate = players[(currentIndex + 1 + attempts) % players.length];
      if (candidate.isConnected || candidate.isAI) {
        nextPlayer = candidate;
        break;
      }
      attempts++;
    }

    if (nextPlayer) {
      this.currentTurn = nextPlayer.id;
      this.turnNumber++;
      this.broadcastGameState();
      this.emitToAll(EVENTS.TURN_CHANGED, {
        playerId: this.currentTurn,
        turnNumber: this.turnNumber
      });
      this.handleAITurn();
    }
  }

  endGame(winnerId) {
    this.status = 'FINISHED';
    this.winner = winnerId;
    this.broadcastGameState();
    this.emitToAll(EVENTS.GAME_FINISHED, { winnerId });
    this.clearTimers();
  }

  // AI Handling
  handleAITurn() {
    this.clearTimers();
    
    if (this.status !== 'ACTIVE') return;
    
    const currentPlayer = this.players.get(this.currentTurn);
    if (!currentPlayer) return;

    if (currentPlayer.isAI) {
      // Schedule AI move with a delay to simulate thinking
      this.aiTimer = setTimeout(() => {
        this.executeAIMove(currentPlayer);
      }, 1000 + Math.random() * 1000);
    }
  }

  executeAIMove(aiPlayer) {
    if (this.status !== 'ACTIVE' || this.currentTurn !== aiPlayer.id) return;

    const ai = new AIPlayer(aiPlayer.id, aiPlayer.name, aiPlayer.color);
    ai.tokens = aiPlayer.tokens;
    ai.finishedTokens = aiPlayer.finishedTokens;
    ai.consecutiveSixes = aiPlayer.consecutiveSixes;

    // AI rolls dice
    const diceValue = Math.floor(Math.random() * GAME.DICE_MAX) + 1;
    this.diceValue = diceValue;
    aiPlayer.hasRolledThisTurn = true;

    // Check consecutive sixes
    if (diceValue === 6) {
      aiPlayer.consecutiveSixes++;
      if (aiPlayer.consecutiveSixes >= GAME.MAX_CONSECUTIVE_SIXES) {
        this.diceValue = null;
        aiPlayer.consecutiveSixes = 0;
        this.emitToAll(EVENTS.DICE_ROLLED, { playerId: aiPlayer.id, value: diceValue, invalid: true });
        this.broadcastGameState();
        this.endTurn();
        return;
      }
    } else {
      aiPlayer.consecutiveSixes = 0;
    }

    this.emitToAll(EVENTS.DICE_ROLLED, {
      playerId: aiPlayer.id,
      value: diceValue,
      isAI: true
    });

    // Find best move using AI strategy
    const move = ai.getBestMove(diceValue, this.players, this.board);
    
    if (move) {
      // Execute the move
      this.moveToken(aiPlayer.id, move.tokenId);
    } else {
      // No valid moves
      this.diceValue = null;
      this.broadcastGameState();
      this.endTurn();
    }
  }

  scheduleAIMove() {
    this.handleAITurn();
  }

  // Broadcasting
  broadcastGameState() {
    const state = this.getGameState();
    this.emitToAll(EVENTS.GAME_STATE, state);
  }

  emitToAll(event, data) {
    this.io.to(this.roomId).emit(event, data);
  }

  getGameState() {
    const players = {};
    for (const [id, player] of this.players) {
      players[id] = player.toJSON();
    }

    return {
      roomId: this.roomId,
      status: this.status,
      players,
      currentTurn: this.currentTurn,
      turnNumber: this.turnNumber,
      diceValue: this.diceValue,
      winner: this.winner,
      board: {
        safePositions: this.board.safePositions
      }
    };
  }

  clearTimers() {
    if (this.turnTimer) {
      clearTimeout(this.turnTimer);
      this.turnTimer = null;
    }
    if (this.aiTimer) {
      clearTimeout(this.aiTimer);
      this.aiTimer = null;
    }
  }

  cleanup() {
    this.clearTimers();
    this.players.clear();
    this.spectators.clear();
  }
}

export default GameRoom;
