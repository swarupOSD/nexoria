import { constants } from '../utils/constants.js';
const { EVENTS } = constants;

export default (io, socket, gameManager) => {
  // Join Game
  socket.on(EVENTS.JOIN_GAME, ({ roomId, playerName, color }) => {
    try {
      const result = gameManager.joinRoom(socket.id, roomId, playerName, color);
      const state = result.room.getGameState();
      socket.emit(EVENTS.GAME_STATE, state);
      socket.emit('joinSuccess', { roomId, player: result.player });
      
      // Broadcast updated state to everyone
      result.room.broadcastGameState();
    } catch (error) {
      socket.emit(EVENTS.ERROR, { message: error.message });
    }
  });

  // Leave Game
  socket.on(EVENTS.LEAVE_GAME, () => {
    try {
      const roomId = gameManager.getPlayerRoom(socket.id);
      if (roomId) {
        const room = gameManager.getRoom(roomId);
        if (room && room.status !== 'ACTIVE') {
          gameManager.leaveRoom(socket.id);
        } else {
          // Just disconnect, AI will take over
          gameManager.handleDisconnect(socket.id);
        }
      }
    } catch (error) {
      socket.emit(EVENTS.ERROR, { message: error.message });
    }
  });

  // Toggle Ready
  socket.on(EVENTS.TOGGLE_READY, () => {
    try {
      const roomId = gameManager.getPlayerRoom(socket.id);
      if (!roomId) throw new Error('Not in a game');

      const room = gameManager.getRoom(roomId);
      if (!room) throw new Error('Game not found');

      const isReady = room.toggleReady(socket.id);
      socket.emit(EVENTS.PLAYER_READY, { isReady });
    } catch (error) {
      socket.emit(EVENTS.ERROR, { message: error.message });
    }
  });

  // Roll Dice
  socket.on(EVENTS.ROLL_DICE, () => {
    try {
      const roomId = gameManager.getPlayerRoom(socket.id);
      if (!roomId) throw new Error('Not in a game');

      const room = gameManager.getRoom(roomId);
      if (!room) throw new Error('Game not found');

      room.rollDice(socket.id);
    } catch (error) {
      socket.emit(EVENTS.ERROR, { message: error.message });
    }
  });

  // Move Token
  socket.on(EVENTS.MOVE_TOKEN, ({ tokenId }) => {
    try {
      const roomId = gameManager.getPlayerRoom(socket.id);
      if (!roomId) throw new Error('Not in a game');

      const room = gameManager.getRoom(roomId);
      if (!room) throw new Error('Game not found');

      room.moveToken(socket.id, tokenId);
    } catch (error) {
      socket.emit(EVENTS.ERROR, { message: error.message });
    }
  });

  // Disconnect
  socket.on('disconnect', () => {
    gameManager.handleDisconnect(socket.id);
  });
};
