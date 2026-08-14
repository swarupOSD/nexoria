import { io } from "socket.io-client";

const socket = io("https://nexoria-jku5.onrender.com", {
  withCredentials: true,
  transports: ["websocket", "polling"],
});

console.log("Connecting to backend...");

socket.on("connect", () => {
  console.log("Connected to backend! Socket ID:", socket.id);
  
  console.log("Emitting joinGame...");
  socket.emit("joinGame", {
    roomId: "testroom123",
    playerName: "TestBot",
  });
  console.log("Emitted joinGame!");
});

socket.onAny((event, ...args) => {
  console.log(`[EVENT RECEIVED] ${event}:`, args);
});

socket.on("disconnect", (reason) => {
  console.log("Disconnected:", reason);
});

socket.on("connect_error", (err) => {
  console.error("Connection Error:", err.message);
});

setTimeout(() => {
  console.log("Timeout reached. Exiting.");
  process.exit(1);
}, 10000);
