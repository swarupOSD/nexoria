import { io } from "socket.io-client";

const socket = io("http://localhost:5000", {
  withCredentials: true,
  transports: ["websocket", "polling"],
});

console.log("Connecting to localhost:5000...");

socket.on("connect", () => {
  console.log("Connected! Socket ID:", socket.id);
  
  socket.emit("joinGame", {
    roomId: "testroom_local",
    playerName: "LocalTest",
  });
});

socket.on("joinSuccess", (data) => {
  console.log("SUCCESS:", data);
  process.exit(0);
});

socket.on("error", (err) => {
  console.error("ERROR FROM SERVER:", err);
  process.exit(1);
});

socket.on("connect_error", (err) => {
  console.error("Connection Error:", err.message);
});

setTimeout(() => {
  console.log("Timeout reached. Exiting.");
  process.exit(1);
}, 5000);
