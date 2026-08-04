import GameRoom from './GameRoom.js';

class GameManager {
  constructor(io) {
    this.io = io;
    this.rooms = new Map();
    this.playerRooms = new Map();
  }

  createRoom(roomId) {
    if (this.rooms.has(roomId)) {
      throw new Error('Room already exists');
    }

    const room = new GameRoom(roomId, this.io);
    this.rooms.set(roomId, room);
    return room;
  }

  getRoom(roomId) {
    return this.rooms.get(roomId);
  }

  joinRoom(socketId, roomId, playerName, color) {
    let room = this.getRoom(roomId);
    if (!room) {
      room = this.createRoom(roomId);
    }

    const player = room.addPlayer(socketId, playerName, color);
    const socket = this.io.sockets.sockets.get(socketId);
    if (socket) socket.join(roomId);
    this.playerRooms.set(socketId, roomId);

    return { room, player };
  }

  leaveRoom(socketId) {
    const roomId = this.playerRooms.get(socketId);
    if (!roomId) return;

    const room = this.getRoom(roomId);
    if (room) {
      room.removePlayer(socketId);
      if (room.players.size === 0) {
        room.cleanup();
        this.rooms.delete(roomId);
      }
    }

    this.playerRooms.delete(socketId);
    this.io.sockets.sockets.get(socketId)?.leave(roomId);
  }

  getPlayerRoom(socketId) {
    return this.playerRooms.get(socketId);
  }

  handleDisconnect(socketId) {
    const roomId = this.playerRooms.get(socketId);
    if (roomId) {
      const room = this.getRoom(roomId);
      if (room) {
        room.removePlayer(socketId);
        // Don't delete room immediately, let AI take over
      }
      this.playerRooms.delete(socketId);
    }
  }
}

export default GameManager;
