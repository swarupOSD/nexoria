const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const cors = require('cors');
const GameManager = require('./game/GameManager');
const setupHandlers = require('./sockets/handlers');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

// Initialize Game Manager
const gameManager = new GameManager(io);

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log(`Player connected: ${socket.id}`);

  // Setup all socket handlers
  setupHandlers(io, socket, gameManager);

  // List available rooms
  socket.on('listRooms', () => {
    const rooms = Array.from(gameManager.rooms.keys());
    socket.emit('roomsList', rooms);
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    rooms: gameManager.rooms.size,
    connections: io.engine.clientsCount 
  });
});

// Get room state (for admin/debug)
app.get('/room/:roomId', (req, res) => {
  const room = gameManager.getRoom(req.params.roomId);
  if (!room) {
    return res.status(404).json({ error: 'Room not found' });
  }
  res.json(room.getGameState());
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Ludo Game Server running on port ${PORT}`);
  console.log(`WebSocket endpoint: ws://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
